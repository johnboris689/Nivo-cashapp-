import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock3, Copy, Gift, History, Link2, RefreshCw, ShieldCheck, Users, WalletCards, X } from 'lucide-react';
import GlassCard from './GlassCard';

interface Props {
  user: any;
  token: string;
  onToast?: (message: string, type?: 'success' | 'info' | 'error') => void;
  initialTab?: 'tasks' | 'referrals' | 'activation' | 'history';
}

const apiFetch = async (url: string, token: string, init: RequestInit = {}) => {
  const headers = new Headers(init.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(url, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed.');
  return data;
};

export default function NivoFeaturesPanel({ user, token, onToast, initialTab = 'tasks' }: Props) {
  const [tab, setTab] = useState(initialTab);
  const [tasks, setTasks] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any>(null);
  const [activation, setActivation] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [proof, setProof] = useState<Record<string, string>>({});
  const [timer, setTimer] = useState<Record<string, number>>({});

  const load = async (which = tab) => {
    setLoading(true);
    try {
      if (which === 'tasks') setTasks((await apiFetch('/api/nivo/tasks', token)).tasks || []);
      if (which === 'referrals') setReferrals(await apiFetch('/api/nivo/referrals/stats', token));
      if (which === 'activation') setActivation(await apiFetch('/api/nivo/activation/status', token));
      if (which === 'history') setHistory((await apiFetch('/api/nivo/history', token)).transactions || []);
    } catch (e: any) { onToast?.(e.message, 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [tab]);
  useEffect(() => { if (initialTab) setTab(initialTab); }, [initialTab]);

  useEffect(() => {
    const id = window.setInterval(() => setTimer(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => { if (next[k] > 0) next[k] -= 1; });
      return next;
    }), 1000);
    return () => window.clearInterval(id);
  }, []);

  const startTask = async (task: any) => {
    setBusy(task.id);
    try {
      const data = await apiFetch(`/api/nivo/tasks/${task.id}/start`, token, { method: 'POST' });
      if (task.actionUrl) window.open(task.actionUrl, '_blank', 'noopener,noreferrer');
      if (task.verificationType === 'timer') setTimer(p => ({ ...p, [task.id]: Number(task.timerSeconds || 30) }));
      onToast?.(data.message || 'Task started.', 'info');
      await load('tasks');
    } catch (e: any) { onToast?.(e.message, 'error'); }
    finally { setBusy(null); }
  };

  const submitTask = async (task: any) => {
    if (task.verificationType === 'timer' && (timer[task.id] || 0) > 0) {
      onToast?.(`Please wait ${timer[task.id]} seconds.`, 'info'); return;
    }
    setBusy(task.id);
    try {
      await apiFetch(`/api/nivo/tasks/${task.id}/submit`, token, { method: 'POST', body: JSON.stringify({ proofText: proof[task.id] || '' }) });
      onToast?.('Task submitted for verification.', 'success');
      await load('tasks');
    } catch (e: any) { onToast?.(e.message, 'error'); }
    finally { setBusy(null); }
  };

  const activate = async () => {
    setBusy('activation');
    try {
      await apiFetch('/api/nivo/activation/pay', token, { method: 'POST' });
      onToast?.('Withdrawal requirements updated.', 'success');
      await load('activation');
    } catch (e: any) { onToast?.(e.message, 'error'); }
    finally { setBusy(null); }
  };

  const referralLink = referrals?.referralLink || user?.referralLink || '';
  const tabs = [
    ['tasks', 'Tasks', CheckCircle2],
    ['referrals', 'Referrals', Users],
    ['activation', 'Activation', ShieldCheck],
    ['history', 'Rewards History', History],
  ] as const;

  return <div className="p-4 sm:p-5 space-y-4 animate-[fadeIn_0.2s_ease-out] w-full max-w-full min-w-0">
    <div className="flex items-center justify-between gap-3">
      <div><h3 className="text-base font-bold font-display text-white">Rewards & Account</h3><p className="text-[10px] text-slate-400 mt-0.5">Tasks, referrals, activation and reward history.</p></div>
      <button onClick={() => load()} className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white" aria-label="Refresh"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
    </div>
    <div className="grid grid-cols-4 gap-1 rounded-xl bg-slate-950/60 p-1 border border-white/5">
      {tabs.map(([id, label, Icon]) => <button key={id} onClick={() => setTab(id)} className={`py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider ${tab === id ? 'bg-teal-500/15 text-teal-300 border border-teal-500/20' : 'text-slate-400'}`}><Icon className="w-3.5 h-3.5 mx-auto mb-0.5" />{label}</button>)}
    </div>

    {tab === 'tasks' && <div className="space-y-3">{tasks.length === 0 && <GlassCard className="p-5 text-center text-xs text-slate-400">No tasks are available right now.</GlassCard>}{tasks.map(task => {
      const remaining = timer[task.id] || 0;
      return <GlassCard key={task.id} className="p-4 space-y-3">
        <div className="flex items-start gap-3"><div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-300 border border-teal-500/20 flex items-center justify-center shrink-0"><Gift className="w-4 h-4" /></div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><h4 className="text-xs font-bold text-white">{task.title}</h4><span className="text-[10px] font-black text-teal-300">₦{Number(task.rewardAmount || 0).toLocaleString()}</span></div><p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{task.description}</p></div></div>
        {task.status === 'pending_verification' && <div className="text-[9px] text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">Pending verification</div>}
        {task.status === 'approved' || task.status === 'claimed' ? <div className="text-[9px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2">Reward approved</div> : <>
          {task.verificationType === 'proof' && <input value={proof[task.id] || ''} onChange={e => setProof(p => ({ ...p, [task.id]: e.target.value }))} placeholder={task.proofInstructions || 'Enter proof'} className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-white outline-none" />}
          <div className="flex gap-2"><button disabled={busy === task.id} onClick={() => startTask(task)} className="flex-1 py-2.5 rounded-lg bg-teal-500/15 border border-teal-500/20 text-teal-200 text-[9px] font-bold uppercase">{busy === task.id ? 'Starting...' : 'Start'}</button><button disabled={busy === task.id} onClick={() => submitTask(task)} className="flex-1 py-2.5 rounded-lg bg-teal-500/15 border border-teal-500/20 text-teal-200 text-[9px] font-bold uppercase">{remaining ? `${remaining}s` : 'Submit'}</button></div>
        </>}
      </GlassCard>;
    })}</div>}

    {tab === 'referrals' && <div className="space-y-3"><GlassCard className="p-5"><div className="grid grid-cols-3 gap-2 text-center"><div><div className="text-lg font-black text-white">{referrals?.totalReferrals ?? 0}</div><div className="text-[9px] text-slate-400">Referrals</div></div><div><div className="text-lg font-black text-teal-300">₦{Number(referrals?.totalBonus || 0).toLocaleString()}</div><div className="text-[9px] text-slate-400">Bonus</div></div><div><div className="text-lg font-black text-white">₦{Number(referrals?.bonusPerReferral || 0).toLocaleString()}</div><div className="text-[9px] text-slate-400">Per Referral</div></div></div></GlassCard><GlassCard className="p-4"><div className="text-[9px] uppercase tracking-wider text-slate-400 mb-2">Your Referral Link</div><div className="flex gap-2"><input readOnly value={referralLink} className="flex-1 min-w-0 bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-white" /><button onClick={async () => { await navigator.clipboard.writeText(referralLink); onToast?.('Referral link copied.', 'success'); }} className="p-2 rounded-lg bg-teal-500/15 text-teal-300"><Copy className="w-4 h-4" /></button></div></GlassCard><GlassCard className="p-4"><div className="text-xs font-bold text-white mb-2">Recent referrals</div>{(referrals?.records || []).length ? referrals.records.map((r: any) => <div key={r.id} className="py-2 border-b border-white/5 last:border-0 flex justify-between text-[10px]"><span className="text-slate-300">{r.referredUserName || r.referredUserEmail}</span><span className="text-teal-300">₦{Number(r.bonusAmount || 0).toLocaleString()}</span></div>) : <div className="text-[10px] text-slate-500">No referrals yet.</div>}</GlassCard></div>}

    {tab === 'activation' && <GlassCard className="p-5 space-y-4"><div className="text-center"><div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-300 border border-teal-500/20 flex items-center justify-center mx-auto"><ShieldCheck className="w-6 h-6" /></div><h4 className="text-sm font-bold text-white mt-3">Withdrawal Access</h4><p className="text-[10px] text-slate-400 mt-1">Complete both requirements before you can withdraw your earnings.</p></div><div className="space-y-2"><div className={`p-3 rounded-xl border text-xs ${Number(activation?.successfulReferrals || 0) >= 5 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-amber-500/10 border-amber-500/20 text-amber-200'}`}><b>1. Invite users:</b> {Number(activation?.successfulReferrals || 0)}/5 successful referrals</div>{Number(activation?.successfulReferrals || 0) >= 5 && <div className={`p-3 rounded-xl border text-xs ${activation?.depositRequirementMet ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-amber-500/10 border-amber-500/20 text-amber-200'}`}><b>2. Deposit:</b> {activation?.depositRequirementMet ? '₦520 minimum deposit completed' : 'Now deposit at least ₦520 into your wallet'}</div>}</div>{activation?.canWithdraw ? <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-center text-xs font-bold">Withdrawal unlocked</div> : <button onClick={() => { if (Number(activation?.successfulReferrals || 0) < 5) window.dispatchEvent(new CustomEvent('nevo-open-referrals')); else window.dispatchEvent(new CustomEvent('nevo-open-deposit')); }} className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 text-white text-xs font-black uppercase">{Number(activation?.successfulReferrals || 0) < 5 ? 'Complete 5 Referrals First' : 'Deposit ₦520 or More'}</button>}</GlassCard>}

    {tab === 'history' && <GlassCard className="p-4"><div className="space-y-1">{history.length ? history.map(tx => <div key={tx.id} className="flex items-center justify-between gap-3 py-3 border-b border-white/5 last:border-0"><div className="min-w-0"><div className="text-[10px] font-bold text-white truncate">{tx.description || tx.type}</div><div className="text-[9px] text-slate-500">{tx.createdAt ? new Date(tx.createdAt).toLocaleString() : ''}</div></div><div className={`text-[10px] font-black ${Number(tx.amount) >= 0 ? 'text-teal-300' : 'text-rose-300'}`}>{Number(tx.amount) >= 0 ? '+' : ''}₦{Math.abs(Number(tx.amount || 0)).toLocaleString()}</div></div>) : <div className="py-8 text-center text-xs text-slate-500">No reward transactions yet.</div>}</div></GlassCard>}
  </div>;
}
