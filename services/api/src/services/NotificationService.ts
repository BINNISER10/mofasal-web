import prisma from '../config/database';
import logger from '../utils/logger';
import socketService from './SocketService';

export class NotificationService {
  static async sendToUser(userId: string, type: string, data: { title: string; titleAr?: string; body?: string; bodyAr?: string; data?: any }) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          type: type as any,
          title: data.title,
          titleAr: data.titleAr,
          body: data.body,
          bodyAr: data.bodyAr,
          data: data.data || {},
        },
      });

      socketService.emitNotification(userId, notification);

      return notification;
    } catch (error) {
      logger.error('Failed to create notification', error);
      return null;
    }
  }

  static async sendToMultipleUsers(userIds: string[], type: string, data: { title: string; titleAr?: string; body?: string; bodyAr?: string; data?: any }) {
    const notifications = [];
    for (const userId of userIds) {
      const notif = await this.sendToUser(userId, type, data);
      if (notif) notifications.push(notif);
    }
    return notifications;
  }

  static async sendToShopStaff(shopId: string, type: string, data: { title: string; titleAr?: string; body?: string; bodyAr?: string; data?: any }) {
    const staff = await prisma.user.findMany({
      where: { shopId, status: 'ACTIVE' },
      select: { id: true },
    });

    return this.sendToMultipleUsers(staff.map((s) => s.id), type, data);
  }

  static async getNotifications(userId: string, page = 1, limit = 20, unreadOnly = false) {
    const where: any = { userId };
    if (unreadOnly) where.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return { notifications, total, unreadCount, page, limit };
  }

  static async markAsRead(notificationId: string, userId: string) {
    const notif = await prisma.notification.findFirst({ where: { id: notificationId, userId } });
    if (!notif) throw new Error('Notification not found');

    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  static async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { message: 'All notifications marked as read' };
  }

  static async deleteNotification(notificationId: string, userId: string) {
    const notif = await prisma.notification.findFirst({ where: { id: notificationId, userId } });
    if (!notif) throw new Error('Notification not found');
    await prisma.notification.delete({ where: { id: notificationId } });
    return { message: 'Notification deleted' };
  }

  static async sendSMS(to: string, message: string): Promise<boolean> {
    try {
      const { SmsService } = await import('./integrations/SmsService');
      await SmsService.send(to, message);
      return true;
    } catch (error) {
      logger.error('SMS sending failed', error);
      return false;
    }
  }

  static async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      const nodemailer = await import('nodemailer');
      const { config } = await import('../config');
      const transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: false,
        auth: { user: config.smtp.user, pass: config.smtp.pass },
      });
      await transporter.sendMail({
        from: `"${config.smtp.fromName}" <${config.smtp.from}>`,
        to,
        subject,
        html,
      });
      return true;
    } catch (error) {
      logger.error('Email sending failed', error);
      return false;
    }
  }

  static async sendPushNotification(userId: string, title: string, body: string, data?: any): Promise<boolean> {
    try {
      const { FirebaseService } = await import('./integrations/FirebaseService');
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
      if (!user) return false;
      await FirebaseService.sendToUser(userId, title, body, data);
      return true;
    } catch (error) {
      logger.error('Push notification failed', error);
      return false;
    }
  }
}
