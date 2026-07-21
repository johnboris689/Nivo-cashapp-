import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  Building2,
  ArrowUpRight,
  Sparkles,
  Wallet,
  CheckSquare,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  Settings,
} from 'lucide-react';
import { AdminStats } from '../../types';
import { api } from '../../lib/api';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const data = await api.getAdminStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#11141c] p-6 rounded-3xl border border-amber-500/20">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-black text-white">Administrator Control Dashboard</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">Live system metrics, user controls, and financial management</p>
        </div>

        <button
          onClick={fetchStats}
          className="flex items-center gap-1.5 bg-[#171b26] hover:bg-[#1f2536] text-amber-400 text-xs font-bold px-4 py-2.5 rounded-xl border border-amber-500/30 transition-all cursor-pointer shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Primary Analytics Grid */}
      {loading ? (
        <div className="text-center py-10 text-zinc-500 text-xs">Loading analytics data...</div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#11141c] p-5 rounded-2xl border border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase">Total Users</span>
              <Users className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-2xl font-black text-white mt-2">{stats?.totalUsers || 0}</p>
            <p className="text-[10px] text-emerald-400 font-bold mt-1">{stats?.activeUsers || 0} Active Accounts</p>
          </div>

          <div className="bg-[#11141c] p-5 rounded-2xl border border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase">Approved Deposits</span>
              <Building2 className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-emerald-400 mt-2">
              ₦{(stats?.totalDepositsAmount || 0).toLocaleString()}
            </p>
            {stats?.pendingDepositsCount ? (
              <p className="text-[10px] text-amber-400 font-bold mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {stats.pendingDepositsCount} Pending Requests
              </p>
            ) : (
              <p className="text-[10px] text-zinc-500 mt-1">All processed</p>
            )}
          </div>

          <div className="bg-[#11141c] p-5 rounded-2xl border border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase">Total Withdrawals</span>
              <ArrowUpRight className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-amber-400 mt-2">
              ₦{(stats?.totalWithdrawalsAmount || 0).toLocaleString()}
            </p>
            {stats?.pendingWithdrawalsCount ? (
              <p className="text-[10px] text-amber-400 font-bold mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {stats.pendingWithdrawalsCount} Pending Requests
              </p>
            ) : (
              <p className="text-[10px] text-zinc-500 mt-1">All processed</p>
            )}
          </div>

          <div className="bg-[#11141c] p-5 rounded-2xl border border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase">User Wallet Balances</span>
              <Wallet className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-2xl font-black text-white mt-2">
              ₦{(stats?.totalWalletBalances || 0).toLocaleString()}
            </p>
            <p className="text-[10px] text-zinc-500 mt-1">Total active funds</p>
          </div>
        </div>
      )}

      {/* Admin Modules Quick Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link
          to="/admin/users"
          className="bg-[#11141c] hover:bg-[#171b26] p-6 rounded-3xl border border-zinc-800 hover:border-amber-500/40 transition-all space-y-3 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-white">Users & Wallet Controls</h3>
          <p className="text-xs text-zinc-400">Search users, edit wallet balances, credit/debit accounts, suspend or activate users.</p>
        </Link>

        <Link
          to="/admin/deposits"
          className="bg-[#11141c] hover:bg-[#171b26] p-6 rounded-3xl border border-zinc-800 hover:border-amber-500/40 transition-all space-y-3 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-white">Deposit Requests & Bank</h3>
          <p className="text-xs text-zinc-400">Approve or reject deposit proof requests and update official company bank details.</p>
        </Link>

        <Link
          to="/admin/withdrawals"
          className="bg-[#11141c] hover:bg-[#171b26] p-6 rounded-3xl border border-zinc-800 hover:border-amber-500/40 transition-all space-y-3 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-white">Withdrawals Management</h3>
          <p className="text-xs text-zinc-400">Review pending bank withdrawal applications, mark paid, or reject with balance refund.</p>
        </Link>

        <Link
          to="/admin/tasks"
          className="bg-[#11141c] hover:bg-[#171b26] p-6 rounded-3xl border border-zinc-800 hover:border-amber-500/40 transition-all space-y-3 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
            <CheckSquare className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-white">Tasks Management</h3>
          <p className="text-xs text-zinc-400">Create, edit, enable/disable, and set custom reward amounts for daily user tasks.</p>
        </Link>

        <Link
          to="/admin/referrals"
          className="bg-[#11141c] hover:bg-[#171b26] p-6 rounded-3xl border border-zinc-800 hover:border-amber-500/40 transition-all space-y-3 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-white">Referral Settings & Logs</h3>
          <p className="text-xs text-zinc-400">Configure global referral reward amount (default ₦1,200) and view all referral logs.</p>
        </Link>

        <Link
          to="/admin/settings"
          className="bg-[#11141c] hover:bg-[#171b26] p-6 rounded-3xl border border-zinc-800 hover:border-amber-500/40 transition-all space-y-3 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-zinc-300 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
            <Settings className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-white">Website & System Settings</h3>
          <p className="text-xs text-zinc-400">Configure site title, maintenance mode, announcement banner notices, and support channels.</p>
        </Link>
      </div>
    </div>
  );
};
