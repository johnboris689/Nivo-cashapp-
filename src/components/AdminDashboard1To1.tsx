import React from 'react';
import NevoLogo from './NevoLogo';
import AdminSidebar, { AdminTab } from './AdminSidebar';
import {
  Users,
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  Activity,
  CheckSquare,
  Settings,
  RefreshCw,
  ShieldAlert,
  MoreVertical,
} from 'lucide-react';

interface Props {
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

const money = (value: number) => `₦${Number(value || 0).toLocaleString()}`;
const timeAgo = (value: any) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
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
  onToast,
}: Props) {
  const activeUsers = users.filter(u => !u?.isSuspended && !u?.isFrozen && String(u?.accountStatus || 'active').toLowerCase() !== 'suspended').length;
  const suspendedUsers = users.filter(u => u?.isSuspended || u?.isFrozen || String(u?.accountStatus || '').toLowerCase() === 'suspended').length;
  const recentLogs = Array.isArray(logs) ? logs.filter(Boolean).slice(0, 5) : [];
  const recentTransactions = Array.isArray(transactions) ? transactions.slice(0, 4) : [];

  const statCards = [
    { label: 'Total Users', value: totalUsersCount, detail: `${activeUsers} active accounts`, icon: Users, tone: 'emerald' },
    { label: 'Active Users', value: activeUsers, detail: 'Verified & active', icon: Users, tone: 'emerald' },
    { label: 'Suspended / Frozen', value: suspendedUsers, detail: 'Restricted access', icon: ShieldAlert, tone: 'danger' },
    { label: 'Total System Funds', value: money(totalSystemBalance), detail: 'Combined wallet balances', icon: Wallet, tone: 'gold' },
  ];

  const toneClass = (tone: string) => tone === 'danger'
    ? 'text-rose-300 bg-rose-500/[0.07] border-rose-500/15'
    : tone === 'gold'
      ? 'text-[#E4D878] bg-[#E4D878]/[0.05] border-[#E4D878]/15'
      : 'text-[#7EE8D3] bg-[#00C9A7]/[0.06] border-[#00C9A7]/15';

  return (
    <div className="min-h-screen w-full bg-[#070A0D] text-white font-sans overflow-x-hidden">
      <div className="flex min-h-screen">
        <AdminSidebar
          activeTab="overview"
          onNavigateTab={onNavigateTab}
          usersCount={totalUsersCount}
          pendingPaymentsCount={pendingPaymentsCount}
          pendingWithdrawalsCount={pendingWithdrawalsCount}
          onExit={onBack}
          isCyberStyle={false}
        />

        <main className="min-w-0 flex-1 p-3 sm:p-5 lg:p-7">
          <header className="mb-5 flex flex-col gap-4 rounded-[26px] border border-[#00C9A7]/15 bg-gradient-to-br from-[#0D1A1C]/90 to-[#071114]/85 p-4 sm:p-5 shadow-[0_22px_60px_rgba(0,0,0,.22)] backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <NevoLogo size={42} compact />
              <div>
                <div className="flex items-center gap-2"><h1 className="text-lg font-bold tracking-tight">Admin Panel</h1><span className="rounded-full border border-[#00C9A7]/20 bg-[#00C9A7]/[0.06] px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-[#7EE8D3]">Live data</span></div>
                <p className="mt-0.5 text-[10px] text-[#7F8C8C]">Manage your Nevo platform</p>
              </div>
            </div>
            <button onClick={() => onToast?.('Dashboard uses live database data.', 'info')} className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5 py-2.5 text-[10px] font-bold text-[#9AA6A6] hover:border-[#00C9A7]/25 hover:text-white cursor-pointer"><RefreshCw className="h-3.5 w-3.5 text-[#7EE8D3]" /> Refresh view</button>
          </header>

          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {statCards.map(({ label, value, detail, icon: Icon, tone }) => (
              <div key={label} className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#0D1A1C]/85 to-[#071114]/75 p-4 shadow-[0_18px_45px_rgba(0,0,0,.18)]">
                <div className="flex items-start justify-between gap-2"><span className="text-[9px] font-semibold uppercase tracking-wide text-[#839090]">{label}</span><span className={`flex h-8 w-8 items-center justify-center rounded-xl border ${toneClass(tone)}`}><Icon className="h-4 w-4" /></span></div>
                <div className="mt-3 break-words text-xl font-semibold tracking-tight">{value}</div>
                <div className="mt-1 text-[9px] text-[#728080]">{detail}</div>
              </div>
            ))}
          </section>

          <section className="mt-4 grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
            <div className="rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[#0C181A]/85 to-[#071114]/80 p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between"><div><h2 className="text-sm font-bold">Recent Activity</h2><p className="mt-1 text-[9px] text-[#758282]">Recorded application events</p></div><Activity className="h-4 w-4 text-[#00C9A7]" /></div>
              {recentLogs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/[0.08] p-8 text-center text-xs text-[#748181]">No recent activity</div>
              ) : (
                <div className="space-y-2.5">
                  {recentLogs.map((log: any, index: number) => (
                    <div key={log.id || index} className="flex items-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.018] p-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#00C9A7]/[0.07] text-[#7EE8D3]"><Activity className="h-4 w-4" /></span>
                      <div className="min-w-0 flex-1"><p className="truncate text-[11px] font-semibold text-[#DCE4E3]">{log.message || log.action || 'Application event'}</p><p className="mt-1 truncate text-[9px] text-[#718080]">{log.type || 'System activity'}</p></div>
                      <span className="shrink-0 text-[9px] text-[#728080]">{timeAgo(log.timestamp || log.createdAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[#0C181A]/85 to-[#071114]/80 p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between"><div><h2 className="text-sm font-bold">Latest Transactions</h2><p className="mt-1 text-[9px] text-[#758282]">Real records from user accounts</p></div><Wallet className="h-4 w-4 text-[#00C9A7]" /></div>
              {recentTransactions.length === 0 ? <div className="rounded-2xl border border-dashed border-white/[0.08] p-8 text-center text-xs text-[#748181]">No transactions recorded</div> : <div className="space-y-2.5">{recentTransactions.map((tx:any,index:number) => <div key={tx.id || index} className="flex items-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.018] p-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#00C9A7]/[0.07] text-[#7EE8D3]">{String(tx.type || '').toLowerCase().includes('withdraw') ? <ArrowUpFromLine className="h-4 w-4" /> : <ArrowDownToLine className="h-4 w-4" />}</span><div className="min-w-0 flex-1"><p className="truncate text-[11px] font-semibold">{tx.user || tx.email || 'Account'}</p><p className="mt-1 truncate text-[9px] text-[#718080]">{tx.type || 'Transaction'}</p></div><div className="text-right"><p className="text-[10px] font-bold">{money(Number(tx.amount || 0))}</p><p className="mt-1 text-[8px] text-[#718080]">{tx.status || 'pending'}</p></div></div>)}</div>}
            </div>
          </section>

          <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ['Users Management', 'Search, suspend, activate and manage accounts.', Users, 'users'],
              ['Tasks Management', 'Create and manage database-backed tasks.', CheckSquare, 'nivo_rewards'],
              ['Payments', `KoraPay deposits${pendingPaymentsCount ? ` • ${pendingPaymentsCount} pending` : ''}`, ArrowDownToLine, 'payments'],
              ['Withdrawals', `Review bank withdrawal requests${pendingWithdrawalsCount ? ` • ${pendingWithdrawalsCount} pending` : ''}`, ArrowUpFromLine, 'withdrawals'],
            ].map(([title, text, Icon, tab]: any) => <button key={title} onClick={() => onNavigateTab(tab)} className="group rounded-2xl border border-white/[0.06] bg-white/[0.018] p-4 text-left hover:border-[#00C9A7]/20 hover:bg-[#00C9A7]/[0.025] cursor-pointer"><span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#00C9A7]/15 bg-[#00C9A7]/[0.06] text-[#7EE8D3]"><Icon className="h-4 w-4" /></span><p className="mt-3 text-xs font-bold">{title}</p><p className="mt-1 text-[9px] leading-5 text-[#748181]">{text}</p><span className="mt-3 inline-flex items-center gap-1 text-[9px] font-bold text-[#7EE8D3]">Open <MoreVertical className="h-3 w-3 rotate-90" /></span></button>)}
          </section>

          <section className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-white/[0.06] bg-[#0B1517]/70 p-5"><p className="text-[9px] uppercase tracking-wider text-[#758282]">Recorded transactions</p><p className="mt-2 text-2xl font-semibold">{totalTxsCount}</p><p className="mt-1 text-[9px] text-[#718080]">All recorded transaction records</p></div>
            <div className="rounded-3xl border border-white/[0.06] bg-[#0B1517]/70 p-5"><p className="text-[9px] uppercase tracking-wider text-[#758282]">Recorded charges</p><p className="mt-2 text-2xl font-semibold">{money(totalRevenue)}</p><p className="mt-1 text-[9px] text-[#718080]">Calculated from stored transaction data</p></div>
            <div className="rounded-3xl border border-white/[0.06] bg-[#0B1517]/70 p-5"><p className="text-[9px] uppercase tracking-wider text-[#758282]">Pending withdrawals</p><p className="mt-2 text-2xl font-semibold">{Number(stats?.pendingCount || 0)}</p><p className="mt-1 text-[9px] text-[#718080]">Awaiting administrator action</p></div>
          </section>

          <div className="mt-5 flex items-center justify-between border-t border-white/[0.05] pt-4 text-[9px] text-[#647171]"><span>Nevo administration</span><span className="flex items-center gap-2"><Settings className="h-3.5 w-3.5" /> Persistent database-backed controls</span></div>
        </main>
      </div>
    </div>
  );
}
