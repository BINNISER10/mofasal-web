import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  nameAr: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  categoryId: z.string().uuid().optional(),
  price: z.number().positive('السعر يجب أن يكون أكبر من صفر'),
  compareAtPrice: z.number().positive().optional(),
  costPrice: z.number().positive().optional(),
  stockQuantity: z.number().int().min(0).optional(),
  unit: z.string().max(50).optional(),
  images: z.array(z.string().url()).optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'HIDDEN']).optional(),
  tags: z.string().max(500).optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  nameAr: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  categoryId: z.string().uuid().optional(),
  price: z.number().positive().optional(),
  compareAtPrice: z.number().positive().optional(),
  costPrice: z.number().positive().optional(),
  stockQuantity: z.number().int().min(0).optional(),
  unit: z.string().max(50).optional(),
  images: z.array(z.string().url()).optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'HIDDEN']).optional(),
  tags: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
});

export const adjustStockSchema = z.object({
  type: z.enum(['IN', 'OUT']),
  quantity: z.number().int().positive('الكمية يجب أن تكون أكبر من صفر'),
  reference: z.string().max(200).optional(),
  notes: z.string().max(500).optional(),
});

export const createVariantSchema = z.object({
  name: z.string().min(1).max(100),
  value: z.string().min(1).max(100),
  price: z.number().positive().optional(),
  stockQuantity: z.number().int().min(0).optional(),
  sku: z.string().max(100).optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  nameAr: z.string().max(100).optional(),
  slug: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  image: z.string().url().optional(),
  parentId: z.string().uuid().optional(),
  order: z.number().int().optional(),
});

export const createReviewSchema = z.object({
  shopRating: z.number().int().min(1).max(5),
  tailorRating: z.number().int().min(1).max(5).optional(),
  representativeRating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(1000).optional(),
  orderId: z.string().uuid(),
});
