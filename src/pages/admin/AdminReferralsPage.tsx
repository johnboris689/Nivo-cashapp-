import React, { useState, useEffect } from 'react';
import { Sparkles, Save, Check, AlertCircle, Users } from 'lucide-react';
import { ReferralRecord } from '../../types';
import { api } from '../../lib/api';

export const AdminReferralsPage: React.FC = () => {
  const [referralBonusAmount, setReferralBonusAmount] = useState('1200');
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    try {
      const [settings, refList] = await Promise.all([
        api.getAdminSettings(),
        api.getAdminReferrals(),
      ]);
      setReferralBonusAmount(settings.referralBonusAmount.toString());
      setReferrals(refList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveBonus = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateAdminSettings({
        referralBonusAmount: Number(referralBonusAmount),
      });
      setMsg({ type: 'success', text: `Global referral bonus updated to ₦${Number(referralBonusAmount).toLocaleString()}!` });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to update bonus amount.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-orange-400" />
          Referral System Controls & Logs
        </h1>
        <p className="text-xs text-zinc-400 mt-1">Set registration referral payouts and audit system referral bonus credits</p>
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

      {/* Bonus Amount Configuration Form */}
      <div className="bg-[#11141c] border border-amber-500/30 rounded-3xl p-6">
        <h2 className="text-base font-extrabold text-white mb-2">Global Referral Bonus Configuration</h2>
        <p className="text-xs text-zinc-400 mb-4">
          This amount is automatically credited to referrers when a new user registers using their code or link.
        </p>

        <form onSubmit={handleSaveBonus} className="flex flex-col sm:flex-row gap-4 max-w-lg items-end">
          <div className="flex-1">
            <label className="block text-xs font-bold text-zinc-300 mb-1">Referral Reward Amount (₦)</label>
            <input
              type="number"
              required
              min={100}
              value={referralBonusAmount}
              onChange={(e) => setReferralBonusAmount(e.target.value)}
              className="w-full bg-[#171b26] border border-zinc-800 rounded-xl px-4 py-3 text-amber-400 font-mono font-black text-base focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-extrabold text-xs px-6 py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Updating...' : 'Save New Reward Amount'}</span>
          </button>
        </form>
      </div>

      {/* System Referral Audit Table */}
      <div className="bg-[#11141c] border border-zinc-800 rounded-3xl p-6">
        <h2 className="text-base font-extrabold text-white mb-4">Referral Activity Log</h2>

        {loading ? (
          <div className="text-center py-10 text-zinc-500 text-xs">Loading logs...</div>
        ) : referrals.length === 0 ? (
          <div className="text-center py-10 text-zinc-500 text-xs">No referral events logged yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">Referrer User</th>
                  <th className="py-3 px-3">Referred User</th>
                  <th className="py-3 px-3">Bonus Amount</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-medium text-zinc-300">
                {referrals.map((r) => (
                  <tr key={r.id} className="hover:bg-[#171b26] transition-colors">
                    <td className="py-3 px-3 font-bold text-white">
                      ID: {r.referrerId.slice(0, 8)}...
                    </td>

                    <td className="py-3 px-3">
                      <p className="font-bold text-white">{r.referredUserName}</p>
                      <p className="text-[10px] text-zinc-500">{r.referredUserEmail}</p>
                    </td>

                    <td className="py-3 px-3 font-black text-amber-400">₦{r.bonusAmount.toLocaleString()}</td>

                    <td className="py-3 px-3">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {r.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-zinc-500 text-[11px]">
                      {new Date(r.createdAt).toLocaleString()}
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
