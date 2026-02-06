import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Play, Pause, RotateCcw, Settings, Bell, CheckCircle, Coffee, Zap, Info, Save } from 'lucide-react';
import { AppContext } from '../App';
import { Modal } from '../components/Modal';
import confetti from 'canvas-confetti';

export const PomodoroTab: React.FC = () => {
  const context = useContext(AppContext);
  const config = context?.user.pomodoroConfig || {
    workTime: 25,
    shortBreak: 5,
    longBreak: 15,
    autoStartBreaks: false,
    autoStartFocus: false,
    soundEnabled: true
  };

  const [timeLeft, setTimeLeft] = useState(config.workTime * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState<'work' | 'break' | 'long-break'>('work');
  const [totalTime, setTotalTime] = useState(config.workTime * 60);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Local settings state for the modal
  const [localConfig, setLocalConfig] = useState(config);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const playBeep = useCallback(() => {
    if (!config.soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn("Audio context not allowed yet or failed", e);
    }
  }, [config.soundEnabled]);

  const handleSessionComplete = useCallback(() => {
    setIsActive(false);
    playBeep();
    
    if (sessionType === 'work') {
      context?.addPoints(25, 'Sessão Pomodoro Concluída');
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22C55E', '#FFFFFF', '#FF8C42']
      });
      
      const newTotalSessions = context!.user.pomodoroSessions + 1;
      context?.setUser({
        ...context.user,
        pomodoroSessions: newTotalSessions
      });

      context?.notify('success', 'Bom trabalho!', 'Hora de uma pausa para recuperar as energias.');
      
      // Every 4 sessions, take a long break
      if (newTotalSessions % 4 === 0) {
        setPreset(config.longBreak, 'long-break');
      } else {
        setPreset(config.shortBreak, 'break');
      }

      if (config.autoStartBreaks) setIsActive(true);
    } else {
      context?.notify('info', 'Pronto para a ação?', 'Pausa terminada. Vamos focar novamente!');
      setPreset(config.workTime, 'work');
      if (config.autoStartFocus) setIsActive(true);
    }
  }, [sessionType, context, config, playBeep]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
             clearInterval(timerRef.current!);
             handleSessionComplete();
             return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, handleSessionComplete]);

  // Sync timer when config changes and timer is not active
  useEffect(() => {
    if (!isActive) {
      if (sessionType === 'work') {
        setTotalTime(config.workTime * 60);
        setTimeLeft(config.workTime * 60);
      } else if (sessionType === 'break') {
        setTotalTime(config.shortBreak * 60);
        setTimeLeft(config.shortBreak * 60);
      } else {
        setTotalTime(config.longBreak * 60);
        setTimeLeft(config.longBreak * 60);
      }
    }
  }, [config, isActive, sessionType]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(totalTime);
    context?.notify('info', 'Timer resetado.');
  };

  const setPreset = (minutes: number, type: 'work' | 'break' | 'long-break') => {
    setIsActive(false);
    setSessionType(type);
    setTotalTime(minutes * 60);
    setTimeLeft(minutes * 60);
  };

  const handleSaveSettings = () => {
    if (context) {
      context.setUser({
        ...context.user,
        pomodoroConfig: localConfig
      });
      context.notify('success', 'Configurações Salvas', 'O cronômetro foi atualizado com seus novos ritmos.');
      setIsSettingsOpen(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] max-w-2xl mx-auto py-6 md:py-10 space-y-12 animate-in fade-in duration-700">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-green-500/10 border border-white/5 text-green-500 mb-2">
          <Zap size={14} className="fill-current" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Foco Extremo</span>
        </div>
        <h2 className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">Câmara de Foco</h2>
        <p className="text-gray-500 font-bold italic text-sm">Controle seu tempo, domine sua vida.</p>
      </div>

      <div className="relative w-80 h-80 md:w-[26rem] md:h-[26rem] flex items-center justify-center">
        <div className={`absolute inset-0 rounded-full blur-[100px] transition-all duration-1000 ${isActive ? (sessionType === 'work' ? 'bg-orange-500/10' : 'bg-blue-500/10') : 'bg-white/5'}`}></div>
        
        <svg className="absolute inset-0 w-full h-full -rotate-90 scale-[1.05]">
          <circle cx="50%" cy="50%" r="46%" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
          <circle
            cx="50%"
            cy="50%"
            r="46%"
            fill="none"
            stroke={sessionType === 'work' ? '#FF8C42' : '#3B82F6'}
            strokeWidth="10"
            strokeDasharray="100 100"
            strokeDashoffset={100 - progress}
            pathLength="100"
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
            style={{ 
              filter: `drop-shadow(0 0 15px ${sessionType === 'work' ? '#FF8C4288' : '#3B82F688'})`,
              opacity: isActive ? 1 : 0.4
            }}
          />
        </svg>
        
        <div className="flex flex-col items-center justify-center z-10 text-center">
          <div className="flex items-center gap-2 mb-3">
            {sessionType === 'work' ? <Zap size={24} className="text-orange-500 fill-current" /> : <Coffee size={24} className="text-blue-500" />}
            <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${sessionType === 'work' ? 'text-orange-500' : 'text-blue-500'}`}>
              {sessionType === 'work' ? 'Trabalho' : sessionType === 'break' ? 'Pausa Curta' : 'Pausa Longa'}
            </span>
          </div>
          <span className="text-8xl md:text-[10rem] font-black tracking-tighter tabular-nums italic text-white leading-none mb-4 drop-shadow-2xl">
            {formatTime(timeLeft)}
          </span>
          <div className="flex items-center gap-2">
             <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-zinc-700'}`}></div>
             <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
               {isActive ? 'Cronômetro Ativo' : 'Aguardando Início'}
             </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <button onClick={resetTimer} className="w-16 h-16 glass rounded-[1.8rem] flex items-center justify-center text-gray-500 hover:text-white transition-all border border-white/10">
          <RotateCcw size={28} />
        </button>
        
        <button 
          onClick={() => setIsActive(!isActive)}
          className={`w-28 h-28 rounded-[2.8rem] flex items-center justify-center text-white shadow-2xl transition-all active:scale-95 ${
            isActive ? 'bg-zinc-800 border-white/5' : 'bg-orange-500 shadow-orange-500/40'
          }`}
        >
          {isActive ? <Pause size={48} fill="white" /> : <Play size={48} fill="white" className="ml-2" />}
        </button>

        <button 
          onClick={() => {
            setLocalConfig(config);
            setIsSettingsOpen(true);
          }}
          className="w-16 h-16 glass rounded-[1.8rem] flex items-center justify-center text-gray-500 hover:text-white transition-all border border-white/10"
        >
          <Settings size={28} />
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-4 w-full">
        <button 
          onClick={() => setPreset(config.workTime, 'work')}
          className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${sessionType === 'work' ? 'bg-orange-500 text-white' : 'glass border-white/5 text-gray-500'}`}
        >
          Foco {config.workTime}m
        </button>
        <button 
          onClick={() => setPreset(config.shortBreak, 'break')}
          className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${sessionType === 'break' ? 'bg-blue-500 text-white' : 'glass border-white/5 text-gray-500'}`}
        >
          Pausa {config.shortBreak}m
        </button>
        <button 
          onClick={() => setPreset(config.longBreak, 'long-break')}
          className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${sessionType === 'long-break' ? 'bg-indigo-500 text-white' : 'glass border-white/5 text-gray-500'}`}
        >
          Longo {config.longBreak}m
        </button>
      </div>

      <GlassCard className="w-full max-w-lg flex items-center justify-between p-8 border-none bg-zinc-900/50">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-orange-500/10 text-orange-500 rounded-3xl flex items-center justify-center">
            <CheckCircle size={32} />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Sessões Concluídas</p>
            <p className="text-4xl font-black italic tabular-nums leading-none">{context?.user.pomodoroSessions || 0}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Prêmio</p>
          <div className="inline-flex items-center gap-2 text-green-500 font-black italic bg-green-500/5 px-3 py-1.5 rounded-xl">
            <Zap size={18} className="fill-current" />
            <span className="text-lg">+25 XP</span>
          </div>
        </div>
      </GlassCard>

      {/* Settings Modal */}
      <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Configurar Cronômetro">
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500">Foco (min)</label>
              <input 
                type="number" 
                className="w-full bg-white/5 p-3 rounded-xl border border-white/10 font-bold outline-none focus:ring-1 focus:ring-orange-500"
                value={localConfig.workTime}
                onChange={e => setLocalConfig({...localConfig, workTime: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500">Curta (min)</label>
              <input 
                type="number" 
                className="w-full bg-white/5 p-3 rounded-xl border border-white/10 font-bold outline-none focus:ring-1 focus:ring-blue-500"
                value={localConfig.shortBreak}
                onChange={e => setLocalConfig({...localConfig, shortBreak: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500">Longa (min)</label>
              <input 
                type="number" 
                className="w-full bg-white/5 p-3 rounded-xl border border-white/10 font-bold outline-none focus:ring-1 focus:ring-indigo-500"
                value={localConfig.longBreak}
                onChange={e => setLocalConfig({...localConfig, longBreak: Number(e.target.value)})}
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
             <div className="flex items-center justify-between">
                <div>
                   <p className="text-xs font-bold uppercase tracking-widest">Alertas Sonoros</p>
                   <p className="text-[10px] text-gray-500">Bipar ao concluir ciclos</p>
                </div>
                <button 
                  onClick={() => setLocalConfig({...localConfig, soundEnabled: !localConfig.soundEnabled})}
                  className={`w-10 h-6 rounded-full p-1 transition-colors ${localConfig.soundEnabled ? 'bg-green-500' : 'bg-zinc-800'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${localConfig.soundEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
             </div>

             <div className="flex items-center justify-between">
                <div>
                   <p className="text-xs font-bold uppercase tracking-widest">Pausa Automática</p>
                   <p className="text-[10px] text-gray-500">Iniciar pausa logo após o foco</p>
                </div>
                <button 
                  onClick={() => setLocalConfig({...localConfig, autoStartBreaks: !localConfig.autoStartBreaks})}
                  className={`w-10 h-6 rounded-full p-1 transition-colors ${localConfig.autoStartBreaks ? 'bg-orange-500' : 'bg-zinc-800'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${localConfig.autoStartBreaks ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
             </div>
          </div>

          <button 
            onClick={handleSaveSettings}
            className="w-full py-4 bg-orange-500 rounded-2xl font-black italic uppercase tracking-widest shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2"
          >
            <Save size={18} /> SALVAR CONFIGURAÇÕES
          </button>
        </div>
      </Modal>
    </div>
  );
};