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
  Eye,
  EyeOff,
  History,
  ArrowDownLeft,
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
  const { user, settings } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tasks, setTasks] = useState<(Task & { completed: boolean })[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

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

  const copyReferralLink = () => {
    if (user?.referralLink) {
      navigator.clipboard.writeText(user.referralLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const quickActions = [
    { label: 'Deposit', icon: PlusCircle, action: onOpenDeposit, isButton: true },
    { label: 'Withdraw', icon: ArrowUpRight, action: onOpenWithdraw, isButton: true },
    { label: 'Tasks', icon: CheckSquare, path: '/tasks', isButton: false },
    { label: 'Referrals', icon: Users, path: '/referrals', isButton: false },
    { label: 'History', icon: History, path: '/history', isButton: false },
    { label: 'Wallet', icon: Wallet, path: '/wallet', isButton: false },
  ];

  return (
    <div className="space-y-4 animate-fade-in pb-16">
      {/* Greeting Banner */}
      <div className="flex items-center justify-between bg-[#141414] px-4 py-3 rounded-2xl border border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#F27D26]/20 text-[#F27D26] flex items-center justify-center font-bold text-sm border border-[#F27D26]/30">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Hi, {user?.fullName?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-[10px] text-gray-400">Welcome to Nivo Cash</p>
          </div>
        </div>
        <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" />
          Verified
        </span>
      </div>

      {/* Redesigned Compact Wallet Balance Card (OPay-Inspired) */}
      <div className="bg-gradient-to-br from-[#F27D26] via-[#E86C15] to-[#D95B00] rounded-[24px] p-5 text-black shadow-xl shadow-orange-950/20 relative overflow-hidden">
        {/* Card Decorative Elements */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-black/70 uppercase tracking-wider">
            Available Balance
          </span>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="flex items-center gap-1 bg-black/15 hover:bg-black/25 text-black text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm transition-all cursor-pointer"
          >
            {showBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showBalance ? 'Hide' : 'Show'}</span>
          </button>
        </div>

        <div className="my-3 flex items-baseline justify-between flex-wrap gap-2">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight font-mono">
            {showBalance
              ? `₦${user?.walletBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 }) || '0.00'}`
              : '••••••••'}
          </h2>
          <div className="text-right">
            <span className="text-[10px] font-bold text-black/60 uppercase block">Total Earned</span>
            <span className="text-xs font-black">
              ₦{user?.totalEarnings.toLocaleString() || '0.00'}
            </span>
          </div>
        </div>

        {/* Compact Deposit & Withdraw Pill Buttons */}
        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-black/10">
          <button
            onClick={onOpenDeposit}
            className="flex-1 bg-black text-white hover:bg-zinc-900 active:scale-95 transition-all text-xs font-extrabold h-11 rounded-full flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#F27D26]" />
            <span>Deposit</span>
          </button>
          <button
            onClick={onOpenWithdraw}
            className="flex-1 bg-white/20 hover:bg-white/30 active:scale-95 text-black transition-all text-xs font-extrabold h-11 rounded-full flex items-center justify-center gap-1.5 backdrop-blur-md cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Withdraw</span>
          </button>
        </div>
      </div>

      {/* Quick Actions Grid (OPay-Inspired Compact Grid) */}
      <div className="bg-[#141414] border border-white/5 rounded-2xl p-4">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
          Quick Actions
        </p>
        <div className="grid grid-cols-6 gap-2">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            if (action.isButton) {
              return (
                <button
                  key={idx}
                  onClick={action.action}
                  className="flex flex-col items-center gap-1.5 group cursor-pointer"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#1D1D1D] border border-white/5 flex items-center justify-center text-[#F27D26] group-hover:border-[#F27D26]/50 group-hover:bg-[#F27D26]/10 group-active:scale-95 transition-all shadow-sm">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-300 group-hover:text-white truncate max-w-full">
                    {action.label}
                  </span>
                </button>
              );
            } else {
              return (
                <Link
                  key={idx}
                  to={action.path!}
                  className="flex flex-col items-center gap-1.5 group cursor-pointer"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#1D1D1D] border border-white/5 flex items-center justify-center text-[#F27D26] group-hover:border-[#F27D26]/50 group-hover:bg-[#F27D26]/10 group-active:scale-95 transition-all shadow-sm">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-300 group-hover:text-white truncate max-w-full">
                    {action.label}
                  </span>
                </Link>
              );
            }
          })}
        </div>
      </div>

      {/* Dashboard Statistics (Compact 2-Column Responsive Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Total Earnings"
          value={`₦${(user?.totalEarnings || 0).toLocaleString()}`}
          subtitle="Lifetime balance"
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
          subtitle={`₦${bonusAmount} per referral`}
          icon={Sparkles}
        />
        <StatCard
          title="Referral Code"
          value={user?.referralCode || 'NIVO123'}
          subtitle={copiedCode ? 'Code copied!' : 'Click to copy code'}
          icon={Copy}
          onClick={copyReferralCode}
        />
      </div>

      {/* Referral Card & Daily Tasks Grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Referral Program Compact Card */}
        <div className="lg:col-span-2 bg-[#141414] border border-white/5 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#F27D26]" />
                <span>Referral Earnings</span>
              </h3>
              <span className="text-[#F27D26] text-[10px] font-extrabold bg-[#F27D26]/10 px-2.5 py-0.5 rounded-full border border-[#F27D26]/20">
                ₦{bonusAmount.toLocaleString()} / REGISTRATION
              </span>
            </div>

            <p className="text-[11px] text-gray-400 mb-3">
              Share your link or referral code to earn instant cash directly into your wallet.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="bg-[#1A1A1A] border border-white/5 p-2.5 rounded-xl flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <span className="text-[9px] text-gray-400 font-bold uppercase block">Referral Link</span>
                  <span className="text-xs text-white truncate block">{user?.referralLink}</span>
                </div>
                <button
                  onClick={copyReferralLink}
                  className="bg-[#F27D26]/10 text-[#F27D26] hover:bg-[#F27D26] hover:text-black text-[10px] font-bold px-2.5 py-1 rounded-lg shrink-0 transition-all cursor-pointer"
                >
                  {copiedLink ? 'COPIED' : 'COPY'}
                </button>
              </div>

              <div className="bg-[#1A1A1A] border border-white/5 p-2.5 rounded-xl flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <span className="text-[9px] text-gray-400 font-bold uppercase block">Referral Code</span>
                  <span className="text-xs text-white font-mono font-bold block">{user?.referralCode}</span>
                </div>
                <button
                  onClick={copyReferralCode}
                  className="bg-[#F27D26]/10 text-[#F27D26] hover:bg-[#F27D26] hover:text-black text-[10px] font-bold px-2.5 py-1 rounded-lg shrink-0 transition-all cursor-pointer"
                >
                  {copiedCode ? 'COPIED' : 'COPY'}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-medium text-gray-400">
            <span>Instant payouts on verified referrals</span>
            <Link to="/referrals" className="text-[#F27D26] hover:underline flex items-center gap-1 font-bold">
              <span>Analytics</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Quick Tasks Widget */}
        <div className="bg-[#141414] border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-[#F27D26]" />
                <span>Daily Tasks</span>
              </h3>
              <Link to="/tasks" className="text-[11px] font-bold text-[#F27D26] hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-2">
              {tasks.length === 0 ? (
                <p className="text-xs text-gray-500 py-3 text-center">Loading tasks...</p>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-2.5 bg-[#1A1A1A] rounded-xl border border-white/5 flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-semibold text-white truncate">{task.title}</p>
                      <p className="text-[10px] text-[#F27D26] font-bold">+₦{task.rewardAmount}</p>
                    </div>
                    {task.completed ? (
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                        Done
                      </span>
                    ) : (
                      <Link
                        to="/tasks"
                        className="text-[10px] font-bold bg-[#F27D26] hover:bg-[#E6721F] text-black px-2.5 py-1 rounded-lg shrink-0"
                      >
                        Start
                      </Link>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-white/5 text-center">
            <Link to="/tasks" className="text-[11px] font-semibold text-gray-400 hover:text-white">
              Complete tasks & earn daily rewards ➔
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="bg-[#141414] border border-white/5 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white">Recent Activity</h3>
          <Link to="/history" className="text-[11px] font-bold text-[#F27D26] hover:underline">
            View All
          </Link>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-xs">No activity recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 font-bold uppercase text-[9px]">
                  <th className="py-2 px-2">Type</th>
                  <th className="py-2 px-2">Description</th>
                  <th className="py-2 px-2">Amount</th>
                  <th className="py-2 px-2">Status</th>
                  <th className="py-2 px-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium text-gray-300">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5 px-2 uppercase text-[9px] font-bold text-[#F27D26]">
                      {tx.type.replace('_', ' ')}
                    </td>
                    <td className="py-2.5 px-2 font-medium text-white truncate max-w-[150px]">{tx.description}</td>
                    <td className="py-2.5 px-2 font-bold text-white">₦{tx.amount.toLocaleString()}</td>
                    <td className="py-2.5 px-2">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          tx.status === 'completed' || tx.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : tx.status === 'pending'
                            ? 'bg-[#F27D26]/10 text-[#F27D26] border border-[#F27D26]/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-gray-400 text-[10px]">
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

