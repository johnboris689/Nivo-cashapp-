import React from 'react';

interface NevoLogoProps {
  size?: number;
  showName?: boolean;
  compact?: boolean;
  className?: string;
}

export default function NevoLogo({ size = 40, showName = true, compact = false, className = '' }: NevoLogoProps) {
  return (
    <div className={`flex items-center ${compact ? 'gap-2' : 'gap-2.5'} ${className}`}>
      <img src="/nevo-logo.svg" alt="Nevo" width={size} height={size} className="shrink-0 rounded-[24%] drop-shadow-[0_0_18px_rgba(0,201,167,.25)]" />
      {showName && (
        <div className="min-w-0">
          <div className="font-display font-bold tracking-tight text-white leading-none" style={{ fontSize: Math.max(16, size * 0.48) }}>Nevo</div>
          {!compact && <div className="text-[8px] font-mono tracking-[0.2em] text-slate-400 mt-1 uppercase">Financial Freedom</div>}
        </div>
      )}
    </div>
  );
}
