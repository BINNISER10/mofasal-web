/** Message types within conversations */
export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  DOCUMENT = 'DOCUMENT',
  ORDER_UPDATE = 'ORDER_UPDATE',
  CONFIRMATION_LINK = 'CONFIRMATION_LINK',
  PAYMENT_RECEIPT = 'PAYMENT_RECEIPT',
  LOCATION = 'LOCATION',
  SYSTEM = 'SYSTEM',
}

/** Message delivery status */
export enum MessageStatus {
  SENDING = 'SENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
}

/** Single message in a conversation */
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatar?: string;
  type: MessageType;
  content: string;
  // Attachments
  attachments?: MessageAttachment[];
  // Reply
  replyToId?: string;
  replyTo?: {
    senderName: string;
    content: string;
  };
  // Metadata
  status: MessageStatus;
  metadata?: Record<string, unknown>;
  // Read receipts
  readBy: MessageReadReceipt[];
  // Timeline
  createdAt: string;
  updatedAt: string;
}

/** File attachment within a message */
export interface MessageAttachment {
  id: string;
  type: 'IMAGE' | 'DOCUMENT' | 'PDF' | 'VIDEO' | 'VOICE';
  url: string;
  name: string;
  sizeBytes: number;
  mimeType: string;
  thumbnailUrl?: string;
}

/** Read receipt for a message */
export interface MessageReadReceipt {
  userId: string;
  readAt: string;
}

/** Conversation between parties */
export interface Conversation {
  id: string;
  participants: ChatParticipant[];
  // Last message preview
  lastMessage?: {
    content: string;
    senderName: string;
    createdAt: string;
    type: MessageType;
  };
  // Order reference if applicable
  orderId?: string;
  orderNumber?: string;
  // Unread count
  unreadCount: number;
  // Status
  isActive: boolean;
  isMuted: boolean;
  // Timeline
  createdAt: string;
  updatedAt: string;
}

/** Participant in a conversation */
export interface ChatParticipant {
  userId: string;
  name: string;
  role: string;
  avatar?: string;
  phone?: string;
  lastReadAt: string;
  isTyping: boolean;
}

/** Create conversation request */
export interface CreateConversationRequest {
  participantIds: string[];
  orderId?: string;
  initialMessage?: string;
}

/** Send message request */
export interface SendMessageRequest {
  conversationId: string;
  content: string;
  type?: MessageType;
  attachments?: {
    type: MessageAttachment['type'];
    url: string;
    name: string;
    sizeBytes: number;
    mimeType: string;
  }[];
  replyToId?: string;
  metadata?: Record<string, unknown>;
}

/** Typing indicator payload */
export interface TypingIndicator {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}
