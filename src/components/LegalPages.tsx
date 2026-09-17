import React from 'react';
import { ArrowLeft, Shield, Scale } from 'lucide-react';
import GlassCard from './GlassCard';
import { getCachedSettings } from '../services/settingsService';

interface LegalPageProps {
  onBack: () => void;
}

export function TermsOfService({ onBack }: LegalPageProps) {
  const settings = getCachedSettings();
  const brandName = settings.websiteName || 'Nevo';
  const supportPhone = settings.supportPhone || '+2349162845073';

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
          <Scale className="h-4 w-4 text-teal-400" />
          Terms of Service
        </h4>
      </div>

      <p className="text-[11px] text-slate-400">
        Last updated: July 2026. Please read these terms carefully before utilizing {brandName} services.
      </p>

      <GlassCard className="p-4 space-y-4 text-[11px] text-slate-300 leading-relaxed font-sans max-h-[600px] overflow-y-auto border-white/5 bg-slate-900/40">
        <div>
          <h5 className="font-bold text-white uppercase text-xs mb-1">1. Acceptance of Terms</h5>
          <p>
            By accessing or using the {brandName} mobile application ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you must immediately terminate use of the app.
          </p>
        </div>

        <div>
          <h5 className="font-bold text-white uppercase text-xs mb-1">2. Wallet Balances and Account Funding</h5>
          <p>
            {brandName} operates digital wallet balances for Nigeria (Naira). Balances can be used for virtual payments. All direct wallet balances are stored in persistent state. Account funding must be conducted via authorized channels, including manual peer-to-peer transfers or confirmed Withdrawal Voucher (deposit) vouchers.
          </p>
        </div>

        <div>
          <h5 className="font-bold text-white uppercase text-xs mb-1">3. Wallet Deposits</h5>
          <p>
            Wallet Deposits are unique cryptographic voucher tokens purchased by users. A deposit voucher is strictly non-refundable and has a fixed face value of ₦6,500. Verification of the deposit code is performed server-side. Users are solely responsible for keeping their active voucher codes secure. Sharing voucher codes is strictly at your own risk.
          </p>
        </div>

        <div>
          <h5 className="font-bold text-white uppercase text-xs mb-1">4. Forbidden Actions & Limits</h5>
          <p>
            You agree not to bypass, hack, or simulate voucher codes or verification routines. {brandName} reserves the right to freeze, deduct, or lock user accounts suspected of fraudulent voucher manipulation or fake transfer submissions.
          </p>
        </div>

        <div>
          <h5 className="font-bold text-white uppercase text-xs mb-1">5. Limitation of Liability</h5>
          <p>
            {brandName} provides services "as is" and "as available" without any warranty of any kind, either express or implied. Under no circumstances shall {brandName} or its operators be liable for financial loss, direct or indirect, arising from internet disruptions, bank downtime, or user negligence.
          </p>
        </div>

        <div>
          <h5 className="font-bold text-white uppercase text-xs mb-1">6. Contact & Support</h5>
          <p>
            For any billing disputes or transfer queries, users must contact official {brandName} representatives through our support live chat or verified WhatsApp link at {supportPhone}.
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
