import { ILLMProvider } from './types';
import { MockLLMProvider } from './mockProvider';
import { AnthropicProvider } from './anthropicProvider';
import { OpenAIProvider } from './openaiProvider';
import { OllamaProvider } from './ollamaProvider';

export type SupportedLLMProvider = 'mock' | 'anthropic' | 'openai' | 'ollama';

export class LLMFactory {
  private static currentProviderType: SupportedLLMProvider =
    (import.meta.env.VITE_LLM_PROVIDER as SupportedLLMProvider) || 'mock';

  private static instances: Partial<Record<SupportedLLMProvider, ILLMProvider>> = {};

  static getProvider(type?: SupportedLLMProvider): ILLMProvider {
    const selected = type || this.currentProviderType;

    if (!this.instances[selected]) {
      switch (selected) {
        case 'anthropic':
          this.instances[selected] = new AnthropicProvider();
          break;
        case 'openai':
          this.instances[selected] = new OpenAIProvider();
          break;
        case 'ollama':
          this.instances[selected] = new OllamaProvider();
          break;
        case 'mock':
        default:
          this.instances['mock'] = new MockLLMProvider();
          break;
      }
    }

    return this.instances[selected] || new MockLLMProvider();
  }

  static setProviderType(type: SupportedLLMProvider) {
    this.currentProviderType = type;
  }

  static getCurrentProviderType(): SupportedLLMProvider {
    return this.currentProviderType;
  }

  static getAvailableProviders(): { id: SupportedLLMProvider; label: string }[] {
    return [
      { id: 'mock', label: 'Mock Inteligente Local (Sin API Key, Offline)' },
      { id: 'anthropic', label: 'Anthropic Claude (Claude 3.5 Sonnet)' },
      { id: 'openai', label: 'OpenAI (GPT-4o / GPT-4o-mini)' },
      { id: 'ollama', label: 'Ollama Local (Servidor propio HTTP)' }
    ];
  }
}
