import React, { useState, useEffect } from 'react';
import {
  Wallet,
  PlusCircle,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Transaction, DepositRequest, WithdrawalRequest } from '../types';
import { api } from '../lib/api';

interface WalletPageProps {
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
}

export const WalletPage: React.FC<WalletPageProps> = ({ onOpenDeposit, onOpenWithdraw }) => {
  const { user, bankDetails } = useAuth();

  const [activeTab, setActiveTab] = useState<'all' | 'deposits' | 'withdrawals'>('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      const data = await api.getTransactions();
      setTransactions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTx = transactions.filter((t) => {
    if (activeTab === 'deposits') return t.type === 'deposit' || t.type === 'admin_credit';
    if (activeTab === 'withdrawals') return t.type === 'withdrawal' || t.type === 'admin_debit';
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-orange-400" />
            Wallet & Bank Overview
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Manage deposits, withdrawals, and bank details</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onOpenDeposit}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-black font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-orange-500/20 cursor-pointer transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Deposit
          </button>
          <button
            onClick={onOpenWithdraw}
            className="flex items-center gap-2 bg-[#1f2533] hover:bg-[#283042] text-white border border-zinc-700 font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-all"
          >
            <ArrowUpRight className="w-4 h-4 text-orange-400" />
            Withdraw
          </button>
        </div>
      </div>

      {/* Main Balance Banner */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-gradient-to-br from-[#181d28] via-[#12151c] to-[#0a0c10] border border-orange-500/30 rounded-3xl p-6 relative overflow-hidden shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Available Wallet Balance</span>
            <h2 className="text-4xl font-black text-white mt-2">
              ₦{user?.walletBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
            </h2>
            <p className="text-xs text-amber-400 font-semibold mt-2">
              Lifetime Earnings: ₦{user?.totalEarnings.toLocaleString()}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
            <span>Account Status: <strong className="text-emerald-400">Active & Verified</strong></span>
            <span>Ref Code: <strong className="text-amber-400 font-mono">{user?.referralCode}</strong></span>
          </div>
        </div>

        {/* Deposit Bank Info */}
        <div className="bg-[#12151c] border border-zinc-800 rounded-3xl p-6 space-y-3 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-orange-400" />
              Deposit Bank Account
            </span>
            <div className="mt-3 space-y-1">
              <p className="text-xs text-zinc-400">Bank Name</p>
              <p className="text-sm font-bold text-white">{bankDetails?.bankName || 'GTBank'}</p>
            </div>
            <div className="mt-2 space-y-1">
              <p className="text-xs text-zinc-400">Account Number</p>
              <p className="text-base font-mono font-black text-orange-400 tracking-wider">
                {bankDetails?.accountNumber || '0123456789'}
              </p>
            </div>
            <div className="mt-2 space-y-1">
              <p className="text-xs text-zinc-400">Account Name</p>
              <p className="text-xs font-bold text-zinc-200">{bankDetails?.accountName || 'Nivo Cash App Global'}</p>
            </div>
          </div>

          <button
            onClick={onOpenDeposit}
            className="w-full text-center py-2.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-xl text-xs font-extrabold cursor-pointer transition-all"
          >
            Make Deposit
          </button>
        </div>
      </div>

      {/* Transaction Feed */}
      <div className="bg-[#12151c] border border-zinc-800 rounded-3xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="font-extrabold text-white text-base">Wallet Activity Logs</h3>

          {/* Filter Tabs */}
          <div className="flex bg-[#181d28] p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all' ? 'bg-orange-500 text-black shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('deposits')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'deposits' ? 'bg-orange-500 text-black shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Deposits
            </button>
            <button
              onClick={() => setActiveTab('withdrawals')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'withdrawals' ? 'bg-orange-500 text-black shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Withdrawals
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-zinc-500 text-xs">Loading transaction logs...</div>
        ) : filteredTx.length === 0 ? (
          <div className="text-center py-10 text-zinc-500 text-xs">No transaction records found for this view.</div>
        ) : (
          <div className="space-y-3">
            {filteredTx.map((tx) => (
              <div
                key={tx.id}
                className="p-4 bg-[#181d28] rounded-2xl border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-zinc-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl ${
                      tx.type.includes('deposit') || tx.type.includes('credit') || tx.type.includes('reward') || tx.type.includes('bonus')
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {tx.type.includes('deposit') || tx.type.includes('credit') ? (
                      <PlusCircle className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-white">{tx.description}</h4>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Ref: <span className="font-mono">{tx.reference}</span> • {new Date(tx.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                  <span className="text-sm font-black text-amber-400">₦{tx.amount.toLocaleString()}</span>
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full mt-1 ${
                      tx.status === 'completed' || tx.status === 'approved'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : tx.status === 'pending'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
