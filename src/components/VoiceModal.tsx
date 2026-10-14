import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Edit3, Check, X, RotateCcw, AlertCircle } from 'lucide-react';
import { SpeechService } from '../services/voice/speechService';
import { LLMFactory } from '../services/llm/llmFactory';
import { Transaction, LLMInterpretation } from '../types';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveExpense: (tx: Transaction) => void;
  onUndoLastExpense?: () => void;
  canUndo?: boolean;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({
  isOpen,
  onClose,
  onSaveExpense,
  onUndoLastExpense,
  canUndo = false
}) => {
  const [mode, setMode] = useState<'voice' | 'text'>('voice');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [interpretation, setInterpretation] = useState<LLMInterpretation | null>(null);
  const [manualCategory, setManualCategory] = useState('');
  const [manualAmount, setManualAmount] = useState<string>('');
  const [undoTimer, setUndoTimer] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTranscript('');
      setTextInput('');
      setInterpretation(null);
      if (mode === 'voice' && SpeechService.isRecognitionSupported()) {
        startVoiceCapture();
      }
    } else {
      SpeechService.stopListening();
      setIsListening(false);
    }
  }, [isOpen]);

  const startVoiceCapture = () => {
    setIsListening(true);
    setTranscript('');
    SpeechService.startListening(
      (result) => {
        setTranscript(result.transcript);
        if (result.isFinal) {
          processSentence(result.transcript);
        }
      },
      (err) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );
  };

  const handleStopVoice = () => {
    SpeechService.stopListening();
    setIsListening(false);
    if (transcript.trim()) {
      processSentence(transcript);
    }
  };

  const processSentence = async (phrase: string) => {
    if (!phrase.trim()) return;
    setIsProcessing(true);
    try {
      const provider = LLMFactory.getProvider();
      const result = await provider.parseNaturalLanguageExpense(phrase);
      setInterpretation(result);
      if (result.amount) setManualAmount(result.amount.toString());
      if (result.category) setManualCategory(result.category);
    } catch (e) {
      console.error('Error processing expense with LLM:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = () => {
    const finalAmount = parseFloat(manualAmount) || interpretation?.amount || 0;
    if (finalAmount <= 0) {
      alert('Por favor ingresa un monto válido mayor a 0');
      return;
    }

    const newTx: Transaction = {
      id: 'tx_' + Date.now(),
      date: interpretation?.date || new Date().toISOString().split('T')[0],
      amount: finalAmount,
      category: manualCategory || interpretation?.category || 'Otros',
      description: interpretation?.description || textInput || transcript || 'Gasto registrado',
      type: 'expense',
      source: mode === 'voice' ? 'voice' : 'text'
    };

    onSaveExpense(newTx);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Cabecera */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
          <div className="flex gap-2">
            <button
              onClick={() => { setMode('voice'); if (!isListening) startVoiceCapture(); }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
                mode === 'voice' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Mic size={14} /> Registrar por Voz
            </button>
            <button
              onClick={() => { setMode('text'); SpeechService.stopListening(); }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
                mode === 'text' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Edit3 size={14} /> Escribir Texto
            </button>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 text-gray-400">
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="py-6 flex flex-col items-center">
          {mode === 'voice' ? (
            <div className="flex flex-col items-center w-full">
              <button
                onClick={isListening ? handleStopVoice : startVoiceCapture}
                aria-label={isListening ? "Detener grabación de voz" : "Iniciar grabación de voz"}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-red-500 text-white ring-8 ring-red-100 animate-pulse'
                    : 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
                }`}
              >
                {isListening ? <MicOff size={36} /> : <Mic size={36} />}
              </button>
              <p className="mt-4 text-sm font-medium text-gray-600 text-center">
                {isListening ? 'Escuchando... Di por ejemplo: "Gasté 25 soles en taxi"' : 'Toca el micrófono para dictar'}
              </p>
              {transcript && (
                <div className="mt-3 p-3 bg-gray-50 rounded-2xl w-full text-center border border-gray-200 text-gray-800 text-sm italic">
                  "{transcript}"
                </div>
              )}
            </div>
          ) : (
            <div className="w-full">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Escribe tu gasto en lenguaje natural:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="ej. Almuerzo menú 18 soles"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  onKeyDown={(e) => { if (e.key === 'Enter') processSentence(textInput); }}
                />
                <button
                  onClick={() => processSentence(textInput)}
                  className="px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition"
                >
                  Interpretar
                </button>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="mt-4 flex items-center gap-2 text-green-700 text-xs font-semibold">
              <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
              El modelo está identificando monto y categoría...
            </div>
          )}

          {/* Tarjeta de Confirmación de Datos (FR-05) */}
          {interpretation && (
            <div className="mt-6 w-full bg-green-50/80 rounded-2xl p-4 border border-green-200">
              <div className="flex items-center gap-2 text-green-900 font-semibold text-sm mb-3">
                <Check size={16} className="text-green-600" /> Movimiento Identificado
              </div>

              {interpretation.requires_clarification && (
                <div className="mb-3 p-2 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                  <AlertCircle size={14} />
                  {interpretation.clarification_question || 'Por favor verifica el monto y categoría.'}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500">Monto:</span>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="font-semibold text-gray-700">S/</span>
                    <input
                      type="number"
                      step="0.5"
                      value={manualAmount}
                      onChange={(e) => setManualAmount(e.target.value)}
                      className="w-20 px-2 py-1 bg-white border border-gray-300 rounded font-bold text-gray-800 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <span className="text-gray-500">Categoría:</span>
                  <select
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value)}
                    className="w-full mt-1 px-2 py-1 bg-white border border-gray-300 rounded text-xs font-semibold text-gray-800"
                  >
                    <option value="Comida">Comida</option>
                    <option value="Transporte">Transporte</option>
                    <option value="Educación">Educación</option>
                    <option value="Salud">Salud</option>
                    <option value="Ocio">Ocio</option>
                    <option value="Servicios">Servicios</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
              </div>

              <div className="mt-3 text-xs text-gray-600">
                <span className="text-gray-500">Descripción:</span> {interpretation.description}
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow"
                >
                  <Check size={14} /> Confirmar y Guardar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer con opción Deshacer si aplica */}
        {canUndo && onUndoLastExpense && (
          <div className="pt-3 border-t border-gray-100 flex justify-center">
            <button
              onClick={() => { onUndoLastExpense(); onClose(); }}
              className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
            >
              <RotateCcw size={13} /> Deshacer último registro
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
