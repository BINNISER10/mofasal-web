import { z } from 'zod';

// Saudi phone number pattern: 05XXXXXXXX or +9665XXXXXXXX
const saudiPhoneRegex = /^(05\d{8}|(\+966)5\d{8})$/;

export const registerSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل').max(100),
  phone: z.string().regex(saudiPhoneRegex, 'رقم هاتف سعودي غير صالح'),
  email: z.string().email('بريد إلكتروني غير صالح').optional(),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

export const loginSchema = z.object({
  identifier: z.string().min(1, 'رقم الهاتف أو البريد الإلكتروني مطلوب'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

export const forgotPasswordSchema = z.object({
  identifier: z.string().min(1, 'رقم الهاتف أو البريد الإلكتروني مطلوب'),
});

export const resetPasswordSchema = z.object({
  identifier: z.string().min(1),
  code: z.string().length(6, 'رمز التحقق يجب أن يكون 6 أرقام'),
  newPassword: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

export const verifyPhoneSchema = z.object({
  code: z.string().length(6, 'رمز التحقق يجب أن يكون 6 أرقام'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  avatar: z.string().url().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
  newPassword: z.string().min(6, 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'),
});

export const sendOtpSchema = z.object({
  phone: z.string().regex(saudiPhoneRegex, 'رقم هاتف سعودي غير صالح'),
});

export const verifyOtpSchema = z.object({
  phone: z.string().regex(saudiPhoneRegex, 'رقم هاتف سعودي غير صالح'),
  code: z.string().length(4, 'رمز OTP يجب أن يكون 4 أرقام'),
});
