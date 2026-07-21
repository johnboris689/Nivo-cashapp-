import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  PlusCircle,
  MinusCircle,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  X,
  Check,
  AlertCircle,
  Wallet,
} from 'lucide-react';
import { User } from '../../types';
import { api } from '../../lib/api';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Balance adjust modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [adjustReason, setAdjustReason] = useState('');

  // Referral count modal
  const [refModalOpen, setRefModalOpen] = useState(false);
  const [newRefCount, setNewRefCount] = useState<string>('5');

  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchUsers = async () => {
    try {
      const data = await api.getAdminUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      await api.updateUserStatus(user.id, newStatus);
      setMsg({ type: 'success', text: `User @${user.username} status set to ${newStatus}.` });
      fetchUsers();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to update user status.' });
    }
  };

  const handleToggleActivation = async (user: User) => {
    const newActivationState = !user.activationPaid;
    try {
      await api.setUserActivationStatus(user.id, newActivationState);
      setMsg({
        type: 'success',
        text: `User @${user.username} activation status updated to ${newActivationState ? 'PAID ✅' : 'NOT PAID ❌'}.`,
      });
      fetchUsers();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to update activation status.' });
    }
  };

  const handleSetReferrals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const count = parseInt(newRefCount, 10);
    if (isNaN(count) || count < 0) {
      setMsg({ type: 'error', text: 'Please enter a valid non-negative referral count.' });
      return;
    }

    setActionLoading(true);
    try {
      await api.setUserReferralCount(selectedUser.id, count);
      setMsg({
        type: 'success',
        text: `Referral count for @${selectedUser.username} set to ${count}.`,
      });
      setRefModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to update referral count.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!window.confirm(`Are you sure you want to PERMANENTLY delete user @${username}?`)) return;
    try {
      await api.deleteUser(userId);
      setMsg({ type: 'success', text: `User @${username} deleted successfully.` });
      fetchUsers();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to delete user.' });
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !adjustAmount || !adjustReason) return;

    setActionLoading(true);
    try {
      await api.adjustUserBalance(selectedUser.id, Number(adjustAmount), adjustType, adjustReason);
      setMsg({
        type: 'success',
        text: `Successfully ${adjustType === 'credit' ? 'credited' : 'debited'} ₦${Number(
          adjustAmount
        ).toLocaleString()} to @${selectedUser.username}'s wallet.`,
      });
      setAdjustModalOpen(false);
      setAdjustAmount('');
      setAdjustReason('');
      fetchUsers();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to adjust balance.' });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search)
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-orange-400" />
            User Management & Wallets
          </h1>
          <p className="text-xs text-zinc-400 mt-1">View registered accounts, credit/debit balances, suspend or delete users</p>
        </div>
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

      {/* Search Bar */}
      <div className="bg-[#11141c] border border-zinc-800 rounded-3xl p-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, @username, email, or phone..."
            className="w-full bg-[#171b26] border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#11141c] border border-zinc-800 rounded-3xl p-6">
        {loading ? (
          <div className="text-center py-10 text-zinc-500 text-xs">Loading user accounts...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-10 text-zinc-500 text-xs">No users found matching search.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">User</th>
                  <th className="py-3 px-3">Contact</th>
                  <th className="py-3 px-3">Wallet Balance</th>
                  <th className="py-3 px-3">Referrals</th>
                  <th className="py-3 px-3">Activation</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-medium text-zinc-300">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#171b26] transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-bold text-white flex items-center gap-1.5">
                        {u.fullName}
                        {u.isAdmin && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30">
                            ADMIN
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-zinc-400">@{u.username}</p>
                    </td>

                    <td className="py-3 px-3">
                      <p className="text-zinc-300">{u.email}</p>
                      <p className="text-[11px] text-zinc-500">{u.phone}</p>
                    </td>

                    <td className="py-3 px-3">
                      <p className="font-black text-amber-400">₦{u.walletBalance.toLocaleString()}</p>
                      <p className="text-[10px] text-zinc-500">Earnings: ₦{u.totalEarnings.toLocaleString()}</p>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${u.totalReferrals >= 5 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {u.totalReferrals} / 5
                        </span>
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setNewRefCount((u.totalReferrals || 0).toString());
                            setRefModalOpen(true);
                          }}
                          className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded border border-zinc-700 cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleToggleActivation(u)}
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-all cursor-pointer ${
                          u.activationPaid
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30'
                        }`}
                        title="Click to toggle activation status"
                      >
                        {u.activationPaid ? 'PAID ✅' : 'NOT PAID ❌'}
                      </button>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          u.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right space-x-1.5">
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setAdjustModalOpen(true);
                        }}
                        className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-1 rounded-lg transition-all cursor-pointer"
                      >
                        Adjust Balance
                      </button>

                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                          u.status === 'active'
                            ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                        }`}
                      >
                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>

                      {!u.isAdmin && (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.username)}
                          className="p-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition-all cursor-pointer inline-block align-middle"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Balance Adjust Modal */}
      {adjustModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#11141c] border border-amber-500/30 rounded-3xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-extrabold text-white text-base">Adjust Wallet Balance</h3>
                <p className="text-xs text-zinc-400">User: {selectedUser.fullName} (@{selectedUser.username})</p>
              </div>
              <button
                onClick={() => setAdjustModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div className="bg-[#171b26] p-3 rounded-xl border border-zinc-800">
                <p className="text-xs text-zinc-400">Current Wallet Balance</p>
                <p className="text-lg font-black text-amber-400">₦{selectedUser.walletBalance.toLocaleString()}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">Adjustment Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('credit')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      adjustType === 'credit'
                        ? 'bg-emerald-500 text-black border-emerald-400'
                        : 'bg-[#171b26] text-zinc-400 border-zinc-800'
                    }`}
                  >
                    Credit (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('debit')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      adjustType === 'debit'
                        ? 'bg-red-500 text-white border-red-400'
                        : 'bg-[#171b26] text-zinc-400 border-zinc-800'
                    }`}
                  >
                    Debit (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">Amount (₦)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full bg-[#171b26] border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">Reason for Adjustment</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Manual task bonus correction"
                  className="w-full bg-[#171b26] border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-extrabold text-xs py-3.5 rounded-xl transition-all cursor-pointer"
              >
                {actionLoading ? 'Processing...' : 'Apply Wallet Adjustment'}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Referral Count Modal */}
      {refModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#11141c] border border-amber-500/30 rounded-3xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-extrabold text-white text-base">Modify Referral Count</h3>
                <p className="text-xs text-zinc-400">User: {selectedUser.fullName} (@{selectedUser.username})</p>
              </div>
              <button
                onClick={() => setRefModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSetReferrals} className="space-y-4">
              <div className="bg-[#171b26] p-3.5 rounded-xl border border-zinc-800 flex justify-between items-center">
                <div>
                  <p className="text-xs text-zinc-400">Current Referrals</p>
                  <p className="text-base font-black text-amber-400">{selectedUser.totalReferrals || 0} / 5</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  (selectedUser.totalReferrals || 0) >= 5 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {(selectedUser.totalReferrals || 0) >= 5 ? 'Requirement Met ✅' : 'Below Threshold ❌'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">New Total Referrals</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={newRefCount}
                  onChange={(e) => setNewRefCount(e.target.value)}
                  placeholder="Enter total referrals count"
                  className="w-full bg-[#171b26] border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewRefCount('5')}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-bold text-xs py-2 rounded-xl border border-zinc-700 cursor-pointer"
                >
                  Quick Set: 5 Referrals
                </button>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-extrabold text-xs py-3.5 rounded-xl transition-all cursor-pointer"
              >
                {actionLoading ? 'Saving...' : 'Update Referral Count'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
