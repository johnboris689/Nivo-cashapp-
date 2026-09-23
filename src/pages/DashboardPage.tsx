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
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { ShareModal } from '../components/ShareModal';
import { Transaction, Task } from '../types';
import { api } from '../lib/api';
import confetti from 'canvas-confetti';

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
  const [copiedLink, setCopiedLink] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [paymentNotice, setPaymentNotice] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

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

    // Check for payment callback from KoraPay
    const searchParams = new URLSearchParams(window.location.search);
    const ref = searchParams.get('reference') || searchParams.get('trxref') || searchParams.get('tx_ref');

    if (ref) {
      const verifyCallback = async () => {
        setPaymentNotice({ type: 'info', message: 'Verifying payment with gateway...' });
        try {
          const res = await api.verifyPayment(ref);
          if (res.status === 'approved') {
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.6 },
              colors: ['#071114', '#008F7A', '#00C9A7', '#7EE8D3'],
            });
            await refreshUser();
            await fetchData();
            setPaymentNotice({
              type: 'success',
              message: res.message || 'Payment successfully verified! Your wallet has been credited.',
            });
          } else {
            setPaymentNotice({
              type: 'info',
              message: res.message || 'Payment is being processed by the gateway.',
            });
          }
        } catch (err: any) {
          setPaymentNotice({
            type: 'error',
            message: err.message || 'Payment verification could not be completed.',
          });
        } finally {
          // Clean URL without reloading page
          window.history.replaceState({}, '', window.location.pathname);
          setTimeout(() => setPaymentNotice(null), 8000);
        }
      };

      verifyCallback();
    }
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
    <div className="space-y-4 animate-fade-in pb-20">
      {/* Greeting Banner */}
      <div className="flex items-center justify-between nivo-glass-surface px-4 py-3.5 rounded-2xl border border-white/10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#008F7A] to-[#7EE8D3] text-white flex items-center justify-center font-black text-sm shadow-md shadow-[#00C9A7]/20 border border-[#7EE8D3]/30">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <span>Hi, {user?.fullName?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-[11px] text-slate-400">Welcome to Nevo</p>
          </div>
        </div>
        <span className="bg-[#00C9A7]/10 text-[#00C9A7] text-[10px] font-bold px-3 py-1 rounded-full border border-[#00C9A7]/20 flex items-center gap-1.5 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5" />
          Verified
        </span>
      </div>

      {/* Payment Callback Notification Banner */}
      {paymentNotice && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold animate-fade-in shadow-xl ${
            paymentNotice.type === 'success'
              ? 'bg-[#00C9A7]/15 border-[#00C9A7]/30 text-[#7EE8D3]'
              : paymentNotice.type === 'error'
              ? 'bg-[#00C9A7]/15 border-[#00C9A7]/30 text-[#7EE8D3]'
              : 'bg-[#00C9A7]/15 border-[#00C9A7]/30 text-[#7EE8D3]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {paymentNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#00C9A7] shrink-0" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-[#7EE8D3] shrink-0" />
            )}
            <span>{paymentNotice.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setPaymentNotice(null)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>
      )}

      {/* Nivo Wallet Balance Card — compact glass fintech presentation */}
      <div className="nivo-glass-strong w-full rounded-[24px] p-4 sm:p-5 text-white shadow-2xl relative overflow-hidden border border-[#7EE8D3]/25">
        {/* Card Decorative Blurs & Accents */}
        <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-[#7EE8D3]/12 blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-36 h-36 rounded-full bg-[#00C9A7]/10 blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <span className="text-[11px] font-bold text-[#7EE8D3]/90 uppercase tracking-wider">
            Wallet Balance
          </span>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="flex items-center gap-1.5 bg-black/20 hover:bg-black/30 text-white text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-md transition-all cursor-pointer border border-white/10"
          >
            {showBalance ? <EyeOff className="w-3.5 h-3.5 text-[#7EE8D3]" /> : <Eye className="w-3.5 h-3.5 text-[#7EE8D3]" />}
            <span>{showBalance ? 'Hide' : 'Show'}</span>
          </button>
        </div>

        <div className="my-3.5 flex items-center justify-between flex-wrap gap-3 relative z-10">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight font-mono drop-shadow-md">
            {showBalance
              ? `₦${user?.walletBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 }) || '0.00'}`
              : '••••••••'}
          </h2>
          <div className="text-right bg-black/20 px-3 py-1.5 rounded-xl border border-white/10 shrink-0">
            <span className="text-[10px] font-bold text-[#7EE8D3] uppercase block">Total Earned</span>
            <span className="text-xs font-black text-white">
              ₦{user?.totalEarnings.toLocaleString() || '0.00'}
            </span>
          </div>
        </div>

        {/* Action Pill Buttons */}
        <div className="flex items-center gap-2.5 mt-4 pt-3.5 border-t border-white/10 relative z-10">
          <button
            onClick={onOpenDeposit}
            className="flex-1 bg-white text-slate-950 hover:bg-slate-100 active:scale-95 transition-all text-xs font-black h-10 rounded-xl flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#008F7A]" />
            <span>Deposit</span>
          </button>
          <button
            onClick={onOpenWithdraw}
            className="flex-1 bg-black/30 hover:bg-black/40 border border-white/20 active:scale-95 text-white transition-all text-xs font-black h-10 rounded-xl flex items-center justify-center gap-2 backdrop-blur-md cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4 text-[#7EE8D3]" />
            <span>Withdraw</span>
          </button>
        </div>
      </div>

      {/* Quick Actions Grid (Evenly Spaced 6-Column) */}
      <div className="nivo-glass-surface border border-white/10 rounded-3xl p-4 sm:p-5 shadow-xl">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3.5 px-1">
          Quick Actions
        </p>
        <div className="grid grid-cols-6 gap-2 sm:gap-3">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            if (action.isButton) {
              return (
                <button
                  key={idx}
                  onClick={action.action}
                  className="flex flex-col items-center gap-2 group cursor-pointer"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl nivo-glass-surface border border-[#00C9A7]/20 flex items-center justify-center text-[#7EE8D3] group-hover:border-[#7EE8D3]/50 group-hover:bg-[#008F7A]/20 group-hover:text-white group-active:scale-95 transition-all shadow-md">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-300 group-hover:text-white truncate max-w-full">
                    {action.label}
                  </span>
                </button>
              );
            } else {
              return (
                <Link
                  key={idx}
                  to={action.path!}
                  className="flex flex-col items-center gap-2 group cursor-pointer"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl nivo-glass-surface border border-[#00C9A7]/20 flex items-center justify-center text-[#7EE8D3] group-hover:border-[#7EE8D3]/50 group-hover:bg-[#008F7A]/20 group-hover:text-white group-active:scale-95 transition-all shadow-md">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-300 group-hover:text-white truncate max-w-full">
                    {action.label}
                  </span>
                </Link>
              );
            }
          })}
        </div>
      </div>

      {/* Dashboard Statistics */}
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
        <div className="lg:col-span-2 nivo-glass-surface border border-white/10 rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-xl">
          <div>
            <div className="flex justify-between items-center mb-3.5">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#7EE8D3]" />
                <span>Referral Earnings</span>
              </h3>
              <span className="text-[#7EE8D3] text-[10px] font-black bg-[#00C9A7]/10 px-3 py-1 rounded-full border border-[#00C9A7]/30">
                ₦{bonusAmount.toLocaleString()} / REGISTRATION
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mb-3.5 leading-relaxed">
              Share your link or referral code to earn instant cash directly into your wallet upon signup.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="nivo-glass-surface border border-[#00C9A7]/20 p-3 rounded-2xl flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Referral Link</span>
                  <span className="text-xs text-white truncate block">{user?.referralLink}</span>
                </div>
                <button
                  onClick={copyReferralLink}
                  className="bg-[#00C9A7]/10 text-[#7EE8D3] hover:bg-[#7EE8D3] hover:text-slate-950 text-[10px] font-black px-3 py-1.5 rounded-xl shrink-0 transition-all cursor-pointer border border-[#00C9A7]/20"
                >
                  {copiedLink ? 'COPIED' : 'COPY'}
                </button>
              </div>

              <div className="nivo-glass-surface border border-[#00C9A7]/20 p-3 rounded-2xl flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Referral Code</span>
                  <span className="text-xs text-white font-mono font-bold block">{user?.referralCode}</span>
                </div>
                <button
                  onClick={copyReferralCode}
                  className="bg-[#00C9A7]/10 text-[#7EE8D3] hover:bg-[#7EE8D3] hover:text-slate-950 text-[10px] font-black px-3 py-1.5 rounded-xl shrink-0 transition-all cursor-pointer border border-[#00C9A7]/20"
                >
                  {copiedCode ? 'COPIED' : 'COPY'}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-medium text-slate-400">
            <span>Instant payouts on verified referrals</span>
            <Link to="/referrals" className="text-[#7EE8D3] hover:underline flex items-center gap-1 font-bold">
              <span>Analytics</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Quick Tasks Widget */}
        <div className="nivo-glass-surface border border-white/10 rounded-3xl p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-[#7EE8D3]" />
                <span>Daily Tasks</span>
              </h3>
              <Link to="/tasks" className="text-[11px] font-bold text-[#7EE8D3] hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-2">
              {tasks.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">Loading tasks...</p>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 nivo-glass-surface rounded-2xl border border-white/10 flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-white truncate">{task.title}</p>
                      <p className="text-[10px] text-[#7EE8D3] font-black">+₦{task.rewardAmount}</p>
                    </div>
                    {task.completed ? (
                      <span className="text-[9px] font-bold text-[#00C9A7] bg-[#00C9A7]/10 px-2.5 py-1 rounded-full border border-[#00C9A7]/20 shrink-0">
                        Done
                      </span>
                    ) : (
                      <Link
                        to="/tasks"
                        className="text-[10px] font-black bg-gradient-to-r from-[#008F7A] to-[#00C9A7] hover:from-[#00C9A7] hover:to-[#7EE8D3] text-white px-3 py-1.5 rounded-xl shrink-0"
                      >
                        Start
                      </Link>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 text-center">
            <Link to="/tasks" className="text-[11px] font-semibold text-slate-400 hover:text-white">
              Complete tasks & earn daily rewards ➔
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="nivo-glass-surface border border-white/10 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-sm font-extrabold text-white">Recent Transactions</h3>
          <Link to="/history" className="text-[11px] font-bold text-[#7EE8D3] hover:underline">
            View All
          </Link>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">No activity recorded yet.</div>
        ) : (
          <div className="space-y-2.5">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="p-3.5 rounded-2xl nivo-glass-surface border border-white/5 flex items-center justify-between hover:border-[#00C9A7]/30 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.type.includes('deposit') || tx.type.includes('bonus') || tx.type.includes('reward')
                        ? 'bg-[#00C9A7]/10 text-[#00C9A7] border border-[#00C9A7]/20'
                        : 'bg-[#00C9A7]/10 text-[#7EE8D3] border border-[#00C9A7]/20'
                    }`}
                  >
                    {tx.type.includes('deposit') || tx.type.includes('bonus') || tx.type.includes('reward') ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-white truncate">{tx.description}</p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs font-black text-white">₦{tx.amount.toLocaleString()}</p>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                      tx.status === 'completed' || tx.status === 'approved'
                        ? 'bg-[#00C9A7]/10 text-[#00C9A7] border border-[#00C9A7]/20'
                        : tx.status === 'pending'
                        ? 'bg-[#00C9A7]/10 text-[#7EE8D3] border border-[#00C9A7]/20'
                        : 'bg-[#00C9A7]/10 text-[#7EE8D3] border border-[#00C9A7]/20'
                    }`}
                  >
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showShareModal && <ShareModal onClose={() => setShowShareModal(false)} />}
    </div>
  );
};
