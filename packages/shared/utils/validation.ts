import { z } from 'zod';

const saudiPhoneRegex = /^05\d{8}$/;

export const loginSchema = z.object({
  phone: z.string().regex(saudiPhoneRegex, 'Phone must be a valid Saudi number (05XXXXXXXX)'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(saudiPhoneRegex, 'Invalid Saudi phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['CUSTOMER', 'TAILOR', 'TAILOR_SHOP', 'MERCHANT', 'ADMIN', 'STAFF']),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const createOrderSchema = z.object({
  customerId: z.string().min(1),
  shopId: z.string().min(1),
  items: z.array(z.object({
    name: z.string().min(1),
    nameAr: z.string().optional(),
    quantity: z.number().int().min(1),
    unitPrice: z.number().positive(),
  })).min(1),
  fabricDetails: z.array(z.object({
    fabricType: z.string().min(1),
    color: z.string().min(1),
    quantity: z.number().positive(),
    unit: z.string().min(1),
    pricePerUnit: z.number().positive(),
  })).optional(),
  customerNotes: z.string().max(1000).optional(),
  deliveryDate: z.string().optional(),
});

export const createProductSchema = z.object({
  name: z.string().min(2).max(200),
  nameAr: z.string().max(200).optional(),
  description: z.string().min(10).max(5000),
  descriptionAr: z.string().max(5000).optional(),
  category: z.enum(['FABRICS', 'THREADS', 'BUTTONS', 'ACCESSORIES', 'ZIPPERS', 'LININGS', 'LACES', 'RIBBONS', 'ELASTICS', 'OTHERS']),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional(),
  costPrice: z.number().positive().optional(),
  stockQuantity: z.number().int().min(0),
  unit: z.string().min(1),
  minOrderQuantity: z.number().int().min(1).optional(),
  images: z.array(z.string()).min(1),
  tags: z.array(z.string()).optional(),
  visibility: z.enum(['PUBLIC', 'TAILORS_ONLY']),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  nameAr: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  avatar: z.string().optional(),
  coverImage: z.string().optional(),
  phone: z.string().regex(saudiPhoneRegex).optional(),
});

export const addressSchema = z.object({
  label: z.enum(['HOME', 'WORK', 'OTHER']),
  street: z.string().min(2),
  district: z.string().min(2),
  city: z.string().min(2),
  region: z.string().min(2),
  country: z.string().default('Saudi Arabia'),
  buildingNumber: z.string().optional(),
  apartmentNumber: z.string().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  isDefault: z.boolean().default(false),
});

export const measurementSchema = z.object({
  neck: z.number().min(20).max(60).optional(),
  shoulders: z.number().min(30).max(70).optional(),
  chest: z.number().min(60).max(180).optional(),
  waist: z.number().min(50).max(170).optional(),
  hips: z.number().min(60).max(180).optional(),
  sleeveLength: z.number().min(40).max(75).optional(),
  shirtLength: z.number().min(60).max(120).optional(),
  trouserLength: z.number().min(70).max(130).optional(),
  trouserWaist: z.number().min(50).max(170).optional(),
  inseam: z.number().min(50).max(100).optional(),
  outseam: z.number().min(70).max(130).optional(),
  bicep: z.number().min(15).max(60).optional(),
  wrist: z.number().min(10).max(30).optional(),
  thigh: z.number().min(30).max(90).optional(),
  knee: z.number().min(20).max(60).optional(),
  calf: z.number().min(20).max(60).optional(),
});

export const measurementSubmissionSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(1),
  gender: z.enum(['MEN', 'BOYS', 'GIRLS']),
  data: measurementSchema,
  notes: z.string().max(500).optional(),
});

export const processPaymentSchema = z.object({
  orderId: z.string().min(1),
  method: z.enum(['MADA', 'VISA', 'MASTERCARD', 'APPLE_PAY', 'GOOGLE_PAY', 'SADAD', 'STC_PAY', 'BANK_TRANSFER', 'COD', 'TAMARA', 'TABBY']),
  saveCard: z.boolean().optional(),
  installmentPlan: z.string().optional(),
});

export const createServiceRequestSchema = z.object({
  customerId: z.string().min(1),
  shopId: z.string().min(1),
  serviceType: z.enum(['ON_SITE_MEASUREMENT', 'IN_SHOP_MEASUREMENT', 'TAILORING', 'ALTERATION', 'CONSULTATION', 'DESIGN']),
  locationType: z.enum(['HOME', 'WORK', 'REST_HOUSE', 'OTHER']).optional(),
  addressId: z.string().optional(),
  customAddress: z.string().optional(),
  customLat: z.number().optional(),
  customLng: z.number().optional(),
  scheduledDate: z.string().optional(),
  preferredTimeSlot: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

export const adminConfigUpdateSchema = z.object({
  key: z.string().min(1),
  value: z.union([z.string(), z.number(), z.boolean(), z.record(z.unknown())]),
  type: z.enum(['STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'SELECT']),
}).refine((data) => {
  if (data.type === 'NUMBER' && typeof data.value !== 'number') return false;
  if (data.type === 'BOOLEAN' && typeof data.value !== 'boolean') return false;
  return true;
}, { message: 'Value type must match the specified type' });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type MeasurementSubmissionInput = z.infer<typeof measurementSubmissionSchema>;
export type ProcessPaymentInput = z.infer<typeof processPaymentSchema>;
export type CreateServiceRequestInput = z.infer<typeof createServiceRequestSchema>;
export type AdminConfigUpdateInput = z.infer<typeof adminConfigUpdateSchema>;
