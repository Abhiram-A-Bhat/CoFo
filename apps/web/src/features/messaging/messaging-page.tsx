"use client";

import { Loader2, MessageSquare, Plus, Send } from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  createConversation,
  listConversations,
  listMessages,
  markConversationRead,
  sendMessage,
  type Conversation,
  type Message
} from "@/lib/api/messaging";
import { env } from "@/lib/config/env";

type WebSocketEvent =
  | {
      type: "message";
      message: Message;
    }
  | {
      type: "read";
      conversation_id: string;
      reader_id: string;
    };

export function MessagingPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [recipientUserId, setRecipientUserId] = useState("");
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId),
    [conversations, selectedConversationId]
  );

  useEffect(() => {
    async function loadConversations() {
      try {
        const response = await listConversations();
        setConversations(response.items);
        setSelectedConversationId(response.items[0]?.id ?? "");
      } catch (caughtError) {
        setError(getApiErrorMessage(caughtError, "Unable to load conversations."));
      } finally {
        setIsLoadingConversations(false);
      }
    }

    loadConversations();
  }, []);

  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }

    let isMounted = true;

    async function loadMessages() {
      setIsLoadingMessages(true);
      setError("");

      try {
        const response = await listMessages(selectedConversationId);
        await markConversationRead(selectedConversationId);

        if (!isMounted) {
          return;
        }

        setMessages(response.items);
        setConversations((currentConversations) =>
          currentConversations.map((conversation) =>
            conversation.id === selectedConversationId
              ? { ...conversation, unread_count: 0 }
              : conversation
          )
        );
      } catch (caughtError) {
        if (isMounted) {
          setError(getApiErrorMessage(caughtError, "Unable to load messages."));
        }
      } finally {
        if (isMounted) {
          setIsLoadingMessages(false);
        }
      }
    }

    loadMessages();

    return () => {
      isMounted = false;
    };
  }, [selectedConversationId]);

  useEffect(() => {
    socketRef.current?.close();

    if (!selectedConversationId) {
      return;
    }

    const socket = new WebSocket(
      `${env.wsUrl}/api/v1/ws/conversations/${selectedConversationId}`
    );
    socketRef.current = socket;

    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data) as WebSocketEvent;

      if (payload.type === "message") {
        setMessages((currentMessages) => {
          if (currentMessages.some((message) => message.id === payload.message.id)) {
            return currentMessages;
          }
          return [...currentMessages, payload.message];
        });
        setConversations((currentConversations) =>
          currentConversations.map((conversation) =>
            conversation.id === payload.message.conversation_id
              ? { ...conversation, last_message: payload.message }
              : conversation
          )
        );
      }

      if (payload.type === "read") {
        setMessages((currentMessages) =>
          currentMessages.map((message) =>
            message.conversation_id === payload.conversation_id &&
            message.sender_id !== payload.reader_id &&
            !message.read_at
              ? { ...message, read_at: new Date().toISOString() }
              : message
          )
        );
      }
    };

    return () => {
      socket.close();
    };
  }, [selectedConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function onCreateConversation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!recipientUserId.trim()) {
      return;
    }

    setIsCreatingConversation(true);
    setError("");

    try {
      const conversation = await createConversation(recipientUserId.trim());
      setConversations((currentConversations) => {
        const existing = currentConversations.some((item) => item.id === conversation.id);
        return existing
          ? currentConversations.map((item) =>
              item.id === conversation.id ? conversation : item
            )
          : [conversation, ...currentConversations];
      });
      setSelectedConversationId(conversation.id);
      setRecipientUserId("");
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Unable to start conversation."));
    } finally {
      setIsCreatingConversation(false);
    }
  }

  async function onSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!selectedConversationId || !body) {
      return;
    }

    setIsSending(true);
    setDraft("");

    try {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ body }));
      } else {
        const message = await sendMessage(selectedConversationId, body);
        setMessages((currentMessages) => [...currentMessages, message]);
      }
    } catch (caughtError) {
      setDraft(body);
      setError(getApiErrorMessage(caughtError, "Unable to send message."));
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute inset-x-0 top-0 h-80 bg-[linear-gradient(180deg,rgba(45,212,191,0.10),transparent_72%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-6 lg:grid-cols-[360px_1fr]">
        <Card className="border-white/15">
          <CardHeader className="border-b border-white/10">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="mb-2 inline-flex w-fit rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-primary">
                  Messages
                </div>
                <CardTitle>Conversations</CardTitle>
              </div>
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="space-y-5 p-5">
            <form className="flex gap-2" onSubmit={onCreateConversation}>
              <Input
                onChange={(event) => setRecipientUserId(event.target.value)}
                placeholder="Recipient user ID"
                value={recipientUserId}
              />
              <Button disabled={isCreatingConversation} size="sm" type="submit">
                {isCreatingConversation ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </form>

            {isLoadingConversations ? (
              <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading conversations
              </div>
            ) : conversations.length > 0 ? (
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <button
                    className={`w-full rounded-xl border p-4 text-left transition-colors ${
                      conversation.id === selectedConversationId
                        ? "border-primary/30 bg-primary/10"
                        : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                    }`}
                    key={conversation.id}
                    onClick={() => setSelectedConversationId(conversation.id)}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {conversation.participant_name ?? conversation.participant_email}
                        </p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {conversation.last_message?.body ?? "No messages yet"}
                        </p>
                      </div>
                      {conversation.unread_count > 0 ? (
                        <Badge variant="outline">{conversation.unread_count}</Badge>
                      ) : null}
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {formatDate(conversation.last_message?.created_at ?? conversation.updated_at)}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-sm text-muted-foreground">
                Start a direct conversation with a founder or investor by entering their user ID.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex min-h-[720px] flex-col border-white/15">
          <CardHeader className="border-b border-white/10">
            <CardTitle>
              {selectedConversation
                ? selectedConversation.participant_name ??
                  selectedConversation.participant_email
                : "Select a conversation"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4 p-5">
            {error ? <Alert>{error}</Alert> : null}
            <div className="flex-1 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.025] p-4">
              {isLoadingMessages ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading messages
                </div>
              ) : selectedConversation ? (
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isMine = message.sender_id !== selectedConversation.participant_user_id;
                    return (
                      <div
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                        key={message.id}
                      >
                        <div
                          className={`max-w-[82%] rounded-2xl border px-4 py-3 text-sm shadow-sm ${
                            isMine
                              ? "border-primary/30 bg-primary/15 text-foreground"
                              : "border-white/10 bg-white/[0.05] text-foreground"
                          }`}
                        >
                          <p className="whitespace-pre-wrap leading-6">{message.body}</p>
                          <div className="mt-2 flex items-center justify-end gap-2 text-[11px] text-muted-foreground">
                            <span>{formatTime(message.created_at)}</span>
                            {isMine ? <span>{message.read_at ? "Read" : "Sent"}</span> : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
                  Choose a conversation or start a new one.
                </div>
              )}
            </div>
            <form className="flex flex-col gap-3 sm:flex-row" onSubmit={onSendMessage}>
              <Textarea
                className="min-h-20 flex-1"
                disabled={!selectedConversation || isSending}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Write a message..."
                value={draft}
              />
              <Button
                className="h-20 px-5"
                disabled={!selectedConversation || isSending || !draft.trim()}
                type="submit"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}
