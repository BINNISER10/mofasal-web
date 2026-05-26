import OpenAI from 'openai';
import { IAIProvider } from './ai.interface';

export class OpenAIProvider implements IAIProvider {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey, baseURL: process.env.OPENAI_BASE_URL });
  }

  async generateResponse(prompt: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    });
    return response.choices[0].message.content || '';
  }
}
