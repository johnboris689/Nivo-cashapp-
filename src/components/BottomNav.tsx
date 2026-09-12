import React from 'react';
import { Wallet, Users, Plus, Smartphone, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  currentScreen?: string;
  onTabChange: (tab: string) => void;
  onFabClick: () => void;
}

export default function BottomNav({ activeTab, currentScreen, onTabChange, onFabClick }: BottomNavProps) {
  const tabs = [
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'social', label: 'Earn', icon: Users },
    { id: 'placeholder', label: '', icon: null, isFabSpace: true }, // Center spacer
    { id: 'data', label: 'Data', icon: Smartphone },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] w-full max-w-full pointer-events-none">
      {/* Floating Center Action Button - Raised above bottom navigation & never clipped */}
      <div className="absolute left-1/2 -top-6 -translate-x-1/2 z-50 pointer-events-auto">
        <button
          id="btn-center-fab"
          type="button"
          onClick={onFabClick}
          aria-label="Open Quick Actions Menu"
          className="h-12 w-12 rounded-full bg-gradient-to-tr from-indigo-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white shadow-xl shadow-teal-500/30 flex items-center justify-center transition-all duration-300 active:scale-95 border-2 border-[#0a0a12] cursor-pointer"
        >
          <Plus className="h-6 w-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Fixed Bottom Navigation Bar */}
      <div className="w-full max-w-full h-16 bg-[#0a0a12]/95 backdrop-blur-xl border-t border-white/[0.08] flex items-center justify-around px-2 sm:px-4 py-1 shadow-2xl pointer-events-auto pb-safe">
        {tabs.map((tab, idx) => {
          if (tab.isFabSpace) {
            return <div key={`spacer-${idx}`} className="w-12 h-12 shrink-0" />; // Spacer for center FAB
          }

          const Icon = tab.icon!;
          const isActive = tab.id === 'data' 
            ? (activeTab === 'data' || currentScreen === 'buy_data')
            : (activeTab === tab.id && (currentScreen === 'dashboard' || !currentScreen));

          return (
            <button
              id={`nav-tab-${tab.id}`}
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              aria-label={`${tab.label} Navigation Tab`}
              aria-current={isActive ? 'page' : undefined}
              className="flex flex-col items-center justify-center w-12 h-12 transition-all duration-200 relative group cursor-pointer"
            >
              {/* Highlight indicator bar */}
              {isActive && (
                <span className="absolute -top-1 w-6 h-0.5 rounded-full bg-teal-400 theme-primary-bg shadow-[0_2px_8px_rgba(20,184,166,0.6)]" />
              )}
              
              <Icon
                className={`h-5 w-5 transition-all duration-200 ${
                  isActive
                    ? 'text-teal-400 theme-primary-text scale-110 stroke-[2.5]'
                    : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              <span
                className={`text-[10px] mt-0.5 font-medium transition-colors ${
                  isActive
                    ? 'text-teal-400 theme-primary-text font-bold'
                    : 'text-slate-400 group-hover:text-slate-200'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
