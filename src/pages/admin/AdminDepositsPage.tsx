import React, { useState, useEffect } from 'react';
import {
  Building2,
  CheckCircle2,
  Search,
  RefreshCw,
  ShieldCheck,
  Zap,
  Sparkles,
  TrendingUp,
  Clock,
  Filter,
} from 'lucide-react';
import { DepositRequest } from '../../types';
import { api } from '../../lib/api';

export const AdminDepositsPage: React.FC = () => {
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');

  const fetchDeposits = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminDeposits();
      setDeposits(data);
    } catch (err) {
      console.error('Failed to fetch deposits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  // Filtered deposits
  const filteredDeposits = deposits.filter((d) => {
    const matchesSearch =
      d.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.reference || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.accountNumber || '').includes(searchTerm) ||
      (d.bankName || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'approved'
        ? d.status === 'approved' || d.status === 'completed'
        : d.status === 'pending';

    return matchesSearch && matchesStatus;
  });

  // Calculate Metrics
  const totalVolume = deposits
    .filter((d) => d.status === 'approved' || d.status === 'completed')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const successfulCount = deposits.filter(
    (d) => d.status === 'approved' || d.status === 'completed'
  ).length;

  const pendingCount = deposits.filter((d) => d.status === 'pending').length;

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#11141c] p-6 rounded-3xl border border-emerald-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Building2 className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-white">Automated Paystack Deposit Logs</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time monitoring of Paystack Dedicated Virtual Account (DVA) deposits & webhook verifications
          </p>
        </div>

        <button
          onClick={fetchDeposits}
          className="flex items-center gap-1.5 bg-[#171b26] hover:bg-[#1f2536] text-emerald-400 text-xs font-bold px-4 py-2.5 rounded-xl border border-emerald-500/30 transition-all cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Live Logs</span>
        </button>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#11141c] p-5 rounded-2xl border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Deposit Volume</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">₦{totalVolume.toLocaleString()}</p>
          <p className="text-[10px] text-zinc-500 font-bold">Auto-credited via Paystack</p>
        </div>

        <div className="bg-[#11141c] p-5 rounded-2xl border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Successful Transactions</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">{successfulCount}</p>
          <p className="text-[10px] text-emerald-400 font-bold">100% Webhook Verified</p>
        </div>

        <div className="bg-[#11141c] p-5 rounded-2xl border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Pending DVA Sessions</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">{pendingCount}</p>
          <p className="text-[10px] text-zinc-500 font-bold">Awaiting User Transfer</p>
        </div>

        <div className="bg-[#11141c] p-5 rounded-2xl border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Paystack Engine</span>
            <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400" />
          </div>
          <p className="text-base font-black text-emerald-400 flex items-center gap-1.5 mt-1">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Automated Active</span>
          </p>
          <p className="text-[10px] text-zinc-500 font-bold">Zero Manual Approval Required</p>
        </div>
      </div>

      {/* Main Monitoring Table Panel */}
      <div className="bg-[#11141c] border border-zinc-800 rounded-3xl p-6 space-y-4">
        {/* Search & Filter Header */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by customer, email, bank, or ref..."
              className="w-full bg-[#171b26] border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 font-bold focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-400" />
            <div className="flex bg-[#171b26] p-1 rounded-xl border border-zinc-800 text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-emerald-500 text-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('approved')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  statusFilter === 'approved'
                    ? 'bg-emerald-500 text-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Successful
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  statusFilter === 'pending'
                    ? 'bg-emerald-500 text-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Pending
              </button>
            </div>
          </div>
        </div>

        {/* Deposits Table */}
        {loading ? (
          <div className="text-center py-12 text-zinc-500 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
            <span>Loading Paystack deposit logs...</span>
          </div>
        ) : filteredDeposits.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-2xl">
            No Paystack automated deposits found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 font-extrabold uppercase text-[10px]">
                  <th className="py-3.5 px-3">Customer</th>
                  <th className="py-3.5 px-3">Amount</th>
                  <th className="py-3.5 px-3">Bank & Virtual Account</th>
                  <th className="py-3.5 px-3">Paystack Reference</th>
                  <th className="py-3.5 px-3">Webhook Verification</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3 text-right">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-medium text-zinc-300">
                {filteredDeposits.map((d) => {
                  const isApproved = d.status === 'approved' || d.status === 'completed';
                  return (
                    <tr key={d.id} className="hover:bg-[#171b26] transition-colors">
                      <td className="py-3.5 px-3">
                        <p className="font-bold text-white">{d.userName}</p>
                        <p className="text-[10px] text-zinc-500 font-mono">{d.userEmail}</p>
                      </td>

                      <td className="py-3.5 px-3 font-black text-emerald-400 text-sm">
                        ₦{d.amount.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-3">
                        <p className="font-bold text-zinc-200">{d.bankName || 'Wema Bank (Paystack DVA)'}</p>
                        <p className="text-[10px] font-mono text-amber-400">
                          {d.accountNumber || 'DVA Generated'}
                        </p>
                      </td>

                      <td className="py-3.5 px-3 font-mono text-zinc-300 text-[11px]">
                        {d.reference}
                      </td>

                      <td className="py-3.5 px-3">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
                            <Sparkles className="w-3 h-3 text-emerald-400" />
                            Verified & Credited
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
                            <Clock className="w-3 h-3" />
                            Awaiting Webhook
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                            isApproved
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {isApproved ? 'SUCCESSFUL' : 'PENDING'}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right text-zinc-400 text-[11px]">
                        {new Date(d.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
