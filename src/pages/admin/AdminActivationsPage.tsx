import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, X, Clock, AlertCircle, Filter, Search, User, CreditCard } from 'lucide-react';
import { ActivationRequest } from '../../types';
import { api } from '../../lib/api';

export const AdminActivationsPage: React.FC = () => {
  const [activations, setActivations] = useState<ActivationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchActivations = async () => {
    try {
      const data = await api.getAdminActivations();
      setActivations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivations();
  }, []);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    setMsg(null);
    try {
      await api.approveActivation(id, 'Approved by admin');
      setMsg({ type: 'success', text: 'Activation request approved successfully! User is now activated.' });
      fetchActivations();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to approve activation.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt('Enter reason for rejecting this activation payment:', 'Payment proof could not be verified.');
    if (reason === null) return;

    setActionLoading(id);
    setMsg(null);
    try {
      await api.rejectActivation(id, reason);
      setMsg({ type: 'success', text: 'Activation request rejected.' });
      fetchActivations();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to reject activation.' });
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = activations.filter((a) => {
    const matchesFilter = filter === 'all' || a.status === filter;
    const matchesSearch =
      a.userName.toLowerCase().includes(search.toLowerCase()) ||
      a.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      a.senderName.toLowerCase().includes(search.toLowerCase()) ||
      a.paymentProofRef.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendingCount = activations.filter((a) => a.status === 'pending').length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-500" />
            Activation Fee Verification
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Review and approve user ₦520 activation fee bank payments</p>
        </div>

        {pendingCount > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 font-extrabold text-xs">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            {pendingCount} Pending Approvals
          </span>
        )}
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

      {/* Filters & Search */}
      <div className="bg-[#11141c] border border-zinc-800 rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1 bg-[#171b26] p-1 rounded-2xl border border-zinc-800 w-full sm:w-auto">
          {(['pending', 'all', 'approved', 'rejected'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                filter === tab
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search user, ref or sender..."
            className="w-full bg-[#171b26] border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-[#11141c] border border-zinc-800 rounded-3xl p-6">
        {loading ? (
          <div className="text-center py-10 text-zinc-500 text-xs">Loading activation requests...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 text-xs">
            No activation requests found under "{filter}".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">User</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Bank Sender Name</th>
                  <th className="py-3 px-3">Reference / Session ID</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-medium text-zinc-300">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-[#171b26] transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-bold text-white">{a.userName}</p>
                      <p className="text-[11px] text-zinc-400">{a.userEmail}</p>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-black text-amber-400">₦{a.amount.toLocaleString()}</span>
                    </td>

                    <td className="py-3 px-3 font-bold text-white">{a.senderName}</td>

                    <td className="py-3 px-3 font-mono font-bold text-amber-300">{a.paymentProofRef}</td>

                    <td className="py-3 px-3 text-zinc-400 text-[11px]">
                      {new Date(a.createdAt).toLocaleString()}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          a.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : a.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {a.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right space-x-2">
                      {a.status === 'pending' ? (
                        <>
                          <button
                            disabled={actionLoading === a.id}
                            onClick={() => handleApprove(a.id)}
                            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black text-[11px] font-black px-3 py-1.5 rounded-xl shadow transition-all cursor-pointer inline-flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>

                          <button
                            disabled={actionLoading === a.id}
                            onClick={() => handleReject(a.id)}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-zinc-500 italic">
                          {a.adminNote || 'Processed'}
                        </span>
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
