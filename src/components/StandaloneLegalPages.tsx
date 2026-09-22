import React, { useEffect, useState } from 'react';
import { ShieldCheck, Scale, Mail, Home, AlertTriangle, LockKeyhole } from 'lucide-react';
import GlassCard from './GlassCard';
import NevoLogo from './NevoLogo';
import { getCachedSettings, fetchMasterSettings } from '../services/settingsService';

interface StandalonePageProps {
  navigateTo: (path: string) => void;
}

const NEVO_NAME = 'Nevo';
const DEFAULT_SUPPORT = 'support@nevo.ng';
const DEFAULT_TELEGRAM = 'https://t.me/nevo_official';

function useNevoSettings() {
  const [settings, setSettings] = useState(getCachedSettings());
  useEffect(() => {
    fetchMasterSettings().then((s) => setSettings(s)).catch(() => {});
  }, []);
  return settings;
}

function LegalHeader({ navigateTo, label, icon }: { navigateTo: (path: string) => void; label: string; icon: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#050507]/90 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <NevoLogo size={38} compact />
          <div className="hidden sm:block h-7 w-px bg-white/10" />
          <div className="hidden sm:block">
            <span className="text-[9px] font-mono block text-slate-400 leading-none tracking-[0.16em]">{label}</span>
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
  );
}

const termSections = [
  { id: 'acceptance', number: '01', title: 'Acceptance of Terms', text: 'By creating or using a Nevo account, you agree to these Terms of Service. If you do not agree, stop using the service. You are responsible for providing accurate information and using Nevo lawfully.' },
  { id: 'account', number: '02', title: 'Your Account', text: 'Your Nevo account is personal to you. Keep your password and verification credentials private, use accurate registration information, and tell official support if you believe your account has been accessed without permission.' },
  { id: 'wallet', number: '03', title: 'Wallet & Account Balance', text: 'Your wallet displays the balance recorded for your account. Deposits, rewards, withdrawals and other supported wallet movements are reflected in your account history. Review your balance and history regularly and report unexpected activity promptly.' },
  { id: 'deposits', number: '04', title: 'Deposits', text: 'Use only the deposit option presented by Nevo. For KoraPay deposits, payment must be completed through the KoraPay checkout and Nevo credits the wallet only after the payment is successfully confirmed. Never send money to an unofficial person or account claiming to represent Nevo.' },
  { id: 'tasks', number: '05', title: 'Tasks & Rewards', text: 'Available tasks and rewarded activities may have different instructions, eligibility rules, completion requirements and reward amounts. A reward is recorded only after the required activity is successfully completed and accepted by Nevo.' },
  { id: 'referrals', number: '06', title: 'Referrals', text: 'Referral rewards are intended for genuine users who join through your referral information and satisfy the applicable requirements. Duplicate, false, automated or abusive referrals may be rejected and may lead to account review.' },
  { id: 'withdrawals', number: '07', title: 'Withdrawals', text: 'Withdrawals are subject to the eligibility requirements, verification steps and limits shown in Nevo. Provide correct bank details, review the verified account-holder name, and confirm the information before submitting a request.' },
  { id: 'acceptable-use', number: '08', title: 'Acceptable Use', text: 'Do not manipulate rewards, submit false information, abuse tasks or referrals, attempt unauthorized access, impersonate Nevo, or interfere with the normal operation of the service. Activity that appears fraudulent or abusive may be restricted or reviewed.' },
  { id: 'restrictions', number: '09', title: 'Account Restrictions', text: 'Nevo may temporarily suspend or restrict an account when there is a security concern, suspected abuse, or a possible violation of these terms. Contact official support if you need help with a restriction.' },
  { id: 'changes', number: '10', title: 'Changes to the Service', text: 'Nevo may change features, requirements, limits or rewards as the service develops. The current terms and important service notices will be made available through Nevo.' },
  { id: 'contact', number: '11', title: 'Contact & Support', text: 'Use only the official Nevo support channels shown on the platform for account and transaction questions. Never send your password, OTP, PIN or other confidential credentials to support or another user.' }
];

export function StandaloneTermsPage({ navigateTo }: StandalonePageProps) {
  const settings = useNevoSettings();
  const supportEmail = settings.supportEmail || DEFAULT_SUPPORT;
  const telegramLink = settings.telegramLink || DEFAULT_TELEGRAM;
  useEffect(() => { document.title = 'Terms of Service | Nevo'; }, []);

  return (
    <div className="min-h-screen bg-[#050507] text-slate-100 flex flex-col font-sans">
      <LegalHeader navigateTo={navigateTo} label="TERMS OF SERVICE" icon={<Scale className="h-4.5 w-4.5 text-teal-400" />} />
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
        <div>
          <span className="text-xs font-mono text-teal-400 font-bold uppercase tracking-widest">Legal Documentation</span>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-white mt-2">Nevo Terms of Service</h1>
          <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed">
            These terms explain the basic rules for using Nevo, managing your wallet, earning rewards, making deposits, and requesting withdrawals. We have written them in plain language so they are easy to understand.
          </p>
          <p className="text-[11px] text-slate-500 mt-3 font-mono">Last updated: September 2026</p>
        </div>

        <GlassCard className="p-6 sm:p-8 space-y-8 border-teal-500/20 bg-white/[0.015]">
          {termSections.map((section) => (
            <section id={section.id} key={section.id} className="scroll-mt-24 space-y-3">
              <h2 className="text-lg sm:text-xl font-bold font-display text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <span className="text-teal-400 font-mono text-sm">{section.number}</span>{section.title}
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">{section.text}</p>
            </section>
          ))}

          <section className="bg-white/[0.025] p-5 rounded-2xl border border-white/5 space-y-3">
            <h2 className="text-lg sm:text-xl font-bold font-display text-teal-300 flex items-center gap-2">
              <Mail className="h-5 w-5 text-teal-400" /> Contact Nevo
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">For account, transaction, or terms-related questions, use the official support channels below.</p>
            <div className="space-y-2 font-mono text-xs sm:text-sm text-slate-300">
              <p>📧 Support: <a href={`mailto:${supportEmail}`} className="text-teal-400 hover:underline">{supportEmail}</a></p>
              <p>💬 Telegram: <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline break-all">{telegramLink}</a></p>
            </div>
          </section>
        </GlassCard>
      </main>
      <footer className="w-full bg-[#050507]/90 border-t border-white/5 py-8 px-4 text-center mt-auto">
        <p className="text-xs text-slate-500 font-mono tracking-wider">© 2026 Nevo. All rights reserved.</p>
      </footer>
    </div>
  );
}

const privacySections = [
  { title: '1. Information You Provide', text: 'When you register and use Nevo, we may use information such as your name, email address, phone number and other account details you choose to provide.' },
  { title: '2. Wallet & Transaction Information', text: 'Nevo keeps information needed to maintain your wallet, record deposits and withdrawals, record rewards and referrals, and provide you with an accurate account history.' },
  { title: '3. How We Use Your Information', text: 'We use information to create and maintain your account, provide requested features, process transactions, provide support, protect accounts, prevent abuse, and send important service messages.' },
  { title: '4. Keeping Your Information Safe', text: 'Nevo takes reasonable security measures to protect account information and limit unauthorized access. You also play an important role by keeping your password, OTP, PIN and other security credentials private.' },
  { title: '5. Payment Information', text: 'Information required to complete and confirm a deposit or withdrawal may be handled by Nevo and the payment or banking services involved in that transaction. Use only the payment options presented by Nevo.' },
  { title: '6. When Information May Be Shared', text: 'Nevo does not sell your personal information to advertisers. Information may be shared when necessary to provide a requested service, complete a transaction, protect users, prevent fraud, or comply with a lawful requirement.' },
  { title: '7. Your Choices', text: 'You may contact Nevo about correcting account information, asking a privacy question, or raising a concern about how your information is handled. Some information may need to be retained for legitimate transaction, security or legal reasons.' },
  { title: '8. Account Security', text: 'Never give your password, OTP, PIN or other security credentials to another person. If you suspect unauthorized access, contact Nevo through an official support channel as soon as possible.' },
  { title: '9. Changes to This Policy', text: 'If our services or privacy practices change, Nevo may update this Privacy Policy. The latest version will be available on the platform.' }
];

export function StandalonePrivacyPage({ navigateTo }: StandalonePageProps) {
  const settings = useNevoSettings();
  const supportEmail = settings.supportEmail || DEFAULT_SUPPORT;
  const telegramLink = settings.telegramLink || DEFAULT_TELEGRAM;
  useEffect(() => { document.title = 'Privacy Policy | Nevo'; }, []);

  return (
    <div className="min-h-screen bg-[#050507] text-slate-100 flex flex-col font-sans">
      <LegalHeader navigateTo={navigateTo} label="PRIVACY POLICY" icon={<ShieldCheck className="h-4.5 w-4.5 text-teal-400" />} />
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
        <div>
          <span className="text-xs font-mono text-teal-400 font-bold uppercase tracking-widest">Privacy Protection</span>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-white mt-2">Nevo Privacy Policy</h1>
          <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed">
            Your privacy matters to us. This policy explains, in clear language, what information Nevo uses, why it is needed, how we protect it, and the choices available to you.
          </p>
          <p className="text-[11px] text-slate-500 mt-3 font-mono">Last updated: September 2026</p>
        </div>

        <GlassCard className="p-6 sm:p-8 space-y-7 border-teal-500/20 bg-white/[0.015]">
          <div className="rounded-2xl border border-teal-500/20 bg-teal-500/[0.04] p-5 flex gap-4 items-start">
            <div className="shrink-0 h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
              <LockKeyhole className="h-5 w-5 text-teal-400" />
            </div>
            <div>
              <h2 className="font-bold text-white">Your information is treated with care</h2>
              <p className="text-sm text-slate-300 mt-1 leading-relaxed">Nevo uses your information only for legitimate account, service, transaction, security, and support purposes. We do not sell your personal information to advertisers.</p>
            </div>
          </div>

          {privacySections.map((section) => (
            <section key={section.title} className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold font-display text-white border-b border-white/5 pb-2">{section.title}</h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">{section.text}</p>
            </section>
          ))}

          <section className="bg-white/[0.025] p-5 rounded-2xl border border-white/5 space-y-3">
            <h2 className="text-lg font-bold font-display text-teal-300 flex items-center gap-2"><Mail className="h-5 w-5 text-teal-400" /> Privacy Questions</h2>
            <p className="text-sm text-slate-300 leading-relaxed">If you have a privacy question, concern, or request about your account information, contact Nevo through an official support channel.</p>
            <div className="space-y-2 font-mono text-xs sm:text-sm text-slate-300">
              <p>📧 Support: <a href={`mailto:${supportEmail}`} className="text-teal-400 hover:underline">{supportEmail}</a></p>
              <p>💬 Telegram: <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline break-all">{telegramLink}</a></p>
            </div>
          </section>
        </GlassCard>
      </main>
      <footer className="w-full bg-[#050507]/90 border-t border-white/5 py-8 px-4 text-center mt-auto">
        <p className="text-xs text-slate-500 font-mono tracking-wider">© 2026 Nevo. All rights reserved.</p>
      </footer>
    </div>
  );
}

export function Custom404Page({ navigateTo }: StandalonePageProps) {
  return (
    <div className="min-h-screen bg-[#050507] text-slate-100 flex flex-col items-center justify-center p-4 font-sans text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="mx-auto h-20 w-20 bg-teal-950/80 border border-teal-500/40 rounded-3xl flex items-center justify-center shadow-2xl shadow-teal-500/20 animate-pulse">
          <AlertTriangle className="h-10 w-10 text-rose-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-6xl sm:text-7xl font-black font-display tracking-widest bg-gradient-to-r from-rose-400 to-teal-400 bg-clip-text text-transparent">404</h1>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Page Not Found</h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed px-4">The page you are trying to open does not exist on Nevo.</p>
        </div>
        <button onClick={() => navigateTo('/')} className="flex mx-auto items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-teal-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer">
          <Home className="h-4 w-4" /><span>Return Home</span>
        </button>
        <p className="text-[10px] text-slate-500 font-mono pt-6">© 2026 Nevo</p>
      </div>
    </div>
  );
}
