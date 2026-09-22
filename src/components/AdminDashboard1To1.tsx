import React, { useState, useEffect } from 'react';
import { getCachedSettings } from '../services/settingsService';
import AdminSidebar, { AdminTab } from './AdminSidebar';
import {
  Users,
  Wallet,
  ShoppingBag,
  Database,
  MoreVertical,
  Calendar,
  SlidersHorizontal,
  Search,
  Bell,
  Menu,
  X,
  Home,
  ArrowLeftRight,
  CreditCard,
  Package,
  BarChart3,
  Shield,
  Settings,
  LogOut,
  AlertTriangle,
  CheckCircle,
  Download,
  UserPlus,
  ShieldAlert,
  Layers,
  ArrowUp,
  ArrowDown,
  User,
  ChevronDown,
  Terminal,
  Cpu,
  Server,
  Wifi,
  Zap,
  Lock,
  Activity,
  RefreshCw,
  Radio,
  ExternalLink
} from 'lucide-react';

interface AdminDashboard1To1Props {
  totalUsersCount: number;
  totalSystemBalance: number;
  totalRevenue: number;
  totalTxsCount: number;
  transactions: any[];
  users: any[];
  logs: any[];
  stats: any;
  onNavigateTab: (tab: AdminTab) => void;
  onBack: () => void;
  pendingPaymentsCount?: number;
  pendingWithdrawalsCount?: number;
  onToast?: (msg: string, type: 'success' | 'info' | 'error') => void;
}

// Sparkline SVG Component
const Sparkline = ({ color, points }: { color: string; points: number[] }) => {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const width = 140;
  const height = 45;

  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - ((p - min) / range) * (height - 12) - 6;
    return `${x},${y}`;
  });

  const pathD = `M ${coords.join(' L ')}`;
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;
  const gradId = `spark-${color.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default function AdminDashboard1To1({
  totalUsersCount,
  totalSystemBalance,
  totalRevenue,
  totalTxsCount,
  transactions,
  users,
  logs,
  stats,
  onNavigateTab,
  onBack,
  pendingPaymentsCount = 0,
  pendingWithdrawalsCount = 0,
  onToast
}: AdminDashboard1To1Props) {
  const [activeSidebar, setActiveSidebar] = useState<AdminTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [calendarFilter, setCalendarFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [openCardMenu, setOpenCardMenu] = useState<string | null>(null);

  const handleCardAction = (action: 'open' | 'refresh' | 'export', targetTab: AdminTab, title: string) => {
    setOpenCardMenu(null);
    if (action === 'open') {
      onNavigateTab(targetTab);
    } else if (action === 'refresh') {
      if (onToast) onToast(`Refreshed ${title} data`, 'info');
    } else if (action === 'export') {
      const content = `Report,${title}\nGenerated,${new Date().toISOString()}\nStatus,Active\nValue,Live Data`;
      const blob = new Blob([content], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_export.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      if (onToast) onToast(`Exported ${title} report to CSV`, 'success');
    }
  };

  const renderCardMenu = (cardId: string, title: string, targetTab: AdminTab) => (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpenCardMenu(openCardMenu === cardId ? null : cardId);
        }}
        className="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
        title="Card Actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {openCardMenu === cardId && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-8 z-50 w-44 bg-[#0d1326] border border-teal-500/40 rounded-xl shadow-2xl p-1.5 font-sans space-y-0.5 animate-[fadeIn_0.15s_ease-out]"
        >
          <button
            onClick={() => handleCardAction('open', targetTab, title)}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold text-teal-300 hover:bg-teal-500/20 transition-colors cursor-pointer text-left"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Open Page</span>
          </button>
          <button
            onClick={() => handleCardAction('refresh', targetTab, title)}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-200 hover:bg-white/10 transition-colors cursor-pointer text-left"
          >
            <RefreshCw className="h-3.5 w-3.5 text-cyan-400" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => handleCardAction('export', targetTab, title)}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-200 hover:bg-white/10 transition-colors cursor-pointer text-left"
          >
            <Download className="h-3.5 w-3.5 text-emerald-400" />
            <span>Export</span>
          </button>
        </div>
      )}
    </div>
  );

  // Live time for SOC header
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);


  // Filter transactions based on date range selection
  const filteredTransactions = transactions.filter(t => {
    if (calendarFilter === 'all') return true;
    const txDate = new Date(t.timestamp || t.created_at || Date.now());
    const now = new Date();
    if (calendarFilter === 'today') {
      return txDate.toDateString() === now.toDateString();
    }
    if (calendarFilter === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return txDate >= oneWeekAgo;
    }
    if (calendarFilter === 'month') {
      return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    }
    if (calendarFilter === 'custom' && customStartDate) {
      const start = new Date(customStartDate);
      const end = customEndDate ? new Date(customEndDate) : new Date();
      return txDate >= start && txDate <= end;
    }
    return true;
  });

  const displayUsersCount = totalUsersCount;
  const displayRevenue = totalRevenue;
  const displayTxsCount = totalTxsCount;

  const makeTrend = (values: number[]) => {
    const clean = values.filter(v => Number.isFinite(v));
    if (!clean.length) return [0, 0, 0, 0];
    const buckets = 12;
    return Array.from({ length: buckets }, (_, i) => clean[Math.floor((i / buckets) * clean.length)] ?? clean[clean.length - 1]);
  };
  const realTransactionAmounts = filteredTransactions.map(t => Number(t.amount || 0));
  const realLedgerTrend = makeTrend(users.map(u => Number(u.balance || 0)));
  const realUserTrend = makeTrend(users.map((_, i) => i + 1));
  const realRevenueTrend = makeTrend(filteredTransactions.map(t => Number(t.fee ?? t.fees ?? t.charge ?? t.charges ?? 0)));
  const realTxTrend = makeTrend(realTransactionAmounts);
  const relativeTime = (value: any) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return 'Unknown time';
    const seconds = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const recentTransactionsList = filteredTransactions.slice(0, 5).map((t, idx) => ({
    id: t.id ? (String(t.id).startsWith('#') ? t.id : `#TXN-${String(t.id).slice(0, 8)}`) : `#TXN-${String(idx + 1).padStart(4, '0')}`,
    type: t.type === 'redeem_airtime' ? 'Airtime' : t.type === 'withdraw' ? 'Withdrawal' : (t.type || 'Transaction'),
    user: t.user || t.email || 'System User',
    amount: `₦${Number(t.amount || 0).toLocaleString()}`,
    status: ['success','successful','completed','settled','claimed'].includes(String(t.status || '').toLowerCase()) ? 'Success' : String(t.status || 'Pending')
  }));

  return (
    <div className="w-full min-h-screen bg-[#05070e] text-slate-100 font-sans text-xs select-none overflow-x-hidden relative">
      {/* Soft background grid effect */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      {/* 1. TOP LIVE SECURITY TICKER BANNER */}
      <div className="w-full bg-[#080d1a] border-b border-teal-500/20 py-1.5 px-4 overflow-hidden relative z-50 flex items-center gap-3">
        <div className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/30 text-teal-400 text-[10px] font-mono font-bold tracking-wider uppercase">
          <Radio className="h-3 w-3 animate-pulse text-teal-400" />
          SOC LIVE
        </div>
        <div className="flex-1 overflow-hidden whitespace-nowrap">
          <div className="inline-block animate-[marquee_30s_linear_infinite] text-[11px] font-mono text-slate-300 font-medium tracking-wide">
            <span className="text-emerald-400 font-bold">● LIVE DATABASE DATA</span> &nbsp;•&nbsp;
            <span className="text-teal-300">{displayUsersCount} REGISTERED USERS</span> &nbsp;•&nbsp;
            <span className="text-cyan-400">{displayTxsCount} RECORDED TRANSACTIONS</span> &nbsp;•&nbsp;
            <span className="text-purple-400">₦{Number(totalSystemBalance || 0).toLocaleString()} TOTAL WALLET BALANCE</span> &nbsp;•&nbsp;
            <span className="text-emerald-400">₦{Number(displayRevenue || 0).toLocaleString()} RECORDED CHARGES</span>
          </div>
        </div>
      </div>

      {/* 2. TOP SECURITY OPERATIONS CENTER HEADER */}
      <header className="w-full bg-[#080c16]/90 backdrop-blur-xl border-b border-white/10 px-4 md:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 sticky top-0 z-40 shadow-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-teal-400 bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 transition-all cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Nevo Brand & SOC Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveSidebar('overview')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 via-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-teal-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#080c16] rounded-[14px] flex items-center justify-center font-black text-transparent bg-clip-text bg-gradient-to-tr from-teal-400 to-cyan-200 text-lg">
                S
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base md:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  Nevo SOC
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 font-bold uppercase">
                    v2.4
                  </span>
                </h1>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
                Nevo Administration & Operations
              </p>
            </div>
          </div>
        </div>

        {/* Live Status Indicators & Time */}
        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 font-mono text-[10px]">
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              DB: LIVE DATA
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1 text-cyan-400 font-bold">
              <Wifi className="h-3 w-3" /> API: LIVE
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1 text-teal-400 font-bold">
              <Lock className="h-3 w-3" /> SECURITY: ACTIVE
            </span>
          </div>

          <div className="text-right font-mono hidden sm:block">
            <div className="text-xs font-bold text-teal-400">
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="text-[9px] text-slate-400 uppercase tracking-wider">
              {currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <button
              onClick={() => onNavigateTab('reports')}
              className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all cursor-pointer"
              title="Notifications & Audit Logs"
            >
              <Bell className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 pl-1">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-500/40 p-0.5">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                    alt="Admin Avatar"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#080c16]" />
              </div>
              <div className="hidden xl:block text-left">
                <div className="text-xs font-bold text-white leading-tight">SOC Admin</div>
                <div className="text-[9px] text-teal-400 font-mono font-bold uppercase">Super Operator</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* 3. LEFT CYBER SIDEBAR NAVIGATION */}
        <AdminSidebar
          activeTab="overview"
          onNavigateTab={onNavigateTab}
          usersCount={totalUsersCount || users.length}
          pendingPaymentsCount={pendingPaymentsCount}
          pendingWithdrawalsCount={pendingWithdrawalsCount || stats?.pendingCount || 0}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          onExit={onBack}
          isCyberStyle={true}
        />

        {/* 4. MAIN CONTENT WORKSPACE */}
        <main className="flex-1 p-3 sm:p-5 md:p-6 space-y-6 max-w-[1650px] mx-auto overflow-x-hidden">
          {/* Workspace Filter Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#080c16]/80 p-4 rounded-2xl border border-white/10 backdrop-blur-xl">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-tight">Real-Time Operations Dashboard</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE FEED
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Monitoring active transactions, ledger balances, and system health.</p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowCalendarModal(true)}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-2 rounded-xl text-slate-200 text-xs font-bold cursor-pointer transition-all"
              >
                <Calendar className="h-4 w-4 text-teal-400" />
                <span>
                  {calendarFilter === 'all' ? 'All Time Audit' : calendarFilter === 'today' ? 'Today (Daily)' : calendarFilter === 'week' ? 'This Week' : calendarFilter === 'month' ? 'This Month' : 'Custom Range'}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1" />
              </button>
              <button
                onClick={() => setShowCalendarModal(true)}
                className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer"
                title="Filter Date Options"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 5. TOP 4 CYBER STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Card 1: TOTAL USERS */}
            <div className="p-4 md:p-5 rounded-2xl bg-[#080d1a]/90 border border-teal-500/30 backdrop-blur-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:border-teal-400/60 transition-all group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 group-hover:scale-105 transition-transform">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-bold tracking-widest text-teal-400 uppercase block">TOTAL REGISTERED USERS</span>
                    <div className="text-2xl font-black text-white font-mono">{displayUsersCount}</div>
                  </div>
                </div>
                {renderCardMenu('users', 'Total Registered Users', 'users')}
              </div>

              <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/10">
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                  <ArrowUp className="h-3 w-3" />
                  <span>{stats.newUsersToday} today</span>
                  <span className="text-slate-400 text-[10px] ml-1 font-normal">live count</span>
                </div>
                <div className="hidden sm:block shrink-0">
                  <Sparkline color="#2dd4bf" points={realUserTrend} />
                </div>
              </div>
            </div>

            {/* Card 2: TOTAL LEDGER BALANCE */}
            <div className="p-4 md:p-5 rounded-2xl bg-[#080d1a]/90 border border-purple-500/30 backdrop-blur-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:border-purple-400/60 transition-all group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 group-hover:scale-105 transition-transform">
                    <Wallet className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-bold tracking-widest text-purple-400 uppercase block">TOTAL SYSTEM LEDGER</span>
                    <div className="text-2xl font-black text-white font-mono">
                      ₦{totalSystemBalance.toLocaleString()}
                    </div>
                  </div>
                </div>
                {renderCardMenu('ledger', 'Total System Ledger', 'reports')}
              </div>

              <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/10">
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                  <ArrowUp className="h-3 w-3" />
                  <span>Live</span>
                  <span className="text-slate-400 text-[10px] ml-1 font-normal">wallet ledger</span>
                </div>
                <div className="hidden sm:block shrink-0">
                  <Sparkline color="#a855f7" points={realLedgerTrend} />
                </div>
              </div>
            </div>

            {/* Card 3: REVENUE / CHARGES */}
            <div className="p-4 md:p-5 rounded-2xl bg-[#080d1a]/90 border border-emerald-500/30 backdrop-blur-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:border-emerald-400/60 transition-all group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 group-hover:scale-105 transition-transform">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-bold tracking-widest text-emerald-400 uppercase block">SYSTEM CHARGES REVENUE</span>
                    <div className="text-2xl font-black text-white font-mono">₦{displayRevenue.toLocaleString()}</div>
                  </div>
                </div>
                {renderCardMenu('revenue', 'System Charges Revenue', 'reports')}
              </div>

              <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/10">
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                  <ArrowUp className="h-3 w-3" />
                  <span>Recorded</span>
                  <span className="text-slate-400 text-[10px] ml-1 font-normal">actual charges</span>
                </div>
                <div className="hidden sm:block shrink-0">
                  <Sparkline color="#10b981" points={realRevenueTrend} />
                </div>
              </div>
            </div>

            {/* Card 4: TRANSACTIONS COUNT */}
            <div className="p-4 md:p-5 rounded-2xl bg-[#080d1a]/90 border border-cyan-500/30 backdrop-blur-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:border-cyan-400/60 transition-all group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 group-hover:scale-105 transition-transform">
                    <Database className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-bold tracking-widest text-cyan-400 uppercase block">EXECUTED TRANSACTIONS</span>
                    <div className="text-2xl font-black text-white font-mono">{displayTxsCount}</div>
                  </div>
                </div>
                {renderCardMenu('transactions', 'Executed Transactions', 'logs')}
              </div>

              <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/10">
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                  <ArrowUp className="h-3 w-3" />
                  <span>Live</span>
                  <span className="text-slate-400 text-[10px] ml-1 font-normal">recorded transactions</span>
                </div>
                <div className="hidden sm:block shrink-0">
                  <Sparkline color="#06b6d4" points={realTxTrend} />
                </div>
              </div>
            </div>
          </div>

          {/* 6. FINTECH TRANSACTION VOLUME & CYBER CONSOLE TERMINAL */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Financial Analytics Chart (8 cols) */}
            <div className="lg:col-span-8 p-5 md:p-6 rounded-2xl bg-[#080d1a]/90 border border-white/10 backdrop-blur-xl space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-sm font-black tracking-wider text-white uppercase flex items-center gap-2">
                    <Activity className="h-4 w-4 text-teal-400" />
                    Fintech Transaction Volume Analytics
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Real-time ledger flow comparison by transaction category</p>
                </div>
                <span className="px-3 py-1 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-mono font-bold">
                  LIVE DATA
                </span>
              </div>

              <div className="w-full min-h-[260px] flex items-center justify-center rounded-2xl border border-white/5 bg-black/10">
                {totalTxsCount === 0 ? (
                  <div className="text-center px-6"><Activity className="w-8 h-8 mx-auto text-slate-600 mb-2"/><p className="text-xs font-bold text-slate-500">No transaction data yet</p><p className="text-[10px] text-slate-600 mt-1">Analytics will populate automatically as real transactions are recorded.</p></div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
                    <div className="rounded-xl border border-white/10 p-4"><div className="text-[9px] text-slate-500 uppercase">Recorded</div><div className="text-xl font-black text-white mt-1">{totalTxsCount}</div></div>
                    <div className="rounded-xl border border-white/10 p-4"><div className="text-[9px] text-slate-500 uppercase">Successful</div><div className="text-xl font-black text-emerald-400 mt-1">{stats.successfulOrCompletedTransactions}</div></div>
                    <div className="rounded-xl border border-white/10 p-4"><div className="text-[9px] text-slate-500 uppercase">Failed</div><div className="text-xl font-black text-rose-400 mt-1">{stats.failedTransactions}</div></div>
                    <div className="rounded-xl border border-white/10 p-4"><div className="text-[9px] text-slate-500 uppercase">Health</div><div className="text-xl font-black text-teal-400 mt-1">{stats.systemHealth}%</div></div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Cyber Console & Hardware Health (4 cols) */}
            <div className="lg:col-span-4 p-5 rounded-2xl bg-[#080d1a]/90 border border-teal-500/30 backdrop-blur-xl space-y-4 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-xs font-black tracking-wider text-teal-400 uppercase flex items-center gap-2 font-mono">
                    <Terminal className="h-4 w-4" />
                    Cyber Operations Terminal
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>

                <div className="bg-[#03050a] rounded-xl border border-white/10 p-3 mt-3 font-mono text-[11px] space-y-2 h-48 overflow-y-auto">
                  <div className="text-emerald-400 flex items-start gap-1.5"><span className="text-slate-600">[{currentTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'})}]</span><span>✓ Admin dashboard connected to live application data</span></div>
                  <div className="text-teal-300 flex items-start gap-1.5"><span className="text-slate-600">LIVE</span><span>✓ Registered users: {totalUsersCount}</span></div>
                  <div className="text-cyan-400 flex items-start gap-1.5"><span className="text-slate-600">LIVE</span><span>✓ Recorded transactions: {totalTxsCount}</span></div>
                  <div className="text-purple-400 flex items-start gap-1.5"><span className="text-slate-600">LIVE</span><span>✓ Pending withdrawals: {stats.pendingCount}</span></div>
                  <div className="text-amber-400 flex items-start gap-1.5"><span className="text-slate-600">LIVE</span><span>! Failed transactions: {stats.failedTransactions}</span></div>
                  <div className="text-emerald-400 flex items-start gap-1.5"><span className="text-slate-600">LIVE</span><span>✓ System health: {stats.systemHealth}%</span></div>
                </div>
              </div>

              {/* Hardware Performance Monitors */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block font-bold">
                  SERVER HEALTH MONITORS
                </span>

                <div className="space-y-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-300">
                      <span className="flex items-center gap-1"><Cpu className="h-3 w-3 text-teal-400" /> CPU Load</span>
                      <span className="text-teal-400 font-bold">18%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full bg-teal-400 rounded-full w-[18%]" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-300">
                      <span className="flex items-center gap-1"><Server className="h-3 w-3 text-indigo-400" /> Memory (RAM)</span>
                      <span className="text-indigo-400 font-bold">41%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full w-[41%]" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-300">
                      <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-cyan-400" /> API Latency</span>
                      <span className="text-cyan-400 font-bold">19ms</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full bg-cyan-400 rounded-full w-[12%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 7. RECENT TRANSACTIONS & SYSTEM ALERTS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Recent Transactions Table (7 cols) */}
            <div className="lg:col-span-7 p-5 rounded-2xl bg-[#080d1a]/90 border border-white/10 backdrop-blur-xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-xs font-black tracking-wider text-white uppercase flex items-center gap-2 font-mono">
                  <Activity className="h-4 w-4 text-cyan-400" />
                  Recent Transaction Ledger
                </h3>
                <button
                  onClick={() => onNavigateTab('overview')}
                  className="text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors cursor-pointer"
                >
                  View full ledger →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3 pr-2">TX REF</th>
                      <th className="pb-3 px-2">TYPE</th>
                      <th className="pb-3 px-2">USER</th>
                      <th className="pb-3 px-2">AMOUNT</th>
                      <th className="pb-3 pl-2 text-right">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {recentTransactionsList.map((tx, i) => (
                      <tr key={i} className="hover:bg-white/[0.03] transition-colors">
                        <td className="py-3 pr-2 font-mono text-teal-300 font-bold">{tx.id}</td>
                        <td className="py-3 px-2 text-slate-200">{tx.type}</td>
                        <td className="py-3 px-2 text-slate-200">{tx.user}</td>
                        <td className="py-3 px-2 font-mono font-bold text-white">{tx.amount}</td>
                        <td className="py-3 pl-2 text-right">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                              tx.status === 'Success'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Security Alerts Feed (5 cols) */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-[#080d1a]/90 border border-white/10 backdrop-blur-xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-xs font-black tracking-wider text-white uppercase flex items-center gap-2 font-mono">
                  <ShieldAlert className="h-4 w-4 text-rose-400" />
                  Live Security Feed
                </h3>
                <button
                  onClick={() => onNavigateTab('reports')}
                  className="text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors cursor-pointer"
                >
                  Audit Feed →
                </button>
              </div>

              <div className="space-y-3">
                {logs.length === 0 ? (
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 text-center text-slate-500 font-mono text-xs">
                    No security or admin events recorded yet.
                  </div>
                ) : logs.slice(0, 3).map((log: any) => (
                  <div key={String(log.id || log.timestamp)} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 shrink-0">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-xs font-bold text-white break-words">{String(log.message || 'Administrative activity')}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{String(log.type || 'INFO').replace(/_/g, ' ')} • {relativeTime(log.timestamp)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 8. BOTTOM ROW STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#080d1a]/90 border border-white/10 backdrop-blur-xl flex items-center justify-between gap-3.5 shadow-lg">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
                  <Download className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[9px] font-mono font-bold tracking-widest text-slate-400 uppercase block">PENDING WITHDRAWALS</span>
                  <div className="text-xl font-black text-white font-mono">{stats.pendingCount}</div>
                  <div className="text-[10px] text-amber-400 font-mono font-bold mt-0.5">Current pending requests</div>
                </div>
              </div>
              {renderCardMenu('pending_withdrawals', 'Pending Withdrawals', 'withdrawals')}
            </div>

            <div className="p-4 rounded-2xl bg-[#080d1a]/90 border border-white/10 backdrop-blur-xl flex items-center justify-between gap-3.5 shadow-lg">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 shrink-0">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[9px] font-mono font-bold tracking-widest text-slate-400 uppercase block">NEW USERS TODAY</span>
                  <div className="text-xl font-black text-white font-mono">{stats.newUsersToday}</div>
                  <div className="text-[10px] text-emerald-400 font-mono font-bold mt-0.5">Actual registrations today</div>
                </div>
              </div>
              {renderCardMenu('new_users', 'New Users Today', 'users')}
            </div>

            <div className="p-4 rounded-2xl bg-[#080d1a]/90 border border-white/10 backdrop-blur-xl flex items-center justify-between gap-3.5 shadow-lg">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 shrink-0">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[9px] font-mono font-bold tracking-widest text-slate-400 uppercase block">FAILED TRANSACTIONS</span>
                  <div className="text-xl font-black text-white font-mono">{stats.failedTransactions}</div>
                  <div className="text-[10px] text-slate-400 font-mono font-bold mt-0.5">{stats.systemHealth == null ? 'No transaction outcome data' : `${stats.systemHealth}% recorded success rate`}</div>
                </div>
              </div>
              {renderCardMenu('failed_txs', 'Failed Transactions', 'security')}
            </div>

            <div className="p-4 rounded-2xl bg-[#080d1a]/90 border border-white/10 backdrop-blur-xl flex items-center justify-between gap-3.5 shadow-lg">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[9px] font-mono font-bold tracking-widest text-slate-400 uppercase block">SYSTEM HEALTH</span>
                  <div className="text-xl font-black text-emerald-400 font-mono">{stats.systemHealth == null ? 'NO DATA' : `${stats.systemHealth}%`}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{stats.systemHealth == null ? 'No transaction outcomes recorded' : 'Calculated from recorded transaction outcomes'}</div>
                </div>
              </div>
              {renderCardMenu('system_health', 'System Health', 'reports')}
            </div>
          </div>

          {/* 9. RECENT ADMIN ACTIVITIES */}
          <div className="p-5 rounded-2xl bg-[#080d1a]/90 border border-white/10 backdrop-blur-xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xs font-black tracking-wider text-white uppercase flex items-center gap-2 font-mono">
                <Terminal className="h-4 w-4 text-purple-400" />
                Recent Security &amp; Admin Audit Log
              </h3>
              <button
                onClick={() => onNavigateTab('logs')}
                className="text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors cursor-pointer"
              >
                View full logs →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 pr-2">OPERATOR</th>
                    <th className="pb-3 px-2">ACTION</th>
                    <th className="pb-3 px-2">AUDIT DETAILS</th>
                    <th className="pb-3 pl-2 text-right">TIMESTAMP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {logs.length === 0 ? (
                    <tr><td colSpan={4} className="py-10 text-center text-slate-500 font-mono text-xs">No recent admin activity recorded.</td></tr>
                  ) : logs.slice(0, 5).map((log: any) => (
                    <tr key={String(log.id || log.timestamp || Math.random())} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3 pr-2"><span className="font-bold text-white">Admin</span></td>
                      <td className="py-3 px-2 text-teal-300 font-mono font-bold">{String(log.type || 'INFO').replace(/_/g, ' ')}</td>
                      <td className="py-3 px-2 text-slate-300 break-words">{String(log.message || 'Administrative activity')}</td>
                      <td className="py-3 pl-2 text-right text-slate-400 font-mono text-[11px]">{relativeTime(log.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <footer className="flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-500 pt-6 border-t border-white/10 gap-2 pb-4">
            <div>© 2026 Nevo Financial Security Systems. All rights reserved.</div>
            <div className="flex items-center gap-3">
              <span className="text-teal-400">SOC SECURITY LEVEL 1</span>
              <span>•</span>
              <span>v2.4.0-STABLE</span>
            </div>
          </footer>
        </main>
      </div>

      {/* Date Range Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#080d1a] border border-teal-500/30 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-teal-400" />
                <h3 className="text-sm font-bold text-white">Select Date Range Filter</h3>
              </div>
              <button
                onClick={() => setShowCalendarModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setCalendarFilter('all');
                  setShowCalendarModal(false);
                }}
                className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  calendarFilter === 'all'
                    ? 'bg-teal-500/20 border-teal-500/40 text-teal-300 font-bold'
                    : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <span>All Time (Default)</span>
                {calendarFilter === 'all' && <CheckCircle className="h-4 w-4 text-teal-400" />}
              </button>

              <button
                onClick={() => {
                  setCalendarFilter('today');
                  setShowCalendarModal(false);
                }}
                className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  calendarFilter === 'today'
                    ? 'bg-teal-500/20 border-teal-500/40 text-teal-300 font-bold'
                    : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <span>Daily / Today</span>
                {calendarFilter === 'today' && <CheckCircle className="h-4 w-4 text-teal-400" />}
              </button>

              <button
                onClick={() => {
                  setCalendarFilter('week');
                  setShowCalendarModal(false);
                }}
                className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  calendarFilter === 'week'
                    ? 'bg-teal-500/20 border-teal-500/40 text-teal-300 font-bold'
                    : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <span>Weekly (Last 7 Days)</span>
                {calendarFilter === 'week' && <CheckCircle className="h-4 w-4 text-teal-400" />}
              </button>

              <button
                onClick={() => {
                  setCalendarFilter('month');
                  setShowCalendarModal(false);
                }}
                className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  calendarFilter === 'month'
                    ? 'bg-teal-500/20 border-teal-500/40 text-teal-300 font-bold'
                    : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <span>Monthly</span>
                {calendarFilter === 'month' && <CheckCircle className="h-4 w-4 text-teal-400" />}
              </button>

              <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">Custom Date Range</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="bg-[#03050a] border border-white/10 rounded-lg p-2 text-xs text-white"
                  />
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="bg-[#03050a] border border-white/10 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <button
                  onClick={() => {
                    if (customStartDate) {
                      setCalendarFilter('custom');
                      setShowCalendarModal(false);
                    }
                  }}
                  disabled={!customStartDate}
                  className="w-full py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                >
                  Apply Custom Range
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

