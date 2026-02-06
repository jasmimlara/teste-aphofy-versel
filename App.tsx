
import React, { useState, useEffect, createContext, useContext, useCallback, useMemo } from 'react';
import { Tab, Habit, Task, Transaction, Achievement, UserState, Challenge, Bill } from './types';
import { Navigation } from './components/Navigation';
import { HomeTab } from './tabs/Home';
import { HabitsTab } from './tabs/Habits';
import { PomodoroTab } from './tabs/Pomodoro';
import { FinanceTab } from './tabs/Finance';
import { ProfileTab } from './tabs/Profile';
import { Modal } from './components/Modal';
import { INITIAL_ACHIEVEMENTS, LEVELS, SAMPLE_HABITS, SAMPLE_TASKS, SAMPLE_TRANSACTIONS } from './constants';
import { Award, CheckCircle2, Info, CheckCircle, Flame, Sparkles, Plus, Trash2, Zap, Star } from 'lucide-react';
import { GlassCard } from './components/GlassCard';
import confetti from 'canvas-confetti';

interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  subMessage?: string;
}

interface AppContextType {
  user: UserState;
  setUser: (user: UserState) => void;
  habits: Habit[];
  setHabits: (habits: Habit[] | ((prev: Habit[]) => Habit[])) => void;
  tasks: Task[];
  setTasks: (tasks: Task[] | ((prev: Task[]) => Task[])) => void;
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[] | ((prev: Transaction[]) => Transaction[])) => void;
  bills: Bill[];
  setBills: (bills: Bill[] | ((prev: Bill[]) => Bill[])) => void;
  achievements: Achievement[];
  challenges: Challenge[];
  addPoints: (pts: number, reason?: string) => void;
  checkAchievements: () => void;
  notify: (type: Notification['type'], message: string, subMessage?: string) => void;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  showHabitModal: boolean;
  setShowHabitModal: (val: boolean) => void;
  showTaskModal: boolean;
  setShowTaskModal: (val: boolean) => void;
  showTransactionModal: boolean;
  setShowTransactionModal: (val: boolean) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.HOME);
  const [showLevelUp, setShowLevelUp] = useState<number | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Modal states
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  // States with hydration from localStorage
  const [user, setUser] = useState<UserState>(() => {
    const saved = localStorage.getItem('user');
    const defaultUser: UserState = {
      name: 'Guerreiro da Luz',
      level: 1,
      points: 0,
      totalPoints: 0,
      streak: 1,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
      bio: 'Minha jornada rumo à maestria começa hoje.',
      email: 'heroi@mural.com',
      pomodoroSessions: 0,
      title: 'Iniciante 🐣',
      theme: 'default',
      joinDate: new Date().toISOString(),
      onboardingCompleted: false,
      pushNotifications: true,
      autoFocusMode: false,
      totalPrivacy: true,
      pomodoroConfig: {
        workTime: 25,
        shortBreak: 5,
        longBreak: 15,
        autoStartBreaks: false,
        autoStartFocus: false,
        soundEnabled: true
      },
      dailySpins: 0,
      totalSpins: 0,
      bonusXPEarned: 0,
      bestMultiplier: 1
    };
    return saved ? { ...defaultUser, ...JSON.parse(saved) } : defaultUser;
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('habits');
    return saved ? JSON.parse(saved) : SAMPLE_HABITS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : SAMPLE_TASKS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : SAMPLE_TRANSACTIONS;
  });

  const [bills, setBills] = useState<Bill[]>(() => {
    const saved = localStorage.getItem('bills');
    return saved ? JSON.parse(saved) : [];
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem('achievements');
    return saved ? JSON.parse(saved) : INITIAL_ACHIEVEMENTS;
  });

  // Local Storage persistence
  useEffect(() => { localStorage.setItem('user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('habits', JSON.stringify(habits)); }, [habits]);
  useEffect(() => { localStorage.setItem('tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('bills', JSON.stringify(bills)); }, [bills]);
  useEffect(() => { localStorage.setItem('achievements', JSON.stringify(achievements)); }, [achievements]);

  // Daily reset for spins
  useEffect(() => {
    const today = new Date().toDateString();
    if (user.lastSpinDate !== today) {
      setUser(prev => ({ ...prev, dailySpins: 0, lastSpinDate: today }));
    }
  }, [user.lastSpinDate]);

  const notify = useCallback((type: Notification['type'], message: string, subMessage?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, type, message, subMessage }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);

  const addPoints = useCallback((pts: number, reason?: string) => {
    setUser(prev => {
      let newTotal = prev.totalPoints + pts;
      let currentLevel = prev.level;
      let nextLevelData = LEVELS.find(l => l.level === currentLevel + 1);
      
      if (nextLevelData && newTotal >= nextLevelData.minXp) {
        currentLevel++;
        setShowLevelUp(currentLevel);
        confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });
      }

      const currentLevelData = LEVELS.find(l => l.level === currentLevel) || LEVELS[0];
      return { 
        ...prev, 
        totalPoints: newTotal, 
        points: newTotal,
        level: currentLevel,
        title: currentLevelData.title
      };
    });

    if (reason) notify('success', `+${pts} XP!`, reason);

    const div = document.createElement('div');
    div.className = 'xp-gain';
    div.innerText = `+${pts} XP`;
    div.style.left = `${Math.random() * 60 + 20}%`;
    div.style.top = `${Math.random() * 40 + 30}%`;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 1200);
  }, [notify]);

  const checkAchievements = useCallback(() => {
    setAchievements(prev => {
      let changed = false;
      const balance = transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);

      const updated = prev.map(ach => {
        if (ach.unlocked) return ach;
        let currentProgress = ach.progress;
        
        // --- Lógica de Hábitos ---
        if (ach.id === 'step1') currentProgress = habits.some(h => h.days.some(d => d.completed)) ? 1 : 0;
        if (ach.id === 'week_green') currentProgress = Math.max(...habits.map(h => h.streak), 0);
        if (ach.id === 'fire_month') currentProgress = Math.max(...habits.map(h => h.streak), 0);
        if (ach.id === 'legend') currentProgress = Math.max(...habits.map(h => h.streak), 0);
        if (ach.id === 'rocket') currentProgress = habits.filter(h => h.streak >= 7).length;

        // --- Lógica de Missões (Tasks) ---
        if (ach.id === 'tasks_10') currentProgress = tasks.filter(t => t.completed).length;
        if (ach.id === 'multitask') currentProgress = tasks.filter(t => t.completed).length;

        // --- Lógica de Pomodoro ---
        if (ach.id === 'pomo_start') currentProgress = user.pomodoroSessions >= 1 ? 1 : 0;
        if (ach.id === 'pomo_10') currentProgress = user.pomodoroSessions;
        if (ach.id === 'pomo_100') currentProgress = user.pomodoroSessions;

        // --- Lógica de Finanças ---
        if (ach.id === 'first_bill') currentProgress = bills.length >= 1 ? 1 : 0;
        if (ach.id === 'savings_5k') currentProgress = Math.max(0, Math.floor(balance));
        if (ach.id === 'economist_legend') currentProgress = Math.max(0, Math.floor(balance));

        // --- Lógica de Nível ---
        if (ach.id === 'level_5') currentProgress = user.level;
        if (ach.id === 'level_10') currentProgress = user.level;
        
        const isUnlocked = currentProgress >= ach.total;
        if (isUnlocked && !ach.unlocked) {
          changed = true;
          notify('success', `🏆 CONQUISTA: ${ach.title}`, ach.description);
          confetti({ particleCount: 150, colors: ['#FF8C42', '#FFD700', '#4ECDC4'] });
        }
        return { ...ach, progress: currentProgress, unlocked: isUnlocked, unlockedAt: isUnlocked ? new Date().toISOString() : undefined };
      });
      return changed ? updated : prev;
    });
  }, [habits, tasks, transactions, bills, user.pomodoroSessions, user.level, notify]);

  const challenges = useMemo(() => [
    { 
      id: 'c1', title: 'Mestre da Rotina', description: 'Complete 3 ritos hoje', 
      rewardXp: 150, total: 3, 
      progress: habits.filter(h => h.lastChecked === new Date().toDateString()).length,
      completed: habits.filter(h => h.lastChecked === new Date().toDateString()).length >= 3,
      icon: '🔥' 
    },
    { 
      id: 'c2', title: 'Foco de Elite', description: 'Conclua 2 sessões Pomodoro', 
      rewardXp: 100, total: 2, 
      progress: Math.min(2, user.pomodoroSessions % 2 === 0 && user.pomodoroSessions > 0 ? 2 : user.pomodoroSessions % 2),
      completed: user.pomodoroSessions >= 2,
      icon: '🛡️' 
    },
  ], [habits, user.pomodoroSessions]);

  const contextValue: AppContextType = {
    user, setUser, habits, setHabits, tasks, setTasks, 
    transactions, setTransactions, bills, setBills,
    achievements, challenges, addPoints, checkAchievements, 
    notify, activeTab, setActiveTab,
    showHabitModal, setShowHabitModal,
    showTaskModal, setShowTaskModal,
    showTransactionModal, setShowTransactionModal
  };

  const renderTab = () => {
    switch (activeTab) {
      case Tab.HOME: return <HomeTab />;
      case Tab.HABITS: return <HabitsTab />;
      case Tab.POMODORO: return <PomodoroTab />;
      case Tab.TASKS: return <TasksTab />;
      case Tab.FINANCE: return <FinanceTab />;
      case Tab.PROFILE: return <ProfileTab />;
      case Tab.ACHIEVEMENTS: return <AchievementsTab />;
      default: return <HomeTab />;
    }
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen bg-black text-white selection:bg-orange-500/30 selection:text-white">
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="md:ml-64 p-4 md:p-8 min-h-screen relative">
          <div className="max-w-6xl mx-auto">
            {renderTab()}
          </div>
        </main>

        {/* Onboarding Modal */}
        {!user.onboardingCompleted && (
          <Modal isOpen={true} onClose={() => setUser({...user, onboardingCompleted: true})} title="BEM-VINDO AO APROHFY! 🚀">
            <div className="space-y-6 text-center">
              <div className="w-24 h-24 bg-orange-500/20 rounded-3xl mx-auto flex items-center justify-center text-orange-500">
                <div className="animate-bounce-subtle"><Sparkles size={48} /></div>
              </div>
              <div className="space-y-2">
                <p className="font-bold text-lg">Inicie sua evolução hoje.</p>
                <p className="text-sm text-gray-400 leading-relaxed">Este é o seu portal de poder. Aqui você forja hábitos, completa missões e sobe de nível. Ganhe XP e desbloqueie sua melhor versão.</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="glass p-4 rounded-2xl border-none">
                  <Flame size={20} className="text-orange-500 mb-2" />
                  <p className="text-[10px] font-black uppercase">Fogo Vital</p>
                  <p className="text-[9px] text-gray-500">Mantenha seus ritos acesos.</p>
                </div>
                <div className="glass p-4 rounded-2xl border-none">
                  <Award size={20} className="text-yellow-500 mb-2" />
                  <p className="text-[10px] font-black uppercase">Glória & XP</p>
                  <p className="text-[9px] text-gray-500">Cresça a cada ação.</p>
                </div>
              </div>
              <button 
                onClick={() => setUser({...user, onboardingCompleted: true})}
                className="w-full py-5 bg-orange-500 rounded-2xl font-black italic shadow-lg shadow-orange-500/20 hover:scale-[1.02] transition-all"
              >
                INICIAR JORNADA
              </button>
            </div>
          </Modal>
        )}

        {/* Notifications */}
        <div className="fixed top-6 right-6 z-[2000] flex flex-col gap-3 pointer-events-none w-full max-w-sm">
          {notifications.map(notif => (
            <div key={notif.id} className="pointer-events-auto animate-in slide-in-from-right duration-300">
              <GlassCard className={`flex items-start gap-3 p-4 border-l-4 shadow-2xl ${
                notif.type === 'success' ? 'border-l-green-500 bg-green-950/60' :
                notif.type === 'info' ? 'border-l-orange-500 bg-orange-950/60' :
                'border-l-red-500 bg-red-950/60'
              }`}>
                <div className="shrink-0">
                  {notif.type === 'success' ? <CheckCircle size={20} className="text-green-500" /> : <Info size={20} className="text-orange-500" />}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{notif.message}</p>
                  {notif.subMessage && <p className="text-xs text-gray-400">{notif.subMessage}</p>}
                </div>
              </GlassCard>
            </div>
          ))}
        </div>

        {/* Level Up Pop-up */}
        {showLevelUp && (
          <div className="fixed inset-0 z-[2100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
            <div className="level-up-container text-center space-y-8 max-w-lg">
              <div className="relative inline-block">
                <div className="absolute inset-0 blur-3xl bg-orange-500/40 rounded-full animate-pulse"></div>
                <h1 className="relative text-7xl md:text-8xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 drop-shadow-2xl">EVOLUIU!</h1>
              </div>
              <div className="space-y-4">
                <p className="text-3xl font-bold">Nível {showLevelUp} Alcançado!</p>
                <p className="text-gray-400 font-medium text-lg uppercase tracking-widest">Sua disciplina forjou um novo patamar.</p>
              </div>
              <button onClick={() => setShowLevelUp(null)} className="px-16 py-6 bg-orange-500 rounded-3xl font-black italic shadow-2xl shadow-orange-500/40 text-xl hover:scale-110 transition-transform">CONTINUAR</button>
            </div>
          </div>
        )}
      </div>
    </AppContext.Provider>
  );
};

// Sub-components
const TasksTab: React.FC = () => {
  const context = useContext(AppContext);
  const [taskName, setTaskName] = useState('');
  
  // Slot Machine states
  const [isSpinning, setIsSpinning] = useState(false);
  const [slotResult, setSlotResult] = useState<{
    task: Task;
    multiplier: number;
    bonusXP: number;
    reels: string[];
  } | null>(null);
  const [reelPositions, setReelPositions] = useState([0, 0, 0]);
  
  const slotIcons = ['💎', '⚡', '🔥', '⭐', '🎯', '💰', '🏆', '🎁'];
  const maxSpins = 3;

  if (!context) return null;

  const handleSpin = () => {
    const pendingTasks = context.tasks.filter(t => !t.completed);
    if (isSpinning || context.user.dailySpins >= maxSpins || pendingTasks.length === 0) {
      if (pendingTasks.length === 0) context.notify('warning', 'Sem missões', 'Adicione missões pendentes para poder girar!');
      return;
    }

    setIsSpinning(true);
    setSlotResult(null);

    // Simulated spinning duration
    const spinDuration = 2500;
    const interval = 80;
    const startTime = Date.now();

    const spinInterval = setInterval(() => {
      setReelPositions([
        Math.floor(Math.random() * slotIcons.length),
        Math.floor(Math.random() * slotIcons.length),
        Math.floor(Math.random() * slotIcons.length)
      ]);

      if (Date.now() - startTime > spinDuration) {
        clearInterval(spinInterval);
        finalizeSpin();
      }
    }, interval);
  };

  const finalizeSpin = () => {
    const pendingTasks = context.tasks.filter(t => !t.completed);
    const randomTask = pendingTasks[Math.floor(Math.random() * pendingTasks.length)];
    
    // Determine combination
    const finalReels = [
      Math.floor(Math.random() * slotIcons.length),
      Math.floor(Math.random() * slotIcons.length),
      Math.floor(Math.random() * slotIcons.length)
    ];
    setReelPositions(finalReels);

    const r1 = slotIcons[finalReels[0]];
    const r2 = slotIcons[finalReels[1]];
    const r3 = slotIcons[finalReels[2]];

    let multiplier = 1.5;
    let bonus = 50;

    if (r1 === r2 && r2 === r3) {
      multiplier = 5; // Jackpot
      bonus = 200;
      confetti({ particleCount: 200, colors: ['#FFD93D', '#FF6B35'], spread: 90 });
    } else if (r1 === r2 || r2 === r3 || r1 === r3) {
      multiplier = 3; // Pair
      bonus = 100;
      confetti({ particleCount: 100, colors: ['#4ECDC4', '#FFFFFF'] });
    }

    const result = {
      task: randomTask,
      multiplier,
      bonusXP: bonus,
      reels: [r1, r2, r3]
    };

    setSlotResult(result);
    setIsSpinning(false);
    
    context.setUser({
      ...context.user,
      dailySpins: context.user.dailySpins + 1,
      totalSpins: context.user.totalSpins + 1,
      bonusXPEarned: context.user.bonusXPEarned + bonus,
      bestMultiplier: Math.max(context.user.bestMultiplier, multiplier)
    });
  };

  const acceptSlotMission = () => {
    if (!slotResult) return;
    
    context.setTasks(prev => prev.map(t => 
      t.id === slotResult.task.id 
        ? { ...t, multiplier: slotResult.multiplier, bonusXP: slotResult.bonusXP, isHighlighted: true } 
        : t
    ));
    
    context.notify('success', 'Missão Energizada!', `"${slotResult.task.title}" agora vale muito mais!`);
    setSlotResult(null);
    
    // Scroll to the task
    setTimeout(() => {
      document.getElementById(`task-${slotResult.task.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;
    const task: Task = { 
      id: Date.now().toString(), 
      title: taskName, 
      dueDate: new Date().toISOString(), 
      priority: 'Medium', 
      points: 50, 
      completed: false 
    };
    context.setTasks(prev => [...prev, task]);
    context.setShowTaskModal(false);
    setTaskName('');
    context.notify('success', 'Nova Missão!', 'A meta foi definida no seu mural.');
  };

  const toggleTask = useCallback((id: string) => {
    context.setTasks(prev => prev.map(t => {
      if (t.id === id) {
        if (!t.completed) {
          const finalPoints = Math.floor((t.points * (t.multiplier || 1)) + (t.bonusXP || 0));
          context.addPoints(finalPoints, `Missão "${t.title}" concluída`);
          confetti({ particleCount: 50, origin: { y: 0.8 }, colors: ['#FF8C42', '#FFFFFF'] });
        }
        return { ...t, completed: !t.completed, isHighlighted: false };
      }
      return t;
    }));
    setTimeout(() => context.checkAchievements(), 500);
  }, [context]);

  const removeTask = useCallback((id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Deseja deletar esta missão permanentemente?")) {
      context.setTasks(prev => prev.filter(t => t.id !== id));
      context.notify('info', 'Missão descartada.');
    }
  }, [context]);

  return (
    <div className="space-y-8 animate-in fade-in pb-20">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Minhas Missões</h2>
          <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mt-1">Sua lista de objetivos táticos</p>
        </div>
        <button 
          onClick={() => context.setShowTaskModal(true)} 
          className="bg-orange-500 text-white p-5 rounded-2xl shadow-xl shadow-orange-500/30 hover:scale-110 transition-all active:scale-95"
        >
          <Plus size={28} />
        </button>
      </header>

      {/* Roda da Fortuna Section */}
      <GlassCard className="p-8 mb-6 relative overflow-hidden border-none group bg-zinc-900/40">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-yellow-500/5 to-purple-500/5 opacity-50"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h3 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3 text-white">
                <Sparkles className="text-yellow-400" /> Roda da Fortuna
              </h3>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mt-1">
                Gire e ganhe bônus épicos para suas missões!
              </p>
            </div>
            <div className="text-right glass px-5 py-3 rounded-2xl border-white/5">
              <span className="text-xs font-black text-yellow-400 uppercase tracking-widest">
                🎲 {maxSpins - context.user.dailySpins} Giros Restantes
              </span>
              <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">
                Reset diário à meia-noite
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-6">
            <div className="relative mb-10 p-4 bg-gradient-to-b from-zinc-800 to-zinc-950 rounded-[3rem] border-4 border-yellow-500/30 shadow-[0_0_50px_rgba(255,217,61,0.15)] animate-pulse-gold">
              <div className="flex gap-4 md:gap-6 p-6 md:p-8 bg-black/60 rounded-[2rem] border border-white/5 shadow-inner">
                {reelPositions.map((pos, idx) => (
                  <div key={idx} className="w-20 h-28 md:w-28 md:h-36 bg-white/5 rounded-2xl overflow-hidden relative flex items-center justify-center border border-white/10">
                    <div 
                      className={`text-5xl md:text-7xl transition-all duration-300 ${isSpinning ? 'blur-sm scale-90 translate-y-2' : 'scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]'}`}
                    >
                      {slotIcons[pos]}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Casino Lights */}
              <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-yellow-400 shadow-[0_0_15px_#FFD93D] animate-pulse"></div>
              <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-orange-500 shadow-[0_0_15px_#FF6B35] animate-pulse delay-75"></div>
              <div className="absolute -bottom-3 -left-3 w-6 h-6 rounded-full bg-purple-500 shadow-[0_0_15px_#A78BFA] animate-pulse delay-150"></div>
              <div className="absolute -bottom-3 -right-3 w-6 h-6 rounded-full bg-emerald-400 shadow-[0_0_15px_#4ECDC4] animate-pulse delay-200"></div>
            </div>

            <button
              onClick={handleSpin}
              disabled={isSpinning || context.user.dailySpins >= maxSpins || context.tasks.filter(t => !t.completed).length === 0}
              className={`
                px-16 py-6 rounded-3xl font-black italic uppercase text-2xl tracking-tighter
                bg-gradient-to-r from-orange-500 to-yellow-500
                hover:scale-110 active:scale-95
                shadow-2xl shadow-orange-500/40
                disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed
                transition-all duration-500 text-white flex items-center gap-3
              `}
            >
              {isSpinning ? <Zap className="animate-spin" /> : 'GIRAR!'}
            </button>

            {slotResult && (
              <div className="mt-10 w-full max-w-md p-8 glass bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-3xl border-2 border-yellow-500/30 animate-in zoom-in-95 duration-500 shadow-2xl">
                <h4 className="text-center text-3xl font-black italic uppercase text-white mb-6 drop-shadow-lg">
                   🎉 VITÓRIA! 🎉
                </h4>
                
                <div className="space-y-4 text-center mb-8">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Missão Sorteada</span>
                    <p className="text-xl font-black text-white italic truncate max-w-xs uppercase">{slotResult.task.title}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-orange-500/10 p-4 rounded-2xl border border-orange-500/20">
                      <span className="text-[10px] font-black text-orange-500 uppercase">Multiplicador</span>
                      <p className="text-2xl font-black text-white italic">{slotResult.multiplier}x</p>
                    </div>
                    <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
                      <span className="text-[10px] font-black text-emerald-500 uppercase">Bônus Fixo</span>
                      <p className="text-2xl font-black text-white italic">+{slotResult.bonusXP} XP</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={acceptSlotMission}
                    className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 rounded-2xl font-black italic text-sm uppercase transition-all shadow-xl shadow-orange-500/20 text-white"
                  >
                    ACEITAR
                  </button>
                  <button 
                    onClick={() => setSlotResult(null)}
                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black italic text-sm uppercase transition-all text-gray-500"
                  >
                    FECHAR
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-6 pt-8 mt-4 border-t border-white/5">
            <div className="text-center group">
              <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1 group-hover:text-gray-400">Giros Totais</p>
              <p className="text-2xl font-black italic text-white">{context.user.totalSpins}</p>
            </div>
            <div className="text-center group">
              <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1 group-hover:text-gray-400">XP Acumulado</p>
              <p className="text-2xl font-black italic text-yellow-400">+{context.user.bonusXPEarned}</p>
            </div>
            <div className="text-center group">
              <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1 group-hover:text-gray-400">Melhor Multi.</p>
              <p className="text-2xl font-black italic text-orange-500">{context.user.bestMultiplier}x</p>
            </div>
          </div>
        </div>
      </GlassCard>

      {context.tasks.length === 0 ? (
        <div className="py-32 text-center glass rounded-[3rem] border-dashed border-2 border-white/5 opacity-50">
          <p className="text-6xl mb-6">🎯</p>
          <p className="text-xl font-bold italic">Sem missões ativas.</p>
          <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest">Adicione tarefas para começar a ganhar glória</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {context.tasks.map(task => (
            <GlassCard 
              key={task.id} 
              id={`task-${task.id}`}
              onClick={() => toggleTask(task.id)}
              className={`flex items-center gap-5 p-6 border-white/5 group relative cursor-pointer pointer-events-auto transition-all duration-300 
                ${task.completed ? 'opacity-40 grayscale-[0.5]' : 'hover:scale-[1.01]'} 
                ${task.isHighlighted ? 'border-yellow-500/50 bg-yellow-500/5 shadow-[0_0_20px_rgba(255,217,61,0.1)]' : ''}`}
            >
              <div 
                className={`w-10 h-10 rounded-2xl border-2 transition-all flex items-center justify-center shrink-0 
                  ${task.completed ? 'bg-orange-500 border-orange-500' : 'border-zinc-700 group-hover:border-orange-500'} 
                  ${task.isHighlighted && !task.completed ? 'border-yellow-500 text-yellow-500' : ''}`}
              >
                {task.completed ? <CheckCircle2 size={24} className="text-white" /> : (task.isHighlighted && <Star size={20} className="animate-pulse" />)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-black text-lg truncate transition-all ${task.completed ? 'line-through text-gray-500 italic' : 'text-white'}`}>{task.title}</p>
                <div className="flex items-center gap-3 mt-1">
                   <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${task.isHighlighted ? 'bg-yellow-500/20 text-yellow-500' : 'bg-orange-500/10 text-orange-500'}`}>
                     +{Math.floor((task.points * (task.multiplier || 1)) + (task.bonusXP || 0))} XP
                   </span>
                   {task.multiplier && <span className="text-[10px] font-black text-orange-400 uppercase italic">{task.multiplier}x Bonus</span>}
                   <span className="text-[10px] font-bold text-gray-500 uppercase">{new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
              <button 
                onClick={(e) => removeTask(task.id, e)} 
                className="relative z-30 text-red-500/30 hover:text-red-500 p-4 transition-all hover:bg-red-500/10 rounded-2xl -mr-2"
                aria-label="Deletar missão"
              >
                <Trash2 size={22} />
              </button>
            </GlassCard>
          ))}
        </div>
      )}

      <Modal isOpen={context.showTaskModal} onClose={() => context.setShowTaskModal(false)} title="Novo Objetivo">
        <form onSubmit={addTask} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Descrição da Missão</label>
            <input 
              type="text" autoFocus placeholder="Ex: Estudar React, Finalizar projeto..." 
              className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 outline-none focus:ring-2 focus:ring-orange-500 font-bold" 
              value={taskName} onChange={(e) => setTaskName(e.target.value)} 
            />
          </div>
          <div className="flex gap-4">
            <button type="button" onClick={() => context.setShowTaskModal(false)} className="flex-1 py-4 font-bold rounded-2xl hover:bg-white/5 transition-colors text-white">Voltar</button>
            <button type="submit" className="flex-1 py-4 bg-orange-500 rounded-2xl font-black italic shadow-lg shadow-orange-500/20 uppercase tracking-widest text-sm text-white">CRIAR</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const AchievementsTab: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return null;
  return (
    <div className="space-y-8 animate-in fade-in pb-20">
      <div>
        <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Minhas Glórias</h2>
        <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mt-1">O registro da sua consistência e evolução</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {context.achievements.map(ach => (
          <GlassCard key={ach.id} className={`p-8 flex flex-col items-center text-center gap-4 transition-all ${ach.unlocked ? 'border-orange-500/30 bg-orange-500/5' : 'grayscale opacity-30'}`}>
            <div className={`text-6xl mb-2 ${ach.unlocked ? 'drop-shadow-[0_0_15px_rgba(255,140,66,0.5)] scale-110' : ''}`}>{ach.icon}</div>
            <div>
              <p className="font-black italic text-xl uppercase tracking-tighter">{ach.title}</p>
              <p className="text-xs text-gray-400 font-medium leading-relaxed mt-1">{ach.description}</p>
            </div>
            {ach.unlocked ? (
              <div className="mt-2 text-[10px] font-black text-orange-500 bg-orange-500/10 px-4 py-1.5 rounded-full uppercase tracking-widest border border-orange-500/20">
                CONQUISTADO EM {new Date(ach.unlockedAt!).toLocaleDateString('pt-BR')}
              </div>
            ) : (
              <div className="w-full mt-2">
                <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
                   <span>Progresso</span>
                   <span>{Math.floor(ach.progress)}/{ach.total}</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                   <div className="bg-zinc-700 h-full transition-all duration-500" style={{ width: `${Math.min(100, (ach.progress/ach.total)*100)}%` }}></div>
                </div>
              </div>
            )}
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default App;
