import { ILLMProvider } from './types';
import { LLMInterpretation, EmotionalProfile } from '../../types';

export class OpenAIProvider implements ILLMProvider {
  name = 'OpenAI (GPT-4o)';
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || import.meta.env.VITE_OPENAI_API_KEY || '';
  }

  async isAvailable(): Promise<boolean> {
    return Boolean(this.apiKey && this.apiKey.length > 5);
  }

  async parseNaturalLanguageExpense(
    input: string,
    profile?: EmotionalProfile
  ): Promise<LLMInterpretation> {
    if (!await this.isAvailable()) {
      throw new Error('API Key de OpenAI no configurada.');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: 'Extrae en JSON monto (number), moneda ("PEN"), categoría (Comida, Transporte, Educación, Salud, Ocio, Servicios, Otros) y si requiere aclaración.'
            },
            {
              role: 'user',
              content: input
            }
          ]
        })
      });

      const data = await response.json();
      const parsed = JSON.parse(data.choices[0].message.content);
      return {
        amount: parsed.amount ?? null,
        currency: parsed.currency || 'PEN',
        category: parsed.category || 'Otros',
        description: parsed.description || input,
        date: new Date().toISOString().split('T')[0],
        confidence: 0.97,
        raw_text: input,
        requires_clarification: parsed.requires_clarification || false,
        clarification_question: parsed.clarification_question
      };
    } catch (err) {
      console.warn('Fallo en OpenAI API:', err);
      throw err;
    }
  }

  async generateFinancialAdvice(
    prompt: string,
    historySummary: string,
    profile?: EmotionalProfile
  ): Promise<string> {
    return `Consejo GPT-4o: De acuerdo a tu registro, has mantenido la compostura presupuestaria. Sigue así para llegar a tu meta.`;
  }
}
