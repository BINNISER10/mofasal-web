import { z } from 'zod';

export const createOrderSchema = z.object({
  shopId: z.string().uuid('معرّف المتجر غير صالح'),
  serviceRequestId: z.string().uuid().optional(),
  totalAmount: z.number().positive().optional(),
  deliveryFee: z.number().min(0).optional(),
  customerNotes: z.string().max(1000).optional(),
  paymentMethod: z.enum(['MADA', 'VISA_MASTERCARD', 'APPLE_PAY', 'STC_PAY', 'TAMARA', 'TABBY', 'SADAD', 'CASH']).optional(),
  items: z.array(z.object({
    name: z.string().min(1).max(200),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
  })).min(1, 'يجب إضافة عنصر واحد على الأقل').optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'READY_FOR_DELIVERY',
    'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED',
  ]),
  note: z.string().max(500).optional(),
});

export const cancelOrderSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const assignStaffSchema = z.object({
  staffId: z.string().uuid('معرّف الموظف غير صالح'),
});

export const confirmOrderSchema = z.object({
  customerApproved: z.boolean(),
  customerNotes: z.string().max(1000).optional(),
});

export const requestChangesSchema = z.object({
  notes: z.string().min(1, 'يرجى وصف التعديل المطلوب').max(1000),
});
