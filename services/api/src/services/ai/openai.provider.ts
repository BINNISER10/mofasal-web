import OpenAI from 'openai';
import { IAIProvider } from './ai.interface';

export class OpenAIProvider implements IAIProvider {
  private openai: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-4o') {
    this.openai = new OpenAI({ apiKey, baseURL: process.env.OPENAI_BASE_URL });
    this.model = model;
  }

  async generateResponse(prompt: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
      });
      return response.choices[0]?.message?.content || '';
    } catch (error: any) {
      const status = error?.status || error?.code;
      if (status === 401 || status === 'invalid_api_key') {
        throw new Error('OPENAI_AUTH_ERROR: مفتاح API غير صالح');
      }
      if (status === 429 || status === 'rate_limit_exceeded') {
        throw new Error('OPENAI_QUOTA_ERROR: تجاوزت الحد المسموح من الطلبات');
      }
      throw new Error(`OPENAI_ERROR: ${error?.message || 'Unknown error'}`);
    }
  }
}
