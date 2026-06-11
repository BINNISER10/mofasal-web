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
      maxHttpBufferSize: 1e6,
    });

    this.io.use((socket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }
      try {
        const decoded = jwt.verify(token as string, config.jwt.secret) as { userId: string; role: string; shopId?: string };
        (socket as any).userId = decoded.userId;
        (socket as any).role = decoded.role;
        (socket as any).shopId = decoded.shopId;
        next();
      } catch {
        next(new Error('Invalid token'));
      }
    });

    this.io.on('connection', (socket: Socket) => {
      const userId = (socket as any).userId;
      const role = (socket as any).role;
      const shopId = (socket as any).shopId;

      socket.join(`user:${userId}`);
      if (shopId) socket.join(`shop:${shopId}`);
      logger.debug(`Socket connected: user ${userId} role ${role}`);

      if (['TAILOR_SHOP', 'STAFF', 'ADMIN', 'CASHIER'].includes(role)) {
        socket.join(`staff`);
      }
      if (shopId) {
        socket.join(`shop:${shopId}`);
        socket.join(`shop:${shopId}:staff`);
      }

      // Order tracking
      socket.on('join:order', (orderId: string) => {
        socket.join(`order:${orderId}`);
      });

      socket.on('leave:order', (orderId: string) => {
        socket.leave(`order:${orderId}`);
      });

      // Shop rooms
      socket.on('join:shop', (shopId: string) => {
        socket.join(`shop:${shopId}`);
      });

      socket.on('leave:shop', (shopId: string) => {
        socket.leave(`shop:${shopId}`);
      });

      // Inventory tracking
      socket.on('join:inventory', (shopId: string) => {
        socket.join(`inventory:${shopId}`);
      });

      socket.on('leave:inventory', (shopId: string) => {
        socket.leave(`inventory:${shopId}`);
      });

      // HR room
      socket.on('join:hr', (shopId: string) => {
        socket.join(`hr:${shopId}`);
      });

      socket.on('leave:hr', (shopId: string) => {
        socket.leave(`hr:${shopId}`);
      });

      // POS session tracking
      socket.on('join:pos', (shopId: string) => {
        socket.join(`pos:${shopId}`);
      });

      socket.on('leave:pos', (shopId: string) => {
        socket.leave(`pos:${shopId}`);
      });

      // Driver location tracking
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

  // ─── User events ───
  emitToUser(userId: string, event: string, data: unknown): void {
    this.io?.to(`user:${userId}`).emit(event, data);
  }

  // ─── Order events ───
  emitToOrder(orderId: string, event: string, data: unknown): void {
    this.io?.to(`order:${orderId}`).emit(event, data);
  }

  // ─── Shop events ───
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

  // ─── Inventory events ───
  emitInventoryUpdate(shopId: string, productId: string, data: { quantity: number; lowStock?: boolean }): void {
    this.io?.to(`inventory:${shopId}`).emit('inventory:update', { productId, ...data, timestamp: new Date().toISOString() });
    this.io?.to(`shop:${shopId}`).emit('inventory:update', { productId, ...data });
  }

  emitLowStockAlert(shopId: string, productId: string, productName: string, quantity: number): void {
    const alert = { productId, productName, quantity, timestamp: new Date().toISOString() };
    this.io?.to(`inventory:${shopId}`).emit('inventory:lowStock', alert);
    this.io?.to(`shop:${shopId}:staff`).emit('inventory:lowStock', alert);
    this.io?.to('staff').emit('inventory:lowStock', alert);
  }

  // ─── HR events ───
  emitEmployeeUpdate(shopId: string, action: string, data: unknown): void {
    this.io?.to(`hr:${shopId}`).emit('hr:employee', { action, ...(data as any), timestamp: new Date().toISOString() });
  }

  emitAttendanceUpdate(shopId: string, data: { employeeId: string; employeeName: string; action: string; time: string }): void {
    this.io?.to(`hr:${shopId}`).emit('hr:attendance', { ...data, timestamp: new Date().toISOString() });
  }

  emitLeaveUpdate(shopId: string, data: { employeeId: string; employeeName: string; status: string; leaveId: string }): void {
    this.io?.to(`hr:${shopId}`).emit('hr:leave', { ...data, timestamp: new Date().toISOString() });
  }

  // ─── POS events ───
  emitPOSSessionUpdate(shopId: string, sessionId: string, status: string, data?: unknown): void {
    this.io?.to(`pos:${shopId}`).emit('pos:session', { sessionId, status, ...(data as any), timestamp: new Date().toISOString() });
  }

  emitPOSOrderCreated(shopId: string, sessionId: string, orderId: string, data?: unknown): void {
    this.io?.to(`pos:${shopId}`).emit('pos:order', { sessionId, orderId, action: 'created', ...(data as any), timestamp: new Date().toISOString() });
  }

  // ─── Notification events ───
  emitNotification(userId: string, notification: unknown): void {
    this.emitToUser(userId, 'notification', notification);
  }

  emitBroadcast(event: string, data: unknown): void {
    this.io?.emit(event, data);
  }

  // ─── Message events ───
  emitMessage(conversationId: string, orderId: string, message: unknown): void {
    this.emitToOrder(orderId, 'message:new', { conversationId, orderId, ...(message as any) });
  }

  getIO(): Server | null {
    return this.io;
  }
}

export const socketService = new SocketService();
export default socketService;
