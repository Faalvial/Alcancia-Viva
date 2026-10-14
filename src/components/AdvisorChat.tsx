import React, { useState } from 'react';
import { Send, Bot, Volume2, Mic } from 'lucide-react';
import { LLMFactory } from '../services/llm/llmFactory';
import { SpeechService } from '../services/voice/speechService';
import { EmotionalProfile } from '../types';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
}

interface AdvisorChatProps {
  emotionalProfile: EmotionalProfile;
  weeklySummary: string;
}

export const AdvisorChat: React.FC<AdvisorChatProps> = ({
  emotionalProfile,
  weeklySummary
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: '¡Hola! Soy tu asistente en Alcancía Viva. Pregúntame sobre tus gastos de la semana o tus metas de ahorro. Todo en un tono tranquilo y sin juicios.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const newMsgs: Message[] = [...messages, { sender: 'user', text }];
    setMessages(newMsgs);
    setInput('');
    setIsTyping(true);

    try {
      const provider = LLMFactory.getProvider();
      const response = await provider.generateFinancialAdvice(
        text,
        weeklySummary,
        emotionalProfile
      );

      setMessages([...newMsgs, { sender: 'assistant', text: response }]);
      // Leer automáticamente si audio está activado o solicitado
      // SpeechService.speak(response);
    } catch (e) {
      setMessages([
        ...newMsgs,
        {
          sender: 'assistant',
          text: 'Tus registros están seguros. No pude conectar con el modelo remoto en este segundo, pero tus finanzas van en orden.'
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSpeak = (text: string) => {
    SpeechService.speak(text);
  };

  const askVoiceDirectly = () => {
    SpeechService.startListening(
      (res) => {
        if (res.isFinal) {
          handleSend(res.transcript);
        }
      },
      (err) => console.warn(err),
      () => {}
    );
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-96">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700">
            <Bot size={18} />
          </div>
          <div>
            <h4 className="font-bold text-gray-800 text-sm">Asistente Financiero Empático</h4>
            <span className="text-[10px] text-green-600 font-medium">Orientación sin culpa (LLM)</span>
          </div>
        </div>

        <button
          onClick={askVoiceDirectly}
          className="p-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-full transition"
          title="Hacer consulta por voz"
          aria-label="Preguntar al asistente por voz"
        >
          <Mic size={16} />
        </button>
      </div>

      {/* Lista de mensajes */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl relative group ${
                m.sender === 'user'
                  ? 'bg-green-600 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}
            >
              <p className="leading-relaxed">{m.text}</p>
              {m.sender === 'assistant' && (
                <button
                  onClick={() => handleSpeak(m.text)}
                  className="mt-1.5 text-gray-500 hover:text-green-700 flex items-center gap-1 text-[10px]"
                  title="Escuchar respuesta"
                >
                  <Volume2 size={12} /> Escuchar
                </button>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="text-[11px] text-gray-400 italic">El asistente está analizando tus datos con empatía...</div>
        )}
      </div>

      {/* Sugerencias rápidas */}
      <div className="flex gap-2 py-2 overflow-x-auto text-[11px]">
        <button
          onClick={() => handleSend('¿Cuánto gasté en comida este mes?')}
          className="px-2.5 py-1 bg-gray-50 hover:bg-green-50 border rounded-full text-gray-600 whitespace-nowrap"
        >
          🍔 ¿Gasto en comida?
        </button>
        <button
          onClick={() => handleSend('¿Cómo va mi meta de la laptop?')}
          className="px-2.5 py-1 bg-gray-50 hover:bg-green-50 border rounded-full text-gray-600 whitespace-nowrap"
        >
          💻 ¿Avance de laptop?
        </button>
      </div>

      {/* Input */}
      <div className="flex gap-2 pt-2 border-t border-gray-100">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
          placeholder="Haz una consulta financiera..."
          className="flex-1 px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-1 focus:ring-green-500"
        />
        <button
          onClick={() => handleSend()}
          className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition"
          aria-label="Enviar mensaje"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
};
