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
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#121212]/95 backdrop-blur-xl border-t border-white/10 px-3 py-1.5 flex justify-around items-center shadow-2xl shadow-black">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center py-1 px-3 rounded-2xl transition-all relative ${
                isActive
                  ? 'text-[#F27D26] font-bold scale-105'
                  : 'text-gray-400 hover:text-gray-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute -top-1.5 w-6 h-1 rounded-full bg-[#F27D26] shadow-sm shadow-orange-500/50" />
                )}
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                  {item.badge && (
                    <span className="absolute -top-0.5 -right-1.5 w-2 h-2 rounded-full bg-[#F27D26] border border-black animate-pulse" />
                  )}
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight font-medium">{item.name}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </div>
  );
};

