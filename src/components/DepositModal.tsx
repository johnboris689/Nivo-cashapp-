import React, { useState } from 'react';
import { X, Building2, Copy, Check, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

interface DepositModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({ onClose, onSuccess }) => {
  const { bankDetails, refreshUser } = useAuth();

  const [amount, setAmount] = useState<number>(2000);
  const [customAmount, setCustomAmount] = useState<string>('2000');
  const [senderName, setSenderName] = useState<string>('');
  const [paymentProofRef, setPaymentProofRef] = useState<string>('');
  const [step, setStep] = useState<'details' | 'confirm'>('details');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const presetAmounts = [1000, 2000, 5000, 10000, 25000, 50000];

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount < (bankDetails?.minDeposit || 1000)) {
      setError(`Minimum deposit amount is ₦${(bankDetails?.minDeposit || 1000).toLocaleString()}`);
      return;
    }
    if (!senderName.trim()) {
      setError('Please enter the account name or sender name used for the transfer.');
      return;
    }
    if (!paymentProofRef.trim()) {
      setError('Please enter your transaction reference or session ID.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.submitDeposit({
        amount,
        senderName,
        paymentProofRef,
      });
      await refreshUser();
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit deposit request.');
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
            <div className="p-2 rounded-xl bg-[#F27D26]/10 text-[#F27D26]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Deposit Funds</h3>
              <p className="text-xs text-gray-400">Direct Bank Transfer</p>
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
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 'details' ? (
            <div className="space-y-5">
              {/* Select Amount */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-2">
                  Select Deposit Amount (₦)
                </label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {presetAmounts.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handlePresetSelect(val)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        amount === val
                          ? 'bg-[#F27D26] text-black border-transparent shadow-md'
                          : 'bg-black/40 text-gray-300 border-white/5 hover:border-white/10'
                      }`}
                    >
                      ₦{val.toLocaleString()}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                    ₦
                  </span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={handleCustomChange}
                    placeholder="Enter custom deposit amount"
                    className="w-full bg-black/40 border border-white/5 rounded-xl pl-8 pr-4 py-3 text-white text-sm font-bold focus:outline-none focus:border-[#F27D26] transition-colors"
                  />
                </div>
              </div>

              {/* Official Bank Account Details */}
              <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-xs font-bold text-[#F27D26] uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#F27D26]" />
                    Official Deposit Account
                  </span>
                  <span className="text-[10px] text-green-500 font-bold bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                    Instant Credit
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Bank Name</span>
                    <span className="text-xs font-bold text-white">
                      {bankDetails?.bankName || 'Guaranty Trust Bank'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Account Name</span>
                    <span className="text-xs font-bold text-white">
                      {bankDetails?.accountName || 'Nivo Cash App Global Ltd'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-black p-2.5 rounded-xl border border-white/5">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Account Number</p>
                      <p className="text-sm font-mono font-bold text-[#F27D26] tracking-widest">
                        {bankDetails?.accountNumber || '0123456789'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(bankDetails?.accountNumber || '0123456789', 'accNo')
                      }
                      className="flex items-center gap-1 bg-[#F27D26]/10 hover:bg-[#F27D26]/20 text-[#F27D26] text-xs font-bold px-3 py-1.5 rounded-lg border border-[#F27D26]/20 transition-all cursor-pointer"
                    >
                      {copiedField === 'accNo' ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-gray-400 italic bg-white/5 p-2 rounded-lg">
                  💡 {bankDetails?.instructions || 'Transfer funds to the bank details above, then submit your payment details below.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setStep('confirm')}
                className="w-full bg-[#F27D26] hover:bg-[#E6721F] text-black font-bold text-sm py-3.5 rounded-xl shadow-lg shadow-orange-950/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Proceed to Submit Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-black/40 p-3.5 rounded-xl border border-white/5 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-400">Deposit Amount</p>
                  <p className="text-lg font-bold text-[#F27D26]">₦{amount.toLocaleString()}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="text-xs font-semibold text-gray-400 hover:text-white underline"
                >
                  Change
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">
                  Sender Name / Account Holder Name *
                </label>
                <input
                  type="text"
                  required
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. David John"
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#F27D26] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">
                  Transaction Reference / Session ID / Receipt Note *
                </label>
                <input
                  type="text"
                  required
                  value={paymentProofRef}
                  onChange={(e) => setPaymentProofRef(e.target.value)}
                  placeholder="e.g. TXN-9823749823 or GTB Session ID"
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#F27D26] transition-colors"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="w-1/3 bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-sm py-3 rounded-xl border border-white/5 transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 bg-[#F27D26] hover:bg-[#E6721F] disabled:opacity-50 text-black font-bold text-sm py-3 rounded-xl shadow-lg shadow-orange-950/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? 'Submitting...' : 'Confirm Deposit Request'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
