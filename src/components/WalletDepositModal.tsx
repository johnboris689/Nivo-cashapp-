import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Check, CheckCircle2, Copy, RefreshCw, ShieldCheck, X } from 'lucide-react';

export default function WalletDepositModal({ isOpen, onClose, token, onToast }: { isOpen: boolean; onClose: () => void; token: string; onToast?: (message: string, type?: 'success' | 'info' | 'error') => void }) {
  const [step, setStep] = useState<'amount'|'transfer'>('amount');
  const [amount, setAmount] = useState(520);
  const [custom, setCustom] = useState('');
  const [deposit, setDeposit] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const [timeLeft, setTimeLeft] = useState(900);
  const pollRef = useRef<number | null>(null);
  const presets = [520, 1000, 2000, 5000, 10000, 25000];

  useEffect(() => {
    if (!isOpen) return;
    setStep('amount'); setAmount(520); setCustom(''); setDeposit(null); setError(''); setLoading(false); setChecking(false); setCopied(''); setTimeLeft(900);
  }, [isOpen]);
  useEffect(() => () => { if (pollRef.current) window.clearTimeout(pollRef.current); }, []);
  useEffect(() => { if (step !== 'transfer' || !deposit?.accountExpiresAt) return; const id = window.setInterval(() => { const end = new Date(deposit.accountExpiresAt).getTime(); setTimeLeft(Math.max(0, Math.floor((end-Date.now())/1000))); }, 1000); return () => window.clearInterval(id); }, [step, deposit]);

  const requestDeposit = async () => {
    const value = Number(custom || amount);
    if (!Number.isFinite(value) || value < 520) { setError('Minimum deposit is ₦520.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/paystack/initialize-wallet-deposit', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ amount: value }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not create deposit account.');
      setDeposit(data.deposit); setTimeLeft(Math.max(1, Math.floor((new Date(data.deposit.accountExpiresAt).getTime()-Date.now())/1000))); setStep('transfer');
    } catch (e:any) { setError(e.message); }
    finally { setLoading(false); }
  };
  const checkStatus = async (silent=false) => {
    if (!deposit?.reference || checking) return;
    setChecking(true); if (!silent) setError('');
    try {
      const res = await fetch(`/api/paystack/check-status/${encodeURIComponent(deposit.reference)}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to check payment status.');
      if (data.status === 'approved' || data.status === 'completed') { onToast?.('Deposit confirmed and wallet credited.', 'success'); onClose(); return true; }
      if (!silent) onToast?.('Payment is still awaiting Paystack confirmation.', 'info');
    } catch(e:any) { if (!silent) setError(e.message); }
    finally { setChecking(false); }
    return false;
  };
  useEffect(() => { if (!isOpen || step !== 'transfer' || !deposit?.reference) return; let stopped=false; let attempts=0; const poll=async()=>{ if(stopped) return; attempts++; const ok=await checkStatus(true); if(!stopped && !ok && attempts<90) pollRef.current=window.setTimeout(poll,4000); }; pollRef.current=window.setTimeout(poll,3000); return()=>{stopped=true;if(pollRef.current)window.clearTimeout(pollRef.current);}; },[isOpen,step,deposit?.reference]);
  const copy = async (key:string, value:string) => { try { await navigator.clipboard.writeText(value); setCopied(key); onToast?.('Copied.', 'success'); window.setTimeout(()=>setCopied(''),1500); } catch {} };
  if (!isOpen) return null;
  const fmt=(n:number)=>`${Math.floor(n/60).toString().padStart(2,'0')}:${(n%60).toString().padStart(2,'0')}`;
  return <div className="fixed inset-0 z-[180] bg-slate-950/90 backdrop-blur-md flex items-stretch justify-center">
    <div className="w-full h-full sm:h-[94vh] sm:max-w-2xl sm:rounded-3xl self-center bg-[#0c0c14] border border-white/10 shadow-2xl flex flex-col overflow-hidden">
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between"><div><h3 className="text-base font-bold font-display text-white">Deposit Funds</h3><p className="text-[10px] text-slate-400">Fund your Nevo wallet securely.</p></div><button onClick={onClose} className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white"><X className="w-4 h-4"/></button></div>
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {error && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex gap-2"><AlertCircle className="w-4 h-4 shrink-0"/>{error}</div>}
        {step==='amount' ? <div className="max-w-md mx-auto space-y-5 pt-4"><div className="text-center"><ShieldCheck className="w-8 h-8 text-teal-300 mx-auto"/><h4 className="text-sm font-bold text-white mt-2">Choose deposit amount</h4><p className="text-[10px] text-slate-400">A temporary Paystack transfer account will be created for this exact amount.</p></div><div className="grid grid-cols-3 gap-2">{presets.map(v=><button key={v} onClick={()=>{setAmount(v);setCustom('')}} className={`py-3 rounded-xl text-xs font-bold border ${amount===v&&!custom?'bg-teal-500/15 text-teal-200 border-teal-500/30':'bg-white/[.03] text-slate-300 border-white/5'}`}>₦{v.toLocaleString()}</button>)}</div><input type="number" min="520" value={custom} onChange={e=>setCustom(e.target.value)} placeholder="Enter custom amount" className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-teal-400"/><button disabled={loading} onClick={requestDeposit} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-500 text-white text-xs font-black uppercase tracking-wider">{loading?<><RefreshCw className="w-4 h-4 animate-spin inline mr-2"/>Creating account...</>:'Continue'}</button><div className="text-center text-[9px] text-slate-500">Minimum deposit: ₦520</div></div>
        : <div className="max-w-md mx-auto space-y-3"><div className="flex justify-between items-center"><span className="text-[9px] uppercase tracking-wider text-slate-500">Temporary transfer account</span><span className="text-[10px] font-mono text-amber-300">{timeLeft?fmt(timeLeft):'Expired'}</span></div>{timeLeft<=0?<button onClick={()=>setStep('amount')} className="w-full py-3 rounded-xl bg-teal-500/15 border border-teal-500/20 text-teal-200 text-xs font-bold">Create New Account</button>:<><div className="rounded-2xl bg-gradient-to-br from-indigo-500/10 to-teal-500/10 border border-white/10 p-4 space-y-3"><div className="flex justify-between text-xs"><span className="text-slate-500">Receiving Bank</span><b className="text-white">{deposit?.bankName}</b></div><div><span className="text-[9px] text-slate-500">Account Number</span><div className="mt-1 flex items-center justify-between gap-2 bg-slate-950/70 border border-white/5 rounded-xl p-3"><b className="font-mono text-xl tracking-widest text-white">{deposit?.accountNumber}</b><button onClick={()=>copy('account',deposit.accountNumber)} className="p-2 bg-white/5 rounded-lg text-slate-300">{copied==='account'?<Check className="w-4 h-4 text-teal-300"/>:<Copy className="w-4 h-4"/>}</button></div></div><div className="flex justify-between text-xs"><span className="text-slate-500">Account Name</span><b className="text-white text-right">{deposit?.accountName}</b></div><div className="flex justify-between text-xs"><span className="text-slate-500">Exact Amount</span><b className="text-teal-300">₦{Number(deposit?.amount||0).toLocaleString()}</b></div><div className="flex justify-between text-[9px]"><span className="text-slate-500">Reference</span><span className="font-mono text-slate-300">{deposit?.reference}</span></div></div><div className="p-3 rounded-xl bg-white/[.03] border border-white/5 text-[10px] text-slate-400 leading-relaxed">Transfer the exact amount to the Paystack-generated account above. Your wallet is credited only after the payment provider confirms the transfer.</div><button disabled={checking} onClick={()=>checkStatus(false)} className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-500 text-white text-xs font-black uppercase">{checking?'Checking...':'I’ve Sent the Money — Check Status'}</button><button onClick={onClose} className="w-full py-2.5 rounded-xl bg-white/5 text-slate-300 text-xs font-bold">Close</button></>}</div>}
      </div>
    </div>
  </div>;
}
