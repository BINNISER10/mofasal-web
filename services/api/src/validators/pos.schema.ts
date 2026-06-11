import { z } from 'zod';

export const createPOSSessionSchema = z.object({
  cashierId: z.string().min(1, 'Cashier ID is required'),
  openingBalance: z.number().min(0, 'Opening balance is required'),
  notes: z.string().optional().nullable(),
});

export const closePOSSessionSchema = z.object({
  closingBalance: z.number().min(0, 'Closing balance is required'),
  actualCash: z.number().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const posOrderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be positive'),
  unitPrice: z.number().positive('Unit price is required'),
  discount: z.number().min(0).optional(),
});

export const createPOSOrderSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  items: z.array(posOrderItemSchema).min(1, 'At least one item is required'),
  customerId: z.string().optional().nullable(),
  customerName: z.string().optional().nullable(),
  discount: z.number().min(0).optional(),
  paymentMethod: z.enum(['CASH', 'CARD', 'MADA', 'STCPAY', 'TAMARA', 'TABBY']).default('CASH'),
  notes: z.string().optional().nullable(),
});
