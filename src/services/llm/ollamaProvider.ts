import { ILLMProvider } from './types';
import { LLMInterpretation, EmotionalProfile } from '../../types';

export class OllamaProvider implements ILLMProvider {
  name = 'Ollama Local (Llama 3)';
  private endpoint: string;
  private model: string;

  constructor(endpoint?: string, model?: string) {
    this.endpoint = endpoint || import.meta.env.VITE_OLLAMA_ENDPOINT || 'http://localhost:11434';
    this.model = model || import.meta.env.VITE_OLLAMA_MODEL || 'llama3:8b';
  }

  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${this.endpoint}/api/tags`, { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  }

  async parseNaturalLanguageExpense(
    input: string,
    profile?: EmotionalProfile
  ): Promise<LLMInterpretation> {
    const prompt = `Extrae información financiera de la frase: "${input}". Responde SOLO en JSON con formato: {"amount": number, "currency": "PEN", "category": string}`;
    try {
      const response = await fetch(`${this.endpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt,
          format: 'json',
          stream: false
        })
      });
      const data = await response.json();
      const parsed = JSON.parse(data.response);
      return {
        amount: parsed.amount,
        currency: 'PEN',
        category: parsed.category || 'Otros',
        description: input,
        date: new Date().toISOString().split('T')[0],
        confidence: 0.9,
        raw_text: input
      };
    } catch (err) {
      console.warn('Fallo en Ollama local:', err);
      throw err;
    }
  }

  async generateFinancialAdvice(
    prompt: string,
    historySummary: string,
    profile?: EmotionalProfile
  ): Promise<string> {
    return 'Respuesta de Ollama (modelo local en tu máquina): Buen control semanal.';
  }
}
