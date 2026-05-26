import prisma from '../config/database';
import { ApiError } from '../utils/ApiError';
import logger from '../utils/logger';
import socketService from './SocketService';
import { NotificationService } from './NotificationService';

export class DeliveryService {
  static async createDeliveryRequest(orderId: string, provider?: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        shop: { include: { shopVehicles: { where: { isActive: true } } } },
        customer: { select: { id: true, name: true, phone: true } },
      },
    });
    if (!order) throw ApiError.notFound('Order not found');

    const existingDelivery = await prisma.deliveryRequest.findUnique({ where: { orderId } });
    if (existingDelivery) throw ApiError.conflict('Delivery already exists for this order');

    const selectedProvider = provider || await this.selectProvider(order);
    const deliveryRequest = await prisma.deliveryRequest.create({
      data: { orderId, provider: selectedProvider as any, status: 'PENDING' },
    });

    try {
      await this.dispatchToProvider(deliveryRequest, order);
    } catch (error) {
      logger.error('Initial dispatch failed, attempting fallback', error);
      const fallbackProvider = await this.getFallbackProvider(selectedProvider);
      if (fallbackProvider) {
        await prisma.deliveryRequest.update({
          where: { id: deliveryRequest.id },
          data: { provider: fallbackProvider as any },
        });
        await this.dispatchToProvider(
          { ...deliveryRequest, provider: fallbackProvider } as any,
          order
        );
      }
    }

    return prisma.deliveryRequest.findUnique({
      where: { id: deliveryRequest.id },
      include: { tracking: { orderBy: { timestamp: 'desc' } } },
    });
  }

  private static async selectProvider(order: any): Promise<string> {
    if (order.shop.shopVehicles && order.shop.shopVehicles.length > 0) {
      return 'SHOP_VEHICLE';
    }
    return 'UBER';
  }

  private static async getFallbackProvider(currentProvider: string): Promise<string | null> {
    const fallbackChain: Record<string, string[]> = {
      SHOP_VEHICLE: ['UBER', 'CAREEN', 'JEENY', 'SMSA'],
      UBER: ['CAREEN', 'JEENY', 'SMSA'],
      CAREEN: ['JEENY', 'SMSA'],
      JEENY: ['SMSA'],
      SMSA: ['ARAMEX'],
      ARAMEX: [],
    };
    const fallbacks = fallbackChain[currentProvider] || [];
    return fallbacks.length > 0 ? fallbacks[0] : null;
  }

  private static async dispatchToProvider(deliveryRequest: any, order: any): Promise<void> {
    switch (deliveryRequest.provider) {
      case 'SHOP_VEHICLE':
        await this.dispatchShopVehicle(deliveryRequest, order);
        break;
      case 'UBER':
        await this.dispatchUber(deliveryRequest, order);
        break;
      case 'CAREEN':
        await this.dispatchCareen(deliveryRequest, order);
        break;
      case 'JEENY':
        await this.dispatchJeeny(deliveryRequest, order);
        break;
      case 'SMSA':
        await this.dispatchSmsa(deliveryRequest, order);
        break;
      case 'ARAMEX':
        await this.dispatchAramex(deliveryRequest, order);
        break;
    }
  }

  private static async dispatchShopVehicle(deliveryRequest: any, order: any) {
    const vehicle = order.shop.shopVehicles?.[0];
    if (!vehicle) throw new Error('No available vehicle');

    await prisma.deliveryRequest.update({
      where: { id: deliveryRequest.id },
      data: {
        status: 'PICKED_UP',
        driverName: vehicle.driverName,
        driverPhone: vehicle.driverPhone,
        estimatedArrival: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
  }

  private static async dispatchUber(deliveryRequest: any, order: any) {
    const { UberDeliveryService } = await import('./delivery/UberDeliveryService');
    const uberService = new UberDeliveryService();
    const result = await uberService.createDelivery({
      pickupLat: order.shop.lat, pickupLng: order.shop.lng,
      dropoffLat: 0, dropoffLng: 0, // would come from customer address
    });
    await prisma.deliveryRequest.update({
      where: { id: deliveryRequest.id },
      data: {
        status: 'PICKED_UP',
        driverName: result.driverName,
        driverPhone: result.driverPhone,
        trackingUrl: result.trackingUrl,
        estimatedArrival: result.estimatedArrival ? new Date(result.estimatedArrival) : undefined,
      },
    });
  }

  private static async dispatchCareen(deliveryRequest: any, order: any) {
    const { CareenDeliveryService } = await import('./delivery/CareenDeliveryService');
    const careenService = new CareenDeliveryService();
    const result = await careenService.createDelivery({
      pickupLat: order.shop.lat, pickupLng: order.shop.lng,
      dropoffLat: 0, dropoffLng: 0,
    });
    await prisma.deliveryRequest.update({
      where: { id: deliveryRequest.id },
      data: {
        status: 'PICKED_UP',
        driverName: result.driverName,
        driverPhone: result.driverPhone,
        trackingUrl: result.trackingUrl,
        estimatedArrival: result.estimatedArrival ? new Date(result.estimatedArrival) : undefined,
      },
    });
  }

  private static async dispatchJeeny(deliveryRequest: any, order: any) {
    const { JeenyDeliveryService } = await import('./delivery/JeenyDeliveryService');
    const jeenyService = new JeenyDeliveryService();
    const result = await jeenyService.createDelivery({
      pickupLat: order.shop.lat, pickupLng: order.shop.lng,
      dropoffLat: 0, dropoffLng: 0,
    });
    await prisma.deliveryRequest.update({
      where: { id: deliveryRequest.id },
      data: {
        status: 'PICKED_UP',
        driverName: result.driverName,
        driverPhone: result.driverPhone,
        trackingUrl: result.trackingUrl,
        estimatedArrival: result.estimatedArrival ? new Date(result.estimatedArrival) : undefined,
      },
    });
  }

  private static async dispatchSmsa(deliveryRequest: any, order: any) {
    const { SmsaWaybillService } = await import('./delivery/SmsaWaybillService');
    const smsaService = new SmsaWaybillService();
    const result = await smsaService.createWaybill({
      customerName: order.customer.name,
      customerPhone: order.customer.phone,
      description: `Order ${order.orderNumber}`,
    });
    await prisma.deliveryRequest.update({
      where: { id: deliveryRequest.id },
      data: {
        status: 'PICKED_UP',
        waybillNumber: result.waybillNumber,
        trackingUrl: result.trackingUrl,
        estimatedArrival: result.estimatedArrival ? new Date(result.estimatedArrival) : undefined,
      },
    });
  }

  private static async dispatchAramex(deliveryRequest: any, order: any) {
    const { AramexWaybillService } = await import('./delivery/AramexWaybillService');
    const aramexService = new AramexWaybillService();
    const result = await aramexService.createShipment({
      customerName: order.customer.name,
      customerPhone: order.customer.phone,
      description: `Order ${order.orderNumber}`,
    });
    await prisma.deliveryRequest.update({
      where: { id: deliveryRequest.id },
      data: {
        status: 'PICKED_UP',
        waybillNumber: result.waybillNumber,
        trackingUrl: result.trackingUrl,
        estimatedArrival: result.estimatedArrival ? new Date(result.estimatedArrival) : undefined,
      },
    });
  }

  static async getDeliveryRequest(orderId: string) {
    const delivery = await prisma.deliveryRequest.findUnique({
      where: { orderId },
      include: { tracking: { orderBy: { timestamp: 'desc' } } },
    });
    if (!delivery) throw ApiError.notFound('Delivery not found');
    return delivery;
  }

  static async updateDeliveryStatus(deliveryRequestId: string, status: string, data?: { lat?: number; lng?: number; driverName?: string; driverPhone?: string; trackingUrl?: string }) {
    const delivery = await prisma.deliveryRequest.findUnique({ where: { id: deliveryRequestId }, include: { order: true } });
    if (!delivery) throw ApiError.notFound('Delivery request not found');

    const updated = await prisma.deliveryRequest.update({
      where: { id: deliveryRequestId },
      data: { status: status as any, ...data },
    });

    if (data?.lat && data?.lng) {
      await prisma.deliveryTracking.create({
        data: { deliveryRequestId, lat: data.lat, lng: data.lng, status },
      });
      socketService.emitTrackingUpdate(delivery.orderId, data.lat, data.lng, status);
    }

    if (status === 'DELIVERED') {
      await prisma.order.update({
        where: { id: delivery.orderId },
        data: { status: 'DELIVERED' as any },
      });
      await NotificationService.sendToUser(delivery.order.customerId, 'DELIVERY_UPDATE', {
        title: 'Order Delivered', body: 'Your order has been delivered!',
      });
    }

    return updated;
  }

  static async addTrackingPoint(deliveryRequestId: string, data: { lat: number; lng: number; status?: string }) {
    const delivery = await prisma.deliveryRequest.findUnique({ where: { id: deliveryRequestId } });
    if (!delivery) throw ApiError.notFound('Delivery request not found');

    const point = await prisma.deliveryTracking.create({
      data: { deliveryRequestId, ...data },
    });

    socketService.emitTrackingUpdate(delivery.orderId, data.lat, data.lng, data.status || delivery.status);
    return point;
  }

  static async getDeliveryTracking(deliveryRequestId: string) {
    return prisma.deliveryTracking.findMany({
      where: { deliveryRequestId },
      orderBy: { timestamp: 'desc' },
    });
  }
}
