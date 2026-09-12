import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  key?: React.Key | string | number;
}

export default function GlassCard({ children, className = '', id }: GlassCardProps) {
  return (
    <div
      id={id}
      className={`rounded-2xl border border-teal-500/20 bg-[#090d18]/85 backdrop-blur-xl shadow-[0_0_25px_rgba(0,0,0,0.6)] transition-all duration-300 hover:border-teal-500/40 ${className}`}
    >
      {children}
    </div>
  );
}
