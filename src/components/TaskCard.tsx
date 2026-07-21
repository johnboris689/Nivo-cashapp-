import React from 'react';
import { ExternalLink, Check, Sparkles, Smartphone, Share2, Calendar } from 'lucide-react';
import { Task } from '../types';

interface TaskCardProps {
  task: Task & { completed: boolean };
  loading?: boolean;
  onClaim: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, loading, onClaim }) => {
  const getCategoryIcon = () => {
    switch (task.category) {
      case 'download':
        return <Smartphone className="w-5 h-5 text-[#F27D26]" />;
      case 'daily':
        return <Calendar className="w-5 h-5 text-[#F27D26]" />;
      default:
        return <Share2 className="w-5 h-5 text-[#F27D26]" />;
    }
  };

  return (
    <div
      className={`p-6 rounded-3xl border transition-all duration-200 flex flex-col justify-between ${
        task.completed
          ? 'bg-[#141414]/60 border-white/5 opacity-75'
          : 'bg-[#141414] border-white/5 hover:border-white/10'
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="p-2.5 rounded-2xl bg-black/40 border border-white/5">
            {getCategoryIcon()}
          </div>
          <span className="text-sm font-bold text-[#F27D26] bg-[#F27D26]/10 px-3 py-1 rounded-full border border-[#F27D26]/20">
            +₦{task.rewardAmount.toLocaleString()}
          </span>
        </div>

        <h3 className="font-bold text-white text-base leading-snug">{task.title}</h3>
        <p className="text-xs text-gray-400 mt-2 leading-relaxed">{task.description}</p>
      </div>

      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
          {task.completionCount} Users Completed
        </span>

        {task.completed ? (
          <span className="flex items-center gap-1.5 bg-green-500/10 text-green-500 text-xs font-bold px-3.5 py-2 rounded-xl border border-green-500/20">
            <Check className="w-4 h-4" />
            Claimed
          </span>
        ) : (
          <button
            onClick={onClaim}
            disabled={loading}
            className="flex items-center gap-1.5 bg-[#F27D26] hover:bg-[#E6721F] disabled:opacity-50 text-black font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            {loading ? (
              'Claiming...'
            ) : (
              <>
                <span>Complete & Claim</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
