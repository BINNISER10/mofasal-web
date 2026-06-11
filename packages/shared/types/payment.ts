export enum PaymentMethod {
  MADA = 'MADA',
  VISA = 'VISA',
  MASTERCARD = 'MASTERCARD',
  APPLE_PAY = 'APPLE_PAY',
  GOOGLE_PAY = 'GOOGLE_PAY',
  SADAD = 'SADAD',
  STC_PAY = 'STC_PAY',
  BANK_TRANSFER = 'BANK_TRANSFER',
  COD = 'COD',
  TAMARA = 'TAMARA',
  TABBY = 'TABBY',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  AUTHORIZED = 'AUTHORIZED',
  CAPTURED = 'CAPTURED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
  VOIDED = 'VOIDED',
  EXPIRED = 'EXPIRED',
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  amount: number;
  fee: number;
  netAmount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  gatewayReference?: string;
  gatewayResponse?: Record<string, unknown>;
  refundedAmount?: number;
  failureReason?: string;
  paidAt?: string;
  createdAt: string;
}

export enum ZatcaStatus {
  PENDING = 'PENDING',
  REPORTED = 'REPORTED',
  CLEARED = 'CLEARED',
  FAILED = 'FAILED',
}

export interface Invoice {
  id: string;
  orderId: string;
  invoiceNumber: string;
  uuid: string;
  totalAmount: number;
  vatAmount: number;
  vatRate: number;
  grandTotal: number;
  qrCode?: string;
  qrCodeData?: string;
  zatcaStatus: ZatcaStatus;
  zatcaUuid?: string;
  zatcaHash?: string;
  xmlPayload?: string;
  signedXml?: string;
  invoiceDate: string;
  dueDate: string;
}

export interface ProcessPaymentInput {
  orderId: string;
  method: PaymentMethod;
  saveCard?: boolean;
  installmentPlan?: string;
}

export interface PaymentWebhookPayload {
  gateway: string;
  event: string;
  data: Record<string, unknown>;
  signature: string;
}
