import React from 'react';
import { ArrowRight, ShieldCheck, Wallet, Zap, Users, CheckCircle2, LockKeyhole, Smartphone, Sparkles } from 'lucide-react';
import NevoLogo from './NevoLogo';

interface LandingPageProps { navigateTo: (path: string) => void; }

const features = [
  { icon: Wallet, title: 'One clear wallet', text: 'See your real balance, deposits, withdrawals and activity in one focused place.' },
  { icon: Zap, title: 'Fast payments', text: 'Fund your wallet through the live KoraPay checkout and keep verification server-side.' },
  { icon: Users, title: 'Earn with purpose', text: 'Discover live tasks, rewards and referrals from the same account you already use.' },
  { icon: ShieldCheck, title: 'Built around security', text: 'Account controls, verification and transaction records stay at the centre of the experience.' },
];

export default function LandingPage({ navigateTo }: LandingPageProps) {
  return (
    <div className="nevo-landing min-h-screen overflow-hidden text-white">
      <div className="nevo-landing-orb nevo-landing-orb-a" />
      <div className="nevo-landing-orb nevo-landing-orb-b" />
      <header className="relative z-20 border-b border-white/[0.07] bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
          <NevoLogo size={42} compact />
          <nav className="hidden items-center gap-7 text-sm text-slate-300 md:flex">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#security" className="hover:text-white transition">Security</a>
            <a href="#how-it-works" className="hover:text-white transition">How it works</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => navigateTo('/login')} className="rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/5 hover:text-white">Sign in</button>
            <button onClick={() => navigateTo('/register')} className="nevo-primary-button rounded-xl px-4 py-2.5 text-sm font-bold">Create account <ArrowRight className="ml-1.5 inline h-4 w-4" /></button>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 pb-20 pt-16 sm:px-8 sm:pt-20 lg:grid-cols-[1.05fr_.95fr] lg:px-10 lg:pb-28 lg:pt-28">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,.9)]" /> A smarter Nigerian wallet
            </div>
            <h1 className="max-w-3xl font-display text-5xl font-bold leading-[1.02] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
              Your money.<br /><span className="nevo-gradient-text">Your next move.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Nevo brings your wallet, payments, earning opportunities and everyday money tools into one calm, premium experience designed for real life.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => navigateTo('/register')} className="nevo-primary-button rounded-2xl px-6 py-3.5 text-sm font-black sm:text-base">Get started free <ArrowRight className="ml-2 inline h-5 w-5" /></button>
              <button onClick={() => navigateTo('/login')} className="nevo-secondary-button rounded-2xl px-6 py-3.5 text-sm font-bold sm:text-base">I already have an account</button>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-emerald-300" /> Secure account controls</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Real transaction history</span>
            </div>
          </div>

          <div id="how-it-works" className="relative mx-auto w-full max-w-[520px] lg:justify-self-end">
            <div className="nevo-hero-card relative overflow-hidden rounded-[32px] border border-emerald-300/15 p-5 sm:p-7">
              <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" />
              <div className="relative z-10 flex items-center justify-between">
                <NevoLogo size={34} compact />
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Wallet ready</span>
              </div>
              <div className="relative z-10 mt-10 rounded-[26px] border border-emerald-300/20 bg-gradient-to-br from-[#13201e] via-[#0c1515] to-[#08100f] p-6 shadow-[0_25px_70px_rgba(0,0,0,.45)]">
                <div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Available balance</p><div className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">₦0.00</div></div><div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.07] p-3 text-emerald-300"><Wallet className="h-5 w-5" /></div></div>
                <div className="mt-7 grid grid-cols-2 gap-3"><div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3"><p className="text-[10px] uppercase tracking-wider text-slate-500">Deposit</p><p className="mt-1 text-sm font-bold text-white">KoraPay</p></div><div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3"><p className="text-[10px] uppercase tracking-wider text-slate-500">Status</p><p className="mt-1 text-sm font-bold text-emerald-300">Verified</p></div></div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.05]"><div className="h-full w-[72%] rounded-full bg-gradient-to-r from-emerald-500/70 to-teal-300/80" /></div>
              </div>
              <div className="relative z-10 mt-4 grid grid-cols-3 gap-3">
                {[['01','Fund'],['02','Earn'],['03','Withdraw']].map(([n,t]) => <div key={n} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3"><span className="text-[9px] font-mono text-emerald-300">{n}</span><p className="mt-1 text-xs font-bold text-white">{t}</p></div>)}
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto w-full max-w-7xl px-5 pb-20 sm:px-8 lg:px-10 lg:pb-28">
          <div className="mb-8 max-w-2xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-300">Everything in one place</p><h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">Simple enough to use. Serious enough to trust.</h2></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{features.map(({icon:Icon,title,text}) => <article key={title} className="nevo-feature-card rounded-3xl p-5"><div className="mb-6 flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.06] text-emerald-300"><Icon className="h-5 w-5" /></div><h3 className="font-display text-base font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{text}</p></article>)}</div>
        </section>

        <section id="security" className="border-y border-white/[0.06] bg-white/[0.015]">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:px-10 lg:py-20">
            <div><div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.07] text-emerald-300"><ShieldCheck className="h-6 w-6" /></div><h2 className="mt-5 font-display text-3xl font-bold">Designed around real account activity.</h2><p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">Nevo keeps the interface beautiful without pretending that money movement is a simulation. Your account, wallet and transaction states come from the application backend.</p></div>
            <div className="grid gap-3 sm:grid-cols-2">{['KoraPay checkout for deposits','Server-side payment verification','Verified bank-account withdrawal flow','Persistent account and transaction records'].map((item) => <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-black/20 p-4"><CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" /><span className="text-sm font-semibold text-slate-200">{item}</span></div>)}</div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-5 py-20 text-center sm:px-8 lg:px-10 lg:py-28"><Sparkles className="mx-auto h-7 w-7 text-emerald-300" /><h2 className="mt-4 font-display text-3xl font-bold sm:text-5xl">Ready when you are.</h2><p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-400">Create your Nevo account and step into the redesigned experience.</p><button onClick={() => navigateTo('/register')} className="nevo-primary-button mt-7 rounded-2xl px-7 py-3.5 text-sm font-black">Create your Nevo account <ArrowRight className="ml-2 inline h-4 w-4" /></button></section>
      </main>
      <footer className="relative z-10 border-t border-white/[0.06] px-5 py-8 sm:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><NevoLogo size={32} compact /><div className="flex flex-wrap gap-4 text-xs text-slate-500"><button onClick={() => navigateTo('/terms')} className="hover:text-slate-300">Terms</button><button onClick={() => navigateTo('/privacy')} className="hover:text-slate-300">Privacy</button><button onClick={() => navigateTo('/login')} className="hover:text-slate-300">Sign in</button></div><p className="text-xs text-slate-600">© 2026 Nevo</p></div></footer>
    </div>
  );
}
