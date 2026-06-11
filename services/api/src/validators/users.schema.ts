import { z } from 'zod';

const saudiPhoneRegex = /^(05\d{8}|(\+966)5\d{8})$/;

export const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().regex(saudiPhoneRegex),
  email: z.string().email().optional(),
  password: z.string().min(6),
  role: z.enum(['CUSTOMER', 'TAILOR', 'MERCHANT', 'ADMIN']),
  shopId: z.string().uuid().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().regex(saudiPhoneRegex).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
});

export const createAddressSchema = z.object({
  label: z.string().min(1).max(50),
  street: z.string().min(1).max(200),
  district: z.string().min(1).max(100),
  city: z.string().min(1).max(100),
  building: z.string().max(50).optional(),
  apartment: z.string().max(50).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});

export const createMeasurementSchema = z.object({
  name: z.string().min(1).max(100),
  chest: z.number().min(0).max(200).optional(),
  waist: z.number().min(0).max(200).optional(),
  hips: z.number().min(0).max(200).optional(),
  shoulderWidth: z.number().min(0).max(100).optional(),
  sleeveLength: z.number().min(0).max(100).optional(),
  neckCircumference: z.number().min(0).max(60).optional(),
  shirtLength: z.number().min(0).max(150).optional(),
  pantLength: z.number().min(0).max(150).optional(),
  inseam: z.number().min(0).max(150).optional(),
  notes: z.string().max(500).optional(),
});
