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
    <div className="min-h-screen bg-[#100709] text-white font-sans selection:bg-[#A52A4A] selection:text-slate-950">
      {/* Top Notice Banner */}
      <div className="bg-gradient-to-r from-[#7A1831] via-[#A52A4A] to-[#7A1831] text-white py-2 px-4 text-center font-extrabold text-xs tracking-wide shadow-lg">
        🔥 Special Offer: Register now & earn ₦{bonusAmount.toLocaleString()} instantly per referral!
      </div>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7A1831]/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 nivo-glass-surface border border-[#C13A5A]/30 px-4 py-1.5 rounded-full text-xs font-bold text-[#C13A5A] mb-8 shadow-lg shadow-[#C13A5A]/10">
            <Sparkles className="w-4 h-4 text-[#C13A5A]" />
            <span>Premier Digital Earnings & Wallet App</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Earn, Manage & Withdraw Cash <span className="bg-gradient-to-r from-[#A52A4A] to-[#C13A5A] bg-clip-text text-transparent">Instantly</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Welcome to <strong className="text-white">Nevo</strong>. Earn guaranteed income by completing daily tasks and referring friends. Enjoy instant bank deposits and lightning-fast withdrawals 24/7.
          </p>

          {/* Action CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto bg-gradient-to-r from-[#7A1831] to-[#A52A4A] hover:from-[#8F1D3A] hover:to-[#C13A5A] text-white font-black text-base px-8 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-[#7A1831]/25"
              >
                <span>Go to My Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto bg-gradient-to-r from-[#7A1831] to-[#A52A4A] hover:from-[#8F1D3A] hover:to-[#C13A5A] text-white font-black text-base px-8 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-[#7A1831]/25"
                >
                  <span>Get Started Now</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto bg-[#240A12] hover:bg-[#240A12] text-white font-black text-base px-8 py-4 rounded-2xl border border-white/10 transition-colors"
                >
                  Sign In to Account
                </Link>
              </>
            )}
          </div>

          {/* Live Metrics Ticker */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-white/10">
            <div className="nivo-glass-surface p-6 rounded-3xl border border-white/10 shadow-xl">
              <p className="text-2xl font-black text-white font-mono">₦12.5M+</p>
              <p className="text-xs text-slate-400 mt-1">Total Paid Out</p>
            </div>
            <div className="nivo-glass-surface p-6 rounded-3xl border border-white/10 shadow-xl">
              <p className="text-2xl font-black text-[#C13A5A] font-mono">₦1,200</p>
              <p className="text-xs text-slate-400 mt-1">Per Referral Bonus</p>
            </div>
            <div className="nivo-glass-surface p-6 rounded-3xl border border-white/10 shadow-xl">
              <p className="text-2xl font-black text-white font-mono">48,000+</p>
              <p className="text-xs text-slate-400 mt-1">Active Members</p>
            </div>
            <div className="nivo-glass-surface p-6 rounded-3xl border border-white/10 shadow-xl">
              <p className="text-2xl font-black text-[#A52A4A] font-mono">Instant</p>
              <p className="text-xs text-slate-400 mt-1">Bank Payouts</p>
            </div>
          </div>
        </div>
      </section>

      {/* Referral System Feature Highlight */}
      <section className="py-16 bg-[#090506] border-y border-[#8F1D3A]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#240A12]/90 border border-[#8F1D3A]/30 rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-[#A52A4A]/10 text-[#C13A5A] border border-[#A52A4A]/20 px-3 py-1 rounded-full text-xs font-bold mb-4">
                  <Gift className="w-4 h-4" />
                  REAL REFERRAL SYSTEM
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                  Invite Friends & Earn <span className="text-[#C13A5A]">₦1,200</span> On Every Registration!
                </h2>
                <p className="text-slate-300 text-sm mt-4 leading-relaxed">
                  Every user automatically gets a unique referral code and referral link. Share your link via WhatsApp, Telegram, or social media. When someone registers through your link, your wallet is credited instantly!
                </p>

                <ul className="mt-6 space-y-2.5 text-xs font-semibold text-slate-200">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#A52A4A] shrink-0" />
                    Automatic wallet crediting upon new registration
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#A52A4A] shrink-0" />
                    Unique referral code & link generated automatically
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#A52A4A] shrink-0" />
                    1-Click Copy Code, Copy Link & Native Share buttons
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#A52A4A] shrink-0" />
                    Zero limit on referral earnings — invite unlimited friends
                  </li>
                </ul>
              </div>

              <div className="nivo-glass-surface p-6 rounded-2xl border border-[#8F1D3A]/20 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs text-slate-400 font-bold uppercase">Sample Referral Link</span>
                  <span className="text-xs text-[#C13A5A] font-bold">Live Backend</span>
                </div>
                <div className="bg-[#090506] p-3 rounded-xl border border-white/10 font-mono text-xs text-[#C13A5A] break-all">
                  https://nivocash.app/register?ref=NIVO9821X
                </div>
                <div className="bg-[#A52A4A]/10 border border-[#A52A4A]/20 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Referral Bonus Per User</p>
                    <p className="text-xl font-black text-white font-mono">₦1,200.00</p>
                  </div>
                  <span className="bg-gradient-to-r from-[#7A1831] to-[#A52A4A] text-white font-extrabold text-xs px-3 py-1.5 rounded-lg shadow-md">
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
          <h2 className="text-3xl font-black text-white">Why Choose Nevo?</h2>
          <p className="text-sm text-slate-400 mt-2">
            Built with modern fintech security and automated processing to guarantee you the best experience.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="nivo-glass-surface p-6 rounded-2xl border border-white/10 space-y-3 hover:border-[#8F1D3A]/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#8F1D3A]/10 text-[#C13A5A] flex items-center justify-center font-bold">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Instant Wallet System</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your wallet balance updates immediately whenever you complete tasks, earn referral bonuses, or deposit funds.
            </p>
          </div>

          <div className="nivo-glass-surface p-6 rounded-2xl border border-white/10 space-y-3 hover:border-[#8F1D3A]/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#A52A4A]/10 text-[#C13A5A] flex items-center justify-center font-bold">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Daily Tasks & Rewards</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Earn extra cash daily by following social channels, participating in surveys, checking in daily, and downloading apps.
            </p>
          </div>

          <div className="nivo-glass-surface p-6 rounded-2xl border border-white/10 space-y-3 hover:border-[#8F1D3A]/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#8F1D3A]/10 text-[#A52A4A] flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Bank Grade Security</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Protected routes, password hashing, and server-side verification keep your funds and personal data completely safe.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#090506] py-10 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#7A1831] to-[#C13A5A] flex items-center justify-center">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-black text-sm text-white">NEVO</span>
          </div>

          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Nevo. All rights reserved. Premium Digital Fintech Platform.
          </p>
        </div>
      </footer>
    </div>
  );
};
