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

  const brandName = settings.websiteName || 'Nevo';
  const supportEmail = settings.supportEmail || 'support@nevo.com';
  const telegramLink = settings.telegramLink || 'https://t.me/nevo';
  const officeAddress = settings.officeAddress || 'Lagos, Nigeria';

  useEffect(() => {
    document.title = `Terms of Service | ${brandName}`;
  }, [brandName]);

  const [activeSection, setActiveSection] = useState<string>('acceptance');

  const sections = [
    { id: 'acceptance', title: '1. Acceptance of Terms' },
    { id: 'accounts', title: '2. User Accounts' },
    { id: 'wallet', title: '3. Wallet Usage' },
    { id: 'deposits', title: '4. Deposits' },
    { id: 'withdrawals', title: '5. Withdrawals' },
    { id: 'vouchers', title: '6. Voucher Purchases' },
    { id: 'prohibited', title: '7. Prohibited Activities' },
    { id: 'fraud', title: '8. Fraud Prevention' },
    { id: 'suspension', title: '9. Account Suspension' },
    { id: 'liability', title: '10. Limitation of Liability' },
    { id: 'intellectual', title: '11. Intellectual Property' },
    { id: 'changes', title: '12. Changes to Terms' },
    { id: 'contact', title: '13. Contact Information' },
  ];

  const handleLinkClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    navigateTo(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] text-slate-100 flex flex-col font-sans">
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-[#050507]/85 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 bg-indigo-950/80 border border-indigo-500/40 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Scale className="h-4.5 w-4.5 text-teal-400" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight font-display bg-gradient-to-r from-indigo-300 to-teal-300 bg-clip-text text-transparent">{brandName}</span>
              <span className="text-[9px] font-mono block text-slate-400 leading-none">LEGAL COMPLIANCE</span>
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

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 flex flex-col lg:flex-row gap-8">
        
        <aside className="hidden lg:block w-72 shrink-0 self-start sticky top-24">
          <GlassCard className="p-5 border-white/[0.06] bg-white/[0.02]">
            <h5 className="text-[10px] font-mono text-teal-400 uppercase tracking-widest font-bold mb-4">Table of Contents</h5>
            <nav className="space-y-1.5">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full text-left text-xs py-2 px-3 rounded-lg font-medium transition-all flex items-center justify-between group cursor-pointer ${
                    activeSection === section.id
                      ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <span>{section.title}</span>
                </button>
              ))}
            </nav>
          </GlassCard>
        </aside>

        <section className="flex-1 space-y-8 min-w-0">
          <div>
            <span className="text-xs font-mono text-teal-400 font-bold uppercase tracking-widest">Legal Documentation</span>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-white mt-1">{brandName} Terms of Service</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              Please read these Terms of Service carefully before utilizing the {brandName} platform and virtual wallet services. By accessing the application, creating an account, or purchasing virtual vouchers, you explicitly consent to be legally bound by these conditions.
            </p>
          </div>

          <GlassCard className="p-6 sm:p-8 space-y-8 border-white/[0.06] bg-white/[0.01]">
            
            <div id="acceptance" className="scroll-mt-24 space-y-3">
              <h2 className="text-lg font-bold font-display text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <span className="text-teal-400 font-mono text-sm">01</span> Acceptance of Terms
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                By downloading, registering for, accessing, or using the {brandName} mobile interface or web dashboard ("the Service"), you represent that you are at least 18 years of age and possess the legal authority to enter into this agreement. If you do not agree with any portion of these Terms of Service, you must terminate your session immediately.
              </p>
            </div>

            <div id="accounts" className="scroll-mt-24 space-y-3">
              <h2 className="text-lg font-bold font-display text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <span className="text-teal-400 font-mono text-sm">02</span> User Accounts
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                To access full transaction capabilities, users must register for a secure {brandName} wallet account. You agree to provide current, accurate, and complete information during registration. You are solely responsible for safeguarding your session authentication tokens, passwords, local security PINs, and biometric credential keys.
              </p>
            </div>

            <div id="wallet" className="scroll-mt-24 space-y-3">
              <h2 className="text-lg font-bold font-display text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <span className="text-teal-400 font-mono text-sm">03</span> Wallet Usage
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {brandName} maintains a secure virtual ledger in Nigerian Naira (₦). Balances represented in your digital wallet are virtual and intended solely for bill settlements, peer-to-peer transfers, and utility payments. Daily transaction spending is restricted by your account limits and target profiles.
              </p>
            </div>

            <div id="deposits" className="scroll-mt-24 space-y-3">
              <h2 className="text-lg font-bold font-display text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <span className="text-teal-400 font-mono text-sm">04</span> Deposits
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Deposits into your {brandName} digital wallet are completed via manual peer-to-peer bank transfers or confirmed voucher redemptions. When submitting a manual transfer notice, you are required to upload genuine receipt metadata. Our operators manually audit deposit queues.
              </p>
            </div>

            <div id="vouchers" className="scroll-mt-24 space-y-3">
              <h2 className="text-lg font-bold font-display text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <span className="text-teal-400 font-mono text-sm">06</span> Voucher Purchases
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {brandName} facilitates the purchase and redemption of unique Withdrawal Voucher (WDV) codes. Each premium WDV voucher possesses a fixed value. Verification of voucher codes is performed server-side with strict duplicate prevention. WDV vouchers are strictly non-refundable once generated.
              </p>
            </div>

            <div id="contact" className="scroll-mt-24 space-y-3 bg-white/[0.02] p-5 rounded-2xl border border-white/5">
              <h2 className="text-lg font-bold font-display text-white flex items-center gap-2 pb-1.5 text-teal-300">
                <Mail className="h-4.5 w-4.5 text-teal-400" />
                <span>13. Contact Information</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                For disputes, inquiries, or legal clarifications regarding {brandName} terms:
              </p>
              <div className="mt-3 space-y-1 font-mono text-xs text-slate-300">
                <p>📧 Support: <a href={`mailto:${supportEmail}`} className="text-teal-400 hover:underline">{supportEmail}</a></p>
                <p>💬 Telegram: <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline inline-flex items-center gap-0.5">{telegramLink} <ExternalLink className="h-3 w-3 inline" /></a></p>
                <p>📍 Address: {officeAddress}</p>
              </div>
            </div>

          </GlassCard>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#050507]/90 border-t border-white/5 py-12 px-4 text-center mt-auto">
        <div className="max-w-6xl mx-auto space-y-4">
          <p className="text-xs text-slate-500 font-mono tracking-wider">
            © 2026 {brandName}. All rights reserved. Registered FinTech operator.
          </p>
        </div>
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
