import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storage/storageService';
import { LLMFactory, SupportedLLMProvider } from './services/llm/llmFactory';
import { EcosystemSvg } from './components/EcosystemSvg';
import { VoiceModal } from './components/VoiceModal';
import { GoalsSection } from './components/GoalsSection';
import { AdvisorChat } from './components/AdvisorChat';
import { WeeklySummary } from './components/WeeklySummary';
import { AccessibilityControls } from './components/AccessibilityControls';
import {
  UserProfile,
  Transaction,
  Goal,
  CollaborativeGroup,
  EcosystemHealth,
  WeeklyInsight,
  AccessibilitySettings
} from './types';
import {
  Home,
  Target,
  Bot,
  ListOrdered,
  Settings,
  Mic,
  RotateCcw,
  RefreshCw,
  Sparkles,
  Wifi,
  WifiOff
} from 'lucide-react';

export const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile>(StorageService.getUserProfile());
  const [transactions, setTransactions] = useState<Transaction[]>(StorageService.getTransactions());
  const [goals, setGoals] = useState<Goal[]>(StorageService.getGoals());
  const [groups, setGroups] = useState<CollaborativeGroup[]>(StorageService.getGroups());
  const [activeTab, setActiveTab] = useState<'home' | 'goals' | 'advisor' | 'history' | 'settings'>('home');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [lastSavedTxId, setLastSavedTxId] = useState<string | null>(null);
  const [undoToastVisible, setUndoToastVisible] = useState(false);
  const [undoCountdown, setUndoCountdown] = useState(10);
  const [currentLLM, setCurrentLLM] = useState<SupportedLLMProvider>(LLMFactory.getCurrentProviderType());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Temporizador para Deshacer (10s según FR-25)
  useEffect(() => {
    let timer: any;
    if (undoToastVisible && undoCountdown > 0) {
      timer = setTimeout(() => setUndoCountdown((prev) => prev - 1), 1000);
    } else if (undoCountdown === 0) {
      setUndoToastVisible(false);
      setLastSavedTxId(null);
    }
    return () => clearTimeout(timer);
  }, [undoToastVisible, undoCountdown]);

  // Calcular salud dinámica del ecosistema basada en gastos de la semana
  const currentWeekSpent = transactions
    .filter(t => t.type === 'expense')
    .slice(0, 7)
    .reduce((acc, t) => acc + t.amount, 0);

  const budgetRatio = currentWeekSpent / (user.weekly_budget || 300);
  const ecosystemScore = Math.max(10, Math.min(100, Math.round(100 - (budgetRatio - 0.7) * 100)));

  const ecosystemHealth: EcosystemHealth = {
    score: ecosystemScore,
    state: ecosystemScore >= 70 ? 'thriving' : ecosystemScore >= 45 ? 'growing' : 'struggling',
    leaves_count: Math.round(ecosystemScore * 0.5),
    flowers_count: ecosystemScore >= 70 ? 8 : ecosystemScore >= 45 ? 3 : 0,
    description:
      ecosystemScore >= 70
        ? `Tu árbol está frondoso y saludable. Tus gastos (S/ ${currentWeekSpent.toFixed(2)}) están dentro del presupuesto.`
        : ecosystemScore >= 45
        ? `Tu árbol se mantiene estable. Has usado cerca del 80% de tu presupuesto semanal.`
        : `Tu árbol necesita cuidado: has superado tu presupuesto semanal, pero aún puedes recuperarlo con pequeños pasos.`,
    aria_speech: `Salud del ecosistema: ${ecosystemScore} sobre 100. Has gastado S/ ${currentWeekSpent.toFixed(2)} de tu presupuesto semanal de S/ ${user.weekly_budget.toFixed(2)}.`
  };

  const weeklyInsight: WeeklyInsight = {
    period: 'Semana Actual',
    total_spent: currentWeekSpent,
    top_categories: [
      { category: 'Comida', amount: 128.0, percentage: 54.5 },
      { category: 'Transporte', amount: 65.0, percentage: 27.6 },
      { category: 'Educación', amount: 42.0, percentage: 17.9 }
    ],
    pattern_detected: 'Mayor concentración de gastos en transporte al inicio de la semana.',
    actionable_advice: 'Considera recargar tu tarjeta con saldo semanal para evitar pagos imprevistos en efectivo.',
    non_judgmental_score: 100
  };

  const handleSaveExpense = (newTx: Transaction) => {
    const updated = StorageService.addTransaction(newTx);
    setTransactions(updated);
    setLastSavedTxId(newTx.id);
    setUndoCountdown(10);
    setUndoToastVisible(true);
  };

  const handleUndo = () => {
    if (lastSavedTxId) {
      const updated = StorageService.removeTransaction(lastSavedTxId);
      setTransactions(updated);
      setUndoToastVisible(false);
      setLastSavedTxId(null);
    }
  };

  const handleAddGoal = (newGoal: Goal) => {
    const updated = StorageService.addGoal(newGoal);
    setGoals(updated);
  };

  const handleContributeToGroup = (groupId: string, amount: number) => {
    const updated = groups.map((g) => {
      if (g.id === groupId) {
        return {
          ...g,
          current_amount: g.current_amount + amount,
          recent_contributions: [
            {
              id: 'c_' + Date.now(),
              member_name: 'Farid (Tú)',
              amount,
              date: new Date().toISOString().split('T')[0],
              note: 'Aporte rápido'
            },
            ...g.recent_contributions
          ]
        };
      }
      return g;
    });
    StorageService.saveGroups(updated);
    setGroups(updated);
  };

  const handleUpdateAccessibility = (newSettings: AccessibilitySettings) => {
    const updatedUser: UserProfile = { ...user, accessibility_profile: newSettings };
    setUser(updatedUser);
    StorageService.saveUserProfile(updatedUser);
  };

  const handleChangeProvider = (provider: SupportedLLMProvider) => {
    LLMFactory.setProviderType(provider);
    setCurrentLLM(provider);
  };

  const handleResetDemo = () => {
    const res = StorageService.resetToDemoData();
    setUser(res.user);
    setGoals(res.goals);
    setGroups(res.groups);
    setTransactions(res.transactions);
    alert('¡Datos simulados cargados con éxito! 30 días de transacciones restauradas.');
  };

  const isHighContrast = user.accessibility_profile.high_contrast;

  return (
    <div
      className={`min-h-screen pb-24 transition-colors duration-200 ${
        isHighContrast ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'
      }`}
      style={{ fontSize: `${user.accessibility_profile.text_scale * 100}%` }}
    >
      {/* Barra de Notificación / Toast Deshacer */}
      {undoToastVisible && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-gray-700">
          <span className="text-xs">Gasto registrado.</span>
          <button
            onClick={handleUndo}
            className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 underline underline-offset-2"
          >
            <RotateCcw size={13} /> Deshacer ({undoCountdown}s)
          </button>
        </div>
      )}

      {/* Cabecera Principal */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-3 shadow-xs">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-sm">
              🌳
            </div>
            <div>
              <h1 className="font-extrabold text-base text-gray-900 leading-tight">Alcancía Viva</h1>
              <p className="text-[10px] text-gray-500">Educación Financiera Personal</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDemo}
              title="Restaurar datos simulados (30 días)"
              className="px-2.5 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-[11px] font-semibold flex items-center gap-1 border border-green-200 transition"
            >
              <RefreshCw size={12} /> Cargar Demo
            </button>

            <span
              className={`p-1.5 rounded-full ${
                isOnline ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              }`}
              title={isOnline ? 'Conectado a la red' : 'Modo Offline (PWA)'}
            >
              {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
            </span>
          </div>
        </div>
      </header>

      {/* Contenido Principal según Tab */}
      <main className="max-w-md mx-auto p-4 space-y-4">
        {activeTab === 'home' && (
          <>
            {/* Ecosistema Central */}
            <EcosystemSvg
              health={ecosystemHealth}
              reducedMotion={user.accessibility_profile.reduced_motion}
            />

            {/* Píldoras de resumen rápido */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <span className="text-[11px] text-gray-400 font-medium">Límite Semanal</span>
                <p className="text-base font-bold text-gray-800 mt-0.5">
                  S/ {user.weekly_budget.toFixed(2)}
                </p>
                <div className="text-[10px] text-green-600 font-medium mt-1">
                  Disponible: S/ {(user.weekly_budget - currentWeekSpent).toFixed(2)}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <span className="text-[11px] text-gray-400 font-medium">Meta Principal</span>
                <p className="text-base font-bold text-gray-800 mt-0.5">
                  {goals[0]?.title || 'Ahorro'}
                </p>
                <div className="text-[10px] text-emerald-600 font-medium mt-1">
                  S/ {goals[0]?.current_amount} / S/ {goals[0]?.target_amount}
                </div>
              </div>
            </div>

            {/* Botón Central de Registro por Voz */}
            <div className="pt-2">
              <button
                onClick={() => setIsVoiceModalOpen(true)}
                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl shadow-md font-bold text-sm flex items-center justify-center gap-2 transition hover:scale-[1.01]"
              >
                <Mic size={20} />
                <span>Dictar o Escribir Gasto</span>
              </button>
            </div>

            {/* Resumen de hábitos */}
            <WeeklySummary
              insights={weeklyInsight}
              weeklyBudget={user.weekly_budget}
              simplifiedMode={user.accessibility_profile.simplified_mode}
            />
          </>
        )}

        {activeTab === 'goals' && (
          <GoalsSection
            goals={goals}
            groups={groups}
            onAddGoal={handleAddGoal}
            onContributeToGroup={handleContributeToGroup}
          />
        )}

        {activeTab === 'advisor' && (
          <AdvisorChat
            emotionalProfile={user.emotional_profile}
            weeklySummary={`Gastos de la semana: S/ ${currentWeekSpent}. Presupuesto: S/ ${user.weekly_budget}.`}
          />
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h4 className="font-bold text-gray-800 text-sm mb-4 flex items-center justify-between">
              <span>Historial de Movimientos ({transactions.length})</span>
              <span className="text-xs text-gray-400 font-normal">30 días simulados</span>
            </h4>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 bg-gray-50 rounded-xl flex items-center justify-between text-xs border border-gray-100"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{tx.description}</p>
                    <span className="text-[10px] text-gray-400">
                      {tx.date} • {tx.category} • {tx.source === 'voice' ? '🎙️ Voz' : '✏️ Texto'}
                    </span>
                  </div>
                  <span
                    className={`font-bold ${
                      tx.type === 'income' ? 'text-green-600' : 'text-gray-900'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'} S/ {tx.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <AccessibilityControls
            settings={user.accessibility_profile}
            onUpdateSettings={handleUpdateAccessibility}
            currentProvider={currentLLM}
            onChangeProvider={handleChangeProvider}
          />
        )}
      </main>

      {/* Barra de Navegación Inferior (Tabs) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 py-2 shadow-lg">
        <div className="max-w-md mx-auto grid grid-cols-5 text-center">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 py-1 ${
              activeTab === 'home' ? 'text-green-700 font-bold' : 'text-gray-400'
            }`}
          >
            <Home size={19} />
            <span className="text-[10px]">Inicio</span>
          </button>

          <button
            onClick={() => setActiveTab('goals')}
            className={`flex flex-col items-center gap-1 py-1 ${
              activeTab === 'goals' ? 'text-green-700 font-bold' : 'text-gray-400'
            }`}
          >
            <Target size={19} />
            <span className="text-[10px]">Metas</span>
          </button>

          {/* Botón flotante para captura rápida */}
          <button
            onClick={() => setIsVoiceModalOpen(true)}
            aria-label="Registrar gasto"
            className="flex flex-col items-center justify-center -mt-5"
          >
            <div className="w-13 h-13 rounded-full bg-green-600 text-white flex items-center justify-center shadow-lg hover:bg-green-700 transition">
              <Mic size={24} />
            </div>
          </button>

          <button
            onClick={() => setActiveTab('advisor')}
            className={`flex flex-col items-center gap-1 py-1 ${
              activeTab === 'advisor' ? 'text-green-700 font-bold' : 'text-gray-400'
            }`}
          >
            <Bot size={19} />
            <span className="text-[10px]">Asistente</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 py-1 ${
              activeTab === 'settings' ? 'text-green-700 font-bold' : 'text-gray-400'
            }`}
          >
            <Settings size={19} />
            <span className="text-[10px]">Ajustes</span>
          </button>
        </div>
      </nav>

      {/* Modal de Dictado / Escritura de Gastos */}
      <VoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSaveExpense={handleSaveExpense}
        onUndoLastExpense={handleUndo}
        canUndo={Boolean(lastSavedTxId)}
      />
    </div>
  );
};
