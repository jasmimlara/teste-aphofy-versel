
import React from 'react';
import { TABS } from '../constants';
import { Tab } from '../types';

interface NavigationProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 glass border-r border-white/10 p-6 z-50">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#FF3D00] flex items-center justify-center shadow-lg shadow-[#FF6B35]/20">
            <span className="text-white font-black text-xl italic">A</span>
          </div>
          <h1 className="text-lg font-black italic tracking-tighter uppercase leading-none">Aprohfy</h1>
        </div>
        
        <div className="space-y-2 flex-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-[#FF6B35]/10 text-[#FF6B35]' 
                    : 'text-[#999999] hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#FF6B35] rounded-r-full" />
                )}
                <Icon size={20} className={isActive ? 'text-[#FF6B35]' : 'group-hover:scale-110 transition-transform'} />
                <span className="text-xs font-black uppercase tracking-widest">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Optimized Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[72px] glass border-t border-white/10 flex items-center justify-between px-2 pb-safe z-[100] backdrop-blur-2xl">
        <div className="flex w-full h-full items-center justify-evenly">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center h-full gap-1 transition-all duration-300 relative group ${
                  isActive ? 'scale-105' : 'opacity-70 hover:opacity-100'
                }`}
              >
                {/* Visual Indicator Line (Active) */}
                {isActive && (
                  <div className="absolute top-0 w-8 h-1 bg-[#FF6B35] rounded-b-full shadow-[0_0_10px_#FF6B3588] transition-all" />
                )}

                {/* Icon Container */}
                <div className={`p-2 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-[#FF6B35]/20 text-[#FF6B35] shadow-inner border border-[#FF6B35]/10' 
                    : 'text-[#999999]'
                }`}>
                  <Icon size={22} className={isActive ? 'animate-bounce-subtle' : ''} />
                </div>

                {/* Label - Improved scaling and spacing */}
                <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-tighter transition-all duration-300 text-center px-0.5 ${
                  isActive ? 'text-[#FF6B35]' : 'text-[#666666]'
                }`}>
                  {/* Hide text on extremely small screens to avoid overlap if needed, or use very tight tracking */}
                  <span className="max-[350px]:hidden">{tab.label}</span>
                  <span className="min-[351px]:hidden">{tab.label.substring(0, 3)}</span>
                </span>
              </button>
            );
          })}
        </div>
      </nav>
      
      {/* Spacer for mobile to avoid content being hidden behind nav */}
      <div className="md:hidden h-[72px]" />
    </>
  );
};
