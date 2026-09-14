import React, { useState } from 'react';
import { ExternalLink, ShieldCheck, X } from 'lucide-react';

export interface PaymentConfigProvider {
  name: 'korapay';
  displayName: string;
  isConfigured: boolean;
  missingEnvVars: string[];
  publicKey?: string;
}

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  userName?: string;
  token?: string;
  onSuccess?: (result: any) => void;
  onToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, token, onToast }) => {
  const [amount, setAmount] = useState('520');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  if (!isOpen) return null;

  const start = async () => {
    const value = Number(amount);
    if (!Number.isFinite(value) || value < 520) return setError('Minimum deposit is ₦520.');
    setLoading(true); setError('');
    try {
      const auth = token || localStorage.getItem('nevo_auth_token') || '';
      const res = await fetch('/api/korapay/initialize-wallet-deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth}` },
        body: JSON.stringify({ amount: value })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success || !data.deposit?.checkoutUrl) throw new Error(data.error || 'Unable to initialize KoraPay checkout.');
      onToast?.('Opening KoraPay checkout...', 'info');
      window.location.assign(data.deposit.checkoutUrl);
    } catch (e: any) {
      setError(e.message || 'Unable to initialize KoraPay checkout.');
    } finally { setLoading(false); }
  };

  return <div className="fixed inset-0 z-[180] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
    <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-white/10 p-5 space-y-4">
      <div className="flex items-center justify-between"><div><h3 className="text-white font-black">Nevo Deposit</h3><p className="text-xs text-slate-400">Secure KoraPay checkout</p></div><button onClick={onClose}><X className="text-slate-400" /></button></div>
      {error && <div className="rounded-xl bg-rose-500/10 text-rose-300 p-3 text-xs">{error}</div>}
      <div className="rounded-2xl bg-teal-500/5 border border-teal-500/20 p-4"><div className="flex items-center gap-2 text-teal-300 font-bold text-sm"><ShieldCheck className="w-4 h-4" /> KoraPay</div><p className="text-xs text-slate-400 mt-2">Every deposit creates a fresh hosted checkout session. Wallet credit happens only after provider verification.</p></div>
      <input inputMode="numeric" value={amount} onChange={e => setAmount(e.target.value.replace(/\D/g,''))} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" />
      <button disabled={loading} onClick={start} className="w-full py-3 rounded-xl bg-teal-400 text-slate-950 font-black disabled:opacity-50">{loading ? 'Creating checkout…' : <>Continue to KoraPay <ExternalLink className="inline w-4 h-4 ml-1" /></>}</button>
    </div>
  </div>;
};
