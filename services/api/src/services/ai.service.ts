import Redis from 'ioredis';
import { Queue, Worker } from 'bullmq';
import { AIFactory } from './ai/ai.factory';
import crypto from 'crypto';

const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
export const aiBehaviorQueue = new Queue('ai-behavior-tasks', { connection: redisClient });

export class MufasalOmniAI {
  static async processRequest(shopId: string, providerName: string, apiKey: string | null, prompt: string) {
    const cacheKey = `ai_cache:${crypto.createHash('sha256').update(prompt + providerName).digest('hex')}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) return cached;

    const aiProvider = AIFactory.getProvider(providerName, apiKey || undefined);
    const response = await aiProvider.generateResponse(prompt);
    await redisClient.set(cacheKey, response, 'EX', 86400);
    return response;
  }

  static async logBehavior(shopId: string, userId: string, actionType: string, actionData: any) {
    await aiBehaviorQueue.add('analyze-behavior', { shopId, userId, actionType, actionData }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });
  }
}

const aiWorker = new Worker('ai-behavior-tasks', async job => {
  if (job.name === 'analyze-behavior') {
    const { shopId, userId, actionType, actionData } = job.data;
    const aiProvider = AIFactory.getProvider('gemini');
    const prompt = `المستخدم ${userId} قام بإجراء ${actionType} بتفاصيل ${JSON.stringify(actionData)}. استنتج نمط سلوكه في جملة واحدة.`;
    const insight = await aiProvider.generateResponse(prompt);
    console.log(`[Behavior AI] User ${userId}: ${insight}`);
  }
}, { connection: redisClient, concurrency: 10 });
