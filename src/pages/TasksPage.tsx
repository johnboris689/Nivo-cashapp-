import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckSquare, ExternalLink, Check, Sparkles, AlertCircle, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TaskCard } from '../components/TaskCard';
import { Task } from '../types';
import { api } from '../lib/api';

export const TasksPage: React.FC = () => {
  const { refreshUser } = useAuth();

  const [tasks, setTasks] = useState<(Task & { completed: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingTaskId, setClaimingTaskId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchTasks = async () => {
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleClaim = async (task: Task & { completed: boolean }) => {
    if (task.completed) return;

    setClaimingTaskId(task.id);
    setMsg(null);

    // If task has external URL, open it in a new tab first
    if (task.actionUrl && task.actionUrl !== '#') {
      window.open(task.actionUrl, '_blank');
    }

    try {
      const res = await api.completeTask(task.id);

      // Trigger Confetti Celebration!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff6b00', '#f59e0b', '#10b981', '#ffffff'],
      });

      setMsg({ type: 'success', text: res.message });
      await refreshUser();
      await fetchTasks();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to claim reward.' });
    } finally {
      setClaimingTaskId(null);
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalAvailableRewards = tasks
    .filter((t) => !t.completed)
    .reduce((sum, t) => sum + t.rewardAmount, 0);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-[#F27D26]" />
            Daily Tasks & Earnings Wall
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Complete quick tasks and claim instant wallet cash rewards
          </p>
        </div>

        <div className="bg-[#141414] border border-white/5 px-4 py-2 rounded-2xl flex items-center gap-3">
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase">Claimable Cash</p>
            <p className="text-base font-bold text-[#F27D26]">₦{totalAvailableRewards.toLocaleString()}</p>
          </div>
          <Sparkles className="w-5 h-5 text-[#F27D26]" />
        </div>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
            msg.type === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-500'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          {msg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Progress Card */}
      <div className="bg-[#141414] border border-white/5 rounded-3xl p-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-white">Your Task Progress</span>
          <span className="text-xs font-mono text-[#F27D26] font-bold">
            {completedCount} of {tasks.length} Completed
          </span>
        </div>
        <div className="w-full bg-black/40 h-3 rounded-full overflow-hidden border border-white/5">
          <div
            className="bg-[#F27D26] h-full transition-all duration-500"
            style={{ width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%` }}
          ></div>
        </div>
      </div>

      {/* Tasks Wall */}
      {loading ? (
        <div className="text-center py-12 text-zinc-500 text-xs">Loading task center...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 text-xs">No active tasks available right now. Check back soon!</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              loading={claimingTaskId === task.id}
              onClaim={() => handleClaim(task)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
