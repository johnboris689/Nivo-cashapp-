import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  Users,
  CheckSquare,
  History,
  User,
  Zap,
  Gift,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Wallet & Bank', path: '/wallet', icon: Wallet },
    { name: 'Refer & Earn', path: '/referrals', icon: Users, badge: '₦1,200' },
    { name: 'Withdrawal Access', path: '/activation', icon: Zap, badge: 'Required' },
    { name: 'Tasks & Rewards', path: '/tasks', icon: CheckSquare },
    { name: 'Transaction History', path: '/history', icon: History },
    { name: 'Profile & Account', path: '/profile', icon: User },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#16090D] border-r border-[#00C9A7]/20 min-h-[calc(100vh-4rem)] p-4 space-y-6 shrink-0 shadow-xl">
      {/* Quick Referral Promotion Banner */}
      <div className="bg-gradient-to-br from-[#0D1B1C]/40 via-[#0D1B1C]/20 to-[#0D1B1C]/20 border border-[#00C9A7]/30 rounded-2xl p-4 relative overflow-hidden backdrop-blur-md">
        <div className="flex items-center gap-2 text-[#C13A5A] font-extrabold text-xs uppercase tracking-wider mb-1">
          <Gift className="w-4 h-4 text-[#C13A5A]" />
          Referral Bonus
        </div>
        <p className="text-white font-bold text-sm">Earn ₦1,200 Per Friend!</p>
        <p className="text-[11px] text-slate-400 mt-1">Instant wallet credit on every successful sign-up.</p>
        <NavLink
          to="/referrals"
          className="inline-block mt-3 bg-gradient-to-r from-[#008F7A] to-[#00BFA6] hover:from-[#00C9A7] hover:to-[#C13A5A] text-white font-extrabold text-[11px] px-3.5 py-1.5 rounded-xl shadow-md shadow-[#008F7A]/30 transition-all hover:scale-105"
        >
          Get My Link
        </NavLink>
      </div>

      {/* Nav Links */}
      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
          Navigation Menu
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#008F7A] to-[#00BFA6] text-white shadow-lg shadow-[#008F7A]/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isActive 
                        ? 'bg-white/20 text-white border-white/30' 
                        : 'bg-[#00BFA6]/10 text-[#C13A5A] border-[#00BFA6]/30'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-auto pt-4 border-t border-white/10 text-center">
        <p className="text-[11px] text-slate-500 font-medium">Nevo</p>
        <p className="text-[10px] text-slate-600 mt-0.5">Premium Fintech Banking Platform</p>
      </div>
    </aside>
  );
};
