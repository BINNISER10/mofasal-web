import { z } from 'zod';

export const createShopSchema = z.object({
  name: z.string().min(2).max(200),
  nameAr: z.string().min(2).max(200).optional(),
  description: z.string().max(1000).optional(),
  city: z.string().min(1).max(100),
  district: z.string().max(100).optional(),
  address: z.string().max(500).optional(),
  phone: z.string().min(10).max(20),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  category: z.string().max(100).optional(),
  specialties: z.array(z.string()).optional(),
});

export const updateShopSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  nameAr: z.string().min(2).max(200).optional(),
  description: z.string().max(1000).optional(),
  city: z.string().min(1).max(100).optional(),
  district: z.string().max(100).optional(),
  address: z.string().max(500).optional(),
  phone: z.string().min(10).max(20).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  category: z.string().max(100).optional(),
  specialties: z.array(z.string()).optional(),
  isOpen: z.boolean().optional(),
});

export const verifyShopSchema = z.object({
  isVerified: z.boolean(),
});

export const updateCommissionSchema = z.object({
  rate: z.number().min(0).max(100),
});
