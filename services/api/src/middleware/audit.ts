import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import prisma from '../config/database';

interface AuditOptions {
  action: string;
  entity: string;
  getEntityId?: (req: AuthRequest) => string | undefined;
  getOldValues?: (req: AuthRequest) => Record<string, unknown> | undefined;
  getNewValues?: (req: AuthRequest) => Record<string, unknown> | undefined;
}

export const auditLog = (options: AuditOptions) => {
  return async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
    const originalJson = _res.json.bind(_res);
    _res.json = function (body: unknown) {
      if (_res.statusCode < 400) {
        prisma.auditLog.create({
          data: {
            userId: req.user?.id,
            action: options.action,
            entity: options.entity,
            entityId: options.getEntityId ? options.getEntityId(req) : undefined,
            oldValues: options.getOldValues ? options.getOldValues(req) as any : undefined,
            newValues: options.getNewValues ? options.getNewValues(req) as any : undefined,
            ipAddress: req.ip || req.socket.remoteAddress,
            userAgent: req.headers['user-agent'],
          },
        }).catch(() => {});
      }
      return originalJson(body);
    };
    next();
  };
};

export const createAuditLog = async (
  userId: string | undefined,
  action: string,
  entity: string,
  entityId?: string,
  oldValues?: Record<string, unknown>,
  newValues?: Record<string, unknown>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        oldValues: oldValues as any,
        newValues: newValues as any,
        ipAddress,
        userAgent,
      },
    });
  } catch {
    // silently fail
  }
};
