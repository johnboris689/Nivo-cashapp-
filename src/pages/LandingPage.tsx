import React from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Wallet,
  CheckCircle2,
  Users,
  Sparkles,
  Landmark,
  Smartphone,
  LockKeyhole,
  ChevronRight,
} from 'lucide-react';

interface LandingPageProps {
  navigateTo: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigateTo }) => {
  return (
    <main className="nevo-landing min-h-screen text-white overflow-x-hidden">
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#070A0D]/75 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <button onClick={() => navigateTo('/')} className="flex items-center gap-3 cursor-pointer" aria-label="Nevo home">
            <img src="/nevo-logo.svg" alt="Nevo" className="h-11 w-11 rounded-2xl shadow-[0_0_30px_rgba(0,201,167,.18)]" />
            <div className="text-left">
              <div className="font-display text-xl font-bold tracking-tight">Nevo</div>
              <div className="text-[9px] uppercase tracking-[0.28em] text-[#8E9A9A]">Financial freedom</div>
            </div>
          </button>

          <div className="hidden items-center gap-7 md:flex">
            <a href="#features" className="text-xs font-semibold text-[#8E9A9A] hover:text-white">Features</a>
            <a href="#how-it-works" className="text-xs font-semibold text-[#8E9A9A] hover:text-white">How it works</a>
            <a href="#security" className="text-xs font-semibold text-[#8E9A9A] hover:text-white">Security</a>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => navigateTo('/login')} className="rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#B8C4C4] hover:bg-white/5 hover:text-white cursor-pointer">Sign in</button>
            <button onClick={() => navigateTo('/register')} className="nevo-primary-button rounded-xl px-4 py-2.5 text-xs font-extrabold cursor-pointer">Create account</button>
          </div>
        </div>
      </header>

      <section className="relative mx-auto max-w-6xl px-5 pb-20 pt-14 sm:px-8 sm:pt-20 lg:pb-28">
        <div className="nevo-orb nevo-orb-one" />
        <div className="nevo-orb nevo-orb-two" />
        <div className="relative grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#00C9A7]/20 bg-[#00C9A7]/[0.06] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#7EE8D3]">
              <Sparkles className="h-3.5 w-3.5" />
              A smarter way to manage your money
            </div>
            <h1 className="max-w-3xl font-display text-5xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              Your wallet.
              <span className="block text-[#7EE8D3]">Your everyday flow.</span>
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-[#9BA8A8] sm:text-base">
              Nevo brings your wallet, deposits, withdrawals, tasks, referrals and transaction history into one focused fintech experience.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => navigateTo('/register')} className="nevo-primary-button flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-extrabold cursor-pointer">
                Get started <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => navigateTo('/login')} className="nevo-secondary-button flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold cursor-pointer">
                Sign in to Nevo
              </button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[10px] font-semibold text-[#7F8C8C]">
              <span className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-[#00C9A7]" /> Real account data</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-[#00C9A7]" /> Secure payment flow</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-[#00C9A7]" /> Mobile-first</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[440px] lg:ml-auto">
            <div className="nevo-phone-glow" />
            <div className="nevo-phone-shell rounded-[32px] p-2">
              <div className="rounded-[26px] border border-white/[0.07] bg-[#071114] p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img src="/nevo-logo.svg" alt="" className="h-9 w-9 rounded-xl" />
                    <div><p className="text-xs font-bold">Nevo</p><p className="text-[9px] text-[#718080]">Wallet overview</p></div>
                  </div>
                  <span className="rounded-full border border-[#00C9A7]/20 bg-[#00C9A7]/[0.06] px-2 py-1 text-[8px] font-bold text-[#7EE8D3]">Verified</span>
                </div>
                <div className="mt-5 rounded-[22px] border border-[#00C9A7]/20 bg-gradient-to-br from-[#0E2928] via-[#09201F] to-[#071114] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.04)]">
                  <div className="flex items-center justify-between text-[9px] text-[#90A0A0]"><span>Available balance</span><Wallet className="h-4 w-4 text-[#00C9A7]" /></div>
                  <div className="mt-2 font-display text-3xl font-semibold tracking-tight">₦—</div>
                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {[
                      ['Deposit', Landmark],
                      ['Withdraw', ArrowRight],
                      ['History', ChevronRight],
                    ].map(([label, Icon]: any) => (
                      <div key={label} className="rounded-xl border border-white/[0.06] bg-black/20 p-2.5 text-center">
                        <Icon className="mx-auto h-4 w-4 text-[#7EE8D3]" />
                        <span className="mt-1 block text-[8px] text-[#91A0A0]">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3"><Users className="h-4 w-4 text-[#7EE8D3]" /><p className="mt-2 text-[9px] text-[#849292]">Referrals</p><p className="mt-1 text-sm font-bold">Your data</p></div>
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3"><Sparkles className="h-4 w-4 text-[#7EE8D3]" /><p className="mt-2 text-[9px] text-[#849292]">Tasks</p><p className="mt-1 text-sm font-bold">Live tasks</p></div>
                </div>
                <div className="mt-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 text-[9px] text-[#7B8888]">Sign in to see your actual wallet balance and account activity.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-y border-white/[0.05] bg-white/[0.012] py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="max-w-2xl"><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#00C9A7]">Built around your account</p><h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Everything important stays in one place.</h2><p className="mt-4 text-sm leading-6 text-[#8E9A9A]">The interface is designed around the real services already available in your Nevo account.</p></div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              [Wallet, 'Wallet & balance', 'See your current wallet balance and account activity from the same persistent account.'],
              [Landmark, 'Deposits & withdrawals', 'Use the live payment and bank withdrawal flows connected to your account.'],
              [Users, 'Referrals', 'Use your real referral code and track referral activity from your account.'],
              [Sparkles, 'Tasks & rewards', 'Browse available tasks and rewards that are managed through the platform.'],
              [ShieldCheck, 'Account security', 'Authentication, password recovery and account controls stay part of the product.'],
              [Smartphone, 'Mobile-first', 'A responsive experience designed to feel natural on phones, tablets and desktop.'],
            ].map(([Icon, title, text]: any) => (
              <div key={title} className="nevo-feature-card rounded-3xl p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#00C9A7]/20 bg-[#00C9A7]/[0.07] text-[#7EE8D3]"><Icon className="h-5 w-5" /></div>
                <h3 className="mt-5 text-sm font-bold">{title}</h3><p className="mt-2 text-xs leading-6 text-[#849191]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#00C9A7]">Simple by design</p><h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">From account creation to everyday wallet actions.</h2></div>
          <div className="space-y-3">
            {[
              ['01', 'Create your Nevo account', 'Register with your account details and keep your credentials secure.'],
              ['02', 'Use your wallet', 'Deposit, review activity and manage available wallet actions.'],
              ['03', 'Explore tasks & referrals', 'Use the real task and referral systems available to your account.'],
              ['04', 'Withdraw when eligible', 'Complete the real withdrawal flow using your verified bank details.'],
            ].map(([num, title, text]) => (
              <div key={num} className="nevo-step-card flex gap-4 rounded-2xl p-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#00C9A7]/[0.08] text-[10px] font-bold text-[#7EE8D3]">{num}</span><div><p className="text-xs font-bold">{title}</p><p className="mt-1 text-[10px] leading-5 text-[#7F8C8C]">{text}</p></div></div>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="border-y border-white/[0.05] bg-[#081113] py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div className="rounded-[28px] border border-[#00C9A7]/15 bg-[#070A0D]/70 p-7 shadow-[0_25px_80px_rgba(0,0,0,.28)]">
            <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00C9A7]/[0.08] text-[#7EE8D3]"><LockKeyhole className="h-6 w-6" /></div><div><p className="text-sm font-bold">Your account stays yours</p><p className="text-[10px] text-[#7F8C8C]">Security-first product language</p></div></div>
            <div className="mt-7 space-y-3">{['Protected account credentials','Verified transaction flows','Persistent account records','Clear transaction history'].map(item => <div key={item} className="flex items-center gap-2 text-xs text-[#B3BEBE]"><CheckCircle2 className="h-4 w-4 text-[#00C9A7]" />{item}</div>)}</div>
          </div>
          <div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#00C9A7]">A calmer fintech experience</p><h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Less clutter. More clarity.</h2><p className="mt-5 max-w-xl text-sm leading-7 text-[#8E9A9A]">Nevo uses a restrained smoky glass interface so balances, actions, tasks and account information remain easy to find without sacrificing the premium feel.</p><button onClick={() => navigateTo('/register')} className="nevo-primary-button mt-7 inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-extrabold cursor-pointer">Create your account <ArrowRight className="h-4 w-4" /></button></div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3"><img src="/nevo-logo.svg" alt="Nevo" className="h-9 w-9 rounded-xl" /><div><p className="text-sm font-bold">Nevo</p><p className="text-[9px] uppercase tracking-[0.2em] text-[#6E7A7A]">Financial freedom in your hands</p></div></div>
        <div className="flex flex-wrap gap-4 text-[10px] font-semibold text-[#748080]"><button onClick={() => navigateTo('/terms')} className="hover:text-white cursor-pointer">Terms</button><button onClick={() => navigateTo('/privacy')} className="hover:text-white cursor-pointer">Privacy</button><button onClick={() => navigateTo('/login')} className="hover:text-white cursor-pointer">Sign in</button></div>
      </footer>
    </main>
  );
};
