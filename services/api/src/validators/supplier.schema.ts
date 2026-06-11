import { z } from 'zod';

export const createSupplierSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  contactPerson: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  commercialReg: z.string().optional().nullable(),
  taxNumber: z.string().optional().nullable(),
  paymentTerms: z.string().optional().nullable(),
});

export const updateSupplierSchema = createSupplierSchema.partial();

export const createSupplierProductSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  supplierPrice: z.number().positive('Supplier price is required'),
  minOrderQuantity: z.number().int().min(1).optional(),
  leadTimeDays: z.number().int().min(0).optional(),
});
