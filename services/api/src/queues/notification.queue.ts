import Redis from 'ioredis';
import { Queue, Worker } from 'bullmq';
import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import logger from '../utils/logger';
import socketService from '../services/SocketService';
import { config } from '../config';

const QUEUE_NAME = 'mufasal-notifications';

export interface NotificationJobPayload {
  userId: string;
  type: string;
  data: {
    title: string;
    titleAr?: string;
    body?: string;
    bodyAr?: string;
    data?: Record<string, string>;
  };
}

let redisClient: Redis | null = null;
let notificationQueue: Queue | null = null;
let notificationWorker: Worker | null = null;
let queueReady = false;

function getRedis(): Redis {
  if (!redisClient) {
    redisClient = new Redis(config.redis.url, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
      retryStrategy: (times) => Math.min(times * 200, 5000),
    });
    redisClient.on('error', () => {});
  }
  return redisClient;
}

/** تنفيذ الإشعار فعلياً (DB + Socket) — يُستدعى من الـ Worker أو كاحتياطي */
export async function processNotificationJob(payload: NotificationJobPayload) {
  const { userId, type, data } = payload;
  const notification = await prisma.notification.create({
    data: {
      userId,
      type: type as 'ORDER_UPDATE' | 'PAYMENT_UPDATE' | 'DELIVERY_UPDATE' | 'PROMOTION' | 'SYSTEM' | 'CHAT_MESSAGE',
      title: data.title,
      titleAr: data.titleAr,
      body: data.body,
      bodyAr: data.bodyAr,
      data: data.data as unknown as Prisma.InputJsonValue,
    },
  });
  socketService.emitNotification(userId, notification);
  return notification;
}

export async function enqueueNotification(payload: NotificationJobPayload) {
  if (queueReady && notificationQueue) {
    try {
      await notificationQueue.add('send-notification', payload, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      });
      return;
    } catch (err) {
      logger.warn('Notification queue add failed, processing inline', err);
    }
  }
  await processNotificationJob(payload);
}

export async function startNotificationWorker() {
  const redis = getRedis();
  try {
    await redis.ping();
    queueReady = true;
  } catch {
    logger.warn('Redis unavailable — notifications will run inline (no BullMQ)');
    return;
  }

  notificationQueue = new Queue(QUEUE_NAME, { connection: redis as any });

  notificationWorker = new Worker(
    QUEUE_NAME,
    async (job) => {
      if (job.name === 'send-notification') {
        await processNotificationJob(job.data as NotificationJobPayload);
      }
    },
    { connection: redis as any, concurrency: 20 },
  );

  notificationWorker.on('failed', (job, err) => {
    logger.error(`Notification job ${job?.id} failed`, err);
  });

  logger.info('Notification BullMQ worker started');
}

export async function stopNotificationWorker() {
  await notificationWorker?.close();
  await notificationQueue?.close();
  await redisClient?.quit();
  notificationWorker = null;
  notificationQueue = null;
  redisClient = null;
  queueReady = false;
}
