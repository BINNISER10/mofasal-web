import { nanoid } from 'nanoid';
import prisma from '../config/database';
import { ApiError } from '../utils/ApiError';
import { NotificationService } from './NotificationService';
import { OrderService } from './OrderService';
/**
 * منطق طلبات الخدمة وتوزيع مندوب القياس + التتبّع اللحظي.
 * المندوب = User يملك دوراً باسم REPRESENTATIVE (أو ينتمي لنفس المحل).
 */
export class ServiceRequestService {
  // متوسط سرعة المندوب في المدينة (كم/ساعة) لتقدير وقت الوصول
  static readonly AVG_SPEED_KMH = 30;

  /** مسافة هافرسين بالكيلومترات بين نقطتين جغرافيتين */
  static haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // نصف قطر الأرض بالكيلومتر
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  static etaMinutes(distanceKm: number): number {
    return Math.max(5, Math.round((distanceKm / this.AVG_SPEED_KMH) * 60));
  }

  static async create(data: {
    customerId: string;
    shopId: string;
    serviceType: string;
    locationType?: string;
    addressId?: string;
    customAddress?: string;
    lat?: number;
    lng?: number;
    scheduledDate?: string;
    preferredTime?: string;
    notes?: string;
  }) {
    const request = await prisma.serviceRequest.create({
      data: {
        customerId: data.customerId,
        shopId: data.shopId,
        serviceType: data.serviceType,
        locationType: data.locationType,
        addressId: data.addressId,
        customAddress: data.customAddress,
        lat: data.lat,
        lng: data.lng,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
        preferredTime: data.preferredTime,
        notes: data.notes,
        status: 'PENDING',
      },
    });
    return request;
  }

  /**
   * إيجاد المندوبين المتاحين للمحل (Users بدور REPRESENTATIVE ضمن نفس المحل).
   */
  static async findAvailableRepresentatives(shopId: string) {
    return prisma.user.findMany({
      where: {
        shopId,
        status: 'ACTIVE',
        role: { name: 'REPRESENTATIVE' },
      },
      select: { id: true, name: true, phone: true, avatar: true },
    });
  }

  /**
   * توزيع تلقائي: يعيّن المندوب الأنسب ويحسب المسافة ووقت الوصول.
   * يستخدم موقع المحل كنقطة انطلاق تقديرية للمندوب.
   */
  static async dispatchNearest(requestId: string) {
    const request = await prisma.serviceRequest.findUnique({ where: { id: requestId } });
    if (!request) throw ApiError.notFound('Service request not found');
    if (request.representativeId) {
      throw ApiError.badRequest('تم تعيين مندوب لهذا الطلب مسبقاً');
    }

    const reps = await this.findAvailableRepresentatives(request.shopId);
    if (reps.length === 0) {
      throw ApiError.badRequest('لا يوجد مندوبون متاحون حالياً');
    }

    const shop = await prisma.shop.findUnique({
      where: { id: request.shopId },
      select: { lat: true, lng: true },
    });

    // حساب المسافة من المحل إلى موقع العميل (تقدير نقطة انطلاق المندوب)
    let distanceKm: number | null = null;
    let estimatedArrivalMin: number | null = null;
    if (shop?.lat != null && shop?.lng != null && request.lat != null && request.lng != null) {
      distanceKm = Number(this.haversineKm(shop.lat, shop.lng, request.lat, request.lng).toFixed(2));
      estimatedArrivalMin = this.etaMinutes(distanceKm);
    }

    // اختيار المندوب الأول المتاح (يمكن لاحقاً ترتيبهم حسب الموقع اللحظي)
    const chosen = reps[0];

    const updated = await prisma.serviceRequest.update({
      where: { id: requestId },
      data: {
        representativeId: chosen.id,
        repLat: shop?.lat ?? null,
        repLng: shop?.lng ?? null,
        distanceKm,
        estimatedArrivalMin,
        assignedAt: new Date(),
        status: 'ASSIGNED',
      },
    });

    await NotificationService.notifyMeasurementDispatched(request.customerId, estimatedArrivalMin);

    return { request: updated, representative: chosen };
  }

  /** تحديث الموقع اللحظي للمندوب + إعادة حساب وقت الوصول */
  static async updateRepLocation(requestId: string, repLat: number, repLng: number) {
    const request = await prisma.serviceRequest.findUnique({ where: { id: requestId } });
    if (!request) throw ApiError.notFound('Service request not found');

    let distanceKm: number | null = request.distanceKm;
    let estimatedArrivalMin: number | null = request.estimatedArrivalMin;
    if (request.lat != null && request.lng != null) {
      distanceKm = Number(this.haversineKm(repLat, repLng, request.lat, request.lng).toFixed(2));
      estimatedArrivalMin = this.etaMinutes(distanceKm);
    }

    return prisma.serviceRequest.update({
      where: { id: requestId },
      data: {
        repLat,
        repLng,
        distanceKm,
        estimatedArrivalMin,
        status: request.status === 'ASSIGNED' ? 'EN_ROUTE' : request.status,
      },
    });
  }

  /** تعليم وصول المندوب */
  static async markArrived(requestId: string) {
    const request = await prisma.serviceRequest.findUnique({ where: { id: requestId } });
    if (!request) throw ApiError.notFound('Service request not found');
    const updated = await prisma.serviceRequest.update({
      where: { id: requestId },
      data: { status: 'ARRIVED', arrivedAt: new Date(), estimatedArrivalMin: 0 },
    });

    await NotificationService.notifyMeasurementArrived(request.customerId);

    return updated;
  }

  /** بيانات التتبّع اللحظي للعميل */
  static async getTracking(requestId: string) {
    const request = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
      include: { shop: { select: { id: true, name: true, nameAr: true } } },
    });
    if (!request) throw ApiError.notFound('Service request not found');

    let representative = null;
    if (request.representativeId) {
      representative = await prisma.user.findUnique({
        where: { id: request.representativeId },
        select: { id: true, name: true, phone: true, avatar: true },
      });
    }

    return {
      id: request.id,
      status: request.status,
      serviceType: request.serviceType,
      customerLocation: request.lat != null && request.lng != null
        ? { lat: request.lat, lng: request.lng } : null,
      representativeLocation: request.repLat != null && request.repLng != null
        ? { lat: request.repLat, lng: request.repLng } : null,
      distanceKm: request.distanceKm,
      estimatedArrivalMin: request.estimatedArrivalMin,
      assignedAt: request.assignedAt,
      arrivedAt: request.arrivedAt,
      representative,
      shop: request.shop,
    };
  }

  /**
   * إكمال زيارة القياس: حفظ المقاسات ← إنشاء طلب تفصيل ← بدء التصنيع.
   */
  static async completeWithMeasurements(
    requestId: string,
    actor: { userId: string; role: string },
    data: {
      measurements: Record<string, number>;
      notes?: string;
      garmentType?: string;
      fabricId?: string;
      fabricSource?: string;
      customerType?: string;
      thobeSpecs?: Record<string, unknown>;
    },
  ) {
    const request = await prisma.serviceRequest.findUnique({ where: { id: requestId } });
    if (!request) throw ApiError.notFound('Service request not found');
    if (!['ARRIVED', 'EN_ROUTE', 'ASSIGNED'].includes(request.status)) {
      throw ApiError.badRequest('لا يمكن إكمال الطلب في حالته الحالية');
    }
    if (request.status === 'COMPLETED') {
      throw ApiError.badRequest('تم إكمال هذا الطلب مسبقاً');
    }
    if (actor.role !== 'ADMIN' && request.representativeId !== actor.userId) {
      throw ApiError.forbidden('هذا الطلب غير مُعيَّن لك');
    }
    if (!request.customerId) throw ApiError.badRequest('طلب الخدمة بدون عميل');

    const measurementEntries = Object.entries(data.measurements || {}).filter(
      ([, v]) => typeof v === 'number' && !Number.isNaN(v),
    );
    if (measurementEntries.length === 0) {
      throw ApiError.badRequest('يجب إدخال قياس واحد على الأقل');
    }
    const measurements = Object.fromEntries(measurementEntries) as Record<string, number>;

    const garmentType = (data.garmentType || 'thobe').toLowerCase();
    const garmentLabels: Record<string, string> = {
      thobe: 'ثوب',
      bisht: 'بشت',
      pants: 'سروال',
      suit: 'بدلة',
      alteration: 'تعديل',
    };
    const itemName = garmentLabels[garmentType] || garmentType;

    const customerId = await OrderService.resolveCustomerId(request.customerId, request.shopId);

    const result = await prisma.$transaction(async (tx) => {
      const updatedRequest = await tx.serviceRequest.update({
        where: { id: requestId },
        data: { status: 'COMPLETED' },
      });

      await tx.customer.update({
        where: { id: customerId },
        data: { measurements },
      });

      await tx.userMeasurement.create({
        data: {
          userId: request.customerId!,
          name: `قياس ${itemName}`,
          data: measurements,
        },
      });

      const order = await tx.order.create({
        data: {
          orderNumber: OrderService.generateOrderNumber(),
          customerId,
          shopId: request.shopId,
          status: 'IN_PROGRESS',
          customerNotes: data.notes,
          items: {
            create: [{ name: itemName, quantity: 1, unitPrice: 0, totalPrice: 0 }],
          },
        },
        include: {
          items: true,
          customer: { select: { id: true, name: true, phone: true } },
          shop: { select: { id: true, name: true } },
        },
      });

      const orderMeasurement = await tx.orderMeasurement.create({
        data: {
          orderId: order.id,
          measurementData: {
            ...measurements,
            ...(data.thobeSpecs ? { thobeSpecs: data.thobeSpecs } : {}),
            ...(data.fabricId ? { fabricId: data.fabricId } : {}),
            ...(data.fabricSource ? { fabricSource: data.fabricSource } : {}),
          },
          notes: data.notes,
          garmentType: garmentType.toUpperCase(),
          customerType: data.customerType,
        },
      });

      const confirmation = await tx.confirmationLink.create({
        data: {
          token: nanoid(32),
          orderId: order.id,
          measurements,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      return { request: updatedRequest, order, orderMeasurement, confirmation };
    });

    await NotificationService.notifyMeasurementCompleted(
      request.customerId,
      result.order.orderNumber,
    );

    return result;
  }
}
