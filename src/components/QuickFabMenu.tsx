import React from 'react';
import { X, Wallet, Smartphone, Landmark, MessageSquare } from 'lucide-react';

interface QuickFabMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: string) => void;
}

export default function QuickFabMenu({ isOpen, onClose, onSelectAction }: QuickFabMenuProps) {
  if (!isOpen) return null;

  const actions = [
    {
      id: 'deposit',
      title: 'Deposit Funds',
      desc: 'Add money to your wallet through KoraPay',
      icon: Wallet,
      color: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
      textColor: 'text-white'
    },
    {
      id: 'buy-airtime',
      title: 'Purchase Airtime',
      desc: 'Use your wallet balance directly',
      icon: Smartphone,
      color: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
      textColor: 'text-white'
    },
    {
      id: 'buy-data',
      title: 'Purchase Data Bundles',
      desc: 'Discounted dynamic data bundles for all network operators',
      icon: Smartphone,
      color: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      textColor: 'text-white'
    },
    {
      id: 'transfer-bank',
      title: 'Transfer to Bank',
      desc: 'Send money to a verified Nigerian bank account from your wallet balance',
      icon: Landmark,
      color: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
      textColor: 'text-white'
    },
    {
      id: 'social-channels',
      title: 'Join Community',
      desc: 'Connect on Telegram and WhatsApp for tips, rewards, and support',
      icon: MessageSquare,
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      textColor: 'text-white'
    }
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[150] flex flex-col justify-end animate-fade-in">
      {/* Tap outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Content */}
      <div className="relative bg-slate-900 border-t border-white/10 rounded-t-3xl p-5 sm:p-6 shadow-2xl max-w-md mx-auto w-full z-10 transition-transform duration-300 pb-safe">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold font-display text-white">Quick Actions</h3>
            <p className="text-xs text-slate-400">Select any payment flow or community hub</p>
          </div>
          <button
            id="btn-close-fab-menu"
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all active:scale-90 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 mb-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                id={`btn-fab-action-${action.id}`}
                key={action.id}
                type="button"
                onClick={() => {
                  onSelectAction(action.id);
                  onClose();
                }}
                className="w-full flex items-center gap-4 p-3.5 rounded-xl border border-white/5 hover:border-teal-500/30 bg-slate-950/60 hover:bg-slate-950 transition-all text-left group cursor-pointer"
              >
                <div className={`p-2.5 rounded-lg border ${action.color} group-hover:scale-105 transition-all shrink-0`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white">{action.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">{action.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
