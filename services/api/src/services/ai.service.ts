import Redis from 'ioredis';
import { Queue, Worker } from 'bullmq';
import { AIFactory } from './ai/ai.factory';
import crypto from 'crypto';
import prisma from '../config/database';

const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });
export const aiBehaviorQueue = new Queue('ai-behavior-tasks', { connection: redisClient as any });

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

async function aggregatePreferences(userId: string) {
  const logs = await prisma.userBehaviorLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 200,
    select: { actionType: true, actionData: true },
  });

  const categoryCounts: Record<string, number> = {};
  const shopCounts: Record<string, number> = {};
  const actionCounts: Record<string, number> = {};

  for (const log of logs) {
    actionCounts[log.actionType] = (actionCounts[log.actionType] || 0) + 1;
    const data = (log.actionData || {}) as Record<string, any>;
    if (data.categoryId) categoryCounts[data.categoryId] = (categoryCounts[data.categoryId] || 0) + 1;
    if (data.shopId) shopCounts[data.shopId] = (shopCounts[data.shopId] || 0) + 1;
  }

  const topN = (counts: Record<string, number>, n: number) =>
    Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k]) => k);

  return {
    categoryCounts,
    shopCounts,
    actionCounts,
    topCategories: topN(categoryCounts, 5),
    topShops: topN(shopCounts, 5),
    totalEvents: logs.length,
  };
}

const aiWorker = new Worker('ai-behavior-tasks', async job => {
  if (job.name === 'analyze-behavior') {
    const { userId, actionType, actionData } = job.data;
    if (!userId) return;

    // 1. Persist the raw behavior event (cheap, always runs).
    await prisma.userBehaviorLog.create({
      data: { userId, actionType, actionData: actionData || {} },
    });

    // 2. Recompute aggregated preferences deterministically.
    const preferences = await aggregatePreferences(userId);

    // 3. Generate an AI insight (resilient: never crash the worker if no API key / quota).
    let insight = '';
    try {
      const aiProvider = AIFactory.getProvider(process.env.AI_PROVIDER || 'gemini');
      const prompt = `بناءً على آخر ${preferences.totalEvents} تفاعلاً للمستخدم (أكثر الفئات: ${preferences.topCategories.join(', ') || 'لا يوجد'})، صف نمط تفضيلاته الشرائية في جملة عربية واحدة موجزة.`;
      insight = await aiProvider.generateResponse(prompt);
    } catch (err) {
      insight = `أكثر الفئات تفاعلاً: ${preferences.topCategories.join(', ') || 'غير محدد'}`;
    }

    // 4. Upsert the AI profile.
    await prisma.aIProfile.upsert({
      where: { userId },
      create: { userId, preferences: preferences as any, insights: insight, lastUpdated: new Date() },
      update: { preferences: preferences as any, insights: insight, lastUpdated: new Date() },
    });
  }
}, { connection: redisClient as any, concurrency: 10 });

aiWorker.on('failed', (job, err) => {
  console.error(`[Behavior AI] Job ${job?.id} failed: ${err.message}`);
});
