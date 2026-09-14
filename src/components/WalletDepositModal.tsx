import React, { useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, ExternalLink, ShieldCheck, Wallet, X } from 'lucide-react';
import { api } from '../lib/api';

interface WalletDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  token?: string;
  onToast?: (message: string, type?: 'success' | 'info' | 'error') => void;
  onSuccess?: () => void;
}

export default function WalletDepositModal({ isOpen, onClose, onToast }: WalletDepositModalProps) {
  const [amount, setAmount] = useState(520);
  const [custom, setCustom] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const presets = [520, 1000, 2000, 5000, 10000, 25000];
  const activeAmount = custom ? Number(custom) : amount;

  useEffect(() => {
    if (!isOpen) return;
    setAmount(520);
    setCustom('');
    setLoading(false);
    setError('');
  }, [isOpen]);

  if (!isOpen) return null;

  const startKoraPay = async () => {
    const value = activeAmount;
    if (!Number.isFinite(value) || value < 520) {
      setError('Minimum deposit is ₦520.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await api.initializeKoraPayDeposit(value);
      if (!data?.deposit?.checkoutUrl) {
        throw new Error('Unable to create the KoraPay payment session.');
      }
      onToast?.('Opening secure KoraPay checkout...', 'info');
      window.location.assign(data.deposit.checkoutUrl);
    } catch (e: any) {
      setError(e?.message || 'Unable to initialize KoraPay payment.');
      onToast?.(e?.message || 'Unable to initialize KoraPay payment.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[180] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-lg bg-[#0b0c16] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400"><Wallet className="w-4 h-4" /></div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Deposit Funds</h3>
              <p className="text-[11px] text-slate-400">Secure KoraPay checkout</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-5">
          {error && <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex gap-2"><AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span></div>}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Select Deposit Amount</label>
            <div className="grid grid-cols-3 gap-2">
              {presets.map(v => (
                <button key={v} type="button" onClick={() => { setAmount(v); setCustom(''); setError(''); }} className={`py-3 rounded-xl text-xs font-bold border ${activeAmount === v && !custom ? 'bg-teal-500/15 text-teal-200 border-teal-500/40' : 'bg-white/[0.03] text-slate-300 border-white/5'}`}>
                  ₦{v.toLocaleString()}
                </button>
              ))}
            </div>
            <input
              inputMode="decimal"
              value={custom}
              onChange={e => { setCustom(e.target.value.replace(/[^0-9.]/g, '')); setError(''); }}
              placeholder="Custom amount (minimum ₦520)"
              className="mt-3 w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-teal-400/50"
            />
          </div>

          <div className="rounded-2xl border border-teal-500/20 bg-teal-500/5 p-4 space-y-2">
            <div className="flex items-center gap-2 text-teal-300 text-sm font-black"><ShieldCheck className="w-4 h-4" /> KoraPay</div>
            <p className="text-xs text-slate-400 leading-relaxed">A new secure KoraPay checkout session is created for every deposit. This is a real wallet deposit, not an activation fee. Your wallet is credited only after server-side payment verification, and the deposited amount remains your money.</p>
          </div>

          <button onClick={startKoraPay} disabled={loading} className="w-full py-4 rounded-xl bg-gradient-to-r from-teal-400 via-indigo-500 to-teal-400 text-slate-950 font-black text-sm uppercase flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? 'Creating Secure Checkout…' : <>Continue to KoraPay <ExternalLink className="w-4 h-4" /></>}
          </button>
          <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1"><ArrowRight className="w-3 h-3" /> You will be redirected to KoraPay's hosted payment page.</div>
        </div>
      </div>
    </div>
  );
}
