import React, { useState, useEffect } from 'react';
import { History, Search, Filter, ArrowUpRight, PlusCircle, Sparkles } from 'lucide-react';
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
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <History className="w-6 h-6 text-orange-400" />
          Full Transaction History
        </h1>
        <p className="text-xs text-zinc-400 mt-1">Audit log of all deposits, withdrawals, task rewards, and referral bonuses</p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#12151c] border border-zinc-800 rounded-3xl p-4 flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reference or note..."
            className="w-full bg-[#181d28] border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['all', 'deposit', 'withdrawal', 'referral_bonus', 'task_reward'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterType === type
                  ? 'bg-orange-500 text-black shadow-md'
                  : 'bg-[#181d28] text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {type === 'all' ? 'All Types' : type.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-[#12151c] border border-zinc-800 rounded-3xl p-6">
        {loading ? (
          <div className="text-center py-10 text-zinc-500 text-xs">Loading history...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-zinc-500 text-xs">No matching transaction records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">Reference</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-medium text-zinc-300">
                {filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#181d28] transition-colors">
                    <td className="py-3 px-3 font-mono text-[11px] font-bold text-zinc-400">{tx.reference}</td>
                    <td className="py-3 px-3 uppercase text-[10px] font-bold text-amber-400">
                      {tx.type.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-3 font-semibold text-white">{tx.description}</td>
                    <td className="py-3 px-3 font-black text-amber-400">₦{tx.amount.toLocaleString()}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          tx.status === 'completed' || tx.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : tx.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-zinc-500 text-[11px]">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
