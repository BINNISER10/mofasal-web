import { apiClient } from './client';

export interface Message {
  id: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE';
  mediaUrl?: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  orderId: string;
  messages: Message[];
  unreadCount: number;
}

interface ConversationResponse {
  conversation: Conversation;
}

interface MessagesResponse {
  messages: Message[];
}

export const conversationsApi = {
  getByOrder: async (orderId: string): Promise<ConversationResponse> => {
    const conversation = await apiClient.get<Conversation>(`/conversations/order/${orderId}`);
    return { conversation };
  },

  sendMessage: async (orderId: string, data: { content: string; type?: string; mediaUrl?: string }): Promise<{ message: Message }> => {
    const message = await apiClient.post<Message>(`/conversations/order/${orderId}/message`, data);
    return { message };
  },

  getMessages: async (conversationId: string): Promise<MessagesResponse> => {
    return apiClient.get<MessagesResponse>(`/conversations/${conversationId}/messages`);
  },

  markAsRead: async (messageId: string): Promise<{ message: Message }> => {
    const message = await apiClient.patch<Message>(`/conversations/messages/${messageId}/read`);
    return { message };
  },
};
