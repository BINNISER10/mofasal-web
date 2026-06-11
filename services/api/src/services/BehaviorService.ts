import prisma from '../config/database';
import logger from '../utils/logger';
import { MufasalOmniAI } from './ai.service';

type ActionType =
  | 'VIEW_SHOP'
  | 'VIEW_PRODUCT'
  | 'ADD_TO_CART'
  | 'REMOVE_FROM_CART'
  | 'SEARCH'
  | 'FILTER'
  | 'BOOKMARK'
  | 'RATE_SHOP'
  | 'RATE_PRODUCT'
  | 'PLACE_ORDER'
  | 'CANCEL_ORDER'
  | 'CONTACT_SHOP'
  | 'SHARE';

interface BehaviorData {
  shopId?: string;
  productId?: string;
  categoryId?: string;
  searchQuery?: string;
  filterOptions?: Record<string, any>;
  rating?: number;
  orderId?: string;
  value?: number;
  metadata?: Record<string, any>;
}

/**
 * خدمة تسجيل وتحليل سلوك المستخدم
 * تستخدم لبناء ملف شخصي ذكي وتحسين التوصيات
 */
export class BehaviorService {
  /**
   * تسجيل إجراء سلوكي للمستخدم
   */
  static async logBehavior(
    userId: string,
    actionType: ActionType,
    actionData: BehaviorData
  ): Promise<void> {
    try {
      // تسجيل في قاعدة البيانات
      await prisma.userBehaviorLog.create({
        data: {
          userId,
          actionType,
          actionData: actionData as any,
          timestamp: new Date(),
        },
      });

      // إرسال للتحليل عبر AI (غير متزامن)
      const shopId = actionData.shopId || 'system';
      await MufasalOmniAI.logBehavior(shopId, userId, actionType, actionData as Record<string, unknown>);

      logger.debug(`[Behavior] Logged ${actionType} for user ${userId}`);
    } catch (error) {
      logger.error(`[Behavior] Failed to log action for user ${userId}:`, error);
    }
  }

  /**
   * الحصول على سجل سلوك المستخدم
   */
  static async getUserBehaviorHistory(
    userId: string,
    limit = 100
  ): Promise<any[]> {
    try {
      const logs = await prisma.userBehaviorLog.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: limit,
      });
      return logs;
    } catch (error) {
      logger.error(`[Behavior] Failed to fetch history for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * تحليل سلوك المستخدم واستخراج الأنماط
   */
  static async analyzeUserPatterns(userId: string): Promise<{
    topCategories: string[];
    topShops: string[];
    categoryCounts: Record<string, number>;
    shopCounts: Record<string, number>;
    avgOrderValue: number;
    preferredPriceRange: { min: number; max: number };
    activityLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  }> {
    try {
      const logs = await prisma.userBehaviorLog.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: 500,
      });

      const categoryCounts: Record<string, number> = {};
      const shopCounts: Record<string, number> = {};
      const orderValues: number[] = [];

      for (const log of logs) {
        const data = log.actionData as any;

        // تتبع الفئات
        if (data.categoryId) {
          categoryCounts[data.categoryId] = (categoryCounts[data.categoryId] || 0) + 1;
        }

        // تتبع المتاجر
        if (data.shopId) {
          shopCounts[data.shopId] = (shopCounts[data.shopId] || 0) + 1;
        }

        // تتبع قيم الطلبات
        if (log.actionType === 'PLACE_ORDER' && data.value) {
          orderValues.push(data.value);
        }
      }

      // استخراج الفئات الأكثر شيوعاً
      const topCategories = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id]) => id);

      // استخراج المتاجر الأكثر زيارة
      const topShops = Object.entries(shopCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id]) => id);

      // حساب متوسط قيمة الطلب
      const avgOrderValue =
        orderValues.length > 0
          ? orderValues.reduce((a, b) => a + b, 0) / orderValues.length
          : 0;

      // تحديد نطاق السعر المفضل
      const preferredPriceRange =
        orderValues.length > 0
          ? {
              min: Math.min(...orderValues),
              max: Math.max(...orderValues),
            }
          : { min: 0, max: 0 };

      // تحديد مستوى النشاط
      const activityLevel =
        logs.length > 50 ? 'HIGH' : logs.length > 20 ? 'MEDIUM' : 'LOW';

      return {
        topCategories,
        topShops,
        categoryCounts,
        shopCounts,
        avgOrderValue,
        preferredPriceRange,
        activityLevel,
      };
    } catch (error) {
      logger.error(`[Behavior] Failed to analyze patterns for user ${userId}:`, error);
      return {
        topCategories: [],
        topShops: [],
        categoryCounts: {},
        shopCounts: {},
        avgOrderValue: 0,
        preferredPriceRange: { min: 0, max: 0 },
        activityLevel: 'LOW',
      };
    }
  }

  /**
   * تحديث ملف AI الشخصي للمستخدم
   */
  static async updateAIProfile(userId: string): Promise<void> {
    try {
      const patterns = await this.analyzeUserPatterns(userId);

      // تحديث أو إنشاء ملف AI
      const existingProfile = await prisma.aIProfile.findUnique({
        where: { userId },
      });

      const preferences = {
        topCategories: patterns.topCategories,
        topShops: patterns.topShops,
        categoryCounts: patterns.categoryCounts,
        shopCounts: patterns.shopCounts,
        avgOrderValue: patterns.avgOrderValue,
        preferredPriceRange: patterns.preferredPriceRange,
        activityLevel: patterns.activityLevel,
      };

      if (existingProfile) {
        await prisma.aIProfile.update({
          where: { userId },
          data: {
            preferences,
            lastUpdated: new Date(),
          },
        });
      } else {
        await prisma.aIProfile.create({
          data: {
            userId,
            preferences,
            insights: 'Profile created from behavior analysis',
            lastUpdated: new Date(),
          },
        });
      }

      logger.info(`[Behavior] AI profile updated for user ${userId}`);
    } catch (error) {
      logger.error(`[Behavior] Failed to update AI profile for user ${userId}:`, error);
    }
  }

  /**
   * تنظيف السجلات القديمة (للحفاظ على الأداء)
   */
  static async cleanupOldLogs(daysToKeep = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await prisma.userBehaviorLog.deleteMany({
        where: {
          timestamp: {
            lt: cutoffDate,
          },
        },
      });

      logger.info(`[Behavior] Cleaned up ${result.count} old behavior logs`);
      return result.count;
    } catch (error) {
      logger.error('[Behavior] Failed to cleanup old logs:', error);
      return 0;
    }
  }

  /**
   * الحصول على إحصائيات سلوك المستخدم
   */
  static async getUserStats(userId: string): Promise<{
    totalActions: number;
    actionsByType: Record<string, number>;
    mostActiveDay: string;
    avgDailyActions: number;
  }> {
    try {
      const logs = await prisma.userBehaviorLog.findMany({
        where: { userId },
        select: { actionType: true, timestamp: true },
      });

      const actionsByType: Record<string, number> = {};
      const actionsByDay: Record<string, number> = {};

      for (const log of logs) {
        actionsByType[log.actionType] = (actionsByType[log.actionType] || 0) + 1;

        const dayKey = log.timestamp.toISOString().split('T')[0];
        actionsByDay[dayKey] = (actionsByDay[dayKey] || 0) + 1;
      }

      const mostActiveDay = Object.entries(actionsByDay)
        .sort((a, b) => b[1] - a[1])
        .map(([day]) => day)[0] || '';

      const uniqueDays = Object.keys(actionsByDay).length;
      const avgDailyActions = uniqueDays > 0 ? logs.length / uniqueDays : 0;

      return {
        totalActions: logs.length,
        actionsByType,
        mostActiveDay,
        avgDailyActions: Math.round(avgDailyActions * 10) / 10,
      };
    } catch (error) {
      logger.error(`[Behavior] Failed to get stats for user ${userId}:`, error);
      return {
        totalActions: 0,
        actionsByType: {},
        mostActiveDay: '',
        avgDailyActions: 0,
      };
    }
  }
}
