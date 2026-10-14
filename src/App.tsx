import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storage/storageService';
import { LLMFactory, SupportedLLMProvider } from './services/llm/llmFactory';
import { EcosystemSvg } from './components/EcosystemSvg';
import { VoiceModal } from './components/VoiceModal';
import { GoalsSection } from './components/GoalsSection';
import { AdvisorChat } from './components/AdvisorChat';
import { WeeklySummary } from './components/WeeklySummary';
import { AccessibilityControls } from './components/AccessibilityControls';
import { TeamMembers } from './components/TeamMembers';
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
  Users,
  Mic,
  RotateCcw,
  RefreshCw,
  Wifi,
  WifiOff,
  Sprout,
  Receipt,
  Edit3,
  Sliders,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  CreditCard
} from 'lucide-react';

export const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile>(StorageService.getUserProfile());
  const [transactions, setTransactions] = useState<Transaction[]>(StorageService.getTransactions());
  const [goals, setGoals] = useState<Goal[]>(StorageService.getGoals());
  const [groups, setGroups] = useState<CollaborativeGroup[]>(StorageService.getGroups());
  const [activeTab, setActiveTab] = useState<'home' | 'goals' | 'advisor' | 'history' | 'team'>('home');
  const [teamSubTab, setTeamSubTab] = useState<'members' | 'settings'>('members');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [lastSavedTxId, setLastSavedTxId] = useState<string | null>(null);
  const [undoToastVisible, setUndoToastVisible] = useState(false);
  const [undoCountdown, setUndoCountdown] = useState(10);
  const [currentLLM, setCurrentLLM] = useState<SupportedLLMProvider>(LLMFactory.getCurrentProviderType());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'expense' | 'income'>('all');

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
    alert('Datos simulados cargados con éxito. 30 días de transacciones restauradas.');
  };

  const isHighContrast = user.accessibility_profile.high_contrast;

  const filteredTransactions = transactions.filter(tx => {
    if (historyFilter === 'all') return true;
    return tx.type === historyFilter;
  });

  return (
    <div
      className={`min-h-screen flex justify-center transition-colors duration-200 ${
        isHighContrast ? 'bg-black text-white' : 'bg-slate-100 text-gray-900'
      }`}
      style={{ fontSize: `${user.accessibility_profile.text_scale * 100}%` }}
    >
      {/* Contenedor simulador móvil en desktop / nativo en teléfono */}
      <div className={`w-full max-w-md min-h-screen flex flex-col relative pb-20 shadow-2xl transition-all ${
        isHighContrast ? 'bg-black' : 'bg-slate-50'
      }`}>
        
        {/* Barra de Notificación / Toast Deshacer */}
        {undoToastVisible && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-bounce">
            <span className="text-xs">Movimiento guardado</span>
            <button
              onClick={handleUndo}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 underline underline-offset-2"
            >
              <RotateCcw size={13} /> Deshacer ({undoCountdown}s)
            </button>
          </div>
        )}

        {/* Cabecera Móvil */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-700 flex items-center justify-center text-white shadow-sm">
                <Sprout size={20} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-extrabold text-base text-slate-900 tracking-tight leading-none">Alcancía Viva</h1>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">UNI</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Educación Financiera Personal</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetDemo}
                title="Restaurar datos simulados (30 días)"
                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-[11px] font-semibold flex items-center gap-1 border border-emerald-200 transition active:scale-95"
              >
                <RefreshCw size={12} />
                <span className="hidden xs:inline">Demo</span>
              </button>

              <span
                className={`p-2 rounded-xl border ${
                  isOnline 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
                title={isOnline ? 'Conectado a la red' : 'Modo Offline (PWA)'}
              >
                {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
              </span>
            </div>
          </div>
        </header>

        {/* Contenido Principal con Scroll Móvil */}
        <main className="flex-1 p-4 space-y-4 overflow-y-auto">
          {activeTab === 'home' && (
            <>
              {/* Ecosistema Central */}
              <EcosystemSvg
                health={ecosystemHealth}
                reducedMotion={user.accessibility_profile.reduced_motion}
              />

              {/* Tarjetas de Resumen Financiero Rápido */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Límite Semanal</span>
                  <p className="text-base font-extrabold text-slate-900 mt-1">
                    S/ {user.weekly_budget.toFixed(2)}
                  </p>
                  <div className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Restan S/ {(user.weekly_budget - currentWeekSpent).toFixed(2)}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Meta Activa</span>
                  <p className="text-base font-extrabold text-slate-900 mt-1 truncate">
                    {goals[0]?.title || 'Ahorro'}
                  </p>
                  <div className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    S/ {goals[0]?.current_amount} / S/ {goals[0]?.target_amount}
                  </div>
                </div>
              </div>

              {/* Botón Principal Móvil: Dictar o Escribir */}
              <div className="pt-1">
                <button
                  onClick={() => setIsVoiceModalOpen(true)}
                  className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white rounded-3xl shadow-md font-bold text-sm flex items-center justify-center gap-2.5 transition"
                >
                  <Mic size={20} />
                  <span>Dictar o Registrar Movimiento</span>
                </button>
              </div>

              {/* Enlace rápido a historial */}
              <button
                onClick={() => setActiveTab('history')}
                className="w-full p-3 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs text-slate-700 font-semibold transition"
              >
                <div className="flex items-center gap-2">
                  <Receipt size={16} className="text-emerald-700" />
                  <span>Ver {transactions.length} transacciones registradas</span>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </button>

              {/* Resumen de hábitos de consumo */}
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
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Historial de Transacciones</h3>
                  <p className="text-[11px] text-slate-500">30 días de registros analizados</p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  {filteredTransactions.length} registros
                </span>
              </div>

              {/* Filtros rápidos */}
              <div className="flex gap-1.5 mb-4 p-1 bg-slate-100 rounded-2xl text-xs font-semibold">
                <button
                  onClick={() => setHistoryFilter('all')}
                  className={`flex-1 py-1.5 rounded-xl transition ${
                    historyFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setHistoryFilter('expense')}
                  className={`flex-1 py-1.5 rounded-xl transition ${
                    historyFilter === 'expense' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Gastos
                </button>
                <button
                  onClick={() => setHistoryFilter('income')}
                  className={`flex-1 py-1.5 rounded-xl transition ${
                    historyFilter === 'income' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Ingresos
                </button>
              </div>

              <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
                {filteredTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 bg-slate-50/80 hover:bg-slate-100/80 rounded-2xl flex items-center justify-between text-xs border border-slate-100 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {tx.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{tx.description}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                          <span>{tx.date}</span>
                          <span>•</span>
                          <span className="font-medium text-slate-500">{tx.category}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            {tx.source === 'voice' ? (
                              <><Mic size={10} className="text-emerald-700" /> Voz</>
                            ) : tx.source === 'text' ? (
                              <><Edit3 size={10} className="text-blue-700" /> Texto</>
                            ) : (
                              <><CreditCard size={10} className="text-slate-700" /> Manual</>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`font-mono font-bold text-sm ${
                        tx.type === 'income' ? 'text-emerald-700' : 'text-slate-900'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'} S/ {tx.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-4">
              {/* Selector de sub-vista */}
              <div className="flex bg-slate-200/70 p-1 rounded-2xl text-xs font-semibold">
                <button
                  onClick={() => setTeamSubTab('members')}
                  className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition ${
                    teamSubTab === 'members' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  <Users size={14} /> Integrantes del Proyecto
                </button>
                <button
                  onClick={() => setTeamSubTab('settings')}
                  className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition ${
                    teamSubTab === 'settings' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  <Sliders size={14} /> Accesibilidad & LLM
                </button>
              </div>

              {teamSubTab === 'members' ? (
                <TeamMembers />
              ) : (
                <AccessibilityControls
                  settings={user.accessibility_profile}
                  onUpdateSettings={handleUpdateAccessibility}
                  currentProvider={currentLLM}
                  onChangeProvider={handleChangeProvider}
                />
              )}
            </div>
          )}
        </main>

        {/* Barra de Navegación Inferior Móvil (Bottom Navigation) */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none">
          <div className="w-full max-w-md bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-3 shadow-lg pointer-events-auto grid grid-cols-5 items-center text-center">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center gap-1 py-1 transition ${
                activeTab === 'home' ? 'text-emerald-700 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Home size={19} />
              <span className="text-[10px]">Inicio</span>
            </button>

            <button
              onClick={() => setActiveTab('goals')}
              className={`flex flex-col items-center gap-1 py-1 transition ${
                activeTab === 'goals' ? 'text-emerald-700 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Target size={19} />
              <span className="text-[10px]">Metas</span>
            </button>

            {/* Botón flotante central de captura de voz */}
            <div className="flex flex-col items-center justify-center -mt-6">
              <button
                onClick={() => setIsVoiceModalOpen(true)}
                aria-label="Registrar movimiento por voz o texto"
                className="w-13 h-13 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center shadow-lg ring-4 ring-white active:scale-90 transition"
              >
                <Mic size={22} />
              </button>
            </div>

            <button
              onClick={() => setActiveTab('advisor')}
              className={`flex flex-col items-center gap-1 py-1 transition ${
                activeTab === 'advisor' ? 'text-emerald-700 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Bot size={19} />
              <span className="text-[10px]">Asistente</span>
            </button>

            <button
              onClick={() => setActiveTab('team')}
              className={`flex flex-col items-center gap-1 py-1 transition ${
                activeTab === 'team' ? 'text-emerald-700 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Users size={19} />
              <span className="text-[10px]">Equipo</span>
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
    </div>
  );
};
