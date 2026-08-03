import React, { useState } from 'react';
import { ShieldCheck, Lock, Users, ArrowRight, CheckCircle2, Wallet, PlusCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { DepositModal } from '../components/DepositModal';

export const ActivationPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [showDepositModal, setShowDepositModal] = useState(false);

  const currentRefs = user?.totalReferrals || 0;
  const isActivated = !!user?.activationPaid;
  const isFullyUnlocked = currentRefs >= 5 && isActivated;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#181d2a] via-[#11141c] to-[#0d0f17] border border-amber-500/20 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              Account Verification & Activation
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Withdrawal Activation System
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              To keep Nivo Cash secure and prevent duplicate bot accounts, withdrawal access requires completing referral targets and automated wallet funding.
            </p>
          </div>

          <div className="bg-[#11141c]/80 border border-zinc-800 p-4 rounded-2xl flex items-center gap-3 w-full md:w-auto shrink-0">
            {isFullyUnlocked ? (
              <div className="flex items-center gap-3 text-emerald-400">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-black">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-black text-white">ACCOUNT ACTIVATED</p>
                  <p className="text-[11px] text-emerald-400">Withdrawals fully unlocked</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-amber-400">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-black">
                  <Lock className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs font-black text-white">WITHDRAWAL LOCKED</p>
                  <p className="text-[11px] text-amber-400/90">
                    {currentRefs < 5 ? '5 Referrals Required' : '₦520 Deposit Required'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* STATE 1: REFERRALS INCOMPLETE (< 5) */}
      {currentRefs < 5 && (
        <div className="bg-[#11141c] border border-zinc-800 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-lg">
            <Users className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <span className="text-xs font-extrabold text-amber-400 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
              Referral Requirement Pending ({currentRefs} / 5)
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white pt-2">
              You need 5 successful referrals before account activation.
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Share your unique referral link with friends or family. Once 5 people register using your link, Step 2 will automatically unlock!
            </p>
          </div>

          {/* Referral Counter Progress Bar */}
          <div className="max-w-md mx-auto bg-[#171b26] p-4 rounded-2xl border border-zinc-800 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-zinc-400">Referral Progress</span>
              <span className="text-amber-400 font-mono font-black">{currentRefs} / 5</span>
            </div>
            <div className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-amber-500 to-[#F27D26] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min((currentRefs / 5) * 100, 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-zinc-500 text-right">
              Need {Math.max(0, 5 - currentRefs)} more referral{5 - currentRefs === 1 ? '' : 's'}
            </p>
          </div>

          <Link
            to="/referrals"
            className="inline-flex items-center justify-center gap-2 bg-[#F27D26] hover:bg-[#e06c19] text-black font-extrabold text-xs px-8 py-4 rounded-2xl shadow-xl shadow-[#F27D26]/20 transition-all cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>Invite Friends & Get Referral Link</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* STATE 2: REFERRALS COMPLETED (>= 5), BUT DEPOSIT PENDING (!isActivated) */}
      {currentRefs >= 5 && !isActivated && (
        <div className="bg-[#11141c] border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl animate-fade-in">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-xl shrink-0">
              ✓
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                Referral Goal Reached (5/5 ✅)
              </span>
              <h2 className="text-xl font-black text-white mt-1">Activate Your Account</h2>
            </div>
          </div>

          <div className="bg-[#171b26] border border-amber-500/20 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Final Step: First Wallet Deposit (₦520 Minimum)</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              To activate withdrawals, make a minimum deposit of <strong>₦520</strong>. This deposit is <strong>not a fee</strong>. It is simply your first wallet funding transaction.
            </p>

            <ul className="text-xs text-zinc-400 space-y-2 pt-2 border-t border-zinc-800">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span><strong>100% Retained:</strong> Your ₦520 goes directly into your wallet balance. Nothing is deducted!</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span><strong>Instant & Automatic:</strong> As soon as Paystack confirms your DVA transfer, your account activates automatically.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span><strong>Permanent Access:</strong> Once activated, withdrawal access remains unlocked permanently.</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => setShowDepositModal(true)}
            className="w-full bg-[#F27D26] hover:bg-[#e06c19] text-black font-black text-sm py-4 rounded-2xl shadow-xl shadow-[#F27D26]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Deposit ₦520 via Paystack Virtual Account</span>
          </button>
        </div>
      )}

      {/* STATE 3: FULLY ACTIVATED */}
      {isFullyUnlocked && (
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-xl">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto text-2xl font-bold shadow-2xl">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>

          <div className="space-y-1 max-w-lg mx-auto">
            <h2 className="text-2xl font-black text-white">Your Account is Activated!</h2>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Your 5 referrals and Paystack DVA wallet deposit have been verified. You have full access to instant bank withdrawals.
            </p>
          </div>

          <button
            onClick={() => navigate('/wallet')}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs px-8 py-3.5 rounded-2xl shadow-xl transition-all cursor-pointer"
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
