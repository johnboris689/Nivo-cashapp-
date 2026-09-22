import React, { useState } from 'react';
import { ShieldCheck, Lock, Users, ArrowRight, CheckCircle2, Wallet, PlusCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Link, useNavigate } from 'react-router-dom';
import { DepositModal } from '../components/DepositModal';

export const ActivationPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [eligibility, setEligibility] = useState({ successfulReferrals: 0, verifiedDeposit: false, canWithdraw: false });

  React.useEffect(() => {
    api.getTransactionEligibility().then((status) => setEligibility({
      successfulReferrals: Number(status.successfulReferrals || 0),
      verifiedDeposit: Boolean(status.verifiedDeposit),
      canWithdraw: Boolean(status.canWithdraw),
    })).catch(() => {});
  }, [user]);

  const currentRefs = eligibility.successfulReferrals;
  const isActivated = eligibility.verifiedDeposit;
  const isFullyUnlocked = eligibility.canWithdraw;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#071114] via-[#16090D] to-[#16090D] border border-[#00C9A7]/20 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00C9A7]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00C9A7]/10 border border-[#00C9A7]/30 text-[#C13A5A] text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              Withdrawal Access Requirements
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Withdrawal Access
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Withdrawal access is unlocked in two stages. First complete 5 successful referrals. After that, verified wallet funding is required.
            </p>
          </div>

          <div className="bg-[#16090D]/80 border border-zinc-800 p-4 rounded-2xl flex items-center gap-3 w-full md:w-auto shrink-0">
            {isFullyUnlocked ? (
              <div className="flex items-center gap-3 text-[#00BFA6]">
                <div className="w-10 h-10 rounded-xl bg-[#00C9A7]/20 border border-[#00C9A7]/30 flex items-center justify-center font-black">
                  <CheckCircle2 className="w-6 h-6 text-[#00BFA6]" />
                </div>
                <div>
                  <p className="text-xs font-black text-white">WITHDRAWAL ACCESS UNLOCKED</p>
                  <p className="text-[11px] text-[#00BFA6]">Withdrawals fully unlocked</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-[#C13A5A]">
                <div className="w-10 h-10 rounded-xl bg-[#00C9A7]/20 border border-[#00C9A7]/30 flex items-center justify-center font-black">
                  <Lock className="w-5 h-5 text-[#C13A5A]" />
                </div>
                <div>
                  <p className="text-xs font-black text-white">WITHDRAWAL LOCKED</p>
                  <p className="text-[11px] text-[#C13A5A]/90">
                    {currentRefs < 5 ? '5 Successful Referrals Required' : isActivated ? 'Withdrawal Access Unlocked' : 'Verified ₦520+ Deposit Required'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* STATE 1: REFERRALS INCOMPLETE (< 5) */}
      {currentRefs < 5 && (
        <div className="nivo-glass-surface border border-zinc-800 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 rounded-3xl bg-[#00C9A7]/10 border border-[#00C9A7]/20 text-[#C13A5A] flex items-center justify-center mx-auto shadow-lg">
            <Users className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <span className="text-xs font-extrabold text-[#C13A5A] uppercase tracking-widest bg-[#00C9A7]/10 border border-[#00C9A7]/20 px-3 py-1 rounded-full">
              Referral Requirement Pending ({currentRefs} / 5)
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white pt-2">
              Complete 5 successful referrals to unlock the next withdrawal step.
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Share your unique referral link with friends or family. Once 5 referrals are successfully completed, the next withdrawal step will automatically unlock.
            </p>
          </div>

          {/* Referral Counter Progress Bar */}
          <div className="max-w-md mx-auto nivo-glass-surface p-4 rounded-2xl border border-zinc-800 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-zinc-400">Referral Progress</span>
              <span className="text-[#C13A5A] font-mono font-black">{currentRefs} / 5</span>
            </div>
            <div className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-[#00C9A7] to-[#00C9A7] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min((currentRefs / 5) * 100, 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-zinc-500 text-right">
              Need {Math.max(0, 5 - currentRefs)} more referral{5 - currentRefs === 1 ? '' : 's'}
            </p>
          </div>

          <Link
            to="/referrals"
            className="inline-flex items-center justify-center gap-2 bg-[#00C9A7] hover:bg-[#008F7A] text-black font-extrabold text-xs px-8 py-4 rounded-2xl shadow-xl shadow-[#00C9A7]/20 transition-all cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>Invite Friends & Get Referral Link</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* STATE 2: REFERRALS COMPLETED (>= 5), BUT DEPOSIT PENDING (!isActivated) */}
      {currentRefs >= 5 && !isActivated && (
        <div className="nivo-glass-surface border border-[#00C9A7]/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl animate-fade-in">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#00C9A7]/20 text-[#00BFA6] border border-[#00C9A7]/30 flex items-center justify-center font-black text-xl shrink-0">
              ✓
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-[#00BFA6] uppercase tracking-widest bg-[#00C9A7]/10 border border-[#00C9A7]/20 px-2.5 py-0.5 rounded-full">
                Referral Goal Reached (5/5 ✅)
              </span>
              <h2 className="text-xl font-black text-white mt-1">Complete Withdrawal Access Verification</h2>
            </div>
          </div>

          <div className="nivo-glass-surface border border-[#00C9A7]/20 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-[#C13A5A] font-extrabold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Final Step: Verified Wallet Deposit (₦520 Minimum)</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Make a verified KoraPay wallet deposit of at least <strong>₦520</strong>. This deposit is <strong>not an activation fee</strong>; it is real wallet funding credited to your balance.
            </p>

            <ul className="text-xs text-zinc-400 space-y-2 pt-2 border-t border-zinc-800">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00BFA6]" />
                <span><strong>100% Retained:</strong> Your ₦520 goes directly into your wallet balance. Nothing is deducted!</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00BFA6]" />
                <span><strong>Instant & Automatic:</strong> After KoraPay confirms your verified wallet deposit, the requirement is recorded automatically.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00BFA6]" />
                <span><strong>Your Money:</strong> The deposit remains in your wallet and can be withdrawn once the normal withdrawal requirements are met.</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => setShowDepositModal(true)}
            className="w-full bg-[#00C9A7] hover:bg-[#008F7A] text-black font-black text-sm py-4 rounded-2xl shadow-xl shadow-[#00C9A7]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Deposit ₦520+ via KoraPay</span>
          </button>
        </div>
      )}

      {/* STATE 3: FULLY ACTIVATED */}
      {isFullyUnlocked && (
        <div className="bg-[#071114]/20 border border-[#00C9A7]/30 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-xl">
          <div className="w-20 h-20 rounded-full bg-[#00C9A7]/20 text-[#00BFA6] border border-[#00C9A7]/30 flex items-center justify-center mx-auto text-2xl font-bold shadow-2xl">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>

          <div className="space-y-1 max-w-lg mx-auto">
            <h2 className="text-2xl font-black text-white">Your Withdrawal Access is Unlocked!</h2>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Your 5 successful referrals and verified KoraPay wallet deposit have been confirmed. Withdrawal access is now unlocked, subject to the normal withdrawal limits.
            </p>
          </div>

          <button
            onClick={() => navigate('/wallet')}
            className="inline-flex items-center gap-2 bg-[#00C9A7] hover:bg-[#00BFA6] text-black font-black text-xs px-8 py-3.5 rounded-2xl shadow-xl transition-all cursor-pointer"
          >
            <Wallet className="w-4 h-4" />
            <span>Go to Wallet & Request Withdrawal</span>
          </button>
        </div>
      )}

      {/* Deposit Modal Modal */}
      {showDepositModal && (
        <DepositModal
          onClose={() => setShowDepositModal(false)}
          onSuccess={() => {
            setShowDepositModal(false);
            refreshUser();
          }}
        />
      )}
    </div>
  );
};
