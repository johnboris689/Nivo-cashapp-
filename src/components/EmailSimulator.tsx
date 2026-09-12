import React from 'react';
import { Mail, Check, Trash2, Calendar, Shield, Bell, Send, Lock } from 'lucide-react';
import { SimulatedEmail } from '../types';
import GlassCard from './GlassCard';

interface EmailSimulatorProps {
  emails: SimulatedEmail[];
  onMarkAsRead: (id: string) => void;
  onDeleteEmail: (id: string) => void;
  onClearAll: () => void;
}

export default function EmailSimulator({
  emails,
  onMarkAsRead,
  onDeleteEmail,
  onClearAll
}: EmailSimulatorProps) {
  const [selectedEmail, setSelectedEmail] = React.useState<SimulatedEmail | null>(null);

  const handleSelectEmail = (email: SimulatedEmail) => {
    setSelectedEmail(email);
    onMarkAsRead(email.id);
  };

  const getSubjectIcon = (subject: string) => {
    const sub = subject.toLowerCase();
    if (sub.includes('otp') || sub.includes('verification') || sub.includes('code')) {
      return <Shield className="h-4 w-4 text-teal-400" />;
    }
    if (sub.includes('login') || sub.includes('device') || sub.includes('failed')) {
      return <Lock className="h-4 w-4 text-indigo-400" />;
    }
    if (sub.includes('success') || sub.includes('transfer') || sub.includes('withdrawal')) {
      return <Check className="h-4 w-4 text-emerald-400" />;
    }
    return <Bell className="h-4 w-4 text-amber-400" />;
  };

  return (
    <GlassCard className="p-4 border border-white/[0.08] bg-slate-950/60 flex flex-col h-full min-h-[400px]">
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
            <Mail className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">SwiftMail Simulator</h4>
            <p className="text-[9px] font-mono text-slate-400">Automated Notification Dispatcher</p>
          </div>
        </div>
        
        {emails.length > 0 && (
          <button
            onClick={onClearAll}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
            title="Clear all simulated emails"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {selectedEmail ? (
        <div className="flex-1 flex flex-col space-y-3 animate-[fadeIn_0.2s_ease-out]">
          {/* Header area */}
          <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 space-y-1.5">
            <button
              onClick={() => setSelectedEmail(null)}
              className="text-[10px] font-bold text-teal-400 hover:underline mb-1 cursor-pointer block"
            >
              &larr; Back to Mailbox
            </button>
            <h5 className="text-xs font-bold text-white leading-normal flex items-center gap-1.5">
              {getSubjectIcon(selectedEmail.subject)}
              {selectedEmail.subject}
            </h5>
            <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono pt-1">
              <span>To: {selectedEmail.to}</span>
              <span>{new Date(selectedEmail.date).toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Email content */}
          <div className="flex-1 bg-slate-950/80 p-3.5 rounded-xl border border-white/5 text-[11px] text-slate-300 leading-relaxed font-mono whitespace-pre-wrap select-all overflow-y-auto max-h-[220px]">
            {selectedEmail.body}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                onDeleteEmail(selectedEmail.id);
                setSelectedEmail(null);
              }}
              className="flex-1 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              <Trash2 className="h-3 w-3" /> Delete
            </button>
            <button
              onClick={() => setSelectedEmail(null)}
              className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-[250px] justify-between">
          {emails.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-2">
              <Mail className="h-8 w-8 text-slate-600 stroke-[1.5]" />
              <p className="text-xs text-slate-400">Mailbox is empty</p>
              <p className="text-[9px] text-slate-500 leading-normal max-w-[180px]">
                Trigger transactions, log in, or update security parameters to receive simulated emails here.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5 overflow-y-auto max-h-[300px] pr-1 flex-1">
              {emails.map((email) => (
                <div
                  key={email.id}
                  onClick={() => handleSelectEmail(email)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative group ${
                    email.read
                      ? 'bg-white/[0.02] border-white/5 hover:border-white/10'
                      : 'bg-indigo-500/5 border-indigo-500/20 hover:border-indigo-500/30 ring-1 ring-indigo-500/10'
                  }`}
                >
                  {!email.read && (
                    <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-teal-400" />
                  )}
                  <div className="flex items-center gap-1.5 pr-4">
                    {getSubjectIcon(email.subject)}
                    <span className="text-[10px] font-extrabold text-white truncate max-w-[150px]">
                      {email.subject}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-400 truncate mt-1">
                    {email.body.replace(/<[^>]*>/g, '')}
                  </p>
                  <div className="flex justify-between items-center text-[8px] text-slate-500 font-mono mt-1.5">
                    <span>{email.to}</span>
                    <span>{new Date(email.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-[9px] text-slate-500 font-mono pt-3 border-t border-white/5 text-center flex items-center justify-center gap-1">
            <Shield className="h-3 w-3" /> Fully secure client-to-server sandbox
          </div>
        </div>
      )}
    </GlassCard>
  );
}
