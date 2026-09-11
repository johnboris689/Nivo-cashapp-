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
  onSuccess?: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({ onClose, onSuccess }) => {
  const { user, refreshUser } = useAuth();

  const [step, setStep] = useState<'amount' | 'transfer' | 'success'>('amount');
  const [amount, setAmount] = useState<number>(520);
  const [customAmount, setCustomAmount] = useState<string>('520');
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Deposit object
  const [activeDeposit, setActiveDeposit] = useState<DepositRequest | null>(null);

  // Paystack returns the real expiry timestamp for this one-time account.
  const FALLBACK_TIME = 1800;
  const [timeLeft, setTimeLeft] = useState<number>(FALLBACK_TIME);

  const presetAmounts = [520, 1000, 2000, 5000, 10000, 25000];

  useEffect(() => {
    if (step !== 'transfer' || !activeDeposit) return;

    const updateCountdown = () => {
      const expiry = activeDeposit.accountExpiresAt ? new Date(activeDeposit.accountExpiresAt).getTime() : Date.now() + FALLBACK_TIME * 1000;
      setTimeLeft(Math.max(0, Math.ceil((expiry - Date.now()) / 1000)));
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [step, activeDeposit?.reference, activeDeposit?.accountExpiresAt]);

  // Automated background polling for Paystack webhook confirmation
  useEffect(() => {
    let pollInterval: any;
    if (step === 'transfer' && activeDeposit?.reference && timeLeft > 0) {
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
  }, [step, activeDeposit?.reference]);

  const triggerSuccessFlow = async () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8F1D3A', '#8F1D3A', '#ffffff'],
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

  const handleInitializeTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const requestedAmount = Number(amount);
    if (!Number.isFinite(requestedAmount) || requestedAmount < 520) {
      setError('Minimum deposit amount is ₦520.');
      return;
    }

    if (Math.round(requestedAmount * 100) !== requestedAmount * 100) {
      setError('Please enter an amount with no more than 2 decimal places.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // The frontend never creates or guesses an account number. This request
      // reaches our backend, which calls Paystack's /charge API with the
      // server-side PAYSTACK_SECRET_KEY. Paystack returns the temporary account.
      const res = await api.initializePaystackVirtualAccount(requestedAmount);
      setActiveDeposit(res.deposit);
      const expiry = res.deposit.accountExpiresAt ? new Date(res.deposit.accountExpiresAt).getTime() : Date.now() + FALLBACK_TIME * 1000;
      setTimeLeft(Math.max(0, Math.ceil((expiry - Date.now()) / 1000)));
      setStep('transfer');
    } catch (err: any) {
      setError(err.message || 'Paystack could not create a temporary transfer account.');
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

  const progressPercentage = Math.max(0, Math.min(100, (timeLeft / FALLBACK_TIME) * 100));

  // Clean bank name (strip technical parentheses if any)
  const cleanBankName = activeDeposit?.bankName.replace(/\s*\(.*?\)/g, '') || 'Wema Bank';

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/90 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#16090D] border-0 sm:border sm:border-white/10 rounded-none sm:rounded-3xl w-full h-full sm:h-[94vh] sm:max-w-2xl overflow-hidden shadow-2xl relative transform transition-all flex flex-col">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-[#8F1D3A] text-black text-xs font-black px-3.5 py-1.5 rounded-full shadow-2xl flex items-center gap-1.5 animate-fade-in">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Clean Header */}
        <div className="px-5 py-4 sm:px-7 sm:py-5 border-b border-white/5 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">Deposit Funds</h3>
            <p className="text-[11px] sm:text-xs text-zinc-400">Choose your amount first. Paystack creates the temporary account only after you continue.</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5">
          {error && (
            <div className="p-3 bg-[#8F1D3A]/10 border border-[#8F1D3A]/20 rounded-xl text-[#C13A5A] text-xs flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: SELECT AMOUNT */}
          {step === 'amount' && (
            <form onSubmit={handleInitializeTransfer} className="max-w-xl mx-auto space-y-6 pt-2 sm:pt-8">
              <div className="space-y-2.5">
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  How much would you like to deposit?
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {presetAmounts.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handlePresetSelect(val)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        amount === val
                          ? 'bg-[#8F1D3A] text-black border-transparent shadow-md shadow-[#8F1D3A]/20'
                          : 'nivo-glass-surface text-zinc-300 border-white/5 hover:border-white/10 hover:bg-[#240A12]'
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
                    className="w-full nivo-glass-surface border border-white/5 rounded-xl pl-8 pr-3 py-3 text-white text-sm font-bold focus:outline-none focus:border-[#8F1D3A] transition-colors"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 flex items-center justify-between font-medium">
                  <span>Minimum deposit: ₦520</span>
                  <span className="text-[#A52A4A] font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Instant Paystack Credit
                  </span>
                </p>
              </div>

              <div className="nivo-glass-surface border border-white/5 rounded-2xl p-4 text-xs text-zinc-400 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#A52A4A] shrink-0 mt-0.5" />
                <p>After you tap Continue, Nivo Cash will securely request a new Paystack Pay with Transfer account for this exact amount. Nivo Cash does not generate or invent the account number.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#8F1D3A] hover:bg-[#7A1831] text-black font-black text-sm sm:text-base py-4 rounded-xl shadow-lg shadow-[#8F1D3A]/15 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Requesting Account from Paystack...</span>
                  </>
                ) : (
                  <span>Continue &amp; Get Paystack Account</span>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: MAIN COMPACT PAYMENT CARD */}
          {step === 'transfer' && activeDeposit && (
            <div className="max-w-xl mx-auto space-y-4 animate-fade-in pt-2 sm:pt-4">
              {timeLeft <= 0 ? (
                /* EXPIRED STATE */
                <div className="nivo-glass-surface border border-[#8F1D3A]/20 rounded-2xl p-6 text-center space-y-3">
                  <div className="w-10 h-10 bg-[#8F1D3A]/20 text-[#C13A5A] rounded-full flex items-center justify-center mx-auto">
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
                      setTimeLeft(FALLBACK_TIME);
                    }}
                    className="w-full bg-[#8F1D3A] hover:bg-[#7A1831] text-black font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
                  >
                    Generate New Payment Session
                  </button>
                </div>
              ) : (
                <>
                  {/* Single Main Payment Card */}
                  <div className="nivo-glass-surface border border-white/5 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xl">
                    {/* Bank Name */}
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500">Receiving Bank</span>
                      <span className="font-bold text-white">{cleanBankName}</span>
                    </div>

                    {/* Account Number Box (Center & Large Display) */}
                    <div className="space-y-1">
                      <span className="text-[11px] text-zinc-500">Account Number</span>
                      <div className="bg-[#16090D] border border-white/5 rounded-xl px-4 py-3 flex items-center justify-between">
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
                            <Check className="w-4 h-4 text-[#A52A4A]" />
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
                        <span className="text-base font-black text-[#8F1D3A]">
                          ₦{activeDeposit.amount.toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(`₦${activeDeposit.amount}`, 'amtCopy', 'Amount copied.')}
                          className="p-1 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                        >
                          {copiedField === 'amtCopy' ? (
                            <Check className="w-3.5 h-3.5 text-[#A52A4A]" />
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
                          <span>One-time account expires in</span>
                        </div>
                        <span className="font-mono font-bold text-white">{formatTimer(timeLeft)}</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                        <div
                          className="bg-[#8F1D3A] h-full transition-all duration-1000 ease-linear"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Instructions Box */}
                  <div className="nivo-glass-surface border border-white/5 rounded-2xl p-4 space-y-2 text-xs">
                    <div className="flex items-start gap-2.5 text-zinc-300">
                      <span className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[11px] font-bold text-[#8F1D3A] shrink-0 mt-0.5">1</span>
                      <span>Open your banking app.</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-zinc-300">
                      <span className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[11px] font-bold text-[#8F1D3A] shrink-0 mt-0.5">2</span>
                      <span>Transfer exactly the displayed amount.</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-zinc-300">
                      <span className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[11px] font-bold text-[#8F1D3A] shrink-0 mt-0.5">3</span>
                      <span>Paystack will automatically confirm the transfer and credit your wallet.</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-zinc-300">
                      <span className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[11px] font-bold text-[#A52A4A] shrink-0 mt-0.5">4</span>
                      <span>Wallet will be credited automatically.</span>
                    </div>
                  </div>

                  {/* Bottom Buttons */}
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={handleSentMoneyClick}
                      disabled={checkingStatus}
                      className="w-full bg-[#8F1D3A] hover:bg-[#7A1831] text-black font-black text-xs sm:text-sm py-3.5 rounded-xl shadow-lg shadow-[#8F1D3A]/15 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
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
              <div className="w-14 h-14 mx-auto rounded-full bg-[#8F1D3A]/20 text-[#A52A4A] border border-[#8F1D3A]/30 flex items-center justify-center shadow-xl">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>

              <div>
                <h3 className="text-lg font-black text-white">Payment Confirmed</h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Your deposit has been automatically credited
                </p>
                <p className="text-2xl font-black text-[#A52A4A] mt-2">
                  +₦{activeDeposit.amount.toLocaleString()}
                </p>
              </div>

              <div className="nivo-glass-surface border border-white/5 rounded-2xl p-4 text-xs space-y-2.5 text-left">
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
                  <span className="font-bold text-[#A52A4A] uppercase">Confirmed</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onSuccess();
                  onClose();
                }}
                className="w-full bg-[#8F1D3A] hover:bg-[#A52A4A] text-black font-black text-xs sm:text-sm py-3.5 rounded-xl shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
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
