import React, { useContext, useMemo, useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { 
  Flame, 
  Target, 
  Zap, 
  Clock, 
  Share2, 
  CheckCircle, 
  Award,
  ChevronRight,
  Hexagon
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';
import { AppContext } from '../App';
import { LEVELS } from '../constants';
import { Tab } from '../types';

export const HomeTab: React.FC = () => {
  const context = useContext(AppContext);
  const [timeFilter, setTimeFilter] = useState<'today' | 'month'>('today');

  if (!context) return null;

  const now = new Date();
  const todayStr = now.toDateString();
  const dateStr = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  // Radar categories colors
  const CAT_COLORS = {
    HABITS: '#4ECDC4',
    POMODORO: '#FF6B35',
    TASKS: '#FFD93D',
    ACHIEVEMENTS: '#95E1D3',
    FINANCE: '#A78BFA'
  };

  const stats = useMemo(() => {
    const { habits, tasks, achievements, transactions, user } = context;

    const habitsScore = habits.length > 0 ? (habits.filter(h => h.lastChecked === todayStr).length / habits.length) * 20 : 0;
    const pomoScore = Math.min(20, (user.pomodoroSessions / 5) * 20);
    const tasksScore = tasks.length > 0 ? (tasks.filter(t => t.completed).length / tasks.length) * 20 : 0;
    const achievementsScore = Math.min(20, (achievements.filter(a => a.unlocked).length / 10) * 20);
    const balance = transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
    const financeScore = Math.min(20, (Math.max(0, balance) / 1000) * 20);

    const average = (habitsScore + pomoScore + tasksScore + achievementsScore + financeScore) / 5;

    return [
      { subject: 'HÁBITOS', value: habitsScore, color: CAT_COLORS.HABITS, tab: Tab.HABITS },
      { subject: 'POMODORO', value: pomoScore, color: CAT_COLORS.POMODORO, tab: Tab.POMODORO },
      { subject: 'MISSÕES', value: tasksScore, color: CAT_COLORS.TASKS, tab: Tab.TASKS },
      { subject: 'CONQUISTAS', value: achievementsScore, color: CAT_COLORS.ACHIEVEMENTS, tab: Tab.ACHIEVEMENTS },
      { subject: 'FINANÇAS', value: financeScore, color: CAT_COLORS.FINANCE, tab: Tab.FINANCE },
      { average }
    ];
  }, [context, todayStr]);

  const radarData = stats.slice(0, 5);
  const totalScore = stats[5] as any;

  const currentLevelData = LEVELS.find(l => l.level === context.user.level) || LEVELS[0];
  const nextLevelData = LEVELS.find(l => l.level === context.user.level + 1);
  const xpNeeded = nextLevelData ? nextLevelData.minXp - currentLevelData.minXp : 1000;
  const xpCurrent = context.user.totalPoints - currentLevelData.minXp;
  const levelProgress = Math.min(100, (xpCurrent / xpNeeded) * 100);

  return (
    <div className="space-y-8 pb-24 md:pb-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Olá, {context.user.name.split(' ')[0]}</h2>
          <p className="text-[#999999] font-bold uppercase tracking-widest text-[10px] mt-2 flex items-center gap-2">
            <Clock size={14} className="text-[#FF6B35]" /> {dateStr}
          </p>
        </div>
        <button onClick={() => {
            navigator.clipboard.writeText(`Score de ${totalScore.average.toFixed(1)} no Aprohfy! 🔥`);
            context.notify('info', 'Score copiado!');
        }} className="p-4 glass rounded-2xl text-[#999999] hover:text-white transition-all active:scale-90">
          <Share2 size={20} />
        </button>
      </header>

      <GlassCard className="p-8 group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B35]/10 to-transparent opacity-50"></div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-[#FF6B35] flex items-center justify-center shadow-xl shadow-[#FF6B35]/20">
              <Award size={32} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black italic uppercase text-white leading-none">{context.user.title}</h3>
              <p className="text-[10px] text-[#999999] font-black tracking-[0.3em] uppercase mt-2">JORNADA NÍVEL {context.user.level}</p>
            </div>
          </div>
          <div className="flex-1 w-full max-w-md">
            <div className="flex justify-between text-[10px] font-black uppercase mb-2 text-[#999999] tracking-widest">
              <span>{context.user.totalPoints} XP</span>
              <span>PRÓXIMO NÍVEL: {nextLevelData?.minXp || 'MAX'}</span>
            </div>
            <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden border border-white/5 p-0.5">
              <div className="h-full bg-gradient-to-r from-[#FF6B35] to-[#FF3D00] rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(255,107,53,0.5)]" style={{ width: `${levelProgress}%` }}></div>
            </div>
          </div>
        </div>
      </GlassCard>

      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
          <div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3 text-white">
               <Hexagon className="text-[#FF6B35]" fill="#FF6B3522" /> Visão Geral
            </h3>
            <p className="text-[10px] text-[#999999] font-bold uppercase tracking-[0.2em] mt-1">Sua performance multidimensional</p>
          </div>
        </div>

        <GlassCard className="p-8 md:p-12 flex flex-col items-center justify-center min-h-[500px] relative">
          <div className="w-full h-[400px] md:h-[450px] relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
               <span className="text-[10px] font-black text-[#999999] uppercase tracking-[0.4em] mb-1">Score Total</span>
               <span className="text-6xl md:text-7xl font-black italic tracking-tighter text-white drop-shadow-2xl">
                 {totalScore.average.toFixed(1)}
               </span>
            </div>

            <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={300}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={(props) => {
                    const { x, y, payload } = props;
                    const dataItem = radarData.find(d => d.subject === payload.value);
                    return (
                      <g className="cursor-pointer" onClick={() => context.setActiveTab(dataItem?.tab as Tab)}>
                        <text x={x} y={y} dy={5} textAnchor="middle" fill={dataItem?.color} fontSize={10} fontWeight={900} style={{ fontStyle: 'italic', textTransform: 'uppercase' }}>
                          {payload.value}
                        </text>
                      </g>
                    );
                  }}
                />
                <Radar name="Evolução" dataKey="value" stroke="#FF6B35" strokeWidth={3} fill="#FF6B35" fillOpacity={0.3} animationDuration={1000} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 w-full max-w-4xl mt-8 pt-8 border-t border-white/5">
            {radarData.map((stat, idx) => (
              <button key={idx} onClick={() => context.setActiveTab(stat.tab as Tab)} className="flex flex-col items-center p-4 rounded-3xl hover:bg-white/5 transition-all group">
                <div className="flex items-center gap-2 mb-2">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }}></div>
                   <span className="text-[10px] font-black text-[#999999] uppercase tracking-widest group-hover:text-white">{stat.subject}</span>
                </div>
                <span className="text-3xl font-black italic tracking-tighter" style={{ color: stat.color }}>
                  {stat.value.toFixed(1)}
                </span>
              </button>
            ))}
          </div>
        </GlassCard>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h3 className="text-xl font-bold italic uppercase px-2 flex items-center gap-2 text-white">
            <Target className="text-[#FF6B35]" /> Desafios Ativos
          </h3>
          <div className="space-y-3">
            {context.challenges.map(chal => (
              <GlassCard key={chal.id} className="p-5 flex items-center justify-between border-l-4 border-[#FF6B35]/40 hover:border-[#FF6B35]">
                <div className="flex gap-4">
                  <span className="text-3xl">{chal.icon}</span>
                  <div>
                    <p className="font-bold text-sm uppercase text-white">{chal.title}</p>
                    <p className="text-[10px] text-[#999999] font-medium">{chal.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-[#FF6B35]">+{chal.rewardXp} XP</span>
                  <p className="text-[10px] text-[#999999] font-bold">{chal.progress}/{chal.total}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-bold italic uppercase px-2 flex items-center justify-between text-white">
             <span>Recentes</span>
             <button onClick={() => context.setActiveTab(Tab.HABITS)} className="text-[10px] font-black text-[#999999] hover:text-white uppercase tracking-widest flex items-center gap-1">
               Ver Tudo <ChevronRight size={12} />
             </button>
          </h3>
          <div className="space-y-3">
            {context.habits.slice(0, 3).map(h => (
              <GlassCard 
                key={h.id} 
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/5 transition-all" 
                onClick={() => context.setActiveTab(Tab.HABITS)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${h.lastChecked === todayStr ? 'bg-[#FF6B35] text-white' : 'bg-white/5 text-[#999999]'}`}>
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <p className="font-black text-sm uppercase text-white">{h.name}</p>
                    <p className="text-[9px] text-[#999999] font-bold uppercase tracking-widest">{h.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-[#FF6B35]/10 px-3 py-1 rounded-full border border-[#FF6B35]/20">
                   <Flame size={14} className="text-[#FF6B35] fill-current" />
                   <span className="text-xs font-black italic text-white">{h.streak}d</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};