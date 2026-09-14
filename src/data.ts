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
    question: 'How do I fund my Nevo wallet?',
    answer: 'Tap Deposit, choose an amount of at least ₦520, and continue to the fresh KoraPay hosted checkout. Nevo credits your wallet only after KoraPay confirms the payment server-side.'
  },
  {
    question: 'When can I withdraw or spend my wallet balance?',
    answer: 'Complete at least 5 successful referrals and make a verified KoraPay wallet deposit of at least ₦520. Both requirements are required before wallet-spending and cash-out services are unlocked.'
  },
  {
    question: 'How do I earn on Nevo?',
    answer: 'Complete available tasks, watch eligible rewarded adverts, and refer friends. Rewards are recorded in your Nevo account history.'
  },
  {
    question: 'What is the minimum withdrawal?',
    answer: 'The minimum withdrawal amount is ₦5,000 once your transaction eligibility requirements have been completed.'
  }
];
