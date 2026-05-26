import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import logger from '../utils/logger';
import redisService from './RedisService';

class SocketService {
  private io: Server | null = null;

  initialize(httpServer: HttpServer): void {
    this.io = new Server(httpServer, {
      cors: {
        origin: config.cors.origin,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    this.io.use((socket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }
      try {
        const decoded = jwt.verify(token as string, config.jwt.secret) as { userId: string; role: string };
        (socket as any).userId = decoded.userId;
        (socket as any).role = decoded.role;
        next();
      } catch {
        next(new Error('Invalid token'));
      }
    });

    this.io.on('connection', (socket: Socket) => {
      const userId = (socket as any).userId;
      const role = (socket as any).role;

      socket.join(`user:${userId}`);
      logger.debug(`Socket connected: user ${userId}`);

      if (['TAILOR_SHOP', 'STAFF', 'ADMIN'].includes(role)) {
        socket.join(`staff`);
      }

      socket.on('join:order', (orderId: string) => {
        socket.join(`order:${orderId}`);
      });

      socket.on('leave:order', (orderId: string) => {
        socket.leave(`order:${orderId}`);
      });

      socket.on('join:shop', (shopId: string) => {
        socket.join(`shop:${shopId}`);
      });

      socket.on('leave:shop', (shopId: string) => {
        socket.leave(`shop:${shopId}`);
      });

      socket.on('tracking:driver', (data: { orderId: string; lat: number; lng: number; status: string }) => {
        socket.broadcast.to(`order:${data.orderId}`).emit('driver:location', {
          orderId: data.orderId,
          lat: data.lat,
          lng: data.lng,
          status: data.status,
          timestamp: new Date().toISOString(),
        });
      });

      socket.on('disconnect', () => {
        logger.debug(`Socket disconnected: user ${userId}`);
      });
    });

    logger.info('Socket.IO initialized');
  }

  emitToUser(userId: string, event: string, data: unknown): void {
    this.io?.to(`user:${userId}`).emit(event, data);
  }

  emitToOrder(orderId: string, event: string, data: unknown): void {
    this.io?.to(`order:${orderId}`).emit(event, data);
  }

  emitToShop(shopId: string, event: string, data: unknown): void {
    this.io?.to(`shop:${shopId}`).emit(event, data);
  }

  emitToStaff(event: string, data: unknown): void {
    this.io?.to('staff').emit(event, data);
  }

  emitOrderStatusUpdate(orderId: string, status: string, data?: unknown): void {
    this.emitToOrder(orderId, 'order:status', { orderId, status, ...(data as any), timestamp: new Date().toISOString() });
    this.emitToStaff('order:status', { orderId, status, ...(data as any) });
  }

  emitNewOrder(orderId: string, data: unknown): void {
    this.emitToStaff('order:new', { orderId, ...(data as any) });
  }

  emitTrackingUpdate(orderId: string, lat: number, lng: number, status: string): void {
    this.emitToOrder(orderId, 'tracking:update', { orderId, lat, lng, status, timestamp: new Date().toISOString() });
  }

  emitPaymentUpdate(orderId: string, status: string, data?: unknown): void {
    this.emitToOrder(orderId, 'payment:update', { orderId, status, ...(data as any) });
    this.emitToStaff('payment:update', { orderId, status, ...(data as any) });
  }

  emitNotification(userId: string, notification: unknown): void {
    this.emitToUser(userId, 'notification', notification);
  }

  emitMessage(conversationId: string, orderId: string, message: unknown): void {
    this.emitToOrder(orderId, 'message:new', { conversationId, orderId, ...(message as any) });
  }

  getIO(): Server | null {
    return this.io;
  }
}

export const socketService = new SocketService();
export default socketService;
