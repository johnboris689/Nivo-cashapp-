import React, { useState, useEffect } from 'react';
import {
  Users,
  Copy,
  Check,
  Share2,
  Sparkles,
  Gift,
  CheckCircle2,
  UserCheck,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ShareModal } from '../components/ShareModal';
import { ReferralRecord } from '../types';
import { api } from '../lib/api';

export const ReferralsPage: React.FC = () => {
  const { user, settings } = useAuth();

  const [stats, setStats] = useState<{
    referralCode: string;
    referralLink: string;
    totalReferrals: number;
    totalReferralBonus: number;
    successfulReferrals: number;
    pendingReferrals: number;
    referralsList: ReferralRecord[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const bonusAmount = settings?.referralBonusAmount || 1200;

  const fetchReferralStats = async () => {
    try {
      const data = await api.getReferralStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralStats();
  }, []);

  const copyCode = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const copyLink = () => {
    if (user?.referralLink) {
      navigator.clipboard.writeText(user.referralLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-orange-400" />
            Referral Program & Earnings
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Earn ₦{bonusAmount.toLocaleString()} instantly for every friend who registers with your link
          </p>
        </div>

        <button
          onClick={() => setShowShareModal(true)}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black font-extrabold text-xs px-5 py-3 rounded-2xl shadow-lg shadow-orange-500/20 cursor-pointer transition-all hover:scale-105"
        >
          <Share2 className="w-4 h-4" />
          <span>Share Link Now</span>
        </button>
      </div>

      {/* Referral Link & Code Cards Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Referral Code Box */}
        <div className="bg-[#12151c] border border-orange-500/30 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-orange-400" />
                Your Referral Code
              </span>
              <span className="bg-orange-500/10 text-orange-400 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-orange-500/20">
                Active
              </span>
            </div>

            <div className="bg-[#181d28] border border-zinc-800 p-4 rounded-2xl flex items-center justify-between mt-2">
              <span className="text-2xl font-mono font-black text-white tracking-widest">
                {user?.referralCode || 'NIVO123'}
              </span>
              <button
                onClick={copyCode}
                className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-black font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-orange-500/20"
              >
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 mt-4">
            Friends can enter this code manually in the registration form to credit you.
          </p>
        </div>

        {/* Referral Link Box */}
        <div className="bg-[#12151c] border border-orange-500/30 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-orange-400" />
                Unique Referral Link
              </span>
              <span className="bg-emerald-500/10 text-emerald-400 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Auto-fills Code
              </span>
            </div>

            <div className="bg-[#181d28] border border-zinc-800 p-3.5 rounded-2xl space-y-2 mt-2">
              <p className="text-xs font-mono text-zinc-300 truncate bg-black/40 p-2 rounded-xl border border-zinc-800/80">
                {user?.referralLink}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={copyLink}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-black font-extrabold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center justify-center gap-1.5 bg-[#202736] hover:bg-[#2a3347] text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-zinc-700 transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-orange-400" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 mt-4">
            When friends click your link, your referral code is automatically attached to their registration.
          </p>
        </div>
      </div>

      {/* Referral Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#12151c] p-5 rounded-2xl border border-zinc-800">
          <p className="text-xs font-bold text-zinc-400 uppercase">Total Earnings</p>
          <p className="text-2xl font-black text-amber-400 mt-1">
            ₦{(stats?.totalReferralBonus || user?.totalReferralBonus || 0).toLocaleString()}
          </p>
          <p className="text-[10px] text-zinc-500 mt-1">Lifetime referral payouts</p>
        </div>

        <div className="bg-[#12151c] p-5 rounded-2xl border border-zinc-800">
          <p className="text-xs font-bold text-zinc-400 uppercase">Total Referrals</p>
          <p className="text-2xl font-black text-white mt-1">
            {stats?.totalReferrals || user?.totalReferrals || 0}
          </p>
          <p className="text-[10px] text-zinc-500 mt-1">Total referred members</p>
        </div>

        <div className="bg-[#12151c] p-5 rounded-2xl border border-zinc-800">
          <p className="text-xs font-bold text-zinc-400 uppercase">Successful</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {stats?.successfulReferrals || stats?.totalReferrals || user?.totalReferrals || 0}
          </p>
          <p className="text-[10px] text-zinc-500 mt-1">Credited & active</p>
        </div>

        <div className="bg-[#12151c] p-5 rounded-2xl border border-zinc-800">
          <p className="text-xs font-bold text-zinc-400 uppercase">Pending</p>
          <p className="text-2xl font-black text-zinc-400 mt-1">
            {stats?.pendingReferrals || 0}
          </p>
          <p className="text-[10px] text-zinc-500 mt-1">Awaiting registration</p>
        </div>
      </div>

      {/* Referred Users History List */}
      <div className="bg-[#12151c] border border-zinc-800 rounded-3xl p-6">
        <h3 className="font-extrabold text-white text-base mb-4 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-orange-400" />
          Referred Users History
        </h3>

        {loading ? (
          <div className="text-center py-10 text-zinc-500 text-xs">Loading referral logs...</div>
        ) : !stats?.referralsList || stats.referralsList.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 text-xs space-y-2">
            <Users className="w-10 h-10 mx-auto text-zinc-600 opacity-40" />
            <p className="font-bold text-zinc-400 text-sm">No Referred Members Yet</p>
            <p className="max-w-xs mx-auto">
              Share your referral link on social media to start earning ₦{bonusAmount.toLocaleString()} per friend!
            </p>
            <button
              onClick={() => setShowShareModal(true)}
              className="mt-3 inline-block bg-orange-500 text-black font-extrabold text-xs px-5 py-2.5 rounded-xl"
            >
              Share Link Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Referred User</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Bonus Earned</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-medium text-zinc-300">
                {stats.referralsList.map((ref) => (
                  <tr key={ref.id} className="hover:bg-[#181d28] transition-colors">
                    <td className="py-3 px-3 font-bold text-white">{ref.referredUserName}</td>
                    <td className="py-3 px-3 text-zinc-400">{ref.referredUserEmail}</td>
                    <td className="py-3 px-3 font-black text-amber-400">
                      +₦{ref.bonusAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {ref.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-zinc-500 text-[11px]">
                      {new Date(ref.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showShareModal && <ShareModal onClose={() => setShowShareModal(false)} />}
    </div>
  );
};
