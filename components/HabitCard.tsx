import React from 'react';
import { Habit } from '../types';
import { Trash2 } from 'lucide-react';

interface HabitCardProps {
  habit: Habit;
  onComplete: (habitId: string, dayIndex: number) => void;
  onDelete: (habitId: string) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, onComplete, onDelete }) => {
  const WEEKDAYS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
  const today = new Date().toDateString();
  
  // Find today's index in the habit days array
  const todayIndex = habit.days.findIndex(d => new Date(d.date).toDateString() === today);
  const isCompletedToday = todayIndex !== -1 && habit.days[todayIndex].completed;

  /**
   * Layout Logic:
   * 1. Weekdays row: Last 7 days status.
   * 2. Grid: Last 28 days (4 weeks).
   */
  const currentWeekDays = habit.days.slice(-7);
  const gridDays = habit.days.slice(-28);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(habit.id);
  };

  return (
    <div className="glass rounded-[2.5rem] p-[20px] flex flex-col gap-[16px] relative overflow-hidden transition-all duration-300 hover:border-[#FF8C42]/30 group h-fit border border-white/5">
      
      {/* 1. Header: Streak Badge */}
      <div className="flex items-center gap-2">
        <span className="text-sm">🟠</span>
        <span className="text-[12px] font-black text-[#9CA3AF] uppercase tracking-widest">
          {habit.streak} {habit.streak === 1 ? 'DIA' : 'DIAS'}
        </span>
      </div>

      {/* 2. Habit Info: Name and Status */}
      <div className="space-y-1">
        <h3 className="text-[18px] font-bold text-white leading-tight truncate">
          {habit.name}
        </h3>
        <div className="flex items-center gap-2">
          {isCompletedToday ? (
            <span className="text-[11px] font-black italic text-[#95E1D3] flex items-center gap-1.5 uppercase tracking-wider">
              ✓ CONCLUÍDO
            </span>
          ) : (
            <span className="text-[11px] font-black italic text-[#EF4444] flex items-center gap-1.5 uppercase tracking-wider">
              🔴 PENDENTE
            </span>
          )}
        </div>
      </div>

      {/* 3. Weekdays Circles: Progress of the last 7 days */}
      <div className="flex justify-between items-center gap-2 py-2">
        {currentWeekDays.map((day, idx) => (
          <div
            key={`wk-${idx}`}
            className={`w-[32px] h-[32px] rounded-full border flex items-center justify-center text-[10px] font-black transition-all ${
              day.completed 
                ? 'bg-[#FF8C42] border-[#FF8C42] text-white shadow-[0_0_10px_rgba(255,140,66,0.3)]' 
                : 'border-[#4B5563] text-[#4B5563]'
            }`}
          >
            {WEEKDAYS[idx]}
          </div>
        ))}
      </div>

      {/* 4. Streak Grid (4x7) */}
      <div className="flex flex-col gap-[4px] mt-2">
        <p className="text-[9px] font-black text-[#4B5563] uppercase tracking-[0.2em] mb-1">Evolução 28 Dias</p>
        <div className="grid grid-cols-7 gap-[4px]">
          {gridDays.map((day, idx) => {
            const isToday = new Date(day.date).toDateString() === today;
            // Original index in the full habit.days array (needed for onComplete)
            const originalIdx = habit.days.length - 28 + idx;
            
            return (
              <div
                key={`grid-${idx}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onComplete(habit.id, originalIdx);
                }}
                className={`w-[28px] h-[28px] rounded-[6px] cursor-pointer transition-all duration-300 ${
                  day.completed 
                    ? 'bg-[#FF8C42] shadow-[0_0_8px_rgba(255,140,66,0.2)]' 
                    : 'bg-[#1A1A1A] border border-[#2A2A2A]'
                } ${isToday ? 'ring-2 ring-[#FF8C42] ring-offset-2 ring-offset-[#0A0A0A]' : ''} hover:scale-110`}
                title={new Date(day.date).toLocaleDateString('pt-BR')}
              />
            );
          })}
        </div>
      </div>

      {/* Footer: Remove button */}
      <div className="flex justify-between items-center mt-2 pt-4 border-t border-white/5 relative z-10 pointer-events-auto">
        <span className="text-[9px] text-[#4B5563] font-bold uppercase tracking-widest">
          {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
        </span>
        <button 
          onClick={handleDeleteClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase text-[#4B5563] hover:text-[#EF4444] hover:bg-red-500/10 transition-all tracking-widest z-20"
          aria-label="Remover hábito"
        >
          <Trash2 size={12} />
          Remover
        </button>
      </div>
    </div>
  );
};