import React, { useState, useEffect } from 'react';
import { ExternalLink, Check, Sparkles, Smartphone, Share2, Calendar, Clock, ShieldCheck, Send, AlertTriangle, RotateCcw } from 'lucide-react';
import { Task, TaskSubmissionStatus, TaskSubmission } from '../types';
import { api } from '../lib/api';

interface TaskCardProps {
  task: Task & {
    userStatus?: TaskSubmissionStatus;
    submission?: TaskSubmission | null;
    completed: boolean;
  };
  onSuccess: (msg: string) => void;
  onError: (err: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onSuccess, onError }) => {
  const [status, setStatus] = useState<TaskSubmissionStatus>(task.userStatus || (task.completed ? 'claimed' : 'not_started'));
  const [submission, setSubmission] = useState<TaskSubmission | null>(task.submission || null);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [proofText, setProofText] = useState<string>('');
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timerActive, setTimerActive] = useState(false);

  const verificationType = task.verificationType || 'timer';
  const timerDuration = task.timerSeconds || 30;

  // Initialize status from props change
  useEffect(() => {
    if (task.userStatus) {
      setStatus(task.userStatus);
    } else if (task.completed) {
      setStatus('claimed');
    }
    if (task.submission) {
      setSubmission(task.submission);
      if (task.submission.status === 'in_progress' && verificationType === 'timer' && task.submission.startedAt) {
        const elapsed = (Date.now() - new Date(task.submission.startedAt).getTime()) / 1000;
        const remaining = Math.max(0, Math.ceil(timerDuration - elapsed));
        setSecondsLeft(remaining);
        if (remaining > 0) setTimerActive(true);
      }
    }
  }, [task]);

  // Timer Countdown Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, secondsLeft]);

  const handleStartTask = async () => {
    try {
      setIsStarting(true);
      // Open action link first
      if (task.actionUrl && task.actionUrl !== '#') {
        window.open(task.actionUrl, '_blank', 'noopener,noreferrer');
      }

      const res = await api.startTask(task.id);
      setSubmission(res.submission);
      setStatus('in_progress');

      if (verificationType === 'timer') {
        setSecondsLeft(timerDuration);
        setTimerActive(true);
      }
    } catch (err: any) {
      onError(err.message || 'Failed to start task.');
    } finally {
      setIsStarting(false);
    }
  };

  const handleSubmitProof = async () => {
    try {
      setIsSubmitting(true);
      const res = await api.submitTaskProof(task.id, proofText);
      
      if (res.credited) {
        setStatus('claimed');
        onSuccess(res.message);
      } else {
        setStatus('pending_verification');
        setSubmission(res.submission);
        onSuccess('Proof submitted! Your task is now under admin review.');
      }
    } catch (err: any) {
      onError(err.message || 'Verification failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = () => {
    switch (task.category) {
      case 'download':
        return <Smartphone className="w-5 h-5 text-[#C13A5A]" />;
      case 'daily':
        return <Calendar className="w-5 h-5 text-[#C13A5A]" />;
      default:
        return <Share2 className="w-5 h-5 text-[#C13A5A]" />;
    }
  };

  const progressPercent = Math.min(100, Math.max(0, ((timerDuration - secondsLeft) / timerDuration) * 100));

  return (
    <div
      className={`p-6 rounded-3xl border transition-all duration-200 flex flex-col justify-between ${
        status === 'claimed'
          ? 'bg-[#240A12]/50 border-white/5 opacity-85'
          : status === 'pending_verification'
          ? 'bg-[#240A12] border-amber-500/30 shadow-lg shadow-amber-500/5'
          : status === 'rejected'
          ? 'bg-[#240A12] border-red-500/30'
          : 'bg-[#240A12] border-[#8F1D3A]/20 hover:border-[#8F1D3A]/40 shadow-xl'
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div className="p-2.5 rounded-2xl bg-black/40 border border-[#8F1D3A]/20 flex items-center gap-2">
            {getCategoryIcon()}
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
              {verificationType === 'timer' ? `${timerDuration}s Timer` : 'Proof Required'}
            </span>
          </div>
          <span className="text-sm font-black text-[#C13A5A] bg-[#A52A4A]/10 px-3.5 py-1 rounded-full border border-[#A52A4A]/30 shadow-sm">
            +₦{task.rewardAmount.toLocaleString()}
          </span>
        </div>

        <h3 className="font-extrabold text-white text-base leading-snug">{task.title}</h3>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">{task.description}</p>

        {/* Proof Instructions */}
        {verificationType === 'proof' && task.proofInstructions && status !== 'claimed' && (
          <div className="mt-3.5 p-3 rounded-2xl bg-black/40 border border-white/10 text-[11px] text-slate-300">
            <span className="font-bold text-[#C13A5A]">Instructions: </span>
            {task.proofInstructions}
          </div>
        )}
      </div>

      {/* Interactive Controls & Verification Area */}
      <div className="mt-6 pt-4 border-t border-white/10 space-y-3">
        {/* STATUS: CLAIMED */}
        {status === 'claimed' && (
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Verified & Earned
            </span>
            <span className="flex items-center gap-1.5 bg-[#8F1D3A]/10 text-[#A52A4A] text-xs font-bold px-3.5 py-2 rounded-xl border border-[#8F1D3A]/30">
              <Check className="w-4 h-4" />
              Reward Claimed
            </span>
          </div>
        )}

        {/* STATUS: PENDING VERIFICATION */}
        {status === 'pending_verification' && (
          <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl space-y-1.5">
            <div className="flex items-center justify-between text-amber-400 font-bold text-xs">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 animate-spin text-amber-400" />
                Under Admin Review
              </span>
              <span className="text-[10px] bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                Pending
              </span>
            </div>
            <p className="text-[11px] text-amber-200/80 leading-relaxed">
              Your submission proof is being verified. Reward will be added to your balance upon approval.
            </p>
            {submission?.proofText && (
              <p className="text-[10px] text-slate-300 font-mono bg-black/50 p-2 rounded-xl border border-white/10 truncate">
                Submitted Proof: {submission.proofText}
              </p>
            )}
          </div>
        )}

        {/* STATUS: REJECTED */}
        {status === 'rejected' && (
          <div className="bg-red-500/10 border border-red-500/30 p-3.5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-red-400 font-bold text-xs">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Proof Rejected
              </span>
            </div>
            <p className="text-[11px] text-red-200/80">
              Reason: {submission?.adminNote || 'Invalid or unverified proof.'}
            </p>
            <button
              onClick={handleStartTask}
              disabled={isStarting}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold text-xs py-2.5 rounded-xl border border-red-500/30 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retry Task Submission
            </button>
          </div>
        )}

        {/* STATUS: NOT STARTED */}
        {status === 'not_started' && (
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {task.completionCount} Completed
            </span>
            <button
              onClick={handleStartTask}
              disabled={isStarting}
              className="flex items-center gap-1.5 bg-gradient-to-r from-[#7A1831] to-[#A52A4A] hover:from-[#8F1D3A] hover:to-[#C13A5A] disabled:opacity-50 text-white font-bold text-xs px-4.5 py-2.5 rounded-xl shadow-md shadow-[#7A1831]/20 transition-all cursor-pointer"
            >
              {isStarting ? (
                'Opening Link...'
              ) : (
                <>
                  <span>Start Task</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        )}

        {/* STATUS: IN PROGRESS */}
        {status === 'in_progress' && (
          <div className="space-y-3">
            {verificationType === 'timer' ? (
              <div className="space-y-2.5">
                {/* Countdown Progress Bar */}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#C13A5A] animate-pulse" />
                    Visit Duration Verification:
                  </span>
                  <span className="font-mono font-bold text-[#C13A5A]">
                    {secondsLeft > 0 ? `${secondsLeft}s remaining` : 'Ready to Claim!'}
                  </span>
                </div>

                <div className="w-full bg-black/60 h-2 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="bg-gradient-to-r from-[#8F1D3A] to-[#C13A5A] h-full transition-all duration-1000"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <button
                  onClick={handleSubmitProof}
                  disabled={isSubmitting || secondsLeft > 0}
                  className={`w-full flex items-center justify-center gap-2 font-bold text-xs py-3 rounded-xl transition-all ${
                    secondsLeft > 0
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/10'
                      : 'bg-[#8F1D3A] hover:bg-[#A52A4A] text-slate-950 font-black shadow-lg shadow-[#8F1D3A]/20 cursor-pointer animate-pulse'
                  }`}
                >
                  {isSubmitting ? (
                    'Verifying with Server...'
                  ) : secondsLeft > 0 ? (
                    `Complete Timer (${secondsLeft}s)`
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Verify & Claim ₦{task.rewardAmount.toLocaleString()}
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* Proof input for proof-based tasks */
              <div className="space-y-2.5">
                <label className="text-[11px] font-bold text-slate-300 block">
                  Submit Proof of Completion:
                </label>
                <input
                  type="text"
                  value={proofText}
                  onChange={(e) => setProofText(e.target.value)}
                  placeholder="e.g. @your_username or profile handle"
                  className="w-full bg-black/50 border border-[#8F1D3A]/30 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C13A5A]"
                />
                <button
                  onClick={handleSubmitProof}
                  disabled={isSubmitting || !proofText.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#7A1831] to-[#A52A4A] hover:from-[#8F1D3A] hover:to-[#C13A5A] disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    'Submitting Proof...'
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Submit Proof for Verification
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
