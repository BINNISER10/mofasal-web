import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { AuthController } from '../../controllers/v1/auth.controller';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().regex(/^(\+966|0)?5\d{8}$/, 'Invalid Saudi phone number'),
  email: z.string().email().optional(),
  password: z.string().min(6).max(100),
  role: z.enum(['CUSTOMER', 'TAILOR', 'TAILOR_SHOP', 'MERCHANT']).optional(),
});

const loginSchema = z.object({
  email: z.string().optional(),
  phone: z.string().optional(),
  identifier: z.string().optional(),
  password: z.string().min(1),
});

const verifySchema = z.object({
  code: z.string().length(6),
});

const forgotSchema = z.object({
  phone: z.string().min(5),
});

const resetSchema = z.object({
  phone: z.string().min(5),
  code: z.string().length(6),
  password: z.string().min(6).max(100),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

const otpSendSchema = z.object({
  phone: z.string().regex(/^(\+966|0)?5\d{8}$/, 'Invalid Saudi phone number'),
});

const otpVerifySchema = z.object({
  phone: z.string().regex(/^(\+966|0)?5\d{8}$/, 'Invalid Saudi phone number'),
  code: z.string().length(4, 'OTP must be 4 digits'),
});

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/verify-phone', authenticate, validate(verifySchema), AuthController.verifyPhone);
router.post('/send-verification', authenticate, AuthController.sendVerificationCode);
router.post('/forgot-password', validate(forgotSchema), AuthController.forgotPassword);
router.post('/reset-password', validate(resetSchema), AuthController.resetPassword);
router.post('/refresh-token', validate(refreshSchema), AuthController.refreshToken);
router.post('/otp/send', validate(otpSendSchema), AuthController.sendOtp);
router.post('/otp/verify', validate(otpVerifySchema), AuthController.verifyOtp);
router.get('/profile', authenticate, AuthController.getProfile);
router.put('/profile', authenticate, AuthController.updateProfile);

export default router;
