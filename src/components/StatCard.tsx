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
      className={`p-6 rounded-3xl border transition-all duration-200 relative overflow-hidden ${
        onClick ? 'cursor-pointer hover:border-white/20 hover:scale-[1.01]' : ''
      } ${
        highlight
          ? 'bg-gradient-to-br from-[#181818] via-[#141414] to-[#101010] border-[#F27D26]/30 shadow-xl shadow-orange-950/20'
          : 'bg-[#141414] border-white/5'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-gray-500 text-xs uppercase font-bold tracking-wider">{title}</span>
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
            highlight ? 'bg-[#F27D26] text-black shadow-md shadow-orange-950/30' : 'bg-[#F27D26]/10 text-[#F27D26]'
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3">
        <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>

      {trend && (
        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center gap-1.5 text-xs font-semibold">
          <span className={trendUp ? 'text-green-500' : 'text-red-400'}>{trend}</span>
          <span className="text-gray-500">vs last week</span>
        </div>
      )}
    </div>
  );
};
