import React from 'react';
import {
  ArrowRight,
  Wallet,
  CheckCircle2,
  Users,
  Sparkles,
  Landmark,
  Building2,
  CheckSquare,
  PlayCircle,
  History,
} from 'lucide-react';
import NevoLogo from '../components/NevoLogo';

interface LandingPageProps {
  navigateTo: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigateTo }) => {
  return (
    <main className="nevo-landing min-h-screen text-[#F2F5F4] overflow-x-hidden selection:bg-[#00C9A7]/30 selection:text-white">
      {/* -------------------- COMPACT BALANCED HEADER -------------------- */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#070A0D]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Left: Compact brand lockup */}
          <button
            onClick={() => navigateTo('/')}
            className="flex items-center text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C9A7]"
            aria-label="Nevo home"
          >
            <NevoLogo size={36} showName={true} compact={false} />
          </button>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#how-it-works" className="text-xs font-medium text-[#8E9A9A] hover:text-white transition-colors">
              How it works
            </a>
            <a href="#features" className="text-xs font-medium text-[#8E9A9A] hover:text-white transition-colors">
              Features
            </a>
          </nav>

          {/* Right: Balanced Action Pair */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              onClick={() => navigateTo('/login')}
              className="h-10 px-3.5 sm:px-4 rounded-xl text-xs font-semibold text-[#C4D0D0] hover:text-white hover:bg-white/5 border border-white/10 transition-all cursor-pointer flex items-center justify-center whitespace-nowrap"
            >
              Sign in
            </button>
            <button
              onClick={() => navigateTo('/register')}
              className="h-10 px-3.5 sm:px-4 rounded-xl text-xs font-bold nevo-primary-button transition-all cursor-pointer flex items-center justify-center whitespace-nowrap"
            >
              Create account
            </button>
          </div>
        </div>
      </header>

      {/* -------------------- HERO SECTION -------------------- */}
      <section className="relative mx-auto max-w-6xl px-4 pt-8 pb-12 sm:px-6 sm:pt-14 sm:pb-20 lg:px-8">
        <div className="nevo-orb nevo-orb-one" />
        <div className="nevo-orb nevo-orb-two" />

        <div className="relative grid items-center gap-8 lg:grid-cols-[1.1fr_.9fr] lg:gap-12">
          {/* Hero Copy */}
          <div>
            <div className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#00C9A7]">
              <Sparkles className="h-3.5 w-3.5 text-[#00C9A7]" />
              <span>Rewards & Wallet Platform</span>
            </div>

            <h1 className="font-display text-[32px] sm:text-[44px] lg:text-[52px] font-bold leading-[1.15] tracking-[-0.03em] text-white">
              Earn daily rewards.
              <span className="block bg-gradient-to-r from-[#00C9A7] via-[#2CE8BD] to-[#7EE8D3] bg-clip-text text-transparent">
                Manage your Naira wallet.
              </span>
            </h1>

            <p className="mt-3.5 max-w-md text-sm sm:text-base leading-relaxed text-[#9AA7A7]">
              Complete sponsored tasks, watch rewarded ads, invite friends, and manage your wallet balance with direct KoraPay funding and verified Nigerian bank withdrawals.
            </p>

            {/* Hero CTAs: Identical dimensions, typography, and corner radius */}
            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => navigateTo('/register')}
                className="h-12 w-full sm:w-48 rounded-xl text-sm font-semibold nevo-primary-button flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-[#00C9A7]/15"
              >
                <span>Get started</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigateTo('/login')}
                className="h-12 w-full sm:w-48 rounded-xl text-sm font-semibold nevo-secondary-button flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Sign in to Nevo</span>
              </button>
            </div>

            {/* Implemented Verification Points */}
            <div className="mt-6 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-[#7F8C8C]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#00C9A7]" />
                Direct KoraPay deposits
              </span>
              <span className="text-[#3A4545] hidden sm:inline">·</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#00C9A7]" />
                Verified Nigerian bank payouts
              </span>
              <span className="text-[#3A4545] hidden sm:inline">·</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#00C9A7]" />
                Daily tasks & referrals
              </span>
            </div>
          </div>

          {/* Product UI Preview: Represents Real Nevo Dashboard */}
          <div className="relative mx-auto w-full max-w-[390px] lg:max-w-none">
            <div className="nevo-phone-glow" />
            <div className="nevo-phone-shell rounded-[24px] p-2">
              <div className="rounded-[20px] border border-white/[0.08] bg-[#071114] p-4 sm:p-5">
                {/* Header in Preview */}
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2.5">
                    <img src="/nevo-logo.svg" alt="Nevo" className="h-8 w-8 rounded-lg" />
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">Nevo Wallet</p>
                      <p className="text-[10px] text-[#718080]">Live Account Overview</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-[#00C9A7] bg-[#00C9A7]/10 border border-[#00C9A7]/20 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>

                {/* Available Balance Card */}
                <div className="mt-3.5 rounded-xl border border-[#00C9A7]/20 bg-gradient-to-br from-[#0E2928] via-[#09201F] to-[#071114] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.05)]">
                  <div className="flex items-center justify-between text-xs text-[#90A0A0]">
                    <span>Available Balance</span>
                    <Wallet className="h-4 w-4 text-[#00C9A7]" />
                  </div>
                  <div className="mt-1.5 font-display text-2xl sm:text-3xl font-bold tracking-tight text-white tabular-nums">
                    ₦0.00
                  </div>
                  <div className="mt-3.5 grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-white/[0.06] bg-black/25 py-2 px-2 text-center">
                      <Landmark className="mx-auto h-3.5 w-3.5 text-[#7EE8D3]" />
                      <span className="mt-1 block text-[10px] text-[#91A0A0] font-medium">KoraPay Deposit</span>
                    </div>
                    <div className="rounded-lg border border-white/[0.06] bg-black/25 py-2 px-2 text-center">
                      <Building2 className="mx-auto h-3.5 w-3.5 text-[#7EE8D3]" />
                      <span className="mt-1 block text-[10px] text-[#91A0A0] font-medium">Bank Payout</span>
                    </div>
                  </div>
                </div>

                {/* Real Modules in Nevo */}
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 text-center">
                    <CheckSquare className="mx-auto h-3.5 w-3.5 text-[#7EE8D3]" />
                    <p className="mt-1 text-[10px] text-[#849292]">Tasks</p>
                    <p className="text-[11px] font-bold text-white">Daily</p>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 text-center">
                    <Users className="mx-auto h-3.5 w-3.5 text-[#7EE8D3]" />
                    <p className="mt-1 text-[10px] text-[#849292]">Referrals</p>
                    <p className="text-[11px] font-bold text-white">Bonus</p>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 text-center">
                    <PlayCircle className="mx-auto h-3.5 w-3.5 text-[#7EE8D3]" />
                    <p className="mt-1 text-[10px] text-[#849292]">Ads</p>
                    <p className="text-[11px] font-bold text-white">Rewarded</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------- HOW NEVO WORKS (ACCURATE TO SOURCE CODE) -------------------- */}
      <section id="how-it-works" className="border-t border-white/[0.06] bg-white/[0.01] py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#00C9A7]">
              Real User Flow
            </p>
            <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              How Nevo works
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#8E9A9A] leading-relaxed">
              Transparent, straightforward steps to earn rewards and access your Naira balance.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: '01',
                title: 'Create your account',
                description: 'Sign up with email and password, then set your 4-digit PIN to secure your wallet operations.',
              },
              {
                step: '02',
                title: 'Earn rewards',
                description: 'Complete sponsored micro-tasks, watch rewarded video adverts, or invite friends using your referral code.',
              },
              {
                step: '03',
                title: 'Fund via KoraPay',
                description: 'Make secure wallet deposits (minimum ₦520) via KoraPay bank transfer or card checkout whenever needed.',
              },
              {
                step: '04',
                title: 'Withdraw to your bank',
                description: 'Request payouts directly to your verified Nigerian commercial or digital bank account with NUBAN name confirmation.',
              },
            ].map(({ step, title, description }) => (
              <div key={step} className="nevo-step-card rounded-xl p-4 sm:p-5 flex flex-col justify-between">
                <div>
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#00C9A7]/10 text-xs font-mono font-bold text-[#7EE8D3]">
                    {step}
                  </span>
                  <h3 className="mt-3 text-sm font-bold text-white">{title}</h3>
                  <p className="mt-1.5 text-xs text-[#849191] leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------- REAL IMPLEMENTED FEATURES -------------------- */}
      <section id="features" className="border-t border-white/[0.06] py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#00C9A7]">
              Platform Capabilities
            </p>
            <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Implemented platform features
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#8E9A9A] leading-relaxed">
              Active core features available directly within your verified account dashboard.
            </p>
          </div>

          <div className="mt-8 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Landmark,
                title: 'KoraPay Wallet Deposits',
                description: 'Fund your wallet starting from ₦520 through official KoraPay checkout rails with instant webhook balance credit.',
              },
              {
                icon: Building2,
                title: 'Verified Bank Withdrawals',
                description: 'Transfer earnings directly to your Nigerian commercial or digital bank account (OPay, PalmPay, Kuda, GTBank) after real-time NUBAN verification.',
              },
              {
                icon: CheckSquare,
                title: 'Sponsored Micro-Tasks',
                description: 'Browse tasks with timer-based or proof-based verification to earn guaranteed cash rewards credited directly to your balance.',
              },
              {
                icon: Users,
                title: 'Referral Rewards Program',
                description: 'Share your personal referral code and invite link. Track invite counts and bonus earnings in real time on your dashboard.',
              },
              {
                icon: PlayCircle,
                title: 'Rewarded Video Ads',
                description: 'Engage with partner adverts to earn instant micro-rewards verified through session tokens and credited to your wallet.',
              },
              {
                icon: History,
                title: 'Full Transaction History',
                description: 'Search and filter all deposits, withdrawals, task rewards, and referral credits with transparent status tracking.',
              },
            ].map(({ icon: Icon, title, description }) => (
              <div key={title} className="nevo-feature-card rounded-xl p-4 sm:p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#00C9A7]/20 bg-[#00C9A7]/[0.08] text-[#7EE8D3]">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="mt-3 text-sm font-bold text-white">{title}</h3>
                <p className="mt-1.5 text-xs text-[#849191] leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------- FINAL CALL TO ACTION -------------------- */}
      <section className="border-t border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Ready to get started?
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#8E9A9A] max-w-md mx-auto leading-relaxed">
            Create your account in under a minute to start completing tasks, earning referral bonuses, and managing your wallet.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigateTo('/register')}
              className="h-12 w-full sm:w-48 rounded-xl text-sm font-semibold nevo-primary-button flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-[#00C9A7]/15"
            >
              <span>Get started</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigateTo('/login')}
              className="h-12 w-full sm:w-48 rounded-xl text-sm font-semibold nevo-secondary-button flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>Sign in to Nevo</span>
            </button>
          </div>
        </div>
      </section>

      {/* -------------------- FOOTER -------------------- */}
      <footer className="border-t border-white/[0.06] bg-[#070A0D]">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:px-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-2.5">
            <NevoLogo size={26} showName={true} compact={true} />
            <span className="text-[11px] text-[#6E7A7A]">· Rewards & Wallet Platform</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[#748080]">
            <button onClick={() => navigateTo('/terms')} className="hover:text-white transition-colors cursor-pointer">
              Terms
            </button>
            <button onClick={() => navigateTo('/privacy')} className="hover:text-white transition-colors cursor-pointer">
              Privacy
            </button>
            <button onClick={() => navigateTo('/login')} className="hover:text-white transition-colors cursor-pointer">
              Sign in
            </button>
            <button onClick={() => navigateTo('/Boris/login')} className="hover:text-white transition-colors cursor-pointer text-[#4A5555]">
              Admin
            </button>
          </div>
        </div>
      </footer>
    </main>
  );
};
