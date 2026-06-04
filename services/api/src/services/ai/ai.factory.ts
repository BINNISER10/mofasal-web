import { IAIProvider } from './ai.interface';
import { GeminiProvider } from './gemini.provider';
import { OpenAIProvider } from './openai.provider';

export class AIFactory {
  static getProvider(providerName: string, customApiKey?: string): IAIProvider {
    const name = providerName.toLowerCase();
    switch (name) {
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
}
