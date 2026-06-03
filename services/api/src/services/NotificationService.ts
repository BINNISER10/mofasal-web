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

  // =================== ORDER NOTIFICATIONS ===================

  static async notifyOrderCreated(order: { id: string; orderNumber: string; customerId?: string | null; shopId: string; grandTotal?: number | null }) {
    const customer = order.customerId
      ? await prisma.customer.findUnique({ where: { id: order.customerId }, select: { phone: true, name: true } })
      : null;

    let userId: string | null = null;
    if (customer?.phone) {
      const user = await prisma.user.findFirst({ where: { phone: customer.phone }, select: { id: true } });
      userId = user?.id || null;
    }

    const total = order.grandTotal?.toFixed(2) ?? '0.00';

    // إشعار العميل
    if (userId) {
      await this.sendToUser(userId, 'ORDER_CREATED', {
        title: 'طلب جديد',
        titleAr: 'طلب جديد',
        body: `تم استلام طلبك ${order.orderNumber} بقيمة ${total} ريال`,
        bodyAr: `تم استلام طلبك ${order.orderNumber} بقيمة ${total} ريال`,
        data: { orderId: order.id, orderNumber: order.orderNumber, type: 'order' },
      });
      // SMS احتياطي
      if (customer?.phone) {
        await this.sendSMS(customer.phone, `مفصل: تم استلام طلبك ${order.orderNumber}. سيتم التواصل قريباً.`).catch(() => {});
      }
    }

    // إشعار موظفي المحل
    await this.sendToShopStaff(order.shopId, 'NEW_ORDER', {
      title: 'طلب جديد',
      titleAr: 'طلب جديد',
      body: `طلب جديد ${order.orderNumber} بقيمة ${total} ريال`,
      bodyAr: `طلب جديد ${order.orderNumber} بقيمة ${total} ريال`,
      data: { orderId: order.id, orderNumber: order.orderNumber, type: 'order' },
    });
  }

  static async notifyOrderStatusChanged(order: { id: string; orderNumber: string; customerId?: string | null; shopId: string; status: string; previousStatus?: string }) {
    const statusLabels: Record<string, { ar: string; action: string }> = {
      PENDING: { ar: 'معلّق', action: 'في الانتظار' },
      CONFIRMED: { ar: 'مؤكّد', action: 'تم تأكيد طلبك' },
      PROCESSING: { ar: 'قيد المعالجة', action: 'جاري تنفيذ طلبك' },
      READY: { ar: 'جاهز', action: 'طلبك جاهز للتسليم' },
      SHIPPED: { ar: 'تم الشحن', action: 'تم شحن طلبك' },
      DELIVERED: { ar: 'تم التسليم', action: 'تم تسليم طلبك' },
      COMPLETED: { ar: 'مكتمل', action: 'اكتمل طلبك بنجاح' },
      CANCELLED: { ar: 'ملغى', action: 'تم إلغاء طلبك' },
    };

    const label = statusLabels[order.status] ?? { ar: order.status, action: order.status };
    const customer = order.customerId
      ? await prisma.customer.findUnique({ where: { id: order.customerId }, select: { phone: true } })
      : null;

    let userId: string | null = null;
    if (customer?.phone) {
      const user = await prisma.user.findFirst({ where: { phone: customer.phone }, select: { id: true } });
      userId = user?.id || null;
    }

    if (userId) {
      await this.sendToUser(userId, 'ORDER_STATUS', {
        title: 'تحديث الطلب',
        titleAr: 'تحديث الطلب',
        body: `${label.action}: ${order.orderNumber} (${label.ar})`,
        bodyAr: `${label.action}: ${order.orderNumber} (${label.ar})`,
        data: { orderId: order.id, orderNumber: order.orderNumber, status: order.status, type: 'order' },
      });
      if (customer?.phone && ['READY', 'SHIPPED', 'DELIVERED', 'COMPLETED'].includes(order.status)) {
        await this.sendSMS(customer.phone, `مفصل: ${label.action} ${order.orderNumber}. شكراً لثقتك.`).catch(() => {});
      }
    }
  }

  static async notifyPaymentReceived(order: { id: string; orderNumber: string; customerId?: string | null; grandTotal?: number | null; paymentMethod?: string | null }) {
    const customer = order.customerId
      ? await prisma.customer.findUnique({ where: { id: order.customerId }, select: { phone: true } })
      : null;

    let userId: string | null = null;
    if (customer?.phone) {
      const user = await prisma.user.findFirst({ where: { phone: customer.phone }, select: { id: true } });
      userId = user?.id || null;
    }

    const method = order.paymentMethod === 'CASH' ? 'نقداً' : 'إلكترونياً';
    const total = order.grandTotal?.toFixed(2) ?? '0.00';

    if (userId) {
      await this.sendToUser(userId, 'PAYMENT_RECEIVED', {
        title: 'تم استلام الدفع',
        titleAr: 'تم استلام الدفع',
        body: `تم استلام ${total} ريال ${method} للطلب ${order.orderNumber}`,
        bodyAr: `تم استلام ${total} ريال ${method} للطلب ${order.orderNumber}`,
        data: { orderId: order.id, orderNumber: order.orderNumber, type: 'payment' },
      });
    }
  }

  static async notifyMeasurementDispatched(serviceRequest: { id: string; shopId: string; customerId?: string | null; representativeId?: string | null; estimatedArrivalMin?: number | null }) {
    const customer = serviceRequest.customerId
      ? await prisma.customer.findUnique({ where: { id: serviceRequest.customerId }, select: { phone: true, name: true } })
      : null;
    const rep = serviceRequest.representativeId
      ? await prisma.user.findUnique({ where: { id: serviceRequest.representativeId }, select: { name: true, phone: true } })
      : null;

    let userId: string | null = null;
    if (customer?.phone) {
      const user = await prisma.user.findFirst({ where: { phone: customer.phone }, select: { id: true } });
      userId = user?.id || null;
    }

    const eta = serviceRequest.estimatedArrivalMin ?? 30;

    if (userId) {
      await this.sendToUser(userId, 'MEASUREMENT_DISPATCHED', {
        title: 'المندوب في الطريق',
        titleAr: 'المندوب في الطريق',
        body: `مندوب القياس ${rep?.name ?? ''} سيصل خلال ${eta} دقيقة`,
        bodyAr: `مندوب القياس ${rep?.name ?? ''} سيصل خلال ${eta} دقيقة`,
        data: { serviceRequestId: serviceRequest.id, type: 'service', etaMin: eta },
      });
      if (customer?.phone && rep?.phone) {
        await this.sendSMS(customer.phone, `مفصل: مندوب القياس ${rep.name} في الطريق. ETA: ${eta}د. للتواصل: ${rep.phone}`).catch(() => {});
      }
    }
  }

  static async notifyMeasurementArrived(serviceRequest: { id: string; shopId: string; customerId?: string | null; representativeId?: string | null }) {
    const customer = serviceRequest.customerId
      ? await prisma.customer.findUnique({ where: { id: serviceRequest.customerId }, select: { phone: true } })
      : null;

    let userId: string | null = null;
    if (customer?.phone) {
      const user = await prisma.user.findFirst({ where: { phone: customer.phone }, select: { id: true } });
      userId = user?.id || null;
    }

    if (userId) {
      await this.sendToUser(userId, 'MEASUREMENT_ARRIVED', {
        title: 'وصل المندوب',
        titleAr: 'وصل المندوب',
        body: 'مندوب القياس وصل إلى موقعك',
        bodyAr: 'مندوب القياس وصل إلى موقعك',
        data: { serviceRequestId: serviceRequest.id, type: 'service' },
      });
    }

    await this.sendToShopStaff(serviceRequest.shopId, 'REP_ARRIVED', {
      title: 'وصول المندوب',
      titleAr: 'وصول المندوب',
      body: 'المندوب وصل للعميل وبدأ القياس',
      bodyAr: 'المندوب وصل للعميل وبدأ القياس',
      data: { serviceRequestId: serviceRequest.id, type: 'service' },
    });
  }
}
