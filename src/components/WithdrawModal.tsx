import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowUpRight,
  AlertCircle,
  Lock,
  Users,
  CreditCard,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Building2,
  Check,
  ChevronLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { WithdrawalSuccessModal, WithdrawalSuccessData } from './WithdrawalSuccessModal';

interface WithdrawModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({ onClose, onSuccess }) => {
  const { user, settings, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Step 1: Account Resolution, Step 2: Amount & Confirmation
  const [step, setStep] = useState<1 | 2>(1);

  const [bankName, setBankName] = useState<string>('');
  const [bankCode, setBankCode] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');

  const [resolving, setResolving] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<WithdrawalSuccessData | null>(null);

  const [bankOptions, setBankOptions] = useState<{ name: string; code: string }[]>([]);

  const minWithdrawal = settings?.minWithdrawal || 2000;
  const activationFee = settings?.activationFeeAmount || 520;
  const withdrawalFee = 0; // ₦0 fee

  const currentRefs = user?.totalReferrals || 0;
  const isActivated = !!user?.activationPaid;
  const isWithdrawalLocked = currentRefs < 5 || !isActivated;

  // Fetch banks on mount
  useEffect(() => {
    async function loadBanks() {
      try {
        const banks = await api.getBanks();
        setBankOptions(banks);
      } catch (err) {
        setBankOptions([
          { name: 'Access Bank', code: '044' },
          { name: 'Guaranty Trust Bank (GTBank)', code: '058' },
          { name: 'Zenith Bank', code: '057' },
          { name: 'First Bank of Nigeria', code: '011' },
          { name: 'United Bank For Africa (UBA)', code: '033' },
          { name: 'Kuda Microfinance Bank', code: '50211' },
          { name: 'OPay Digital Services', code: '999992' },
          { name: 'PalmPay', code: '999991' },
          { name: 'Moniepoint MFB', code: '50515' },
          { name: 'Wema Bank', code: '035' },
          { name: 'Sterling Bank', code: '232' },
          { name: 'FCMB', code: '214' },
        ]);
      }
    }
    loadBanks();
  }, []);

  // Trigger account resolution when 10 digits entered & bank selected
  useEffect(() => {
    setIsVerified(false);
    setAccountName('');
    setError(null);

    if (accountNumber.length === 10 && bankName) {
      handleResolveAccount(accountNumber, bankCode);
    }
  }, [accountNumber, bankName, bankCode]);

  const handleResolveAccount = async (accNum: string, code: string) => {
    setResolving(true);
    setError(null);
    try {
      const res = await api.resolveBankAccount({ accountNumber: accNum, bankCode: code });
      if (res && res.accountName) {
        setAccountName(res.accountName);
        setIsVerified(true);
      } else {
        setError('Invalid bank account.');
        setIsVerified(false);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid bank account. Account resolution failed.');
      setIsVerified(false);
    } finally {
      setResolving(false);
    }
  };

  const handleBankSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    setBankName(selectedName);
    const found = bankOptions.find((b) => b.name === selectedName);
    setBankCode(found ? found.code : '');
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVerified || !accountName) {
      setError('Please verify a valid bank account to proceed.');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleFinalWithdrawal = async (e: React.FormEvent) => {
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
      setError(`Insufficient wallet balance. Available: ₦${user.walletBalance.toLocaleString()}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.submitWithdrawal({
        amount: numAmount,
        bankName,
        accountNumber,
        accountName,
      });

      await refreshUser();

      const now = new Date();
      const reqDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const reqTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      const newBal = (user?.walletBalance || numAmount) - numAmount;
      const wthId = res?.withdrawal?.id || `WTH-${Date.now()}`;

      setSuccessData({
        amount: numAmount,
        recipientName: accountName,
        bankName: bankName,
        accountNumber: accountNumber,
        reference: `WTH-${wthId.slice(0, 8).toUpperCase()}`,
        transactionId: wthId,
        requestDate: reqDate,
        requestTime: reqTime,
        remainingBalance: newBal > 0 ? newBal : 0,
      });

      if (typeof onSuccess === 'function') {
        onSuccess();
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to process withdrawal request.');
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <WithdrawalSuccessModal
        data={successData}
        onClose={() => {
          setSuccessData(null);
          onClose();
        }}
      />
    );
  }

  const numAmount = parseFloat(amount) || 0;
  const amountToReceive = Math.max(0, numAmount - withdrawalFee);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#12151e] border border-white/10 rounded-3xl w-full max-w-sm sm:max-w-md overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="p-1 text-zinc-400 hover:text-white mr-1 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight">Withdraw Earnings</h3>
              <p className="text-[11px] sm:text-xs text-zinc-400">
                {step === 1 ? 'Step 1: Bank Account Verification' : 'Step 2: Enter Amount & Confirm'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5 max-h-[80vh] overflow-y-auto space-y-4">
          {/* Balance info banner */}
          <div className="bg-[#181c26] border border-white/5 p-3.5 rounded-2xl flex justify-between items-center">
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">Available Balance</p>
              <p className="text-base sm:text-lg font-black text-[#F27D26]">
                ₦{user?.walletBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <span className="text-[10px] text-zinc-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5 font-bold">
              Min: ₦{minWithdrawal.toLocaleString()}
            </span>
          </div>

          {/* WITHDRAWAL LOCKED WARNING BOX */}
          {isWithdrawalLocked ? (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-400">Withdrawal Locked</h4>
                  <p className="text-[11px] text-amber-200/90 mt-0.5 leading-relaxed">
                    {currentRefs < 5
                      ? 'You need 5 successful referrals before account activation.'
                      : 'Complete your first wallet deposit of ₦520 via Paystack to activate instant withdrawals.'}
                  </p>
                </div>
              </div>

              {currentRefs < 5 ? (
                <div className="space-y-2">
                  <div className="bg-[#181c26] p-3 rounded-xl border border-zinc-800 text-xs flex items-center justify-between">
                    <span className="text-zinc-300 font-medium">Referral Goal</span>
                    <span className="font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                      {currentRefs} / 5 Done
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/referrals');
                    }}
                    className="w-full bg-[#F27D26] hover:bg-[#e06c19] text-black font-extrabold text-xs py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Users className="w-4 h-4" />
                    <span>Invite Friends ({currentRefs}/5)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/activation');
                    }}
                    className="w-full bg-[#F27D26] hover:bg-[#e06c19] text-black font-black text-xs py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Deposit ₦520 to Activate</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* STEP 1: ACCOUNT RESOLUTION */}
              {step === 1 && (
                <form onSubmit={handleStep1Submit} className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Select Bank *
                      </label>
                      <select
                        required
                        value={bankName}
                        onChange={handleBankSelect}
                        className="w-full bg-[#181c26] border border-white/5 rounded-xl px-3.5 py-3 text-white text-xs font-medium focus:outline-none focus:border-[#F27D26] transition-colors"
                      >
                        <option value="" className="bg-[#12151e] text-white">Select your bank</option>
                        {bankOptions.map((b) => (
                          <option key={b.code + b.name} value={b.name} className="bg-[#12151e] text-white">
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Account Number *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={10}
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter 10-digit account number"
                        className="w-full bg-[#181c26] border border-white/5 rounded-xl px-3.5 py-3 text-white text-sm font-mono tracking-widest focus:outline-none focus:border-[#F27D26] transition-colors"
                      />
                    </div>

                    {/* ACCOUNT RESOLUTION STATUS FEEDBACK */}
                    {resolving && (
                      <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs text-zinc-300 flex items-center gap-2 animate-pulse">
                        <RefreshCw className="w-4 h-4 text-[#F27D26] animate-spin" />
                        <span>Verifying bank account details via Paystack...</span>
                      </div>
                    )}

                    {isVerified && accountName && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs space-y-0.5 animate-fade-in">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Account Verified</span>
                        </div>
                        <p className="text-sm font-black text-white pl-5">{accountName}</p>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={!isVerified || resolving}
                    className="w-full bg-[#F27D26] hover:bg-[#e06c19] text-black font-black text-xs sm:text-sm py-3.5 rounded-xl shadow-lg shadow-[#F27D26]/15 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40"
                  >
                    <span>Continue to Amount</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* STEP 2: AMOUNT & CONFIRMATION BREAKDOWN */}
              {step === 2 && (
                <form onSubmit={handleFinalWithdrawal} className="space-y-4 animate-fade-in">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Withdrawal Amount (₦) *
                      </label>
                      <input
                        type="number"
                        required
                        min={minWithdrawal}
                        max={user?.walletBalance || 0}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={`Min ₦${minWithdrawal.toLocaleString()}`}
                        className="w-full bg-[#181c26] border border-white/5 rounded-xl px-3.5 py-3 text-white text-base font-bold focus:outline-none focus:border-[#F27D26] transition-colors"
                      />
                    </div>

                    {/* Breakdown Box */}
                    <div className="bg-[#181c26] border border-white/5 rounded-2xl p-4 text-xs space-y-2 text-zinc-300">
                      <div className="flex justify-between items-center text-zinc-400">
                        <span>Available Balance</span>
                        <span className="font-bold text-white">₦{user?.walletBalance.toLocaleString()}</span>
                      </div>

                      <div className="flex justify-between items-center text-zinc-400">
                        <span>Withdrawal Fee</span>
                        <span className="font-bold text-emerald-400">₦0.00</span>
                      </div>

                      <div className="flex justify-between items-center text-zinc-400 border-t border-white/5 pt-2">
                        <span>Verified Account</span>
                        <span className="font-bold text-white truncate max-w-[180px]">{accountName}</span>
                      </div>

                      <div className="flex justify-between items-center text-zinc-400">
                        <span>Destination Bank</span>
                        <span className="font-bold text-white">{bankName}</span>
                      </div>

                      <div className="flex justify-between items-center border-t border-white/5 pt-2 text-sm">
                        <span className="font-bold text-white">Amount to Receive</span>
                        <span className="font-black text-[#F27D26] text-base">
                          ₦{amountToReceive > 0 ? amountToReceive.toLocaleString() : '0'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || numAmount < minWithdrawal || (user?.walletBalance || 0) < numAmount}
                    className="w-full bg-[#F27D26] hover:bg-[#e06c19] text-black font-black text-xs sm:text-sm py-3.5 rounded-xl shadow-lg shadow-[#F27D26]/15 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Processing Payout...</span>
                      </>
                    ) : (
                      <span>Confirm & Withdraw ₦{amountToReceive > 0 ? amountToReceive.toLocaleString() : '0'}</span>
                    )}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
