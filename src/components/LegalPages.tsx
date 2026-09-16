import React from 'react';
import { ArrowLeft, Shield, Scale } from 'lucide-react';
import GlassCard from './GlassCard';
import { getCachedSettings } from '../services/settingsService';

interface LegalPageProps {
  onBack: () => void;
}

export function TermsOfService({ onBack }: LegalPageProps) {
  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-white overflow-y-auto no-scrollbar p-6 space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h4 className="text-base font-bold font-display flex items-center gap-2"><Scale className="h-4 w-4 text-teal-400" /> Terms of Service</h4>
      </div>
      <p className="text-[11px] text-slate-400">Last updated: September 2026. Please read these terms before using Nevo.</p>
      <GlassCard className="p-4 space-y-5 text-[11px] text-slate-300 leading-relaxed font-sans max-h-[600px] overflow-y-auto border-white/5 bg-slate-900/40">
        <div><h5 className="font-bold text-white uppercase text-xs mb-1">1. Acceptance</h5><p>By creating or using a Nevo account, you agree to these terms. If you do not agree, please stop using the service.</p></div>
        <div><h5 className="font-bold text-white uppercase text-xs mb-1">2. Your Account</h5><p>Provide accurate information and keep your password, OTP, PIN, and other security credentials private. Do not share your account with another person.</p></div>
        <div><h5 className="font-bold text-white uppercase text-xs mb-1">3. Wallet & Deposits</h5><p>Your Nevo wallet shows the balance recorded for your account. Deposits must use the payment option provided by Nevo and are credited after successful confirmation. Do not send money to unofficial accounts.</p></div>
        <div><h5 className="font-bold text-white uppercase text-xs mb-1">4. Tasks, Adverts & Rewards</h5><p>Tasks, rewarded adverts, referrals, and other earning opportunities have their own instructions and eligibility rules. Rewards are credited after the required activity is successfully completed and accepted.</p></div>
        <div><h5 className="font-bold text-white uppercase text-xs mb-1">5. Referrals</h5><p>Referral rewards require genuine users who join through your referral information and meet the stated requirements. Duplicate, false, or abusive referrals may not qualify.</p></div>
        <div><h5 className="font-bold text-white uppercase text-xs mb-1">6. Withdrawals</h5><p>Withdrawals are subject to the eligibility requirements, limits, and account verification shown by Nevo. Provide correct bank details and review them before submitting a withdrawal.</p></div>
        <div><h5 className="font-bold text-white uppercase text-xs mb-1">7. Fair Use</h5><p>Do not manipulate rewards, submit false information, interfere with the service, abuse task or referral systems, or attempt unauthorized access.</p></div>
        <div><h5 className="font-bold text-white uppercase text-xs mb-1">8. Account Restrictions</h5><p>Nevo may restrict an account while reviewing suspicious activity, security concerns, or possible violations of these terms. Contact official support if you need assistance.</p></div>
        <div><h5 className="font-bold text-white uppercase text-xs mb-1">9. Service Changes</h5><p>Features, rewards, limits, and requirements may change as Nevo develops its services. Important changes will be communicated through the platform where appropriate.</p></div>
        <div><h5 className="font-bold text-white uppercase text-xs mb-1">10. Contact</h5><p>For account or transaction questions, contact Nevo through an official support channel shown on the platform. Never send your password, OTP, or PIN to support or to another user.</p></div>
      </GlassCard>
      <button onClick={onBack} className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-teal-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer">Acknowledge & Close</button>
    </div>
  );
}

export function PrivacyPolicy({ onBack }: LegalPageProps) {
  const brandName = 'Nevo';

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-white overflow-y-auto no-scrollbar p-6 space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h4 className="text-base font-bold font-display flex items-center gap-2">
          <Shield className="h-4 w-4 text-teal-400" /> Privacy Policy
        </h4>
      </div>

      <p className="text-[11px] text-slate-400">Last updated: September 2026. Your privacy matters to Nevo.</p>

      <GlassCard className="p-4 space-y-5 text-[11px] text-slate-300 leading-relaxed font-sans max-h-[600px] overflow-y-auto border-white/5 bg-slate-900/40">
        <div>
          <h5 className="font-bold text-white uppercase text-xs mb-1">1. Information We Collect</h5>
          <p>Nevo may collect information you provide when you create and use your account, including your name, email address, phone number, account details, and information needed for wallet activity. We may also keep records of tasks, rewards, referrals, deposits, withdrawals, and other activity on your account.</p>
        </div>
        <div>
          <h5 className="font-bold text-white uppercase text-xs mb-1">2. How We Use Your Information</h5>
          <p>We use your information to provide Nevo services, maintain your account, keep wallet and reward records accurate, process transactions, provide support, protect accounts, prevent abuse, and send important service communications.</p>
        </div>
        <div>
          <h5 className="font-bold text-white uppercase text-xs mb-1">3. Your Account Security</h5>
          <p>Your password and security credentials are private. Nevo does not ask you to share your password, OTP, PIN, or other security credentials with another person. You should contact official support if you believe your account has been accessed without permission.</p>
        </div>
        <div>
          <h5 className="font-bold text-white uppercase text-xs mb-1">4. Payments & Transactions</h5>
          <p>Information needed to complete and verify deposits or withdrawals may be processed for those transactions and for maintaining an accurate account history. Only use the payment options presented by Nevo.</p>
        </div>
        <div>
          <h5 className="font-bold text-white uppercase text-xs mb-1">5. Sharing Information</h5>
          <p>Nevo does not sell your personal information to advertisers. Information may be shared with trusted service providers when necessary to provide a requested service, complete a transaction, protect users, prevent fraud, or meet a lawful requirement.</p>
        </div>
        <div>
          <h5 className="font-bold text-white uppercase text-xs mb-1">6. Your Choices</h5>
          <p>You can contact Nevo about correcting account information or raising a privacy concern. Some records may need to be retained for legitimate transaction, security, or legal purposes.</p>
        </div>
        <div>
          <h5 className="font-bold text-white uppercase text-xs mb-1">7. Updates</h5>
          <p>If our services or privacy practices change, we may update this policy. The latest version will be available on Nevo.</p>
        </div>
      </GlassCard>

      <button onClick={onBack} className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-600 hover:to-teal-600 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer">Acknowledge & Close</button>
    </div>
  );
}

