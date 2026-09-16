import { Transaction, BankAccount, NotificationItem } from './types';

export const SUPPORTED_BANKS = [
  "9PSB",
  "Access Bank Limited",
  "Access Holdings Plc",
  "Aella App",
  "Airtel Money",
  "Alternative Bank Limited",
  "Carbon",
  "Chipper Cash",
  "Citibank Nigeria Limited",
  "Coronation Merchant Bank Limited",
  "Cowrywise",
  "Ecobank Nigeria Limited",
  "Eyowo",
  "FairMoney",
  "FBN Holdings Plc",
  "FBN Merchant Bank Limited",
  "FCMB Group Plc",
  "Fidelity Bank Plc",
  "First Bank of Nigeria Limited",
  "First City Monument Bank Limited (FCMB)",
  "FSDH Holding Company Limited",
  "FSDH Merchant Bank Limited",
  "Globus Bank Limited",
  "Greenwich Merchant Bank Limited",
  "Guaranty Trust Bank Limited (GTBank)",
  "Guaranty Trust Holding Company Plc",
  "Heritage Bank Plc",
  "Hope PSB",
  "Jaiz Bank Plc",
  "Keystone Bank Limited",
  "Kuda Bank",
  "Lotus Bank Limited",
  "Moniepoint",
  "MoneyMaster PSB",
  "MTN MoMo PSB",
  "Nova Merchant Bank Limited",
  "OPay",
  "Optimus Bank Limited",
  "PalmPay",
  "Parallex Bank Limited",
  "PiggyVest",
  "Polaris Bank Limited",
  "Premium Trust Bank Limited",
  "Providus Bank Limited",
  "Rand Merchant Bank Limited",
  "Rubies",
  "Signature Bank Limited",
  "SmartCash PSB",
  "Spar",
  "Stanbic IBTC Bank Limited",
  "Stanbic IBTC Holdings Plc",
  "Standard Chartered Bank Limited",
  "Sterling Bank Limited",
  "Sterling Financial Holdings Limited",
  "SunTrust Bank Nigeria Limited",
  "Taj Bank Limited",
  "Titan Trust Bank Limited",
  "UBA (United Bank for Africa Plc)",
  "Union Bank of Nigeria Plc",
  "Unity Bank Plc",
  "V Bank",
  "Wema Bank Plc",
  "Zenith Bank Plc"
];

export const MOBILE_NETWORKS = [
  { id: 'mtn', name: 'MTN Nigeria', color: 'bg-yellow-400 text-black', logo: 'MTN' },
  { id: 'airtel', name: 'Airtel Nigeria', color: 'bg-red-600 text-white', logo: 'Airtel' },
  { id: 'glo', name: 'Glo Nigeria', color: 'bg-green-600 text-white', logo: 'Glo' },
  { id: '9mobile', name: '9Mobile', color: 'bg-emerald-950 text-white', logo: '9Mob' }
];

export const DATA_PLANS = [
  // MTN Plans
  { id: 'mtn-500', network: 'mtn', size: '500MB', validity: '30 Days', price: 150 },
  { id: 'mtn-1g', network: 'mtn', size: '1GB', validity: '30 Days', price: 250 },
  { id: 'mtn-2g', network: 'mtn', size: '2GB', validity: '30 Days', price: 480 },
  { id: 'mtn-3g', network: 'mtn', size: '3GB', validity: '30 Days', price: 700 },
  { id: 'mtn-5g', network: 'mtn', size: '5GB', validity: '30 Days', price: 1100 },
  { id: 'mtn-10g', network: 'mtn', size: '10GB', validity: '30 Days', price: 2100 },
  { id: 'mtn-20g', network: 'mtn', size: '20GB', validity: '30 Days', price: 4000 },
  { id: 'mtn-50g', network: 'mtn', size: '50GB', validity: '30 Days', price: 9500 },
  { id: 'mtn-100g', network: 'mtn', size: '100GB', validity: '30 Days', price: 18000 },

  // Airtel Plans
  { id: 'air-500', network: 'airtel', size: '500MB', validity: '30 Days', price: 150 },
  { id: 'air-1g', network: 'airtel', size: '1GB', validity: '30 Days', price: 250 },
  { id: 'air-2g', network: 'airtel', size: '2GB', validity: '30 Days', price: 480 },
  { id: 'air-3g', network: 'airtel', size: '3GB', validity: '30 Days', price: 700 },
  { id: 'air-5g', network: 'airtel', size: '5GB', validity: '30 Days', price: 1100 },
  { id: 'air-10g', network: 'airtel', size: '10GB', validity: '30 Days', price: 2100 },
  { id: 'air-20g', network: 'airtel', size: '20GB', validity: '30 Days', price: 4000 },
  { id: 'air-50g', network: 'airtel', size: '50GB', validity: '30 Days', price: 9500 },
  { id: 'air-100g', network: 'airtel', size: '100GB', validity: '30 Days', price: 18000 },

  // Glo Plans
  { id: 'glo-500', network: 'glo', size: '500MB', validity: '30 Days', price: 150 },
  { id: 'glo-1g', network: 'glo', size: '1GB', validity: '30 Days', price: 250 },
  { id: 'glo-2g', network: 'glo', size: '2GB', validity: '30 Days', price: 480 },
  { id: 'glo-3g', network: 'glo', size: '3GB', validity: '30 Days', price: 700 },
  { id: 'glo-5g', network: 'glo', size: '5GB', validity: '30 Days', price: 1100 },
  { id: 'glo-10g', network: 'glo', size: '10GB', validity: '30 Days', price: 2100 },
  { id: 'glo-20g', network: 'glo', size: '20GB', validity: '30 Days', price: 4000 },
  { id: 'glo-50g', network: 'glo', size: '50GB', validity: '30 Days', price: 9500 },
  { id: 'glo-100g', network: 'glo', size: '100GB', validity: '30 Days', price: 18000 },

  // 9Mobile Plans
  { id: '9mo-500', network: '9mobile', size: '500MB', validity: '30 Days', price: 150 },
  { id: '9mo-1g', network: '9mobile', size: '1GB', validity: '30 Days', price: 250 },
  { id: '9mo-2g', network: '9mobile', size: '2GB', validity: '30 Days', price: 480 },
  { id: '9mo-3g', network: '9mobile', size: '3GB', validity: '30 Days', price: 700 },
  { id: '9mo-5g', network: '9mobile', size: '5GB', validity: '30 Days', price: 1100 },
  { id: '9mo-10g', network: '9mobile', size: '10GB', validity: '30 Days', price: 2100 },
  { id: '9mo-20g', network: '9mobile', size: '20GB', validity: '30 Days', price: 4000 },
  { id: '9mo-50g', network: '9mobile', size: '50GB', validity: '30 Days', price: 9500 },
  { id: '9mo-100g', network: '9mobile', size: '100GB', validity: '30 Days', price: 18000 }
];

export const SYSTEM_BANK_ACCOUNT: BankAccount = {
  accountName: 'pwamunadi ishaku',
  accountNumber: '8960723295',
  bankName: 'PalmPay'
};

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const FAQS = [
  {
    question: 'How do I create a Nevo account?',
    answer: 'Tap Sign Up and enter the requested information. Use an email address you can access and keep your Nevo password private. After registration, your account and any applicable registration bonus are shown in your wallet.'
  },
  {
    question: 'How do I fund my Nevo wallet?',
    answer: 'Tap Deposit, choose an amount of at least ₦520, and continue to the KoraPay checkout. Your Nevo wallet is credited only after the payment is successfully confirmed.'
  },
  {
    question: 'How do I earn on Nevo?',
    answer: 'You can earn by completing available tasks, taking part in eligible rewarded adverts, and referring genuine new users. Each task or opportunity shows its own instructions and reward before you start.'
  },
  {
    question: 'How do Nevo tasks work?',
    answer: 'Open the Tasks section, choose an available task, read the instructions carefully, and tap Start. If a task includes an external link, Nevo will open the destination provided for that task. Complete the required action and submit any requested proof.'
  },
  {
    question: 'How do rewarded adverts work?',
    answer: 'Open the Adverts section and choose an eligible advert. Follow the instructions shown for that advert. Rewards are added only when the required advert activity is successfully completed and accepted.'
  },
  {
    question: 'How do referrals work?',
    answer: 'Share your personal referral link or code with people you know. Referral rewards depend on genuine users joining through your referral and meeting the requirements shown in Nevo. Duplicate or abusive referrals do not qualify.'
  },
  {
    question: 'When can I withdraw my balance?',
    answer: 'Withdrawal access requires the eligibility requirements displayed in your Nevo account, including the required successful referrals and verified wallet deposit where applicable. Once eligible, the withdrawal page will show the available options and limits.'
  },
  {
    question: 'What is the minimum withdrawal amount?',
    answer: 'The normal minimum withdrawal amount is ₦5,000 once your Nevo withdrawal eligibility requirements have been completed.'
  },
  {
    question: 'How does Nevo protect my privacy?',
    answer: 'Nevo uses account information only for legitimate account, service, transaction, security, and support purposes. We do not sell your personal information to advertisers. See the Privacy Policy for a clear explanation of how your information is handled.'
  },
  {
    question: 'What should I do if I see an incorrect transaction or balance?',
    answer: 'Check your transaction history first. If the information still appears incorrect, contact Nevo support through an official support channel and provide the relevant transaction details. Never send your password or verification code to anyone.'
  },
  {
    question: 'What should I do if I cannot log in?',
    answer: 'Use the Forgot Password option to reset your password if available. Make sure you are using the email or username associated with your Nevo account. If you still cannot access the account, contact official Nevo support.'
  },
  {
    question: 'How can I contact Nevo support?',
    answer: 'Use the official support contact shown on Nevo, including the support email or official Telegram channel. Never trust a person asking for your password, OTP, PIN, or full payment credentials.'
  }
];
