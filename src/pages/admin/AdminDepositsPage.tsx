import React, { useState, useEffect } from 'react';
import { Building2, Check, X, AlertCircle, Save, ShieldCheck } from 'lucide-react';
import { DepositRequest, BankDetails } from '../../types';
import { api } from '../../lib/api';

export const AdminDepositsPage: React.FC = () => {
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingBank, setSavingBank] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Editable Bank Form
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [instructions, setInstructions] = useState('');

  const fetchData = async () => {
    try {
      const [depData, bankData] = await Promise.all([
        api.getAdminDeposits(),
        api.getBankDetails(),
      ]);
      setDeposits(depData);
      setBankDetails(bankData);
      setBankName(bankData.bankName);
      setAccountName(bankData.accountName);
      setAccountNumber(bankData.accountNumber);
      setInstructions(bankData.instructions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await api.approveDeposit(id, 'Approved by admin');
      setMsg({ type: 'success', text: 'Deposit approved and wallet credited!' });
      fetchData();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to approve deposit.' });
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt('Enter reason for rejecting deposit:', 'Payment reference not found');
    if (reason === null) return;
    try {
      await api.rejectDeposit(id, reason);
      setMsg({ type: 'success', text: 'Deposit request rejected.' });
      fetchData();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to reject deposit.' });
    }
  };

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBank(true);
    try {
      const updated = await api.updateBankDetails({
        bankName,
        accountName,
        accountNumber,
        instructions,
      });
      setBankDetails(updated);
      setMsg({ type: 'success', text: 'Company deposit bank details updated successfully!' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to update bank details.' });
    } finally {
      setSavingBank(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Building2 className="w-6 h-6 text-emerald-400" />
          Deposit Requests & Bank Configuration
        </h1>
        <p className="text-xs text-zinc-400 mt-1">Approve or reject bank deposit requests and manage deposit bank account details</p>
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

      {/* Edit Deposit Bank Account Form */}
      <div className="bg-[#11141c] border border-amber-500/30 rounded-3xl p-6">
        <h2 className="text-base font-extrabold text-white mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
          Update Deposit Bank Account Details
        </h2>

        <form onSubmit={handleSaveBank} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">Bank Name</label>
            <input
              type="text"
              required
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full bg-[#171b26] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white text-xs font-bold focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">Account Name</label>
            <input
              type="text"
              required
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full bg-[#171b26] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white text-xs font-bold focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">Account Number</label>
            <input
              type="text"
              required
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full bg-[#171b26] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-orange-400 font-mono text-xs font-black focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={savingBank}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-extrabold text-xs py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{savingBank ? 'Saving...' : 'Save Bank Details'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Deposits Requests Table */}
      <div className="bg-[#11141c] border border-zinc-800 rounded-3xl p-6">
        <h2 className="text-base font-extrabold text-white mb-4">Deposit Proof Submissions</h2>

        {loading ? (
          <div className="text-center py-10 text-zinc-500 text-xs">Loading deposits...</div>
        ) : deposits.length === 0 ? (
          <div className="text-center py-10 text-zinc-500 text-xs">No deposit requests recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">User</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Sender Name</th>
                  <th className="py-3 px-3">Proof / Ref ID</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-medium text-zinc-300">
                {deposits.map((d) => (
                  <tr key={d.id} className="hover:bg-[#171b26] transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-bold text-white">{d.userName}</p>
                      <p className="text-[10px] text-zinc-500">{d.userEmail}</p>
                    </td>

                    <td className="py-3 px-3 font-black text-emerald-400">₦{d.amount.toLocaleString()}</td>

                    <td className="py-3 px-3 font-semibold text-zinc-200">{d.senderName}</td>

                    <td className="py-3 px-3 font-mono text-amber-400">{d.paymentProofRef}</td>

                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          d.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : d.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-zinc-500 text-[11px]">
                      {new Date(d.createdAt).toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right space-x-2">
                      {d.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleApprove(d.id)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-[10px] px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(d.id)}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-[10px] px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                          >
                            Reject
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
