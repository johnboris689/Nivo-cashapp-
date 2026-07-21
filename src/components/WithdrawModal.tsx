import React, { useState } from 'react';
import { X, ArrowUpRight, AlertCircle, Lock, Users, CreditCard, ArrowRight, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Link, useNavigate } from 'react-router-dom';

interface WithdrawModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({ onClose, onSuccess }) => {
  const { user, settings, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [amount, setAmount] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const minWithdrawal = settings?.minWithdrawal || 2000;
  const activationFee = settings?.activationFeeAmount || 520;

  const currentRefs = user?.totalReferrals || 0;
  const isActivated = !!user?.activationPaid;
  const isWithdrawalLocked = currentRefs < 5 || !isActivated;

  const popularBanks = [
    'Access Bank',
    'Guaranty Trust Bank (GTBank)',
    'First Bank of Nigeria',
    'Zenith Bank',
    'United Bank for Africa (UBA)',
    'Kuda Bank',
    'OPay',
    'Palmpay',
    'Moniepoint',
    'Fidelity Bank',
    'Stanbic IBTC',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isWithdrawalLocked) {
      setError(`Withdrawal locked. You must invite 5 real referrals (Current: ${currentRefs}/5) and pay your ₦${activationFee} activation fee.`);
      return;
    }

    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount < minWithdrawal) {
      setError(`Minimum withdrawal amount is ₦${minWithdrawal.toLocaleString()}`);
      return;
    }

    if (user && user.walletBalance < numAmount) {
      setError(`Insufficient wallet balance. You currently have ₦${user.walletBalance.toLocaleString()}`);
      return;
    }

    if (!bankName || !accountNumber || !accountName) {
      setError('Please fill in all bank details.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.submitWithdrawal({
        amount: numAmount,
        bankName,
        accountNumber,
        accountName,
      });
      await refreshUser();
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to process withdrawal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#141414] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isWithdrawalLocked ? 'bg-amber-500/10 text-amber-500' : 'bg-[#F27D26]/10 text-[#F27D26]'}`}>
              {isWithdrawalLocked ? <Lock className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Withdraw Earnings</h3>
              <p className="text-xs text-gray-400">
                {isWithdrawalLocked ? 'Activation Required' : 'Bank Transfer Payout'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-5">
          {/* Balance info banner */}
          <div className="bg-black/40 border border-white/5 p-3.5 rounded-2xl flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-400 font-medium">Available Balance</p>
              <p className="text-lg font-bold text-[#F27D26]">
                ₦{user?.walletBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <span className="text-[10px] text-gray-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
              Min: ₦{minWithdrawal.toLocaleString()}
            </span>
          </div>

          {/* WITHDRAWAL LOCKED WARNING BOX */}
          {isWithdrawalLocked ? (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 space-y-4">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-black text-amber-400">Withdrawal Locked</h4>
                  <p className="text-xs text-amber-200/90 mt-1 leading-relaxed">
                    Complete the following mandatory requirements before processing your withdrawal:
                  </p>
                </div>
              </div>

              <div className="space-y-2 bg-[#171b26] p-3.5 rounded-xl border border-zinc-800 text-xs">
                {/* Rule 1: 5 Referrals */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-zinc-400" />
                    <span className="text-zinc-300 font-medium">1. Invite 5 successful referrals</span>
                  </div>
                  <span className={`font-black px-2 py-0.5 rounded text-[11px] ${
                    currentRefs >= 5 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {currentRefs} / 5 {currentRefs >= 5 ? '✅' : '❌'}
                  </span>
                </div>

                {/* Rule 2: Activation Fee ₦520 */}
                <div className="flex items-center justify-between border-t border-zinc-800/60 pt-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-zinc-400" />
                    <span className="text-zinc-300 font-medium">2. Pay ₦{activationFee} activation fee</span>
                  </div>
                  <span className={`font-black px-2 py-0.5 rounded text-[11px] ${
                    isActivated ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {isActivated ? 'Paid ✅' : 'Not Paid ❌'}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {!isActivated && (
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/activation');
                    }}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pay ₦{activationFee} Activation Fee</span>
                  </button>
                )}

                {currentRefs < 5 && (
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/referrals');
                    }}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs py-3 rounded-xl border border-zinc-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>Invite Friends ({currentRefs}/5)</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">
                  Withdrawal Amount (₦) *
                </label>
                <input
                  type="number"
                  required
                  min={minWithdrawal}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`Min ₦${minWithdrawal}`}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white text-sm font-bold focus:outline-none focus:border-[#F27D26] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">
                  Select Bank *
                </label>
                <select
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#F27D26] transition-colors"
                >
                  <option value="" className="bg-[#141414] text-white">Select your bank</option>
                  {popularBanks.map((b) => (
                    <option key={b} value={b} className="bg-[#141414] text-white">
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">
                  Account Number *
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit account number"
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white text-sm font-mono tracking-widest focus:outline-none focus:border-[#F27D26] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">
                  Account Name *
                </label>
                <input
                  type="text"
                  required
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Account holder full name"
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#F27D26] transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#F27D26] hover:bg-[#E6721F] disabled:opacity-50 text-black font-bold text-sm py-3.5 rounded-xl shadow-lg shadow-orange-950/20 transition-all cursor-pointer mt-2"
              >
                {loading ? 'Processing Withdrawal...' : 'Submit Withdrawal Request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
