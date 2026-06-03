export enum OrderStatus {
  ORDER_RECEIVED = 'ORDER_RECEIVED',
  STAFF_ON_WAY = 'STAFF_ON_WAY',
  TAKING_MEASUREMENTS = 'TAKING_MEASUREMENTS',
  CUTTING_FABRIC = 'CUTTING_FABRIC',
  SEWING_ASSEMBLY = 'SEWING_ASSEMBLY',
  IRONING_FINISHING = 'IRONING_FINISHING',
  PACKING_WRAPPING = 'PACKING_WRAPPING',
  ON_WAY_TO_CUSTOMER = 'ON_WAY_TO_CUSTOMER',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  shopId: string;
  status: OrderStatus;
  serviceRequestId?: string;
  items: OrderItem[];
  measurements?: OrderMeasurement[];
  fabricDetails?: FabricDetails[];
  totalAmount: number;
  vatAmount: number;
  deliveryFee: number;
  grandTotal: number;
  paymentStatus: string;
  paymentMethod: string;
  deliveryDate?: string;
  confirmedDate?: string;
  confirmationToken?: string;
  isConfirmed: boolean;
  customerNotes?: string;
  staffNotes?: string;
  createdAt: string;
  updatedAt: string;
  trackingHistory: OrderStatusHistory[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId?: string;
  name: string;
  nameAr?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderMeasurement {
  id: string;
  orderId: string;
  measurementData: Record<string, number>;
  tailorId?: string;
  notes?: string;
  images?: string[];
  garmentType?: string;
  customerType?: string;
  customerAge?: number;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  changedBy?: string;
  changedByName?: string;
  note?: string;
  createdAt: string;
}

export interface ConfirmationLink {
  id: string;
  orderId: string;
  token: string;
  fullUrl: string;
  measurements?: Record<string, number>;
  fabricDetails?: FabricDetails[];
  finalPrice?: number;
  deliveryDate?: string;
  customerApproved?: boolean;
  customerNotes?: string;
  approvedAt?: string;
  expiresAt: string;
  createdAt: string;
}

export interface FabricDetails {
  id: string;
  orderId: string;
  fabricType: string;
  color: string;
  pattern?: string;
  quantity: number;
  unit: string;
  source: string;
  merchantId?: string;
  merchantName?: string;
  pricePerUnit: number;
  totalPrice: number;
}

export interface OrderTracking {
  id: string;
  orderId: string;
  status: OrderStatus;
  lat: number;
  lng: number;
  timestamp: string;
  description?: string;
  descriptionAr?: string;
}

export interface CreateOrderInput {
  customerId: string;
  shopId: string;
  items: Omit<OrderItem, 'id' | 'orderId'>[];
  fabricDetails?: Omit<FabricDetails, 'id' | 'orderId'>[];
  customerNotes?: string;
  deliveryDate?: string;
}

export interface UpdateOrderStatusInput {
  status: OrderStatus;
  note?: string;
  lat?: number;
  lng?: number;
}

export interface OrderFilter {
  status?: OrderStatus;
  customerId?: string;
  shopId?: string;
  dateFrom?: string;
  dateTo?: string;
  paymentStatus?: string;
  isConfirmed?: boolean;
}
