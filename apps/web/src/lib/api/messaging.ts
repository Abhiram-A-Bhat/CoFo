import { apiClient } from "@/lib/api/client";

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

export type Conversation = {
  id: string;
  participant_user_id: string;
  participant_name: string | null;
  participant_email: string;
  unread_count: number;
  last_message: Message | null;
  created_at: string;
  updated_at: string;
};

export type ConversationListResponse = {
  items: Conversation[];
};

export type MessageListResponse = {
  items: Message[];
};

export async function listConversations() {
  const response = await apiClient.get<ConversationListResponse>("/conversations");
  return response.data;
}

export async function createConversation(participantUserId: string) {
  const response = await apiClient.post<Conversation>("/conversations", {
    participant_user_id: participantUserId
  });
  return response.data;
}

export async function listMessages(conversationId: string) {
  const response = await apiClient.get<MessageListResponse>(
    `/conversations/${conversationId}/messages`
  );
  return response.data;
}

export async function sendMessage(conversationId: string, body: string) {
  const response = await apiClient.post<Message>(`/conversations/${conversationId}/messages`, {
    body
  });
  return response.data;
}

export async function markConversationRead(conversationId: string) {
  const response = await apiClient.post<Conversation>(`/conversations/${conversationId}/read`);
  return response.data;
}
