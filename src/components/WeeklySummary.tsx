import React from 'react';
import { WeeklyInsight } from '../types';
import { PieChart, Lightbulb } from 'lucide-react';

interface WeeklySummaryProps {
  insights: WeeklyInsight;
  weeklyBudget: number;
  simplifiedMode?: boolean;
}

export const WeeklySummary: React.FC<WeeklySummaryProps> = ({
  insights,
  weeklyBudget,
  simplifiedMode = false
}) => {
  const percentage = Math.min(100, Math.round((insights.total_spent / weeklyBudget) * 100));

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
          <PieChart size={16} className="text-green-600" />
          Resumen Semanal
        </h4>
        <span className="text-[11px] font-semibold text-gray-500">{insights.period}</span>
      </div>

      {/* Indicador de presupuesto semanal */}
      <div className="p-4 bg-gray-50 rounded-2xl mb-4">
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-xs text-gray-500">Gastado esta semana:</span>
          <span className="text-base font-extrabold text-gray-900">
            S/ {insights.total_spent.toFixed(2)}{' '}
            <span className="text-xs font-normal text-gray-400">/ S/ {weeklyBudget.toFixed(2)}</span>
          </span>
        </div>
        <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden mt-2">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              percentage > 90 ? 'bg-orange-500' : 'bg-green-600'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Categorías Principales */}
      <div className="space-y-2 mb-4">
        <span className="text-xs font-semibold text-gray-600">Categorías principales:</span>
        {insights.top_categories.map((c, i) => (
          <div key={i} className="text-xs">
            <div className="flex justify-between text-gray-700 mb-1">
              <span>{c.category}</span>
              <span className="font-semibold">S/ {c.amount.toFixed(2)} ({c.percentage}%)</span>
            </div>
            {simplifiedMode && (
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-green-500 h-full rounded-full"
                  style={{ width: `${c.percentage}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Consejo sin culpa */}
      <div className="p-3.5 bg-green-50/70 border border-green-200 rounded-2xl flex items-start gap-2.5">
        <Lightbulb size={18} className="text-green-700 shrink-0 mt-0.5" />
        <div className="text-xs text-green-950">
          <p className="font-semibold mb-0.5">Paso sugerido:</p>
          <p className="leading-relaxed">
            {simplifiedMode
              ? 'Llevar merienda 2 días ahorra S/ 30.'
              : insights.actionable_advice}
          </p>
        </div>
      </div>
    </div>
  );
};
