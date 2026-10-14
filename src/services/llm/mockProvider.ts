import { ILLMProvider } from './types';
import { LLMInterpretation, EmotionalProfile } from '../../types';

export class MockLLMProvider implements ILLMProvider {
  name = 'Mock Local (Demostración sin API Key)';

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async parseNaturalLanguageExpense(
    input: string,
    profile?: EmotionalProfile
  ): Promise<LLMInterpretation> {
    const text = input.trim().toLowerCase();
    const today = new Date().toISOString().split('T')[0];

    // 1. Extraer Monto
    let amount: number | null = null;
    const amountRegex = /(\d+([.,]\d{1,2})?)/g;
    const match = text.match(amountRegex);
    if (match && match.length > 0) {
      amount = parseFloat(match[0].replace(',', '.'));
    }

    // 2. Extraer Categoría usando heurísticas y diccionario aprendido
    let category = 'Otros';
    const learned = profile?.learned_categories || {};

    // Verificar primero en preferencias aprendidas por el usuario
    for (const [keyword, cat] of Object.entries(learned)) {
      if (text.includes(keyword.toLowerCase())) {
        category = cat;
        break;
      }
    }

    if (category === 'Otros') {
      if (/taxi|uber|pasaje|micro|combi|metropolitano|tren|bus|gasolina/.test(text)) {
        category = 'Transporte';
      } else if (/almuerzo|menu|menú|comida|cena|desayuno|cafe|café|restaurante|snack|galleta|pizza|pollo/.test(text)) {
        category = 'Comida';
      } else if (/copias|libro|curso|universidad|matricula|facultad|examen|cuaderno/.test(text)) {
        category = 'Educación';
      } else if (/cine|juego|salida|amigos|fiesta|bar|cerveza|ocio/.test(text)) {
        category = 'Ocio';
      } else if (/farmacia|pastilla|medico|médico|salud|doctor|hospital/.test(text)) {
        category = 'Salud';
      } else if (/luz|agua|internet|celular|recarga|alquiler|servicios/.test(text)) {
        category = 'Servicios';
      }
    }

    // 3. Caso especial de validación de HU-02: falta el monto
    if (amount === null) {
      return {
        amount: null,
        currency: 'PEN',
        category,
        description: input,
        date: today,
        confidence: 0.4,
        raw_text: input,
        requires_clarification: true,
        clarification_question: '¿Cuánto gastaste exactamente?'
      };
    }

    // 4. Caso especial HU-02 E4: categoría ambigua ("cosas", "algo")
    if (/cosas|algo|varios|gasto/.test(text) && category === 'Otros') {
      return {
        amount,
        currency: 'PEN',
        category: 'Sin categoría',
        description: input,
        date: today,
        confidence: 0.5,
        raw_text: input,
        requires_clarification: true,
        clarification_question: '¿En qué categoría clasificarías este gasto?'
      };
    }

    // Generar descripción limpia
    let description = input;
    if (input.length > 50) {
      description = input.substring(0, 50) + '...';
    }

    return {
      amount,
      currency: 'PEN',
      category,
      description,
      date: today,
      confidence: 0.95,
      raw_text: input,
      suggested_advice: 'Gasto registrado con éxito sin afectar tu meta mensual.'
    };
  }

  async generateFinancialAdvice(
    prompt: string,
    historySummary: string,
    profile?: EmotionalProfile
  ): Promise<string> {
    const isAnxious = profile?.declared_sentiment === 'anxious' || profile?.stress_level === 'high';
    const query = prompt.toLowerCase();

    if (query.includes('comida') || query.includes('almuerzo')) {
      return 'Gastaste S/ 128.00 en comida esta semana. Representa el 54% de tus movimientos. Una pequeña opción es preparar meriendas en casa 2 días a la semana para proteger tu meta.';
    }

    if (query.includes('taxi') || query.includes('transporte')) {
      return 'Tus gastos de transporte suman S/ 65.00 en lo que va de la semana. Vas a un ritmo equilibrado con respecto a tu presupuesto planeado.';
    }

    if (isAnxious) {
      return 'Estás haciendo un gran trabajo manteniendo el registro. Tu árbol se mantiene en pie y cada paso cuenta para tu estabilidad financiera.';
    }

    return 'Tus hábitos financieros están saludables. Estás un 15% por debajo de tu límite semanal, lo que permite que tu árbol florezca con fuerza.';
  }
}
