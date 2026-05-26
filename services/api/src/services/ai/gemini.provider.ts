import { GoogleGenerativeAI } from '@google/generative-ai';
import { IAIProvider } from './ai.interface';

export class GeminiProvider implements IAIProvider {
  private model: any;

  constructor(apiKey: string) {
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  }

  async generateResponse(prompt: string): Promise<string> {
    const result = await this.model.generateContent(prompt);
    return (await result.response).text();
  }
}
