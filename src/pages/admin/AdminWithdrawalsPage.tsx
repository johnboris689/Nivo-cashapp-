import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Check, X, AlertCircle } from 'lucide-react';
import { WithdrawalRequest } from '../../types';
import { api } from '../../lib/api';

export const AdminWithdrawalsPage: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchWithdrawals = async () => {
    try {
      const data = await api.getAdminWithdrawals();
      setWithdrawals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await api.approveWithdrawal(id, 'Approved and processed payout');
      setMsg({ type: 'success', text: 'Withdrawal approved!' });
      fetchWithdrawals();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to approve withdrawal.' });
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt('Enter reason for declining withdrawal (funds will be refunded to user):', 'Invalid bank details');
    if (reason === null) return;
    try {
      await api.rejectWithdrawal(id, reason);
      setMsg({ type: 'success', text: 'Withdrawal rejected and user wallet balance refunded.' });
      fetchWithdrawals();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to reject withdrawal.' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <ArrowUpRight className="w-6 h-6 text-amber-400" />
          Withdrawal Requests Management
        </h1>
        <p className="text-xs text-zinc-400 mt-1">Review bank payout requests, approve or decline with auto-refund</p>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
            msg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          {msg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#11141c] border border-zinc-800 rounded-3xl p-6">
        {loading ? (
          <div className="text-center py-10 text-zinc-500 text-xs">Loading withdrawal applications...</div>
        ) : withdrawals.length === 0 ? (
          <div className="text-center py-10 text-zinc-500 text-xs">No withdrawal requests recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">User</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Bank Details</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-medium text-zinc-300">
                {withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-[#171b26] transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-bold text-white">{w.userName}</p>
                      <p className="text-[10px] text-zinc-500">{w.userEmail}</p>
                    </td>

                    <td className="py-3 px-3 font-black text-amber-400">₦{w.amount.toLocaleString()}</td>

                    <td className="py-3 px-3">
                      <p className="font-bold text-white">{w.bankName}</p>
                      <p className="text-orange-400 font-mono font-bold">{w.accountNumber}</p>
                      <p className="text-[10px] text-zinc-400">{w.accountName}</p>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          w.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : w.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {w.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-zinc-500 text-[11px]">
                      {new Date(w.createdAt).toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right space-x-2">
                      {w.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleApprove(w.id)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-[10px] px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                          >
                            Approve & Pay
                          </button>
                          <button
                            onClick={() => handleReject(w.id)}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-[10px] px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                          >
                            Decline & Refund
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-zinc-500 italic">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
