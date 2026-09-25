import React from 'react';

interface NevoLogoProps {
  size?: number;
  showName?: boolean;
  compact?: boolean;
  className?: string;
}

export default function NevoLogo({ size = 36, showName = true, compact = false, className = '' }: NevoLogoProps) {
  return (
    <div className={`flex items-center ${compact ? 'gap-2' : 'gap-2.5'} ${className}`}>
      <img
        src="/nevo-logo.svg"
        alt="Nevo"
        width={size}
        height={size}
        className="shrink-0 rounded-[22%] shadow-[0_0_20px_rgba(0,201,167,0.22)]"
      />
      {showName && (
        <div className="min-w-0 text-left">
          <div className="font-display font-bold tracking-tight text-white leading-none text-base sm:text-lg">Nevo</div>
          {!compact && (
            <div className="hidden sm:block text-[9px] font-sans tracking-[0.18em] text-[#8E9A9A] mt-0.5 uppercase">
              Rewards & Wallet
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface NevoBrandLockupProps {
  className?: string;
  tagline?: string;
  subtitle?: string;
  logoSize?: number;
}

export function NevoBrandLockup({
  className = '',
  tagline = 'REWARDS & WALLET PLATFORM',
  subtitle,
  logoSize = 56,
}: NevoBrandLockupProps) {
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      {/* 1. Centered Nevo Logo */}
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-2xl bg-[#00C9A7]/15 blur-xl pointer-events-none" />
        <img
          src="/nevo-logo.svg"
          alt="Nevo Logo"
          width={logoSize}
          height={logoSize}
          className="relative shrink-0 rounded-[22%] shadow-[0_8px_24px_rgba(0,201,167,0.24)]"
        />
      </div>

      {/* 2. Small gap -> Nevo wordmark */}
      <h1 className="mt-3 font-display text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
        Nevo
      </h1>

      {/* 3. Small gap -> Tagline */}
      <div className="mt-1 text-[10px] sm:text-[11px] font-bold tracking-[0.24em] uppercase text-[#7EE8D3]">
        {tagline}
      </div>

      {/* Optional descriptive subtitle */}
      {subtitle && (
        <p className="mt-2.5 max-w-sm text-xs text-[#8E9A9A] leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

