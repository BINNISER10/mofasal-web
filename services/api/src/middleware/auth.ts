import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { ApiError } from '../utils/ApiError';
import prisma from '../config/database';
import { resolvePermissions } from '../config/permissions';

export interface JwtPayload {
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: JwtPayload & {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    status: string;
    shopId?: string;
    avatar?: string;
  };
}

export const authenticate = async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { role: { select: { name: true } } },
    });

    if (!user) throw ApiError.unauthorized('User not found');
    if (user.status !== 'ACTIVE') throw ApiError.forbidden('Account is not active');

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email || '',
      phone: user.phone || undefined,
      role: user.role.name,
      status: user.status,
      shopId: user.shopId || undefined,
      avatar: user.avatar || undefined,
      userId: user.id,
    };
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(ApiError.unauthorized('Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(ApiError.unauthorized('Token expired'));
    } else {
      next(error);
    }
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('Insufficient permissions'));
    }
    next();
  };
};

export const requirePermission = (...permissions: string[]) => {
  return async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN') {
      return next();
    }
    try {
      const role = await prisma.role.findFirst({
        where: {
          name: req.user.role,
          ...(req.user.shopId ? { shopId: req.user.shopId } : {}),
        },
        select: { permissions: true },
      });
      // DB permissions override, with code-level defaults as a safe fallback
      // so a legitimate role is never locked out before permissions are seeded.
      const perms = resolvePermissions(req.user.role, role?.permissions as Record<string, unknown>);
      if (perms.all === true || permissions.some((p) => perms[p] === true)) {
        return next();
      }
      return next(ApiError.forbidden('Insufficient permissions'));
    } catch (error) {
      next(error);
    }
  };
};

export const optionalAuth = async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { role: { select: { name: true } } },
    });
    if (user && user.status === 'ACTIVE') {
      req.user = {
        id: user.id,
        name: user.name,
        email: user.email || '',
        phone: user.phone || undefined,
        role: user.role.name,
        status: user.status,
      shopId: user.shopId || undefined,
        avatar: user.avatar || undefined,
        userId: user.id,
      };
    }
    next();
  } catch {
    next();
  }
};
