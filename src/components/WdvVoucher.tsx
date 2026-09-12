import React, { useState } from 'react';
import { Copy, Check, Ticket, ArrowUpRight, Share2 } from 'lucide-react';
import { WdvCode } from '../types';

interface WdvVoucherProps {
  voucher: WdvCode;
  onRedeemAirtime?: (code: string) => void;
  onRedeemTransfer?: (code: string) => void;
  key?: React.Key | string | number;
}

export default function WdvVoucher({ voucher, onRedeemAirtime, onRedeemTransfer }: WdvVoucherProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(voucher.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedAmount = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  }).format(voucher.amount);

  const isUnused = voucher.status === 'unused';

  return (
    <div className="relative overflow-hidden rounded-xl border border-indigo-500/20 dark:border-teal-500/20 bg-gradient-to-br from-[#0f0e26] via-[#151233] to-[#0d1a24] p-3.5 sm:p-4 shadow-md group">
      {/* Decorative background glow circles */}
      <div className="absolute -right-8 -top-8 w-16 h-16 rounded-full bg-teal-500/10 blur-lg group-hover:bg-teal-500/20 transition-all duration-300" />
      <div className="absolute -left-8 -bottom-8 w-16 h-16 rounded-full bg-indigo-500/10 blur-lg group-hover:bg-indigo-500/20 transition-all duration-300" />

      {/* Ticket Side Cuts */}
      <div className="absolute top-1/2 -left-2.5 -translate-y-1/2 w-5 h-5 rounded-full bg-[#0c0c14] border border-white/5" />
      <div className="absolute top-1/2 -right-2.5 -translate-y-1/2 w-5 h-5 rounded-full bg-[#0c0c14] border border-white/5" />

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-400">
            <Ticket className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono block">Voucher Code</span>
            <h4 className="text-[11px] font-bold text-slate-100">{voucher.fullName}</h4>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full border ${
            isUnused
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-slate-500/10 text-slate-400 border-slate-500/10'
          }`}
        >
          {voucher.status.toUpperCase()}
        </span>
      </div>

      {/* Amount Display */}
      <div className="my-2.5 text-center relative z-10">
        <span className="text-[9px] uppercase font-mono text-slate-400 block">Voucher Value</span>
        <span className="text-xl font-extrabold font-display bg-gradient-to-r from-indigo-400 via-purple-300 to-teal-300 bg-clip-text text-transparent">
          {formattedAmount}
        </span>
      </div>

      {/* Dashed Line */}
      <div className="border-t border-dashed border-white/10 my-2.5 mx-1" />

      {/* Copyable Code Container */}
      <div className="relative z-10">
        <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-lg p-2 pl-3">
          <span className="font-mono text-xs tracking-widest font-bold text-teal-400">
            {voucher.code}
          </span>
          <button
            id={`btn-copy-wdv-${voucher.id}`}
            type="button"
            onClick={handleCopy}
            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-all active:scale-90"
            title="Copy WDV Code"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Quick Action Links if Unused */}
      {isUnused && (onRedeemAirtime || onRedeemTransfer) && (
        <div className="mt-2.5 grid grid-cols-2 gap-2 relative z-10">
          {onRedeemAirtime && (
            <button
              id={`btn-redeem-airtime-${voucher.id}`}
              type="button"
              onClick={() => onRedeemAirtime(voucher.code)}
              className="text-[10px] font-bold py-1 px-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-1 shadow-sm transition-all"
            >
              Buy Airtime <ArrowUpRight className="h-3 w-3" />
            </button>
          )}
          {onRedeemTransfer && (
            <button
              id={`btn-redeem-transfer-${voucher.id}`}
              type="button"
              onClick={() => onRedeemTransfer(voucher.code)}
              className="text-[10px] font-bold py-1 px-2 rounded-md bg-teal-400 hover:bg-teal-300 text-slate-950 flex items-center justify-center gap-1 shadow-sm transition-all"
            >
              Transfer Out <ArrowUpRight className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

      {/* Redeemed info block */}
      {!isUnused && voucher.redeemedFor && (
        <div className="mt-2 text-[9px] text-center text-slate-400 font-mono relative z-10 bg-white/[0.02] p-1 rounded border border-white/5">
          Redeemed for: {voucher.redeemedFor}
        </div>
      )}

      <div className="mt-2 flex items-center justify-between text-[9px] text-slate-400 font-mono relative z-10">
        <span>Issued: {new Date(voucher.createdAt).toLocaleDateString()}</span>
        <span className="flex items-center gap-1">
          <Share2 className="h-3 w-3 cursor-pointer hover:text-slate-300" /> Share
        </span>
      </div>
    </div>
  );
}
