import React, { useContext, useState, useMemo, useCallback } from 'react';
import { HabitCard } from '../components/HabitCard';
import { Plus, Search, Target, Trash2, AlertTriangle, Calendar, LayoutGrid, Info, Flame } from 'lucide-react';
import { AppContext } from '../App';
import { Habit, HabitDay } from '../types';
import { Modal } from '../components/Modal';
import { GlassCard } from '../components/GlassCard';
import confetti from 'canvas-confetti';

export const HabitsTab: React.FC = () => {
  const context = useContext(AppContext);
  const [formData, setFormData] = useState({ name: '', category: 'Geral' });
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todos');
  const [sortBy, setSortBy] = useState<'streak' | 'name'>('streak');
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  
  // State for deletion confirmation
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);

  if (!context) return null;

  const categories = ['Todos', 'Saúde', 'Trabalho', 'Estudo', 'Espiritual', 'Geral'];

  const calculateStreak = useCallback((days: HabitDay[]) => {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sortedDays = [...days].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const lastDone = sortedDays.find(d => d.completed);
    if (!lastDone) return 0;
    const lastDate = new Date(lastDone.date);
    lastDate.setHours(0,0,0,0);
    const diff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
    if (diff > 1) return 0;
    for (let i = 0; i < sortedDays.length; i++) {
        const d = sortedDays.find(day => {
            const check = new Date(lastDate);
            check.setDate(lastDate.getDate() - i);
            return new Date(day.date).toDateString() === check.toDateString();
        });
        if (d && d.completed) streak++;
        else break;
    }
    return streak;
  }, []);

  const handleCompleteDay = useCallback((habitId: string, dayIndex: number) => {
    context.setHabits(prevHabits => 
      prevHabits.map(h => {
        if (h.id === habitId) {
          const newDays = [...h.days];
          const targetDay = newDays[dayIndex];
          const wasCompleted = targetDay.completed;
          targetDay.completed = !wasCompleted;

          if (!wasCompleted) {
            context.addPoints(50, `Rito "${h.name}" em progresso`);
            confetti({ particleCount: 60, spread: 80, origin: { y: 0.8 }, colors: ['#FF6B35', '#FFFFFF', '#4ECDC4'] });
          }
          const newStreak = calculateStreak(newDays);
          const isToday = new Date(targetDay.date).toDateString() === new Date().toDateString();
          return { ...h, days: newDays, streak: newStreak, lastChecked: (!wasCompleted && isToday) ? new Date().toDateString() : h.lastChecked };
        }
        return h;
      })
    );
    setTimeout(() => context.checkAchievements(), 500);
  }, [context, calculateStreak]);

  const promptDelete = useCallback((id: string) => {
    const habit = context.habits.find(h => h.id === id);
    if (habit) {
      setHabitToDelete(habit);
      setIsDeleteModalOpen(true);
    }
  }, [context.habits]);

  const confirmDelete = () => {
    if (habitToDelete) {
      context.setHabits(prev => prev.filter(h => h.id !== habitToDelete.id));
      context.notify('info', 'Hábito removido', `O rito "${habitToDelete.name}" foi apagado do seu mural.`);
      setIsDeleteModalOpen(false);
      setHabitToDelete(null);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    const days: HabitDay[] = Array.from({ length: 35 }, (_, i) => ({
        day: i + 1,
        completed: false,
        date: new Date(new Date().setDate(new Date().getDate() - (34 - i))).toISOString()
    }));
    const habit: Habit = { id: Date.now().toString(), name: formData.name, streak: 0, progress: 0, frequency: 'daily', category: formData.category, days, createdAt: new Date().toISOString() };
    context.setHabits(prev => [habit, ...prev]);
    context.setShowHabitModal(false);
    setFormData({ name: '', category: 'Geral' });
    context.notify('success', 'Rito forjado!', 'Novo hábito adicionado ao mural.');
  };

  const processedHabits = useMemo(() => {
    return context.habits
      .filter(h => (filterCategory === 'Todos' || h.category === filterCategory) && h.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => sortBy === 'streak' ? b.streak - a.streak : a.name.localeCompare(b.name));
  }, [context.habits, search, filterCategory, sortBy]);

  // Heatmap Logic: Calculate completion density for the last 35 days
  const heatmapData = useMemo(() => {
    if (context.habits.length === 0) return [];
    
    // Get unique dates from the 35-day window
    const dateMap: Record<string, { completed: number, total: number, rawDate: string }> = {};
    
    context.habits.forEach(habit => {
      habit.days.forEach(day => {
        const d = new Date(day.date).toDateString();
        if (!dateMap[d]) {
          dateMap[d] = { completed: 0, total: 0, rawDate: day.date };
        }
        dateMap[d].total++;
        if (day.completed) dateMap[d].completed++;
      });
    });

    return Object.values(dateMap).sort((a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime());
  }, [context.habits]);

  return (
    <div className="space-y-8 animate-in fade-in pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-white">Mural de Hábitos</h2>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-[#999999] text-sm font-bold uppercase tracking-widest">Sua constância é seu maior poder</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
           {/* View Switcher */}
           <div className="flex glass p-1 rounded-2xl border-white/5 mr-2">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-[#FF6B35] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
              >
                <LayoutGrid size={20} />
              </button>
              <button 
                onClick={() => setViewMode('calendar')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'calendar' ? 'bg-[#FF6B35] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
              >
                <Calendar size={20} />
              </button>
           </div>

           <div className="relative glass rounded-2xl flex items-center px-4 py-3 flex-1 md:w-64">
              <Search size={18} className="text-[#999999] mr-2" />
              <input type="text" placeholder="Buscar rito..." className="bg-transparent border-none outline-none text-xs w-full font-bold text-white" value={search} onChange={e => setSearch(e.target.value)} />
           </div>
           
           <button onClick={() => context.setShowHabitModal(true)} className="bg-[#FF6B35] text-white p-4 rounded-2xl shadow-xl shadow-[#FF6B35]/30 hover:scale-105 transition-all">
             <Plus size={28} />
           </button>
        </div>
      </header>

      {viewMode === 'calendar' ? (
        <div className="space-y-6 animate-in zoom-in-95 duration-300">
          <GlassCard className="p-10 bg-gradient-to-br from-zinc-900/50 to-black/50 border-white/5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#FF6B35]/10 rounded-2xl flex items-center justify-center text-[#FF6B35]">
                    <Calendar size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Consistência Mensal</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Visualização global de todos os seus ritos</p>
                  </div>
               </div>
               <div className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/5">
                  <Flame size={20} className="text-[#FF6B35]" />
                  <div>
                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Média de Conclusão</p>
                    <p className="text-xl font-black italic text-white">
                      {heatmapData.length > 0 ? Math.round((heatmapData.reduce((acc, curr) => acc + (curr.completed / curr.total), 0) / heatmapData.length) * 100) : 0}%
                    </p>
                  </div>
               </div>
            </div>

            {/* Heatmap Grid */}
            <div className="grid grid-cols-7 gap-3 md:gap-4 max-w-4xl mx-auto">
              {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map(day => (
                <div key={day} className="text-center text-[10px] font-black text-gray-600 mb-2 uppercase tracking-widest">{day}</div>
              ))}
              {heatmapData.map((day, idx) => {
                const percentage = day.total > 0 ? day.completed / day.total : 0;
                let bgClass = "bg-white/5 border-white/5";
                let glowClass = "";

                if (percentage === 1) {
                  bgClass = "bg-[#FF6B35] border-[#FF6B35] shadow-[0_0_20px_rgba(255,107,53,0.4)]";
                  glowClass = "animate-pulse";
                } else if (percentage > 0.6) {
                  bgClass = "bg-[#FF6B35]/70 border-[#FF6B35]/30";
                } else if (percentage > 0.3) {
                  bgClass = "bg-[#FF6B35]/40 border-[#FF6B35]/20";
                } else if (percentage > 0) {
                  bgClass = "bg-[#FF6B35]/20 border-[#FF6B35]/10";
                }

                const isToday = new Date(day.rawDate).toDateString() === new Date().toDateString();

                return (
                  <div 
                    key={idx}
                    className={`aspect-square rounded-xl md:rounded-2xl border flex flex-col items-center justify-center transition-all duration-500 relative group cursor-pointer ${bgClass} ${isToday ? 'ring-2 ring-white ring-offset-4 ring-offset-black scale-105' : 'hover:scale-110'}`}
                  >
                    <span className={`text-[10px] md:text-xs font-black italic ${percentage > 0.5 ? 'text-white' : 'text-gray-500'}`}>
                      {day.completed > 0 ? day.completed : ''}
                    </span>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-black text-white text-[9px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none border border-white/10 shadow-2xl">
                      {new Date(day.rawDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}: {day.completed}/{day.total} Ritos
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-12 pt-8 border-t border-white/5 flex flex-wrap items-center justify-center gap-6">
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Intensidade:</span>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-md bg-white/5 border border-white/5"></div>
                <span className="text-[9px] font-bold text-gray-600">0%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-md bg-[#FF6B35]/20 border border-[#FF6B35]/10"></div>
                <span className="text-[9px] font-bold text-gray-600">Baixa</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-md bg-[#FF6B35]/70 border border-[#FF6B35]/30"></div>
                <span className="text-[9px] font-bold text-gray-600">Alta</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-md bg-[#FF6B35] shadow-[0_0_10px_rgba(255,107,53,0.5)]"></div>
                <span className="text-[9px] font-bold text-gray-600">100%</span>
              </div>
            </div>
          </GlassCard>
        </div>
      ) : (
        <>
          {processedHabits.length === 0 ? (
            <div className="py-32 text-center glass rounded-[3rem] border-dashed border-2 border-white/5">
              <div className="w-24 h-24 bg-[#FF6B35]/10 rounded-full mx-auto flex items-center justify-center text-[#FF6B35] mb-6">
                <Target size={48} />
              </div>
              <p className="text-2xl font-black italic text-white uppercase tracking-tighter">Seu primeiro ritual aguarda</p>
              <p className="text-[#999999] text-xs mt-2 uppercase tracking-widest max-w-xs mx-auto">Todo herói começa com um único passo. Defina seu rito e inicie sua jornada.</p>
              <button 
                onClick={() => context.setShowHabitModal(true)}
                className="mt-8 px-10 py-4 bg-gradient-to-r from-[#FF6B35] to-[#FF3D00] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-[#FF6B35]/20 hover:scale-110 transition-all"
              >
                CRIAR MEU PRIMEIRO HÁBITO
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
              {processedHabits.map(habit => <HabitCard key={habit.id} habit={habit} onComplete={handleCompleteDay} onDelete={promptDelete} />)}
            </div>
          )}
        </>
      )}

      {/* Creation Modal */}
      <Modal isOpen={context.showHabitModal} onClose={() => context.setShowHabitModal(false)} title="Novo Rito">
        <form onSubmit={handleCreate} className="space-y-6">
          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase text-[#999999] ml-1">Prática</label>
             <input type="text" autoFocus placeholder="Ex: Treino, Meditação..." className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 text-white font-bold outline-none focus:ring-2 focus:ring-[#FF6B35]" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          </div>
          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase text-[#999999] ml-1">Categoria</label>
             <select className="w-full bg-[#0A0A0A] p-4 rounded-2xl border border-white/10 text-white font-black uppercase text-xs outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                {categories.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
          </div>
          <button type="submit" className="w-full py-5 bg-[#FF6B35] text-white rounded-2xl font-black uppercase italic shadow-xl shadow-[#FF6B35]/20">FIXAR NO MURAL</button>
        </form>
      </Modal>

      {/* Deletion Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Remover Rito">
        <div className="space-y-6 text-center">
          <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl mx-auto flex items-center justify-center">
            <AlertTriangle size={40} />
          </div>
          <div className="space-y-2">
            <p className="text-white font-black uppercase italic text-xl">Confirmar Exclusão?</p>
            <p className="text-[#999999] text-xs font-medium leading-relaxed">
              Você está prestes a remover o rito <span className="text-white font-bold">"{habitToDelete?.name}"</span>. 
              Todo o progresso e streaks acumulados serão perdidos permanentemente.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setIsDeleteModalOpen(false)}
              className="py-4 glass rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/10 text-[#999999] hover:bg-white/5"
            >
              CANCELAR
            </button>
            <button 
              onClick={confirmDelete}
              className="py-4 bg-red-500 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white shadow-xl shadow-red-500/20 flex items-center justify-center gap-2"
            >
              <Trash2 size={14} /> REMOVER
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};