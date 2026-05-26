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
  }) {
    return prisma.orderMeasurement.create({
      data: { orderId, measurementData: data.measurementData, tailorId: data.tailorId, notes: data.notes, images: data.images || [] },
    });
  }

  static async updateOrderMeasurement(measurementId: string, data: {
    measurementData?: any; notes?: string; images?: string[];
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
        await prisma.orderMeasurement.upsert({
          where: { id: link.orderId } as any,
          create: { orderId: link.orderId, measurementData: link.measurements },
          update: { measurementData: link.measurements },
        });
      }
    }

    return updated;
  }
}
