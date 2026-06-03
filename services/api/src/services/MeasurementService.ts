import prisma from '../config/database';
import { ApiError } from '../utils/ApiError';

export class MeasurementService {
  static async getOrderMeasurements(orderId: string) {
    return prisma.orderMeasurement.findMany({
      where: { orderId },
      orderBy: { id: 'asc' },
    });
  }

  static async addOrderMeasurement(orderId: string, data: {
    measurementData: any; tailorId?: string; notes?: string; images?: string[];
    garmentType?: string; customerType?: string; customerAge?: number;
  }) {
    return prisma.orderMeasurement.create({
      data: {
        orderId,
        measurementData: data.measurementData,
        tailorId: data.tailorId,
        notes: data.notes,
        images: data.images || [],
        garmentType: data.garmentType,
        customerType: data.customerType,
        customerAge: data.customerAge,
      },
    });
  }

  static async updateOrderMeasurement(measurementId: string, data: {
    measurementData?: any; notes?: string; images?: string[];
    garmentType?: string; customerType?: string; customerAge?: number;
  }) {
    return prisma.orderMeasurement.update({
      where: { id: measurementId },
      data,
    });
  }

  static async getUserMeasurements(userId: string) {
    return prisma.userMeasurement.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createUserMeasurement(userId: string, data: { name: string; data: any }) {
    return prisma.userMeasurement.create({ data: { userId, name: data.name, data: data.data } });
  }

  static async updateUserMeasurement(userId: string, measurementId: string, data: { name?: string; data?: any }) {
    const measurement = await prisma.userMeasurement.findFirst({ where: { id: measurementId, userId } });
    if (!measurement) throw ApiError.notFound('Measurement not found');
    return prisma.userMeasurement.update({ where: { id: measurementId }, data });
  }

  static async deleteUserMeasurement(userId: string, measurementId: string) {
    const measurement = await prisma.userMeasurement.findFirst({ where: { id: measurementId, userId } });
    if (!measurement) throw ApiError.notFound('Measurement not found');
    await prisma.userMeasurement.delete({ where: { id: measurementId } });
    return { message: 'Measurement deleted' };
  }

  static async handleConfirmationApproval(token: string, data: { approved: boolean; notes?: string }) {
    const link = await prisma.confirmationLink.findUnique({ where: { token } });
    if (!link) throw ApiError.notFound('Invalid confirmation link');
    if (link.expiresAt < new Date()) throw ApiError.badRequest('Link expired');
    if (link.customerApproved) throw ApiError.badRequest('Already approved');

    const updated = await prisma.confirmationLink.update({
      where: { token },
      data: { customerApproved: data.approved, customerNotes: data.notes, approvedAt: data.approved ? new Date() : null },
    });

    if (data.approved) {
      await prisma.order.update({
        where: { id: link.orderId },
        data: { isConfirmed: true, confirmedDate: new Date(), status: 'CONFIRMED' as any },
      });

      if (link.measurements) {
        const mData = (link.measurements as any) || {};
        const meta = mData._meta || {};
        const garmentType = meta.garmentType || null;
        const customerType = meta.customerType || null;
        const customerAge = meta.age ? parseInt(meta.age) : (meta.customerAge ? parseInt(meta.customerAge) : null);

        const existing = await prisma.orderMeasurement.findFirst({
          where: { orderId: link.orderId },
        });

        if (existing) {
          await prisma.orderMeasurement.update({
            where: { id: existing.id },
            data: {
              measurementData: link.measurements,
              garmentType,
              customerType,
              customerAge,
            },
          });
        } else {
          await prisma.orderMeasurement.create({
            data: {
              orderId: link.orderId,
              measurementData: link.measurements,
              garmentType,
              customerType,
              customerAge,
            },
          });
        }

        if (meta.fabricSource === 'catalog' && meta.fabricNote) {
          const { OrderService } = require('./OrderService');
          OrderService.createB2BSubOrderForFabric(link.orderId, meta.fabricNote).catch((e: any) => {
            console.error('Failed to create B2B sub-order on confirmation approval:', e);
          });
        }
      }
    }

    return updated;
  }
}
