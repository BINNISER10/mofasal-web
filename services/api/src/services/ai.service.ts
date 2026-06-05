import Redis from 'ioredis';
import { Queue, Worker } from 'bullmq';
import { AIFactory } from './ai/ai.factory';
import crypto from 'crypto';
import logger from '../utils/logger';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const REDIS_CONNECT_TIMEOUT = 3000;

function createRedisClient(label: string): Redis {
  const client = new Redis(REDIS_URL, {
    connectTimeout: REDIS_CONNECT_TIMEOUT,
    retryStrategy: (times) => Math.min(times * 200, 5000),
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
  });
  client.on('error', (err) => {
    if (times === 1) console.warn(`[Redis:${label}] Connection failed — running without cache`);
  });
  let times = 0;
  client.on('connect', () => { times++; });
  return client;
}

const redisClient = createRedisClient('ai');
export const aiBehaviorQueue = new Queue('ai-behavior-tasks', { connection: redisClient });

let redisAvailable = false;
redisClient.ping().then(() => { redisAvailable = true; }).catch(() => {});

export class MufasalOmniAI {
  static async processRequest(shopId: string, providerName: string, apiKey: string | null, prompt: string) {
    const cacheKey = `ai_cache:${crypto.createHash('sha256').update(prompt + providerName).digest('hex')}`;

    if (redisAvailable) {
      try {
        const cached = await redisClient.get(cacheKey);
        if (cached) return cached;
      } catch { /* cache miss */ }
    }

    const aiProvider = AIFactory.getProvider(providerName, apiKey || undefined);
    const response = await aiProvider.generateResponse(prompt);

    if (redisAvailable) {
      try {
        await redisClient.set(cacheKey, response, 'EX', 86400);
      } catch { /* cache write failed */ }
    }

    return response;
  }

  static async logBehavior(shopId: string, userId: string, actionType: string, actionData: Record<string, unknown>) {
    if (!redisAvailable) return;
    try {
      await aiBehaviorQueue.add('analyze-behavior', { shopId, userId, actionType, actionData }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
      });
    } catch { /* queue unavailable */ }
  }
}

if (redisAvailable) {
  const aiWorker = new Worker('ai-behavior-tasks', async job => {
    if (job.name === 'analyze-behavior') {
      const { shopId, userId, actionType, actionData } = job.data;
      try {
        const { provider, name } = await AIFactory.getAvailableProvider();
        const prompt = `المستخدم ${userId} قام بإجراء ${actionType} بتفاصيل ${JSON.stringify(actionData)}. استنتج نمط سلوكه في جملة واحدة.`;
        const insight = await provider.generateResponse(prompt);
        logger.info(`[Behavior AI:${name}] User ${userId}: ${insight}`);
      } catch (err: any) {
        logger.warn(`[Behavior AI] Failed for user ${userId}: ${err?.message}`);
      }
    }
  }, { connection: redisClient, concurrency: 10 });
}
