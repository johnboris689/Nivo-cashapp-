import { api } from '../lib/api';
import React, { useState } from 'react';

interface DepositModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({ onClose }) => {
  const [amount, setAmount] = useState('520');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    const value = Number(amount);
    if (!Number.isFinite(value) || value < 520) return setError('Minimum deposit is ₦520.');
    setLoading(true); setError('');
    try {
      const data = await api.initializeKoraPayDeposit(value);
      if (!data?.deposit?.checkoutUrl) throw new Error('Unable to initialize KoraPay checkout.');
      window.location.assign(data.deposit.checkoutUrl);
    } catch (e: any) { setError(e.message || 'Unable to initialize payment.'); } finally { setLoading(false); }
  };

  return <div className="fixed inset-0 z-[180] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
    <div className="w-full max-w-md rounded-3xl bg-[#0b0c16] border border-white/10 p-5 space-y-4">
      <div className="flex justify-between items-center"><h3 className="text-white font-black">Deposit via KoraPay</h3><button onClick={onClose} className="text-slate-400">✕</button></div>
      {error && <div className="text-xs text-rose-300 bg-rose-500/10 p-3 rounded-xl">{error}</div>}
      <input inputMode="numeric" value={amount} onChange={e => setAmount(e.target.value.replace(/\D/g,''))} className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-white" placeholder="Amount" />
      <button disabled={loading} onClick={submit} className="w-full rounded-xl bg-gradient-to-r from-teal-400 to-indigo-500 py-3 font-black text-slate-950 disabled:opacity-50">{loading ? 'Creating checkout…' : 'Continue to KoraPay'}</button>
    </div>
  </div>;
};
