import React from 'react';
import { ArrowLeft, Shield, Scale } from 'lucide-react';
import GlassCard from './GlassCard';
import { getCachedSettings } from '../services/settingsService';

interface LegalPageProps {
  onBack: () => void;
}

export function TermsOfService({ onBack }: LegalPageProps) {
  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-white overflow-y-auto no-scrollbar p-5 sm:p-6 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"><ArrowLeft className="h-4 w-4" /></button>
        <div>
          <h4 className="text-base font-bold font-display flex items-center gap-2"><Scale className="h-4 w-4 text-teal-400" />Terms of Service</h4>
          <p className="text-[10px] text-slate-500 mt-0.5">Nevo • Last updated September 2026</p>
        </div>
      </div>

      <GlassCard className="p-5 space-y-5 text-[11px] text-slate-300 leading-relaxed border-white/5 bg-slate-900/40">
        <p>These Terms explain the rules for using Nevo, earning rewards, funding your wallet, and requesting withdrawals. By using Nevo, you agree to use the service honestly and in accordance with these terms.</p>
        {[
          ['1. Eligibility & Account', 'Nevo is intended for adults who are legally able to use the service. Keep your registration information accurate and protect your password, verification codes, PINs, and other account credentials. Your account is personal to you.'],
          ['2. Tasks, Rewards & Referrals', 'Available tasks and their rewards are shown in Nevo. A task may require a timed visit, a username or handle, or other completion evidence. Rewards are credited only after the required verification succeeds. Referral rewards are subject to the referral rules displayed by Nevo.'],
          ['3. Wallet Balance', 'Your wallet displays your recorded Nigerian Naira balance. Verified deposits and eligible rewards can increase the balance. A transaction is considered completed only when Nevo records it as successful.'],
          ['4. Deposits & KoraPay', 'Deposits are completed through the KoraPay payment flow provided by Nevo. Nevo credits your wallet only after the payment is confirmed. A verified deposit of at least ₦520 is required for withdrawal eligibility. The ₦520 is wallet funding, not an activation fee.'],
          ['5. Withdrawals', 'Withdrawal access requires at least 5 successful referrals and a verified KoraPay wallet deposit of at least ₦520. Once eligible, the normal minimum withdrawal is ₦5,000 and the limits shown in Nevo apply. Bank details may be verified before a withdrawal is submitted.'],
          ['6. Verification & Honest Use', 'Nevo may verify deposits, withdrawals, referrals, task submissions, and other activity. Do not submit fake payment evidence, false task proof, duplicate claims, fraudulent referrals, or information belonging to another person.'],
          ['7. Security & Prohibited Conduct', 'Do not attempt to bypass security, manipulate balances or rewards, interfere with payment verification, impersonate another person, create fraudulent accounts, or use Nevo for unlawful activity.'],
          ['8. Account Restrictions', 'Nevo may restrict or suspend an account when there is a security, fraud, abuse, or compliance concern. Contact official support if you need help with a restriction or disputed transaction.'],
          ['9. Service Availability', 'Some features depend on payment, banking, advertising, network, or other external services and may be delayed or temporarily unavailable. Provider confirmation is required before a payment is treated as successful.'],
          ['10. Changes to These Terms', 'Nevo may update these terms when the service or its requirements change. The latest version will be made available through Nevo.'],
          ['11. Contact Nevo', 'For account, payment, withdrawal, or terms questions, use the official support channels provided in the Nevo app or website.'],
        ].map(([title, body]) => (
          <div key={title} className="space-y-1.5">
            <h5 className="font-bold text-white text-xs">{title}</h5>
            <p>{body}</p>
          </div>
        ))}
      </GlassCard>

      <button onClick={onBack} className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7A1831] to-[#A52A4A] hover:from-[#8F1D3A] hover:to-[#C13A5A] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer">Acknowledge & Close</button>
    </div>
  );
}

export function PrivacyPolicy({ onBack }: LegalPageProps) {
  const settings = getCachedSettings();
  const brandName = settings.websiteName || 'Nevo';

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-white overflow-y-auto no-scrollbar p-6 space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h4 className="text-base font-bold font-display flex items-center gap-2">
          <Shield className="h-4 w-4 text-teal-400" />
          Privacy Policy
        </h4>
      </div>

      <p className="text-[11px] text-slate-400">
        Last updated: July 2026. Your privacy and secure data processing is our primary concern.
      </p>

      <GlassCard className="p-4 space-y-4 text-[11px] text-slate-300 leading-relaxed font-sans max-h-[600px] overflow-y-auto border-white/5 bg-slate-900/40">
        <div>
          <h5 className="font-bold text-white uppercase text-xs mb-1">1. Information We Collect</h5>
          <p>
            We collect personal identifier information to establish your {brandName} digital wallet account: Full Name, email address, password hash, and set passcode credentials.
          </p>
        </div>

        <div>
          <h5 className="font-bold text-white uppercase text-xs mb-1">2. Secure Cryptographic Passwords</h5>
          <p>
            All account passwords are encrypted and securely hashed server-side using cryptographic SHA-256 protocols. Your actual password string is never stored in plain text or exposed to operators, ensuring complete safety.
          </p>
        </div>

        <div>
          <h5 className="font-bold text-white uppercase text-xs mb-1">3. Local Biometric Data Handling</h5>
          <p>
            We utilize standard web biometric credential APIs to enable secure finger logins. Your physical fingerprint coordinates and biometric maps are strictly retained locally by your device’s secure hardware enclave (Android Keystore / iOS Secure Enclave) and are NEVER sent to or stored on our servers.
          </p>
        </div>

        <div>
          <h5 className="font-bold text-white uppercase text-xs mb-1">4. How We Use Your Data</h5>
          <p>
            Your information is processed to authorize login sessions, compute and persist active balances, display secure transaction receipts, verify manual bank deposits, and facilitate bill settlement operations.
          </p>
        </div>

        <div>
          <h5 className="font-bold text-white uppercase text-xs mb-1">5. Third-Party Sharing</h5>
          <p>
            {brandName} does not trade, sell, or disclose user data to marketing corporations. Account verification matches are shared solely with authorized banking APIs to confirm recipient names before routing transaction cashouts.
          </p>
        </div>
      </GlassCard>

      <button
        onClick={onBack}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-600 hover:to-teal-600 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
      >
        Acknowledge & Close
      </button>
    </div>
  );
}
