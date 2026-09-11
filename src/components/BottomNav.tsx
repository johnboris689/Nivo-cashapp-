import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wallet, Users, CheckSquare, History } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const items = [
    { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Wallet', path: '/wallet', icon: Wallet },
    { name: 'Refer', path: '/referrals', icon: Users, badge: true },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'History', path: '/history', icon: History },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#16090D]/95 backdrop-blur-2xl border-t border-[#8F1D3A]/20 px-3 py-2 flex justify-around items-center shadow-[0_-10px_30px_rgba(0,0,0,0.8)] rounded-t-2xl">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center py-1 px-3 rounded-2xl transition-all relative ${
                isActive
                  ? 'text-[#C13A5A] font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute -top-2 w-8 h-1 rounded-full bg-gradient-to-r from-[#8F1D3A] to-[#C13A5A] shadow-md shadow-[#C13A5A]/50" />
                )}
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px] text-[#C13A5A]' : 'stroke-2'}`} />
                  {item.badge && (
                    <span className="absolute -top-0.5 -right-1.5 w-2.5 h-2.5 rounded-full bg-[#C13A5A] border-2 border-[#16090D] animate-pulse" />
                  )}
                </div>
                <span className="text-[10px] mt-1 tracking-tight font-medium">{item.name}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </div>
  );
};
