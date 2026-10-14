import React from 'react';
import { AccessibilitySettings } from '../types';
import { LLMFactory, SupportedLLMProvider } from '../services/llm/llmFactory';
import { Sliders, Eye, Zap, Type, Cpu } from 'lucide-react';

interface AccessibilityControlsProps {
  settings: AccessibilitySettings;
  onUpdateSettings: (newSettings: AccessibilitySettings) => void;
  currentProvider: SupportedLLMProvider;
  onChangeProvider: (provider: SupportedLLMProvider) => void;
}

export const AccessibilityControls: React.FC<AccessibilityControlsProps> = ({
  settings,
  onUpdateSettings,
  currentProvider,
  onChangeProvider
}) => {
  const toggleHighContrast = () => {
    onUpdateSettings({ ...settings, high_contrast: !settings.high_contrast });
  };

  const toggleReducedMotion = () => {
    onUpdateSettings({ ...settings, reduced_motion: !settings.reduced_motion });
  };

  const toggleSimplified = () => {
    onUpdateSettings({ ...settings, simplified_mode: !settings.simplified_mode });
  };

  const increaseTextScale = () => {
    onUpdateSettings({ ...settings, text_scale: Math.min(1.5, settings.text_scale + 0.1) });
  };

  const decreaseTextScale = () => {
    onUpdateSettings({ ...settings, text_scale: Math.max(0.9, settings.text_scale - 0.1) });
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <h4 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
        <Sliders size={16} className="text-green-600" />
        Configuración y Accesibilidad (WCAG 2.2 AA)
      </h4>

      {/* Selector de Proveedor de LLM (NFR-08 / FR-20) */}
      <div className="mb-5 p-4 bg-gray-50 rounded-2xl border border-gray-200">
        <label className="block text-xs font-bold text-gray-800 mb-1 flex items-center gap-1.5">
          <Cpu size={14} className="text-green-600" /> Proveedor de Inteligencia (LLM):
        </label>
        <p className="text-[11px] text-gray-500 mb-2">
          Capa agnóstica desacoplada. Puedes alternar el proveedor en caliente sin reiniciar la aplicación:
        </p>
        <select
          value={currentProvider}
          onChange={(e) => onChangeProvider(e.target.value as SupportedLLMProvider)}
          className="w-full text-xs p-2 bg-white border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-green-500"
        >
          {LLMFactory.getAvailableProviders().map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* Controles de Accesibilidad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <button
          onClick={toggleHighContrast}
          className={`p-3 rounded-2xl border flex items-center justify-between transition ${
            settings.high_contrast
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
          }`}
        >
          <span className="flex items-center gap-2 font-semibold">
            <Eye size={15} /> Alto Contraste
          </span>
          <span className="text-[10px] uppercase font-bold">
            {settings.high_contrast ? 'Activado' : 'Normal'}
          </span>
        </button>

        <button
          onClick={toggleReducedMotion}
          className={`p-3 rounded-2xl border flex items-center justify-between transition ${
            settings.reduced_motion
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
          }`}
        >
          <span className="flex items-center gap-2 font-semibold">
            <Zap size={15} /> Reducción Movimiento
          </span>
          <span className="text-[10px] uppercase font-bold">
            {settings.reduced_motion ? 'Reducido' : 'Normal'}
          </span>
        </button>

        <button
          onClick={toggleSimplified}
          className={`p-3 rounded-2xl border flex items-center justify-between transition ${
            settings.simplified_mode
              ? 'bg-emerald-700 text-white border-emerald-700'
              : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
          }`}
        >
          <span className="flex items-center gap-2 font-semibold">
            <Sliders size={15} /> Modo Cognitivo Simplificado
          </span>
          <span className="text-[10px] uppercase font-bold">
            {settings.simplified_mode ? 'Activado' : 'Estándar'}
          </span>
        </button>

        <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
          <span className="flex items-center gap-2 font-semibold text-gray-700">
            <Type size={15} /> Escala de Texto
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={decreaseTextScale}
              className="w-6 h-6 bg-white border rounded font-bold hover:bg-gray-100"
            >
              -
            </button>
            <span className="font-mono font-bold text-gray-800">
              {Math.round(settings.text_scale * 100)}%
            </span>
            <button
              onClick={increaseTextScale}
              className="w-6 h-6 bg-white border rounded font-bold hover:bg-gray-100"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
