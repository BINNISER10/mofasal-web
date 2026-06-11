import { IAIProvider } from './ai.interface';
import { GeminiProvider } from './gemini.provider';
import { OpenAIProvider } from './openai.provider';
import { OllamaProvider } from './ollama.provider';

export class AIFactory {
  /**
   * الحصول على مزود AI حسب الاسم
   * 
   * المزودات المتاحة:
   * - gemini: Google Gemini (مجاني: 15 RPM, 1M tokens/day)
   * - openai: OpenAI GPT (مدفوع)
   * - deepseek: DeepSeek (رخيص جداً)
   * - ollama: Ollama (مجاني 100% — محلي)
   * 
   * الأولوية الافتراضية: gemini → ollama → openai
   */
  static getProvider(providerName?: string, customApiKey?: string): IAIProvider {
    const name = (providerName || process.env.AI_PROVIDER || 'gemini').toLowerCase();

    switch (name) {
      case 'ollama':
        return new OllamaProvider();

      case 'deepseek':
        return new OpenAIProvider(
          customApiKey || process.env.DEEPSEEK_API_KEY || '',
          process.env.DEEPSEEK_MODEL || 'deepseek-chat'
        );

      case 'openai':
        return new OpenAIProvider(
          customApiKey || process.env.OPENAI_API_KEY || '',
          process.env.OPENAI_MODEL || 'gpt-4o'
        );

      case 'gemini':
      default:
        return new GeminiProvider(customApiKey || process.env.GEMINI_API_KEY || '');
    }
  }

  /**
   * الحصول على أفضل مزود متاح (مع fallback تلقائي)
   * 
   * الأولوية:
   * 1. Gemini (مجاني، سريع)
   * 2. Ollama (مجاني، محلي)
   * 3. OpenAI (مدفوع)
   */
  static async getAvailableProvider(): Promise<{ provider: IAIProvider; name: string }> {
    // Try Gemini first (free, fast)
    if (process.env.GEMINI_API_KEY) {
      try {
        const provider = new GeminiProvider(process.env.GEMINI_API_KEY);
        return { provider, name: 'gemini' };
      } catch { /* fallback */ }
    }

    // Try Ollama (free, local)
    try {
      const health = await OllamaProvider.healthCheck();
      if (health.running && health.modelAvailable) {
        return { provider: new OllamaProvider(), name: 'ollama' };
      }
    } catch { /* fallback */ }

    // Try OpenAI (paid)
    if (process.env.OPENAI_API_KEY) {
      return { provider: new OpenAIProvider(process.env.OPENAI_API_KEY), name: 'openai' };
    }

    // Try DeepSeek (very cheap)
    if (process.env.DEEPSEEK_API_KEY) {
      return { provider: new OpenAIProvider(process.env.DEEPSEEK_API_KEY, process.env.DEEPSEEK_MODEL || 'deepseek-chat'), name: 'deepseek' };
    }

    // Default to Gemini (will fail if no key, but that's expected)
    return { provider: new GeminiProvider(''), name: 'gemini' };
  }
}
