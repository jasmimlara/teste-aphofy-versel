
import { 
  Home, 
  PenLine, 
  Timer, 
  CheckSquare, 
  Wallet, 
  User,
  Trophy
} from 'lucide-react';
import { Tab, Achievement, Habit, Task, Transaction } from './types';

export const TABS = [
  { id: Tab.HOME, label: 'Início', icon: Home },
  { id: Tab.HABITS, label: 'Hábitos', icon: PenLine },
  { id: Tab.POMODORO, label: 'Pomodoro', icon: Timer },
  { id: Tab.TASKS, label: 'Missões', icon: CheckSquare },
  { id: Tab.ACHIEVEMENTS, label: 'Conquistas', icon: Trophy },
  { id: Tab.FINANCE, label: 'Finanças', icon: Wallet },
  { id: Tab.PROFILE, label: 'Perfil', icon: User },
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  // --- COMUM ---
  { id: 'step1', title: 'Primeiro Passo', description: 'Complete 1 hábito para começar', unlocked: false, progress: 0, total: 1, icon: '👣', rarity: 'COMUM' },
  { id: 'pomo_start', title: 'Semente do Foco', description: 'Realize sua primeira sessão Pomodoro', unlocked: false, progress: 0, total: 1, icon: '🌱', rarity: 'COMUM' },
  { id: 'first_bill', title: 'Responsabilidade', description: 'Cadastre sua primeira conta a pagar', unlocked: false, progress: 0, total: 1, icon: '📄', rarity: 'COMUM' },
  { id: 'night', title: 'Coruja Noturna', description: 'Complete uma tarefa após as 22h', unlocked: false, progress: 0, total: 1, icon: '🦉', rarity: 'COMUM' },
  
  // --- RARO ---
  { id: 'week_green', title: 'Semana Verde', description: 'Atingir 7 dias de streak em qualquer hábito', unlocked: false, progress: 0, total: 7, icon: '🌿', rarity: 'RARO' },
  { id: 'pomo_10', title: 'Concentração Real', description: 'Conclua 10 sessões de Pomodoro', unlocked: false, progress: 0, total: 10, icon: '🧠', rarity: 'RARO' },
  { id: 'tasks_10', title: 'Dizimista de Missões', description: 'Conclua 10 missões no mural', unlocked: false, progress: 0, total: 10, icon: '🎯', rarity: 'RARO' },
  { id: 'rocket', title: 'Foguete de Hábitos', description: 'Tenha 3 hábitos com streak de 7+ dias', unlocked: false, progress: 0, total: 3, icon: '🚀', rarity: 'RARO' },
  
  // --- ÉPICO ---
  { id: 'level_5', title: 'Ascensão do Guerreiro', description: 'Alcance o Nível 5', unlocked: false, progress: 0, total: 5, icon: '🛡️', rarity: 'ÉPICO' },
  { id: 'fire_month', title: 'Mês de Fogo', description: 'Atingir 30 dias de streak em um hábito', unlocked: false, progress: 0, total: 30, icon: '🔥', rarity: 'ÉPICO' },
  { id: 'savings_5k', title: 'Fortaleza Financeira', description: 'Acumule um saldo de R$ 5.000', unlocked: false, progress: 0, total: 5000, icon: '🏰', rarity: 'ÉPICO' },
  { id: 'multitask', title: 'Multitarefa Ninja', description: 'Complete 50 tarefas no total', unlocked: false, progress: 0, total: 50, icon: '🥷', rarity: 'ÉPICO' },

  // --- LENDÁRIO ---
  { id: 'level_10', title: 'Divindade Suprema', description: 'Alcance o Nível 10 (O Eterno)', unlocked: false, progress: 0, total: 10, icon: '✨', rarity: 'LENDÁRIO' },
  { id: 'pomo_100', title: 'Mestre do Tempo', description: 'Conclua 100 sessões de Pomodoro', unlocked: false, progress: 0, total: 100, icon: '⌛', rarity: 'LENDÁRIO' },
  { id: 'legend', title: 'Lenda Viva', description: 'Atingir 100 dias de streak em um hábito', unlocked: false, progress: 0, total: 100, icon: '👑', rarity: 'LENDÁRIO' },
  { id: 'economist_legend', title: 'Magnata do Aprohfy', description: 'Acumule R$ 50.000 em saldo total', unlocked: false, progress: 0, total: 50000, icon: '💎', rarity: 'LENDÁRIO' },
];

export const LEVELS = [
  { level: 1, title: 'Iniciante 🐣', minXp: 0 },
  { level: 2, title: 'Explorador 🧭', minXp: 100 },
  { level: 3, title: 'Aventureiro 🧗', minXp: 300 },
  { level: 4, title: 'Guerreiro 🗡️', minXp: 600 },
  { level: 5, title: 'Lenda 👑', minXp: 1000 },
  { level: 6, title: 'Mestre Zen 🧘', minXp: 1500 },
  { level: 7, title: 'Avatar 🌌', minXp: 2100 },
  { level: 8, title: 'Semi-Deus ⚡', minXp: 3000 },
  { level: 9, title: 'Divindade ✨', minXp: 4000 },
  { level: 10, title: 'O Eterno 💎', minXp: 5500 },
];

export const SAMPLE_HABITS: Habit[] = [];
export const SAMPLE_TASKS: Task[] = [];
export const SAMPLE_TRANSACTIONS: Transaction[] = [];

export const COLORS = {
  primary: '#FF6B35', // Aprohfy Orange
  secondary: '#4ECDC4', // Achievement Cyan
  success: '#95E1D3', // Soft Green
  warning: '#FFD93D', // Golden Yellow
  background: '#0A0A0A',
  text: '#E0E0E0',
  muted: '#999999'
};
