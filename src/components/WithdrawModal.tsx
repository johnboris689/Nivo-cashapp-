import React, { useState } from 'react';
import { X, ArrowUpRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

interface WithdrawModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({ onClose, onSuccess }) => {
  const { user, settings, refreshUser } = useAuth();

  const [amount, setAmount] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const minWithdrawal = settings?.minWithdrawal || 2000;

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
            <div className="p-2 rounded-xl bg-[#F27D26]/10 text-[#F27D26]">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Withdraw Earnings</h3>
              <p className="text-xs text-gray-400">Bank Transfer Payout</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto space-y-4">
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
      </div>
    </div>
  );
};
