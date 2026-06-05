import prisma from '../config/database';
import { AIFactory } from './ai/ai.factory';
import logger from '../utils/logger';

interface AdvisorResponse {
  answer: string;
  suggestions?: string[];
  relatedProducts?: any[];
  confidence: number;
}

export class SmartAdvisorService {
  /**
   * مستشار ذكي يجيب على أسئلة العملاء حول:
   * - المقاسات والقياسات
   * - الأقمشة والمواد
   * - أنواع الخياطة
   * - العناية بالملابس
   * - الاقتراحات والتوصيات
   */
  static async ask(question: string, userId?: string, context?: Record<string, any>): Promise<AdvisorResponse> {
    try {
      // جلب سياق المستخدم
      let userContext = '';
      if (userId) {
        const profile = await prisma.aIProfile.findUnique({ where: { userId } });
        const preferences = (profile?.preferences as Record<string, any>) || {};
        const topCategories = preferences.topCategories || [];
        const topShops = preferences.topShops || [];

        if (topCategories.length > 0) {
          const categories = await prisma.category.findMany({
            where: { id: { in: topCategories } },
            select: { name: true, nameAr: true },
          });
          userContext += `العميل يفضل الفئات: ${categories.map((c) => c.nameAr || c.name).join(', ')}. `;
        }
      }

      // سياق إضافي
      if (context?.currentProduct) {
        userContext += `المنتج الحالي: ${context.currentProduct.name} (${context.currentProduct.price} ريال). `;
      }
      if (context?.currentShop) {
        userContext += `المتجر الحالي: ${context.currentShop.name}. `;
      }

      // بناء الـ prompt
      const systemPrompt = `أنت مساعد ذكي في منصة مُفصّل للخياطة السعودية. تخصصك:
- المقاسات والقياسات (صدر، خصر، كتف، كم، رقبة)
- الأقمشة والمواد (صوف، قطن، حرير، كتان، بوليستر)
- أنواع الخياطة (بدل رسمية، ثوب، بشت، قميص، شماغ)
- العناية بالملابس (غسل، كي، تخزين)
- نصائح الموضة والأناقة

أجب بالعربية الفصحى الواضحة. كن مختصراً ومفيداً. إذا كان السؤال خارج نطاق تخصصك، اعتذر بلطف.`;

      const prompt = `${systemPrompt}

${userContext ? `سياق العميل: ${userContext}` : ''}

سؤال العميل: ${question}

أجب بشكل مختصر ومفيد (حد أقصى 3 جمل).`;

      const { provider } = await AIFactory.getAvailableProvider();
      const answer = await provider.generateResponse(prompt);

      // اقتراحات ذات صلة
      const suggestions = this.getSuggestions(question);

      // منتجات ذات صلة
      let relatedProducts: any[] = [];
      if (context?.currentProduct?.categoryId) {
        relatedProducts = await prisma.product.findMany({
          where: {
            categoryId: context.currentProduct.categoryId,
            isActive: true,
            visibility: 'PUBLIC',
            stockQuantity: { gt: 0 },
          },
          take: 3,
          select: { id: true, name: true, nameAr: true, price: true },
        });
      }

      return {
        answer,
        suggestions,
        relatedProducts,
        confidence: 0.85,
      };
    } catch (err) {
      logger.warn(`[SmartAdvisor] Failed: ${(err as Error).message}`);
      return {
        answer: 'عذراً، لم أتمكن من معالجة سؤالك في الوقت الحالي. يرجى المحاولة لاحقاً.',
        confidence: 0,
      };
    }
  }

  /**
   * اقتراحات سريعة بناءً على السؤال
   */
  private static getSuggestions(question: string): string[] {
    const q = question.toLowerCase();

    if (q.includes('مقاس') || q.includes('قياس') || q.includes('size')) {
      return [
        'كيف أقيس مقاس الصدر؟',
        'ما الفرق بين المقاسات السعودية والأوروبية؟',
        'كيف أعرف مقاس الياقة؟',
      ];
    }

    if (q.includes('قماش') || q.includes('نسيج') || q.includes('fabric')) {
      return [
        'ما أفضل قماش للصيف؟',
        'ما الفرق بين القطن والكتان؟',
        'كيف أعرف جودة القماش؟',
      ];
    }

    if (q.includes('بدلة') || q.includes('suit') || q.includes(' رسمي')) {
      return [
        'ما المقاس المناسب للبدلة؟',
        'أي قماش أفضل للبدل الرسمية؟',
        'كيف أختار لون البدلة؟',
      ];
    }

    if (q.includes('ثوب') || q.includes('thobe')) {
      return [
        'ما أفضل قماش للثوب؟',
        'كيف أختار مقاس الثوب؟',
        'ما الفرق بين أنواع الأثواب؟',
      ];
    }

    return [
      'ما أفضل قماش للصيف؟',
      'كيف أقيس مقاسي؟',
      'ما الفرق بين البدل الجاهزة والمفصلة؟',
    ];
  }

  /**
   * تحليل سلوك المستخدم وتحديث الملف الشخصي
   */
  static async analyzeBehavior(userId: string, actionType: string, actionData: Record<string, any>) {
    try {
      const profile = await prisma.aIProfile.findUnique({ where: { userId } });
      const preferences = (profile?.preferences as Record<string, any>) || {};

      // تحديث الفئات
      if (actionData.categoryId) {
        const categoryCounts: Record<string, number> = preferences.categoryCounts || {};
        categoryCounts[actionData.categoryId] = (categoryCounts[actionData.categoryId] || 0) + 1;
        preferences.categoryCounts = categoryCounts;
        preferences.topCategories = Object.entries(categoryCounts)
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .slice(0, 5)
          .map(([id]) => id);
      }

      // تحديث المتاجر
      if (actionData.shopId) {
        const shopCounts: Record<string, number> = preferences.shopCounts || {};
        shopCounts[actionData.shopId] = (shopCounts[actionData.shopId] || 0) + 1;
        preferences.shopCounts = shopCounts;
        preferences.topShops = Object.entries(shopCounts)
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .slice(0, 5)
          .map(([id]) => id);
      }

      // تحديث المنتجات
      if (actionData.productId) {
        const viewedProducts: string[] = preferences.viewedProducts || [];
        viewedProducts.unshift(actionData.productId);
        preferences.viewedProducts = [...new Set(viewedProducts)].slice(0, 50);
      }

      // حفظ أو إنشاء الملف
      if (profile) {
        await prisma.aIProfile.update({
          where: { userId },
          data: { preferences, lastUpdated: new Date() },
        });
      } else {
        await prisma.aIProfile.create({
          data: { userId, preferences, lastUpdated: new Date() },
        });
      }

      logger.info(`[SmartAdvisor] Updated profile for user ${userId}: ${actionType}`);
    } catch (err) {
      logger.warn(`[SmartAdvisor] Failed to analyze behavior for user ${userId}: ${(err as Error).message}`);
    }
  }

  /**
   * تحليل مشاعر التقييمات
   */
  static async analyzeSentiment(text: string): Promise<{ sentiment: 'positive' | 'negative' | 'neutral'; score: number }> {
    try {
      const prompt = `حلل مشاعر هذا النص وأعطه درجة من -1 (سلبي جداً) إلى 1 (إيجابي جداً). أجب بالتنسيق التالي فقط:
sentiment: positive/negative/neutral
score: الرقم

النص: ${text}`;

      const { provider } = await AIFactory.getAvailableProvider();
      const response = await provider.generateResponse(prompt);

      const sentimentMatch = response.match(/sentiment:\s*(positive|negative|neutral)/i);
      const scoreMatch = response.match(/score:\s*([-\d.]+)/);

      const sentiment = (sentimentMatch?.[1]?.toLowerCase() as 'positive' | 'negative' | 'neutral') || 'neutral';
      const score = scoreMatch ? parseFloat(scoreMatch[1]) : 0;

      return { sentiment, score: Math.max(-1, Math.min(1, score)) };
    } catch (err) {
      logger.warn(`[SmartAdvisor] Sentiment analysis failed: ${(err as Error).message}`);
      return { sentiment: 'neutral', score: 0 };
    }
  }
}
