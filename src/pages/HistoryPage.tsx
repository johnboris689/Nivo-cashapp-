import React, { useState, useEffect } from 'react';
import { History, Search, ArrowDownLeft, ArrowUpRight, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Transaction } from '../types';
import { api } from '../lib/api';

export const HistoryPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await api.getTransactions();
        setTransactions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.reference.toLowerCase().includes(search.toLowerCase());
    if (filterType === 'all') return matchesSearch;
    return matchesSearch && t.type === filterType;
  });

  return (
    <div className="space-y-5 animate-fade-in pb-20">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
          <History className="w-6 h-6 text-[#C13A5A]" />
          Full Transaction History
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Audit log of all deposits, withdrawals, task rewards, and referral bonuses
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="nivo-glass-surface border border-white/10 rounded-3xl p-4 flex flex-col md:flex-row gap-3 justify-between items-center shadow-xl">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reference or note..."
            className="w-full nivo-glass-surface border border-[#00C9A7]/20 rounded-2xl pl-10 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#C13A5A] transition-colors"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['all', 'deposit', 'withdrawal', 'referral_bonus', 'task_reward'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                filterType === type
                  ? 'bg-gradient-to-r from-[#008F7A] to-[#00BFA6] text-white shadow-lg shadow-[#008F7A]/25'
                  : 'bg-[#071114] text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              {type === 'all' ? 'All Types' : type.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="nivo-glass-surface border border-white/10 rounded-3xl p-5 shadow-xl">
        {loading ? (
          <div className="text-center py-12 text-slate-500 text-xs font-semibold">
            Loading transaction history...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs font-semibold">
            No matching transaction records found.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((tx) => {
              const isCredit =
                tx.type.includes('deposit') ||
                tx.type.includes('bonus') ||
                tx.type.includes('reward');

              return (
                <div
                  key={tx.id}
                  className="p-4 rounded-2xl nivo-glass-surface border border-white/5 hover:border-[#00C9A7]/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        isCredit
                          ? 'bg-[#00C9A7]/10 text-[#00BFA6] border border-[#00C9A7]/20'
                          : 'bg-[#00C9A7]/10 text-[#C13A5A] border border-[#00C9A7]/20'
                      }`}
                    >
                      {isCredit ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-[#C13A5A] bg-[#00BFA6]/10 border border-[#00BFA6]/20 px-2 py-0.5 rounded-full">
                          {tx.type.replace('_', ' ')}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 font-bold">{tx.reference}</span>
                      </div>
                      <p className="text-xs font-bold text-white mt-1 truncate">{tx.description}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(tx.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-white/5">
                    <span className="text-sm font-black text-white font-mono">
                      {isCredit ? '+' : '-'}₦{tx.amount.toLocaleString()}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 mt-0.5 ${
                        tx.status === 'completed' || tx.status === 'approved'
                          ? 'bg-[#00C9A7]/10 text-[#00BFA6] border border-[#00C9A7]/20'
                          : tx.status === 'pending'
                          ? 'bg-[#00C9A7]/10 text-[#C13A5A] border border-[#00C9A7]/20'
                          : 'bg-[#00C9A7]/10 text-[#C13A5A] border border-[#00C9A7]/20'
                      }`}
                    >
                      {tx.status === 'completed' || tx.status === 'approved' ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : tx.status === 'pending' ? (
                        <Clock className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      <span>{tx.status}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
