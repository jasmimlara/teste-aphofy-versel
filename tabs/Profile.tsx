
import React, { useContext, useState, useRef } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Edit3, Settings, LogOut, Shield, Bell, Download, Trash2, Award, Flame, CheckCircle2, Star, Camera, ChevronRight, Palette, Sparkles } from 'lucide-react';
import { AppContext } from '../App';
import { LEVELS } from '../constants';
import { Modal } from '../components/Modal';

export const ProfileTab: React.FC = () => {
  const context = useContext(AppContext);
  const [isEditing, setIsEditing] = useState(false);
  const [isThemesModalOpen, setIsThemesModalOpen] = useState(false);
  const [name, setName] = useState(context?.user.name || '');
  const [bio, setBio] = useState(context?.user.bio || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!context) return null;

  const handleSave = () => {
    context.setUser({ ...context.user, name, bio });
    setIsEditing(false);
    context.notify('success', 'Perfil Atualizado', 'Suas mudanças foram salvas com sucesso.');
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        context.setUser({ ...context.user, avatar: reader.result as string });
        context.notify('success', 'Nova foto de perfil!', 'Você está radiante hoje.');
      };
      reader.readAsDataURL(file);
    }
  };

  const togglePreference = (key: 'pushNotifications' | 'autoFocusMode' | 'totalPrivacy', label: string) => {
    const newValue = !context.user[key];
    context.setUser({ ...context.user, [key]: newValue });
    context.notify('info', `${label} ${newValue ? 'Ativado' : 'Desativado'}`, 'Suas preferências foram sincronizadas.');
  };

  const nextLevelData = LEVELS.find(l => l.level === context.user.level + 1);
  const currentLevelData = LEVELS.find(l => l.level === context.user.level) || LEVELS[0];
  const xpNeeded = nextLevelData ? nextLevelData.minXp - currentLevelData.minXp : 1000;
  const xpCurrent = context.user.totalPoints - currentLevelData.minXp;
  const progress = Math.min(100, (xpCurrent / xpNeeded) * 100);

  const preferenceItems = [
    { key: 'pushNotifications', label: 'Notificações Push', icon: Bell },
    { key: 'autoFocusMode', label: 'Modo Foco Automático', icon: Flame },
    { key: 'totalPrivacy', label: 'Privacidade Total', icon: Shield },
  ] as const;

  return (
    <div className="space-y-10 pb-24 md:pb-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      {/* Header Profile */}
      <div className="flex flex-col md:flex-row items-center gap-10 pt-6">
        <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          <div className="w-40 h-40 md:w-56 md:h-56 rounded-[3.5rem] border-4 border-white/10 p-2 relative overflow-hidden transition-all duration-500 hover:scale-105">
             <div className="absolute inset-0 bg-gradient-to-tr from-green-500/20 to-emerald-500/20 animate-pulse"></div>
            <img 
              src={context.user.avatar} 
              className="w-full h-full rounded-[2.8rem] object-cover relative z-10 grayscale-[0.2] hover:grayscale-0 transition-all duration-500" 
              alt="Profile"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 backdrop-blur-sm">
                <Camera size={40} className="text-white" />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 p-4 bg-green-500 text-white rounded-[1.5rem] shadow-2xl shadow-green-500/40 z-30 animate-bounce-subtle">
            <Award size={24} />
          </div>
        </div>
        
        <div className="text-center md:text-left space-y-4 flex-1">
          {isEditing ? (
            <div className="space-y-4 max-w-md">
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)}
                placeholder="Seu nome lendário"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-green-500 outline-none text-2xl font-black italic uppercase tracking-tighter"
              />
              <textarea 
                value={bio} 
                onChange={e => setBio(e.target.value)}
                placeholder="Conte sua história em poucas palavras..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-green-500 outline-none text-sm h-28 font-medium italic"
              />
              <div className="flex gap-3 justify-center md:justify-start">
                <button onClick={handleSave} className="px-10 py-4 bg-green-500 rounded-2xl font-black italic shadow-xl shadow-green-500/30 uppercase tracking-widest text-sm">SALVAR</button>
                <button onClick={() => setIsEditing(false)} className="px-10 py-4 bg-white/5 rounded-2xl font-bold uppercase tracking-widest text-sm">CANCELAR</button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none">{context.user.name}</h2>
                <div className="flex items-center gap-2 mt-1 justify-center md:justify-start">
                   <div className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">Nível {context.user.level}</div>
                   <p className="text-gray-500 font-bold tracking-[0.1em] text-[10px] uppercase">{context.user.title}</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 max-w-sm font-medium leading-relaxed italic mx-auto md:mx-0">
                "{context.user.bio}"
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                <button 
                  onClick={() => setIsEditing(true)}
                  className="glass px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 transition-all border border-white/10"
                >
                  Editar Perfil
                </button>
                <button 
                  onClick={() => setIsThemesModalOpen(true)}
                  className="glass px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 transition-all border border-white/10 flex items-center gap-2"
                >
                   <Palette size={14} className="text-purple-500" /> Temas
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Gamification Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Pontos de Glória', value: context.user.totalPoints.toLocaleString(), icon: Award, color: 'text-yellow-500 bg-yellow-500/10' },
          { label: 'Chama Atual', value: `${context.user.streak} Dias`, icon: Flame, color: 'text-orange-500 bg-orange-500/10' },
          { label: 'Hábitos Ativos', value: context.habits.length.toString(), icon: CheckCircle2, color: 'text-green-500 bg-green-500/10' },
          { label: 'Conquistas', value: context.achievements.filter(a => a.unlocked).length.toString(), icon: Star, color: 'text-purple-500 bg-purple-500/10' },
        ].map((stat, i) => (
          <GlassCard key={i} className="text-center py-10 px-4 group transition-all hover:-translate-y-2 border-none bg-zinc-900/40">
            <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4 ${stat.color} group-hover:scale-110 transition-transform shadow-lg`}>
              <stat.icon size={28} />
            </div>
            <p className="text-4xl font-black italic tracking-tighter mb-1">{stat.value}</p>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">{stat.label}</p>
          </GlassCard>
        ))}
      </div>

      {/* Leveling Detail Card */}
      <GlassCard className="p-10 space-y-6 bg-gradient-to-br from-zinc-900/50 to-black/50 border border-white/5">
        <div className="flex justify-between items-end mb-2">
           <div>
              <h3 className="text-2xl font-black uppercase tracking-tighter italic">Evolução do Herói</h3>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{context.user.title}</p>
           </div>
           <div className="text-right">
              <p className="text-xs text-green-500 font-black italic">{Math.round(progress)}% COMPLETO</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase">{nextLevelData ? `${context.user.totalPoints} / ${nextLevelData.minXp} XP` : 'MAESTRIA MÁXIMA'}</p>
           </div>
        </div>
        <div className="w-full bg-white/5 h-6 rounded-full overflow-hidden border border-white/5 p-1 relative">
           <div 
             className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-1000 shadow-[0_0_25px_rgba(34,197,94,0.4)] relative z-10" 
             style={{ width: `${progress}%` }}
           >
              <div className="absolute inset-0 bg-white/20 opacity-20 animate-pulse"></div>
           </div>
        </div>
        <div className="flex justify-between text-[10px] font-black uppercase text-gray-600 tracking-[0.3em]">
           <span>NÍVEL {context.user.level}</span>
           <span>NÍVEL {context.user.level + 1}</span>
        </div>
      </GlassCard>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="space-y-4">
           <h3 className="text-xl font-black uppercase italic tracking-tight px-2 flex items-center gap-2">
              <Settings size={20} className="text-gray-500" /> Preferências
           </h3>
           <GlassCard className="space-y-2 p-2">
              {preferenceItems.map((item) => {
                const isActive = context.user[item.key];
                return (
                  <div 
                    key={item.key} 
                    onClick={() => togglePreference(item.key, item.label)}
                    className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                     <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl glass flex items-center justify-center transition-colors ${isActive ? 'text-green-500' : 'text-gray-500 group-hover:text-white'}`}>
                           <item.icon size={20} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>
                     </div>
                     <div className={`w-10 h-6 rounded-full relative p-1 transition-colors ${isActive ? 'bg-green-500' : 'bg-zinc-800'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${isActive ? 'translate-x-4' : 'translate-x-0'}`}></div>
                     </div>
                  </div>
                );
              })}
           </GlassCard>
        </section>

        <section className="space-y-4">
           <h3 className="text-xl font-black uppercase italic tracking-tight px-2 flex items-center gap-2">
              <Download size={20} className="text-gray-500" /> Gestão de Dados
           </h3>
           <GlassCard className="space-y-4 p-6">
              <button 
                onClick={() => {
                  const data = {
                    user: context.user,
                    habits: context.habits,
                    tasks: context.tasks,
                    achievements: context.achievements,
                    transactions: context.transactions
                  };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `backup-aprohfy-${context.user.name.replace(/\s/g, '-')}.json`;
                  a.click();
                  context.notify('info', 'Backup gerado!', 'Seu progresso foi exportado com sucesso.');
                }}
                className="w-full flex items-center justify-between p-4 glass rounded-2xl hover:bg-white/10 transition-all group"
              >
                <span className="text-xs font-bold uppercase tracking-widest">Baixar Meu Histórico</span>
                <ChevronRight size={18} className="text-gray-600 group-hover:translate-x-1 transition-transform" />
              </button>

              <button 
                onClick={() => {
                  if (confirm('REINICIAR JORNADA? Todos os seus XP, níveis e conquistas serão apagados permanentemente.')) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                className="w-full flex items-center justify-between p-4 border border-red-500/20 rounded-2xl hover:bg-red-500/10 transition-all group"
              >
                <div className="flex items-center gap-4">
                   <Trash2 size={20} className="text-red-500/60" />
                   <span className="text-xs font-bold uppercase tracking-widest text-red-500/80">Apagar Tudo e Recomeçar</span>
                </div>
              </button>
              
              <div className="pt-4 mt-2 border-t border-white/5 flex items-center justify-between px-2">
                 <p className="text-[10px] text-gray-600 font-bold uppercase">Aprohfy v1.5</p>
                 <button className="flex items-center gap-2 text-gray-600 hover:text-white transition-colors font-black uppercase text-[10px] tracking-widest">
                    <LogOut size={14} /> Sair
                 </button>
              </div>
           </GlassCard>
        </section>
      </div>

      {/* Themes Coming Soon Modal */}
      <Modal 
        isOpen={isThemesModalOpen} 
        onClose={() => setIsThemesModalOpen(false)} 
        title="Personalização"
      >
        <div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="relative inline-block">
             <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full animate-pulse"></div>
             <div className="relative text-7xl py-4 animate-bounce-subtle">🎨</div>
          </div>
          
          <div className="space-y-2">
             <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter leading-none flex items-center justify-center gap-2">
               <Sparkles size={24} className="text-yellow-400" /> Em Breve!
             </h2>
             <p className="text-gray-400 font-medium text-sm leading-relaxed px-4">
               Estamos preparando temas incríveis para você personalizar seu Aprohfy e deixar sua jornada com a sua cara!
             </p>
          </div>

          <div className="space-y-3 pt-2">
             <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Preview dos Temas Futuros:</p>
             <div className="grid grid-cols-4 gap-3">
                <div className="group cursor-help">
                   <div className="aspect-square rounded-2xl bg-gradient-to-br from-zinc-900 to-black border border-white/10 shadow-lg group-hover:scale-110 transition-transform"></div>
                   <p className="text-[8px] font-bold mt-1 uppercase text-gray-600">Dark</p>
                </div>
                <div className="group cursor-help">
                   <div className="aspect-square rounded-2xl bg-gradient-to-br from-white to-gray-200 border border-white/5 shadow-lg group-hover:scale-110 transition-transform"></div>
                   <p className="text-[8px] font-bold mt-1 uppercase text-gray-600">Light</p>
                </div>
                <div className="group cursor-help">
                   <div className="aspect-square rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 border border-white/10 shadow-lg group-hover:scale-110 transition-transform"></div>
                   <p className="text-[8px] font-bold mt-1 uppercase text-gray-600">Neon</p>
                </div>
                <div className="group cursor-help">
                   <div className="aspect-square rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 border border-white/10 shadow-lg group-hover:scale-110 transition-transform"></div>
                   <p className="text-[8px] font-bold mt-1 uppercase text-gray-600">Ocean</p>
                </div>
             </div>
          </div>

          <button
            onClick={() => setIsThemesModalOpen(false)}
            className="w-full py-5 bg-gradient-to-r from-[#FF6B35] to-[#FFD93D] rounded-2xl font-black italic uppercase text-white shadow-xl shadow-orange-500/30 hover:scale-[1.02] transition-all"
          >
            ENTENDI
          </button>
        </div>
      </Modal>
    </div>
  );
};
