import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { IAIProvider } from './ai.interface';

export class GeminiProvider implements IAIProvider {
  private model: GenerativeModel;

  constructor(apiKey: string) {
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  }

  async generateResponse(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      return (await result.response).text();
    } catch (error: any) {
      const msg = error?.message || 'Gemini provider error';
      if (msg.includes('API_KEY_INVALID') || msg.includes('PERMISSION_DENIED')) {
        throw new Error('GEMINI_AUTH_ERROR: مفتاح API غير صالح أو منتهي الصلاحية');
      }
      if (msg.includes('QUOTA_EXCEEDED') || msg.includes('RESOURCE_EXHAUSTED')) {
        throw new Error('GEMINI_QUOTA_ERROR: تجاوزت الحد المسموح من الطلبات');
      }
      throw new Error(`GEMINI_ERROR: ${msg}`);
    }
  }
}
