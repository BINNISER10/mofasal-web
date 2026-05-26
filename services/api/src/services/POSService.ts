import prisma from '../config/database';
import { ApiError } from '../utils/ApiError';

export class POSService {
  static async openSession(shopId: string, cashierId: string, openingBalance = 0) {
    const active = await prisma.pOSSession.findFirst({ where: { shopId, cashierId, status: 'OPEN' } });
    if (active) throw ApiError.badRequest('Already have an open session');
    return prisma.pOSSession.create({ data: { shopId, cashierId, openingBalance } });
  }

  static async closeSession(id: string, closingBalance: number) {
    const session = await prisma.pOSSession.findUnique({ where: { id }, include: { orders: true } });
    if (!session) throw ApiError.notFound('Session not found');
    const totalSales = session.orders.filter(o => o.status === 'COMPLETED').reduce((sum, o) => sum + o.totalAmount, 0);
    return prisma.pOSSession.update({ where: { id }, data: { status: 'CLOSED', closedAt: new Date(), closingBalance, totalSales } });
  }

  static async getSessions(shopId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.pOSSession.findMany({ where: { shopId }, skip, take: limit, include: { cashier: { select: { id: true, name: true } }, _count: { select: { orders: true } } }, orderBy: { openedAt: 'desc' } }),
      prisma.pOSSession.count({ where: { shopId } }),
    ]);
    return { items, total, page, limit };
  }

  static async getSession(id: string) {
    const session = await prisma.pOSSession.findUnique({ where: { id }, include: { cashier: { select: { id: true, name: true } }, orders: { include: { order: { select: { id: true, orderNumber: true, grandTotal: true } } } } } });
    if (!session) throw ApiError.notFound('Session not found');
    return session;
  }

  static async createOrder(sessionId: string, data: any) {
    const session = await prisma.pOSSession.findUnique({ where: { id: sessionId } });
    if (!session || session.status !== 'OPEN') throw ApiError.badRequest('Session is not open');
    const orderNumber = `POS-${Date.now()}`;
    return prisma.pOSOrder.create({ data: { sessionId, orderNumber, ...data } });
  }

  static async getOrders(sessionId: string) {
    return prisma.pOSOrder.findMany({ where: { sessionId }, orderBy: { createdAt: 'desc' } });
  }
}
