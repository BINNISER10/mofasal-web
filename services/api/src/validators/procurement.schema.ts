import { z } from 'zod';

export const purchaseOrderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  productName: z.string().min(1, 'Product name is required'),
  quantity: z.number().int().positive('Quantity must be positive'),
  unitPrice: z.number().positive('Unit price is required'),
});

export const createPurchaseOrderSchema = z.object({
  supplierId: z.string().min(1, 'Supplier ID is required'),
  expectedDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(purchaseOrderItemSchema).min(1, 'At least one item is required'),
});

export const updatePurchaseOrderSchema = z.object({
  expectedDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'PENDING', 'APPROVED', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
});
