import redisService from './RedisService';

export const CACHE_TTL = {
  PRODUCTS: 300,
  CATEGORIES: 600,
  SHOPS: 300,
  USERS: 1800,
  ORDERS: 120,
  SETTINGS: 3600,
};

export class CacheService {
  static async getOrSet<T>(key: string, fetchFn: () => Promise<T>, ttl: number = 300): Promise<T> {
    const cached = await redisService.getJSON<T>(key);
    if (cached) return cached;
    const data = await fetchFn();
    await redisService.setJSON(key, data, ttl);
    return data;
  }

  static async invalidate(pattern: string): Promise<void> {
    await redisService.invalidate(pattern);
  }

  static async invalidateMany(patterns: string[]): Promise<void> {
    await Promise.all(patterns.map(p => redisService.invalidate(p)));
  }

  static buildKey(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}:${parts.join(':')}`;
  }
}
