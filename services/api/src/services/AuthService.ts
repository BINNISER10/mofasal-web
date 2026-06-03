import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { config } from '../config';
import prisma from '../config/database';
import { ApiError } from '../utils/ApiError';
import { JwtPayload } from '../middleware/auth';
import redisService from './RedisService';
import { NotificationService } from './NotificationService';
import logger from '../utils/logger';

export class AuthService {
  static async register(data: { name: string; phone?: string; email?: string; password: string }) {
    const hashedPassword = await bcrypt.hash(data.password, 12);
    const shop = await prisma.shop.findFirst({ orderBy: { createdAt: 'asc' } });
    if (!shop) throw ApiError.internal('No shop configured');

    let role = await prisma.role.findFirst({ where: { name: 'CUSTOMER' } });
    if (!role) {
      role = await prisma.role.create({
        data: { shopId: shop.id, name: 'CUSTOMER', permissions: { orders: true } },
      });
    }

    if (data.email) {
      const existing = await prisma.user.findUnique({ where: { email: data.email } });
      if (existing) throw ApiError.conflict('Email already registered');
    }
    if (data.phone) {
      const existing = await prisma.user.findUnique({ where: { phone: data.phone } });
      if (existing) throw ApiError.conflict('Phone number already registered');
    }

    const user = await prisma.user.create({
      data: {
        shopId: shop.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        roleId: role.id,
        status: 'ACTIVE',
      },
      select: { id: true, name: true, email: true, phone: true, status: true, avatar: true, phoneVerified: true, createdAt: true },
    });

    const tokens = this.generateTokens(user.id, role.name);
    return { user: { ...user, role: role.name }, ...tokens };
  }

  static async login(identifier: string, password: string) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone: identifier },
        ],
      },
      include: { role: { select: { name: true } } },
    });
    if (!user) throw ApiError.unauthorized('Invalid credentials');
    if (user.status !== 'ACTIVE') throw ApiError.forbidden('Account is not active');

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) throw ApiError.unauthorized('Invalid credentials');

    const tokens = this.generateTokens(user.id, user.role.name);

    const { password: _, roleId: __, ...userWithoutSensitive } = user;
    return { user: { ...userWithoutSensitive, role: user.role.name }, ...tokens };
  }

  static async verifyPhone(userId: string, code: string) {
    const storedCode = await redisService.get(`verify:${userId}`);
    if (!storedCode || storedCode !== code) throw ApiError.badRequest('Invalid or expired verification code');
    await prisma.user.update({ where: { id: userId }, data: { phoneVerified: true } });
    await redisService.del(`verify:${userId}`);
    return { verified: true };
  }

  static async sendVerificationCode(userId: string, phone: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await redisService.set(`verify:${userId}`, code, 300);
    await NotificationService.sendSMS(phone, `Your MUFASAL verification code is: ${code}`);
    return { sent: true };
  }

  static async forgotPassword(identifier: string) {
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { phone: identifier }] },
    });
    if (!user) throw ApiError.notFound('User not found');
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const resetToken = nanoid(32);
    await redisService.set(`reset:${user.id}`, JSON.stringify({ code, token: resetToken }), 600);
    const contact = user.phone || user.email || '';
    await NotificationService.sendSMS(contact, `Your MUFASAL password reset code is: ${code}`);
    return { message: 'Reset code sent', resetToken };
  }

  static async resetPassword(identifier: string, code: string, newPassword: string) {
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { phone: identifier }] },
    });
    if (!user) throw ApiError.notFound('User not found');
    const stored = await redisService.get(`reset:${user.id}`);
    if (!stored) throw ApiError.badRequest('Reset code expired');
    const { code: storedCode } = JSON.parse(stored);
    if (storedCode !== code) throw ApiError.badRequest('Invalid reset code');
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } });
    await redisService.del(`reset:${user.id}`);
    return { message: 'Password reset successfully' };
  }

  static async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as JwtPayload;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { role: { select: { name: true } } },
      });
      if (!user || user.status !== 'ACTIVE') throw ApiError.unauthorized('Invalid refresh token');
      return this.generateTokens(user.id, user.role.name);
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }
  }

  static generateTokens(userId: string, role: string) {
    const accessToken = jwt.sign({ userId, role } as JwtPayload, config.jwt.secret, { expiresIn: config.jwt.expiresIn as any });
    const refreshToken = jwt.sign({ userId, role } as JwtPayload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn as any });
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: config.jwt.expiresIn,
    };
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.notFound('User not found');
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw ApiError.badRequest('Current password is incorrect');
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } });
    return { message: 'Password changed successfully' };
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: { select: { name: true } } },
    });
    if (!user) throw ApiError.notFound('User not found');
    const { password, roleId, ...safe } = user;
    return { ...safe, role: user.role.name };
  }

  static async updateProfile(userId: string, data: { name?: string; email?: string; avatar?: string }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, email: true, phone: true, roleId: true, avatar: true },
    });
    const role = await prisma.role.findUnique({ where: { id: user.roleId } });
    return { ...user, role: role?.name || 'UNKNOWN' };
  }

  static async sendOtp(phone: string) {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    await redisService.set(`otp:${phone}`, code, 300);
    logger.info(`[OTP Sent] Phone: ${phone}, Code: ${code}`);

    const { SmsService } = await import('./integrations/SmsService');
    await SmsService.sendVerificationCode(phone, code);

    return { sent: true };
  }

  static async verifyOtp(phone: string, code: string) {
    const storedCode = await redisService.get(`otp:${phone}`);
    if (!storedCode || storedCode !== code) {
      throw ApiError.badRequest('رمز التحقق غير صحيح أو منتهي الصلاحية');
    }

    await redisService.del(`otp:${phone}`);

    let user = await prisma.user.findFirst({
      where: { phone },
      include: { role: { select: { name: true } } },
    });

    if (!user) {
      const shop = await prisma.shop.findFirst({ orderBy: { createdAt: 'asc' } });
      if (!shop) throw ApiError.internal('No shop configured');

      let role = await prisma.role.findFirst({ where: { name: 'CUSTOMER' } });
      if (!role) {
        role = await prisma.role.create({
          data: { shopId: shop.id, name: 'CUSTOMER', permissions: { orders: true } },
        });
      }

      const randomPassword = Math.random().toString(36).substring(2, 10);
      const hashedPassword = await bcrypt.hash(randomPassword, 12);

      user = await prisma.user.create({
        data: {
          shopId: shop.id,
          name: 'عميل جديد',
          phone,
          password: hashedPassword,
          roleId: role.id,
          status: 'ACTIVE',
          phoneVerified: true,
        },
        include: { role: { select: { name: true } } },
      });
    } else {
      if (!user.phoneVerified) {
        await prisma.user.update({
          where: { id: user.id },
          data: { phoneVerified: true },
        });
      }
    }

    const tokens = this.generateTokens(user.id, user.role.name);

    const { password: _, roleId: __, ...userWithoutSensitive } = user;
    return {
      user: { ...userWithoutSensitive, role: user.role.name },
      ...tokens,
    };
  }
}
