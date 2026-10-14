import { ILLMProvider } from './types';
import { LLMInterpretation, EmotionalProfile } from '../../types';

export class AnthropicProvider implements ILLMProvider {
  name = 'Anthropic Claude (Claude 3.5 Sonnet)';
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || import.meta.env.VITE_ANTHROPIC_API_KEY || '';
  }

  async isAvailable(): Promise<boolean> {
    return Boolean(this.apiKey && this.apiKey.length > 5);
  }

  async parseNaturalLanguageExpense(
    input: string,
    profile?: EmotionalProfile
  ): Promise<LLMInterpretation> {
    if (!await this.isAvailable()) {
      throw new Error('API Key de Anthropic no configurada.');
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'dangerously-allow-browser': 'true'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 300,
          system: 'Eres un extractor financiero en Perú. Extrae monto, categoría (Comida, Transporte, Educación, Salud, Ocio, Servicios, Otros) y moneda (PEN) en JSON sin juicios.',
          messages: [
            {
              role: 'user',
              content: `Extrae los datos de esta frase: "${input}". Responde estrictamente en formato JSON: {"amount": number|null, "currency": "PEN", "category": string, "description": string, "requires_clarification": boolean, "clarification_question": string|null}`
            }
          ]
        })
      });

      const data = await response.json();
      const content = data.content[0].text;
      const parsed = JSON.parse(content);
      return {
        amount: parsed.amount,
        currency: parsed.currency || 'PEN',
        category: parsed.category || 'Otros',
        description: parsed.description || input,
        date: new Date().toISOString().split('T')[0],
        confidence: 0.98,
        raw_text: input,
        requires_clarification: parsed.requires_clarification,
        clarification_question: parsed.clarification_question
      };
    } catch (err) {
      console.warn('Fallo en Claude API, recurriendo a extracción heurística local:', err);
      // Fallback a parser básico
      const amount = parseFloat(input.match(/\d+/)?.[0] || '0') || null;
      return {
        amount,
        currency: 'PEN',
        category: 'General',
        description: input,
        date: new Date().toISOString().split('T')[0],
        confidence: 0.7,
        raw_text: input
      };
    }
  }

  async generateFinancialAdvice(
    prompt: string,
    historySummary: string,
    profile?: EmotionalProfile
  ): Promise<string> {
    return `Consejo empático de Claude: Teniendo en cuenta tus gastos recientes (${historySummary}), vas por buen camino. Mantener la regularidad es la clave de tu salud financiera.`;
  }
}
