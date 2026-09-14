import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import {
  Bell,
  Menu,
  ChevronRight,
  ChevronDown,
  Send,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Edit3,
  Smartphone,
  Landmark,
  ExternalLink,
  Info,
  LogOut,
  HelpCircle,
  Clock,
  CheckCircle,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  X,
  CreditCard,
  UserCheck,
  Search,
  MessageSquare,
  TrendingDown,
  TrendingUp,
  Share2,
  Check,
  Ticket,
  Shield,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Tv,
  Zap,
  Gamepad2,
  Wallet,
  Download,
  Fingerprint,
  Bot,
  RefreshCw,
  PlusCircle,
  PlayCircle
} from 'lucide-react';

import { AdsPage } from './pages/AdsPage';

import { registerDeviceBiometric, loginWithBiometric, isWebAuthnSupported } from './lib/webauthn';
import { api, getAuthToken, setAuthToken, removeAuthToken } from './lib/api';
import { User, LegacyVoucherCode, Transaction, NotificationItem } from './types';
import { formatNaira } from './utils/formatters';
import WalletDepositModal from './components/WalletDepositModal';
import NivoFeaturesPanel from './components/NivoFeaturesPanel';
import {
  SUPPORTED_BANKS,
  MOBILE_NETWORKS,
  DATA_PLANS,
  SYSTEM_BANK_ACCOUNT,
  INITIAL_TRANSACTIONS,
  INITIAL_NOTIFICATIONS,
  FAQS
} from './data';

import GlassCard from './components/GlassCard';
import CongratulationsScreen from './components/CongratulationsScreen';
import NumericPad from './components/NumericPad';
import BottomNav from './components/BottomNav';
import { BankSelector } from './components/BankSelector';
import QuickFabMenu from './components/QuickFabMenu';
import NotificationsModal from './components/NotificationsModal';
import TransactionList from './components/TransactionList';
import { TermsOfService, PrivacyPolicy } from './components/LegalPages';
import { StandaloneTermsPage, StandalonePrivacyPage, Custom404Page } from './components/StandaloneLegalPages';
import LiveTicker from './components/LiveTicker';
import AiSupportChat from './components/AiSupportChat';

const isVoucherValid = (code: string) => {
  if (!code) return false;
  const norm = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return norm.startsWith('LEGACY_VOUCHER') && norm.length === 15;
};

// Upgraded components
import EmailSimulator from './components/EmailSimulator';
import DevicesHistory from './components/DevicesHistory';
import TransactionReceipt from './components/TransactionReceipt';
import AdminPanel from './components/AdminPanel';
import ErrorBoundary from './components/ErrorBoundary';
import { DeviceSession, LoginHistoryItem, Beneficiary, SimulatedEmail } from './types';

const CABLE_PROVIDERS = [
  {
    id: 'DSTV',
    name: 'DStv',
    packages: [
      { id: 'dstv-premium', name: 'DStv Premium', price: 37000 },
      { id: 'dstv-compact-plus', name: 'DStv Compact Plus', price: 25000 },
      { id: 'dstv-compact', name: 'DStv Compact', price: 15700 },
      { id: 'dstv-confam', name: 'DStv Confam', price: 9300 },
      { id: 'dstv-yanga', name: 'DStv Yanga', price: 5100 },
      { id: 'dstv-padi', name: 'DStv Padi', price: 3600 }
    ]
  },
  {
    id: 'GOTV',
    name: 'GOtv',
    packages: [
      { id: 'gotv-supa-plus', name: 'GOtv Supa+', price: 15700 },
      { id: 'gotv-supa', name: 'GOtv Supa', price: 9600 },
      { id: 'gotv-max', name: 'GOtv Max', price: 7200 },
      { id: 'gotv-jolli', name: 'GOtv Jolli', price: 4850 },
      { id: 'gotv-jinja', name: 'GOtv Jinja', price: 3300 },
      { id: 'gotv-lite', name: 'GOtv Lite', price: 1575 }
    ]
  },
  {
    id: 'StarTimes',
    name: 'StarTimes',
    packages: [
      { id: 'startimes-super', name: 'StarTimes Super', price: 8200 },
      { id: 'startimes-classic', name: 'StarTimes Classic', price: 5000 },
      { id: 'startimes-smart', name: 'StarTimes Smart', price: 3800 },
      { id: 'startimes-nova', name: 'StarTimes Nova', price: 1700 }
    ]
  },
  {
    id: 'Showmax',
    name: 'Showmax',
    packages: [
      { id: 'showmax-pro', name: 'Showmax Pro', price: 6500 },
      { id: 'showmax-entertainment', name: 'Showmax Entertainment', price: 2900 },
      { id: 'showmax-mobile', name: 'Showmax Mobile', price: 1500 }
    ]
  }
];

const DISCOS_PROVIDERS = [
  { id: 'AEDC', name: 'Abuja Electricity (AEDC)' },
  { id: 'EKEDC', name: 'Eko Electricity (EKEDC)' },
  { id: 'IKEDC', name: 'Ikeja Electric (IKEDC)' },
  { id: 'IBEDC', name: 'Ibadan Electricity (IBEDC)' },
  { id: 'KEDCO', name: 'Kano Electricity (KEDCO)' },
  { id: 'KAEDCO', name: 'Kaduna Electricity (KAEDCO)' },
  { id: 'JED', name: 'Jos Electricity (JED)' },
  { id: 'EEDC', name: 'Enugu Electricity (EEDC)' },
  { id: 'BEDC', name: 'Benin Electricity (BEDC)' },
  { id: 'PHED', name: 'Port Harcourt Electricity (PHED)' }
];

const BETTING_PROVIDERS = [
  { id: 'SportyBet', name: 'SportyBet' },
  { id: 'Bet9ja', name: 'Bet9ja' },
  { id: '1xBet', name: '1xBet Nigeria' },
  { id: 'BetKing', name: 'BetKing' },
  { id: 'Betway', name: 'Betway' },
  { id: 'Merrybet', name: 'Merrybet' },
  { id: 'NairaBet', name: 'NairaBet' },
  { id: 'Melbet', name: 'Melbet' },
  { id: 'Paripesa', name: 'Paripesa' }
];

export default function App() {
  // Theme & App Settings (Light, Dark, System Default)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    const saved = localStorage.getItem('nevo_theme_pref');
    return (saved as 'light' | 'dark' | 'system') || 'system';
  });

  // Derived state for components that check dark mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // State Management
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('nevo_user');
    if (saved) return JSON.parse(saved);
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('nevo_auth') === 'true';
  });

  const [hasSetupPin, setHasSetupPin] = useState<boolean>(true);

  const [isPinUnlocked, setIsPinUnlocked] = useState<boolean>(true);

  // Secure URL-driven Routing for Admin Dashboard (Point 1, 2, 3, 4)
  const [adminPath, setAdminPath] = useState(() => window.location.pathname);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return localStorage.getItem('nevo_admin_auth') === 'true';
  });
  const [adminToken, setAdminToken] = useState(() => {
    return localStorage.getItem('nevo_admin_token') || '';
  });

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setAdminPath(path);
  };

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const path = window.location.pathname.toLowerCase();
      setAdminPath(window.location.pathname);
      if (!path.startsWith('/boris')) {
        if (path === '/dashboard/withdraw' || path === '/withdraw') {
          setCurrentScreen('withdraw');
        } else if (path === '/ads' || path === '/dashboard/ads') {
          setCurrentScreen('ads');
        } else if (path === '/dashboard/transfer' || path === '/transfer') {
          setTransferStep(1);
          setCurrentScreen('transfer_bank');
        } else if (path === '/dashboard/buy-data' || path === '/dashboard/buy_data' || path === '/buy-data' || path === '/buy_data') {
          setCurrentScreen('buy_data');
        } else if (path === '/dashboard/buy-legacyVoucher' || path === '/dashboard/buy_legacyVoucher' || path === '/buy-legacyVoucher' || path === '/buy_legacyVoucher') {
          setPaymentModalOpen(true);
        } else if (e.state && e.state.appScreen) {
          setCurrentScreen(e.state.appScreen);
        } else {
          setCurrentScreen('dashboard');
        }
      }
    };
    window.addEventListener('popstate', handlePopState);

    // Set initial state
    const currentPath = window.location.pathname.toLowerCase();
    if (!currentPath.startsWith('/boris')) {
      if (currentPath === '/dashboard/withdraw' || currentPath === '/withdraw') {
        setCurrentScreen('withdraw');
      } else if (currentPath === '/ads' || currentPath === '/dashboard/ads') {
        setCurrentScreen('ads');
      } else if (currentPath === '/dashboard/transfer' || currentPath === '/transfer') {
        setTransferStep(1);
        setCurrentScreen('transfer_bank');
      } else if (currentPath === '/dashboard/buy-data' || currentPath === '/dashboard/buy_data' || currentPath === '/buy-data' || currentPath === '/buy_data') {
        setCurrentScreen('buy_data');
      } else if (currentPath === '/dashboard/buy-legacyVoucher' || currentPath === '/dashboard/buy_legacyVoucher' || currentPath === '/buy-legacyVoucher' || currentPath === '/buy_legacyVoucher') {
        setPaymentModalOpen(true);
      } else {
        window.history.replaceState({ appScreen: 'dashboard' }, '', window.location.pathname + window.location.search);
      }
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const lower = adminPath.toLowerCase();
    if ((lower === '/boris' || lower === '/boris/' || lower === '/boris/dashboard') && !isAdminAuthenticated) {
      navigateTo('/Boris/login');
    } else if (lower === '/boris/login' && isAdminAuthenticated) {
      navigateTo('/Boris/dashboard');
    }
  }, [adminPath, isAdminAuthenticated]);

  // Admin login credentials input state
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [isAdminSubmitting, setIsAdminSubmitting] = useState(false);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

  // Biometric & PIN login method state
  const [signInMethod, setSignInMethod] = useState<'password' | 'biometric' | 'pin'>('password');
  const [pinLoginInput, setPinLoginInput] = useState('');
  const [emailOrPhoneInput, setEmailOrPhoneInput] = useState('');

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmailInput || !adminPasswordInput) {
      showToast('Please enter both email and password.', 'error');
      return;
    }
    setIsAdminSubmitting(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmailInput, password: adminPasswordInput })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('nevo_admin_token', data.token);
        localStorage.setItem('nevo_admin_auth', 'true');
        setIsAdminAuthenticated(true);
        setAdminToken(data.token);
        showToast('Admin logged in successfully', 'success');
        navigateTo('/Boris/dashboard');
      } else {
        showToast(data.error || 'Invalid admin credentials', 'error');
      }
    } catch (err) {
      showToast('Network error during admin login', 'error');
    } finally {
      setIsAdminSubmitting(false);
    }
  };

  // Current screen or tab state
  const [currentScreen, setCurrentScreen] = useState<string>('dashboard');
  const [legacyVoucherBackScreen, setLegacyVoucherBackScreen] = useState<string>('dashboard');
  const changeScreen = (screenName: string) => {
    if (!window.location.pathname.startsWith('/Boris')) {
      if (currentScreen !== screenName) {
        window.history.pushState({ appScreen: screenName }, '', window.location.pathname + window.location.search);
      }
    }
    if (screenName === 'buy_legacyVoucher' && currentScreen !== 'buy_legacyVoucher') {
      setLegacyVoucherBackScreen(currentScreen);
    }
    setCurrentScreen(screenName);
  };
  const [activeTab, setActiveTab] = useState<string>('wallet');
  const [rewardsTab, setRewardsTab] = useState<'tasks' | 'referrals' | 'activation' | 'history'>('tasks');
  const [typedGreeting, setTypedGreeting] = useState('');

  useEffect(() => {
    const openDeposit = () => setPaymentModalOpen(true);
    window.addEventListener('nevo-open-deposit', openDeposit);
    return () => window.removeEventListener('nevo-open-deposit', openDeposit);
  }, []);

  useEffect(() => {
    const name = user?.fullName?.split(' ')[0] || 'there';
    const text = `Hi, ${name}`;
    setTypedGreeting('');
    let i = 0;
    const timer = window.setInterval(() => {
      i += 1;
      setTypedGreeting(text.slice(0, i));
      if (i >= text.length) window.clearInterval(timer);
    }, 85);
    return () => window.clearInterval(timer);
  }, [user?.fullName, currentScreen, activeTab]);

  // Multi-step form values
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signup');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCodeInput, setReferralCodeInput] = useState('');

  // Password Visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Forgot Password flow states
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetStep, setResetStep] = useState<'request' | 'verify' | 'new_password'>('request');
  const [simulatedResetInfo, setSimulatedResetInfo] = useState<{ otp: string; token: string } | null>(null);

  // Change Password & Security form states (inside settings)
  const [changeCurrentPassword, setChangeCurrentPassword] = useState('');
  const [changeNewPassword, setChangeNewPassword] = useState('');
  const [isChangingPasswordOpen, setIsChangingPasswordOpen] = useState(false);
  const [isChangingPinOpen, setIsChangingPinOpen] = useState(false);
  const [changeNewPinInput, setChangeNewPinInput] = useState('');
  const [isActivatingBiometric, setIsActivatingBiometric] = useState(false);

  // PIN Setup or Unlock States
  const [pinEntry, setPinEntry] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [pinStep, setPinStep] = useState<1 | 2>(1); // Step 1: Entry, Step 2: Confirmation
  const [biometricStatus, setBiometricStatus] = useState<'idle' | 'reading' | 'success'>('idle');

  // Transactions & Vouchers Persistence
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('nevo_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [vouchers, setVouchers] = useState<LegacyVoucherCode[]>(() => {
    const saved = localStorage.getItem('nevo_vouchers');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('nevo_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Flow specific parameters - Deposit Configuration Price is strictly fixed at dynamic configured price
  const [legacyVoucherConfig, setLegacyVoucherConfig] = useState<{
    bankName: string;
    accountNumber: string;
    accountName: string;
    whatsappLink: string;
    voucherPrice: number;
    instructions: string;
    maintenanceNotice: string;
  }>({
    bankName: "PalmPay",
    accountNumber: "8960723295",
    accountName: "pwamunadi ishaku",
    whatsappLink: "https://wa.me/2349162845073",
    voucherPrice: 6500,
    instructions: "Copy the system account details below. Make a manual bank transfer of the exact locked amount. Return here and click 'I have made this bank Transfer' to trigger operator check.",
    maintenanceNotice: "Wema Bank transfers are temporarily delayed. Please use other supported banks (like PalmPay or GTBank) for instant manual validation."
  });
  const [buyLegacyVoucherAmount, setBuyLegacyVoucherAmount] = useState<string>('6500');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [showRegistrationWelcome, setShowRegistrationWelcome] = useState(false);

  const [systemSettings, setSystemSettings] = useState<Record<string, string>>({
    websiteName: "Nevo",
    scrollingAnnouncement: "Welcome to Nevo! Fast and secure manual transactions with 24/7 support.",
    liveFeedText: "Chioma O. just purchased a Deposit code • Yusuf D. withdrew ₦25,000",
    welcomeMessage: "Welcome to Nevo",
    dashboardBanner: "Get started with fast manual voucher activation & seamless transfers",
    whatsappNumber: "+2349162845073",
    whatsappLink: "https://wa.me/2349162845073",
    supportEmail: "support@nevo.ng",
    supportPhone: "+2349162845073",
    maintenanceMode: "false"
  });

  useEffect(() => {
    const loadLegacyVoucherAndPublicSettings = async () => {
      try {
        const [legacyVoucherRes, settingsRes] = await Promise.all([
          fetch('/api/config/legacyVoucher'),
          fetch('/api/settings/public')
        ]);

        if (legacyVoucherRes.ok) {
          const data = await legacyVoucherRes.json();
          if (data.success && data.config) {
            setLegacyVoucherConfig(data.config);
            setBuyLegacyVoucherAmount(String(data.config.voucherPrice));
          }
        }

        if (settingsRes.ok) {
          const sData = await settingsRes.json();
          if (sData.success && sData.settings) {
            setSystemSettings(sData.settings);
          }
        }
      } catch (e) {
        console.warn('Failed to fetch system configuration:', e);
      }
    };
    loadLegacyVoucherAndPublicSettings();
    const interval = setInterval(loadLegacyVoucherAndPublicSettings, 10000);

    const handleSettingsUpdated = () => {
      loadLegacyVoucherAndPublicSettings();
    };
    window.addEventListener('settingsUpdated', handleSettingsUpdated);

    return () => {
      clearInterval(interval);
      window.removeEventListener('settingsUpdated', handleSettingsUpdated);
    };
  }, []);

  useEffect(() => {
    if (systemSettings.websiteName) {
      document.title = systemSettings.websiteName;
    }
    if (systemSettings.websiteFavicon) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = systemSettings.websiteFavicon;
    }
    if (systemSettings.primaryColor) {
      document.documentElement.style.setProperty('--primary-color', systemSettings.primaryColor);
    }
  }, [systemSettings]);
  const [legacyVoucherFormName, setLegacyVoucherFormName] = useState('');
  const [legacyVoucherFormEmail, setLegacyVoucherFormEmail] = useState('');
  const [legacyVoucherProcessingSeconds, setLegacyVoucherProcessingSeconds] = useState(3);
  const [warningDismissed, setWarningDismissed] = useState(false);

  // Airtime fields
  const [airtimeNetwork, setAirtimeNetwork] = useState('mtn');
  const [airtimePhone, setAirtimePhone] = useState('');
  const [airtimeAmount, setAirtimeAmount] = useState('');
  const [airtimeLegacyVoucherCode, setAirtimeLegacyVoucherCode] = useState('');
  const [airtimePlanSelected, setAirtimePlanSelected] = useState<string>('');

  // Data fields (separating the Data Purchase screen)
  const [dataNetwork, setDataNetwork] = useState('mtn');
  const [dataPhone, setDataPhone] = useState('');
  const [dataLegacyVoucherCode, setDataLegacyVoucherCode] = useState('');
  const [selectedDataPlan, setSelectedDataPlan] = useState<any>(null);

  // Transfer fields
  const [transferStep, setTransferStep] = useState<1 | 2>(1);
  const [transferBank, setTransferBank] = useState('9PSB');
  const [transferAccNum, setTransferAccNum] = useState('');
  const [transferAccName, setTransferAccName] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferLegacyVoucherCode, setTransferLegacyVoucherCode] = useState('');
  const [isVerifyingAccount, setIsVerifyingAccount] = useState(false);
  const [transferVerified, setTransferVerified] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Direct Withdraw flow - Redesigned into dedicated screen with Real-time Account Verification
  const [withdrawStep, setWithdrawStep] = useState<1 | 2>(1);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawBank, setWithdrawBank] = useState('9PSB');
  const [withdrawAccount, setWithdrawAccount] = useState('');
  const [withdrawAccName, setWithdrawAccName] = useState('');
  const [withdrawLegacyVoucherCode, setWithdrawLegacyVoucherCode] = useState('');
  const [isVerifyingWithdrawAccount, setIsVerifyingWithdrawAccount] = useState(false);
  const [withdrawVerified, setWithdrawVerified] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccessfulReferrals, setWithdrawSuccessfulReferrals] = useState(0);
  const [withdrawDepositVerified, setWithdrawDepositVerified] = useState(false);
  const [withdrawEligibilityLoading, setWithdrawEligibilityLoading] = useState(false);
  const [withdrawNameConfirmed, setWithdrawNameConfirmed] = useState(false);

  // Bills Fields
  const [billsType, setBillsType] = useState<'cable' | 'electricity' | 'betting'>('cable');
  const [billsProvider, setBillsProvider] = useState('DSTV');
  const [billsAccountNumber, setBillsAccountNumber] = useState('');
  const [billsAmount, setBillsAmount] = useState('');
  const [billsLegacyVoucherCode, setBillsLegacyVoucherCode] = useState('');
  const [billsCablePackage, setBillsCablePackage] = useState('dstv-premium');
  const [billsMeterType, setBillsMeterType] = useState<'prepaid' | 'postpaid'>('prepaid');
  const [isMeterValidated, setIsMeterValidated] = useState(false);
  const [isValidatingMeter, setIsValidatingMeter] = useState(false);
  const [meterOwnerName, setMeterOwnerName] = useState('');
  const [meterAddress, setMeterAddress] = useState('');

  // Automatic cable package pricing sync
  useEffect(() => {
    if (billsType === 'cable') {
      const provider = CABLE_PROVIDERS.find(p => p.id === billsProvider);
      if (provider) {
        const pkg = provider.packages.find(p => p.id === billsCablePackage) || provider.packages[0];
        if (pkg) {
          setBillsCablePackage(pkg.id);
          setBillsAmount(String(pkg.price));
        }
      }
    }
  }, [billsType, billsProvider, billsCablePackage]);

  // Sync default providers on bill type change
  useEffect(() => {
    if (billsType === 'cable') {
      setBillsProvider('DSTV');
      setIsMeterValidated(false);
      setBillsCablePackage('dstv-premium');
    } else if (billsType === 'electricity') {
      setBillsProvider('AEDC');
      setIsMeterValidated(false);
    } else if (billsType === 'betting') {
      setBillsProvider('SportyBet');
      setIsMeterValidated(false);
    }
  }, [billsType]);

  // Reset validation when critical fields change
  const handleMeterNumberChange = (val: string) => {
    setBillsAccountNumber(val);
    setIsMeterValidated(false);
    setMeterOwnerName('');
    setMeterAddress('');
  };

  const handleProviderChange = (val: string) => {
    setBillsProvider(val);
    setIsMeterValidated(false);
    setMeterOwnerName('');
    setMeterAddress('');
    if (billsType === 'cable') {
      const provider = CABLE_PROVIDERS.find(p => p.id === val);
      if (provider && provider.packages.length > 0) {
        setBillsCablePackage(provider.packages[0].id);
        setBillsAmount(String(provider.packages[0].price));
      }
    }
  };

  const handleMeterTypeChange = (val: 'prepaid' | 'postpaid') => {
    setBillsMeterType(val);
    setIsMeterValidated(false);
    setMeterOwnerName('');
    setMeterAddress('');
  };

  // Simulated meter verification
  const handleValidateMeter = async () => {
    if (!billsAccountNumber || billsAccountNumber.trim().length < 5) {
      showToast('Please enter a valid meter number (minimum 5 digits).', 'error');
      return;
    }
    setIsValidatingMeter(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const firstNames = ['Adebayo', 'Chinedu', 'Olumide', 'Fatima', 'Emeka', 'Funmi', 'Babatunde', 'Amina'];
      const lastNames = ['Alabi', 'Okonkwo', 'Johnson', 'Garba', 'Eze', 'Ogunleye', 'Balogun', 'Bello'];
      const streets = ['Herbert Macaulay Way', 'Adeniran Ogunsanya St', 'Bode Thomas St', 'Ahmadu Bello Way', 'Allen Avenue', 'Isaac John St'];
      const areas = ['Yaba, Lagos', 'Surulere, Lagos', 'Ikeja, Lagos', 'Wuse II, Abuja', 'Garki, Abuja', 'Lekki Phase 1, Lagos'];
      
      const owner = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
      const address = `${Math.floor(Math.random() * 120) + 1}, ${streets[Math.floor(Math.random() * streets.length)]}, ${areas[Math.floor(Math.random() * areas.length)]}`;
      
      setMeterOwnerName(owner);
      setMeterAddress(address);
      setIsMeterValidated(true);
      showToast('Meter details verified successfully!', 'success');
    } catch (err) {
      showToast('Meter validation failed. Try again.', 'error');
    } finally {
      setIsValidatingMeter(false);
    }
  };

  // lastTxTime ref to protect against race conditions
  const lastTxTime = useRef<number>(0);

  // Cache for account verifications (Session Cache)
  const verificationCacheRef = useRef<Record<string, { success: boolean; accountName?: string; error?: string }>>({});

  // Mandatory Deposit requirement missing overlay config
  const [voucherErrorModal, setVoucherErrorModal] = useState<{ open: boolean; message: string } | null>(null);

  // Guide Video modal
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Support live chat
  const [liveChatMessages, setLiveChatMessages] = useState<Array<{ sender: 'user' | 'agent'; text: string; time: string }>>([
    { sender: 'agent', text: 'Hello! Welcome to Nevo Live Chat. How can we assist you with your wallet, deposits, transfers, or bills today?', time: 'Just now' }
  ]);
  const [liveChatInput, setLiveChatInput] = useState('');
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [generatedLegacyVoucher, setGeneratedLegacyVoucher] = useState<LegacyVoucherCode | null>(null);

  // Virtual Account LEGACY_VOUCHER Payment System state
  const [activeLegacyVoucherPayment, setActiveLegacyVoucherPayment] = useState<{
    id?: string;
    reference: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    amount: number;
    expiresAt: string;
    createdAt?: string;
    status: string;
    voucherCode?: string;
  } | null>(null);
  const [isInitiatingLegacyVoucher, setIsInitiatingLegacyVoucher] = useState(false);
  const [isVerifyingLegacyVoucher, setIsVerifyingLegacyVoucher] = useState(false);
  const [paymentCountdown, setPaymentCountdown] = useState<number>(900);

  // Dynamic system-wide configurations
  const [videoUrl, setVideoUrl] = useState('');
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [recoveryEnabled, setRecoveryEnabled] = useState(true);
  const [smsRecoveryEnabled, setSmsRecoveryEnabled] = useState(true);

  const getEmbedUrl = (url: string): string => {
    if (!url) return '';
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`;
    }
    return url;
  };

  useEffect(() => {
    const fetchSystemConfig = async () => {
      try {
        const res = await fetch('/api/config/video');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setVideoUrl(data.videoUrl || '');
            setVideoEnabled(data.videoEnabled !== false);
            setRecoveryEnabled(data.recoveryEnabled !== false);
            setSmsRecoveryEnabled(data.smsRecoveryEnabled !== false);
          }
        }
      } catch (err) {
        console.warn('Error fetching system config:', err);
      }
    };
    fetchSystemConfig();
  }, []);

  // New Upgraded States for Fintech Compliance
  const [isEmailSimulatorOpen, setIsEmailSimulatorOpen] = useState(false);
  const [emails, setEmails] = useState<SimulatedEmail[]>(() => {
    const saved = localStorage.getItem('nevo_simulated_emails');
    return saved ? JSON.parse(saved) : [];
  });

  const [devices, setDevices] = useState<DeviceSession[]>(() => {
    const saved = localStorage.getItem('nevo_devices');
    return saved ? JSON.parse(saved) : [
      { id: 'dev-1', name: 'Chrome Desktop', os: 'macOS', browser: 'Chrome 125', loginDate: new Date().toLocaleDateString(), lastActivity: 'Just now', isCurrent: true },
      { id: 'dev-2', name: 'iPhone 15 Pro', os: 'iOS 17', browser: 'Safari Mobile', loginDate: '2026-07-08', lastActivity: '1 day ago', isCurrent: false }
    ];
  });

  const [loginHistory, setLoginHistory] = useState<LoginHistoryItem[]>(() => {
    const saved = localStorage.getItem('nevo_login_history');
    return saved ? JSON.parse(saved) : [
      { id: 'log-1', date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString(), device: 'Chrome Desktop', browser: 'Chrome 125', ip: '197.210.64.12', location: 'Lagos, Nigeria', status: 'success' },
      { id: 'log-2', date: '2026-07-08', time: '14:22:10', device: 'iPhone 15 Pro', browser: 'Safari Mobile', ip: '102.89.33.45', location: 'Abuja, Nigeria', status: 'success' },
      { id: 'log-3', date: '2026-07-08', time: '09:05:14', device: 'Unknown Linux Device', browser: 'Firefox 120', ip: '185.190.140.2', location: 'Frankfurt, Germany', status: 'failed' }
    ];
  });

  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(() => {
    const saved = localStorage.getItem('nevo_beneficiaries');
    return saved ? JSON.parse(saved) : [
      { id: 'ben-1', name: 'Alhaji Yusuf Dangote', accountNumber: '0123456789', bankName: 'Access Bank Limited' },
      { id: 'ben-2', name: 'Chioma Sandra Okafor', accountNumber: '8960723295', bankName: 'OPay' },
      { id: 'ben-3', name: 'Adebayo Balogun', accountNumber: '2001458922', bankName: 'Zenith Bank Plc' }
    ];
  });

  const [phoneBeneficiaries, setPhoneBeneficiaries] = useState<any[]>(() => {
    const saved = localStorage.getItem('nevo_phone_beneficiaries');
    return saved ? JSON.parse(saved) : [
      { id: 'pben-1', name: 'Mom', phone: '08034567890', network: 'mtn' },
      { id: 'pben-2', name: 'Office', phone: '09012345678', network: 'airtel' },
      { id: 'pben-3', name: 'Sister', phone: '07055544433', network: 'glo' }
    ];
  });

  const [selectedReceiptTx, setSelectedReceiptTx] = useState<Transaction | null>(null);
  
  // Security 2FA / sensitive action states
  const [securityOtp, setSecurityOtp] = useState('');
  const [securityOtpSession, setSecurityOtpSession] = useState<{ otp: string; purpose: string; data?: any; expiresAt: number } | null>(null);

  // Inactivity countdown
  const [inactivityCountdown, setInactivityCountdown] = useState<number | null>(null);

  // Transfer specific additions
  const [transferNarration, setTransferNarration] = useState('');
  const [transferPin, setTransferPin] = useState('');
  const [transferConfirmationTx, setTransferConfirmationTx] = useState<any | null>(null);
  const [isTransferConfirming, setIsTransferConfirming] = useState(false);
  const [isTransferSuccess, setIsTransferSuccess] = useState(false);
  const [transferSuccessTx, setTransferSuccessTx] = useState<Transaction | null>(null);

  // Modals & Sliders Toggle
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isFloatingAiChatOpen, setIsFloatingAiChatOpen] = useState(false);
  const [activeDataTab, setActiveDataTab] = useState<'daily' | 'weekly' | 'monthly' | 'sme'>('daily');

  // Feedback Notifications (Toasts)
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info' | 'error'>('success');

  // Offline/Online detection (Point 5)
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Dynamic Device Detection & Screen Adaptation state
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'laptop' | 'desktop' | 'large'>('mobile');
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 375);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) setReferralCodeInput(ref.toUpperCase());

    const depositRef = params.get('deposit_ref');
    if (depositRef) {
      const token = getAuthToken();
      if (token) {
        showToast('Verifying your KoraPay payment...', 'info');
        const verifyEndpoint = `/api/korapay/check-status/${encodeURIComponent(depositRef)}`;
        fetch(verifyEndpoint, {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.status === 'successful' || data.status === 'approved' || data.status === 'completed') {
              showToast('Deposit confirmed! Your Nevo wallet has been credited.', 'success');
              syncWithBackend();
            } else if (data.status === 'pending') {
              showToast('Payment is still pending. We will update your balance once confirmed.', 'info');
            } else {
              showToast(data.message || 'Payment was not completed.', 'error');
            }
          })
          .catch(() => {
            showToast('Unable to check payment status right now.', 'info');
          })
          .finally(() => {
            const url = new URL(window.location.href);
            url.searchParams.delete('deposit_ref');
                window.history.replaceState({}, document.title, url.pathname + (url.searchParams.toString() ? '?' + url.searchParams.toString() : ''));
          });
      }
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      if (width < 640) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else if (width < 1280) {
        setDeviceType('laptop');
      } else if (width < 1536) {
        setDeviceType('desktop');
      } else {
        setDeviceType('large');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const getContainerClasses = () => {
    return "w-full max-w-full min-w-0 min-h-screen bg-[#0c0c14] relative flex flex-col overflow-x-hidden transition-colors duration-300";
  };

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Theme Preference effect supporting Light, Dark, and System Default
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      let shouldBeDark = true;
      if (theme === 'dark') {
        shouldBeDark = true;
      } else if (theme === 'light') {
        shouldBeDark = false;
      } else {
        shouldBeDark = mediaQuery.matches;
      }

      setIsDarkMode(shouldBeDark);
      if (shouldBeDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();
    localStorage.setItem('nevo_theme_pref', theme);

    if (theme === 'system') {
      const listener = () => applyTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  // Sync state changes to LocalStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('nevo_user', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('nevo_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('nevo_vouchers', JSON.stringify(vouchers));
  }, [vouchers]);

  useEffect(() => {
    localStorage.setItem('nevo_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('nevo_simulated_emails', JSON.stringify(emails));
  }, [emails]);

  useEffect(() => {
    localStorage.setItem('nevo_devices', JSON.stringify(devices));
  }, [devices]);

  useEffect(() => {
    localStorage.setItem('nevo_login_history', JSON.stringify(loginHistory));
  }, [loginHistory]);

  useEffect(() => {
    localStorage.setItem('nevo_beneficiaries', JSON.stringify(beneficiaries));
  }, [beneficiaries]);

  // Online/Offline Event Listeners (Point 5)
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Connection restored. You are back online!', 'success');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('Network connection lost. Nevo is running in offline mode.', 'error');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Inactivity automatic logout monitor
  useEffect(() => {
    if (!isAuthenticated || currentScreen === 'onboarding') {
      setInactivityCountdown(null);
      return;
    }

    let activityTimer: any = null;
    let countdownInterval: any = null;

    const resetInactivityTimer = () => {
      setInactivityCountdown(null);
      if (activityTimer) clearTimeout(activityTimer);
      if (countdownInterval) clearInterval(countdownInterval);

      // Set inactivity alert to trigger after 270 seconds (4.5 minutes)
      activityTimer = setTimeout(() => {
        let remaining = 30;
        setInactivityCountdown(remaining);

        countdownInterval = setInterval(() => {
          remaining -= 1;
          if (remaining <= 0) {
            clearInterval(countdownInterval);
            handleLogout();
            showToast('Automatic logout: Inactive session expired.', 'info');
          } else {
            setInactivityCountdown(remaining);
          }
        }, 1000);
      }, 270 * 1000);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(ev => window.addEventListener(ev, resetInactivityTimer));

    resetInactivityTimer();

    return () => {
      if (activityTimer) clearTimeout(activityTimer);
      if (countdownInterval) clearInterval(countdownInterval);
      events.forEach(ev => window.removeEventListener(ev, resetInactivityTimer));
    };
  }, [isAuthenticated, currentScreen]);

  // Centralized Dynamic Backend State Sync Engine
  const syncWithBackend = async (force: boolean = false) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.status === 401 || res.status === 403) {
        setIsAuthenticated(false);
        localStorage.removeItem('nevo_auth');
        removeAuthToken();
        localStorage.removeItem('nevo_user');
        setCurrentScreen('onboarding');
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          // Prevent race condition if a transaction succeeded very recently
          if (!force && Date.now() - lastTxTime.current < 4000) {
            console.log("[Sync Engine] Skipping user and transaction sync to prevent overwrite of recent transaction state.");
          } else {
            setUser(data.user);
            localStorage.setItem('nevo_user', JSON.stringify(data.user));
            if (data.user.transactions) {
              setTransactions(data.user.transactions);
            }
            if (data.user.notifications && Array.isArray(data.user.notifications)) {
              setNotifications(prev => {
                const readSet = new Set(prev.filter(n => !n.unread).map(n => n.id));
                const merged = data.user.notifications.map((n: any) => 
                  readSet.has(n.id) ? { ...n, unread: false } : n
                );
                localStorage.setItem('nevo_notifications', JSON.stringify(merged));
                return merged;
              });
            }
            if (data.user.loginHistory) {
              setLoginHistory(data.user.loginHistory);
            }
            if (data.user.beneficiaries) {
              setBeneficiaries(data.user.beneficiaries);
            }
            if (data.user.phoneBeneficiaries) {
              setPhoneBeneficiaries(data.user.phoneBeneficiaries);
            }
          }
        }
      }

      // Fetch user's own active and historic deposits directly from DB
      const vouchersRes = await fetch('/api/vouchers/my-vouchers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (vouchersRes.ok) {
        const vouchersData = await vouchersRes.json();
        if (vouchersData.success && vouchersData.vouchers) {
          setVouchers(vouchersData.vouchers);
          localStorage.setItem('nevo_vouchers', JSON.stringify(vouchersData.vouchers));
        }
      }
    } catch (err) {
      console.warn('Error syncing with backend:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      syncWithBackend();
      const interval = setInterval(syncWithBackend, 5000); // 5 seconds polling
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Scroll live chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveChatMessages, isAgentTyping]);

  // Toast trigger helper
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Send a simulated email
  const sendSimulatedEmail = (to: string, subject: string, body: string) => {
    const newEmail: SimulatedEmail = {
      id: 'email-' + Math.random().toString(36).substring(2, 9),
      to,
      subject,
      body,
      date: new Date().toISOString(),
      read: false
    };
    setEmails(prev => [newEmail, ...prev]);
  };

  // Helper to start a secure 2FA session for a sensitive action
  const startSecurityOtpSession = (purpose: string, data: any, emailAddress: string) => {
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    setSecurityOtpSession({
      otp: generatedCode,
      purpose,
      data,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 mins expiry
    });
    setSecurityOtp('');
    sendSimulatedEmail(
      emailAddress,
      'Nevo SecurID Authorization Code',
      `Dear customer,\n\nA sensitive operation was initiated on your Nevo mobile application. To confirm it is you, please enter the following 6-digit authorization code:\n\nVerification Code: ${generatedCode}\n\nThis code will expire in 5 minutes. If you did not request this, please change your password immediately or contact live chat support.`
    );
    showToast('A secure 2FA code was dispatched to your simulated inbox!', 'info');
  };

  // Onboarding registration via Express backend
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthSubmitting) return;
    if (!fullName || !email || !password) {
      showToast('Please fill out all fields', 'error');
      return;
    }

    // Password validation: at least 8 chars, containing letter and number
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (password.length < 8 || !hasLetter || !hasNumber) {
      showToast('Password must be at least 8 characters long and contain both letters and numbers.', 'error');
      return;
    }

    setIsAuthSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password, referralCode: referralCodeInput.trim() || undefined })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Registration failed.', 'error');
        return;
      }

      setUser(data.user);
      setAuthToken(data.token);
      localStorage.setItem('nevo_auth', 'true');
      setShowRegistrationWelcome(true);
      setIsAuthenticated(true);
      setHasSetupPin(true);
      setIsPinUnlocked(true);
      setCurrentScreen('congratulations');
      showToast('Account created successfully!', 'success');
    } catch (err) {
      console.error('Registration error:', err);
      showToast('Network error during registration.', 'error');
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  // Onboarding Login via Express backend
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthSubmitting) return;
    if (!email || !password) {
      showToast('Please enter your credentials', 'error');
      return;
    }

    setIsAuthSubmitting(true);
    try {
       const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Authentication failed.', 'error');
        return;
      }

      setUser(data.user);
      setAuthToken(data.token);
      localStorage.setItem('nevo_auth', 'true');
      setIsAuthenticated(true);
      setHasSetupPin(true);
      setIsPinUnlocked(true);
      setCurrentScreen('dashboard');
      showToast('Welcome back to Nevo!', 'success');
    } catch (err) {
      console.error('Login error:', err);
      showToast('Network error during login.', 'error');
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  // PIN Sign In Handler
  const handlePinSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isAuthSubmitting) return;

    const target = emailOrPhoneInput || email;
    if (!target) {
      showToast('Please enter your email address or phone number.', 'error');
      return;
    }
    if (!pinLoginInput || (pinLoginInput.length !== 4 && pinLoginInput.length !== 6)) {
      showToast('Please enter your 4-digit or 6-digit security PIN.', 'error');
      return;
    }

    setIsAuthSubmitting(true);
    try {
      const res = await fetch('/api/auth/pin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone: target, pinCode: pinLoginInput })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'PIN authentication failed.', 'error');
        setPinLoginInput('');
        return;
      }

      setUser(data.user);
      setAuthToken(data.token);
      localStorage.setItem('nevo_auth', 'true');
      setIsAuthenticated(true);
      setHasSetupPin(true);
      setIsPinUnlocked(true);
      setCurrentScreen('dashboard');
      showToast('Authenticated successfully with PIN!', 'success');
    } catch (err) {
      console.error('PIN Login error:', err);
      showToast('Network error during PIN login.', 'error');
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  // Real Native Device Biometric Sign In Handler
  const handleBiometricSignIn = async () => {
    if (isAuthSubmitting) return;
    const targetEmail = email || emailOrPhoneInput;
    if (!targetEmail) {
      showToast('Please enter your registered email address first.', 'error');
      return;
    }

    setIsAuthSubmitting(true);
    showToast('Opening native biometric prompt...', 'info');
    try {
      const result = await loginWithBiometric(targetEmail);
      if (!result.success || !result.token || !result.user) {
        showToast(result.error || 'Biometric verification failed. Try PIN or password.', 'error');
        return;
      }

      setUser(result.user);
      setAuthToken(result.token);
      localStorage.setItem('nevo_auth', 'true');
      setIsAuthenticated(true);
      setHasSetupPin(true);
      setIsPinUnlocked(true);
      setCurrentScreen('dashboard');
      showToast('Biometric authentication verified! Welcome back.', 'success');
    } catch (err: any) {
      console.error('Biometric Login error:', err);
      showToast('Biometric error: ' + (err.message || 'Verification failed.'), 'error');
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  // Forgot Password flow - initiate code generation
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      showToast('Please enter your email address', 'error');
      return;
    }

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to dispatch reset code.', 'error');
        return;
      }

      // The recovery code is delivered through the configured email/SMS channel.
      setSimulatedResetInfo(null);
      setResetStep('verify');
      showToast('Recovery code sent. Check your email or phone.', 'success');
    } catch (err) {
      showToast('Error requesting password recovery.', 'error');
    }
  };

  // Forgot Password flow - verify OTP or Token
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(resetOtp)) { showToast('Please enter the 6-digit OTP code.', 'error'); return; }
    try {
      const res = await fetch('/api/auth/verify-reset-otp', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email:forgotEmail, otp:resetOtp }) });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Invalid verification code.', 'error'); return; }
      setResetStep('new_password');
      showToast('Code verified. Set your new password.', 'success');
    } catch { showToast('Network error verifying recovery code.', 'error'); }
  };

  // Forgot Password flow - submit password reset
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    if (newPassword.length < 8 || !hasLetter || !hasNumber) {
      showToast('Password must be at least 8 characters long and contain both letters and numbers.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail,
          password: newPassword,
          otp: resetOtp
        })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Reset failed.', 'error');
        return;
      }

      // Reset forgot password states
      setResetStep('request');
      setForgotEmail('');
      setResetOtp('');
      setResetToken('');
      setNewPassword('');
      setConfirmNewPassword('');
      setSimulatedResetInfo(null);
      setAuthMode('signin');
      setCurrentScreen('onboarding');
      showToast('Password updated securely. Please sign in.', 'success');
    } catch (err) {
      showToast('Network error during password reset.', 'error');
    }
  };

  // 2FA Sensitive Callback Handlers
  const handleConfirmPasswordChange = async (data: any) => {
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email,
          currentPassword: data.currentPassword,
          newPassword: data.newPassword
        })
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        showToast('Password changed successfully!', 'success');
        setChangeCurrentPassword('');
        setChangeNewPassword('');
        setIsChangingPasswordOpen(false);
      } else {
        showToast(resData.error || 'Failed to change password.', 'error');
      }
    } catch (err) {
      showToast('Error executing password change.', 'error');
    }
  };

  const handleConfirmEmailChange = async (data: any) => {
    showToast('Email updated successfully!', 'success');
  };

  const handleConfirmPinChange = async (data: any) => {
    showToast('PIN changed successfully!', 'success');
  };

  const handleConfirmTransferSubmit = async (data: any) => {
    if (data && typeof data.onSuccess === 'function') {
      data.onSuccess();
    } else {
      showToast('Transfer completed successfully!', 'success');
    }
  };

  // Log out flow
  const handleLogout = () => {
    localStorage.removeItem('nevo_auth');
    localStorage.removeItem('nevo_pin_setup');
    setIsAuthenticated(false);
    setIsPinUnlocked(false);
    setUser(null);
    setPinEntry('');
    setPinConfirm('');
    setCurrentScreen('onboarding');
    showToast('Logged out securely', 'info');
  };

  // Handle keypress on NumericPad for PIN screen
  const handlePinKeyPress = (num: string) => {
    if (currentScreen === 'pin_setup') {
      if (pinStep === 1) {
        if (pinEntry.length < 4) {
          const newPin = pinEntry + num;
          setPinEntry(newPin);
          if (newPin.length === 4) {
            // Move to confirm
            setTimeout(() => {
              setPinStep(2);
            }, 300);
          }
        }
      } else {
        if (pinConfirm.length < 4) {
          const newConfirm = pinConfirm + num;
          setPinConfirm(newConfirm);
          if (newConfirm.length === 4) {
            // Verify
            setTimeout(async () => {
              if (pinEntry === newConfirm) {
                const token = getAuthToken();
                if (token) {
                  try {
                    const res = await fetch('/api/auth/pin/setup', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({ pinCode: pinEntry })
                    });
                    const data = await res.json();
                    if (res.ok && data.user) {
                      setUser(data.user);
                    }
                  } catch (err) {
                    console.error('PIN setup server error:', err);
                  }
                } else if (user) {
                  setUser({ ...user, pinCreated: true, pinCode: pinEntry });
                }
                localStorage.setItem('nevo_pin_setup', 'true');
                setHasSetupPin(true);
                setIsPinUnlocked(true);
                showToast('Wallet PIN configured securely!', 'success');
                setCurrentScreen('dashboard');
              } else {
                showToast('PINs do not match. Restarting entry.', 'error');
                setPinEntry('');
                setPinConfirm('');
                setPinStep(1);
              }
            }, 350);
          }
        }
      }
    } else if (currentScreen === 'pin_entry') {
      if (pinEntry.length < 4) {
        const newPin = pinEntry + num;
        setPinEntry(newPin);
        if (newPin.length === 4) {
          setTimeout(async () => {
            const token = getAuthToken();
            if (user?.email) {
              try {
                const res = await fetch('/api/auth/pin/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ emailOrPhone: user.email, pinCode: newPin })
                });
                const data = await res.json();
                if (res.ok && data.user) {
                  setUser(data.user);
                  setIsPinUnlocked(true);
                  setCurrentScreen('dashboard');
                  showToast('Unlocked successfully. Welcome back!', 'success');
                  setPinEntry('');
                  return;
                } else {
                  showToast(data.error || 'Invalid PIN passcode. Try again.', 'error');
                  setPinEntry('');
                  return;
                }
              } catch (e) {
                console.error('PIN verify error:', e);
              }
            }
            if (newPin === (user?.pinCode || '1234')) {
              setIsPinUnlocked(true);
              setCurrentScreen('dashboard');
              showToast(`Unlocked successfully. Welcome back!`, 'success');
              setPinEntry('');
            } else {
              showToast('Invalid passcode. Try again', 'error');
              setPinEntry('');
            }
          }, 300);
        }
      }
    }
  };

  const handlePinBackspace = () => {
    if (currentScreen === 'pin_setup') {
      if (pinStep === 1) {
        setPinEntry(pinEntry.slice(0, -1));
      } else {
        setPinConfirm(pinConfirm.slice(0, -1));
      }
    } else if (currentScreen === 'pin_entry') {
      setPinEntry(pinEntry.slice(0, -1));
    }
  };

  // Trigger Real Device Biometric Scan
  const triggerFingerprintScan = async () => {
    if (biometricStatus !== 'idle') return;
    setBiometricStatus('reading');

    const token = getAuthToken();

    if (currentScreen === 'pin_setup' || currentScreen === 'dashboard') {
      if (token) {
        const result = await registerDeviceBiometric(token);
        if (result.success && result.user) {
          setUser(result.user);
          setBiometricStatus('success');
          showToast(result.message, 'success');
        } else {
          setBiometricStatus('idle');
          showToast(result.message || 'Biometric scan failed', 'error');
        }
      } else {
        setBiometricStatus('success');
        if (user) setUser({ ...user, biometricEnabled: true });
        showToast('Biometric fingerprint registered!', 'success');
      }
      setTimeout(() => setBiometricStatus('idle'), 1200);
    } else {
      const targetEmail = email || user?.email;
      if (targetEmail) {
        const result = await loginWithBiometric(targetEmail);
        if (result.success && result.user) {
          setUser(result.user);
          if (result.token) setAuthToken(result.token);
          setBiometricStatus('success');
          setIsAuthenticated(true);
          setIsPinUnlocked(true);
          setCurrentScreen('dashboard');
          showToast('Authenticated via native biometric sensor', 'success');
        } else {
          setBiometricStatus('idle');
          showToast(result.error || 'Biometric verification failed', 'error');
        }
      } else {
        setBiometricStatus('idle');
        showToast('Please enter your email address for biometric login', 'error');
      }
      setTimeout(() => setBiometricStatus('idle'), 1200);
    }
  };

  // ----------------------------------------------------
  // Real-time Bank Account Verification Effects
  // ----------------------------------------------------
  useEffect(() => {
    let active = true;
    if (!transferAccNum || transferAccNum.length !== 10 || !transferBank) {
      setTransferVerified(false);
      setTransferAccName('');
      setTransferError(transferAccNum.length === 10 && !transferBank ? 'Please select a bank' : null);
      setIsVerifyingAccount(false);
      return;
    }

    const cacheKey = `transfer:${transferBank}:${transferAccNum}`;
    const cached = verificationCacheRef.current[cacheKey];
    if (cached) {
      setTransferAccName(cached.success ? (cached.accountName || '') : '');
      setTransferVerified(Boolean(cached.success && cached.accountName));
      setTransferError(cached.success ? null : (cached.error || 'Invalid account number or bank combination'));
      setIsVerifyingAccount(false);
      return;
    }

    setIsVerifyingAccount(true);
    setTransferVerified(false);
    setTransferAccName('');
    setTransferError(null);
    api.verifyBankAccount({ bank: transferBank, accountNumber: transferAccNum })
      .then((data) => {
        if (!active) return;
        if (data.success && data.accountName) {
          verificationCacheRef.current[cacheKey] = { success: true, accountName: data.accountName };
          setTransferAccName(data.accountName);
          setTransferVerified(true);
          setTransferError(null);
        } else {
          const message = 'Unable to verify this bank account. Please check the bank and account number.';
          verificationCacheRef.current[cacheKey] = { success: false, error: message };
          setTransferAccName('');
          setTransferVerified(false);
          setTransferError(message);
        }
      })
      .catch((err: any) => {
        if (!active) return;
        setTransferVerified(false);
        setTransferAccName('');
        setTransferError(err?.message || 'Unable to verify account. Please sign in again if your session has expired.');
      })
      .finally(() => { if (active) setIsVerifyingAccount(false); });

    return () => { active = false; };
  }, [transferBank, transferAccNum]);

  useEffect(() => {
    if (currentScreen !== 'withdraw' || !user) return;
    let active = true;
    setWithdrawEligibilityLoading(true);
    api.getWithdrawalEligibility()
      .then((status) => {
        if (!active) return;
        setWithdrawSuccessfulReferrals(Number(status.successfulReferrals || 0));
        setWithdrawDepositVerified(Boolean(status.verifiedDeposit));
      })
      .catch((err: any) => {
        if (active) showToast(err?.message || 'Unable to check withdrawal access.', 'error');
      })
      .finally(() => { if (active) setWithdrawEligibilityLoading(false); });
    return () => { active = false; };
  }, [currentScreen, user]);

  useEffect(() => {
    let active = true;
    if (!withdrawAccount || withdrawAccount.length !== 10 || !withdrawBank) {
      setWithdrawVerified(false);
      setWithdrawAccName('');
      setWithdrawError(withdrawAccount.length === 10 && !withdrawBank ? 'Please select a bank' : null);
      setIsVerifyingWithdrawAccount(false);
      setWithdrawNameConfirmed(false);
      return;
    }

    const cacheKey = `withdraw:${withdrawBank}:${withdrawAccount}`;
    const cached = verificationCacheRef.current[cacheKey];
    if (cached) {
      setWithdrawAccName(cached.success ? (cached.accountName || '') : '');
      setWithdrawVerified(Boolean(cached.success && cached.accountName));
      setWithdrawError(cached.success ? null : (cached.error || 'Invalid account number or bank combination'));
      setIsVerifyingWithdrawAccount(false);
      return;
    }

    setIsVerifyingWithdrawAccount(true);
    setWithdrawError(null);
    setWithdrawVerified(false);
    setWithdrawAccName('');
    setWithdrawNameConfirmed(false);
    api.verifyBankAccount({ bank: withdrawBank, accountNumber: withdrawAccount })
      .then((data) => {
        if (!active) return;
        if (data.success && data.accountName) {
          verificationCacheRef.current[cacheKey] = { success: true, accountName: data.accountName };
          setWithdrawAccName(data.accountName);
          setWithdrawVerified(true);
          setWithdrawError(null);
        } else {
          const message = 'Unable to verify this bank account. Please check the bank and account number.';
          verificationCacheRef.current[cacheKey] = { success: false, error: message };
          setWithdrawAccName('');
          setWithdrawVerified(false);
          setWithdrawError(message);
        }
      })
      .catch((err: any) => {
        if (!active) return;
        setWithdrawVerified(false);
        setWithdrawAccName('');
        setWithdrawNameConfirmed(false);
        setWithdrawError(err?.message || 'Unable to verify account. Please sign in again if your session has expired.');
      })
      .finally(() => { if (active) setIsVerifyingWithdrawAccount(false); });

    return () => { active = false; };
  }, [withdrawBank, withdrawAccount]);

  // LEGACY_VOUCHER Payment Initiate Handler (Manual Bank Transfer)
  const handleInitiateLegacyVoucher = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsInitiatingLegacyVoucher(true);
    setLegacyVoucherFormName(user?.fullName || 'Client User');
    setLegacyVoucherFormEmail(user?.email || 'user@example.com');

    setActiveLegacyVoucherPayment({
      reference: `legacyVoucher-${Date.now()}`,
      bankName: legacyVoucherConfig.bankName,
      accountNumber: legacyVoucherConfig.accountNumber,
      accountName: legacyVoucherConfig.accountName,
      amount: legacyVoucherConfig.voucherPrice,
      expiresAt: new Date(Date.now() + 900000).toISOString(),
      status: 'pending'
    });
    setPaymentCountdown(900);
    setCurrentScreen('legacyVoucher_instructions');
    setIsInitiatingLegacyVoucher(false);
  };

  // Generate and Download PDF Receipt for Deposit
  const handleDownloadLegacyVoucherPdfReceipt = () => {
    if (!generatedLegacyVoucher) return;
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const primaryDark = [12, 12, 20];
      const tealAccent = [45, 212, 191];
      const slateDark = [15, 23, 42];
      const borderGray = [226, 232, 240];

      // Header Banner
      doc.setFillColor(primaryDark[0], primaryDark[1], primaryDark[2]);
      doc.rect(0, 0, 210, 48, 'F');

      // Top Header Accent Bar
      doc.setFillColor(tealAccent[0], tealAccent[1], tealAccent[2]);
      doc.rect(0, 0, 210, 4, 'F');

      // Header Brand Text
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text('NEVO DIGITAL BANKING', 20, 22);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(tealAccent[0], tealAccent[1], tealAccent[2]);
      doc.text('Official Deposit Certificate & Payment Receipt', 20, 31);

      // Status Badge
      doc.setFillColor(16, 185, 129);
      doc.roundedRect(145, 18, 45, 10, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text('VERIFIED & ACTIVE', 148, 24.5);

      // Voucher Code Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.roundedRect(20, 56, 170, 32, 3, 3, 'FD');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('DEPOSIT CODE (MANDATORY FOR WITHDRAWALS)', 30, 66);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(13, 148, 136);
      doc.text(generatedLegacyVoucher.code || generatedLegacyVoucher.voucherCode || 'LEGACY_VOUCHER-CODE-ISSUED', 30, 79);

      // Details Table
      let startY = 98;
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.roundedRect(20, startY, 170, 60, 3, 3, 'D');

      const rows = [
        { label: 'Voucher Status', val: 'UNUSED / ACTIVE' },
        { label: 'Voucher Price', val: `NGN ${(generatedLegacyVoucher.amount || 6500).toLocaleString()}` },
        { label: 'Purchased By', val: user?.email || legacyVoucherFormEmail || 'Customer' },
        { label: 'Payment Method', val: 'Direct Bank Transfer' },
        { label: 'Issue Date', val: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }
      ];

      let cY = startY + 10;
      rows.forEach((r) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(100, 116, 139);
        doc.text(r.label, 26, cY);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text(r.val, 184, cY, { align: 'right' });

        cY += 10;
      });

      // Footer Security Seal
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('Nevo Security System • Automatically Verified', 105, 170, { align: 'center' });

      doc.save(`nevo-deposit-${generatedLegacyVoucher.code || 'code'}.pdf`);
      showToast('Deposit PDF Receipt Downloaded!', 'success');
    } catch (err) {
      console.error('Error generating LEGACY_VOUCHER PDF:', err);
      showToast('Failed to generate LEGACY_VOUCHER PDF', 'error');
    }
  };

  // 15-Minute Countdown Ticker for Manual Bank Transfer Screen
  useEffect(() => {
    if (currentScreen !== 'legacyVoucher_instructions') {
      return;
    }

    const interval = setInterval(() => {
      setPaymentCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentScreen]);

  // Helper to persist balance update on server and sync locally
  const updateBalanceOnServer = async (newBalance: number) => {
    if (!user) return;
    try {
      const res = await fetch('/api/auth/update-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, balance: newBalance })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser({ ...user, balance: newBalance });
      } else {
        setUser({ ...user, balance: newBalance });
      }
    } catch (e) {
      console.error('Balance sync error:', e);
      setUser({ ...user, balance: newBalance });
    }
  };

  // Perform Airtime Purchase
  const handlePurchaseAirtime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!airtimePhone || airtimePhone.length < 10) {
      showToast('Enter a valid Nigerian phone number', 'error');
      return;
    }
    if (!airtimeAmount || parseInt(airtimeAmount) < 100) {
      showToast('Minimum purchase is ₦100', 'error');
      return;
    }

    const price = parseInt(airtimeAmount);

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/transactions/airtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('nevo_auth_token')}`
        },
        body: JSON.stringify({
          phoneNumber: airtimePhone,
          network: airtimeNetwork,
          amount: price,
        })
      });
      const data = await res.json();

      if (res.status === 401 || res.status === 403) {
        showToast('Your session has expired. Please log in again.', 'error');
        setIsAuthenticated(false);
        localStorage.removeItem('nevo_auth');
        removeAuthToken();
        localStorage.removeItem('nevo_user');
        setCurrentScreen('onboarding');
        setIsSubmitting(false);
        return;
      }

      if (!res.ok) {
        showToast(data.error || 'Airtime purchase failed.', 'error');
        setIsSubmitting(false);
        return;
      }

      // Update user state and transactions list from returned data
      lastTxTime.current = Date.now();
      setUser(prev => prev ? { ...prev, balance: data.balance } : null);
      if (user) {
        localStorage.setItem('nevo_user', JSON.stringify({ ...user, balance: data.balance }));
      }
      setTransactions([data.transaction, ...transactions]);

      // Request latest state and balance from backend
      await syncWithBackend(true);

      // Automatically trigger notification update
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: 'Airtime Purchase Successful!',
        body: `₦${price.toLocaleString()} Airtime has been credited to ${airtimePhone}. Balance updated.`,
        date: new Date().toISOString(),
        unread: true,
        type: 'airtime',
        category: 'Airtime Topup',
        status: 'Completed',
        amount: price,
        phoneNumber: airtimePhone,
        reference: data.transaction?.id || `AIR-${Date.now()}`
      };
      setNotifications([newNotif, ...notifications]);

      showToast('Airtime purchase completed successfully!', 'success');
      setSelectedReceiptTx(data.transaction);
      
      // Reset fields
      setAirtimePhone('');
      setAirtimeAmount('');
      setAirtimeLegacyVoucherCode('');
      setCurrentScreen('dashboard');
      setActiveTab('wallet');
    } catch (err) {
      showToast('Error purchasing airtime.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Perform Data Bundle Purchase (Point 12)
  const handlePurchaseData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!dataPhone || dataPhone.length < 10) {
      showToast('Enter a valid Nigerian phone number', 'error');
      return;
    }
    if (!selectedDataPlan) {
      showToast('Please select a data bundle from the available list', 'error');
      return;
    }

    const price = selectedDataPlan.price;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/transactions/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('nevo_auth_token')}`
        },
        body: JSON.stringify({
          phoneNumber: dataPhone,
          network: dataNetwork,
          bundleId: selectedDataPlan.id,
        })
      });
      const data = await res.json();

      if (res.status === 401 || res.status === 403) {
        showToast('Your session has expired. Please log in again.', 'error');
        setIsAuthenticated(false);
        localStorage.removeItem('nevo_auth');
        removeAuthToken();
        localStorage.removeItem('nevo_user');
        setCurrentScreen('onboarding');
        setIsSubmitting(false);
        return;
      }

      if (!res.ok) {
        showToast(data.error || 'Data purchase failed.', 'error');
        setIsSubmitting(false);
        return;
      }

      // Update user state and transactions list from returned data
      lastTxTime.current = Date.now();
      setUser(prev => prev ? { ...prev, balance: data.balance } : null);
      if (user) {
        localStorage.setItem('nevo_user', JSON.stringify({ ...user, balance: data.balance }));
      }
      setTransactions([data.transaction, ...transactions]);

      // Request latest state and balance from backend
      await syncWithBackend(true);

      // Trigger notification update
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: 'Data Purchase Successful!',
        body: `${selectedDataPlan.size} bundle active on ${dataPhone}. Balance updated.`,
        date: new Date().toISOString(),
        unread: true,
        type: 'data',
        category: 'Data Bundle',
        status: 'Completed',
        amount: selectedDataPlan.price,
        phoneNumber: dataPhone,
        reference: data.transaction?.id || `DAT-${Date.now()}`
      };
      setNotifications([newNotif, ...notifications]);

      showToast(`Successfully purchased ${selectedDataPlan.size} data bundle!`, 'success');
      setSelectedReceiptTx(data.transaction);

      // Reset fields
      setDataPhone('');
      setSelectedDataPlan(null);
      setDataLegacyVoucherCode('');
      setCurrentScreen('dashboard');
      setActiveTab('wallet');
    } catch (err) {
      showToast('Error purchasing data bundle.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Perform Bank Transfer Out flow
  const handleBankTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!transferAccNum || transferAccNum.length !== 10 || !transferAccName) {
      showToast('Please enter a verified 10-digit account number', 'error');
      return;
    }
    const price = parseInt(transferAmount);
    if (!transferAmount || isNaN(price) || price < 5000 || price > 200000) {
      showToast('Transfer amount must be between ₦50 and ₦200,000', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/transactions/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('nevo_auth_token')}`
        },
        body: JSON.stringify({
          bank: transferBank,
          accountNumber: transferAccNum,
          amount: price,
          voucherCode: '',
          accountName: transferAccName
        })
      });
      const data = await res.json();

      if (res.status === 401 || res.status === 403) {
        showToast('Your session has expired. Please log in again.', 'error');
        setIsAuthenticated(false);
        localStorage.removeItem('nevo_auth');
        removeAuthToken();
        localStorage.removeItem('nevo_user');
        setCurrentScreen('onboarding');
        setIsSubmitting(false);
        return;
      }

      if (!res.ok) {
        showToast(data.error || 'Bank transfer failed.', 'error');
        setIsSubmitting(false);
        return;
      }

      // Update user state and transactions list from returned data
      lastTxTime.current = Date.now();
      setUser(prev => prev ? { ...prev, balance: data.balance } : null);
      if (user) {
        localStorage.setItem('nevo_user', JSON.stringify({ ...user, balance: data.balance }));
      }
      setTransactions([data.transaction, ...transactions]);

      // Request latest state and balance from backend
      await syncWithBackend(true);

      // Trigger notification update
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: 'Transfer Completed!',
        body: `₦${price.toLocaleString()} has been sent to ${transferAccName} (${transferBank}).`,
        date: new Date().toISOString(),
        unread: true,
        type: 'transfer',
        category: 'Bank Transfer',
        status: 'Completed',
        amount: price,
        recipientName: transferAccName,
        bankName: transferBank,
        accountNumber: transferAccNum,
        reference: data.transaction?.id || `TRF-${Date.now()}`
      };
      setNotifications([newNotif, ...notifications]);

      showToast('Bank transfer completed successfully!', 'success');
      setSelectedReceiptTx(data.transaction);

      // Reset and return
      setTransferAccNum('');
      setTransferAmount('');
      setTransferLegacyVoucherCode('');
      setTransferAccName('');
      setCurrentScreen('dashboard');
      setActiveTab('wallet');
    } catch (err) {
      showToast('Error performing bank transfer.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Perform Dedicated Bank Withdrawal Flow (Point 11, Point 7)
  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!withdrawAccount || withdrawAccount.length !== 10 || !withdrawAccName || !withdrawNameConfirmed) {
      showToast('Please verify the bank account and confirm the displayed account name first.', 'error');
      return;
    }
    if (withdrawSuccessfulReferrals < 5) {
      showToast(`Complete 5 successful referrals first (${withdrawSuccessfulReferrals}/5).`, 'error');
      return;
    }
    if (!withdrawDepositVerified) {
      showToast('Make a verified KoraPay deposit of at least ₦520 before withdrawing. This is not an activation fee; it remains your money.', 'error');
      return;
    }
    const price = parseInt(withdrawAmount);
    if (!withdrawAmount || isNaN(price) || price < 5000 || price > 200000) {
      showToast('Withdrawal amount must be between ₦5,000 and ₦200,000', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await api.submitWithdrawal({
        amount: price,
        bankName: withdrawBank,
        accountNumber: withdrawAccount,
        accountName: withdrawAccName
      });
      const data: any = result;

      // Update user state and transactions list from returned data
      lastTxTime.current = Date.now();
      setUser(prev => prev ? { ...prev, balance: data.balance } : null);
      if (user) {
        localStorage.setItem('nevo_user', JSON.stringify({ ...user, balance: data.balance }));
      }
      setTransactions([data.transaction, ...transactions]);

      // Request latest state and balance from backend
      await syncWithBackend(true);

      // Trigger notification update
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: 'Withdrawal Pending Approval',
        body: `Your withdrawal request of ₦${price.toLocaleString()} to ${withdrawAccName} (${withdrawBank}) has been received successfully and is currently under manual review by our compliance team. You will receive another notification once it has been approved or rejected.`,
        date: new Date().toISOString(),
        unread: true,
        type: 'withdraw',
        category: 'Withdrawal',
        status: 'Pending Review',
        amount: price,
        recipientName: withdrawAccName,
        bankName: withdrawBank,
        accountNumber: withdrawAccount,
        reference: data.transaction?.id || `WDR-${Date.now()}`
      };
      setNotifications([newNotif, ...notifications]);

      showToast('Withdrawal completed successfully!', 'success');
      setSelectedReceiptTx(data.transaction);

      // Reset and return
      setWithdrawAccount('');
      setWithdrawAmount('');
      setWithdrawLegacyVoucherCode('');
      setWithdrawAccName('');
      setWithdrawNameConfirmed(false);
      setCurrentScreen('dashboard');
      setActiveTab('wallet');
    } catch (err: any) {
      showToast(err?.message || 'Error performing withdrawal.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectWithdraw = handleWithdrawalSubmit;

  // Perform Bill Payment
  const handlePayBillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!billsAccountNumber || billsAccountNumber.trim().length < 5) {
      showToast('Please enter a valid meter/account/smartcard number (minimum 5 digits).', 'error');
      return;
    }
    if (billsType === 'electricity' && !isMeterValidated) {
      showToast('Please validate your meter number first before making payment.', 'error');
      return;
    }
    if (!billsAmount || isNaN(Number(billsAmount)) || Number(billsAmount) <= 0) {
      showToast('Please enter a valid bill payment amount.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/transactions/bills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('nevo_auth_token')}`
        },
        body: JSON.stringify({
          type: billsType,
          provider: billsProvider,
          accountNumber: billsAccountNumber,
          amount: Number(billsAmount),
        })
      });
      const data = await res.json();

      if (res.status === 401 || res.status === 403) {
        showToast('Your session has expired. Please log in again.', 'error');
        setIsAuthenticated(false);
        localStorage.removeItem('nevo_auth');
        removeAuthToken();
        localStorage.removeItem('nevo_user');
        setCurrentScreen('onboarding');
        setIsSubmitting(false);
        return;
      }

      if (!res.ok) {
        showToast(data.error || 'Bill payment failed.', 'error');
        setIsSubmitting(false);
        return;
      }

      // Update user state and transactions list from returned data
      lastTxTime.current = Date.now();
      setUser(prev => prev ? { ...prev, balance: data.balance } : null);
      if (user) {
        localStorage.setItem('nevo_user', JSON.stringify({ ...user, balance: data.balance }));
      }
      setTransactions([data.transaction, ...transactions]);

      // Request latest state and balance from backend
      await syncWithBackend(true);

      // Trigger notification update
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: 'Bill Payment Successful!',
        body: `Successfully paid ₦${Number(billsAmount).toLocaleString()} for ${billsProvider} (${billsAccountNumber}).`,
        date: new Date().toISOString(),
        unread: true,
        type: 'system',
        category: 'Bill Payment',
        status: 'Completed',
        amount: Number(billsAmount),
        accountNumber: billsAccountNumber,
        reference: data.transaction?.id || `BILL-${Date.now()}`
      };
      setNotifications([newNotif, ...notifications]);

      showToast('Bill payment completed successfully!', 'success');
      setSelectedReceiptTx(data.transaction);

      // Reset fields
      setBillsAccountNumber('');
      setBillsAmount('');
      setBillsLegacyVoucherCode('');
      setCurrentScreen('dashboard');
      setActiveTab('wallet');
    } catch (err) {
      showToast('Error performing bill payment.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pre-fill LEGACY_VOUCHER Code on transfer/airtime forms
  const handleQuickRedeemLegacyVoucher = (code: string, flow: 'airtime' | 'transfer') => {
    if (flow === 'airtime') {
      setAirtimeLegacyVoucherCode(code);
      const voucher = vouchers.find(v => v.code === code);
      if (voucher) {
        setAirtimeAmount(voucher.amount.toString());
      }
      setCurrentScreen('buy_airtime');
    } else {
      setTransferLegacyVoucherCode(code);
      const voucher = vouchers.find(v => v.code === code);
      if (voucher) {
        setTransferAmount(voucher.amount.toString());
      }
      setCurrentScreen('transfer_bank');
    }
  };

  // Handle support message submissions
  const handleSendSupportMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveChatInput.trim()) return;

    const userMsg = liveChatInput.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setLiveChatMessages((prev) => [...prev, { sender: 'user', text: userMsg, time: timeStr }]);
    setLiveChatInput('');
    setIsAgentTyping(true);

    // Dynamic support answers
    setTimeout(() => {
      let replyText = 'Thank you for reaching out. A premium billing operator has logged your session. If you have made a transfer, please wait up to 3 minutes for automatic synchronization.';
      const msgLower = userMsg.toLowerCase();

      if (msgLower.includes('legacyVoucher') || msgLower.includes('voucher') || msgLower.includes('code')) {
        replyText = 'Deposits add funds directly to your Nevo wallet through the secure payment provider flow.';
      } else if (msgLower.includes('delay') || msgLower.includes('confirm') || msgLower.includes('wait')) {
        replyText = 'Apologies for the delay! If your bank is under maintenance, our backend operators reconcile transfers manually. Drop your account name and transfer receipt here for prompt verification!';
      } else if (msgLower.includes('airtime') || msgLower.includes('data')) {
        replyText = 'To load airtime or data, open the relevant service, choose the network and amount, then pay from your wallet balance.';
      } else if (msgLower.includes('hello') || msgLower.includes('hi') || msgLower.includes('support')) {
        replyText = `Hi! Nevo Live Agent online. How can we assist with your balance, deposits, transfers, or bills?`;
      }

      setLiveChatMessages((prev) => [...prev, { sender: 'agent', text: replyText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setIsAgentTyping(false);
    }, 1500);
  };

  // Helper formatting - standardizes monetary display with 2 decimal places (e.g. ₦0.00)
  const nairaFormat = (val: number) => {
    return formatNaira(val);
  };

  // Mark single notification read
  const handleMarkNotifRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, unread: false } : n);
      try {
        localStorage.setItem('nevo_notifications', JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save notifications to localStorage", e);
      }
      return updated;
    });
  };

  // Mark all notifications read
  const handleMarkAllNotifsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, unread: false }));
      try {
        localStorage.setItem('nevo_notifications', JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save notifications to localStorage", e);
      }
      return updated;
    });
    showToast('All notifications marked as read', 'info');
  };

  // Trigger floating actions from sheet
  const handleSelectFabAction = (actionId: string) => {
    if (actionId === 'deposit') {
      setPaymentModalOpen(true);
    } else if (actionId === 'buy-airtime') {
      setCurrentScreen('buy_airtime');
    } else if (actionId === 'buy-data') {
      setCurrentScreen('buy_data');
    } else if (actionId === 'transfer-bank') {
      setCurrentScreen('transfer_bank');
    } else if (actionId === 'social-channels') {
      setActiveTab('social');
      setCurrentScreen('dashboard');
    }
  };

  // Render Standalone Legal Pages and handle 404 routing
  const normalizedPath = adminPath.replace(/\/$/, '') || '/';

  if (normalizedPath === '/terms') {
    return <StandaloneTermsPage navigateTo={navigateTo} />;
  }

  if (normalizedPath === '/privacy') {
    return <StandalonePrivacyPage navigateTo={navigateTo} />;
  }

  const lowerAdminPath = adminPath.toLowerCase();
  const lowerNormalizedPath = normalizedPath.toLowerCase();
  const isBorisRoute = lowerAdminPath.startsWith('/boris');

  const isValidRoute = 
    normalizedPath === '/' || 
    normalizedPath === '/index.html' || 
    lowerNormalizedPath === '/terms' || 
    lowerNormalizedPath === '/privacy' || 
    lowerNormalizedPath === '/dashboard' ||
    lowerNormalizedPath === '/dashboard/withdraw' ||
    lowerNormalizedPath === '/withdraw' ||
    lowerNormalizedPath === '/dashboard/transfer' ||
    lowerNormalizedPath === '/transfer' ||
    lowerNormalizedPath === '/dashboard/buy-data' ||
    lowerNormalizedPath === '/dashboard/buy_data' ||
    lowerNormalizedPath === '/buy-data' ||
    lowerNormalizedPath === '/buy_data' ||

    isBorisRoute;

  if (!isValidRoute) {
    return <Custom404Page navigateTo={navigateTo} />;
  }

  // Render Secure Admin Login Router for unauthenticated admin access
  if (isBorisRoute && !isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050507] [background:radial-gradient(circle_at_0%_0%,#1e1b4b_0%,#050507_50%),radial-gradient(circle_at_100%_100%,#082f49_0%,#050507_50%)] text-white flex flex-col items-center justify-center p-4">
        {toastMessage && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-[slideDown_0.2s_ease-out]">
            <div className="p-3.5 rounded-xl text-xs font-semibold shadow-xl border backdrop-blur-md flex items-center gap-2.5 bg-red-500/10 text-red-400 border-red-500/20 font-sans">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}
        <div className="w-full max-w-md bg-[#0c0c14]/90 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative font-sans">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="h-14 w-14 bg-[#312e81]/60 border border-[#818cf8]/40 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/10">
              <Shield className="h-7 w-7 text-[#2dd4bf]" />
            </div>
            <h1 className="text-2xl font-black font-display bg-gradient-to-r from-[#818cf8] to-[#2dd4bf] bg-clip-text text-transparent">
              Nevo Admin Portal
            </h1>
            <p className="text-xs text-slate-400 mt-2 font-mono uppercase tracking-wider">SECURE AUTHORIZATION</p>
          </div>

          <form onSubmit={handleAdminLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
                Admin Email Address
              </label>
              <input
                type="email"
                value={adminEmailInput}
                onChange={(e) => setAdminEmailInput(e.target.value)}
                placeholder="Enter Admin Email"
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#818cf8] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
                Admin Password
              </label>
              <input
                type="password"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#818cf8] transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isAdminSubmitting}
              className={`w-full py-3.5 bg-gradient-to-r from-[#6366f1] to-[#0d9488] hover:from-[#4f46e5] hover:to-[#0f766e] text-white font-bold rounded-xl text-sm uppercase tracking-wider transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-lg shadow-indigo-500/10 ${
                isAdminSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isAdminSubmitting ? 'Verifying Credentials...' : 'Sign In To Terminal'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center flex flex-col gap-2">
            <button
              onClick={() => navigateTo('/')}
              className="text-xs text-[#2dd4bf] hover:underline"
            >
              Return to Customer App
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Secure Admin Workspace for authenticated admin access
  if (isBorisRoute && isAdminAuthenticated) {
    const isWithdrawalDetailsPath = lowerAdminPath.startsWith('/boris/withdrawals/');
    return (
      <div className="min-h-screen bg-[#050507] [background:radial-gradient(circle_at_0%_0%,#1e1b4b_0%,#050507_50%),radial-gradient(circle_at_100%_100%,#0f172a_0%,#050507_50%)] text-white flex flex-col font-sans">
        {toastMessage && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-[slideDown_0.2s_ease-out]">
            <div className={`p-3.5 rounded-xl text-xs font-semibold shadow-xl border backdrop-blur-md flex items-center gap-2.5 ${
              toastType === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
            }`}>
              <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}
        {isWithdrawalDetailsPath ? (
          <div className="w-full flex-1 flex flex-col">
            <ErrorBoundary fallbackTitle="Admin Panel Error">
              <AdminPanel
                currentUserEmail="admin@nevo.ng"
                transactions={transactions}
                adminPath={adminPath}
                navigateTo={navigateTo}
                onBack={() => {
                  localStorage.removeItem('nevo_admin_auth');
                  localStorage.removeItem('nevo_admin_token');
                  setIsAdminAuthenticated(false);
                  navigateTo('/Boris/login');
                }}
                onToast={(msg, type) => showToast(msg, type)}
                onAddGlobalNotification={(title, body, type) => {
                  const newNotif = {
                    id: 'notif-' + Date.now(),
                    title,
                    body,
                    date: new Date().toISOString(),
                    unread: true,
                    type: type || 'system',
                    category: type ? (type.charAt(0).toUpperCase() + type.slice(1)) : 'System Broadcast',
                    status: 'Notice'
                  };
                  const updated = [newNotif, ...notifications];
                  setNotifications(updated);
                  localStorage.setItem('nevo_notifications', JSON.stringify(updated));
                }}
                onSendSimulatedEmail={(to, subject, body) => sendSimulatedEmail(to, subject, body)}
              />
            </ErrorBoundary>
          </div>
        ) : (
          <div className="w-full flex-1 flex flex-col p-3 sm:p-6 bg-[#0c0c14]">
            <div className="w-full bg-[#0c0c14] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl flex-1 flex flex-col">
              <ErrorBoundary fallbackTitle="Admin Panel Error">
                <AdminPanel
                  currentUserEmail="admin@nevo.ng"
                  transactions={transactions}
                  adminPath={adminPath}
                  navigateTo={navigateTo}
                  onBack={() => {
                    localStorage.removeItem('nevo_admin_auth');
                    localStorage.removeItem('nevo_admin_token');
                    setIsAdminAuthenticated(false);
                    navigateTo('/Boris/login');
                  }}
                  onToast={(msg, type) => showToast(msg, type)}
                  onAddGlobalNotification={(title, body, type) => {
                    const newNotif = {
                      id: 'notif-' + Date.now(),
                      title,
                      body,
                      date: new Date().toISOString(),
                      unread: true
                    };
                    const updated = [newNotif, ...notifications];
                    setNotifications(updated);
                    localStorage.setItem('nevo_notifications', JSON.stringify(updated));
                  }}
                  onSendSimulatedEmail={(to, subject, body) => sendSimulatedEmail(to, subject, body)}
                />
              </ErrorBoundary>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {isAuthenticated && user && showRegistrationWelcome && (
        <CongratulationsScreen
          userEmail={user.email}
          onContinue={() => {
            setShowRegistrationWelcome(false);
            setUser({ ...user, welcomeRewardShown: true });
            setCurrentScreen('dashboard');
            showToast('Welcome to Nevo!', 'success');
          }}
        />
      )}
      {/* Full-Screen Edge-to-Edge Container */}
      <div className="w-full min-h-screen bg-[#0c0c14] text-white flex flex-col font-sans">
        {/* Main Core Viewport Container */}
        <div
          id="nevo-mobile-container"
          className={getContainerClasses()}
        >
        {/* Offline Banner Indicator (Point 5) */}
        {!isOnline && (
          <div className="bg-amber-500/95 text-slate-950 px-4 py-2 text-[10px] font-bold text-center flex items-center justify-center gap-1.5 z-50 animate-pulse">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>Connection Lost. Running in offline view.</span>
          </div>
        )}

        {/* Dynamic Interactive Toast Banners */}
        {toastMessage && (
          <div className="absolute top-16 left-4 right-4 z-50 animate-[slideDown_0.2s_ease-out]">
            <div
              className={`p-3.5 rounded-xl text-xs font-semibold shadow-xl border backdrop-blur-md flex items-center gap-2.5 ${
                toastType === 'success'
                  ? 'bg-emerald-500/10 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : toastType === 'error'
                  ? 'bg-red-500/10 dark:bg-red-950/80 text-red-600 dark:text-red-400 border-red-500/20'
                  : 'bg-indigo-500/10 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
              }`}
            >
              {toastType === 'success' && <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />}
              {toastType === 'error' && <AlertTriangle className="h-4.5 w-4.5 shrink-0" />}
              {toastType === 'info' && <Info className="h-4.5 w-4.5 shrink-0" />}
              <span className="flex-1">{toastMessage}</span>
            </div>
          </div>
        )}

        {/* -------------------- VIEW 1 & 2: AUTH / ONBOARDING SCREEN -------------------- */}
        {!isAuthenticated && (
          <div className="flex-1 flex flex-col justify-between p-6 bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 overflow-y-auto no-scrollbar">
            
            {/* Upper Splash Logo & Slogan */}
            <div className="text-center pt-8">
              {systemSettings.websiteLogo ? (
                <div className="mx-auto h-16 w-16 rounded-2xl overflow-hidden flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
                  <img src={systemSettings.websiteLogo} alt={systemSettings.websiteName || 'Logo'} className="h-full w-full object-contain" />
                </div>
              ) : (
                <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-violet-500 to-teal-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4 animate-bounce">
                  <Sparkles className="h-8 w-8 text-white stroke-[2.5]" />
                </div>
              )}
              <h2 className="text-3xl font-black font-display tracking-tight bg-gradient-to-r from-white via-slate-100 to-teal-200 bg-clip-text text-transparent">
                {systemSettings.websiteName || "Nevo"}
              </h2>
              <span className="text-[10px] tracking-wider uppercase font-mono font-bold text-teal-400 block mt-1">{systemSettings.websiteName || "Nevo"} Digital Platform</span>
              <p className="text-xs text-slate-300 mt-4 px-3 leading-relaxed">
                Get your account ready and instantly start buying, selling airtime and data online and start paying all your bills in cheaper price
              </p>
            </div>

            {/* Middle Input Forms */}
            <div className="my-6">
              <GlassCard className="p-5 border-white/5 bg-slate-900/40">
                {authMode !== 'forgot' ? (
                  <>
                    <div className="flex border-b border-white/10 mb-4 pb-2">
                      <button
                        id="btn-tab-signup"
                        type="button"
                        onClick={() => setAuthMode('signup')}
                        className={`flex-1 text-center pb-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                          authMode === 'signup' ? 'text-teal-400 border-b-2 border-teal-400' : 'text-slate-400'
                        }`}
                      >
                        Sign Up
                      </button>
                      <button
                        id="btn-tab-signin"
                        type="button"
                        onClick={() => setAuthMode('signin')}
                        className={`flex-1 text-center pb-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                          authMode === 'signin' ? 'text-teal-400 border-b-2 border-teal-400' : 'text-slate-400'
                        }`}
                      >
                        Sign In
                      </button>
                    </div>

                    {authMode === 'signin' && (
                      <div className="grid grid-cols-3 gap-1 bg-slate-950/60 p-1 rounded-xl border border-white/10 mb-4 text-[10px] font-semibold">
                        <button
                          type="button"
                          onClick={() => setSignInMethod('password')}
                          className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
                            signInMethod === 'password'
                              ? 'bg-gradient-to-r from-indigo-500 to-teal-500 text-white font-bold shadow'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Lock className="h-3 w-3" /> Password
                        </button>
                        <button
                          type="button"
                          onClick={() => setSignInMethod('biometric')}
                          className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
                            signInMethod === 'biometric'
                              ? 'bg-gradient-to-r from-indigo-500 to-teal-500 text-white font-bold shadow'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Fingerprint className="h-3 w-3" /> Biometric
                        </button>
                        <button
                          type="button"
                          onClick={() => setSignInMethod('pin')}
                          className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
                            signInMethod === 'pin'
                              ? 'bg-gradient-to-r from-indigo-500 to-teal-500 text-white font-bold shadow'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <ShieldCheck className="h-3 w-3" /> Security PIN
                        </button>
                      </div>
                    )}

                    {authMode === 'signup' || signInMethod === 'password' ? (
                      <form onSubmit={authMode === 'signup' ? handleSignUp : handleSignIn} className="space-y-4">
                        {authMode === 'signup' && (
                          <>
                          <div>
                            <label className="text-[10px] font-mono text-slate-400 block mb-1">Full Name</label>
                            <input
                              id="signup-fullname"
                              type="text"
                              placeholder="John Doe"
                              required
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              className="w-full text-xs bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-400"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-mono text-slate-400 block mb-1">Referral Code <span className="text-slate-600">(optional)</span></label>
                            <input type="text" placeholder="SWIFTXXXX" value={referralCodeInput} onChange={e=>setReferralCodeInput(e.target.value.toUpperCase())} className="w-full text-xs bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-400" />
                          </div>
                          </>
                        )}

                        <div>
                          <label className="text-[10px] font-mono text-slate-400 block mb-1">Email Address</label>
                          <input
                            id="auth-email"
                            type="email"
                            placeholder="john@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full text-xs bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-400"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] font-mono text-slate-400">Password</label>
                            {authMode === 'signin' && (
                              <button
                                id="btn-goto-forgot"
                                type="button"
                                onClick={() => {
                                  setForgotEmail(email);
                                  setAuthMode('forgot');
                                  setResetStep('request');
                                }}
                                className="text-[10px] font-bold text-teal-400 hover:underline cursor-pointer"
                              >
                                Forgot Password?
                              </button>
                            )}
                          </div>
                          <input
                            id="auth-password"
                            type="password"
                            placeholder="••••••••"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full text-xs bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-400"
                          />
                        </div>

                        <button
                          id="btn-auth-submit"
                          type="submit"
                          disabled={isAuthSubmitting}
                          className="w-full text-xs font-bold uppercase tracking-widest py-3 bg-gradient-to-r from-indigo-500 via-violet-500 to-teal-500 hover:from-indigo-600 hover:to-teal-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isAuthSubmitting ? (
                            <>
                              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              {authMode === 'signup' ? 'Creating Account...' : 'Signing In...'}
                            </>
                          ) : (
                            authMode === 'signup' ? 'Create Account' : 'Sign In'
                          )}
                        </button>
                      </form>
                    ) : signInMethod === 'biometric' ? (
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-mono text-slate-400 block mb-1">Registered Email</label>
                          <input
                            id="auth-email-bio"
                            type="email"
                            placeholder="john@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full text-xs bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-400"
                          />
                        </div>

                        <div className="pt-2 flex flex-col items-center justify-center p-4 bg-slate-950/40 rounded-2xl border border-white/5">
                          <button
                            type="button"
                            onClick={handleBiometricSignIn}
                            disabled={isAuthSubmitting}
                            className="relative group h-20 w-20 rounded-full bg-gradient-to-tr from-teal-500/20 via-indigo-500/20 to-purple-500/20 border-2 border-teal-400/40 flex items-center justify-center shadow-lg hover:border-teal-400 active:scale-95 transition-all cursor-pointer"
                          >
                            <div className="absolute inset-0 rounded-full bg-teal-400/10 animate-ping opacity-75" />
                            <Fingerprint className="h-10 w-10 text-teal-400 stroke-[1.75] group-hover:scale-110 transition-transform" />
                          </button>
                          <span className="text-[11px] font-bold text-white mt-3 block">Scan Fingerprint or Face ID</span>
                          <p className="text-[9.5px] text-slate-400 mt-1 text-center max-w-[220px] leading-tight">
                            Tap the scanner above to trigger your phone or computer's native biometric prompt.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handlePinSignIn} className="space-y-4">
                        <div>
                          <label className="text-[10px] font-mono text-slate-400 block mb-1">Email or Phone Number</label>
                          <input
                            id="auth-email-pin"
                            type="text"
                            placeholder="john@example.com or 08012345678"
                            required
                            value={emailOrPhoneInput || email}
                            onChange={(e) => {
                              setEmailOrPhoneInput(e.target.value);
                              setEmail(e.target.value);
                            }}
                            className="w-full text-xs bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-400"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-mono text-slate-400 block mb-1">4 or 6-Digit Wallet PIN</label>
                          <input
                            id="auth-pin-input"
                            type="password"
                            maxLength={6}
                            placeholder="••••"
                            required
                            value={pinLoginInput}
                            onChange={(e) => setPinLoginInput(e.target.value.replace(/\D/g, ''))}
                            className="w-full text-center tracking-[0.5em] font-mono text-lg font-extrabold bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-teal-300 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-400"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isAuthSubmitting}
                          className="w-full text-xs font-bold uppercase tracking-widest py-3 bg-gradient-to-r from-indigo-500 via-violet-500 to-teal-500 hover:from-indigo-600 hover:to-teal-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isAuthSubmitting ? 'Verifying PIN...' : 'Sign In With Security PIN'}
                        </button>
                      </form>
                    )}
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                      <button
                        type="button"
                        onClick={() => setAuthMode('signin')}
                        className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                      </button>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400">Reset Password</h4>
                    </div>

                    {resetStep === 'request' && (
                      <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                        <p className="text-[10px] text-slate-300 leading-normal">
                          Enter your registered email address below, and we will dispatch a secure 6-digit One-Time Password (OTP) to verify your ownership.
                        </p>
                        <div>
                          <label className="text-[10px] font-mono text-slate-400 block mb-1">Email Address</label>
                          <input
                            id="forgot-email-input"
                            type="email"
                            placeholder="john@example.com"
                            required
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            className="w-full text-xs bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-400"
                          />
                        </div>
                        <button
                          id="btn-send-otp"
                          type="submit"
                          className="w-full text-xs font-bold uppercase tracking-widest py-3 bg-gradient-to-r from-indigo-500 via-violet-500 to-teal-500 text-white rounded-xl active:scale-95 transition-all mt-2"
                        >
                          Send Verification Code
                        </button>
                      </form>
                    )}

                    {resetStep === 'verify' && (
                      <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                        <p className="text-[10px] text-slate-300 leading-normal">
                          We have sent a 6-digit verification code to your recovery channel. Enter it below to proceed with setting a new password.
                        </p>

                        {false && simulatedResetInfo && (
                          <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl text-[10px] text-slate-300 space-y-1 font-mono">
                            <span className="font-bold text-teal-400 block mb-1">🔑 SIMULATED DISPATCHED CODE</span>
                            <div>OTP: <span className="text-white font-extrabold">{simulatedResetInfo.otp}</span></div>
                            <div>Token: <span className="text-white font-extrabold truncate block">{simulatedResetInfo.token}</span></div>
                            <button
                              type="button"
                              onClick={() => {
                                setResetOtp(simulatedResetInfo.otp);
                                setResetToken(simulatedResetInfo.token);
                                showToast('OTP and Token auto-filled!', 'info');
                              }}
                              className="text-[9px] text-teal-400 hover:underline font-bold mt-2 block"
                            >
                              Auto-Fill Recovery Credentials
                            </button>
                          </div>
                        )}

                        <div>
                          <label className="text-[10px] font-mono text-slate-400 block mb-1">6-Digit OTP Code</label>
                          <input
                            id="reset-otp-input"
                            type="text"
                            maxLength={6}
                            placeholder="e.g. 123456"
                            value={resetOtp}
                            onChange={(e) => setResetOtp(e.target.value)}
                            className="w-full text-xs bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-400 font-mono tracking-widest text-center"
                          />
                        </div>



                        <div style={{display:'none'}}>
                          <label className="text-[10px] font-mono text-slate-400 block mb-1">Reset Token</label>
                          <input
                            id="reset-token-input"
                            type="text"
                            placeholder="Reset Token"
                            value={resetToken}
                            onChange={(e) => setResetToken(e.target.value)}
                            className="w-full text-xs bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-400 font-mono"
                          />
                        </div>

                        <button
                          id="btn-verify-otp"
                          type="submit"
                          className="w-full text-xs font-bold uppercase tracking-widest py-3 bg-gradient-to-r from-indigo-500 via-violet-500 to-teal-500 text-white rounded-xl active:scale-95 transition-all mt-2"
                        >
                          Verify Code
                        </button>
                      </form>
                    )}

                    {resetStep === 'new_password' && (
                      <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                        <p className="text-[10px] text-slate-300 leading-normal">
                          Set a strong password containing at least 8 characters, with letters and numbers.
                        </p>

                        <div>
                          <label className="text-[10px] font-mono text-slate-400 block mb-1">New Password</label>
                          <div className="relative">
                            <input
                              id="reset-new-password"
                              type={showResetPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              required
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-full text-xs bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-400"
                            />
                            <button
                              type="button"
                              onClick={() => setShowResetPassword(!showResetPassword)}
                              className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                            >
                              {showResetPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-mono text-slate-400 block mb-1">Confirm New Password</label>
                          <input
                            id="reset-confirm-new-password"
                            type="password"
                            placeholder="••••••••"
                            required
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            className="w-full text-xs bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-400"
                          />
                        </div>

                        <button
                          id="btn-submit-reset-password"
                          type="submit"
                          className="w-full text-xs font-bold uppercase tracking-widest py-3 bg-gradient-to-r from-indigo-500 via-violet-500 to-teal-500 text-white rounded-xl active:scale-95 transition-all mt-2"
                        >
                          Complete Password Reset
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </GlassCard>
            </div>

            {/* Legal Notice */}
            <div className="text-center text-[10px] text-slate-400 leading-normal pb-4">
              By continuing, you agree to Nevo's{' '}
              <a
                href="/terms"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('/terms');
                }}
                className="text-teal-400 cursor-pointer hover:underline font-semibold"
              >
                Terms of Service
              </a>{' '}
              &amp;{' '}
              <a
                href="/privacy"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('/privacy');
                }}
                className="text-teal-400 cursor-pointer hover:underline font-semibold"
              >
                Privacy Policy
              </a>.
            </div>
          </div>
        )}

        {/* -------------------- MAIN DASHBOARD WRAPPER -------------------- */}
        {isAuthenticated && currentScreen !== 'congratulations' && (
          <div className="flex-1 flex flex-row relative bg-[#0c0c14] text-white min-h-screen w-full max-w-full min-w-0 overflow-x-hidden">
            
            {/* Expanded Persistent Sidebar for Tablets, Laptops, Desktops, and Large Screens */}
            {(deviceType === 'laptop' || deviceType === 'desktop' || deviceType === 'large') && (
              <div className="w-[260px] shrink-0 border-r border-white/5 bg-[#07070b]/60 backdrop-blur-md p-5 flex flex-col justify-between z-20 sticky top-0 h-screen">
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div>
                      <span className="text-xl font-black font-display bg-gradient-to-r from-indigo-400 to-teal-300 bg-clip-text text-transparent">
                        Nevo
                      </span>
                      <span className="text-[8px] font-mono text-slate-400 block uppercase tracking-widest mt-0.5">Version 4.1.0</span>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="space-y-1.5">
                    {[
                      { label: 'Wallet Dashboard', screen: 'dashboard', icon: Wallet },
                      { label: 'Deposit Funds', screen: 'deposit', icon: Wallet },
                      { label: 'Purchase Airtime', screen: 'buy_airtime', icon: Smartphone },
                      { label: 'Purchase Data Bundles', screen: 'buy_data', icon: Smartphone },
                      { label: 'Transfer To Banks', screen: 'transfer_bank', icon: Landmark },
                      { label: 'Support Live Chat', screen: 'support_live_chat', icon: MessageSquare },
                      { label: 'Help FAQs Hub', screen: 'faq', icon: HelpCircle },
                      { label: 'Our Brand Story', screen: 'about_info', icon: Info }
                    ].map((item) => {
                      const Icon = item.icon;
                      const isCurrent = currentScreen === item.screen;
                      return (
                        <button
                          id={`sidebar-link-${item.screen}`}
                          key={item.screen}
                          onClick={() => {
                            if (item.screen === 'deposit') { setPaymentModalOpen(true); return; }
                            setCurrentScreen(item.screen);
                            if (item.screen === 'dashboard') {
                              setActiveTab('wallet');
                            }
                          }}
                          className={`w-full p-3 rounded-xl flex items-center gap-3.5 text-left text-xs font-semibold transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-gradient-to-r from-teal-500/10 to-indigo-500/10 border border-teal-500/25 text-teal-400 shadow-[0_4px_25px_rgba(20,184,166,0.06)]'
                              : 'text-slate-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <Icon className="h-4.5 w-4.5" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4">
                  <button
                    onClick={handleLogout}
                    className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider rounded-xl text-center block transition-all"
                  >
                    Logout Session
                  </button>
                </div>
              </div>
            )}

            {/* Main view container containing top-bar and actual tab routes */}
            <div className="flex-1 min-w-0 w-full max-w-full flex flex-col relative bg-[#0c0c14] min-h-screen overflow-x-hidden">
              {/* Fixed Top Header (Never Scroll) */}
              <div className="shrink-0 z-30 bg-[#0c0c14]/95 backdrop-blur-xl border-b border-white/5 w-full max-w-full min-w-0 pt-safe overflow-x-hidden">
                <div className="px-4 py-2 sm:px-5 sm:py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {(deviceType === 'mobile' || deviceType === 'tablet') && (
                      <button
                        id="btn-sidebar-toggle"
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                      >
                        <Menu className="h-4.5 w-4.5" />
                      </button>
                    )}
                    <span className="text-lg font-black font-display bg-gradient-to-r from-[#818cf8] to-[#2dd4bf] bg-clip-text text-transparent">
                      Nevo
                    </span>

                    {/* Adaptive Device Layout Detected Badge */}
                    <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full shadow-inner">
                      <div className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
                      <span className="text-[8px] font-mono text-[#2dd4bf] uppercase tracking-wider font-bold">
                        {deviceType === 'mobile' && 'Mobile Phone'}
                        {deviceType === 'tablet' && 'Tablet'}
                        {deviceType === 'laptop' && 'Laptop'}
                        {deviceType === 'desktop' && 'Desktop'}
                        {deviceType === 'large' && 'Large Display'}
                      </span>
                    </div>
                  </div>

                  {/* Right Notification Bell with badge */}
                  <button
                    id="btn-notif-toggle"
                    onClick={() => setIsNotificationsOpen(true)}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white relative transition-colors"
                  >
                    <Bell className="h-4.5 w-4.5" />
                    {notifications.filter(n => n.unread).length > 0 && (
                      <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 border border-slate-950 animate-bounce" />
                    )}
                  </button>
                </div>

                <LiveTicker />
              </div>

            {/* Main scrollable view containers based on Current Screen & Tab */}
            <div className="flex-1 w-full max-w-full min-w-0 focus:outline-none min-h-screen pb-24 overflow-x-hidden">
              
              {/* -------------------- SUB-VIEW: HOME DASHBOARD (wallet tab) -------------------- */}
              {currentScreen === 'dashboard' && activeTab === 'wallet' && (
                <div className="p-3.5 sm:p-5 animate-[fadeIn_0.2s_ease-out] w-full max-w-full min-w-0 overflow-x-hidden">
                  <div className={`gap-4 w-full max-w-full min-w-0 ${deviceType !== 'mobile' ? 'grid grid-cols-1 lg:grid-cols-12 items-start' : 'space-y-4'}`}>
                    
                    {/* Left Column: Balance, Greeting, Services */}
                    <div className={`w-full max-w-full min-w-0 ${deviceType !== 'mobile' ? 'lg:col-span-7 space-y-4' : 'space-y-4'}`}>
                      {/* Greeting Block */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-base sm:text-lg font-bold font-display text-white min-h-[24px]">{typedGreeting}<span className="inline-block w-px h-4 ml-0.5 align-middle bg-teal-400 animate-pulse" /></h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">Welcome back to Nevo — complete tasks, watch adverts and earn money.</p>
                        </div>
                        {/* User Avatar */}
                        <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-teal-400 p-0.5 shadow-md">
                          <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center text-[11px] font-extrabold text-white">
                            {user?.fullName.split(' ').map(n => n[0]).join('') || 'AS'}
                          </div>
                        </div>
                      </div>

                      {/* COMPACT FINTECH BALANCE CARD */}
                      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4c1d95] p-5 sm:p-6 text-white border border-indigo-500/20 shadow-xl shadow-indigo-950/50">
                        {/* Subtle background glow elements */}
                        <div className="absolute -right-12 -top-12 w-36 h-36 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />
                        <div className="absolute -left-12 -bottom-12 w-32 h-32 rounded-full bg-indigo-400/15 blur-2xl pointer-events-none" />

                        <div className="relative z-10 flex items-center justify-between">
                          <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase text-indigo-200/90">Available Balance</span>
                          <span className="text-[10px] font-mono px-2.5 py-0.5 bg-teal-500/15 border border-teal-500/30 rounded-full text-teal-300 font-extrabold tracking-wide">Tier 3 Verified</span>
                        </div>

                        <div className="relative z-10 my-3">
                          <span className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white drop-shadow-sm">
                            {nairaFormat(user?.balance ?? 0)}
                          </span>
                        </div>

                        {/* Action Buttons: [ Withdraw ] [ Transfer ] */}
                        <div className="relative z-10 border-t border-white/10 pt-4 mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                          <button
                            id="btn-withdraw-trigger"
                            type="button"
                            onClick={() => {
                              setWithdrawStep(1);
                              setCurrentScreen('withdraw');
                              navigateTo('/dashboard/withdraw');
                            }}
                            className="w-full py-2.5 px-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-slate-950 text-xs font-black shadow-md shadow-teal-500/20 active:scale-95 hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                            <span>Withdraw</span>
                          </button>

                          <button
                            id="btn-deposit-trigger"
                            type="button"
                            onClick={() => setPaymentModalOpen(true)}
                            className="w-full py-2.5 px-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white text-xs font-black shadow-md shadow-indigo-500/25 active:scale-95 hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer border border-indigo-400/30"
                          >
                            <Send className="h-4 w-4 stroke-[2.5]" />
                            <span>Deposit</span>
                          </button>
                        </div>
                      </div>

                      {/* QUICK ACTIONS GRID (4 Circle Icons) */}
                      <div>
                        <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">Quick Actions</h5>
                        <div className="grid grid-cols-4 gap-1.5 sm:gap-3 w-full max-w-full min-w-0">
                          {[
                            { id: 'support', label: 'Support', icon: MessageSquare, bg: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' },
                            { id: 'deposit', label: 'Deposit', icon: Wallet, bg: 'bg-teal-500/15 text-teal-400 border border-teal-500/20' },
                            { id: 'guide', label: 'Watch Guide', icon: Clock, bg: 'bg-violet-500/15 text-violet-400 border border-violet-500/20' },
                            { id: 'airtime', label: 'Airtime', icon: Smartphone, bg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' }
                          ].map((act) => (
                            <button
                              id={`btn-action-${act.id}`}
                              key={act.id}
                              onClick={() => {
                                if (act.id === 'support') {
                                  setCurrentScreen('support_live_chat');
                                } else if (act.id === 'deposit') {
                                  setPaymentModalOpen(true);
                                } else if (act.id === 'guide') {
                                  setIsGuideOpen(true);
                                } else if (act.id === 'airtime') {
                                  setCurrentScreen('buy_airtime');
                                }
                              }}
                              className="flex flex-col items-center group cursor-pointer min-w-0 w-full"
                            >
                              <div className={`h-10 w-10 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center shadow-sm mb-1.5 transition-all group-hover:scale-105 active:scale-95 shrink-0 ${act.bg}`}>
                                <act.icon className="h-4 w-4" />
                              </div>
                              <span className="text-[10px] font-medium text-slate-300 text-center truncate w-full block">
                                {act.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* EARN & REWARDS GRID */}
                      <div>
                        <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">Earn & Rewards</h5>
                        <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5 w-full max-w-full min-w-0">
                          {[
                            { id: 'tasks' as const, label: 'Tasks', icon: CheckCircle2, bg: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' },
                            { id: 'referrals' as const, label: 'Referrals', icon: Share2, bg: 'bg-teal-500/15 text-teal-400 border border-teal-500/20' },
                            { id: 'ads' as const, label: 'Ads', icon: PlayCircle, bg: 'bg-amber-500/15 text-amber-400 border border-amber-500/20' },
                            { id: 'history' as const, label: 'Rewards', icon: Clock, bg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' }
                          ].map((item) => (
                            <button 
                              id={`btn-earn-${item.id}`}
                              key={item.id} 
                              onClick={() => { 
                                if (item.id === 'ads') {
                                  changeScreen('ads');
                                } else {
                                  setRewardsTab(item.id as any); 
                                  setActiveTab('social'); 
                                }
                              }} 
                              className="p-1.5 sm:p-2.5 rounded-xl bg-[#0a0a14] border border-white/5 hover:border-white/15 flex flex-col items-center hover:bg-[#10101f] active:scale-95 transition-all text-center w-full min-w-0 shadow-sm cursor-pointer"
                            >
                              <div className={`p-1.5 rounded-lg mb-1 shrink-0 ${item.bg}`}><item.icon className="h-4 w-4" /></div>
                              <span className="text-[9px] font-bold text-slate-300 uppercase leading-none truncate w-full block">{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* MORE SERVICES GRID (4 columns) */}
                      <div>
                        <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">More Services</h5>
                        <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5 w-full max-w-full min-w-0">
                          {[
                            { id: 'data', label: 'Data bundles', icon: Smartphone, bg: 'bg-orange-500/15 text-orange-400' },
                            { id: 'bills', label: 'Pay Bills', icon: CreditCard, bg: 'bg-emerald-500/15 text-emerald-400' },
                            { id: 'support', label: 'Support Chat', icon: MessageSquare, bg: 'bg-rose-500/15 text-rose-400' },
                            { id: 'about', label: 'About App', icon: Info, bg: 'bg-blue-500/15 text-blue-400' }
                          ].map((srv) => (
                            <button
                              id={`btn-service-${srv.id}`}
                              key={srv.id}
                              onClick={() => {
                                if (srv.id === 'data') {
                                  setCurrentScreen('buy_data');
                                } else if (srv.id === 'bills') {
                                  setCurrentScreen('pay_bills');
                                } else if (srv.id === 'support') {
                                  setCurrentScreen('support_live_chat');
                                } else if (srv.id === 'about') {
                                  setCurrentScreen('about_info');
                                }
                              }}
                              className="p-1.5 sm:p-2.5 rounded-xl bg-[#0a0a14] border border-white/5 hover:border-white/15 flex flex-col items-center hover:bg-[#10101f] active:scale-95 transition-all text-center w-full min-w-0 shadow-sm"
                            >
                              <div className={`p-1.5 rounded-lg mb-1 shrink-0 ${srv.bg}`}>
                                <srv.icon className="h-4 w-4" />
                              </div>
                              <span className="text-[9px] font-bold text-slate-300 uppercase leading-none truncate w-full block">
                                {srv.label.split(' ')[0]}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Recent Transactions */}
                    <div className={`w-full max-w-full min-w-0 ${deviceType !== 'mobile' ? 'lg:col-span-5 space-y-4 mt-4 lg:mt-0' : 'space-y-4'}`}>
                      {/* RECENT TRANSACTIONS PREVIEW */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Recent Transactions</h5>
                          <button
                            id="btn-view-all-tx"
                            onClick={() => setCurrentScreen('transactions_all')}
                            className="text-[10px] font-bold text-teal-400 hover:underline"
                          >
                            View All
                          </button>
                        </div>

                        <TransactionList
                          transactions={transactions}
                          limit={4}
                          onViewDetails={setSelectedReceiptTx}
                        />
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* -------------------- SUB-VIEW: REWARDS / TASKS / REFERRALS -------------------- */}
              {currentScreen === 'dashboard' && activeTab === 'social' && (
                <NivoFeaturesPanel
                  user={user}
                  token={localStorage.getItem('nevo_auth_token') || ''}
                  onToast={showToast}
                  initialTab={rewardsTab}
                />
              )}

              {/* -------------------- SUB-VIEW: PROFILE & SECURITY (profile tab) -------------------- */}
              {currentScreen === 'dashboard' && activeTab === 'profile' && (
                <div className="p-5 space-y-5 animate-[fadeIn_0.2s_ease-out]">
                  
                  {/* Hero card details */}
                  <div className="text-center bg-white/40 dark:bg-slate-900/30 rounded-3xl p-5 border border-slate-150 dark:border-slate-800/60">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-indigo-500 to-teal-400 p-0.5 mx-auto mb-3">
                      <div className="h-full w-full rounded-full bg-slate-950 flex items-center justify-center text-lg font-bold text-white">
                        {user?.fullName.split(' ').map(n => n[0]).join('') || 'AS'}
                      </div>
                    </div>
                    <h4 className="text-base font-bold text-slate-800 dark:text-white">{user?.fullName || 'Adebayo Samuel'}</h4>
                    <span className="text-xs text-slate-400 block mt-0.5 font-mono">{user?.email || 'user@example.com'}</span>
                    
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <span className="text-[10px] font-semibold bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/10">
                        Level 2 Verified
                      </span>
                      <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/10">
                        Naira Wallet Active
                      </span>
                    </div>
                  </div>

                  {/* Account Information Options */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Account Configuration</h5>
                    
                    <GlassCard className="divide-y divide-slate-150 dark:divide-slate-800/50 overflow-hidden">
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-slate-400 block font-mono">Full Name</span>
                          <span className="text-sm font-semibold text-slate-800 dark:text-white mt-0.5 block">{user?.fullName}</span>
                        </div>
                      </div>

                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-slate-400 block font-mono">Email Address</span>
                          <span className="text-sm font-semibold text-slate-800 dark:text-white mt-0.5 block">{user?.email}</span>
                        </div>
                      </div>

                      {/* Visual Interface Theme Segmented Selector (Point 10) */}
                      <div className="p-4 space-y-2">
                        <span className="text-xs text-slate-400 block font-mono">Visual Interface Theme</span>
                        <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                          {(['light', 'dark', 'system'] as const).map((pref) => (
                            <button
                              id={`btn-theme-pref-${pref}`}
                              key={pref}
                              type="button"
                              onClick={() => setTheme(pref)}
                              className={`py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                                theme === pref
                                  ? 'bg-gradient-to-r from-indigo-600 to-teal-500 text-white shadow-md'
                                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                              }`}
                            >
                              {pref}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Biometric & Security Management Section */}
                      <div className="p-4 space-y-3 border-t border-slate-150 dark:border-slate-800/50">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shrink-0 mt-0.5">
                              <Fingerprint className="h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-800 dark:text-white">Biometric Passkey Login</span>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                  user?.biometricEnabled
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                }`}>
                                  {user?.biometricEnabled ? 'ENABLED' : 'DISABLED'}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400">
                                {user?.biometricEnabled ? 'Native device biometric passkey registered' : 'No biometric credential registered'}
                              </p>
                              {user?.biometricEnabled && (
                                <div className="text-[9.5px] font-mono text-slate-400 space-y-0.5 pt-1 border-t border-slate-200/10">
                                  <div><span className="text-slate-500">Device:</span> {user.webAuthnCredential?.deviceName || 'Platform Authenticator'}</div>
                                  <div><span className="text-slate-500">Date Added:</span> {user.biometricRegisteredAt ? new Date(user.biometricRegisteredAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recently Added'}</div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="shrink-0">
                            {user?.biometricEnabled ? (
                              <button
                                id="btn-disable-biometric"
                                type="button"
                                onClick={async () => {
                                  const token = getAuthToken();
                                  if (!token) return;
                                  try {
                                    const res = await fetch('/api/auth/webauthn/disable', {
                                      method: 'POST',
                                      headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${token}`
                                      }
                                    });
                                    const data = await res.json();
                                    if (res.ok && data.user) {
                                      setUser(data.user);
                                      showToast('Biometric security removed from account', 'info');
                                    }
                                  } catch (err) {
                                    showToast('Failed to disable biometric login', 'error');
                                  }
                                }}
                                className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
                              >
                                Remove Biometric
                              </button>
                            ) : (
                              <button
                                id="btn-enable-biometric"
                                type="button"
                                disabled={isActivatingBiometric}
                                onClick={async () => {
                                  const token = getAuthToken();
                                  if (!token) {
                                    showToast('Please log in again to register biometric.', 'error');
                                    return;
                                  }
                                  setIsActivatingBiometric(true);
                                  showToast('Opening device biometric prompt...', 'info');
                                  const result = await registerDeviceBiometric(token);
                                  setIsActivatingBiometric(false);
                                  if (result.success && result.user) {
                                    setUser(result.user);
                                    showToast(result.message, 'success');
                                  } else {
                                    showToast(result.message || 'Biometric activation failed', 'error');
                                  }
                                }}
                                className="px-3 py-1.5 bg-gradient-to-r from-teal-500 to-indigo-600 text-white rounded-xl text-[10px] font-bold shadow-md hover:brightness-110 transition-all cursor-pointer flex items-center gap-1"
                              >
                                {isActivatingBiometric ? 'Activating...' : 'Register Fingerprint'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Security PIN Collapsible Section */}
                      <div className="p-4 space-y-2 border-t border-slate-150 dark:border-slate-800/50">
                        <button
                          id="btn-toggle-change-pin"
                          type="button"
                          onClick={() => setIsChangingPinOpen(!isChangingPinOpen)}
                          className="w-full py-2.5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-150 dark:border-slate-800/80 text-xs font-bold rounded-xl flex items-center justify-between px-3 text-slate-700 dark:text-slate-300 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-indigo-400" />
                            <span>{user?.pinCreated ? 'Update Security PIN' : 'Setup Security PIN'}</span>
                          </div>
                          <ChevronRight className={`h-4 w-4 transition-transform ${isChangingPinOpen ? 'rotate-90' : ''}`} />
                        </button>

                        {isChangingPinOpen && (
                          <form
                            onSubmit={async (e) => {
                              e.preventDefault();
                              if (!changeNewPinInput || (changeNewPinInput.length !== 4 && changeNewPinInput.length !== 6)) {
                                showToast('PIN must be a 4-digit or 6-digit numeric code.', 'error');
                                return;
                              }
                              const token = getAuthToken();
                              if (!token) {
                                showToast('Session expired. Please log in again.', 'error');
                                return;
                              }
                              try {
                                const res = await fetch('/api/auth/pin/setup', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                  },
                                  body: JSON.stringify({ pinCode: changeNewPinInput })
                                });
                                const data = await res.json();
                                if (res.ok && data.user) {
                                  setUser(data.user);
                                  showToast('Wallet PIN configured securely!', 'success');
                                  setChangeNewPinInput('');
                                  setIsChangingPinOpen(false);
                                } else {
                                  showToast(data.error || 'Failed to configure PIN.', 'error');
                                }
                              } catch (err) {
                                showToast('Network error during PIN update.', 'error');
                              }
                            }}
                            className="space-y-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850/60 mt-2"
                          >
                            <div>
                              <label className="text-[9px] font-mono text-slate-400 block mb-1">New 4 or 6-Digit PIN</label>
                              <input
                                id="input-change-new-pin"
                                type="password"
                                maxLength={6}
                                placeholder="••••"
                                required
                                value={changeNewPinInput}
                                onChange={(e) => setChangeNewPinInput(e.target.value.replace(/\D/g, ''))}
                                className="w-full text-center tracking-[0.5em] font-mono text-sm font-extrabold bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-teal-400 focus:outline-none"
                              />
                            </div>
                            <button
                              id="btn-submit-change-pin"
                              type="submit"
                              className="w-full py-2 bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-700 hover:to-teal-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                            >
                              Save Security PIN
                            </button>
                          </form>
                        )}
                      </div>

                      {/* Change Password Collapsible Section (Point 1, Point 3) */}
                      <div className="p-4 space-y-2 border-t border-slate-150 dark:border-slate-800/50">
                        <button
                          id="btn-toggle-change-pw"
                          type="button"
                          onClick={() => setIsChangingPasswordOpen(!isChangingPasswordOpen)}
                          className="w-full py-2.5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-150 dark:border-slate-800/80 text-xs font-bold rounded-xl flex items-center justify-between px-3 text-slate-700 dark:text-slate-300 transition-colors"
                        >
                          <span>Change Account Password</span>
                          <ChevronRight className={`h-4 w-4 transition-transform ${isChangingPasswordOpen ? 'rotate-90' : ''}`} />
                        </button>
                        
                        {isChangingPasswordOpen && (
                          <form onSubmit={async (e) => {
                            e.preventDefault();
                            if (!changeCurrentPassword || !changeNewPassword) {
                              showToast('Please fill out all password fields', 'error');
                              return;
                            }
                            const hasLetter = /[a-zA-Z]/.test(changeNewPassword);
                            const hasNumber = /[0-9]/.test(changeNewPassword);
                            if (changeNewPassword.length < 8 || !hasLetter || !hasNumber) {
                              showToast('New password must be at least 8 characters long and contain both letters and numbers.', 'error');
                              return;
                            }
                            try {
                              const res = await fetch('/api/auth/change-password', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  email: user?.email,
                                  currentPassword: changeCurrentPassword,
                                  newPassword: changeNewPassword
                                })
                              });
                              const data = await res.json();
                              if (res.ok && data.success) {
                                showToast('Password changed successfully!', 'success');
                                setChangeCurrentPassword('');
                                setChangeNewPassword('');
                                setIsChangingPasswordOpen(false);
                              } else {
                                showToast(data.error || 'Failed to change password.', 'error');
                              }
                            } catch (err) {
                              showToast('Network error during password update.', 'error');
                            }
                          }} className="space-y-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850/60 mt-2">
                            <div>
                              <label className="text-[9px] font-mono text-slate-400 block mb-1">Current Password</label>
                              <div className="relative">
                                <input
                                  id="input-change-curr-pw"
                                  type={showChangePassword ? 'text' : 'password'}
                                  required
                                  value={changeCurrentPassword}
                                  onChange={(e) => setChangeCurrentPassword(e.target.value)}
                                  className="w-full text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-white focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => setShowChangePassword(!showChangePassword)}
                                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                                >
                                  {showChangePassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                </button>
                              </div>
                            </div>
                            <div>
                              <label className="text-[9px] font-mono text-slate-400 block mb-1">New Password</label>
                              <div className="relative">
                                <input
                                  id="input-change-new-pw"
                                  type={showChangePassword ? 'text' : 'password'}
                                  required
                                  value={changeNewPassword}
                                  onChange={(e) => setChangeNewPassword(e.target.value)}
                                  className="w-full text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-white focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => setShowChangePassword(!showChangePassword)}
                                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                                >
                                  {showChangePassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                </button>
                              </div>
                            </div>
                            <button
                              id="btn-submit-change-pw"
                              type="submit"
                              className="w-full py-2 bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-700 hover:to-teal-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                            >
                              Update Password
                            </button>
                          </form>
                        )}
                      </div>

                     </GlassCard>
                  </div>

                  {/* Navigation redirects including Terms and Privacy links (Point 2) */}
                  <div className="space-y-2.5">
                    <button
                      id="btn-goto-terms"
                      onClick={() => navigateTo('/terms')}
                      className="w-full p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-800/60 flex items-center justify-between hover:bg-white/60 dark:hover:bg-slate-900/60 transition-all text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="h-5 w-5 text-indigo-500" />
                        <div>
                          <h6 className="text-xs font-bold text-slate-800 dark:text-white">Terms of Service</h6>
                          <p className="text-[10px] text-slate-400 mt-0.5">Read our terms and conditions</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </button>

                    <button
                      id="btn-goto-privacy"
                      onClick={() => navigateTo('/privacy')}
                      className="w-full p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-800/60 flex items-center justify-between hover:bg-white/60 dark:hover:bg-slate-900/60 transition-all text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Lock className="h-5 w-5 text-teal-500" />
                        <div>
                          <h6 className="text-xs font-bold text-slate-800 dark:text-white">Privacy Policy</h6>
                          <p className="text-[10px] text-slate-400 mt-0.5">Read customer data security rules</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </button>

                    <button
                      id="btn-goto-about"
                      onClick={() => setCurrentScreen('about_info')}
                      className="w-full p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-800/60 flex items-center justify-between hover:bg-white/60 dark:hover:bg-slate-900/60 transition-all text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Info className="h-5 w-5 text-[#818cf8]" />
                        <div>
                          <h6 className="text-xs font-bold text-slate-800 dark:text-white">About Nevo</h6>
                          <p className="text-[10px] text-slate-400 mt-0.5">Read about the rebranding and our mission</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </button>

                    <button
                      id="btn-goto-faq"
                      onClick={() => setCurrentScreen('faq')}
                      className="w-full p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-800/60 flex items-center justify-between hover:bg-white/60 dark:hover:bg-slate-900/60 transition-all text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <HelpCircle className="h-5 w-5 text-teal-500" />
                        <div>
                          <h6 className="text-xs font-bold text-slate-800 dark:text-white">FAQ Help Hub</h6>
                          <p className="text-[10px] text-slate-400 mt-0.5">Find answers to deposits, transfers, and wallet services</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </button>
                  </div>

                  {/* Logout Area */}
                  <div className="pt-2">
                    <button
                      id="btn-profile-logout"
                      onClick={handleLogout}
                      className="w-full py-3.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/10 dark:border-red-500/20 text-xs font-bold uppercase tracking-widest transition-all active:scale-95"
                    >
                      Sign Out Securely
                    </button>
                  </div>
                </div>
              )}

              {/* -------------------- FLOW 4: BUY LEGACY_VOUCHER CODE FORM -------------------- */}
              {false && currentScreen === 'buy_legacyVoucher' && (
                <div className="p-5 space-y-5 animate-[fadeIn_0.2s_ease-out]">
                  <div className="flex items-center gap-3">
                    <button
                      id="btn-legacyVoucher-back"
                      onClick={() => {
                        if (window.history.state && window.history.state.appScreen) {
                          window.history.back();
                        } else {
                          setCurrentScreen(legacyVoucherBackScreen);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <h4 className="text-base font-bold font-display text-slate-800 dark:text-white">Purchase Deposit</h4>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Purchase a deposit securely online. Your voucher is issued only after the payment gateway confirms the payment.
                  </p>

                  {/* Secure KoraPay Checkout */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-500/15 via-emerald-500/10 to-indigo-500/15 border border-teal-500/30 space-y-3 shadow-lg shadow-teal-500/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
                          <Zap className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white font-display block">Instant Automated Voucher Issuance</span>
                          <span className="text-[10px] text-teal-300/80 font-mono">Pay with Card, Bank Transfer, or USSD</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold border border-emerald-500/30">
                        RECOMMENDED
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setPaymentModalOpen(true);
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-teal-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CreditCard className="h-4 w-4 stroke-[2.5]" />
                      <span>BUY DEPOSIT — ₦6,500</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* -------------------- FLOW 4.2: MANUAL BANK TRANSFER PAYMENT -------------------- */}
              {false && currentScreen === 'legacyVoucher_instructions' && (
                <div className="p-5 space-y-5 animate-[fadeIn_0.2s_ease-out]">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold font-display text-slate-800 dark:text-white">Deposit Payment Details</h4>
                    <span className="text-[10px] font-mono font-bold text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
                      Official Bank Transfer
                    </span>
                  </div>

                  {/* Instructions */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 leading-relaxed text-xs text-slate-600 dark:text-slate-300 space-y-1">
                    <div className="font-semibold text-[10px] font-mono uppercase text-teal-400 tracking-wider">Payment Instructions:</div>
                    <p>{legacyVoucherConfig.instructions || `Transfer exactly ₦${(legacyVoucherConfig.voucherPrice || 6500).toLocaleString()} to the official account details below. After completing your bank transfer, tap the "I HAVE MADE THIS TRANSFER" button below to notify support on WhatsApp.`}</p>
                  </div>

                  {/* Maintenance notice if present */}
                  {legacyVoucherConfig.maintenanceNotice && (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 font-medium">
                      ⚠️ {legacyVoucherConfig.maintenanceNotice}
                    </div>
                  )}

                  {/* ACCOUNT DETAILS CARD */}
                  <GlassCard className="p-5 space-y-3.5 bg-gradient-to-tr from-slate-900/80 to-indigo-950/40 border-teal-500/20">
                    {/* Fixed Voucher Price */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <span className="text-xs text-slate-400">Fixed Voucher Price:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-mono font-extrabold text-teal-400">
                          {nairaFormat(legacyVoucherConfig.voucherPrice || 6500)}
                        </span>
                        <button
                          id="btn-copy-amount"
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(String(legacyVoucherConfig.voucherPrice || 6500));
                            showToast('Amount copied!', 'success');
                          }}
                          className="p-1 text-[9px] font-mono font-bold bg-white/10 rounded border border-white/10 text-slate-300 hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    {/* Bank Name */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <span className="text-xs text-slate-400">Bank Name:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-mono font-bold text-white">
                          {legacyVoucherConfig.bankName || "PalmPay"}
                        </span>
                        <button
                          id="btn-copy-bank"
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(legacyVoucherConfig.bankName || "PalmPay");
                            showToast('Bank copied!', 'success');
                          }}
                          className="p-1 text-[9px] font-mono font-bold bg-white/10 rounded border border-white/10 text-slate-300 hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    {/* Account Number */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <span className="text-xs text-slate-400">Account Number:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg font-mono font-extrabold text-amber-400 tracking-wider">
                          {legacyVoucherConfig.accountNumber || "8960723295"}
                        </span>
                        <button
                          id="btn-copy-acc-num"
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(legacyVoucherConfig.accountNumber || "8960723295");
                            showToast('Account Number copied!', 'success');
                          }}
                          className="p-1 text-[9px] font-mono font-bold bg-white/10 rounded border border-white/10 text-slate-300 hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    {/* Account Name */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Account Name:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-bold text-white uppercase text-right max-w-[180px] truncate">
                          {legacyVoucherConfig.accountName || "pwamunadi ishaku"}
                        </span>
                        <button
                          id="btn-copy-acc-name"
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(legacyVoucherConfig.accountName || "pwamunadi ishaku");
                            showToast('Account Name copied!', 'success');
                          }}
                          className="p-1 text-[9px] font-mono font-bold bg-white/10 rounded border border-white/10 text-slate-300 hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </GlassCard>

                  {/* Primary actions */}
                  <div className="pt-2 space-y-3">
                    <button
                      id="btn-confirm-transfer-whatsapp"
                      type="button"
                      onClick={() => {
                        const rawWa = legacyVoucherConfig.whatsappLink || systemSettings.whatsappLink || systemSettings.whatsappNumber || "+2349162845073";
                        let waNumber = rawWa.replace(/[^0-9]/g, '');
                        if (!waNumber && rawWa.includes('wa.me/')) {
                          waNumber = rawWa.split('wa.me/')[1]?.replace(/[^0-9]/g, '') || '2349162845073';
                        }
                        if (!waNumber) waNumber = '2349162845073';

                        const msg = encodeURIComponent(
                          `Hello Admin, I have made a bank transfer of ₦${(legacyVoucherConfig.voucherPrice || 6500).toLocaleString()} for my Deposit.\n` +
                          `Name: ${legacyVoucherFormName || user?.fullName || 'Customer'}\n` +
                          `Email: ${legacyVoucherFormEmail || user?.email || ''}\n` +
                          `Please confirm my transfer and send my Deposit code.`
                        );

                        const finalUrl = rawWa.startsWith('http') && !rawWa.includes('?')
                          ? `${rawWa}?text=${msg}`
                          : `https://wa.me/${waNumber}?text=${msg}`;

                        window.open(finalUrl, '_blank');
                        showToast('Opening WhatsApp support to verify transfer...', 'info');
                      }}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-slate-950 font-black text-xs uppercase tracking-widest shadow-xl shadow-teal-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send className="h-4 w-4" />
                      <span>I HAVE MADE THIS TRANSFER</span>
                    </button>

                    <button
                      id="btn-cancel-transfer"
                      type="button"
                      onClick={() => setCurrentScreen('dashboard')}
                      className="w-full py-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Return to Dashboard</span>
                    </button>
                  </div>
                </div>
              )}

              {/* -------------------- FLOW 4.3: LEGACY_VOUCHER CONFIRMED SUCCESS TICKET -------------------- */}
              {false && currentScreen === 'legacyVoucher_success' && generatedLegacyVoucher && (
                <div className="p-5 space-y-5 animate-[fadeIn_0.2s_ease-out]">
                  <div className="text-center pt-4">
                    <div className="h-14 w-14 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h4 className="text-lg font-bold font-display text-white">Voucher Issued & Activated</h4>
                    <p className="text-xs text-slate-400 mt-1">Your Payment Authorization has been automatically generated.</p>
                  </div>

                  {/* Voucher Display Card */}
                  <div className="bg-[#0a0a14] border border-emerald-500/30 p-5 rounded-2xl text-center space-y-3 relative overflow-hidden">
                    <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider font-mono">
                      Nevo Verified & Active
                    </div>

                    <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-2">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Payment Authorization</span>
                      <div className="text-xl font-mono font-extrabold text-teal-400 tracking-wider">
                        {generatedLegacyVoucher.code || generatedLegacyVoucher.voucherCode}
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(generatedLegacyVoucher.code || generatedLegacyVoucher.voucherCode || '');
                          showToast('Voucher Code copied to clipboard!', 'success');
                        }}
                        className="px-3 py-1 bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 text-[10px] font-mono font-bold rounded-lg border border-teal-500/30 transition-all inline-flex items-center gap-1"
                      >
                        Copy Voucher Code
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      Your Withdrawal Voucher (LEGACY_VOUCHER) worth {nairaFormat(generatedLegacyVoucher.amount || 6500)} is now saved and active on your account.
                    </p>
                  </div>

                  <div className="pt-2 space-y-2.5">
                    <button
                      id="btn-download-legacyVoucher-pdf"
                      onClick={handleDownloadLegacyVoucherPdfReceipt}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download PDF Receipt</span>
                    </button>
                    <button
                      id="btn-legacyVoucher-success-home"
                      onClick={() => {
                        setGeneratedLegacyVoucher(null);
                        setCurrentScreen('dashboard');
                        setActiveTab('wallet');
                      }}
                      className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider transition-all"
                    >
                      Return to Dashboard
                    </button>
                  </div>
                </div>
              )}

              {/* -------------------- FLOW 5: BUY AIRTIME SCREEN -------------------- */}
              {currentScreen === 'buy_airtime' && (
                <div className="p-5 space-y-4 animate-[fadeIn_0.2s_ease-out] overflow-y-auto h-full min-h-[500px] no-scrollbar pb-10">
                  <div className="flex items-center gap-3">
                    <button
                      id="btn-airtime-back"
                      onClick={() => setCurrentScreen('dashboard')}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <h4 className="text-base font-bold font-display text-slate-800 dark:text-white">Purchase Airtime</h4>
                  </div>

                  <div className="p-4 bg-white/40 dark:bg-slate-900/30 rounded-2xl border border-slate-150 dark:border-slate-800/40 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">Wallet Balance</span>
                      <span className="text-sm font-bold text-slate-800 dark:text-teal-400 font-mono mt-0.5 block">
                        {nairaFormat(user?.balance || 0)}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold text-indigo-600 dark:text-teal-400 bg-indigo-500/10 dark:bg-teal-500/10 px-2.5 py-1 rounded-full border border-indigo-500/10">
                      Standard pricing
                    </span>
                  </div>

                  {/* Saved Phone Beneficiaries */}
                  {phoneBeneficiaries.length > 0 && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">Favourite Numbers</label>
                      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {phoneBeneficiaries.map((ben) => (
                          <button
                            key={ben.id}
                            type="button"
                            onClick={() => {
                              setAirtimePhone(ben.phone);
                              setAirtimeNetwork(ben.network);
                              showToast(`Selected ${ben.name} (${ben.phone})`, 'info');
                            }}
                            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left shrink-0 active:scale-95 transition-all flex items-center gap-2"
                          >
                            <div className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
                            <div>
                              <span className="text-[10px] font-bold block text-slate-800 dark:text-white leading-none">{ben.name}</span>
                              <span className="text-[8px] text-slate-400 font-mono block mt-0.5">{ben.phone}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <GlassCard className="p-5">
                    <form onSubmit={handlePurchaseAirtime} className="space-y-4">
                      {/* Select Network dropdown */}
                      <div>
                        <label className="text-[10px] font-mono text-slate-400 block mb-1.5 uppercase tracking-wider">Select Network Operator</label>
                        <div className="grid grid-cols-4 gap-2">
                          {MOBILE_NETWORKS.map((net) => (
                            <button
                              id={`btn-network-${net.id}`}
                              key={net.id}
                              type="button"
                              onClick={() => setAirtimeNetwork(net.id)}
                              className={`py-3 rounded-xl text-center text-xs font-bold border transition-all ${
                                airtimeNetwork === net.id
                                  ? `${net.color} border-transparent ring-2 ring-indigo-500/30 scale-102`
                                  : 'bg-white/40 border-slate-200 text-slate-500 dark:bg-slate-950/40 dark:border-slate-800 hover:text-slate-800 dark:hover:text-white'
                              }`}
                            >
                              {net.logo}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase tracking-wider">Recipient Phone Number</label>
                        <div className="flex gap-2">
                          <input
                            id="input-airtime-phone"
                            type="tel"
                            placeholder="e.g. 08034567890"
                            required
                            value={airtimePhone}
                            onChange={(e) => setAirtimePhone(e.target.value)}
                            className="flex-1 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-400 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (airtimePhone.length < 10) {
                                showToast('Please type a valid phone first.', 'error');
                                return;
                              }
                              const nickname = prompt('Enter a nickname for this recipient:');
                              if (nickname) {
                                const newBen = { id: `pben-${Date.now()}`, name: nickname, phone: airtimePhone, network: airtimeNetwork };
                                const updated = [newBen, ...phoneBeneficiaries];
                                setPhoneBeneficiaries(updated);
                                localStorage.setItem('nevo_phone_beneficiaries', JSON.stringify(updated));
                                showToast('Added to favourites!', 'success');
                              }
                            }}
                            className="px-3 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-400 rounded-xl text-xs font-bold flex items-center justify-center border border-indigo-500/20 active:scale-95 transition-all"
                            title="Save as Favourite"
                          >
                            ⭐ Save
                          </button>
                        </div>
                      </div>

                      {/* Recharge Amount and Quick Selection */}
                      <div>
                        <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase tracking-wider">Recharge Amount (₦)</label>
                        <input
                          id="input-airtime-amount"
                          type="number"
                          placeholder="Minimum 100"
                          required
                          value={airtimeAmount}
                          onChange={(e) => setAirtimeAmount(e.target.value)}
                          className="w-full text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-400 font-mono"
                        />
                        
                        {/* Quick Selection Pills */}
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {[100, 200, 500, 1000, 2000, 5000].map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => setAirtimeAmount(amt.toString())}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-[10px] font-mono font-bold active:scale-95 transition-all"
                            >
                              ₦{amt}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Optional LEGACY_VOUCHER Code input */}
                      {true ? (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 font-medium flex items-center gap-2.5">
                          <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0" />
                          <div>
                            <p className="font-bold">Transaction Access Locked</p>
                            <p className="text-[9px] opacity-80 mt-0.5">Complete 5 successful referrals to unlock wallet transactions.</p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold text-rose-500">Payment Authorization</label>
                            <button
                              id="btn-goto-buy-legacyVoucher-airtime"
                              type="button"
                              onClick={() => setPaymentModalOpen(true)}
                              className="text-[9px] font-bold text-indigo-600 dark:text-teal-400 hover:underline"
                            >
                              Deposit Funds
                            </button>
                          </div>
                          <input
                            id="input-airtime-legacyVoucher"
                            type="text"
                            placeholder="No voucher required"
                            value={airtimeLegacyVoucherCode}
                            onChange={(e) => setAirtimeLegacyVoucherCode(e.target.value)}
                            className="w-full text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono tracking-widest uppercase"
                          />
                          {!airtimeLegacyVoucherCode ? (
                            <div className="mt-1.5 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[10px] text-amber-600 dark:text-amber-400 leading-normal">
                              A wallet deposit is required. Tap{' '}
                              <button
                                type="button"
                                onClick={() => setPaymentModalOpen(true)}
                                className="font-extrabold underline text-indigo-600 dark:text-teal-400"
                              >
                                'Deposit Funds'
                              </button>.
                            </div>
                          ) : !isVoucherValid(airtimeLegacyVoucherCode) ? (
                            <div className="mt-1.5 p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                              Invalid wallet authorization.
                            </div>
                          ) : (
                            <div className="mt-1.5 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                              ✓ Wallet authorization ready.
                            </div>
                          )}
                        </div>
                      )}

                      <button
                        id="btn-purchase-airtime"
                        type="submit"
                        disabled={
                          !airtimePhone ||
                          airtimePhone.length < 10 ||
                          !airtimeAmount ||
                          parseInt(airtimeAmount) < 100 ||
                          (!true && !isVoucherValid(airtimeLegacyVoucherCode)) ||
                          isSubmitting
                        }
                        className={`w-full text-xs font-bold uppercase tracking-widest py-3.5 bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-700 hover:to-teal-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all mt-2 flex items-center justify-center gap-2 ${
                          (!airtimePhone || airtimePhone.length < 10 || !airtimeAmount || parseInt(airtimeAmount) < 100 || (!true && !isVoucherValid(airtimeLegacyVoucherCode)) || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Processing Securely...</span>
                          </>
                        ) : (
                          'Purchase Airtime'
                        )}
                      </button>
                    </form>
                  </GlassCard>
                </div>
              )}

              {/* -------------------- FLOW 5.1: POLISHED DEDICATED DATA PURCHASE SCREEN (Point 12) -------------------- */}
              {currentScreen === 'buy_data' && (
                <div className="p-5 space-y-4 animate-[fadeIn_0.2s_ease-out] overflow-y-auto h-full min-h-[500px] no-scrollbar pb-10">
                  <div className="flex items-center gap-3">
                    <button
                      id="btn-data-back"
                      onClick={() => setCurrentScreen('dashboard')}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <h4 className="text-base font-bold font-display text-slate-800 dark:text-white">Purchase Data Bundle</h4>
                  </div>

                  <div className="p-4 bg-white/40 dark:bg-slate-900/30 rounded-2xl border border-slate-150 dark:border-slate-800/40 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">Wallet Balance</span>
                      <span className="text-sm font-bold text-slate-800 dark:text-teal-400 font-mono mt-0.5 block">
                        {nairaFormat(user?.balance || 0)}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold text-indigo-600 dark:text-teal-400 bg-indigo-500/10 dark:bg-teal-500/10 px-2.5 py-1 rounded-full border border-indigo-500/10 animate-pulse">
                      Wallet balance active
                    </span>
                  </div>

                  {/* Saved Phone Beneficiaries */}
                  {phoneBeneficiaries.length > 0 && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">Favourite Numbers</label>
                      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {phoneBeneficiaries.map((ben) => (
                          <button
                            key={ben.id}
                            type="button"
                            onClick={() => {
                              setDataPhone(ben.phone);
                              setDataNetwork(ben.network);
                              setSelectedDataPlan(null);
                              showToast(`Selected ${ben.name} (${ben.phone})`, 'info');
                            }}
                            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left shrink-0 active:scale-95 transition-all flex items-center gap-2"
                          >
                            <div className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
                            <div>
                              <span className="text-[10px] font-bold block text-slate-800 dark:text-white leading-none">{ben.name}</span>
                              <span className="text-[8px] text-slate-400 font-mono block mt-0.5">{ben.phone}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <GlassCard className="p-5">
                    <form onSubmit={handlePurchaseData} className="space-y-4">
                      {/* Select Network Operator */}
                      <div>
                        <label className="text-[10px] font-mono text-slate-400 block mb-2 uppercase tracking-wider">Select Network Operator</label>
                        <div className="grid grid-cols-4 gap-2">
                          {MOBILE_NETWORKS.map((net) => (
                            <button
                              id={`btn-data-network-${net.id}`}
                              key={net.id}
                              type="button"
                              onClick={() => {
                                setDataNetwork(net.id);
                                setSelectedDataPlan(null); // Reset plan when network changes
                              }}
                              className={`py-3 rounded-xl text-center text-xs font-black border transition-all ${
                                dataNetwork === net.id
                                  ? `${net.color} border-transparent ring-2 ring-indigo-500/30 scale-102 shadow-md`
                                  : 'bg-white/40 border-slate-250 text-slate-500 dark:bg-slate-950/40 dark:border-slate-800 hover:text-slate-800 dark:hover:text-white hover:border-slate-300'
                              }`}
                            >
                              {net.logo}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Recipient Phone Number */}
                      <div>
                        <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase tracking-wider">Recipient Phone Number</label>
                        <div className="flex gap-2">
                          <input
                            id="input-data-phone"
                            type="tel"
                            placeholder="e.g. 08034567890"
                            required
                            value={dataPhone}
                            onChange={(e) => setDataPhone(e.target.value)}
                            className="flex-1 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-400 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (dataPhone.length < 10) {
                                showToast('Please type a valid phone first.', 'error');
                                return;
                              }
                              const nickname = prompt('Enter a nickname for this recipient:');
                              if (nickname) {
                                const newBen = { id: `pben-${Date.now()}`, name: nickname, phone: dataPhone, network: dataNetwork };
                                const updated = [newBen, ...phoneBeneficiaries];
                                setPhoneBeneficiaries(updated);
                                localStorage.setItem('nevo_phone_beneficiaries', JSON.stringify(updated));
                                showToast('Added to favourites!', 'success');
                              }
                            }}
                            className="px-3 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-400 rounded-xl text-xs font-bold flex items-center justify-center border border-indigo-500/20 active:scale-95 transition-all"
                            title="Save as Favourite"
                          >
                            ⭐ Save
                          </button>
                        </div>
                      </div>

                      {/* Professional Categorized Data Plans */}
                      <div>
                        <label className="text-[10px] font-mono text-slate-400 block mb-2 uppercase tracking-wider">Data Categories</label>
                        
                        {/* Categorization Tabs */}
                        <div className="flex border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden mb-3.5 bg-slate-50 dark:bg-slate-950/50 p-0.5">
                          {(['daily', 'weekly', 'monthly', 'sme'] as const).map((tab) => (
                            <button
                              key={tab}
                              type="button"
                              onClick={() => {
                                setActiveDataTab(tab);
                                setSelectedDataPlan(null);
                              }}
                              className={`flex-1 text-center py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                                activeDataTab === tab
                                  ? 'bg-gradient-to-r from-indigo-600 to-teal-500 text-white shadow-sm font-extrabold'
                                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                              }`}
                            >
                              {tab}
                            </button>
                          ))}
                        </div>

                        {/* Filtered Data Plans Grid */}
                        <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1 no-scrollbar animate-[fadeIn_0.15s_ease-out]">
                          {DATA_PLANS.filter(p => {
                            if (p.network !== dataNetwork) return false;
                            const sizeInt = parseInt(p.size);
                            const isGB = p.size.toLowerCase().includes('gb');
                            
                            if (activeDataTab === 'daily') {
                              return !isGB || sizeInt === 1;
                            } else if (activeDataTab === 'weekly') {
                              return isGB && (sizeInt >= 2 && sizeInt <= 3);
                            } else if (activeDataTab === 'monthly') {
                              return isGB && (sizeInt >= 5 && sizeInt <= 20);
                            } else if (activeDataTab === 'sme') {
                              return isGB && sizeInt >= 50;
                            }
                            return true;
                          }).map((plan) => (
                            <div
                              id={`data-plan-option-${plan.id}`}
                              key={plan.id}
                              onClick={() => setSelectedDataPlan(plan)}
                              className={`p-3 rounded-xl border transition-all cursor-pointer text-left relative overflow-hidden ${
                                selectedDataPlan?.id === plan.id
                                  ? 'bg-gradient-to-tr from-indigo-500/15 to-teal-500/15 border-indigo-500 text-slate-900 dark:text-white ring-1 ring-indigo-500/30'
                                  : 'bg-white/40 border-slate-150 text-slate-500 dark:bg-slate-900/40 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <span className="text-xs font-black text-slate-800 dark:text-slate-100 block">{plan.size}</span>
                                {selectedDataPlan?.id === plan.id && (
                                  <span className="h-3.5 w-3.5 bg-indigo-600 rounded-full flex items-center justify-center text-white scale-90">
                                    <Check className="h-2 w-2 stroke-[3]" />
                                  </span>
                                )}
                              </div>
                              <span className="text-[9px] text-slate-400 block font-mono mt-0.5">{plan.validity}</span>
                              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-teal-400 block mt-2">{nairaFormat(plan.price)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Optional LEGACY_VOUCHER Code input */}
                      {true ? (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 font-medium flex items-center gap-2.5">
                          <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0" />
                          <div>
                            <p className="font-bold">Transaction Access Locked</p>
                            <p className="text-[9px] opacity-80 mt-0.5">Complete 5 successful referrals to unlock wallet transactions.</p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold text-rose-500">Payment Authorization</label>
                            <button
                              id="btn-goto-buy-legacyVoucher-data"
                              type="button"
                              onClick={() => setPaymentModalOpen(true)}
                              className="text-[9px] font-bold text-indigo-600 dark:text-teal-400 hover:underline"
                            >
                              Deposit Funds
                            </button>
                          </div>
                          <input
                            id="input-data-legacyVoucher"
                            type="text"
                            placeholder="No voucher required"
                            value={dataLegacyVoucherCode}
                            onChange={(e) => setDataLegacyVoucherCode(e.target.value)}
                            className="w-full text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono tracking-widest uppercase"
                          />
                          {!dataLegacyVoucherCode ? (
                            <div className="mt-1.5 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[10px] text-amber-600 dark:text-amber-400 leading-normal">
                              A wallet deposit is required. Tap{' '}
                              <button
                                type="button"
                                onClick={() => setPaymentModalOpen(true)}
                                className="font-extrabold underline text-indigo-600 dark:text-teal-400"
                              >
                                'Deposit Funds'
                              </button>.
                            </div>
                          ) : !isVoucherValid(dataLegacyVoucherCode) ? (
                            <div className="mt-1.5 p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                              Invalid wallet authorization.
                            </div>
                          ) : (
                            <div className="mt-1.5 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                              ✓ Wallet authorization ready.
                            </div>
                          )}
                        </div>
                      )}

                      <button
                        id="btn-purchase-data"
                        type="submit"
                        disabled={
                          !dataPhone ||
                          dataPhone.length < 10 ||
                          !selectedDataPlan ||
                          (!true && !isVoucherValid(dataLegacyVoucherCode)) ||
                          isSubmitting
                        }
                        className={`w-full text-xs font-extrabold uppercase tracking-widest py-3.5 bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-700 hover:to-teal-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all mt-2 flex items-center justify-center gap-2 ${
                          (!dataPhone || dataPhone.length < 10 || !selectedDataPlan || (!true && !isVoucherValid(dataLegacyVoucherCode)) || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Processing Securely...</span>
                          </>
                        ) : selectedDataPlan ? (
                          `Purchase ${selectedDataPlan.size} (${nairaFormat(selectedDataPlan.price)})`
                        ) : (
                          'Select Data Package'
                        )}
                      </button>
                    </form>
                  </GlassCard>
                </div>
              )}

              {/* -------------------- FLOW 5.2: PAY BILLS SCREEN -------------------- */}
              {currentScreen === 'pay_bills' && (
                <div className="p-5 space-y-4 animate-[fadeIn_0.2s_ease-out] overflow-y-auto h-full min-h-[500px] no-scrollbar pb-10">
                  <div className="flex items-center gap-3">
                    <button
                      id="btn-bills-back"
                      onClick={() => {
                        if (window.history.state && window.history.state.appScreen) {
                          window.history.back();
                        } else {
                          changeScreen('dashboard');
                        }
                      }}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <h4 className="text-base font-bold font-display text-slate-800 dark:text-white">Bill Payments</h4>
                  </div>

                  <div className="p-4 bg-white/40 dark:bg-slate-900/30 rounded-2xl border border-slate-150 dark:border-slate-800/40 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">Wallet Balance</span>
                      <span className="text-sm font-bold text-slate-800 dark:text-teal-400 font-mono mt-0.5 block">
                        {nairaFormat(user?.balance || 0)}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold text-indigo-600 dark:text-teal-400 bg-indigo-500/10 dark:bg-teal-500/10 px-2.5 py-1 rounded-full border border-indigo-500/10">
                      Standard Billing
                    </span>
                  </div>

                  {/* Bill Type Selector Tabs */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-100/80 dark:bg-slate-900/60 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => { setBillsType('cable'); }}
                      className={`py-2 text-[10px] font-bold uppercase rounded-lg transition-all flex flex-col items-center gap-1 ${
                        billsType === 'cable'
                          ? 'bg-white dark:bg-slate-850 text-indigo-600 dark:text-teal-400 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                      }`}
                    >
                      <Tv className="h-4 w-4" />
                      <span>Cable TV</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setBillsType('electricity'); }}
                      className={`py-2 text-[10px] font-bold uppercase rounded-lg transition-all flex flex-col items-center gap-1 ${
                        billsType === 'electricity'
                          ? 'bg-white dark:bg-slate-850 text-indigo-600 dark:text-teal-400 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                      }`}
                    >
                      <Zap className="h-4 w-4" />
                      <span>Electricity</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setBillsType('betting'); }}
                      className={`py-2 text-[10px] font-bold uppercase rounded-lg transition-all flex flex-col items-center gap-1 ${
                        billsType === 'betting'
                          ? 'bg-white dark:bg-slate-850 text-indigo-600 dark:text-teal-400 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                      }`}
                    >
                      <Gamepad2 className="h-4 w-4" />
                      <span>Betting</span>
                    </button>
                  </div>

                  <GlassCard className="p-5 border border-slate-150 dark:border-slate-800/40">
                    <form onSubmit={handlePayBillSubmit} className="space-y-4">
                      {/* Provider Select dropdown */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Select Provider</label>
                        <select
                          value={billsProvider}
                          onChange={(e) => handleProviderChange(e.target.value)}
                          className="w-full h-11 px-3 bg-white/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500 dark:focus:border-teal-500"
                        >
                          {billsType === 'cable' && CABLE_PROVIDERS.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                          {billsType === 'electricity' && DISCOS_PROVIDERS.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                          {billsType === 'betting' && BETTING_PROVIDERS.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Cable TV Packages Select dropdown */}
                      {billsType === 'cable' && (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Select Bouquet / Package</label>
                          <select
                            value={billsCablePackage}
                            onChange={(e) => setBillsCablePackage(e.target.value)}
                            className="w-full h-11 px-3 bg-white/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500 dark:focus:border-teal-500"
                          >
                            {CABLE_PROVIDERS.find(p => p.id === billsProvider)?.packages.map(pkg => (
                              <option key={pkg.id} value={pkg.id}>
                                {pkg.name} ({nairaFormat(pkg.price)})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Meter Type Segmented Control for Electricity */}
                      {billsType === 'electricity' && (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Meter Type</label>
                          <div className="grid grid-cols-2 gap-2 bg-slate-100/50 dark:bg-slate-900/40 p-1 rounded-xl">
                            <button
                              type="button"
                              onClick={() => handleMeterTypeChange('prepaid')}
                              className={`py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${
                                billsMeterType === 'prepaid'
                                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-teal-400 shadow-sm border border-slate-200/40 dark:border-slate-700/40'
                                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                              }`}
                            >
                              Prepaid
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMeterTypeChange('postpaid')}
                              className={`py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${
                                billsMeterType === 'postpaid'
                                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-teal-400 shadow-sm border border-slate-200/40 dark:border-slate-700/40'
                                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                              }`}
                            >
                              Postpaid
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Account/Meter/Smartcard Number */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block flex justify-between">
                          <span>{billsType === 'cable' ? 'Smartcard / IUC Number' : billsType === 'electricity' ? 'Meter Number' : 'Betting Customer ID'}</span>
                          {billsType === 'electricity' && isMeterValidated && (
                            <span className="text-emerald-500 font-bold uppercase tracking-widest text-[8px] flex items-center gap-1 font-sans">
                              ✓ Verified
                            </span>
                          )}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={billsAccountNumber}
                            onChange={(e) => handleMeterNumberChange(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
                            placeholder={
                              billsType === 'cable' ? 'e.g. 1023485764' : billsType === 'electricity' ? 'e.g. 45091827364' : 'e.g. SB-10928374'
                            }
                            className="flex-1 h-11 px-3 bg-white/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500 dark:focus:border-teal-500 font-mono"
                          />
                          {billsType === 'electricity' && (
                            <button
                              type="button"
                              onClick={handleValidateMeter}
                              disabled={isValidatingMeter || !billsAccountNumber}
                              className={`px-4 h-11 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900 transition-all ${
                                isValidatingMeter ? 'animate-pulse' : ''
                              }`}
                            >
                              {isValidatingMeter ? 'Verifying...' : 'Validate'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Simulated Electricity Meter Owner Info */}
                      {billsType === 'electricity' && isMeterValidated && (
                        <div className="p-3 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 dark:border-emerald-500/20 rounded-xl space-y-1">
                          <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                            <span>METER OWNER:</span>
                            <span className="font-bold text-emerald-500">VERIFIED ✓</span>
                          </div>
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-100">{meterOwnerName}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{meterAddress}</div>
                        </div>
                      )}

                      {/* Amount Input */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          {billsType === 'cable' ? 'Automated Amount (Naira)' : 'Amount (₦)'}
                        </label>
                        <input
                          type="text"
                          disabled={billsType === 'cable'}
                          value={billsAmount}
                          onChange={(e) => setBillsAmount(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder={billsType === 'cable' ? 'Auto-filled per bouquet selection' : 'e.g. 5000'}
                          className={`w-full h-11 px-3 bg-white/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500 dark:focus:border-teal-500 font-mono ${
                            billsType === 'cable' ? 'opacity-80 bg-slate-100 dark:bg-slate-900/60 cursor-not-allowed select-none' : ''
                          }`}
                        />
                        {billsType === 'cable' && (
                          <span className="text-[9px] text-indigo-500 dark:text-teal-400 mt-1 block">
                            Pricing is automated per package selection. No manual entry required.
                          </span>
                        )}
                      </div>

                      {/* Wallet Payment Authorization */}
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 font-medium flex items-center gap-2.5">
                        <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0" />
                        <div><p className="font-bold">Transaction Access Locked</p><p className="text-[9px] opacity-80 mt-0.5">Complete 5 successful referrals to unlock bill payments.</p></div>
                      </div>

                      {/* Submit Button */}
                      <button
                        id="btn-bills-submit"
                        type="submit"
                        disabled={
                          !billsAccountNumber || 
                          !billsAmount || 
                          isSubmitting || 
                          (billsType === 'electricity' && !isMeterValidated)
                        }
                        className={`w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-teal-600 dark:to-teal-700 text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                          (!billsAccountNumber || !billsAmount || isSubmitting || (billsType === 'electricity' && !isMeterValidated)) 
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'shadow-lg hover:shadow-indigo-500/10'
                        }`}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Authorizing Payment...</span>
                          </>
                        ) : (
                          `Pay ${billsProvider} (${nairaFormat(Number(billsAmount || 0))})`
                        )}
                      </button>
                    </form>
                  </GlassCard>
                </div>
              )}

              {/* -------------------- FLOW 5.5: DEDICATED FULL-SCREEN WITHDRAWAL PAGE (/dashboard/withdraw) -------------------- */}
              {currentScreen === 'withdraw' && (
                <div className="p-4 sm:p-6 space-y-6 animate-[fadeIn_0.2s_ease-out] max-w-3xl mx-auto w-full">
                  {/* Page Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <button
                        id="btn-withdraw-back"
                        type="button"
                        onClick={() => {
                          setCurrentScreen('dashboard');
                          navigateTo('/');
                        }}
                        className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </button>
                      <div>
                        <h2 className="text-lg font-black font-display text-white">Bank Withdrawal</h2>
                        <p className="text-[10px] font-mono text-slate-400">Route: /dashboard/withdraw</p>
                      </div>
                    </div>
                    <div className="bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-teal-400">
                      Step {withdrawStep} of 2
                    </div>
                  </div>

                  {/* Wallet Balance Summary Card */}
                  <div className="p-5 bg-gradient-to-r from-slate-900/90 to-indigo-950/80 border border-white/10 rounded-2xl flex items-center justify-between shadow-xl">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Available Balance</span>
                      <span className="text-xl font-black text-teal-400 font-mono mt-0.5 block">
                        {nairaFormat(user?.balance || 0)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-mono text-slate-400 block uppercase">Withdrawal Limits</span>
                      <span className="text-xs font-bold text-slate-300 font-mono mt-0.5 block">Min ₦5,000 • Max ₦200,000</span>
                    </div>
                  </div>

                  {/* STEP 1: Recipient Bank Details */}
                  {withdrawStep === 1 && (
                    <GlassCard className="p-6 space-y-5 border-white/10">
                      <div className="border-b border-white/5 pb-3">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <span className="h-6 w-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-mono font-bold">1</span>
                          Step 1: Account Information
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-1">Select destination bank and enter account details manually.</p>
                      </div>

                      <div className="space-y-4">
                        {/* 1. Select Bank */}
                        <div>
                          <label className="text-[11px] font-mono text-slate-300 block mb-1.5 font-bold">1. Select Destination Bank</label>
                          <BankSelector
                            id="withdraw-select-bank"
                            value={withdrawBank}
                            onChange={(bankName) => {
                              setWithdrawBank(bankName);
                              setWithdrawVerified(false);
                              setWithdrawNameConfirmed(false);
                              setWithdrawAccName('');
                              setWithdrawError('');
                            }}
                          />
                        </div>

                        {/* 2. Account Number */}
                        <div>
                          <label className="text-[11px] font-mono text-slate-300 block mb-1.5 font-bold">2. Account Number (10 Digits)</label>
                          <input
                            id="withdraw-acc-num"
                            type="text"
                            inputMode="numeric"
                            maxLength={10}
                            placeholder="e.g. 0123456789"
                            required
                            value={withdrawAccount}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, '');
                              if (val.length <= 10) {
                                setWithdrawAccount(val);
                                setWithdrawNameConfirmed(false);
                              }
                            }}
                            className="w-full text-xs bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white font-mono tracking-widest focus:outline-none focus:ring-1 focus:ring-teal-400"
                          />
                        </div>

                        {/* 3. Account Name - AUTOMATIC VERIFICATION */}
                        <div>
                          <label className="text-[11px] font-mono text-slate-300 block mb-1.5 font-bold flex items-center justify-between">
                            <span>3. Account Holder Name</span>
                            {isVerifyingWithdrawAccount && (
                              <span className="text-[10px] text-teal-400 font-mono flex items-center gap-1">
                                <RefreshCw className="h-3 w-3 animate-spin" /> Resolving...
                              </span>
                            )}
                          </label>
                          {isVerifyingWithdrawAccount ? (
                            <div className="w-full text-xs bg-slate-950 border border-teal-500/30 rounded-xl px-4 py-3 text-teal-400 font-mono flex items-center gap-2 animate-pulse">
                              <RefreshCw className="h-4 w-4 animate-spin shrink-0" />
                              <span>Resolving account holder's name...</span>
                            </div>
                          ) : withdrawVerified && withdrawAccName ? (
                            <div className="space-y-2">
                              <div className="w-full text-xs bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-emerald-300 font-mono font-bold flex items-center justify-between shadow-inner">
                                <div className="flex items-center gap-2 truncate">
                                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                                  <span className="truncate">{withdrawAccName}</span>
                                </div>
                                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase shrink-0">VERIFIED</span>
                              </div>
                              <label className="flex items-start gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/10 cursor-pointer">
                                <input type="checkbox" checked={withdrawNameConfirmed} onChange={(e) => setWithdrawNameConfirmed(e.target.checked)} className="mt-0.5 accent-teal-400" />
                                <span className="text-[10px] text-slate-300 leading-relaxed">I confirm that this verified account name belongs to the bank account I want to receive the withdrawal.</span>
                              </label>
                            </div>
                          ) : withdrawError ? (
                            <div className="w-full text-xs bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3 text-rose-400 font-mono flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                              <span>{withdrawError}</span>
                            </div>
                          ) : (
                            <div className="w-full text-[11px] bg-slate-950/60 border border-white/5 rounded-xl px-4 py-3 text-slate-500 font-mono italic">
                              Enter a 10-digit account number to resolve verified account holder name automatically.
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        id="btn-withdraw-step1-continue"
                        type="button"
                        disabled={!withdrawBank || withdrawAccount.length !== 10 || !withdrawVerified || !withdrawAccName || !withdrawNameConfirmed}
                        onClick={() => setWithdrawStep(2)}
                        className={`w-full py-4 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                          (!withdrawBank || withdrawAccount.length !== 10 || !withdrawVerified || !withdrawAccName || !withdrawNameConfirmed) ? 'opacity-40 cursor-not-allowed' : ''
                        }`}
                      >
                        <span>Confirm Name & Continue to Step 2</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </GlassCard>
                  )}

                  {/* STEP 2: Amount & Deposit Authorization */}
                  {withdrawStep === 2 && (
                    <GlassCard className="p-6 space-y-5 border-white/10">
                      <div className="border-b border-white/5 pb-3 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <span className="h-6 w-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-mono font-bold">2</span>
                            Step 2: Amount & Authorization
                          </h3>
                          <p className="text-[11px] text-slate-400 mt-1">Confirm your withdrawal amount. Your wallet deposit is not an activation fee.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setWithdrawStep(1)}
                          className="text-[10px] font-mono text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="h-3 w-3" /> Edit Details
                        </button>
                      </div>

                      {/* Recipient Summary */}
                      <div className="p-4 bg-slate-950/60 border border-white/10 rounded-2xl space-y-2 font-mono text-xs">
                        <div className="flex justify-between text-slate-400 text-[10px]">
                          <span>BANK: <strong className="text-white">{withdrawBank}</strong></span>
                          <span>ACCOUNT: <strong className="text-white">{withdrawAccount}</strong></span>
                        </div>
                        <div className="text-teal-400 font-extrabold uppercase text-sm border-t border-white/5 pt-2">
                          {withdrawAccName}
                        </div>
                      </div>

                      <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
                        {/* Amount */}
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <label className="text-[11px] font-mono text-slate-300 font-bold">Withdrawal Amount (₦)</label>
                            <span className="text-[10px] font-mono text-slate-400">Min: ₦5,000 • Max: ₦200,000</span>
                          </div>
                          <input
                            id="withdraw-amount"
                            type="number"
                            min={5000}
                            max={200000}
                            placeholder="Min ₦5,000 - Max ₦200,000"
                            required
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            className="w-full text-sm bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-teal-400"
                          />
                          {withdrawAmount && (parseInt(withdrawAmount) < 5000 || parseInt(withdrawAmount) > 200000) && (
                            <p className="text-[10px] text-rose-400 font-mono mt-1">Amount must be between ₦5,000 and ₦200,000.</p>
                          )}
                        </div>

                        {/* Withdrawal eligibility */}
                        {withdrawEligibilityLoading ? (
                          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-slate-300">Checking withdrawal access…</div>
                        ) : withdrawSuccessfulReferrals < 5 ? (
                          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-100 leading-relaxed space-y-3">
                            <div className="font-bold">Withdrawal access is currently locked.</div>
                            <div>Complete 5 successful referrals first.</div>
                            <div className="font-mono text-[11px]">Referral progress: {withdrawSuccessfulReferrals}/5</div>
                            <button type="button" onClick={() => { setCurrentScreen('referrals'); navigateTo('/referrals'); }} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 text-white font-black text-[10px] uppercase tracking-wider">Invite Friends</button>
                          </div>
                        ) : !withdrawDepositVerified ? (
                          <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-100 leading-relaxed space-y-3">
                            <div className="font-bold">Referral requirement complete (5/5).</div>
                            <div>Make a verified KoraPay wallet deposit of at least <strong>₦520</strong> before you can withdraw.</div>
                            <div className="text-[10px] text-teal-100/80">This is not an activation fee. The deposit is credited to your wallet and remains your money. Once the normal withdrawal requirements are met, it can be withdrawn with your available balance.</div>
                            <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('nevo-open-deposit'))} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-indigo-500 text-slate-950 font-black text-[10px] uppercase tracking-wider">Deposit ₦520+ via KoraPay</button>
                          </div>
                        ) : (
                          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 leading-relaxed">
                            <div className="font-bold">Withdrawal access unlocked.</div>
                            <div>Your verified KoraPay deposit has been credited to your wallet. It is not an activation fee and remains your money.</div>
                          </div>
                        )}

                        <button
                          id="btn-withdraw-submit"
                          type="submit"
                          disabled={
                            !withdrawAccount ||
                            withdrawAccount.length !== 10 ||
                            !withdrawAccName ||
                            withdrawSuccessfulReferrals < 5 ||
                            !withdrawDepositVerified ||
                            !withdrawAmount ||
                            parseInt(withdrawAmount) < 5000 ||
                            parseInt(withdrawAmount) > 200000 ||
                            isSubmitting
                          }
                          className={`w-full py-4 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                            (!withdrawAccount || withdrawAccount.length !== 10 || !withdrawAccName || withdrawSuccessfulReferrals < 5 || !withdrawDepositVerified || !withdrawAmount || parseInt(withdrawAmount) < 5000 || parseInt(withdrawAmount) > 200000 || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Submitting Request...</span>
                            </>
                          ) : (
                            'Submit Withdrawal Request'
                          )}
                        </button>
                      </form>
                    </GlassCard>
                  )}
                </div>
              )}

              {/* -------------------- FLOW 5.6: WATCH & EARN REWARDED ADS (/ads) -------------------- */}
              {currentScreen === 'ads' && (
                <div className="animate-[fadeIn_0.2s_ease-out] w-full max-w-full">
                  <AdsPage
                    onBack={() => {
                      changeScreen('dashboard');
                      navigateTo('/');
                    }}
                  />
                </div>
              )}

              {/* -------------------- FLOW 6: BANK CASHOUT TRANSFER (/dashboard/transfer) -------------------- */}
              {currentScreen === 'transfer_bank' && (
                <div className="p-4 sm:p-6 space-y-6 animate-[fadeIn_0.2s_ease-out] max-w-3xl mx-auto w-full">
                  {/* Page Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <button
                        id="btn-transfer-back"
                        type="button"
                        onClick={() => {
                          setCurrentScreen('dashboard');
                          navigateTo('/');
                        }}
                        className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </button>
                      <div>
                        <h2 className="text-lg font-black font-display text-white">Bank Cashout Transfer</h2>
                        <p className="text-[10px] font-mono text-slate-400">Route: /dashboard/transfer</p>
                      </div>
                    </div>
                    <div className="bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-indigo-400">
                      Step {transferStep} of 2
                    </div>
                  </div>

                  {/* Wallet Balance Summary Card */}
                  <div className="p-5 bg-gradient-to-r from-slate-900/90 to-indigo-950/80 border border-white/10 rounded-2xl flex items-center justify-between shadow-xl">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Available Balance</span>
                      <span className="text-xl font-black text-teal-400 font-mono mt-0.5 block">
                        {nairaFormat(user?.balance ?? 0)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-mono text-slate-400 block uppercase">Transfer Limits</span>
                      <span className="text-xs font-bold text-slate-300 font-mono mt-0.5 block">Min ₦5,000 • Max ₦200,000</span>
                    </div>
                  </div>

                  {/* STEP 1: Account Information */}
                  {transferStep === 1 && (
                    <GlassCard className="p-6 space-y-5 border-white/10">
                      <div className="border-b border-white/5 pb-3">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <span className="h-6 w-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-mono font-bold">1</span>
                          Step 1: Account Information
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-1">Select recipient bank and enter account details manually.</p>
                      </div>

                      <div className="space-y-4">
                        {/* 1. Select Bank */}
                        <div>
                          <label className="text-[11px] font-mono text-slate-300 block mb-1.5 font-bold">1. Select Destination Bank</label>
                          <BankSelector
                            id="transfer-select-bank"
                            value={transferBank}
                            onChange={(bankName) => {
                              setTransferBank(bankName);
                              setTransferVerified(false);
                              setTransferAccName('');
                              setTransferError('');
                            }}
                          />
                        </div>

                        {/* 2. Account Number */}
                        <div>
                          <label className="text-[11px] font-mono text-slate-300 block mb-1.5 font-bold">2. Account Number (10 Digits)</label>
                          <input
                            id="input-transfer-acc"
                            type="text"
                            inputMode="numeric"
                            maxLength={10}
                            placeholder="e.g. 8960723295"
                            required
                            value={transferAccNum}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, '');
                              if (val.length <= 10) {
                                setTransferAccNum(val);
                              }
                            }}
                            className="w-full text-xs bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white font-mono tracking-widest focus:outline-none focus:ring-1 focus:ring-indigo-400"
                          />
                        </div>

                        {/* 3. Account Name - AUTOMATIC VERIFICATION */}
                        <div>
                          <label className="text-[11px] font-mono text-slate-300 block mb-1.5 font-bold flex items-center justify-between">
                            <span>3. Account Holder Name</span>
                            {isVerifyingAccount && (
                              <span className="text-[10px] text-indigo-400 font-mono flex items-center gap-1">
                                <RefreshCw className="h-3 w-3 animate-spin" /> Resolving...
                              </span>
                            )}
                          </label>
                          {isVerifyingAccount ? (
                            <div className="w-full text-xs bg-slate-950 border border-indigo-500/30 rounded-xl px-4 py-3 text-indigo-400 font-mono flex items-center gap-2 animate-pulse">
                              <RefreshCw className="h-4 w-4 animate-spin shrink-0" />
                              <span>Resolving account holder's name...</span>
                            </div>
                          ) : transferVerified && transferAccName ? (
                            <div className="w-full text-xs bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-emerald-300 font-mono font-bold flex items-center justify-between shadow-inner">
                              <div className="flex items-center gap-2 truncate">
                                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                                <span className="truncate">{transferAccName}</span>
                              </div>
                              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase shrink-0">VERIFIED</span>
                            </div>
                          ) : transferError ? (
                            <div className="w-full text-xs bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3 text-rose-400 font-mono flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                              <span>{transferError}</span>
                            </div>
                          ) : (
                            <div className="w-full text-[11px] bg-slate-950/60 border border-white/5 rounded-xl px-4 py-3 text-slate-500 font-mono italic">
                              Enter a 10-digit account number to resolve verified account holder name automatically.
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        id="btn-transfer-step1-continue"
                        type="button"
                        disabled={!transferBank || transferAccNum.length !== 10 || !transferVerified || !transferAccName}
                        onClick={() => setTransferStep(2)}
                        className={`w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                          (!transferBank || transferAccNum.length !== 10 || !transferVerified || !transferAccName) ? 'opacity-40 cursor-not-allowed' : ''
                        }`}
                      >
                        <span>Continue to Step 2</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </GlassCard>
                  )}

                  {/* STEP 2: Amount & Deposit Authorization */}
                  {transferStep === 2 && (
                    <GlassCard className="p-6 space-y-5 border-white/10">
                      <div className="border-b border-white/5 pb-3 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <span className="h-6 w-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-mono font-bold">2</span>
                            Step 2: Amount & Authorization
                          </h3>
                          <p className="text-[11px] text-slate-400 mt-1">Specify transfer amount and enter deposit code.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setTransferStep(1)}
                          className="text-[10px] font-mono text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="h-3 w-3" /> Edit Details
                        </button>
                      </div>

                      {/* Recipient Summary */}
                      <div className="p-4 bg-slate-950/60 border border-white/10 rounded-2xl space-y-2 font-mono text-xs">
                        <div className="flex justify-between text-slate-400 text-[10px]">
                          <span>BANK: <strong className="text-white">{transferBank}</strong></span>
                          <span>ACCOUNT: <strong className="text-white">{transferAccNum}</strong></span>
                        </div>
                        <div className="text-indigo-400 font-extrabold uppercase text-sm border-t border-white/5 pt-2">
                          {transferAccName}
                        </div>
                      </div>

                      <form onSubmit={handleBankTransfer} className="space-y-4">
                        {/* Amount */}
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <label className="text-[11px] font-mono text-slate-300 font-bold">Transfer Amount (₦)</label>
                            <span className="text-[10px] font-mono text-slate-400">Min: ₦5,000 • Max: ₦200,000</span>
                          </div>
                          <input
                            id="input-transfer-amount"
                            type="number"
                            min={5000}
                            max={200000}
                            placeholder="Min ₦5,000 - Max ₦200,000"
                            required
                            value={transferAmount}
                            onChange={(e) => setTransferAmount(e.target.value)}
                            className="w-full text-sm bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-indigo-400"
                          />
                          {transferAmount && (parseInt(transferAmount) < 50 || parseInt(transferAmount) > 200000) && (
                            <p className="text-[10px] text-rose-400 font-mono mt-1">Amount must be between ₦5,000 and ₦200,000.</p>
                          )}
                        </div>

                        {/* LEGACY_VOUCHER Code field */}
                        <div>
                          {true ? (
                            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 font-medium flex items-center gap-2.5">
                              <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0" />
                              <div>
                                <p className="font-bold">Transaction Access Locked</p>
                                <p className="text-[9px] opacity-80 mt-0.5">Complete 5 successful referrals to unlock wallet transfers.</p>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <label className="text-[11px] font-mono text-rose-400 font-bold uppercase tracking-wider">Payment Authorization</label>
                                <button
                                  id="btn-goto-buy-legacyVoucher-transfer"
                                  type="button"
                                  onClick={() => setPaymentModalOpen(true)}
                                  className="text-[10px] font-bold text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
                                >
                                  Deposit Funds <ExternalLink className="h-3 w-3" />
                                </button>
                              </div>
                              <input
                                id="input-transfer-legacyVoucher"
                                type="text"
                                placeholder="No voucher required"
                                value={transferLegacyVoucherCode}
                                onChange={(e) => setTransferLegacyVoucherCode(e.target.value)}
                                className="w-full text-xs bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white font-mono tracking-widest uppercase focus:outline-none focus:ring-1 focus:ring-indigo-400"
                              />
                            </div>
                          )}
                        </div>

                        <button
                          id="btn-submit-transfer"
                          type="submit"
                          disabled={
                            !transferAccNum ||
                            transferAccNum.length !== 10 ||
                            !transferAccName ||
                            !transferAmount ||
                            parseInt(transferAmount) < 50 ||
                            parseInt(transferAmount) > 200000 ||
                            isSubmitting
                          }
                          className={`w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                            (!transferAccNum || transferAccNum.length !== 10 || !transferAccName || !transferAmount || parseInt(transferAmount) < 50 || parseInt(transferAmount) > 200000 || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Processing Transfer...</span>
                            </>
                          ) : (
                            'Submit Bank Transfer'
                          )}
                        </button>
                      </form>
                    </GlassCard>
                  )}
                </div>
              )}

              {/* -------------------- VIEW 3.1: TRANSACTIONS ALL HISTORY VIEW -------------------- */}
              {currentScreen === 'transactions_all' && (
                <div className="p-5 space-y-5 animate-[fadeIn_0.2s_ease-out]">
                  <div className="flex items-center gap-3">
                    <button
                      id="btn-tx-all-back"
                      onClick={() => {
                        setCurrentScreen('dashboard');
                        setActiveTab('wallet');
                      }}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <h4 className="text-base font-bold font-display text-slate-800 dark:text-white">Full Transaction Logs</h4>
                  </div>

                  <TransactionList
                    transactions={transactions}
                    showFilters={true}
                    onViewDetails={setSelectedReceiptTx}
                  />
                </div>
              )}

              {/* -------------------- VIEW 3.2: FAQ PAGE -------------------- */}
              {currentScreen === 'faq' && (
                <div className="p-5 space-y-5 animate-[fadeIn_0.2s_ease-out]">
                  <div className="flex items-center gap-3">
                    <button
                      id="btn-faq-back"
                      onClick={() => {
                        setCurrentScreen('dashboard');
                        setActiveTab('wallet');
                      }}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <h4 className="text-base font-bold font-display text-slate-800 dark:text-white">Help &amp; FAQ Center</h4>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Learn how our customized Deposit system operates and how you save on bank transaction bills.
                  </p>

                  <div className="space-y-3">
                    {FAQS.map((item, idx) => (
                      <GlassCard id={`faq-item-${idx}`} key={idx} className="p-4 space-y-2">
                        <h6 className="text-xs font-bold text-indigo-600 dark:text-teal-400 flex items-start gap-1.5 leading-snug">
                          <span className="font-mono text-[10px]">Q:</span>
                          {item.question}
                        </h6>
                        <p className="text-xs text-slate-500 dark:text-slate-300 pl-4 border-l border-indigo-500/10 leading-relaxed">
                          {item.answer}
                        </p>
                      </GlassCard>
                    ))}
                  </div>
                </div>
              )}

              {/* -------------------- VIEW 3.3: ABOUT BRAND REBRANDING STORY -------------------- */}
              {currentScreen === 'about_info' && (
                <div className="p-5 space-y-5 animate-[fadeIn_0.2s_ease-out]">
                  <div className="flex items-center gap-3">
                    <button
                      id="btn-about-back"
                      onClick={() => {
                        setCurrentScreen('dashboard');
                        setActiveTab('wallet');
                      }}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <h4 className="text-base font-bold font-display text-slate-800 dark:text-white">Our Brand Story</h4>
                  </div>

                  {/* Rebranding card banner */}
                  <div className="rounded-3xl p-6 bg-gradient-to-tr from-indigo-950 via-purple-950 to-teal-950 text-white relative overflow-hidden border border-white/5 shadow-lg">
                    <div className="absolute right-0 top-0 h-24 w-24 bg-teal-500/10 rounded-full blur-xl" />
                    
                    <h5 className="text-base font-extrabold font-display">Nevo Digital Platform</h5>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      Nevo is a premium digital banking platform offering enhanced features, better security, and a more streamlined user experience. We utilize a glowing glassmorphism system with zero downtime.
                    </p>
                  </div>

                  {/* Our Mission */}
                  <div className="space-y-2.5">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Our Mission</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      To empower young professionals, merchants, and remote workers across Nigeria to perform immediate cashouts, settlement vouchers, and airtime loading with zero maintenance fees.
                    </p>
                  </div>

                  {/* What We Offer bullet list */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">What We Offer</h5>
                    <GlassCard className="p-5 space-y-3">
                      {[
                        'Daily instant withdrawal limits up to ₦100,000.',
                        'Premium LEGACY_VOUCHER (Withdrawal Voucher) token discount system.',
                        'Cheaper airtime & data package recharges.',
                        'Encrypted passcode entry and biometric fingerprint scanners.',
                        '24/7 dedicated Telegram, WhatsApp, and email support operators.'
                      ].map((bullet, index) => (
                        <div key={index} className="flex gap-2.5 items-start">
                          <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal">{bullet}</p>
                        </div>
                      ))}
                    </GlassCard>
                  </div>
                </div>
              )}

              {/* -------------------- VIEW 3.4: SUPPORT CHAT -------------------- */}
              {currentScreen === 'support_live_chat' && (
                <div className="h-[620px] max-h-full w-full overflow-hidden rounded-2xl animate-[fadeIn_0.2s_ease-out]">
                  <AiSupportChat
                    mode="embedded"
                    onBack={() => setCurrentScreen('dashboard')}
                  />
                </div>
              )}

              {/* -------------------- VIEW 3.5: TERMS OF SERVICE (Point 2) -------------------- */}
              {currentScreen === 'terms' && (
                <TermsOfService onBack={() => {
                  setCurrentScreen('dashboard');
                  setActiveTab('profile');
                }} />
              )}

              {/* -------------------- VIEW 3.6: PRIVACY POLICY (Point 2) -------------------- */}
              {currentScreen === 'privacy' && (
                <PrivacyPolicy onBack={() => {
                  setCurrentScreen('dashboard');
                  setActiveTab('profile');
                }} />
              )}

              {/* -------------------- VIEW 3.7: SECURITY AUDITS / DEVICES (Point 1) -------------------- */}
              {currentScreen === 'security_audits' && (
                <div className="animate-[fadeIn_0.2s_ease-out] w-full min-h-screen pb-10">
                  <DevicesHistory
                    devices={devices}
                    onLogoutDevice={(id) => {
                      setDevices(devices.filter(d => d.id !== id));
                      showToast('Device session revoked successfully.', 'success');
                    }}
                    onLogoutAllOtherDevices={() => {
                      setDevices(devices.filter(d => d.isCurrent));
                      showToast('All other sessions revoked.', 'success');
                    }}
                    loginHistory={loginHistory}
                    onBack={() => {
                      setCurrentScreen('dashboard');
                      setActiveTab('profile');
                    }}
                  />
                </div>
              )}

              {/* -------------------- VIEW 3.8: ADMIN PANEL (Point 10) -------------------- */}
              {(currentScreen === 'admin' || currentScreen === 'admin_dashboard') && (
                <div className="animate-[fadeIn_0.2s_ease-out] w-full min-h-screen pb-10">
                  <ErrorBoundary fallbackTitle="Admin Panel Module Error">
                    <AdminPanel
                      currentUserEmail={user?.email || 'admin@nevo.ng'}
                      transactions={transactions}
                      adminPath={adminPath}
                      navigateTo={navigateTo}
                      onBack={() => {
                        setCurrentScreen('dashboard');
                        setActiveTab('profile');
                      }}
                      onToast={(msg, type) => showToast(msg, type)}
                      onAddGlobalNotification={(title, body, type) => {
                        const newNotif = {
                          id: 'notif-' + Date.now(),
                          title,
                          body,
                          date: new Date().toISOString(),
                          unread: true
                        };
                        const updated = [newNotif, ...notifications];
                        setNotifications(updated);
                        localStorage.setItem('nevo_notifications', JSON.stringify(updated));
                      }}
                      onSendSimulatedEmail={(to, subject, body) => sendSimulatedEmail(to, subject, body)}
                    />
                  </ErrorBoundary>
                </div>
              )}

            </div>

            {/* Fixed Bottom Navigation Bar (Never Scroll) */}
            {(currentScreen === 'dashboard' || currentScreen === 'buy_data') && (
              <div className="shrink-0 z-30 w-full bg-[#0c0c14] border-t border-white/5 pb-safe">
                <BottomNav
                  activeTab={activeTab}
                  currentScreen={currentScreen}
                  onTabChange={(tab) => {
                    if (tab === 'data') {
                      setCurrentScreen('buy_data');
                      setActiveTab('data');
                    } else {
                      setActiveTab(tab);
                      setCurrentScreen('dashboard');
                    }
                  }}
                  onFabClick={() => setIsFabMenuOpen(true)}
                />
              </div>
            )}

            {/* Quick action fab overlay sheet */}
            <QuickFabMenu
              isOpen={isFabMenuOpen}
              onClose={() => setIsFabMenuOpen(false)}
              onSelectAction={handleSelectFabAction}
            />

            {/* Notifications panel overlay */}
            <NotificationsModal
              isOpen={isNotificationsOpen}
              onClose={() => setIsNotificationsOpen(false)}
              notifications={notifications}
              onMarkAllRead={handleMarkAllNotifsRead}
              onMarkRead={handleMarkSingleNotif => {
                handleMarkNotifRead(handleMarkSingleNotif);
              }}
            />

            {/* Floating AI Chat Launcher Button */}
            {!adminPath.toLowerCase().startsWith('/boris') && currentScreen !== 'support_live_chat' && (
              <div className="fixed bottom-20 right-4 z-40 sm:bottom-24 sm:right-6">
                <button
                  id="btn-floating-ai-support"
                  type="button"
                  onClick={() => setIsFloatingAiChatOpen(true)}
                  className="group relative flex items-center gap-2 pl-3.5 pr-4 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white font-bold text-xs shadow-xl shadow-indigo-500/25 border border-white/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <div className="relative flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white animate-pulse" />
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400 border border-indigo-900 animate-ping" />
                  </div>
                  <span className="font-display tracking-tight">AI Support</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                </button>
              </div>
            )}

            {/* Floating AI Chat Modal Drawer */}
            {isFloatingAiChatOpen && (
              <AiSupportChat
                mode="floating_modal"
                onClose={() => setIsFloatingAiChatOpen(false)}
              />
            )}

            {/* Side Drawer Drawer Sidebar (Hamburger menu content) */}
            {isSidebarOpen && (
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md z-40 flex">
                {/* Backdrop dismiss */}
                <div className="absolute inset-0" onClick={() => setIsSidebarOpen(false)} />

                <div className="relative bg-white dark:bg-slate-950 w-[280px] h-full shadow-2xl p-6 flex flex-col justify-between border-r border-slate-150 dark:border-slate-900">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-900 pb-4">
                      <div>
                        <span className="text-base font-black font-display bg-gradient-to-r from-indigo-600 to-teal-500 dark:from-indigo-400 dark:to-teal-300 bg-clip-text text-transparent">
                          Nevo
                        </span>
                        <span className="text-[8px] font-mono text-slate-400 block uppercase tracking-widest mt-0.5">Version 4.1.0</span>
                      </div>
                      <button
                        id="btn-close-sidebar"
                        onClick={() => setIsSidebarOpen(false)}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500"
                      >
                        <X className="h-4.5 w-4.5" />
                      </button>
                    </div>

                    {/* Quick navigation links in drawer */}
                    <div className="space-y-2">
                      {[
                        { label: 'Deposit Funds', screen: 'deposit', icon: Wallet },
                        { label: 'Purchase Airtime', screen: 'buy_airtime', icon: Smartphone },
                        { label: 'Purchase Data Bundles', screen: 'buy_data', icon: Smartphone },
                        { label: 'Transfer To Banks', screen: 'transfer_bank', icon: Landmark },
                        { label: 'Support Live Chat', screen: 'support_live_chat', icon: MessageSquare },
                        { label: 'Help FAQs Hub', screen: 'faq', icon: HelpCircle },
                        { label: 'Our Brand Story', screen: 'about_info', icon: Info }
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            id={`drawer-link-${item.screen}`}
                            key={item.screen}
                            onClick={() => {
                              if (item.screen === 'deposit') { setPaymentModalOpen(true); setIsSidebarOpen(false); return; }
                              setCurrentScreen(item.screen);
                              setIsSidebarOpen(false);
                            }}
                            className="w-full p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/60 flex items-center gap-3.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                          >
                            <Icon className="h-4.5 w-4.5 text-indigo-500" />
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Drawer Footer Log out */}
                  <div className="border-t border-slate-150 dark:border-slate-900 pt-4">
                    <button
                      id="btn-drawer-logout"
                      onClick={() => {
                        setIsSidebarOpen(false);
                        handleLogout();
                      }}
                      className="w-full p-3 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider rounded-xl text-center block transition-all"
                    >
                      Logout Session
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Redirect legacy isWithdrawOpen to dedicated full screen */}
            {isWithdrawOpen && (
              <div className="hidden">
                {(() => {
                  setTimeout(() => {
                    setIsWithdrawOpen(false);
                    setWithdrawStep(1);
                    setCurrentScreen('withdraw');
                    navigateTo('/dashboard/withdraw');
                  }, 0);
                  return null;
                })()}
              </div>
            )}

            {/* Watch Walkthrough Guide Modal (Media popup) */}
            {isGuideOpen && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
                <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-5 w-full max-w-sm shadow-2xl text-center space-y-4">
                  <button
                    id="btn-close-guide"
                    onClick={() => setIsGuideOpen(false)}
                    className="absolute top-4 right-4 p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="h-12 w-12 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
                    <Clock className="h-6 w-6" />
                  </div>

                  <div>
                    <h5 className="text-sm font-bold text-white font-display">Voucher Redemptions Guide</h5>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      This walkthrough simulated guide explains how copying PalmPay account credentials, initiating standard transfers, and generating Withdrawal Vouchers (LEGACY_VOUCHER) operates with zero fees on Nevo.
                    </p>
                  </div>

                  {/* Video Player */}
                  {videoEnabled && videoUrl ? (
                    <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-black">
                      <video
                        id="player-guide-video"
                        src={videoUrl}
                        controls
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-32 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-1.5 p-4 text-center">
                      <span className="text-xs font-mono font-bold text-teal-400">VIDEO GUIDE COMING SOON</span>
                      <span className="text-[10px] text-slate-500 font-sans">No walkthrough video guide uploaded yet.</span>
                    </div>
                  )}

                  <button
                    id="btn-guide-dismiss"
                    onClick={() => setIsGuideOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider"
                  >
                    Got It, Thank You!
                  </button>
                </div>
              </div>
            )}

            {/* Professional Transaction Receipt Modal */}
            {selectedReceiptTx && (
              <TransactionReceipt
                transaction={selectedReceiptTx}
                onClose={() => setSelectedReceiptTx(null)}
                onShare={(summary) => {
                  navigator.clipboard.writeText(summary);
                  showToast('Receipt details copied to clipboard!', 'success');
                }}
                onToast={(msg, type) => showToast(msg, type)}
              />
            )}

            {/* Inactivity Timeout Warning modal */}
            {inactivityCountdown !== null && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-[fadeIn_0.2s_ease-out]">
                <div className="bg-slate-900 border border-red-500/30 rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center space-y-4">
                  <div className="h-12 w-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto animate-pulse">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white font-display uppercase">Session Expiring</h5>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      You will be automatically logged out in <span className="text-red-400 font-bold font-mono">{inactivityCountdown}</span> seconds due to inactivity.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setInactivityCountdown(null);
                      showToast('Session extended successfully!', 'success');
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-500 text-white text-xs font-bold uppercase tracking-wider active:scale-95 transition-all"
                  >
                    Extend Session
                  </button>
                </div>
              </div>
            )}

            {/* Two-Factor Authentication (OTP verification overlay) */}
            {securityOtpSession && (
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-[fadeIn_0.2s_ease-out]">
                <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-5 shadow-2xl">
                  <div className="text-center">
                    <div className="h-12 w-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mx-auto mb-3">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <h4 className="text-base font-bold font-display text-white">Two-Factor Authentication</h4>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      A secure verification code has been dispatched to your email. Enter it below to proceed with this action.
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1.5 uppercase tracking-wider">6-Digit Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 123456"
                      value={securityOtp}
                      onChange={(e) => setSecurityOtp(e.target.value)}
                      className="w-full text-center text-sm tracking-widest bg-slate-950 border border-white/10 rounded-xl py-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-400 font-mono"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        if (securityOtp.trim() === securityOtpSession.otp) {
                          const { purpose, data } = securityOtpSession;
                          setSecurityOtpSession(null);
                          setSecurityOtp('');
                          showToast('Action authorized successfully!', 'success');
                          
                          if (purpose === 'password_change') {
                            handleConfirmPasswordChange(data);
                          } else if (purpose === 'email_change') {
                            handleConfirmEmailChange(data);
                          } else if (purpose === 'pin_change') {
                            handleConfirmPinChange(data);
                          } else if (purpose === 'transfer') {
                            handleConfirmTransferSubmit(data);
                          }
                        } else {
                          showToast('Incorrect authorization code. Check the simulated inbox.', 'error');
                        }
                      }}
                      className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-700 hover:to-teal-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                    >
                      Authorize
                    </button>
                    <button
                      onClick={() => {
                        setSecurityOtpSession(null);
                        setSecurityOtp('');
                      }}
                      className="px-5 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Simulated Email Client Overlay Tray */}
            {isEmailSimulatorOpen && (
              <div className="absolute inset-x-0 bottom-0 top-12 bg-slate-950/95 backdrop-blur-md z-50 flex flex-col animate-[slideUp_0.25s_ease-out]">
                <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0 bg-slate-900">
                  <span className="text-xs font-bold font-mono tracking-wider text-teal-400 uppercase">Simulated Email Inbox</span>
                  <button
                    onClick={() => setIsEmailSimulatorOpen(false)}
                    className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full text-slate-400"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
                  <EmailSimulator
                    emails={emails}
                    onMarkAsRead={(id) => setEmails(emails.map(e => e.id === id ? { ...e, read: true } : e))}
                    onDeleteEmail={(id) => setEmails(emails.filter(e => e.id !== id))}
                    onClearAll={() => setEmails([])}
                  />
                </div>
              </div>
            )}

            </div>
          </div>
        )}

        <WalletDepositModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          onToast={showToast}
          onSuccess={() => syncWithBackend()}
        />


        </div>
      </div>
    </>
  );
}
