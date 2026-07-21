import React from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Users,
  ShieldCheck,
  Wallet,
  ArrowRight,
  Sparkles,
  Gift,
  CheckCircle2,
  Lock,
  Smartphone,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { user, settings } = useAuth();
  const bonusAmount = settings?.referralBonusAmount || 1200;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">
      {/* Top Notice Banner */}
      <div className="bg-gradient-to-r from-[#F27D26] via-[#E6721F] to-[#F27D26] text-black py-2 px-4 text-center font-bold text-xs tracking-wide">
        🔥 Special Offer: Register now & earn ₦{bonusAmount.toLocaleString()} instantly per referral!
      </div>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
        <div className="inline-flex items-center gap-2 bg-[#141414] border border-white/5 px-4 py-1.5 rounded-full text-xs font-bold text-[#F27D26] mb-8">
          <Sparkles className="w-4 h-4 text-[#F27D26]" />
          <span>Premier Digital Earnings & Wallet App</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] max-w-4xl mx-auto">
          Earn, Manage & Withdraw Cash <span className="text-[#F27D26]">Instantly</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Welcome to <strong className="text-white">Nivo Cash App</strong>. Earn guaranteed income by completing daily tasks and referring friends. Enjoy instant bank deposits and lightning-fast withdrawals 24/7.
        </p>

        {/* Action CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {user ? (
            <Link
              to="/dashboard"
              className="w-full sm:w-auto bg-[#F27D26] hover:bg-[#E6721F] text-black font-bold text-base px-8 py-4 rounded-2xl flex items-center justify-center gap-3 transition-colors"
            >
              <span>Go to My Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="w-full sm:w-auto bg-[#F27D26] hover:bg-[#E6721F] text-black font-bold text-base px-8 py-4 rounded-2xl flex items-center justify-center gap-3 transition-colors"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto bg-[#141414] hover:bg-white/5 text-white font-bold text-base px-8 py-4 rounded-2xl border border-white/5 transition-colors"
              >
                Sign In to Account
              </Link>
            </>
          )}
        </div>

        {/* Live Metrics Ticker */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-white/5">
          <div className="bg-[#141414] p-6 rounded-3xl border border-white/5">
            <p className="text-2xl font-bold text-white">₦12.5M+</p>
            <p className="text-xs text-gray-400 mt-1">Total Paid Out</p>
          </div>
          <div className="bg-[#141414] p-6 rounded-3xl border border-white/5">
            <p className="text-2xl font-bold text-[#F27D26]">₦1,200</p>
            <p className="text-xs text-gray-400 mt-1">Per Referral Bonus</p>
          </div>
          <div className="bg-[#141414] p-6 rounded-3xl border border-white/5">
            <p className="text-2xl font-bold text-white">48,000+</p>
            <p className="text-xs text-gray-400 mt-1">Active Members</p>
          </div>
          <div className="bg-[#141414] p-6 rounded-3xl border border-white/5">
            <p className="text-2xl font-bold text-green-500">Instant</p>
            <p className="text-xs text-gray-400 mt-1">Bank Payouts</p>
          </div>
        </div>
      </section>

      {/* Referral System Feature Highlight */}
      <section className="py-16 bg-[#0d0f14] border-y border-orange-500/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#181d28] via-[#12151c] to-[#181d28] border border-orange-500/30 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full text-xs font-bold mb-4">
                  <Gift className="w-4 h-4" />
                  REAL REFERRAL SYSTEM
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                  Invite Friends & Earn <span className="text-orange-400">₦1,200</span> On Every Registration!
                </h2>
                <p className="text-zinc-400 text-sm mt-4 leading-relaxed">
                  Every user automatically gets a unique referral code and referral link. Share your link via WhatsApp, Telegram, or social media. When someone registers through your link, your wallet is credited instantly!
                </p>

                <ul className="mt-6 space-y-2.5 text-xs font-semibold text-zinc-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    Automatic wallet crediting upon new registration
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    Unique referral code & link generated automatically
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    1-Click Copy Code, Copy Link & Native Share buttons
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    Zero limit on referral earnings — invite unlimited friends
                  </li>
                </ul>
              </div>

              <div className="bg-[#0b0d11] p-6 rounded-2xl border border-orange-500/20 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <span className="text-xs text-zinc-400 font-bold uppercase">Sample Referral Link</span>
                  <span className="text-xs text-orange-400 font-bold">Live Backend</span>
                </div>
                <div className="bg-[#161a23] p-3 rounded-xl border border-zinc-800 font-mono text-xs text-amber-400 break-all">
                  https://nivocash.app/register?ref=NIVO9821X
                </div>
                <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-400">Referral Bonus Per User</p>
                    <p className="text-xl font-black text-white">₦1,200.00</p>
                  </div>
                  <span className="bg-orange-500 text-black font-extrabold text-xs px-3 py-1.5 rounded-lg shadow-md">
                    Instant Credit
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-black text-white">Why Choose Nivo Cash App?</h2>
          <p className="text-sm text-zinc-400 mt-2">
            Built with modern fintech security and automated processing to guarantee you the best experience.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-[#12151c] p-6 rounded-2xl border border-zinc-800/80 space-y-3 hover:border-orange-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Instant Wallet System</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your wallet balance updates immediately whenever you complete tasks, earn referral bonuses, or deposit funds.
            </p>
          </div>

          <div className="bg-[#12151c] p-6 rounded-2xl border border-zinc-800/80 space-y-3 hover:border-orange-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Daily Tasks & Rewards</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Earn extra cash daily by following social channels, participating in surveys, checking in daily, and downloading apps.
            </p>
          </div>

          <div className="bg-[#12151c] p-6 rounded-2xl border border-zinc-800/80 space-y-3 hover:border-orange-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Bank Grade Security</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Protected routes, password hashing, and server-side verification keep your funds and personal data completely safe.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-[#06080b] py-10 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-black fill-black" />
            </div>
            <span className="font-extrabold text-sm text-white">NIVO CASH APP</span>
          </div>

          <p className="text-xs text-zinc-500">
            © {new Date().getFullYear()} Nivo Cash App. All rights reserved. Premium Digital Fintech Platform.
          </p>

          <Link to="/admin/login" className="text-xs text-zinc-600 hover:text-amber-400 transition-colors">
            Admin Portal
          </Link>
        </div>
      </footer>
    </div>
  );
};
