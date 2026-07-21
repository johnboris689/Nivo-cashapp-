import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  Users,
  CheckSquare,
  PlusCircle,
  ArrowUpRight,
  Copy,
  Check,
  Share2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { ShareModal } from '../components/ShareModal';
import { Transaction, Task } from '../types';
import { api } from '../lib/api';

interface DashboardPageProps {
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onOpenDeposit, onOpenWithdraw }) => {
  const { user, settings, refreshUser } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tasks, setTasks] = useState<(Task & { completed: boolean })[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const bonusAmount = settings?.referralBonusAmount || 1200;

  const fetchData = async () => {
    try {
      const [txData, taskData] = await Promise.all([
        api.getTransactions().catch(() => []),
        api.getTasks().catch(() => []),
      ]);
      setTransactions(txData.slice(0, 5));
      setTasks(taskData.slice(0, 3));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const copyReferralCode = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141414] p-6 rounded-3xl border border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">
              Welcome back, <span className="text-[#F27D26]">{user?.fullName}</span> 👋
            </h1>
            <span className="bg-[#F27D26]/10 text-[#F27D26] text-[10px] font-bold px-3 py-1 rounded-full uppercase border border-[#F27D26]/20">
              Verified Account
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Manage your wallet, complete tasks, and earn ₦{bonusAmount.toLocaleString()} per referral.
          </p>
        </div>

        <button
          onClick={() => setShowShareModal(true)}
          className="flex items-center justify-center gap-2 bg-[#F27D26] hover:bg-[#E6721F] text-black font-bold text-xs px-6 py-3.5 rounded-2xl shadow-lg shadow-orange-950/20 transition-all hover:scale-105 cursor-pointer shrink-0"
        >
          <Share2 className="w-4 h-4" />
          <span>Share Referral Link</span>
        </button>
      </div>

      {/* Primary Wallet Hero Card */}
      <div className="bg-gradient-to-br from-[#F27D26] via-[#E6721F] to-[#CC5F10] rounded-[32px] p-8 text-black shadow-2xl shadow-orange-950/20 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative overflow-hidden">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-bold opacity-70 uppercase tracking-tighter">Available Wallet Balance</p>
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight">
              ₦{user?.walletBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 }) || '0.00'}
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onOpenDeposit}
              className="bg-black text-white hover:bg-zinc-900 px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <PlusCircle className="w-4 h-4" />
              Deposit Funds
            </button>
            <button
              onClick={onOpenWithdraw}
              className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-black px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2 cursor-pointer transition-all"
            >
              <ArrowUpRight className="w-4 h-4" />
              Withdraw
            </button>
          </div>
        </div>

        <div className="text-left md:text-right">
          <p className="text-xs font-bold opacity-70 uppercase">Total Earnings</p>
          <p className="text-2xl sm:text-3xl font-black">₦{user?.totalEarnings.toLocaleString() || '0.00'}</p>
        </div>
      </div>

      {/* Key Analytics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Earnings"
          value={`₦${(user?.totalEarnings || 0).toLocaleString()}`}
          subtitle="Lifetime earnings"
          icon={TrendingUp}
          highlight
        />
        <StatCard
          title="Total Referrals"
          value={user?.totalReferrals || 0}
          subtitle="Successful sign-ups"
          icon={Users}
        />
        <StatCard
          title="Referral Bonus"
          value={`₦${(user?.totalReferralBonus || 0).toLocaleString()}`}
          subtitle={`₦${bonusAmount} per user`}
          icon={Sparkles}
        />
        <StatCard
          title="Referral Code"
          value={user?.referralCode || 'NIVO123'}
          subtitle={copiedCode ? 'Copied code!' : 'Click to copy code'}
          icon={Copy}
          onClick={copyReferralCode}
        />
      </div>

      {/* Referral Banner & Tasks Widget Split */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Referral System Promo Box */}
        <div className="lg:col-span-2 bg-[#141414] border border-white/5 rounded-3xl p-8 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#F27D26]" />
                Referral Program
              </h3>
              <span className="text-[#F27D26] text-xs font-bold bg-[#F27D26]/10 px-3 py-1 rounded-full border border-[#F27D26]/20">
                MASTER PROGRAM
              </span>
            </div>

            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Earn ₦{bonusAmount.toLocaleString()} instantly per verified registration! Share your code or referral link with friends.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-bold uppercase">Your Referral Link</p>
                <div className="bg-black border border-white/5 p-3 rounded-xl flex justify-between items-center">
                  <span className="text-sm text-gray-400 truncate pr-2">{user?.referralLink}</span>
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="text-[#F27D26] text-xs font-bold hover:underline shrink-0 cursor-pointer"
                  >
                    COPY
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-bold uppercase">Your Code</p>
                <div className="bg-black border border-white/5 p-3 rounded-xl flex justify-between items-center">
                  <span className="text-sm text-gray-400 font-mono">{user?.referralCode}</span>
                  <button
                    onClick={copyReferralCode}
                    className="text-[#F27D26] text-xs font-bold hover:underline shrink-0 cursor-pointer"
                  >
                    {copiedCode ? 'COPIED' : 'COPY'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-gray-400">
            <span>Direct instant wallet credit</span>
            <Link to="/referrals" className="text-[#F27D26] hover:underline flex items-center gap-1">
              <span>View Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Quick Tasks Box */}
        <div className="bg-[#141414] border border-white/5 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#F27D26]" />
                Daily Tasks
              </h3>
              <Link to="/tasks" className="text-xs font-bold text-[#F27D26] hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {tasks.length === 0 ? (
                <p className="text-xs text-gray-500 py-4 text-center">Loading tasks...</p>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-white max-w-[130px] truncate">{task.title}</p>
                      <p className="text-[11px] text-[#F27D26] font-bold">+₦{task.rewardAmount}</p>
                    </div>
                    {task.completed ? (
                      <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
                        Claimed
                      </span>
                    ) : (
                      <Link
                        to="/tasks"
                        className="text-[10px] font-bold bg-[#F27D26] hover:bg-[#E6721F] text-black px-3 py-1.5 rounded-xl"
                      >
                        Start
                      </Link>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 text-center">
            <Link to="/tasks" className="text-xs font-bold text-gray-400 hover:text-white">
              Earn more rewards with daily tasks ➔
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="bg-[#141414] border border-white/5 rounded-[32px] p-6">
        <div className="flex items-center justify-between mb-6 px-2">
          <h3 className="text-lg font-bold text-white">Recent Activity</h3>
          <Link to="/history" className="text-xs font-bold text-[#F27D26] hover:underline">
            View Full History
          </Link>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-xs">No activity recorded yet.</div>
        ) : (
          <div className="overflow-x-auto px-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium text-gray-300">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-3 uppercase text-[10px] font-bold text-[#F27D26]">
                      {tx.type.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-white">{tx.description}</td>
                    <td className="py-3.5 px-3 font-bold text-white">₦{tx.amount.toLocaleString()}</td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          tx.status === 'completed' || tx.status === 'approved'
                            ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                            : tx.status === 'pending'
                            ? 'bg-[#F27D26]/10 text-[#F27D26] border border-[#F27D26]/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-gray-500 text-[11px]">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showShareModal && <ShareModal onClose={() => setShowShareModal(false)} />}
    </div>
  );
};
