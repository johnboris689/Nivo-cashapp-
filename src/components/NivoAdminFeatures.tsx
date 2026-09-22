import React, { useEffect, useState } from 'react';
import { Check, CheckSquare, Edit2, ExternalLink, Gift, RefreshCw, ShieldCheck, Trash2, Users, X } from 'lucide-react';
import GlassCard from './GlassCard';

const emptyTask = { title: '', description: '', rewardAmount: '500', category: 'special', verificationType: 'timer', timerSeconds: '30', actionUrl: '', proofInstructions: '' };

export default function NivoAdminFeatures({ token, onToast }: { token: string; onToast?: (m:string,t?:'success'|'info'|'error')=>void }) {
  const [tab,setTab]=useState<'tasks'|'submissions'|'referrals'|'activations'>('tasks');
  const [data,setData]=useState<any>({tasks:[],submissions:[],referrals:[],activations:[]});
  const [loading,setLoading]=useState(false);
  const [form,setForm]=useState<any>(emptyTask);
  const [editing,setEditing]=useState<any|null>(null);
  const [saving,setSaving]=useState(false);

  const headers = () => ({ 'Content-Type':'application/json', Authorization:`Bearer ${token}` });
  const load=async()=>{
    setLoading(true);
    try{
      const [a,b,c]=await Promise.all([
        fetch('/api/admin/nivo/tasks',{headers:headers()}),
        fetch('/api/admin/nivo/referrals',{headers:headers()}),
        fetch('/api/admin/nivo/activations',{headers:headers()})
      ]);
      const A=await a.json(),B=await b.json(),C=await c.json();
      if(!a.ok) throw new Error(A.error || 'Failed to load tasks.');
      setData({tasks:A.tasks||[],submissions:A.submissions||[],referrals:B.referrals||[],activations:C.activations||[]});
    }catch(e:any){onToast?.(e.message||'Failed to load rewards admin.','error')}
    finally{setLoading(false)}
  };
  useEffect(()=>{load()},[]);

  const openCreate=()=>{setEditing(null);setForm({...emptyTask});};
  const openEdit=(task:any)=>{
    setEditing(task);
    setForm({
      title:task.title||'', description:task.description||'', rewardAmount:String(task.rewardamount ?? task.rewardAmount ?? ''),
      category:task.category||'special', verificationType:task.verificationtype||task.verificationType||'timer',
      timerSeconds:String(task.timerseconds ?? task.timerSeconds ?? 30), actionUrl:task.actionurl ?? task.actionUrl ?? '',
      proofInstructions:task.proofinstructions ?? task.proofInstructions ?? ''
    });
  };
  const save=async()=>{
    if(!form.title.trim() || !form.description.trim()) return onToast?.('Task title and description are required.','error');
    if(!form.actionUrl.trim()) return onToast?.('Add the destination link users should open when they tap Start.','error');
    try { new URL(form.actionUrl.trim()); } catch { return onToast?.('Enter a valid http(s) URL.','error'); }
    setSaving(true);
    try {
      const url=editing ? `/api/admin/nivo/tasks/${editing.id}` : '/api/admin/nivo/tasks';
      const method=editing ? 'PATCH' : 'POST';
      const res=await fetch(url,{method,headers:headers(),body:JSON.stringify({...form,rewardAmount:Number(form.rewardAmount),timerSeconds:Number(form.timerSeconds)})});
      const d=await res.json(); if(!res.ok) throw new Error(d.error||'Failed to save task.');
      onToast?.(editing?'Task updated successfully.':'Task created successfully.','success');
      setEditing(null); setForm({...emptyTask}); await load();
    }catch(e:any){onToast?.(e.message,'error')}finally{setSaving(false)}
  };
  const action=async(url:string,method='POST',body?:any)=>{
    try{const res=await fetch(url,{method,headers:headers(),body:body?JSON.stringify(body):undefined});const d=await res.json();if(!res.ok)throw new Error(d.error||'Request failed.');onToast?.('Updated successfully.','success');load()}catch(e:any){onToast?.(e.message,'error')}
  };
  const deleteTask=async(t:any)=>{if(!window.confirm(`Delete task "${t.title}"? This cannot be undone.`))return;await action(`/api/admin/nivo/tasks/${t.id}`,'DELETE')};

  return <div className="p-4 sm:p-5 space-y-4">
    <div className="flex items-center justify-between gap-3">
      <div><h3 className="text-base font-bold font-display text-white">Rewards Management</h3><p className="text-[10px] text-slate-400">Create, edit, activate and remove real Nevo tasks and review submissions.</p></div>
      <button onClick={load} className="p-2 rounded-xl bg-white/5 text-slate-300" aria-label="Refresh"><RefreshCw className={`w-4 h-4 ${loading?'animate-spin':''}`}/></button>
    </div>
    <div className="grid grid-cols-4 gap-1 bg-slate-950/60 p-1 rounded-xl border border-white/5">
      {([['tasks','Tasks',CheckSquare],['submissions','Submissions',Check],['referrals','Referrals',Users],['activations','Activations',ShieldCheck]] as any[]).map(([id,label,I])=><button key={id} onClick={()=>setTab(id)} className={`py-2 rounded-lg text-[9px] font-bold uppercase ${tab===id?'bg-teal-500/15 text-teal-300':'text-slate-400'}`}><I className="w-3.5 h-3.5 mx-auto"/>{label}</button>)}
    </div>

    {tab==='tasks'&&<>
      <GlassCard className="p-4 space-y-2">
        <div className="flex items-center justify-between"><div className="text-xs font-bold text-white">{editing?'Edit Task':'Create Task'}</div>{editing&&<button onClick={openCreate} className="text-[9px] text-slate-400">Cancel edit</button>}</div>
        <input placeholder="Task title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="w-full bg-slate-950/60 border border-white/10 rounded-lg p-2.5 text-[10px] text-white"/>
        <textarea placeholder="Description / instructions for the user" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="w-full bg-slate-950/60 border border-white/10 rounded-lg p-2.5 text-[10px] text-white min-h-20"/>
        <input type="url" placeholder="https://destination-link.com" value={form.actionUrl} onChange={e=>setForm({...form,actionUrl:e.target.value})} className="w-full bg-slate-950/60 border border-white/10 rounded-lg p-2.5 text-[10px] text-white"/>
        <div className="grid grid-cols-2 gap-2"><input type="number" min="0" placeholder="Reward" value={form.rewardAmount} onChange={e=>setForm({...form,rewardAmount:e.target.value})} className="bg-slate-950/60 border border-white/10 rounded-lg p-2.5 text-[10px] text-white"/><select value={form.verificationType} onChange={e=>setForm({...form,verificationType:e.target.value})} className="bg-slate-950/60 border border-white/10 rounded-lg p-2.5 text-[10px] text-white"><option value="timer">Timer</option><option value="proof">Proof</option></select></div>
        {form.verificationType==='timer' ? <input type="number" min="0" placeholder="Timer seconds" value={form.timerSeconds} onChange={e=>setForm({...form,timerSeconds:e.target.value})} className="w-full bg-slate-950/60 border border-white/10 rounded-lg p-2.5 text-[10px] text-white"/> : <input placeholder="Proof instructions" value={form.proofInstructions} onChange={e=>setForm({...form,proofInstructions:e.target.value})} className="w-full bg-slate-950/60 border border-white/10 rounded-lg p-2.5 text-[10px] text-white"/>}
        <button disabled={saving} onClick={save} className="w-full py-2.5 rounded-lg bg-gradient-to-r from-teal-600 to-teal-500 text-white text-[10px] font-black uppercase disabled:opacity-50">{saving?(editing?'Saving...':'Creating...'):(editing?'Save Task Changes':'Create Task')}</button>
      </GlassCard>

      <div className="space-y-2">
        <div className="text-[9px] uppercase tracking-wider text-slate-500">Existing Tasks ({data.tasks.length})</div>
        {data.tasks.length===0 ? <GlassCard className="p-5 text-center text-[10px] text-slate-500">No tasks have been created yet.</GlassCard> : data.tasks.map((t:any)=><GlassCard key={t.id} className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="text-xs font-bold text-white">{t.title}</div><div className="text-[9px] text-slate-400 mt-1">₦{Number(t.rewardamount??t.rewardAmount??0).toLocaleString()} • {t.verificationtype||t.verificationType||'timer'}</div><div className="text-[10px] text-slate-500 mt-1 break-all">{t.description}</div>{(t.actionurl||t.actionUrl)&&<div className="text-[9px] text-teal-400 mt-2 break-all">{t.actionurl||t.actionUrl}</div>}</div><span className={`shrink-0 text-[8px] px-2 py-1 rounded-full ${Number(t.enabled)===1?'bg-emerald-500/10 text-emerald-300':'bg-slate-500/10 text-slate-400'}`}>{Number(t.enabled)===1?'ACTIVE':'SUSPENDED'}</span></div>
          <div className="flex gap-2"><button onClick={()=>action(`/api/admin/nivo/tasks/${t.id}`,'PATCH',{enabled:!(Number(t.enabled)===1)})} className="flex-1 py-2 rounded-lg bg-white/5 text-slate-300 text-[9px] font-bold">{Number(t.enabled)===1?'Suspend Task':'Activate Task'}</button>{(t.actionurl||t.actionUrl)&&<a href={t.actionurl||t.actionUrl} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-teal-500/10 text-teal-300"><ExternalLink className="w-3.5 h-3.5"/></a>}<button onClick={()=>openEdit(t)} className="p-2 rounded-lg bg-white/5 text-slate-300"><Edit2 className="w-3.5 h-3.5"/></button><button onClick={()=>deleteTask(t)} className="p-2 rounded-lg bg-rose-500/10 text-rose-300"><Trash2 className="w-3.5 h-3.5"/></button></div>
        </GlassCard>)}
      </div>
    </>}
    {tab==='submissions'&&<div className="space-y-2">{data.submissions.length===0?<GlassCard className="p-5 text-center text-[10px] text-slate-500">No submissions yet.</GlassCard>:data.submissions.map((s:any)=><GlassCard key={s.id} className="p-4 flex items-center justify-between gap-3"><div><div className="text-xs font-bold text-white">{s.tasktitle||s.taskTitle}</div><div className="text-[9px] text-slate-400">{s.userid||s.userId} • {s.status}</div><div className="text-[9px] text-slate-500">{s.prooftext||s.proofText||'Timer task'}</div></div>{s.status==='pending_verification'&&<div className="flex gap-1"><button onClick={()=>action(`/api/admin/nivo/submissions/${s.id}/approve`)} className="p-2 rounded-lg bg-emerald-500/10 text-emerald-300"><Check/></button><button onClick={()=>action(`/api/admin/nivo/submissions/${s.id}/reject`,'POST',{reason:'Rejected by admin'})} className="p-2 rounded-lg bg-rose-500/10 text-rose-300">×</button></div>}</GlassCard>)}</div>}
    {tab==='referrals'&&<div className="space-y-2">{data.referrals.length===0?<GlassCard className="p-5 text-center text-[10px] text-slate-500">No referrals recorded yet.</GlassCard>:data.referrals.map((r:any)=><GlassCard key={r.id} className="p-4 flex justify-between text-[10px]"><span className="text-slate-300">{r.referreremail} → {r.referredemail}</span><span className="text-teal-300">₦{Number(r.bonusamount||0).toLocaleString()}</span></GlassCard>)}</div>}
    {tab==='activations'&&<div className="space-y-2">{data.activations.length===0?<GlassCard className="p-5 text-center text-[10px] text-slate-500">No activation records yet.</GlassCard>:data.activations.map((a:any)=><GlassCard key={a.id} className="p-4 flex justify-between text-[10px]"><span className="text-slate-300">{a.useremail}</span><span className="text-teal-300">₦{Number(a.amount||0).toLocaleString()} • {a.status}</span></GlassCard>)}</div>}
  </div>;
}
