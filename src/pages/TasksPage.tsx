import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckSquare, Check, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TaskCard } from '../components/TaskCard';
import { Task, TaskSubmissionStatus, TaskSubmission } from '../types';
import { api } from '../lib/api';

type TaskWithSubmission = Task & {
  userStatus?: TaskSubmissionStatus;
  submission?: TaskSubmission | null;
  completed: boolean;
};

export const TasksPage: React.FC = () => {
  const { refreshUser } = useAuth();

  const [tasks, setTasks] = useState<TaskWithSubmission[]>([]);
  const [loading, setLoading] = useState(true);
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

  const handleSuccess = async (message: string) => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#071114', '#008F7A', '#00BFA6', '#C13A5A', '#ffffff'],
    });

    setMsg({ type: 'success', text: message });
    await refreshUser();
    await fetchTasks();
  };

  const handleError = (errorText: string) => {
    setMsg({ type: 'error', text: errorText });
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalAvailableRewards = tasks
    .filter((t) => !t.completed)
    .reduce((sum, t) => sum + t.rewardAmount, 0);

  return (
    <div className="space-y-5 animate-fade-in pb-20">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-[#C13A5A]" />
            Verified Task & Reward Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00BFA6]" />
            Backend-verified completion engine prevents double claiming & exploits
          </p>
        </div>

        <div className="nivo-glass-surface border border-white/10 px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-lg shrink-0">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Claimable Cash</p>
            <p className="text-base font-black text-[#C13A5A]">₦{totalAvailableRewards.toLocaleString()}</p>
          </div>
          <Sparkles className="w-5 h-5 text-[#C13A5A]" />
        </div>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
            msg.type === 'success'
              ? 'bg-[#00C9A7]/10 border-[#00C9A7]/30 text-[#00BFA6]'
              : 'bg-[#00C9A7]/10 border-[#00C9A7]/30 text-[#C13A5A]'
          }`}
        >
          {msg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Progress Card */}
      <div className="nivo-glass-surface border border-white/10 rounded-3xl p-5 shadow-xl">
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-xs font-bold text-white">Your Task Progress</span>
          <span className="text-xs font-mono text-[#C13A5A] font-bold">
            {completedCount} of {tasks.length} Verified & Claimed
          </span>
        </div>
        <div className="w-full bg-[#071114] h-3 rounded-full overflow-hidden border border-white/10">
          <div
            className="bg-gradient-to-r from-[#008F7A] to-[#C13A5A] h-full transition-all duration-500"
            style={{ width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%` }}
          ></div>
        </div>
      </div>

      {/* Tasks Wall */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-xs font-semibold">Loading verified task center...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-xs font-semibold">No active tasks available right now. Check back soon!</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onSuccess={handleSuccess}
              onError={handleError}
            />
          ))}
        </div>
      )}
    </div>
  );
};
