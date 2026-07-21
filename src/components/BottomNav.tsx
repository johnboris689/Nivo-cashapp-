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
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#111111]/95 backdrop-blur-lg border-t border-white/5 px-2 py-2 flex justify-around items-center">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center py-1 px-3 rounded-xl transition-all relative ${
                isActive ? 'text-[#F27D26] font-extrabold' : 'text-gray-400 hover:text-gray-200'
              }`
            }
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.badge && (
                <span className="absolute -top-1 -right-2 w-2.5 h-2.5 rounded-full bg-[#F27D26] border border-black animate-ping" />
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight">{item.name}</span>
          </NavLink>
        );
      })}
    </div>
  );
};
