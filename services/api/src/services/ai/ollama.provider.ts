import { IAIProvider } from './ai.interface';

/**
 * Ollama Provider — AI مجاني بالكامل يعمل محلياً
 * 
 * Ollama يشغل نماذج LLM على جهازك بدون إنترنت أو API key.
 * التثبيت: https://ollama.ai
 * التشغيل: ollama pull llama3
 * 
 * النماذج الموصى بها:
 * - llama3 (8B) — الأفضل للعربية، 4.7GB
 * - mistral (7B) — سريع، 4.1GB
 * - phi3 (3.8B) — خفيف، 2.2GB
 * - qwen2 (7B) — ممتاز للعربية، 4.4GB
 */
export class OllamaProvider implements IAIProvider {
  private baseUrl: string;
  private model: string;

  constructor(model?: string) {
    this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.model = model || process.env.OLLAMA_MODEL || 'llama3';
  }

  async generateResponse(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
          options: {
            temperature: 0.7,
            num_predict: 1024,
          },
        }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 404) {
          throw new Error(`OLLAMA_MODEL_NOT_FOUND: النموذج '${this.model}' غير موجود. شغّل: ollama pull ${this.model}`);
        }
        if (status === 503 || status === 502) {
          throw new Error('OLLAMA_NOT_RUNNING: Ollama غير مشغّل. شغّل: ollama serve');
        }
        throw new Error(`OLLAMA_ERROR: HTTP ${status}`);
      }

      const data = (await response.json()) as { response?: string };
      return data.response || '';
    } catch (error: any) {
      if (error.message?.startsWith('OLLAMA_')) {
        throw error;
      }
      // Connection refused — Ollama not running
      if (error.code === 'ECONNREFUSED' || error.message?.includes('fetch failed')) {
        throw new Error('OLLAMA_NOT_RUNNING: Ollama غير مشغّل. شغّل: ollama serve');
      }
      throw new Error(`OLLAMA_ERROR: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * التحقق من أن Ollama يعمل والنموذج موجود
   */
  static async healthCheck(model?: string): Promise<{ running: boolean; modelAvailable: boolean; error?: string }> {
    const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const modelName = model || process.env.OLLAMA_MODEL || 'llama3';

    try {
      // Check if Ollama is running
      const tagsResponse = await fetch(`${baseUrl}/api/tags`);
      if (!tagsResponse.ok) {
        return { running: false, modelAvailable: false, error: 'Ollama not responding' };
      }

      const tags = (await tagsResponse.json()) as { models?: { name?: string }[] };
      const models = tags.models || [];
      const modelAvailable = models.some((m: any) => m.name?.startsWith(modelName));

      return { running: true, modelAvailable };
    } catch (error: any) {
      return { running: false, modelAvailable: false, error: error.message };
    }
  }

  /**
   * جلب قائمة النماذج المتاحة
   */
  static async listModels(): Promise<string[]> {
    const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    try {
      const response = await fetch(`${baseUrl}/api/tags`);
      if (!response.ok) return [];
      const data = (await response.json()) as { models?: { name?: string }[] };
      return (data.models || []).map((m) => m.name || '');
    } catch {
      return [];
    }
  }
}
