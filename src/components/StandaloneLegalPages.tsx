import React, { useEffect, useState } from 'react';
import { ShieldCheck, Scale, Mail, Home, AlertTriangle, LockKeyhole } from 'lucide-react';
import GlassCard from './GlassCard';
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
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 bg-indigo-950/80 border border-indigo-500/40 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            {icon}
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight font-display bg-gradient-to-r from-indigo-300 to-teal-300 bg-clip-text text-transparent">{NEVO_NAME}</span>
            <span className="text-[9px] font-mono block text-slate-400 leading-none">{label}</span>
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
  {
    id: 'acceptance', number: '01', title: 'Acceptance of Terms',
    text: 'By creating or using a Nevo account, you agree to these Terms of Service. If you do not agree with them, please stop using the platform. You are responsible for providing accurate information and using your account lawfully.'
  },
  {
    id: 'account', number: '02', title: 'Your Nevo Account',
    text: 'Keep your login details private and use only your own account. Do not share passwords, one-time codes, passcodes, or other security credentials. If you believe someone has accessed your account without permission, contact Nevo support as soon as possible.'
  },
  {
    id: 'wallet', number: '03', title: 'Wallet Balance',
    text: 'Your Nevo wallet displays the balance recorded for your account. Rewards, deposits, withdrawals, and other wallet movements are recorded in your account history. You should review your balance and transaction history regularly and report an unexpected transaction promptly.'
  },
  {
    id: 'deposits', number: '04', title: 'Wallet Deposits',
    text: 'When you fund your wallet through the available Nevo deposit option, the payment must be completed through the checkout or payment method provided by Nevo. A deposit is credited only after the payment has been successfully confirmed. Do not send money to unofficial accounts or people claiming to represent Nevo.'
  },
  {
    id: 'rewards', number: '05', title: 'Tasks, Adverts & Rewards',
    text: 'Nevo may offer tasks, rewarded adverts, referrals, and other earning opportunities. Each opportunity may have its own instructions, eligibility rules, reward amount, and completion requirements. Rewards are credited only when the required activity has been successfully completed and accepted by the platform.'
  },
  {
    id: 'referrals', number: '06', title: 'Referrals',
    text: 'Referral rewards are based on genuine users who join through your referral information and satisfy the applicable referral requirements. Attempts to create duplicate, false, or abusive referrals may result in the affected rewards being withheld and the account being reviewed.'
  },
  {
    id: 'withdrawals', number: '07', title: 'Withdrawals',
    text: 'Withdrawals are subject to the eligibility requirements and limits displayed by Nevo. You must provide correct bank details and confirm the account information before submitting a withdrawal. Processing times can vary, and Nevo may review transactions for security or fraud prevention before completion.'
  },
  {
    id: 'fair-use', number: '08', title: 'Fair & Acceptable Use',
    text: 'Do not use Nevo to deceive other people, manipulate rewards, interfere with the service, submit false information, abuse referral or task systems, or attempt unauthorized access. Nevo may restrict activity that appears fraudulent, abusive, or inconsistent with these terms.'
  },
  {
    id: 'suspension', number: '09', title: 'Account Restrictions',
    text: 'Nevo may temporarily restrict an account while investigating suspicious activity, security concerns, or a possible violation of these terms. Where appropriate, the user may contact support for clarification or assistance.'
  },
  {
    id: 'changes', number: '10', title: 'Changes & Contact',
    text: 'Nevo may update these terms when its services, features, or requirements change. The latest version will be made available on the platform. Continued use of Nevo after an update means you have had an opportunity to review the revised terms.'
  }
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
  {
    title: '1. What Information We Collect',
    text: 'When you use Nevo, we may collect information you choose to provide, such as your name, email address, phone number, account details, and information needed to process your wallet activity. We may also keep records of your tasks, rewards, referrals, deposits, withdrawals, and other activity within your account.'
  },
  {
    title: '2. Why We Use Your Information',
    text: 'We use your information to create and maintain your account, provide Nevo services, keep your wallet and reward history accurate, process transactions, provide customer support, protect accounts, prevent abuse, and communicate important information about the service.'
  },
  {
    title: '3. Your Password & Account Security',
    text: 'Your password is treated as confidential account information. Nevo does not ask you to publicly disclose your password. You should never share your password, verification code, passcode, or other security credentials with another person.'
  },
  {
    title: '4. Payments & Transaction Information',
    text: 'When you make a deposit or withdrawal, information required to complete and verify that transaction may be processed. Payment-related information is used for the transaction and for keeping an accurate account history. Nevo does not ask you to send payment credentials through ordinary chat messages.'
  },
  {
    title: '5. When Information May Be Shared',
    text: 'Nevo does not sell your personal information as a product to advertisers. Information may be shared with trusted service providers when necessary to provide a requested service, complete a transaction, protect users, prevent fraud, or meet a lawful requirement.'
  },
  {
    title: '6. Cookies & Similar Technologies',
    text: 'Nevo may use essential browser storage, cookies, or similar technologies to keep you signed in, remember preferences, maintain security, and make the website function correctly. These technologies are used to support your experience rather than to ask you for sensitive credentials.'
  },
  {
    title: '7. Your Choices & Rights',
    text: 'You can contact Nevo if you need to correct account information, ask about information associated with your account, or raise a privacy concern. Some information may need to be retained when it is required for legitimate transaction records, security, or legal obligations.'
  },
  {
    title: '8. Children',
    text: 'Nevo is intended for adults. Do not create an account if you are not legally old enough to use the service in your jurisdiction.'
  },
  {
    title: '9. Changes to This Privacy Policy',
    text: 'We may update this Privacy Policy when our services or privacy practices change. The current version will be published on Nevo so that users can review it.'
  }
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
        <div className="mx-auto h-20 w-20 bg-indigo-950/80 border border-indigo-500/40 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 animate-pulse">
          <AlertTriangle className="h-10 w-10 text-rose-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-6xl sm:text-7xl font-black font-display tracking-widest bg-gradient-to-r from-rose-400 to-indigo-400 bg-clip-text text-transparent">404</h1>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Page Not Found</h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed px-4">The page you are trying to open does not exist on Nevo.</p>
        </div>
        <button onClick={() => navigateTo('/')} className="flex mx-auto items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-teal-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer">
          <Home className="h-4 w-4" /><span>Return Home</span>
        </button>
        <p className="text-[10px] text-slate-500 font-mono pt-6">© 2026 Nevo</p>
      </div>
    </div>
  );
}
