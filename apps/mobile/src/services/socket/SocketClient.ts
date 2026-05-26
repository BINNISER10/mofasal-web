import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../api/config';
import { getAuthToken } from '../api/client';

type EventHandler = (...args: unknown[]) => void;

class SocketClient {
  private socket: Socket | null = null;
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private isConnected = false;

  async connect(): Promise<void> {
    if (this.socket?.connected) return;

    const token = await getAuthToken();

    this.socket = io(API_BASE_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 3000,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    this.socket.on('order:update', (data: unknown) => {
      this.emit('order:update', data);
    });

    this.socket.on('order:tracking', (data: unknown) => {
      this.emit('order:tracking', data);
    });

    this.socket.on('delivery:update', (data: unknown) => {
      this.emit('delivery:update', data);
    });

    this.socket.on('notification:new', (data: unknown) => {
      this.emit('notification:new', data);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
  }

  on(event: string, handler: EventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);

    if (this.socket) {
      this.socket.on(event, handler);
    }
  }

  off(event: string, handler: EventHandler): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
    if (this.socket) {
      this.socket.off(event, handler);
    }
  }

  private emit(event: string, data: unknown): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }
  }

  joinOrderRoom(orderId: string): void {
    this.socket?.emit('order:join', { orderId });
  }

  leaveOrderRoom(orderId: string): void {
    this.socket?.emit('order:leave', { orderId });
  }

  get connected(): boolean {
    return this.isConnected;
  }
}

export const socketClient = new SocketClient();
export default socketClient;
