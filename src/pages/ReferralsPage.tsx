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
    <div className="space-y-5 animate-fade-in pb-20">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-[#C13A5A]" />
            Referral Program & Earnings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Earn ₦{bonusAmount.toLocaleString()} instantly for every friend who registers with your link
          </p>
        </div>

        <button
          onClick={() => setShowShareModal(true)}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#008F7A] to-[#00BFA6] hover:from-[#00C9A7] hover:to-[#C13A5A] text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-lg shadow-[#008F7A]/25 cursor-pointer transition-all hover:scale-105 shrink-0"
        >
          <Share2 className="w-4 h-4" />
          <span>Share Link Now</span>
        </button>
      </div>

      {/* Referral Link & Code Cards Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Referral Code Box */}
        <div className="nivo-glass-surface border border-[#00C9A7]/30 rounded-3xl p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-[#C13A5A] uppercase tracking-wider flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-[#C13A5A]" />
                Your Referral Code
              </span>
              <span className="bg-[#00BFA6]/10 text-[#C13A5A] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#00BFA6]/20">
                Active
              </span>
            </div>

            <div className="nivo-glass-surface border border-white/10 p-4 rounded-2xl flex items-center justify-between mt-2">
              <span className="text-2xl font-mono font-black text-white tracking-widest">
                {user?.referralCode || 'NIVO123'}
              </span>
              <button
                onClick={copyCode}
                className="flex items-center gap-1.5 bg-gradient-to-r from-[#008F7A] to-[#00BFA6] hover:from-[#00C9A7] hover:to-[#C13A5A] text-white font-black text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-[#008F7A]/20"
              >
                {copiedCode ? <Check className="w-4 h-4 text-[#00BFA6]" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
            Friends can enter this code manually in the registration form to credit you.
          </p>
        </div>

        {/* Referral Link Box */}
        <div className="nivo-glass-surface border border-[#00C9A7]/30 rounded-3xl p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-[#C13A5A] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#C13A5A]" />
                Unique Referral Link
              </span>
              <span className="bg-[#00C9A7]/10 text-[#00BFA6] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#00C9A7]/20">
                Auto-fills Code
              </span>
            </div>

            <div className="nivo-glass-surface border border-white/10 p-3.5 rounded-2xl space-y-2 mt-2">
              <p className="text-xs font-mono text-slate-300 truncate bg-[#090506] p-2 rounded-xl border border-white/10">
                {user?.referralLink}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={copyLink}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#008F7A] to-[#00BFA6] hover:from-[#00C9A7] hover:to-[#C13A5A] text-white font-black text-xs py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-[#00BFA6]" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center justify-center gap-1.5 bg-[#071114] hover:bg-[#0D1B1C] text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-white/10 transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-[#C13A5A]" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
            When friends click your link, your referral code is automatically attached to their registration.
          </p>
        </div>
      </div>

      {/* Referral Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="nivo-glass-surface p-4 sm:p-5 rounded-2xl border border-white/10 shadow-lg">
          <p className="text-xs font-bold text-slate-400 uppercase">Total Earnings</p>
          <p className="text-2xl font-black text-[#C13A5A] mt-1">
            ₦{(stats?.totalReferralBonus || user?.totalReferralBonus || 0).toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Lifetime referral payouts</p>
        </div>

        <div className="nivo-glass-surface p-4 sm:p-5 rounded-2xl border border-white/10 shadow-lg">
          <p className="text-xs font-bold text-slate-400 uppercase">Total Referrals</p>
          <p className="text-2xl font-black text-white mt-1">
            {stats?.totalReferrals || user?.totalReferrals || 0}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Total referred members</p>
        </div>

        <div className="nivo-glass-surface p-4 sm:p-5 rounded-2xl border border-white/10 shadow-lg">
          <p className="text-xs font-bold text-slate-400 uppercase">Successful</p>
          <p className="text-2xl font-black text-[#00BFA6] mt-1">
            {stats?.successfulReferrals || stats?.totalReferrals || user?.totalReferrals || 0}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Credited & active</p>
        </div>

        <div className="nivo-glass-surface p-4 sm:p-5 rounded-2xl border border-white/10 shadow-lg">
          <p className="text-xs font-bold text-slate-400 uppercase">Pending</p>
          <p className="text-2xl font-black text-slate-400 mt-1">
            {stats?.pendingReferrals || 0}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Awaiting registration</p>
        </div>
      </div>

      {/* Referred Users History List */}
      <div className="nivo-glass-surface border border-white/10 rounded-3xl p-5 shadow-xl">
        <h3 className="font-extrabold text-white text-base mb-4 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-[#C13A5A]" />
          Referred Users History
        </h3>

        {loading ? (
          <div className="text-center py-10 text-slate-500 text-xs font-semibold">Loading referral logs...</div>
        ) : !stats?.referralsList || stats.referralsList.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs space-y-2">
            <Users className="w-10 h-10 mx-auto text-slate-600 opacity-40" />
            <p className="font-bold text-slate-300 text-sm">No Referred Members Yet</p>
            <p className="max-w-xs mx-auto text-slate-400">
              Share your referral link on social media to start earning ₦{bonusAmount.toLocaleString()} per friend!
            </p>
            <button
              onClick={() => setShowShareModal(true)}
              className="mt-3 inline-block bg-gradient-to-r from-[#008F7A] to-[#00BFA6] hover:from-[#00C9A7] hover:to-[#C13A5A] text-white font-extrabold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
            >
              Share Link Now
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {stats.referralsList.map((ref) => (
              <div
                key={ref.id}
                className="p-3.5 rounded-2xl nivo-glass-surface border border-white/5 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-extrabold text-white">{ref.referredUserName}</p>
                  <p className="text-[10px] text-slate-400">{ref.referredUserEmail}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {new Date(ref.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-[#00BFA6]">+₦{ref.bonusAmount.toLocaleString()}</p>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#00C9A7]/10 text-[#00BFA6] border border-[#00C9A7]/20 inline-block mt-0.5">
                    {ref.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showShareModal && <ShareModal onClose={() => setShowShareModal(false)} />}
    </div>
  );
};
