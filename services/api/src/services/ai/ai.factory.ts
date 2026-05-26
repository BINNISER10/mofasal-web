import { IAIProvider } from './ai.interface';
import { GeminiProvider } from './gemini.provider';
import { OpenAIProvider } from './openai.provider';

export class AIFactory {
  static getProvider(providerName: string, customApiKey?: string): IAIProvider {
    switch (providerName.toLowerCase()) {
      case 'openai':
      case 'deepseek':
        return new OpenAIProvider(customApiKey || process.env.OPENAI_API_KEY || '');
      case 'gemini':
      default:
        return new GeminiProvider(customApiKey || process.env.GEMINI_API_KEY || '');
    }
  }
}
