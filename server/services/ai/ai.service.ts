import dotenv from 'dotenv';
import type { IAIProvider } from './ai.interface.ts';
import { GeminiAIProvider } from './gemini.provider.ts';
import { HeuristicAIProvider } from './heuristic.provider.ts';

dotenv.config();

class AIServiceManager {
  private activeProvider: IAIProvider;
  private providerName: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (apiKey && apiKey.length > 5) {
      this.activeProvider = new GeminiAIProvider(apiKey);
      this.providerName = 'Google Gemini (gemini-3.5-flash & MathEngine)';
      console.log('Solvo AI Service initialized with Google Gemini & Math Engine Provider.');
    } else {
      this.activeProvider = new HeuristicAIProvider();
      this.providerName = 'Solvo Heuristic Pedagogical Engine';
      console.log('Solvo AI Service initialized with Heuristic Educational Engine.');
    }
  }

  getProvider(): IAIProvider {
    return this.activeProvider;
  }

  getProviderName(): string {
    return this.providerName;
  }
}

export const aiService = new AIServiceManager();
