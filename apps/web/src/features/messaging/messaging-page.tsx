"use client";

import { Loader2, MessageSquare, Plus, Send, MessagesSquare, ArrowLeft } from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="absolute inset-x-0 top-0 h-80 bg-[linear-gradient(180deg,rgba(45,212,191,0.10),transparent_72%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-6 lg:grid-cols-[360px_1fr]">
        {/* Left panel: Conversations list (hidden on mobile if chat selected) */}
        <Card className={`border-white/15 ${selectedConversationId ? "hidden lg:block" : "block"}`}>
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
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-xl border border-white/[0.06] p-4 space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-4 w-4 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-2.5 w-16" />
                  </div>
                ))}
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
                        <span className="relative flex h-5 w-5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/40" />
                          <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                            {conversation.unread_count}
                          </span>
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {formatRelativeDate(conversation.last_message?.created_at ?? conversation.updated_at)}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 to-sky-500/10 border border-white/[0.06] p-5">
                  <MessagesSquare className="h-8 w-8 text-emerald-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-white">No conversations yet</h3>
                  <p className="text-xs text-white/40 max-w-[220px]">
                    Start a conversation with a founder or investor by entering their user ID above.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right panel: Active Chat view (hidden on mobile if no chat selected) */}
        <Card className={`flex min-h-[600px] lg:min-h-[720px] flex-col border-white/15 ${!selectedConversationId ? "hidden lg:flex" : "flex"}`}>
          <CardHeader className="border-b border-white/10 px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex items-center gap-3">
              {selectedConversationId && (
                <button
                  onClick={() => setSelectedConversationId("")}
                  className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/[0.06] lg:hidden transition-colors"
                  title="Back to conversations"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <CardTitle className="text-base sm:text-lg">
                {selectedConversation
                  ? selectedConversation.participant_name ??
                    selectedConversation.participant_email
                  : "Select a conversation"}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4 p-5">
            {error ? <Alert>{error}</Alert> : null}
            <div className="flex-1 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.025] p-4">
              {isLoadingMessages ? (
                <div className="space-y-4 p-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                      <div className="space-y-1.5" style={{ width: `${40 + (i * 8)}%` }}>
                        <Skeleton className="h-12 w-full rounded-2xl" />
                        <Skeleton className={`h-2 w-12 ${i % 2 === 0 ? 'ml-auto' : ''}`} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : selectedConversation ? (
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    const isMine = message.sender_id !== selectedConversation.participant_user_id;
                    const prevMessage = messages[index - 1];
                    const sameSender = prevMessage?.sender_id === message.sender_id;
                    const gapMinutes = prevMessage
                      ? (new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime()) / 60000
                      : Infinity;
                    const grouped = sameSender && gapMinutes < 3;

                    return (
                      <div
                        className={`flex ${isMine ? "justify-end" : "justify-start"} ${grouped ? "mt-0.5" : "mt-4"}`}
                        key={message.id}
                      >
                        <div
                          className={`max-w-[82%] px-4 py-3 text-sm shadow-sm transition-all ${
                            isMine
                              ? "border-primary/30 bg-primary/15 text-foreground"
                              : "border-white/10 bg-white/[0.05] text-foreground"
                          } ${
                            grouped
                              ? isMine ? "rounded-2xl rounded-tr-lg border" : "rounded-2xl rounded-tl-lg border"
                              : "rounded-2xl border"
                          }`}
                        >
                          <p className="whitespace-pre-wrap leading-6">{message.body}</p>
                          {!grouped && (
                            <div className="mt-2 flex items-center justify-end gap-2 text-[11px] text-muted-foreground">
                              <span>{formatRelativeTime(message.created_at)}</span>
                              {isMine ? <span>{message.read_at ? "✓✓" : "✓"}</span> : null}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center space-y-4 p-8">
                  <div className="rounded-2xl bg-gradient-to-br from-sky-500/10 to-violet-500/10 border border-white/[0.06] p-5">
                    <MessageSquare className="h-8 w-8 text-sky-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-white">Select a conversation</h3>
                    <p className="text-xs text-white/40 max-w-[200px]">
                      Choose a conversation from the left panel or start a new one.
                    </p>
                  </div>
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

function formatRelativeDate(value: string) {
  const date = new Date(value);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

function formatRelativeTime(value: string) {
  const date = new Date(value);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(date);
}
