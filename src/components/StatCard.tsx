import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  highlight?: boolean;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendUp = true,
  highlight = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden ${
        onClick ? 'cursor-pointer hover:border-[#C13A5A]/40 hover:scale-[1.01] active:scale-[0.99]' : ''
      } ${
        highlight
          ? 'bg-gradient-to-br from-[#240A12] via-[#16090D] to-[#100709] border-[#A52A4A]/30 shadow-xl shadow-[#7A1831]/10'
          : 'nivo-glass-surface border-white/10 hover:border-[#8F1D3A]/30'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-[11px] font-semibold tracking-tight truncate pr-1 uppercase">{title}</span>
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            highlight 
              ? 'bg-gradient-to-tr from-[#7A1831] to-[#C13A5A] text-white shadow-md shadow-[#C13A5A]/20' 
              : 'bg-[#8F1D3A]/10 text-[#C13A5A] border border-[#8F1D3A]/20'
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-2.5">
        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">{value}</h3>
        {subtitle && <p className="text-[11px] text-slate-400 mt-0.5 truncate">{subtitle}</p>}
      </div>

      {trend && (
        <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center gap-1 text-[11px] font-medium">
          <span className={trendUp ? 'text-[#A52A4A]' : 'text-[#C13A5A]'}>{trend}</span>
          <span className="text-slate-500">vs last week</span>
        </div>
      )}
    </div>
  );
};
