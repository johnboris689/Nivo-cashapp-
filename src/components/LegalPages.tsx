import React from 'react';
import { ArrowLeft, Shield, Scale } from 'lucide-react';
import GlassCard from './GlassCard';

interface LegalPageProps { onBack: () => void; }

const terms = [
  ['1. Acceptance of Terms','By creating or using a Nevo account, you agree to these terms. If you do not agree, stop using the service.'],
  ['2. Your Account','Keep your login details private, provide accurate information, and use only your own Nevo account.'],
  ['3. Wallet & Deposits','Your wallet shows the balance recorded for your account. Deposits use the payment option provided by Nevo and are credited only after successful confirmation.'],
  ['4. Tasks & Rewards','Tasks, rewarded activities and referrals have their own instructions and requirements. Rewards are credited only after the required activity is successfully completed and accepted.'],
  ['5. Referrals','Referral rewards require genuine users who join through your referral information and meet the stated requirements. Abusive or duplicate referrals may be rejected.'],
  ['6. Withdrawals','Withdrawals are subject to the eligibility requirements and limits shown in Nevo. Provide correct bank details and confirm the verified account-holder name before submitting.'],
  ['7. Fair Use','Do not manipulate rewards, submit false information, abuse tasks or referrals, attempt unauthorized access, or interfere with the service.'],
  ['8. Account Restrictions','Nevo may restrict an account when there is a security concern, suspected abuse, or possible violation of these terms.'],
  ['9. Service Changes','Features, rewards, limits and requirements may change as Nevo develops. Important changes may be communicated through the platform.'],
  ['10. Support','Use only official Nevo support channels. Never send your password, OTP or PIN to support or another user.']
];

const privacy = [
  ['1. Information We Use','Nevo may use information you provide when creating and using your account, including your name, email, phone number and account details.'],
  ['2. Wallet & Activity','We keep information needed to maintain your wallet, record deposits, withdrawals, rewards, referrals, tasks and account history.'],
  ['3. Why We Use It','Information is used to provide Nevo services, process transactions, support your account, protect users, prevent abuse and send important service messages.'],
  ['4. Your Privacy & Security','Nevo takes reasonable measures to protect account information. You should also keep your password, OTP, PIN and other credentials private.'],
  ['5. Payment Services','Information needed to complete and confirm a payment may be handled by Nevo and the payment or banking services involved in that transaction.'],
  ['6. Sharing Information','Nevo does not sell personal information to advertisers. Information may be shared when necessary to provide a requested service, complete a transaction, protect users, prevent fraud or comply with law.'],
  ['7. Your Choices','Contact Nevo if you need to correct account information or raise a privacy concern. Some information may need to be retained for legitimate transaction, security or legal reasons.'],
  ['8. Policy Updates','Nevo may update this policy when services or privacy practices change. The latest version will be available on the platform.']
];

function LegalLayout({onBack,title,icon,sections}:{onBack:()=>void;title:string;icon:React.ReactNode;sections:string[][]}){
  return <div className="flex-1 flex flex-col bg-slate-950 text-white overflow-y-auto no-scrollbar p-5 space-y-5">
    <div className="flex items-center gap-3"><button onClick={onBack} className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"><ArrowLeft className="h-4 w-4"/></button><h4 className="text-base font-bold font-display flex items-center gap-2">{icon}{title}</h4></div>
    <p className="text-[11px] text-slate-400">Last updated: September 2026. Please read this information before using Nevo.</p>
    <GlassCard className="p-4 space-y-5 text-[11px] text-slate-300 leading-relaxed font-sans max-h-[680px] overflow-y-auto border-white/5 bg-slate-900/40">
      {sections.map(([heading,text])=><section key={heading}><h5 className="font-bold text-white uppercase text-xs mb-1">{heading}</h5><p>{text}</p></section>)}
    </GlassCard>
    <button onClick={onBack} className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-teal-500 text-white font-bold text-xs uppercase tracking-wider">Acknowledge & Close</button>
  </div>;
}

export function TermsOfService({onBack}:LegalPageProps){ return <LegalLayout onBack={onBack} title="Terms of Service" icon={<Scale className="h-4 w-4 text-teal-400"/>} sections={terms}/>; }
export function PrivacyPolicy({onBack}:LegalPageProps){ return <LegalLayout onBack={onBack} title="Privacy Policy" icon={<Shield className="h-4 w-4 text-teal-400"/>} sections={privacy}/>; }
