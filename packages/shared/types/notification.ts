export enum NotificationType {
  ORDER_UPDATE = 'ORDER_UPDATE',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  DELIVERY_UPDATE = 'DELIVERY_UPDATE',
  CONFIRMATION_REQUIRED = 'CONFIRMATION_REQUIRED',
  CONFIRMATION_APPROVED = 'CONFIRMATION_APPROVED',
  PROMOTIONAL = 'PROMOTIONAL',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  REVIEW_REMINDER = 'REVIEW_REMINDER',
  NEW_MESSAGE = 'NEW_MESSAGE',
  STAFF_ASSIGNED = 'STAFF_ASSIGNED',
  LOW_STOCK_ALERT = 'LOW_STOCK_ALERT',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  titleAr: string;
  body: string;
  bodyAr: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
  image?: string;
  actionUrl?: string;
  createdAt: string;
}
