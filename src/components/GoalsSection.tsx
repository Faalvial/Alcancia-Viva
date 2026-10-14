import React, { useState } from 'react';
import { Goal, CollaborativeGroup } from '../types';
import { Target, Users, Plus, Shield, Sparkles, CheckCircle2 } from 'lucide-react';

interface GoalsSectionProps {
  goals: Goal[];
  groups: CollaborativeGroup[];
  onAddGoal: (goal: Goal) => void;
  onContributeToGroup: (groupId: string, amount: number) => void;
}

export const GoalsSection: React.FC<GoalsSectionProps> = ({
  goals,
  groups,
  onAddGoal,
  onContributeToGroup
}) => {
  const [activeTab, setActiveTab] = useState<'individual' | 'collaborative'>('individual');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newDate, setNewDate] = useState('');

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(newTarget);
    if (!newTitle.trim() || isNaN(target) || target <= 0) return;

    const goal: Goal = {
      id: 'goal_' + Date.now(),
      title: newTitle,
      target_amount: target,
      current_amount: 0,
      target_date: newDate || '2026-12-31',
      category: 'General',
      status: 'in_progress',
      weekly_target: Math.round(target / 8)
    };

    onAddGoal(goal);
    setNewTitle('');
    setNewTarget('');
    setNewDate('');
    setShowAddModal(false);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div className="flex bg-gray-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('individual')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'individual' ? 'bg-white text-green-800 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Target size={14} /> Metas Individuales
          </button>
          <button
            onClick={() => setActiveTab('collaborative')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'collaborative' ? 'bg-white text-green-800 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users size={14} /> Salas Compartidas
          </button>
        </div>

        {activeTab === 'individual' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="p-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-full transition"
            title="Crear nueva meta"
            aria-label="Crear nueva meta de ahorro"
          >
            <Plus size={18} />
          </button>
        )}
      </div>

      {activeTab === 'individual' ? (
        <div className="space-y-4">
          {goals.map((goal) => {
            const percentage = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
            return (
              <div key={goal.id} className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 hover:border-green-200 transition">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm">{goal.title}</h4>
                    <p className="text-xs text-gray-500">Fecha objetivo: {goal.target_date}</p>
                  </div>
                  <span className="text-xs font-bold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">
                    {percentage}%
                  </span>
                </div>

                {/* Barra de progreso visual */}
                <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden my-2">
                  <div
                    className="bg-green-600 h-full rounded-full transition-all duration-700"
                    style={{ width: `${percentage}%` }}
                    role="progressbar"
                    aria-valuenow={percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>

                <div className="flex justify-between text-xs text-gray-600 mt-2">
                  <span>Ahorrado: <strong>S/ {goal.current_amount.toFixed(2)}</strong></span>
                  <span>Meta: <strong>S/ {goal.target_amount.toFixed(2)}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => {
            const percentage = Math.min(100, Math.round((group.current_amount / group.target_amount) * 100));
            return (
              <div key={group.id} className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-emerald-900 text-base">{group.name}</h4>
                      <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-mono font-semibold">
                        Código: {group.invite_code}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                      <Shield size={12} className="text-emerald-700" />
                      Privacidad: <strong>Solo aportes visibles</strong> (gastos personales ocultos)
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-200 px-2.5 py-1 rounded-full">
                    {percentage}% común
                  </span>
                </div>

                {/* Barra compartida */}
                <div className="w-full bg-emerald-200/60 h-3 rounded-full overflow-hidden my-3">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-700"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs text-emerald-950 font-medium mb-3">
                  <span>Recolectado: <strong>S/ {group.current_amount.toFixed(2)}</strong></span>
                  <span>Meta grupal: <strong>S/ {group.target_amount.toFixed(2)}</strong></span>
                </div>

                {/* Miembros */}
                <div className="pt-2 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center -space-x-2">
                    {group.members.map((m, idx) => (
                      <div
                        key={m.id}
                        className="w-7 h-7 rounded-full bg-emerald-700 text-white text-[10px] flex items-center justify-center font-bold border-2 border-white shadow-sm"
                        title={`${m.name}: S/ ${m.contribution}`}
                      >
                        {m.name.charAt(0)}
                      </div>
                    ))}
                    <span className="text-[11px] text-emerald-800 pl-3 font-medium">
                      {group.members.length} colaboradores
                    </span>
                  </div>

                  <button
                    onClick={() => onContributeToGroup(group.id, 50)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm transition"
                  >
                    <Sparkles size={13} /> + S/ 50 Aporte Rápido
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal simple para crear nueva meta */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateGoal} className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl border">
            <h3 className="font-bold text-gray-800 text-base mb-4">Nueva Meta de Ahorro</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nombre de la meta:</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Laptop, Curso, Viaje"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Monto objetivo (S/):</label>
                <input
                  type="number"
                  required
                  placeholder="2000"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Fecha límite:</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-green-600 text-white hover:bg-green-700"
              >
                Crear Meta
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
