import React, { useState, useEffect } from 'react';
import { ShieldCheck, Copy, Check, AlertCircle, Clock, Lock, ArrowRight, Sparkles, Users, CreditCard, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { BankDetails, ActivationRequest } from '../types';
import { Link } from 'react-router-dom';

export const ActivationPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [bank, setBank] = useState<BankDetails | null>(null);
  const [activationReq, setActivationReq] = useState<ActivationRequest | null>(null);
  const [feeAmount, setFeeAmount] = useState<number>(520);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [senderName, setSenderName] = useState<string>('');
  const [paymentProofRef, setPaymentProofRef] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bankData, actStatus] = await Promise.all([
        api.getBankDetails(),
        api.getActivationStatus(),
      ]);
      setBank(bankData);
      setActivationReq(actStatus.request || null);
      if (actStatus.feeAmount) setFeeAmount(actStatus.feeAmount);
    } catch (err) {
      console.error('Error loading activation page data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (!senderName.trim() || !paymentProofRef.trim()) {
      setMsg({ type: 'error', text: 'Please fill in both your sender account name and transaction reference.' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.submitActivationPayment(senderName.trim(), paymentProofRef.trim());
      setMsg({ type: 'success', text: res.message });
      setActivationReq(res.activation);
      refreshUser();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to submit activation payment.' });
    } finally {
      setSubmitting(false);
    }
  };

  const currentRefs = user?.totalReferrals || 0;
  const isActivated = !!user?.activationPaid;
  const isFullyEligible = currentRefs >= 5 && isActivated;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-zinc-400">
        <Clock className="w-8 h-8 animate-spin text-amber-500 mb-2" />
        <p className="text-xs font-semibold">Loading activation details...</p>
      </div>
    );
  }

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
              To keep our platform secure and prevent automated bot abuse, all users must satisfy two simple requirements before submitting withdrawal requests.
            </p>
          </div>

          <div className="bg-[#11141c]/80 border border-zinc-800 p-4 rounded-2xl flex items-center gap-3 w-full md:w-auto">
            {isFullyEligible ? (
              <div className="flex items-center gap-3 text-emerald-400">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-black">
                  ✓
                </div>
                <div>
                  <p className="text-xs font-black text-white">ACCOUNT UNLOCKED</p>
                  <p className="text-[11px] text-emerald-400">Ready for instant withdrawals</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-amber-400">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-black">
                  <Lock className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs font-black text-white">WITHDRAWAL LOCKED</p>
                  <p className="text-[11px] text-amber-400/90">Requirements pending</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Checklist Progress Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Requirement 1: 5 Referrals */}
        <div className={`p-6 rounded-3xl border transition-all ${
          currentRefs >= 5 
            ? 'bg-emerald-950/20 border-emerald-500/30' 
            : 'bg-[#11141c] border-zinc-800 hover:border-amber-500/30'
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl ${
                currentRefs >= 5 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
              }`}>
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">Requirement 1</span>
                <h3 className="text-sm font-bold text-white">5 Registered Referrals</h3>
              </div>
            </div>

            <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${
              currentRefs >= 5 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-zinc-800 text-amber-400 border border-amber-500/20'
            }`}>
              {currentRefs} / 5
            </span>
          </div>

          <p className="text-xs text-zinc-400 mt-3">
            Invite at least 5 real users using your unique referral link to unlock withdrawal access.
          </p>

          <div className="mt-4 pt-4 border-t border-zinc-800/60 flex items-center justify-between">
            <span className="text-xs text-zinc-400">
              {currentRefs >= 5 ? '✓ 5 real referrals verified' : `Need ${5 - currentRefs} more referral(s)`}
            </span>
            <Link
              to="/referrals"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
            >
              <span>Get Referral Link</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Requirement 2: Activation Fee ₦520 */}
        <div className={`p-6 rounded-3xl border transition-all ${
          isActivated 
            ? 'bg-emerald-950/20 border-emerald-500/30' 
            : activationReq?.status === 'pending'
            ? 'bg-amber-950/20 border-amber-500/30'
            : 'bg-[#11141c] border-zinc-800 hover:border-amber-500/30'
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl ${
                isActivated 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : activationReq?.status === 'pending'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-amber-500/10 text-amber-400'
              }`}>
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">Requirement 2</span>
                <h3 className="text-sm font-bold text-white">₦{feeAmount.toLocaleString()} Activation Fee</h3>
              </div>
            </div>

            <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${
              isActivated 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : activationReq?.status === 'pending'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {isActivated ? 'PAID ✅' : activationReq?.status === 'pending' ? 'PENDING ⏳' : 'NOT PAID ❌'}
            </span>
          </div>

          <p className="text-xs text-zinc-400 mt-3">
            One-time permanent activation fee of ₦{feeAmount.toLocaleString()} required to activate account payouts.
          </p>

          <div className="mt-4 pt-4 border-t border-zinc-800/60 flex items-center justify-between">
            <span className="text-xs text-zinc-400">
              {isActivated ? '✓ Permanent activation confirmed' : activationReq?.status === 'pending' ? 'Awaiting admin verification' : 'Payment required'}
            </span>
            {isActivated && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Active
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Payment & Submission Box (Shown if not yet activated) */}
      {!isActivated && (
        <div className="bg-[#11141c] border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-zinc-800 pb-4">
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-500" />
              Pay ₦{feeAmount.toLocaleString()} Activation Fee
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Transfer exactly ₦{feeAmount.toLocaleString()} to the official Nivo Cash account details below, then enter your sender details.
            </p>
          </div>

          {msg && (
            <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-3 ${
              msg.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              {msg.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{msg.text}</span>
            </div>
          )}

          {/* Official Bank Account Card */}
          {bank && (
            <div className="bg-[#171b26] border border-amber-500/20 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Official Bank Account</span>
                <span className="text-xs font-black text-white bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
                  Amount: ₦{feeAmount.toLocaleString()}
                </span>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] text-zinc-400 block font-medium">Bank Name</label>
                  <p className="text-sm font-extrabold text-white mt-0.5">{bank.bankName}</p>
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block font-medium">Account Name</label>
                  <p className="text-sm font-extrabold text-white mt-0.5">{bank.accountName}</p>
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block font-medium">Account Number</label>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-base font-black text-amber-400 tracking-wider">{bank.accountNumber}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(bank.accountNumber, 'accountNumber')}
                      className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg transition-colors cursor-pointer"
                      title="Copy Account Number"
                    >
                      {copiedField === 'accountNumber' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-zinc-400 italic border-t border-zinc-800/80 pt-3">
                💡 Note: Include your Nivo username <strong className="text-amber-400">@{user?.username}</strong> in bank transfer description if possible.
              </p>
            </div>
          )}

          {/* Submission Form */}
          {activationReq?.status === 'pending' ? (
            <div className="bg-amber-500/10 border border-amber-500/30 p-5 rounded-2xl flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-extrabold text-amber-300">Activation Payment Under Review</h4>
                <p className="text-xs text-amber-200/80 mt-1">
                  We received your submission (Sender: <strong>{activationReq.senderName}</strong>, Ref: <strong>{activationReq.paymentProofRef}</strong>). Our admin team is verifying the payment and your account will be activated shortly.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    Bank Sender Account Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="e.g. John Doe (Name on bank app)"
                    className="w-full bg-[#171b26] border border-zinc-800 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    Transaction Reference / Session ID <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={paymentProofRef}
                    onChange={(e) => setPaymentProofRef(e.target.value)}
                    placeholder="e.g. TXN9876543210 or Receipt Ref"
                    className="w-full bg-[#171b26] border border-zinc-800 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-extrabold text-xs py-3.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{submitting ? 'Submitting Activation Request...' : `Submit ₦${feeAmount.toLocaleString()} Activation Payment`}</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* Activated Success Box */}
      {isActivated && (
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-xl font-bold">
            ✓
          </div>
          <h2 className="text-xl font-black text-white">Your Account is Permanently Activated!</h2>
          <p className="text-xs text-zinc-300 max-w-lg mx-auto">
            Your activation payment of ₦{feeAmount.toLocaleString()} has been confirmed. You now have full access to unlimited instant withdrawals.
          </p>
        </div>
      )}
    </div>
  );
};
