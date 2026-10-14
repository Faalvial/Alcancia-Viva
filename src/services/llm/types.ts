import { LLMInterpretation, EmotionalProfile } from '../../types';

export interface ILLMProvider {
  name: string;
  isAvailable(): Promise<boolean>;
  parseNaturalLanguageExpense(
    input: string,
    profile?: EmotionalProfile
  ): Promise<LLMInterpretation>;
  generateFinancialAdvice(
    prompt: string,
    historySummary: string,
    profile?: EmotionalProfile
  ): Promise<string>;
}
