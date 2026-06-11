import { Response, NextFunction } from 'express';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/auth';
import { sendSuccess, sendPaginated } from '../../utils/response';
import { ApiError } from '../../utils/ApiError';
import { ConfigService } from '../../services/ConfigService';

interface AdminUserWhereClause {
  role?: { name: string };
  status?: string;
  OR?: object[];
}

interface AdminOrderWhereClause {
  createdAt?: { gte?: Date; lte?: Date };
  shopId?: string;
  paymentStatus?: string;
}

interface AuditLogWhereClause {
  entity?: string;
  action?: string;
}

export class AdminController {
  static async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const [totalUsers, totalShops, totalOrders, totalRevenue, ordersByStatus, recentOrders] = await Promise.all([
        prisma.user.count(),
        prisma.shop.count(),
        prisma.order.count(),
        prisma.order.aggregate({ where: { paymentStatus: 'PAID' }, _sum: { grandTotal: true } }),
        prisma.order.groupBy({ by: ['status'], _count: true }),
        prisma.order.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { customer: { select: { name: true } }, shop: { select: { name: true } } } }),
      ]);

      sendSuccess(res, {
        totalUsers, totalShops, totalOrders,
        totalRevenue: totalRevenue._sum.grandTotal || 0,
        ordersByStatus, recentOrders,
      });
    } catch (error) { next(error); }
  }

  static async getUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, role, status, search } = req.query;
      const p = page ? parseInt(page as string) : 1;
      const l = limit ? parseInt(limit as string) : 20;
      const where: AdminUserWhereClause = {};
      if (role) where.role = { name: role as string };
      if (status) where.status = status as string;
      if (search) where.OR = [{ name: { contains: search as string, mode: 'insensitive' } }, { phone: { contains: search as string } }];

      const [users, total] = await Promise.all([
        prisma.user.findMany({ where, skip: (p - 1) * l, take: l, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, phone: true, email: true, role: { select: { name: true } }, status: true, createdAt: true } }),
        prisma.user.count({ where }),
      ]);
      const mapped = users.map((u) => ({ ...u, role: u.role.name }));
      sendPaginated(res, mapped, total, p, l);
    } catch (error) { next(error); }
  }

  static async updateUserStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await prisma.user.update({ where: { id: req.params.id }, data: { status: req.body.status as 'ACTIVE' | 'INACTIVE' | 'BANNED' } });
      sendSuccess(res, { id: user.id, status: user.status }, 'User status updated');
    } catch (error) { next(error); }
  }

  static async getConfigs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { category } = req.query;
      const configs = category ? await ConfigService.getConfigsByCategory(category as string) : await ConfigService.getAllConfigs();
      sendSuccess(res, configs);
    } catch (error) { next(error); }
  }

  static async getConfig(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const config = await ConfigService.getConfig(req.params.key);
      sendSuccess(res, config);
    } catch (error) { next(error); }
  }

  static async updateConfig(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const config = await ConfigService.setConfig(req.params.key, req.body.value, req.body);
      sendSuccess(res, config, 'Config updated');
    } catch (error) { next(error); }
  }

  static async deleteConfig(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await ConfigService.deleteConfig(req.params.key);
      sendSuccess(res, result);
    } catch (error) { next(error); }
  }

  static async toggleConfig(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const config = await ConfigService.toggleConfig(req.params.key);
      sendSuccess(res, config, 'Config toggled');
    } catch (error) { next(error); }
  }

  static async getModules(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const modules = await ConfigService.getModules();
      sendSuccess(res, modules);
    } catch (error) { next(error); }
  }

  static async createModule(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const module_ = await prisma.systemModule.create({ data: req.body });
      sendSuccess(res, module_, 'Module created');
    } catch (error) { next(error); }
  }

  static async updateModule(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const module_ = await prisma.systemModule.update({ where: { key: req.params.key }, data: req.body });
      sendSuccess(res, module_, 'Module updated');
    } catch (error) { next(error); }
  }

  static async toggleModule(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const module_ = await ConfigService.toggleModule(req.params.key, req.body.enabled);
      sendSuccess(res, module_, 'Module toggled');
    } catch (error) { next(error); }
  }

  static async getOrderReports(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, shopId } = req.query;
      const where: AdminOrderWhereClause = {};
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate as string);
        if (endDate) where.createdAt.lte = new Date(endDate as string);
      }
      if (shopId) where.shopId = shopId as string;

      const orders = await prisma.order.findMany({ where, orderBy: { createdAt: 'desc' } });
      sendSuccess(res, orders);
    } catch (error) { next(error); }
  }

  static async getRevenueReports(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, groupBy } = req.query;
      const where: AdminOrderWhereClause = { paymentStatus: 'PAID' };
      if (startDate) where.createdAt = { gte: new Date(startDate as string) };
      if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate as string) };

      const [totalRevenue, byMethod, byDay] = await Promise.all([
        prisma.order.aggregate({ where, _sum: { grandTotal: true }, _count: true }),
        prisma.order.groupBy({ by: ['paymentMethod'], where, _sum: { grandTotal: true }, _count: true }),
        prisma.order.findMany({ where, select: { grandTotal: true, createdAt: true }, orderBy: { createdAt: 'asc' } }),
      ]);

      sendSuccess(res, {
        totalRevenue: totalRevenue._sum.grandTotal || 0,
        totalOrders: totalRevenue._count,
        byPaymentMethod: byMethod,
        trend: byDay,
      });
    } catch (error) { next(error); }
  }

  static async getShopReports(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const shops = await prisma.shop.findMany({
        select: {
          id: true, name: true, city: true, rating: true, orderCount: true, isOpen: true,
          _count: { select: { orders: true, users: true } },
        },
        orderBy: { orderCount: 'desc' },
      });
      sendSuccess(res, shops);
    } catch (error) { next(error); }
  }

  static async getAuditLogs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, entity, action } = req.query;
      const p = page ? parseInt(page as string) : 1;
      const l = limit ? parseInt(limit as string) : 50;
      const where: AuditLogWhereClause = {};
      if (entity) where.entity = entity as string;
      if (action) where.action = action as string;

      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where, skip: (p - 1) * l, take: l,
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.auditLog.count({ where }),
      ]);
      sendPaginated(res, logs, total, p, l);
    } catch (error) { next(error); }
  }

  static async getCommissions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const shops = await prisma.shop.findMany({
        select: {
          id: true,
          name: true,
          nameAr: true,
          commissionRate: true,
          orderCount: true,
          rating: true,
          isOpen: true,
        },
        orderBy: { orderCount: 'desc' },
      });

      const commissions = shops.map((shop) => ({
        id: shop.id,
        name: shop.nameAr || shop.name,
        rate: Math.round((shop.commissionRate || 0.1) * 100),
        ordersCount: shop.orderCount || 0,
        earned: Math.round((shop.orderCount || 0) * 100 * (shop.commissionRate || 0.1)),
        tier: (shop.orderCount || 0) >= 50 ? 'gold' : (shop.orderCount || 0) >= 20 ? 'silver' : 'bronze',
        isOpen: shop.isOpen,
      }));

      sendSuccess(res, commissions);
    } catch (error) { next(error); }
  }

  static async updateCommission(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { shopId } = req.params;
      const { rate } = req.body;
      if (typeof rate !== 'number' || rate < 0 || rate > 100) {
        throw ApiError.badRequest('Rate must be between 0 and 100');
      }

      const shop = await prisma.shop.update({
        where: { id: shopId },
        data: { commissionRate: rate / 100 },
      });

      sendSuccess(res, { id: shop.id, rate }, 'Commission rate updated');
    } catch (error) { next(error); }
  }
}
