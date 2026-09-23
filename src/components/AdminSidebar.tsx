import React from 'react';
import {
  BarChart3,
  Users,
  CreditCard,
  DollarSign,
  FileSpreadsheet,
  ShieldAlert,
  Building,
  Settings,
  Bot,
  FileText,
  Gift,
  LogOut
} from 'lucide-react';

export type AdminTab =
  | 'overview'
  | 'users'
  | 'voucher_generator'
  | 'payments'
  | 'withdrawals'
  | 'reports'
  | 'security'
  | 'payment_settings'
  | 'settings'
  | 'ai_support'
  | 'logs'
  | 'nivo_rewards';

export interface AdminSidebarProps {
  activeTab: AdminTab;
  onNavigateTab: (tab: AdminTab) => void;
  usersCount?: number;
  pendingPaymentsCount?: number;
  pendingWithdrawalsCount?: number;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
  onExit?: () => void;
  isCyberStyle?: boolean;
}

export default function AdminSidebar({
  activeTab,
  onNavigateTab,
  usersCount = 0,
  pendingPaymentsCount = 0,
  pendingWithdrawalsCount = 0,
  mobileMenuOpen = false,
  setMobileMenuOpen,
  onExit,
  isCyberStyle = false
}: AdminSidebarProps) {
  const navItems: {
    id: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string | null;
    badgeColor?: string;
  }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'nivo_rewards', label: 'Tasks & Rewards', icon: Gift },
    {
      id: 'users',
      label: 'Users',
      icon: Users,
      badge: usersCount > 0 ? usersCount : null,
      badgeColor: 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
    },
    {
      id: 'payments',
      label: 'Deposits & Payments',
      icon: CreditCard,
      badge: pendingPaymentsCount > 0 ? pendingPaymentsCount : null,
      badgeColor: 'bg-teal-500/20 text-teal-400 border border-teal-500/30 animate-pulse'
    },
    {
      id: 'withdrawals',
      label: 'Withdrawals',
      icon: DollarSign,
      badge: pendingWithdrawalsCount > 0 ? pendingWithdrawalsCount : null,
      badgeColor: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
    },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
    { id: 'security', label: 'Security', icon: ShieldAlert },
    { id: 'payment_settings', label: 'Payment Settings', icon: Building },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'ai_support', label: 'Support', icon: Bot },
    { id: 'logs', label: 'Audit Log', icon: FileText }
  ];

  const handleSelect = (tab: AdminTab) => {
    onNavigateTab(tab);
    if (setMobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  if (isCyberStyle) {
    return (
      <aside
        className={`fixed lg:static inset-y-24 left-0 z-40 w-64 bg-[#080c16]/95 border-r border-white/10 flex flex-col p-3 space-y-1.5 transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="text-[9px] font-mono uppercase tracking-widest text-slate-500 px-3 py-1 font-bold hidden lg:block">
          SOC Navigation
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto pr-1 custom-scrollbar">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-[0_0_15px_rgba(20,184,166,0.15)] font-black'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== null && item.badge !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold shrink-0 ml-1.5 ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {onExit && (
          <div className="pt-3 border-t border-white/10 shrink-0">
            <button
              onClick={onExit}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Exit Console</span>
            </button>
          </div>
        )}
      </aside>
    );
  }

  return (
    <div
      className={`w-full lg:w-64 shrink-0 flex flex-col space-y-1.5 bg-[#0d0d18] border border-white/10 rounded-xl p-2.5 transition-all duration-300 ${
        mobileMenuOpen ? 'flex' : 'hidden lg:flex'
      }`}
    >
      <div className="text-[9px] font-mono uppercase tracking-wider text-slate-500 mb-1 px-2 font-bold">
        Admin Navigation
      </div>

      <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-180px)] pr-0.5 custom-scrollbar">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg font-bold text-[11px] uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-teal-500/15 to-teal-500/15 border border-teal-500/30 text-teal-400 shadow-[0_0_12px_rgba(20,184,166,0.15)] font-black'
                  : 'border border-transparent hover:bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== null && item.badge !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold shrink-0 ml-1.5 ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {onExit && (
        <div className="pt-2 border-t border-white/10 shrink-0">
          <button
            onClick={onExit}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] uppercase tracking-wider font-bold text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            <span>Exit Admin Panel</span>
          </button>
        </div>
      )}
    </div>
  );
}
