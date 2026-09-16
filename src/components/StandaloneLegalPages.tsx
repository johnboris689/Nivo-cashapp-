import React, { useEffect, useState } from 'react';
import { ShieldCheck, Scale, Mail, Home, ExternalLink, AlertTriangle } from 'lucide-react';
import GlassCard from './GlassCard';
import { getCachedSettings, fetchMasterSettings } from '../services/settingsService';

interface StandalonePageProps {
  navigateTo: (path: string) => void;
}

export function StandaloneTermsPage({ navigateTo }: StandalonePageProps) {
  const [settings, setSettings] = useState(getCachedSettings());

  useEffect(() => {
    fetchMasterSettings().then((s) => setSettings(s));
  }, []);

  const brandName = 'Nevo';
  const supportEmail = settings.supportEmail || 'support@nevo.ng';
  const telegramLink = settings.telegramLink || 'https://t.me/nevo_official';

  useEffect(() => {
    document.title = `Terms of Service | ${brandName}`;
  }, []);

  const [activeSection, setActiveSection] = useState<string>('eligibility');

  const sections = [
    { id: 'eligibility', title: '1. Eligibility & Acceptance' },
    { id: 'account', title: '2. Your Nevo Account' },
    { id: 'rewards', title: '3. Tasks, Rewards & Referrals' },
    { id: 'wallet', title: '4. Wallet Balance' },
    { id: 'deposits', title: '5. Deposits & KoraPay' },
    { id: 'withdrawals', title: '6. Withdrawals' },
    { id: 'verification', title: '7. Verification & Transaction Records' },
    { id: 'responsibilities', title: '8. Your Responsibilities' },
    { id: 'prohibited', title: '9. Prohibited Activities' },
    { id: 'suspension', title: '10. Suspension & Account Closure' },
    { id: 'availability', title: '11. Service Availability' },
    { id: 'changes', title: '12. Changes to These Terms' },
    { id: 'contact', title: '13. Contact Nevo' },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-[#050507] text-slate-100 flex flex-col font-sans">
      <header className="sticky top-0 z-50 w-full bg-[#050507]/90 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 bg-indigo-950/80 border border-indigo-500/40 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Scale className="h-4.5 w-4.5 text-teal-400" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight font-display text-white">{brandName}</span>
              <span className="text-[9px] font-mono block text-slate-400 leading-none">TERMS OF SERVICE</span>
            </div>
          </div>
          <button
            onClick={() => navigateTo('/')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-teal-300 hover:text-teal-200 active:scale-95 transition-all cursor-pointer"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Go to App</span>
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col lg:flex-row gap-8">
        <aside className="hidden lg:block w-72 shrink-0 self-start sticky top-24">
          <GlassCard className="p-5 border-white/[0.06] bg-white/[0.02]">
            <h5 className="text-[10px] font-mono text-teal-400 uppercase tracking-widest font-bold mb-4">On this page</h5>
            <nav className="space-y-1.5">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full text-left text-xs py-2 px-3 rounded-lg font-medium transition-all cursor-pointer ${activeSection === section.id ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </GlassCard>
        </aside>

        <section className="flex-1 space-y-8 min-w-0">
          <div>
            <span className="text-xs font-mono text-teal-400 font-bold uppercase tracking-widest">Nevo • Clear & Simple</span>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-white mt-1">Nevo Terms of Service</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              Last updated: September 2026. These terms explain how you may use Nevo, how wallet funding and rewards work, and what is required before withdrawals are available. Please read them before using the service.
            </p>
          </div>

          <GlassCard className="p-6 sm:p-8 space-y-8 border-white/[0.06] bg-white/[0.01]">
            <div id="eligibility" className="scroll-mt-24 space-y-3">
              <h2 className="text-lg font-bold font-display text-white flex items-center gap-2 border-b border-white/5 pb-2"><span className="text-teal-400 font-mono text-sm">01</span> Eligibility & Acceptance</h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">Nevo is intended for adults who are legally able to use the service. By creating an account or using Nevo, you agree to these Terms of Service and to use the platform honestly and lawfully. If you do not agree, stop using the service.</p>
            </div>

            <div id="account" className="scroll-mt-24 space-y-3">
              <h2 className="text-lg font-bold font-display text-white flex items-center gap-2 border-b border-white/5 pb-2"><span className="text-teal-400 font-mono text-sm">02</span> Your Nevo Account</h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">You must provide accurate information when registering and keep your login details private. Your account is personal to you. Do not share your password, verification codes, or security credentials with another person. Tell Nevo support if you believe your account has been accessed without your permission.</p>
            </div>

            <div id="rewards" className="scroll-mt-24 space-y-3">
              <h2 className="text-lg font-bold font-display text-white flex items-center gap-2 border-b border-white/5 pb-2"><span className="text-teal-400 font-mono text-sm">03</span> Tasks, Rewards & Referrals</h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">Available tasks and their rewards are shown inside Nevo. A task may require a timed visit, a username or handle, or another form of completion evidence. A reward is added only when the task's required verification is completed successfully. Referral rewards are subject to Nevo's referral rules and are recorded in your account activity.</p>
            </div>

            <div id="wallet" className="scroll-mt-24 space-y-3">
              <h2 className="text-lg font-bold font-display text-white flex items-center gap-2 border-b border-white/5 pb-2"><span className="text-teal-400 font-mono text-sm">04</span> Wallet Balance</h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">Your Nevo wallet displays your current recorded balance in Nigerian Naira. Rewards, verified deposits, and eligible account adjustments may increase the balance. Transactions and rewards should only be treated as completed when Nevo records them as successful.</p>
            </div>

            <div id="deposits" className="scroll-mt-24 space-y-3">
              <h2 className="text-lg font-bold font-display text-white flex items-center gap-2 border-b border-white/5 pb-2"><span className="text-teal-400 font-mono text-sm">05</span> Deposits & KoraPay</h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">Wallet deposits are processed through the KoraPay payment flow available in Nevo. Choose the amount shown in the Deposit screen and complete the hosted checkout. Nevo credits the wallet only after the payment is confirmed. The minimum wallet deposit relevant to withdrawal eligibility is ₦520. This ₦520 is a wallet deposit, not an activation fee, and a verified deposit is credited to your Nevo balance.</p>
            </div>

            <div id="withdrawals" className="scroll-mt-24 space-y-3">
              <h2 className="text-lg font-bold font-display text-white flex items-center gap-2 border-b border-white/5 pb-2"><span className="text-teal-400 font-mono text-sm">06</span> Withdrawals</h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">Withdrawal access requires both conditions: at least 5 successful referrals and a verified KoraPay wallet deposit of at least ₦520. Once eligible, the normal minimum withdrawal is ₦5,000 and the applicable limits shown in the withdrawal screen apply. Before a bank withdrawal is submitted, Nevo may verify the destination account details and account holder name.</p>
            </div>

            <div id="verification" className="scroll-mt-24 space-y-3">
              <h2 className="text-lg font-bold font-display text-white flex items-center gap-2 border-b border-white/5 pb-2"><span className="text-teal-400 font-mono text-sm">07</span> Verification & Transaction Records</h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">Nevo may verify deposits, withdrawals, task submissions, referrals, and other activity before recording them as successful. Payment-provider confirmations and account-verification results may be used to prevent duplicate, incorrect, or unauthorized transactions. Never submit false payment information or false proof of task completion.</p>
            </div>

            <div id="responsibilities" className="scroll-mt-24 space-y-3">
              <h2 className="text-lg font-bold font-display text-white flex items-center gap-2 border-b border-white/5 pb-2"><span className="text-teal-400 font-mono text-sm">08</span> Your Responsibilities</h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">Use your own account, provide truthful information, protect your credentials, and review transaction details before confirming them. Keep records of important payments and contact official Nevo support when a transaction does not appear correctly.</p>
            </div>

            <div id="prohibited" className="scroll-mt-24 space-y-3">
              <h2 className="text-lg font-bold font-display text-white flex items-center gap-2 border-b border-white/5 pb-2"><span className="text-teal-400 font-mono text-sm">09</span> Prohibited Activities</h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">You must not create fraudulent accounts, manipulate referrals or task submissions, submit fake payment evidence, attempt to obtain rewards more than once, interfere with Nevo's security or payment processes, impersonate another person, or use the service for unlawful activity.</p>
            </div>

            <div id="suspension" className="scroll-mt-24 space-y-3">
              <h2 className="text-lg font-bold font-display text-white flex items-center gap-2 border-b border-white/5 pb-2"><span className="text-teal-400 font-mono text-sm">10</span> Suspension & Account Closure</h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">Nevo may restrict or suspend an account when there is a reasonable security, fraud, abuse, or compliance concern. Where appropriate, Nevo may review related transactions before restoring access or completing a disputed transaction. You may contact support about an account restriction.</p>
            </div>

            <div id="availability" className="scroll-mt-24 space-y-3">
              <h2 className="text-lg font-bold font-display text-white flex items-center gap-2 border-b border-white/5 pb-2"><span className="text-teal-400 font-mono text-sm">11</span> Service Availability</h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">Some Nevo features depend on external payment, banking, advertising, network, or other service providers. A feature may be temporarily unavailable or delayed. Nevo will not treat an incomplete provider transaction as successful merely because a user sees a successful screen; the transaction must be confirmed through the applicable verification process.</p>
            </div>

            <div id="changes" className="scroll-mt-24 space-y-3">
              <h2 className="text-lg font-bold font-display text-white flex items-center gap-2 border-b border-white/5 pb-2"><span className="text-teal-400 font-mono text-sm">12</span> Changes to These Terms</h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">Nevo may update these Terms when the service, features, requirements, or applicable rules change. The latest version will be made available on Nevo. Continuing to use the service after an update means you have had an opportunity to review the updated terms.</p>
            </div>

            <div id="contact" className="scroll-mt-24 space-y-3 bg-white/[0.02] p-5 rounded-2xl border border-white/5">
              <h2 className="text-lg font-bold font-display text-white flex items-center gap-2 pb-1.5 text-teal-300"><Mail className="h-4.5 w-4.5 text-teal-400" /><span>13. Contact Nevo</span></h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">For account, payment, withdrawal, or terms questions, contact Nevo through the official support channels shown below.</p>
              <div className="mt-3 space-y-1.5 font-mono text-xs text-slate-300">
                <p>📧 Support: <a href={`mailto:${supportEmail}`} className="text-teal-400 hover:underline">{supportEmail}</a></p>
                <p>💬 Telegram: <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline inline-flex items-center gap-0.5">{telegramLink} <ExternalLink className="h-3 w-3 inline" /></a></p>
              </div>
            </div>
          </GlassCard>
        </section>
      </main>

      <footer className="w-full bg-[#050507]/90 border-t border-white/5 py-8 px-4 text-center mt-auto">
        <p className="text-xs text-slate-500 font-mono tracking-wider">© 2026 {brandName}. All rights reserved.</p>
      </footer>
    </div>
  );
}

export function StandalonePrivacyPage({ navigateTo }: StandalonePageProps) {
  const [settings, setSettings] = useState(getCachedSettings());

  useEffect(() => {
    fetchMasterSettings().then((s) => setSettings(s));
  }, []);

  const brandName = settings.websiteName || 'Nevo';
  const supportEmail = settings.supportEmail || 'support@nevo.com';
  const telegramLink = settings.telegramLink || 'https://t.me/nevo';
  const officeAddress = settings.officeAddress || 'Lagos, Nigeria';

  useEffect(() => {
    document.title = `Privacy Policy | ${brandName}`;
  }, [brandName]);

  return (
    <div className="min-h-screen bg-[#050507] text-slate-100 flex flex-col font-sans">
      <header className="sticky top-0 z-50 w-full bg-[#050507]/85 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 bg-indigo-950/80 border border-indigo-500/40 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="h-4.5 w-4.5 text-teal-400" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight font-display bg-gradient-to-r from-indigo-300 to-teal-300 bg-clip-text text-transparent">{brandName}</span>
              <span className="text-[9px] font-mono block text-slate-400 leading-none">PRIVACY POLICY</span>
            </div>
          </div>

          <button
            onClick={() => navigateTo('/')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-teal-300 hover:text-teal-200 active:scale-95 transition-all cursor-pointer"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Go to App</span>
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-8">
        <div>
          <span className="text-xs font-mono text-teal-400 font-bold uppercase tracking-widest">Privacy Protection</span>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-white mt-1">{brandName} Privacy Policy</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
            At {brandName}, we are strongly committed to securing your personal and financial transaction details.
          </p>
        </div>

        <GlassCard className="p-6 sm:p-8 space-y-6 border-white/[0.06] bg-white/[0.01]">
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {brandName} collects specific elements of user information to safely initialize digital wallets, process real-time transfer receipts, and audit manual deposit requests. We encrypt passwords server-side using bcrypt hashing protocols.
          </p>
          <div className="space-y-2 font-mono text-xs text-slate-300 bg-white/[0.02] p-4 rounded-xl border border-white/5">
            <p>📧 Support: <a href={`mailto:${supportEmail}`} className="text-teal-400 hover:underline">{supportEmail}</a></p>
            <p>💬 Telegram: <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">{telegramLink}</a></p>
            <p>📍 Location: {officeAddress}</p>
          </div>
        </GlassCard>
      </main>

      <footer className="w-full bg-[#050507]/90 border-t border-white/5 py-8 px-4 text-center mt-auto">
        <p className="text-xs text-slate-500 font-mono tracking-wider">
          © 2026 {brandName}. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export function Custom404Page({ navigateTo }: StandalonePageProps) {
  const settings = getCachedSettings();
  const brandName = settings.websiteName || 'Nevo';

  return (
    <div className="min-h-screen bg-[#050507] text-slate-100 flex flex-col items-center justify-center p-4 font-sans text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="mx-auto h-20 w-20 bg-indigo-950/80 border border-indigo-500/40 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 animate-pulse">
          <AlertTriangle className="h-10 w-10 text-rose-400" />
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl sm:text-7xl font-black font-display tracking-widest bg-gradient-to-r from-rose-400 to-indigo-400 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Page Not Found
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed px-4">
            The route you are trying to query does not exist on {brandName}.
          </p>
        </div>

        <div className="flex gap-3 items-center justify-center px-4">
          <button
            onClick={() => navigateTo('/')}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-600 hover:to-teal-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <Home className="h-4 w-4" />
            <span>Return Home</span>
          </button>
        </div>

        <p className="text-[10px] text-slate-500 font-mono pt-6">
          © 2026 {brandName}
        </p>
      </div>
    </div>
  );
}
