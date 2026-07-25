import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  Copy,
  Download,
  Share2,
  ArrowRight,
  ShieldCheck,
  Building2,
  Clock,
  MessageCircle,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface WithdrawalSuccessData {
  amount: number;
  recipientName: string;
  bankName: string;
  accountNumber: string;
  reference: string;
  transactionId?: string;
  requestDate: string;
  requestTime: string;
  remainingBalance: number;
}

interface WithdrawalSuccessModalProps {
  data: WithdrawalSuccessData;
  onClose: () => void;
}

export const WithdrawalSuccessModal: React.FC<WithdrawalSuccessModalProps> = ({ data, onClose }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  // Mask middle digits of account number: e.g. "309****123"
  const maskAccount = (num: string) => {
    if (!num || num.length < 6) return num;
    return `${num.slice(0, 3)}****${num.slice(-3)}`;
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(data.reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReceipt = () => {
    // Generate text receipt for download
    const receiptText = `
========================================
       NIVO CASH - WITHDRAWAL RECEIPT
========================================
Status: SUBMITTED (PENDING PROCESSING)
Reference: ${data.reference}
Transaction ID: ${data.transactionId || data.reference}
----------------------------------------
Amount: ₦${data.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
Recipient: ${data.recipientName}
Bank: ${data.bankName}
Account Number: ${maskAccount(data.accountNumber)}
----------------------------------------
Date: ${data.requestDate}
Time: ${data.requestTime}
Processing Time: Instant - 15 Mins
Remaining Balance: ₦${data.remainingBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
========================================
Thank you for using Nivo Cash!
Support: support@nivocash.app
    `.trim();

    const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NivoCash_Receipt_${data.reference}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleShareReceipt = async () => {
    const text = `Nivo Cash Withdrawal Receipt: ₦${data.amount.toLocaleString()} to ${data.recipientName} (${data.bankName}). Ref: ${data.reference}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Nivo Cash Receipt',
          text: text,
        });
      } catch (e) {
        handleCopyRef();
      }
    } else {
      handleCopyRef();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-[#12141a] border border-emerald-500/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative my-auto"
      >
        {/* Top Decorative Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 z-10 cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 text-center space-y-5 relative z-10">
          {/* Animated Success Checkmark */}
          <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5, ease: 'backOut' }}
              className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-xl shadow-emerald-500/30 flex items-center justify-center"
            >
              <div className="w-full h-full bg-[#12141a] rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-11 h-11 text-emerald-400 stroke-[2.5]" />
              </div>
            </motion.div>
          </div>

          <div>
            <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              Transaction Submitted
            </span>
            <h2 className="text-xl font-black text-white mt-2">Withdrawal Request Sent</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Your payout is being processed securely to your bank account.
            </p>
          </div>

          {/* Amount Hero Badge */}
          <div className="bg-gradient-to-br from-[#191d26] to-[#12141a] border border-white/10 p-4 rounded-2xl">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Withdrawal Amount
            </span>
            <span className="text-3xl font-black text-white font-mono tracking-tight block mt-1">
              ₦{data.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
            </span>
            <div className="flex items-center justify-center gap-1.5 mt-2 text-[11px] text-amber-400 font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>Est. Processing Time: Instant - 15 mins</span>
            </div>
          </div>

          {/* Detailed Transaction Card */}
          <div className="bg-[#181c26] border border-zinc-800 rounded-2xl p-4 text-left space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-zinc-800/60">
              <span className="text-zinc-400 font-medium">Recipient Name</span>
              <span className="font-bold text-white text-right">{data.recipientName}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-zinc-800/60">
              <span className="text-zinc-400 font-medium">Bank Name</span>
              <span className="font-bold text-amber-400 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                {data.bankName}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-zinc-800/60">
              <span className="text-zinc-400 font-medium">Account Number</span>
              <span className="font-mono font-bold text-white">{maskAccount(data.accountNumber)}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-zinc-800/60">
              <span className="text-zinc-400 font-medium">Transaction Reference</span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-[11px] font-bold text-amber-400">{data.reference}</span>
                <button
                  onClick={handleCopyRef}
                  className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Copy reference"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-zinc-800/60">
              <span className="text-zinc-400 font-medium">Date & Time</span>
              <span className="font-medium text-zinc-300">{data.requestDate} • {data.requestTime}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-zinc-800/60">
              <span className="text-zinc-400 font-medium">Status</span>
              <span className="font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded text-[10px] border border-amber-500/20">
                Processing / Pending
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-zinc-400 font-medium">Remaining Balance</span>
              <span className="font-bold text-emerald-400 font-mono">
                ₦{data.remainingBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleDownloadReceipt}
              className="flex items-center justify-center gap-1.5 bg-[#1f2533] hover:bg-[#2a3245] text-white border border-zinc-700 font-bold text-xs py-2.5 rounded-xl cursor-pointer transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Receipt</span>
            </button>

            <button
              onClick={handleShareReceipt}
              className="flex items-center justify-center gap-1.5 bg-[#1f2533] hover:bg-[#2a3245] text-white border border-zinc-700 font-bold text-xs py-2.5 rounded-xl cursor-pointer transition-all active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Share</span>
            </button>
          </div>

          {/* Support Link */}
          <a
            href="https://t.me/NivoCashSupport"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 hover:text-amber-400 py-1 font-semibold transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#F27D26]" />
            <span>Need Help? Contact Live Support</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {/* Primary Dashboard Button */}
          <button
            onClick={() => {
              onClose();
              navigate('/dashboard');
            }}
            className="w-full bg-[#F27D26] hover:bg-[#E6721F] active:scale-95 text-black font-extrabold text-xs py-3.5 rounded-xl shadow-lg shadow-orange-950/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Return to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
