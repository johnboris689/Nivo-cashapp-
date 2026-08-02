import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Share2,
  Sparkles,
  CheckCircle2,
  Zap,
  Clock,
  Wallet,
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
  const [amount, setAmount] = useState<number>(5000);
  const [customAmount, setCustomAmount] = useState<string>('5000');
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Active DVA Deposit object
  const [activeDeposit, setActiveDeposit] = useState<DepositRequest | null>(null);

  // Countdown timer for DVA session (30 minutes)
  const [timeLeft, setTimeLeft] = useState<number>(1800); // 30 mins

  const presetAmounts = [1000, 2000, 5000, 10000, 25000, 50000];

  useEffect(() => {
    let timer: any;
    if (step === 'dva' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  // Live status polling every 3.5 seconds when on DVA screen
  useEffect(() => {
    let pollInterval: any;
    if (step === 'dva' && activeDeposit?.reference) {
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
      colors: ['#F27D26', '#10b981', '#f59e0b', '#ffffff'],
    });
    await refreshUser();
    setStep('success');
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleShare = () => {
    if (!activeDeposit) return;
    const shareText = `Nivo Cash Paystack DVA Deposit\nBank: ${activeDeposit.bankName}\nAccount No: ${activeDeposit.accountNumber}\nAccount Name: ${activeDeposit.accountName}\nAmount: ₦${activeDeposit.amount.toLocaleString()}\nRef: ${activeDeposit.reference}`;
    if (navigator.share) {
      navigator.share({
        title: 'Paystack Virtual Account Deposit',
        text: shareText,
      }).catch(() => {});
    } else {
      copyToClipboard(shareText, 'share');
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
    if (!amount || amount < 1000) {
      setError('Minimum deposit amount is ₦1,000.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.initializePaystackVirtualAccount(amount);
      setActiveDeposit(res.deposit);
      setTimeLeft(1800); // 30 min timer
      setStep('dva');
    } catch (err: any) {
      setError(err.message || 'Failed to generate Paystack virtual account.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualCheckStatus = async () => {
    if (!activeDeposit) return;
    setCheckingStatus(true);
    setError(null);
    try {
      const res = await api.checkDepositStatus(activeDeposit.reference);
      if (res.status === 'approved' || res.status === 'completed') {
        setActiveDeposit(res.deposit);
        await triggerSuccessFlow();
      } else {
        setError('Transfer not detected yet. Paystack webhooks automatically process deposits within 5-15 seconds after bank transfer.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to check status.');
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleSimulateInstantTransfer = async () => {
    if (!activeDeposit) return;
    setSimulating(true);
    setError(null);
    try {
      const res = await api.simulatePaystackTransfer(activeDeposit.reference);
      setActiveDeposit(res.deposit);
      await triggerSuccessFlow();
    } catch (err: any) {
      setError(err.message || 'Failed to process instant transfer.');
    } finally {
      setSimulating(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#12151c] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#F27D26] to-amber-500 p-0.5 text-black flex items-center justify-center font-bold">
              <div className="w-full h-full rounded-[14px] bg-[#12151c] flex items-center justify-center text-[#F27D26]">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-base">Automatic Paystack Deposit</h3>
                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/20">
                  DVA Enabled
                </span>
              </div>
              <p className="text-xs text-zinc-400">Instant Automated Wallet Crediting</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[82vh] overflow-y-auto space-y-5">
          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs flex items-center gap-2.5 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: SELECT AMOUNT */}
          {step === 'amount' && (
            <form onSubmit={handleInitializeDva} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-2">
                  Select Deposit Amount (₦)
                </label>
                <div className="grid grid-cols-3 gap-2.5 mb-3">
                  {presetAmounts.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handlePresetSelect(val)}
                      className={`py-3 px-3 rounded-2xl text-xs font-black border transition-all cursor-pointer ${
                        amount === val
                          ? 'bg-[#F27D26] text-black border-transparent shadow-lg shadow-[#F27D26]/20 scale-[1.02]'
                          : 'bg-[#181d28] text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:bg-[#1f2636]'
                      }`}
                    >
                      ₦{val.toLocaleString()}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-black text-base">
                    ₦
                  </span>
                  <input
                    type="number"
                    min="1000"
                    value={customAmount}
                    onChange={handleCustomChange}
                    placeholder="Enter custom deposit amount"
                    className="w-full bg-[#181d28] border border-zinc-800 rounded-2xl pl-9 pr-4 py-3.5 text-white text-base font-black focus:outline-none focus:border-[#F27D26] transition-colors"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1.5 flex items-center justify-between">
                  <span>Minimum deposit: ₦1,000</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-emerald-400" /> Instant Paystack Verification
                  </span>
                </p>
              </div>

              {/* Information Card */}
              <div className="bg-[#181d28] border border-zinc-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <ShieldCheck className="w-4 h-4 text-[#F27D26]" />
                  <span>How Automated Paystack Deposits Work</span>
                </div>
                <ul className="text-xs text-zinc-400 space-y-1.5 list-disc pl-5">
                  <li>We generate a dedicated Paystack virtual bank account for this deposit.</li>
                  <li>Transfer the exact amount via your bank app or USSD code.</li>
                  <li>Paystack automatically detects the payment and credits your Nivo wallet in seconds!</li>
                  <li>No manual upload of receipts or admin approval required.</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#F27D26] hover:bg-[#e06c19] text-black font-black text-sm py-4 rounded-2xl shadow-xl shadow-[#F27D26]/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating Paystack Virtual Account...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Generate Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: DEDICATED VIRTUAL ACCOUNT DISPLAY */}
          {step === 'dva' && activeDeposit && (
            <div className="space-y-5 animate-fade-in">
              {/* Payment Status Live Header */}
              <div className="bg-[#181d28] border border-[#F27D26]/30 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                    Expected Amount
                  </span>
                  <p className="text-2xl font-black text-[#F27D26]">
                    ₦{activeDeposit.amount.toLocaleString()}
                  </p>
                </div>

                <div className="text-right">
                  <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-amber-400 text-xs font-extrabold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Waiting for Transfer...</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1 flex items-center justify-end gap-1">
                    <Clock className="w-3 h-3 text-zinc-500" />
                    <span>Expires in {formatTimer(timeLeft)}</span>
                  </div>
                </div>
              </div>

              {/* Dedicated Bank Account Details Card */}
              <div className="bg-[#181d28] border border-white/10 rounded-2xl p-5 space-y-4 relative overflow-hidden shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#F27D26]/10 text-[#F27D26]">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-white">{activeDeposit.bankName}</span>
                  </div>
                  <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full uppercase">
                    Paystack DVA
                  </span>
                </div>

                {/* Account Number Box */}
                <div className="bg-[#12151c] p-4 rounded-xl border border-zinc-800/80 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-zinc-400 uppercase font-extrabold tracking-wider">
                      Account Number
                    </p>
                    <p className="text-2xl font-mono font-black text-[#F27D26] tracking-widest mt-0.5">
                      {activeDeposit.accountNumber}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(activeDeposit.accountNumber, 'accNo')}
                    className="flex items-center gap-1.5 bg-[#F27D26] hover:bg-[#e06c19] text-black text-xs font-black px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md"
                  >
                    {copiedField === 'accNo' ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Copy
                      </>
                    )}
                  </button>
                </div>

                {/* Account Details */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center text-zinc-400">
                    <span>Account Name:</span>
                    <span className="font-bold text-white">{activeDeposit.accountName}</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-400">
                    <span>Paystack Reference:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-amber-400 font-bold">{activeDeposit.reference}</span>
                      <button
                        onClick={() => copyToClipboard(activeDeposit.reference, 'ref')}
                        className="p-1 text-zinc-500 hover:text-white"
                      >
                        {copiedField === 'ref' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 p-3 rounded-xl text-[11px] text-zinc-300 leading-relaxed">
                  💡 Open your mobile banking app, select <span className="text-white font-bold">{activeDeposit.bankName}</span>, enter account number <span className="text-[#F27D26] font-mono font-bold">{activeDeposit.accountNumber}</span> and transfer exactly <span className="text-white font-bold">₦{activeDeposit.amount.toLocaleString()}</span>.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleShare}
                  className="bg-[#181d28] hover:bg-[#202738] text-zinc-200 border border-zinc-800 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-[#F27D26]" />
                  <span>{copiedField === 'share' ? 'Details Copied!' : 'Share Account'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleManualCheckStatus}
                  disabled={checkingStatus}
                  className="bg-[#181d28] hover:bg-[#202738] text-white border border-zinc-800 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 text-emerald-400 ${checkingStatus ? 'animate-spin' : ''}`} />
                  <span>{checkingStatus ? 'Checking...' : 'Refresh Status'}</span>
                </button>
              </div>

              {/* Instant Automated Transfer Demo Button */}
              <div className="pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={handleSimulateInstantTransfer}
                  disabled={simulating}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-xs py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Zap className="w-4 h-4 fill-black" />
                  <span>{simulating ? 'Processing Paystack Webhook...' : '⚡ Simulate Instant Transfer (Demo)'}</span>
                </button>
                <p className="text-[10px] text-zinc-500 text-center mt-1.5">
                  Click above to test instant Paystack automated credit in 1 second
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: DEPOSIT SUCCESS ANIMATION & RECEIPT */}
          {step === 'success' && activeDeposit && (
            <div className="space-y-6 py-4 text-center animate-scale-up">
              {/* Success Badge */}
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-2xl shadow-emerald-500/20 animate-bounce">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">Deposit Successful!</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Paystack Dedicated Virtual Account payment confirmed automatically
                </p>
                <p className="text-3xl font-black text-emerald-400 mt-3">
                  +₦{activeDeposit.amount.toLocaleString()}
                </p>
                <p className="text-xs text-zinc-400 mt-1 font-bold">Credited to your Nivo wallet balance</p>
              </div>

              {/* Transaction Receipt Box */}
              <div className="bg-[#181d28] border border-zinc-800 rounded-2xl p-4 text-xs space-y-2.5 text-left">
                <div className="flex justify-between items-center text-zinc-400 border-b border-zinc-800/60 pb-2">
                  <span>Payment Provider</span>
                  <span className="font-bold text-white flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#F27D26]" /> Paystack DVA
                  </span>
                </div>

                <div className="flex justify-between items-center text-zinc-400 border-b border-zinc-800/60 pb-2">
                  <span>Bank Name</span>
                  <span className="font-bold text-white">{activeDeposit.bankName}</span>
                </div>

                <div className="flex justify-between items-center text-zinc-400 border-b border-zinc-800/60 pb-2">
                  <span>Account Number</span>
                  <span className="font-mono font-bold text-amber-400">{activeDeposit.accountNumber}</span>
                </div>

                <div className="flex justify-between items-center text-zinc-400 border-b border-zinc-800/60 pb-2">
                  <span>Paystack Reference</span>
                  <span className="font-mono text-zinc-300 font-bold">{activeDeposit.reference}</span>
                </div>

                <div className="flex justify-between items-center text-zinc-400 border-b border-zinc-800/60 pb-2">
                  <span>Transaction ID</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {activeDeposit.transactionId || `PSTK-${Date.now()}`}
                  </span>
                </div>

                <div className="flex justify-between items-center text-zinc-400">
                  <span>Date & Time</span>
                  <span className="font-medium text-white">
                    {activeDeposit.processedAt ? new Date(activeDeposit.processedAt).toLocaleString() : new Date().toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onSuccess();
                  onClose();
                }}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm py-4 rounded-2xl shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
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
