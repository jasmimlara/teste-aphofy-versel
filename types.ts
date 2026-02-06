
export enum Tab {
  HOME = 'home',
  HABITS = 'habits',
  POMODORO = 'pomodoro',
  TASKS = 'tasks',
  ACHIEVEMENTS = 'achievements',
  FINANCE = 'finance',
  PROFILE = 'profile'
}

export type Rarity = 'COMUM' | 'RARO' | 'ÉPICO' | 'LENDÁRIO';

export interface HabitDay {
  day: number;
  completed: boolean;
  date: string;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  category: string;
  streak: number;
  progress: number;
  days: HabitDay[];
  lastChecked?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  points: number;
  completed: boolean;
  multiplier?: number;
  bonusXP?: number;
  isHighlighted?: boolean;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
}

export interface Bill {
  id: string;
  name: string;
  dueDate: string;
  amount: number;
  paid: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  progress: number;
  total: number;
  icon: string;
  rarity: Rarity;
  unlockedAt?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  rewardXp: number;
  progress: number;
  total: number;
  completed: boolean;
  icon: string;
}

export interface PomodoroConfig {
  workTime: number;
  shortBreak: number;
  longBreak: number;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  soundEnabled: boolean;
}

export interface UserState {
  name: string;
  level: number;
  points: number;
  totalPoints: number;
  streak: number;
  avatar: string;
  bio: string;
  email: string;
  pomodoroSessions: number;
  title: string;
  theme: string;
  joinDate: string;
  onboardingCompleted: boolean;
  pushNotifications: boolean;
  autoFocusMode: boolean;
  totalPrivacy: boolean;
  pomodoroConfig: PomodoroConfig;
  dailySpins: number;
  lastSpinDate?: string;
  totalSpins: number;
  bonusXPEarned: number;
  bestMultiplier: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  level: number;
  medal?: string;
}
