import { Response, NextFunction } from 'express';
import { RecommendationService } from '../../services/RecommendationService';
import { SmartAdvisorService } from '../../services/SmartAdvisorService';
import { MufasalOmniAI } from '../../services/ai.service';
import { AIFactory } from '../../services/ai/ai.factory';
import { OllamaProvider } from '../../services/ai/ollama.provider';
import { AuthRequest } from '../../middleware/auth';
import { sendSuccess, sendCreated } from '../../utils/response';
import { ApiError } from '../../utils/ApiError';

export class AIController {
  static async logBehavior(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw ApiError.unauthorized();
      const { actionType, actionData } = req.body;
      if (!actionType) throw ApiError.badRequest('actionType is required');
      await MufasalOmniAI.logBehavior(req.user?.shopId || '', userId, actionType, actionData || {});
      sendCreated(res, { queued: true }, 'Behavior event queued');
    } catch (error) { next(error); }
  }

  static async getRecommendations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw ApiError.unauthorized();
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 12;
      const result = await RecommendationService.getRecommendations(userId, limit);
      sendSuccess(res, result);
    } catch (error) { next(error); }
  }

  static async getSimilarProducts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 8;
      const items = await RecommendationService.getSimilarProducts(req.params.productId, limit);
      sendSuccess(res, items);
    } catch (error) { next(error); }
  }

  static async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw ApiError.unauthorized();
      const profile = await RecommendationService.getProfile(userId);
      sendSuccess(res, profile);
    } catch (error) { next(error); }
  }

  /**
   * مستشار ذكي — يجيب على أسئلة العملاء
   */
  static async askAdvisor(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { question, context } = req.body;
      if (!question) throw ApiError.badRequest('question is required');
      const result = await SmartAdvisorService.ask(question, req.user?.id, context);
      sendSuccess(res, result);
    } catch (error) { next(error); }
  }

  /**
   * توصيات المتاجر
   */
  static async getShopRecommendations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw ApiError.unauthorized();
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
      const shops = await RecommendationService.getShopRecommendations(userId, limit);
      sendSuccess(res, shops);
    } catch (error) { next(error); }
  }

  /**
   * المنتجات الرائجة
   */
  static async getTrending(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 12;
      const items = await RecommendationService.getTrending(limit);
      sendSuccess(res, items);
    } catch (error) { next(error); }
  }

  /**
   * تحليل مشاعر النص
   */
  static async analyzeSentiment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { text } = req.body;
      if (!text) throw ApiError.badRequest('text is required');
      const result = await SmartAdvisorService.analyzeSentiment(text);
      sendSuccess(res, result);
    } catch (error) { next(error); }
  }

  /**
   * فحص حالة AI — أي مزود يعمل حالياً
   */
  static async healthCheck(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const configuredProvider = process.env.AI_PROVIDER || 'gemini';
      const hasGemini = !!process.env.GEMINI_API_KEY;
      const hasOpenAI = !!process.env.OPENAI_API_KEY;
      const hasDeepSeek = !!process.env.DEEPSEEK_API_KEY;

      // Check Ollama
      const ollamaHealth = await OllamaProvider.healthCheck();

      // Get available provider
      const { name: activeProvider } = await AIFactory.getAvailableProvider();

      sendSuccess(res, {
        configured: configuredProvider,
        active: activeProvider,
        providers: {
          gemini: { available: hasGemini, free: true, limits: '15 RPM, 1M tokens/day' },
          ollama: { available: ollamaHealth.running && ollamaHealth.modelAvailable, free: true, running: ollamaHealth.running, modelAvailable: ollamaHealth.modelAvailable },
          openai: { available: hasOpenAI, free: false },
          deepseek: { available: hasDeepSeek, free: false, cost: '$0.14/1M tokens' },
        },
        recommendation: !hasGemini && ollamaHealth.running
          ? 'Ollama يعمل محلياً — مجاني بالكامل'
          : hasGemini
            ? 'Gemini مجاني — يكفي لـ 1000+ مستخدم يومياً'
            : 'لا يوجد مزود AI مُفعّل',
      });
    } catch (error) { next(error); }
  }
}
