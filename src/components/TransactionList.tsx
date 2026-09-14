import React, { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Search, Ticket, Smartphone, Landmark, SlidersHorizontal } from 'lucide-react';
import { Transaction } from '../types';
import { formatNaira } from '../utils/formatters';

interface TransactionListProps {
  transactions: Transaction[];
  onViewDetails?: (tx: Transaction) => void;
  limit?: number;
  showFilters?: boolean;
}

export default function TransactionList({
  transactions,
  onViewDetails,
  limit,
  showFilters = false
}: TransactionListProps) {
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const getIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return {
          icon: ArrowDownLeft,
          bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
        };
      case 'withdraw':
      case 'bank_transfer_direct':
        return {
          icon: Landmark,
          bg: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
        };
      case 'buy_legacyVoucher':
        return {
          icon: Ticket,
          bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
        };
      case 'redeem_airtime':
        return {
          icon: Smartphone,
          bg: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20'
        };
      case 'redeem_transfer':
        return {
          icon: Landmark,
          bg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20'
        };
      default:
        return {
          icon: ArrowUpRight,
          bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
        };
    }
  };

  const filteredTransactions = transactions
    .filter((tx) => {
      // Type filtering
      if (filter === 'in' && tx.type !== 'deposit') return false;
      if (filter === 'out' && tx.type === 'deposit') return false;
      if (filter === 'legacyVoucher' && tx.type !== 'buy_legacyVoucher') return false;
      return true;
    })
    .filter((tx) => {
      // Search term
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        tx.description.toLowerCase().includes(term) ||
        tx.amount.toString().includes(term) ||
        (tx.legacyVoucherCodeUsed && tx.legacyVoucherCodeUsed.toLowerCase().includes(term)) ||
        (tx.legacyVoucherCodeGenerated && tx.legacyVoucherCodeGenerated.toLowerCase().includes(term))
      );
    });

  const displayedTransactions = limit ? filteredTransactions.slice(0, limit) : filteredTransactions;

  const formatCurrency = (amount: number) => {
    return formatNaira(amount);
  };

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="input-tx-search"
              type="text"
              placeholder="Search history (e.g. OPay, MTN)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white"
            />
          </div>

          {/* Filter badging row */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400 shrink-0 mr-1" />
            {[
              { id: 'all', label: 'All' },
              { id: 'in', label: 'Incoming' },
              { id: 'out', label: 'Payments' },
              { id: 'legacyVoucher', label: 'LEGACY_VOUCHER Codes' }
            ].map((btn) => (
              <button
                id={`btn-tx-filter-${btn.id}`}
                key={btn.id}
                type="button"
                onClick={() => setFilter(btn.id)}
                className={`text-[10px] font-semibold font-mono py-1.5 px-3 rounded-full border transition-all ${
                  filter === btn.id
                    ? 'bg-indigo-600 text-white border-indigo-600 dark:bg-teal-500 dark:text-slate-950 dark:border-teal-500'
                    : 'bg-white/40 border-slate-200/50 dark:bg-slate-900/40 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {displayedTransactions.length === 0 ? (
        <div className="text-center py-6 bg-white/[0.02] rounded-xl border border-dashed border-white/10">
          <p className="text-xs text-slate-400">No transactions match your search</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {displayedTransactions.map((tx) => {
            const style = getIcon(tx.type);
            const IconComponent = style.icon;
            const isIncoming = tx.type === 'deposit';

            return (
              <div
                id={`tx-row-${tx.id}`}
                key={tx.id}
                onClick={() => onViewDetails && onViewDetails(tx)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-white/5 bg-[#0a0a14] hover:bg-[#10101f] hover:border-white/10 transition-all cursor-pointer group shadow-sm active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-lg border ${style.bg} shrink-0 group-hover:scale-105 transition-transform`}>
                    <IconComponent className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="text-[11px] sm:text-xs font-bold text-slate-200 group-hover:text-indigo-400 dark:group-hover:text-teal-400 transition-colors truncate leading-tight">
                      {tx.description}
                    </h5>
                    <span className="text-[9px] text-slate-400 font-mono mt-0.5 block">
                      {new Date(tx.date).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-3">
                  <span
                    className={`text-xs font-extrabold font-mono ${
                      isIncoming
                        ? 'text-emerald-400'
                        : 'text-slate-100'
                    }`}
                  >
                    {isIncoming ? '+' : '-'}
                    {formatCurrency(tx.amount)}
                  </span>
                  
                  {tx.legacyVoucherCodeGenerated && (
                    <span className="text-[8px] font-bold font-mono text-teal-400 bg-teal-500/10 border border-teal-500/20 px-1 py-0.2 rounded block mt-0.5 uppercase">
                      Code Issued
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
