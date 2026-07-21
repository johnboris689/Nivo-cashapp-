import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  Users,
  CheckSquare,
  History,
  User,
  ShieldCheck,
  Zap,
  Gift,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Wallet & Bank', path: '/wallet', icon: Wallet },
    { name: 'Refer & Earn', path: '/referrals', icon: Users, badge: '₦1,200' },
    { name: 'Withdrawal Activation', path: '/activation', icon: Zap, badge: 'Required' },
    { name: 'Tasks & Rewards', path: '/tasks', icon: CheckSquare },
    { name: 'Transaction History', path: '/history', icon: History },
    { name: 'Profile & Account', path: '/profile', icon: User },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#111111] border-r border-white/5 min-h-[calc(100vh-4rem)] p-4 space-y-6 shrink-0">
      {/* Quick Referral Promotion Banner */}
      <div className="bg-white/5 border border-white/5 rounded-2xl p-4 relative overflow-hidden">
        <div className="flex items-center gap-2 text-[#F27D26] font-extrabold text-xs uppercase tracking-wider mb-1">
          <Gift className="w-4 h-4 text-[#F27D26]" />
          Referral Bonus
        </div>
        <p className="text-white font-bold text-sm">Earn ₦1,200 Per Friend!</p>
        <p className="text-[11px] text-gray-400 mt-1">Instant wallet credit on every successful sign-up.</p>
        <NavLink
          to="/referrals"
          className="inline-block mt-3 bg-[#F27D26] hover:bg-[#E6721F] text-black font-extrabold text-[11px] px-3.5 py-1.5 rounded-lg transition-all"
        >
          Get My Link
        </NavLink>
      </div>

      {/* Nav Links */}
      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 px-3 mb-2">
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
                    ? 'bg-[#F27D26] text-black shadow-lg shadow-orange-950/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="bg-[#F27D26]/10 text-[#F27D26] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#F27D26]/20">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Admin Link if Admin */}
      {user?.isAdmin && (
        <div className="pt-4 border-t border-white/5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#F27D26] px-3 mb-2">
            Administration
          </p>
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
                isActive
                  ? 'bg-[#F27D26] text-black border-transparent'
                  : 'bg-[#F27D26]/10 text-[#F27D26] border-[#F27D26]/20 hover:bg-[#F27D26]/20'
              }`
            }
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Admin Control Panel</span>
          </NavLink>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-auto pt-4 border-t border-white/5 text-center">
        <p className="text-[11px] text-gray-500 font-medium">Nivo Cash App v2.4</p>
        <p className="text-[10px] text-gray-600 mt-0.5">Sleek Fintech Platform</p>
      </div>
    </aside>
  );
};
