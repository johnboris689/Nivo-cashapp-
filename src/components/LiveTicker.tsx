import React, { useEffect, useState } from 'react';

interface FeedEvent { type: string; message: string; timestamp: string; reference?: string; }

export default function LiveTicker() {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [index, setIndex] = useState(0);

  const load = async () => {
    try {
      const token = localStorage.getItem('nevo_auth_token');
      if (!token) return;
      const res = await fetch('/api/live-feed', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(data.events)) setEvents(data.events);
    } catch { /* live feed is non-critical */ }
  };

  useEffect(() => {
    load();
    const refresh = window.setInterval(load, 5000);
    return () => window.clearInterval(refresh);
  }, []);

  useEffect(() => {
    if (events.length < 2) return;
    const timer = window.setInterval(() => setIndex(i => (i + 1) % events.length), 7000);
    return () => window.clearInterval(timer);
  }, [events.length]);

  const current = events[index];
  const text = current?.message || 'VERIFIED LIVE ACTIVITY — Confirmed deposits and withdrawals appear here automatically.';

  return (
    <div className="w-full bg-[#0a0a12] border-b border-white/[0.06] py-1 overflow-hidden flex items-center relative z-20 select-none shrink-0 font-sans">
      <div className="bg-red-500/10 text-red-400 border-r border-white/5 px-2.5 py-0.5 flex items-center gap-1.5 shrink-0 z-30 text-[9px] font-bold font-mono tracking-wider uppercase bg-[#0c0c14] h-full">
        <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" /></span>
        LIVE
      </div>
      <div className="flex-1 overflow-hidden relative flex items-center">
        <div key={`${current?.reference || 'empty'}-${index}`} className="animate-ticker text-[10px] sm:text-[11px] font-mono text-teal-400 tracking-wide font-medium whitespace-nowrap px-4">
          {text}
        </div>
      </div>
    </div>
  );
}
