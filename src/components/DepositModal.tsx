import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Clock,
  CheckCircle2,
  Wallet,
  Smartphone,
  Search,
  Send,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Share2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { DepositRequest } from '../types';

interface DepositModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({ onClose, onSuccess }) => {
  const { user, refreshUser } = useAuth();

  const [step, setStep] = useState<'amount' | 'dva' | 'success'>('amount');
  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('1000');
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Deposit object
  const [activeDeposit, setActiveDeposit] = useState<DepositRequest | null>(null);

  // Countdown timer (30 minutes = 1800s)
  const TOTAL_TIME = 1800;
  const [timeLeft, setTimeLeft] = useState<number>(TOTAL_TIME);

  const presetAmounts = [520, 1000, 2000, 5000, 10000, 25000];

  useEffect(() => {
    let timer: any;
    if (step === 'dva' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  // Automated background polling for Paystack webhook confirmation
  useEffect(() => {
    let pollInterval: any;
    if (step === 'dva' && activeDeposit?.reference && timeLeft > 0) {
      pollInterval = setInterval(async () => {
        try {
          const res = await api.checkDepositStatus(activeDeposit.reference);
          if (res.status === 'approved' || res.status === 'completed') {
            setActiveDeposit(res.deposit);
            triggerSuccessFlow();
          }
        } catch (err) {
          // Silent catch on background poll
        }
      }, 3500);
    }
    return () => clearInterval(pollInterval);
  }, [step, activeDeposit?.reference, timeLeft]);

  const triggerSuccessFlow = async () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F27D26', '#10b981', '#ffffff'],
    });
    await refreshUser();
    setStep('success');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const copyToClipboard = (text: string, fieldKey: string, successLabel: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    showToast(successLabel);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleShareAccount = () => {
    if (!activeDeposit) return;
    const shareText = `Nivo Cash Deposit Transfer Details:\nBank: ${activeDeposit.bankName}\nAccount Number: ${activeDeposit.accountNumber}\nAmount: ₦${activeDeposit.amount.toLocaleString()}\nAccount Name: ${activeDeposit.accountName}`;
    if (navigator.share) {
      navigator.share({
        title: 'Nivo Cash Payment Details',
        text: shareText,
      }).catch(() => {});
    } else {
      copyToClipboard(shareText, 'share', 'Account details copied for sharing.');
    }
  };

  const handlePresetSelect = (val: number) => {
    setAmount(val);
    setCustomAmount(val.toString());
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    const parsed = parseFloat(e.target.value);
    if (!isNaN(parsed)) {
      setAmount(parsed);
    }
  };

  const handleInitializeDva = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount < 520) {
      setError('Minimum deposit amount is ₦520.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.initializePaystackVirtualAccount(amount);
      setActiveDeposit(res.deposit);
      setTimeLeft(TOTAL_TIME);
      setStep('dva');
    } catch (err: any) {
      setError(err.message || 'Failed to generate transfer account.');
    } finally {
      setLoading(false);
    }
  };

  const handleSentMoneyClick = async () => {
    if (!activeDeposit) return;
    setCheckingStatus(true);
    setError(null);
    try {
      const res = await api.checkDepositStatus(activeDeposit.reference);
      if (res.status === 'approved' || res.status === 'completed') {
        setActiveDeposit(res.deposit);
        await triggerSuccessFlow();
      } else {
        showToast('Waiting for Paystack confirmation...');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to verify payment status.');
    } finally {
      setCheckingStatus(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = Math.max(0, Math.min(100, (timeLeft / TOTAL_TIME) * 100));

  // Clean bank name (strip technical parentheses if any)
  const cleanBankName = activeDeposit?.bankName.replace(/\s*\(.*?\)/g, '') || 'Wema Bank';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#12151e] border border-white/10 rounded-3xl w-full max-w-sm sm:max-w-md overflow-hidden shadow-2xl relative transform transition-all">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-[#F27D26] text-black text-xs font-black px-3.5 py-1.5 rounded-full shadow-2xl flex items-center gap-1.5 animate-fade-in">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Clean Header */}
        <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">Deposit Funds</h3>
            <p className="text-[11px] sm:text-xs text-zinc-400">Transfer the exact amount below.</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5 max-h-[82vh] overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: SELECT AMOUNT */}
          {step === 'amount' && (
            <form onSubmit={handleInitializeDva} className="space-y-4">
              <div className="space-y-2.5">
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Select Deposit Amount
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {presetAmounts.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handlePresetSelect(val)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        amount === val
                          ? 'bg-[#F27D26] text-black border-transparent shadow-md shadow-[#F27D26]/20'
                          : 'bg-[#181c26] text-zinc-300 border-white/5 hover:border-white/10 hover:bg-[#1f2432]'
                      }`}
                    >
                      ₦{val.toLocaleString()}
                    </button>
                  ))}
                </div>

                <div className="relative pt-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">
                    ₦
                  </span>
                  <input
                    type="number"
                    min="520"
                    value={customAmount}
                    onChange={handleCustomChange}
                    placeholder="Enter deposit amount"
                    className="w-full bg-[#181c26] border border-white/5 rounded-xl pl-8 pr-3 py-3 text-white text-sm font-bold focus:outline-none focus:border-[#F27D26] transition-colors"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 flex items-center justify-between font-medium">
                  <span>Minimum deposit: ₦520</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Instant Paystack Credit
                  </span>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#F27D26] hover:bg-[#e06c19] text-black font-black text-xs sm:text-sm py-3.5 rounded-xl shadow-lg shadow-[#F27D26]/15 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating Account...</span>
                  </>
                ) : (
                  <span>Continue to Payment</span>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: MAIN COMPACT PAYMENT CARD */}
          {step === 'dva' && activeDeposit && (
            <div className="space-y-4 animate-fade-in">
              {timeLeft <= 0 ? (
                /* EXPIRED STATE */
                <div className="bg-[#181c26] border border-red-500/20 rounded-2xl p-6 text-center space-y-3">
                  <div className="w-10 h-10 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">This payment session has expired.</h4>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Please generate a new payment session to complete your wallet deposit.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setStep('amount');
                      setTimeLeft(TOTAL_TIME);
                    }}
                    className="w-full bg-[#F27D26] hover:bg-[#e06c19] text-black font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
                  >
                    Generate New Payment Session
                  </button>
                </div>
              ) : (
                <>
                  {/* Single Main Payment Card */}
                  <div className="bg-[#181c26] border border-white/5 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xl">
                    {/* Bank Name */}
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500">Bank Name</span>
                      <span className="font-bold text-white">{cleanBankName}</span>
                    </div>

                    {/* Account Number Box (Center & Large Display) */}
                    <div className="space-y-1">
                      <span className="text-[11px] text-zinc-500">Account Number</span>
                      <div className="bg-[#12151e] border border-white/5 rounded-xl px-4 py-3 flex items-center justify-between">
                        <span className="text-xl sm:text-2xl font-mono font-black text-white tracking-widest">
                          {activeDeposit.accountNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(activeDeposit.accountNumber, 'accNo', 'Account number copied.')}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
                          title="Copy account number"
                        >
                          {copiedField === 'accNo' ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500">Amount</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-black text-[#F27D26]">
                          ₦{activeDeposit.amount.toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(`₦${activeDeposit.amount}`, 'amtCopy', 'Amount copied.')}
                          className="p-1 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                        >
                          {copiedField === 'amtCopy' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Account Name */}
                    <div className="flex justify-between items-center text-xs pt-2 border-t border-white/5">
                      <span className="text-zinc-500">Account Name</span>
                      <span className="font-bold text-white text-right truncate max-w-[200px]">
                        {activeDeposit.accountName || `Nivo Cash - ${user?.fullName}`}
                      </span>
                    </div>

                    {/* Countdown Timer */}
                    <div className="pt-2 border-t border-white/5 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-zinc-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-zinc-400" />
                          <span>Payment expires in</span>
                        </div>
                        <span className="font-mono font-bold text-white">{formatTimer(timeLeft)}</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                        <div
                          className="bg-[#F27D26] h-full transition-all duration-1000 ease-linear"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Instructions Box */}
                  <div className="bg-[#181c26] border border-white/5 rounded-2xl p-4 space-y-2 text-xs">
                    <div className="flex items-start gap-2.5 text-zinc-300">
                      <span className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[11px] font-bold text-[#F27D26] shrink-0 mt-0.5">1</span>
                      <span>Open your banking app.</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-zinc-300">
                      <span className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[11px] font-bold text-[#F27D26] shrink-0 mt-0.5">2</span>
                      <span>Transfer exactly the displayed amount.</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-zinc-300">
                      <span className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[11px] font-bold text-[#F27D26] shrink-0 mt-0.5">3</span>
                      <span>Wait for automatic confirmation.</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-zinc-300">
                      <span className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[11px] font-bold text-emerald-400 shrink-0 mt-0.5">4</span>
                      <span>Wallet will be credited automatically.</span>
                    </div>
                  </div>

                  {/* Bottom Buttons */}
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={handleSentMoneyClick}
                      disabled={checkingStatus}
                      className="w-full bg-[#F27D26] hover:bg-[#e06c19] text-black font-black text-xs sm:text-sm py-3.5 rounded-xl shadow-lg shadow-[#F27D26]/15 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {checkingStatus ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Checking Payment...</span>
                        </>
                      ) : (
                        <span>I've Sent the Money</span>
                      )}
                    </button>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleShareAccount}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-zinc-300 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share Account</span>
                      </button>

                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 bg-transparent hover:bg-white/5 text-zinc-400 hover:text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer text-center"
                      >
                        Cancel Payment
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 3: DEPOSIT SUCCESS RECEIPT */}
          {step === 'success' && activeDeposit && (
            <div className="space-y-4 py-2 text-center animate-scale-up">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-xl">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>

              <div>
                <h3 className="text-lg font-black text-white">Payment Confirmed</h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Your deposit has been automatically credited
                </p>
                <p className="text-2xl font-black text-emerald-400 mt-2">
                  +₦{activeDeposit.amount.toLocaleString()}
                </p>
              </div>

              <div className="bg-[#181c26] border border-white/5 rounded-2xl p-4 text-xs space-y-2.5 text-left">
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Bank Name</span>
                  <span className="font-bold text-white">{cleanBankName}</span>
                </div>

                <div className="flex justify-between items-center text-zinc-400">
                  <span>Account Number</span>
                  <span className="font-mono font-bold text-white">{activeDeposit.accountNumber}</span>
                </div>

                <div className="flex justify-between items-center text-zinc-400">
                  <span>Status</span>
                  <span className="font-bold text-emerald-400 uppercase">Confirmed</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onSuccess();
                  onClose();
                }}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs sm:text-sm py-3.5 rounded-xl shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                <span>Continue to Wallet</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
