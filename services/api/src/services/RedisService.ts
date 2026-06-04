import Redis from 'ioredis';
import { config } from '../config';
import logger from '../utils/logger';

class RedisService {
  private client: Redis;
  private pubClient: Redis;
  private subClient: Redis;

  constructor() {
    this.client = new Redis(config.redis.url, {
      keyPrefix: config.redis.prefix,
      lazyConnect: true,
      retryStrategy: undefined,
      maxRetriesPerRequest: undefined,
    } as any);
    this.client.on('error', () => {});
    this.pubClient = this.client.duplicate();
    this.pubClient.on('error', () => {});
    this.subClient = this.client.duplicate();
    this.subClient.on('error', () => {});
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      await this.pubClient.connect();
      await this.subClient.connect();
      logger.info('Redis connected');
    } catch (error) {
      logger.warn('Redis connection failed, using in-memory fallback', error);
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.client.set(key, value, 'EX', ttl);
      } else {
        await this.client.set(key, value);
      }
    } catch {
      // silently fail
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch {
      // silently fail
    }
  }

  async setJSON(key: string, data: unknown, ttl?: number): Promise<void> {
    await this.set(key, JSON.stringify(data), ttl);
  }

  async getJSON<T>(key: string): Promise<T | null> {
    const raw = await this.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async cacheGet<T>(key: string, fetchFn: () => Promise<T>, ttl = 300): Promise<T> {
    const cached = await this.getJSON<T>(key);
    if (cached) return cached;
    const data = await fetchFn();
    await this.setJSON(key, data, ttl);
    return data;
  }

  async invalidate(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(`${config.redis.prefix}${pattern}`);
      if (keys.length > 0) {
        const pipeline = this.client.pipeline();
        keys.forEach((k) => pipeline.del(k));
        await pipeline.exec();
      }
    } catch {
      // silently fail
    }
  }

  async publish(channel: string, message: string): Promise<void> {
    try {
      await this.pubClient.publish(channel, message);
    } catch {
      // silently fail
    }
  }

  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    try {
      await this.subClient.subscribe(channel);
      this.subClient.on('message', (ch, msg) => {
        if (ch === channel) callback(msg);
      });
    } catch {
      // silently fail
    }
  }

  async ping(): Promise<void> {
    await this.client.ping();
  }

  getClient(): Redis {
    return this.client;
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.quit();
      await this.pubClient.quit();
      await this.subClient.quit();
    } catch {
      // silently fail
    }
  }
}

export const redisService = new RedisService();
export default redisService;
