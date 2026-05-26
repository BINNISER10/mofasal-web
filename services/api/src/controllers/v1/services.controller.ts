import { Response, NextFunction } from 'express';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/auth';
import { sendSuccess, sendCreated } from '../../utils/response';
import { ApiError } from '../../utils/ApiError';

export class ServiceRequestController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = { ...req.body, customerId: req.user!.id, status: 'PENDING' };
      const service = await prisma.serviceRequest.create({ data });
      sendCreated(res, service, 'Service request created');
    } catch (error) { next(error); }
  }

  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const where: any = {};
      if (req.user!.role === 'CUSTOMER') where.customerId = req.user!.id;
      const services = await prisma.serviceRequest.findMany({
        where,
        include: { shop: { select: { id: true, name: true, logo: true } } },
        orderBy: { createdAt: 'desc' },
      });
      sendSuccess(res, services);
    } catch (error) { next(error); }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const service = await prisma.serviceRequest.findUnique({
        where: { id: req.params.id },
        include: { shop: true, customer: { select: { id: true, name: true, phone: true } } },
      });
      if (!service) throw ApiError.notFound('Service request not found');
      sendSuccess(res, service);
    } catch (error) { next(error); }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const service = await prisma.serviceRequest.findUnique({ where: { id: req.params.id } });
      if (!service) throw ApiError.notFound('Service request not found');
      const updated = await prisma.serviceRequest.update({ where: { id: req.params.id }, data: req.body });
      sendSuccess(res, updated, 'Service request updated');
    } catch (error) { next(error); }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await prisma.serviceRequest.delete({ where: { id: req.params.id } });
      sendSuccess(res, null, 'Service request deleted');
    } catch (error) { next(error); }
  }
}
