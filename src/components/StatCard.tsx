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
      className={`p-4 sm:p-4.5 rounded-2xl border transition-all duration-200 relative overflow-hidden ${
        onClick ? 'cursor-pointer hover:border-[#F27D26]/40 hover:scale-[1.02] active:scale-95' : ''
      } ${
        highlight
          ? 'bg-gradient-to-br from-[#1A1A1A] via-[#141414] to-[#101010] border-[#F27D26]/30 shadow-lg shadow-orange-950/20'
          : 'bg-[#141414] border-white/5 hover:border-white/10'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-[11px] font-medium tracking-tight truncate pr-1">{title}</span>
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            highlight ? 'bg-[#F27D26] text-black shadow-sm' : 'bg-[#F27D26]/10 text-[#F27D26]'
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-2">
        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">{value}</h3>
        {subtitle && <p className="text-[11px] text-gray-400 mt-0.5 truncate">{subtitle}</p>}
      </div>

      {trend && (
        <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-1 text-[11px] font-medium">
          <span className={trendUp ? 'text-emerald-400' : 'text-rose-400'}>{trend}</span>
          <span className="text-gray-500">vs last week</span>
        </div>
      )}
    </div>
  );
};

