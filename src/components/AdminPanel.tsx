import React, { useState, useEffect, useRef } from 'react';
import { Users, User, Mail, Phone, Building, CreditCard, Hash, Calendar, Check, Image, Coins, ShoppingBag, ShieldAlert, ArrowLeft, Search, UserMinus, ToggleLeft, ToggleRight, Trash2, Edit2, Key, RefreshCw, Send, FileSpreadsheet, BarChart3, Database, MessageSquare, AlertCircle, Video, Settings, DollarSign, CheckCircle, UploadCloud, Clock, ArrowUpRight, FileText, XCircle, AlertTriangle, Inbox, Menu, X, Globe, Megaphone, Save, Eye, Bot, Sparkles, HelpCircle, Headphones, MessageCircle, Zap } from 'lucide-react';
import GlassCard from './GlassCard';
import AdminDashboard1To1 from './AdminDashboard1To1';
import AdminSidebar from './AdminSidebar';
import { CyberWithdrawalTerminal } from './CyberWithdrawalTerminal';
import { PaymentAdminTab } from './PaymentAdminTab';
import { formatNaira } from '../utils/formatters';
import NivoAdminFeatures from './NivoAdminFeatures';

interface AdminPanelProps {
  currentUserEmail: string;
  transactions: any[];
  onBack: () => void;
  onToast: (msg: string, type: 'success' | 'info' | 'error') => void;
  onAddGlobalNotification: (title: string, body: string, type: string) => void;
  onSendSimulatedEmail: (to: string, subject: string, body: string) => void;
  adminPath?: string;
  navigateTo?: (path: string) => void;
}

// Robust, type-safe primitive and string conversion helpers
export const toSafeStr = (val: any): string => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (typeof val === 'object') {
    if (typeof val.email === 'string') return val.email;
    if (typeof val.username === 'string') return val.username;
    if (typeof val.name === 'string') return val.name;
    if (typeof val.code === 'string') return val.code;
    try {
      return JSON.stringify(val);
    } catch (e) {
      return '';
    }
  }
  return String(val);
};

export const toSafeLower = (val: any): string => {
  return toSafeStr(val).toLowerCase();
};

export const safeDateStr = (val: any): string => {
  if (!val) return '-';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return typeof val === 'string' ? val : '-';
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return typeof val === 'string' ? val : '-';
  }
};

export const normalizeVoucher = (v: any) => {
  if (!v || typeof v !== 'object') return null;
  const code = toSafeStr(v.voucherCode || v.vouchercode || v.code || v.id);
  return {
    ...v,
    id: toSafeStr(v.id || code),
    voucherCode: code,
    code: code,
    status: toSafeStr(v.status || 'unused'),
    usedBy: toSafeStr(v.usedBy || v.usedby),
    usedAt: toSafeStr(v.usedAt || v.usedat),
    purchasedBy: toSafeStr(v.purchasedBy || v.purchasedby),
    createdAt: toSafeStr(v.createdAt || v.createdat || v.generatedAt || v.generatedat),
    generatedAt: toSafeStr(v.generatedAt || v.generatedat || v.createdAt || v.createdat),
    amount: typeof v.amount === 'number' ? v.amount : Number(v.amount || 6500)
  };
};

export const normalizeUser = (u: any) => {
  if (!u || typeof u !== 'object') return null;
  return {
    ...u,
    id: toSafeStr(u.id),
    fullName: toSafeStr(u.fullName || u.fullname || u.name),
    email: toSafeStr(u.email),
    username: toSafeStr(u.username),
    phone: toSafeStr(u.phone),
    balance: typeof u.balance === 'number' ? u.balance : Number(u.balance || 0),
    isSuspended: Boolean(u.isSuspended),
    isFrozen: Boolean(u.isFrozen)
  };
};

export const normalizeWithdrawal = (w: any) => {
  if (!w || typeof w !== 'object') return null;
  const requested = typeof w.amount === 'number' ? w.amount : Number(w.amount || 0);
  const approved = typeof (w.approvedAmount ?? w.approvedamount) === 'number'
    ? (w.approvedAmount ?? w.approvedamount)
    : Number(w.approvedAmount || w.approvedamount || 0);
  const remaining = typeof (w.remainingAmount ?? w.remainingamount) === 'number'
    ? (w.remainingAmount ?? w.remainingamount)
    : Math.max(0, requested - approved);
  let hist = w.approvalHistory || w.approvalhistory || [];
  if (typeof hist === 'string') {
    try { hist = JSON.parse(hist); } catch (e) { hist = []; }
  }

  return {
    ...w,
    id: toSafeStr(w.id || w.reference),
    reference: toSafeStr(w.reference || w.id),
    accountName: toSafeStr(w.accountName || w.accountname),
    accountNumber: toSafeStr(w.accountNumber || w.accountnumber),
    bankName: toSafeStr(w.bankName || w.bankname),
    email: toSafeStr(w.email || w.userId),
    userId: toSafeStr(w.userId || w.email),
    status: toSafeStr(w.status || 'pending'),
    amount: requested,
    approvedAmount: approved,
    remainingAmount: remaining,
    approvalHistory: hist
  };
};

export const normalizePayment = (p: any) => {
  if (!p || typeof p !== 'object') return null;
  return {
    ...p,
    id: toSafeStr(p.id || p.reference),
    reference: toSafeStr(p.reference || p.id),
    userEmail: toSafeStr(p.userEmail || p.email || p.useremail),
    bankName: toSafeStr(p.bankName || p.bankname),
    accountNumber: toSafeStr(p.accountNumber || p.accountnumber),
    voucherCode: toSafeStr(p.voucherCode || p.vouchercode),
    status: toSafeStr(p.status || 'pending'),
    amount: typeof p.amount === 'number' ? p.amount : Number(p.amount || 0)
  };
};

export default function AdminPanel({
  currentUserEmail,
  transactions,
  onBack,
  onToast,
  onAddGlobalNotification,
  onSendSimulatedEmail,
  adminPath,
  navigateTo
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'voucher_generator' | 'payments' | 'withdrawals' | 'users' | 'settings' | 'security' | 'reports' | 'logs' | 'payment_settings' | 'ai_support' | 'nivo_rewards'>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // LEGACY_VOUCHER Virtual Payments State
  const [payments, setPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentSubTab, setPaymentSubTab] = useState<'gateways' | 'manual_legacyVoucher'>('gateways');
  
  // Withdrawal Management System State
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(false);
  const [withdrawalSearch, setWithdrawalSearch] = useState('');
  const [withdrawalStatusFilter, setWithdrawalStatusFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'rejected'>('all');
  const [withdrawalPage, setWithdrawalPage] = useState(1);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any | null>(null);
  const [loadingSelectedWithdrawal, setLoadingSelectedWithdrawal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [uploadingSlip, setUploadingSlip] = useState(false);
  const [isDraggingSlip, setIsDraggingSlip] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [approvingPartial, setApprovingPartial] = useState(false);
  const [removingSlip, setRemovingSlip] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'suspended' | 'frozen'>('all');
  const [userSortBy, setUserSortBy] = useState<'name' | 'balance_desc' | 'balance_asc' | 'email'>('balance_desc');
  const [userPage, setUserPage] = useState(1);
  const [selectedUserTab, setSelectedUserTab] = useState<'profile' | 'transactions' | 'withdrawals' | 'vouchers'>('profile');
  
  // Balance modification state
  const [editBalanceAmount, setEditBalanceAmount] = useState('');
  const [editUserFullName, setEditUserFullName] = useState('');

  // User Database Advanced State
  const [userFilterTab, setUserFilterTab] = useState<string>('all');
  const [selectedUserForView, setSelectedUserForView] = useState<any | null>(null);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<any | null>(null);
  const [selectedUserForBalance, setSelectedUserForBalance] = useState<any | null>(null);
  const [editUserFormData, setEditUserFormData] = useState<any>({
    fullName: '',
    email: '',
    phone: '',
    username: '',
    balance: '0',
    bonusBalance: '0',
    referralCount: '0',
    tier: '3',
    withdrawalStatus: 'Allowed',
    isSuspended: false,
    isFrozen: false,
    profilePic: ''
  });
  const [balanceActionData, setBalanceActionData] = useState<{ type: 'credit' | 'debit'; amount: string; narration: string }>({
    type: 'credit',
    amount: '',
    narration: ''
  });
  
  // Broadcast announcement state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastType, setBroadcastType] = useState('system');
  const [sendAsEmail, setSendAsEmail] = useState(true);

  // LEGACY_VOUCHER Payment Config fields
  const [legacyVoucherBankName, setLegacyVoucherBankName] = useState('PalmPay');
  const [legacyVoucherAccountNumber, setLegacyVoucherAccountNumber] = useState('8960723295');
  const [legacyVoucherAccountName, setLegacyVoucherAccountName] = useState('pwamunadi ishaku');
  const [legacyVoucherWhatsappLink, setLegacyVoucherWhatsappLink] = useState('https://wa.me/2349162845073');
  const [legacyVoucherWhatsappNumber, setLegacyVoucherWhatsappNumber] = useState('+2349162845073');
  const [legacyVoucherVoucherPrice, setLegacyVoucherVoucherPrice] = useState('6500');
  const [legacyVoucherInstructions, setLegacyVoucherInstructions] = useState('');
  const [legacyVoucherMaintenanceNotice, setLegacyVoucherMaintenanceNotice] = useState('');
  const [savingLegacyVoucherConfig, setSavingLegacyVoucherConfig] = useState(false);

  // System Master Settings State
  const [websiteName, setWebsiteName] = useState('Nevo');
  const [websiteLogo, setWebsiteLogo] = useState('');
  const [websiteFavicon, setWebsiteFavicon] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#0d9488');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const [loginEnabled, setLoginEnabled] = useState(true);
  const [withdrawalEnabled, setWithdrawalEnabled] = useState(true);
  const [transferEnabled, setTransferEnabled] = useState(true);
  const [airtimeEnabled, setAirtimeEnabled] = useState(true);
  const [dataEnabled, setDataEnabled] = useState(true);
  const [billsEnabled, setBillsEnabled] = useState(true);
  const [legacyVoucherEnabled, setLegacyVoucherEnabled] = useState(false);
  const [referralEnabled, setReferralEnabled] = useState(true);
  const [referralBonus, setReferralBonus] = useState('5000');
  const [registrationBonus, setRegistrationBonus] = useState('750');
  const [dailyWithdrawalLimit, setDailyWithdrawalLimit] = useState('1000000');
  const [minWithdrawal, setMinWithdrawal] = useState('5000');
  const [maxWithdrawal, setMaxWithdrawal] = useState('500000');
  const [withdrawalCharges, setWithdrawalCharges] = useState('100');
  const [currency, setCurrency] = useState('₦');
  const [timezone, setTimezone] = useState('Africa/Lagos');
  const [country, setCountry] = useState('Nigeria');
  const [scrollingAnnouncement, setScrollingAnnouncement] = useState('Welcome to Nevo! Fast and secure manual transactions with 24/7 support.');
  const [liveFeedText, setLiveFeedText] = useState('Verified live activity will appear here automatically.');
  const [welcomeMessage, setWelcomeMessage] = useState('Welcome to Nevo');
  const [dashboardBanner, setDashboardBanner] = useState('Manage your Nevo wallet, tasks, referrals and secure transactions');
  const [noticeBarText, setNoticeBarText] = useState('');
  const [paymentCountdown, setPaymentCountdown] = useState('900');
  const [paymentsEnabled, setPaymentsEnabled] = useState(true);

  // WhatsApp & Communication
  const [whatsappMessage, setWhatsappMessage] = useState('Hello Admin, I have made a wallet deposit via KoraPay.');
  const [telegramLink, setTelegramLink] = useState('https://t.me/nevo');
  const [facebookLink, setFacebookLink] = useState('');
  const [instagramLink, setInstagramLink] = useState('');
  const [xTwitterLink, setXTwitterLink] = useState('');
  const [tikTokLink, setTikTokLink] = useState('');

  // AI Support Settings & Analytics State
  const [aiSupportEnabled, setAiSupportEnabled] = useState(true);
  const [aiWelcomeMessage, setAiWelcomeMessage] = useState('Hello 👋 Welcome to Nevo Support. I am Nevo Assistant. How can I help you today?');
  const [aiSupportRules, setAiSupportRules] = useState('Provide friendly, professional level-1 customer support and fintech guidance.');
  const [aiCustomFaqs, setAiCustomFaqs] = useState<any[]>([]);
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');
  const [savingAiSettings, setSavingAiSettings] = useState(false);
  const [addingFaq, setAddingFaq] = useState(false);
  const [aiAnalytics, setAiAnalytics] = useState<any>({
    totalConversations: 0,
    failedResponses: 0,
    whatsappTransfers: 0,
    mostAskedQuestions: []
  });
  const [aiConversations, setAiConversations] = useState<any[]>([]);
  const [loadingAiConversations, setLoadingAiConversations] = useState(false);
  const [youtubeLink, setYouTubeLink] = useState('');

  // Customer Support & Content
  const [supportEmail, setSupportEmail] = useState('support@nevo.com');
  const [supportPhone, setSupportPhone] = useState('+2349162845073');
  const [whatsappNumber, setWhatsappNumber] = useState('+2349162845073');
  const [officeAddress, setOfficeAddress] = useState('Lagos, Nigeria');
  const [businessHours, setBusinessHours] = useState('24/7 Support');
  const [websiteUrl, setWebsiteUrl] = useState('https://nevo.com');
  const [privacyPolicy, setPrivacyPolicy] = useState('Nevo Privacy Policy details...');
  const [termsOfService, setTermsOfService] = useState('Nevo Terms of Service details...');
  const [aboutUs, setAboutUs] = useState('Nevo is a digital rewards and wallet platform built to give users simple, transparent ways to earn through verified tasks, referrals and other available opportunities.');
  const [contactUs, setContactUs] = useState('Contact support via WhatsApp or Email.');
  const [faqContent, setFaqContent] = useState('Frequently Asked Questions...');

  // Security Settings
  const [pinLoginEnabled, setPinLoginEnabled] = useState(true);
  const [biometricLoginEnabled, setBiometricLoginEnabled] = useState(true);
  const [passwordLoginEnabled, setPasswordLoginEnabled] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [maxLoginAttempts, setMaxLoginAttempts] = useState('5');
  const [deviceRestriction, setDeviceRestriction] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Voucher Specific
  const [voucherPrefix, setVoucherPrefix] = useState('LEGACY_VOUCHER');
  const [voucherLength, setVoucherLength] = useState('10');
  const [voucherValidity, setVoucherValidity] = useState('30 Days');

  // Withdrawal Account
  const [withdrawBankName, setWithdrawBankName] = useState('PalmPay');
  const [withdrawAccountName, setWithdrawAccountName] = useState('Nevo Admin');
  const [withdrawAccountNumber, setWithdrawAccountNumber] = useState('8960723295');
  const [withdrawalInstructions, setWithdrawalInstructions] = useState('Withdrawals are processed manually within 1-2 hours upon approval.');

  // Dynamic Admin & Recovery Settings
  const [senderName, setSenderName] = useState('Nevo');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [recoveryEnabled, setRecoveryEnabled] = useState(true);
  const [smsRecoveryEnabled, setSmsRecoveryEnabled] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [deletingVideo, setDeletingVideo] = useState(false);

  // Diagnostic Logs state
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // LEGACY_VOUCHER Voucher Management state
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [voucherSearchTerm, setVoucherSearchTerm] = useState('');
  const [generatingVoucher, setGeneratingVoucher] = useState(false);

  const safeDateStr = (val: any, type: 'datetime' | 'date' | 'time' = 'datetime') => {
    if (!val || val === 'null' || val === 'undefined' || val === 'N/A') return 'N/A';
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return 'N/A';
      if (type === 'date') return d.toLocaleDateString();
      if (type === 'time') return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return d.toLocaleString();
    } catch (e) {
      return 'N/A';
    }
  };

  const getAdminHeaders = (extraHeaders = {}) => {
    const token = localStorage.getItem('nevo_admin_token') || '';
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...extraHeaders
    };
  };

  // Fetch users from server on mount
  const fetchAllUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users', {
        headers: getAdminHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        const rawUsers = Array.isArray(data?.users) ? data.users : [];
        setUsers(rawUsers.map(normalizeUser).filter(Boolean));
      } else {
        onToast('Failed to fetch user database', 'error');
      }
    } catch (err) {
      onToast('Network error loading admin panel', 'error');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch('/api/admin/logs', {
        headers: getAdminHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Error loading logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleClearLogs = async () => {
    try {
      const res = await fetch('/api/admin/logs/clear', { 
        method: 'POST',
        headers: getAdminHeaders()
      });
      if (res.ok) {
        setLogs([]);
        onToast('Diagnostic logs cleared successfully', 'success');
      }
    } catch (err) {
      onToast('Failed to clear logs', 'error');
    }
  };

  const fetchLegacyVoucherConfig = async () => {
    try {
      const res = await fetch('/api/config/legacyVoucher');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.config) {
          setLegacyVoucherBankName(data.config.bankName || 'PalmPay');
          setLegacyVoucherAccountNumber(data.config.accountNumber || '8960723295');
          setLegacyVoucherAccountName(data.config.accountName || 'pwamunadi ishaku');
          const waLink = data.config.whatsappLink || 'https://wa.me/2349162845073';
          setLegacyVoucherWhatsappLink(waLink);
          const waNum = data.config.whatsappNumber || (waLink.includes('wa.me/') ? '+' + waLink.split('wa.me/')[1] : waLink);
          setLegacyVoucherWhatsappNumber(waNum);
          setLegacyVoucherVoucherPrice(String(data.config.voucherPrice ?? 6500));
          setLegacyVoucherInstructions(data.config.instructions || "Transfer only the exact amount shown. After payment, click 'I Have Made This Transfer' and contact support on WhatsApp.");
          setLegacyVoucherMaintenanceNotice(data.config.maintenanceNotice || 'Payments are verified manually within a few minutes.');
        }
      }
    } catch (err) {
      console.error('Error fetching LEGACY_VOUCHER config:', err);
    }
  };

  const handleSaveLegacyVoucherConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingLegacyVoucherConfig(true);

    let waLink = legacyVoucherWhatsappLink;
    let waNum = legacyVoucherWhatsappNumber;
    if (waNum) {
      if (waNum.startsWith('http')) {
        waLink = waNum;
        waNum = waNum.replace('https://wa.me/', '+');
      } else {
        const cleanNum = waNum.replace(/\D/g, '');
        const intlNum = cleanNum.startsWith('0') ? '234' + cleanNum.slice(1) : cleanNum;
        waLink = `https://wa.me/${intlNum}`;
      }
    }

    try {
      const res = await fetch('/api/admin/config/legacyVoucher', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          bankName: legacyVoucherBankName,
          accountNumber: legacyVoucherAccountNumber,
          accountName: legacyVoucherAccountName,
          whatsappNumber: waNum,
          whatsappLink: waLink,
          voucherPrice: Number(legacyVoucherVoucherPrice),
          instructions: legacyVoucherInstructions,
          maintenanceNotice: legacyVoucherMaintenanceNotice
        })
      });
      if (res.ok) {
        onToast('LEGACY_VOUCHER Payment Account settings saved to database and live on website!', 'success');
        fetchLegacyVoucherConfig();
      } else {
        onToast('Failed to save LEGACY_VOUCHER payment account configuration', 'error');
      }
    } catch (err) {
      onToast('Network error saving configuration', 'error');
    } finally {
      setSavingLegacyVoucherConfig(false);
    }
  };

  const fetchAdminSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings', {
        headers: getAdminHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.settings) {
          const s = data.settings;
          if (s.supportEmail) setSupportEmail(s.supportEmail);
          if (s.supportPhone) setSupportPhone(s.supportPhone);
          if (s.whatsappNumber) setWhatsappNumber(s.whatsappNumber);
          if (s.senderName) setSenderName(s.senderName);
          if (s.videoUrl) setVideoUrl(s.videoUrl);
          if (s.videoEnabled) setVideoEnabled(s.videoEnabled === 'true');
          if (s.recoveryEnabled) setRecoveryEnabled(s.recoveryEnabled === 'true');
          if (s.smsRecoveryEnabled) setSmsRecoveryEnabled(s.smsRecoveryEnabled === 'true');

          setWebsiteName('Nevo');
          if (s.websiteLogo) setWebsiteLogo(s.websiteLogo);
          if (s.websiteFavicon) setWebsiteFavicon(s.websiteFavicon);
          if (s.primaryColor) setPrimaryColor(s.primaryColor);
          if (s.maintenanceMode) setMaintenanceMode(s.maintenanceMode === 'true');
          if (s.registrationEnabled) setRegistrationEnabled(s.registrationEnabled === 'true');
          if (s.loginEnabled) setLoginEnabled(s.loginEnabled === 'true');
          if (s.withdrawalEnabled) setWithdrawalEnabled(s.withdrawalEnabled === 'true');
          if (s.transferEnabled) setTransferEnabled(s.transferEnabled === 'true');
          if (s.airtimeEnabled) setAirtimeEnabled(s.airtimeEnabled === 'true');
          if (s.dataEnabled) setDataEnabled(s.dataEnabled === 'true');
          if (s.billsEnabled) setBillsEnabled(s.billsEnabled === 'true');
          setLegacyVoucherEnabled(false);
          if (s.referralEnabled) setReferralEnabled(s.referralEnabled === 'true');
          if (s.referralBonus) setReferralBonus(s.referralBonus);
          if (s.registrationBonus) setRegistrationBonus(s.registrationBonus);
          if (s.dailyWithdrawalLimit) setDailyWithdrawalLimit(s.dailyWithdrawalLimit);
          if (s.minWithdrawal) setMinWithdrawal(s.minWithdrawal);
          if (s.maxWithdrawal) setMaxWithdrawal(s.maxWithdrawal);
          if (s.withdrawalCharges) setWithdrawalCharges(s.withdrawalCharges);
          if (s.currency) setCurrency(s.currency);
          if (s.timezone) setTimezone(s.timezone);
          if (s.country) setCountry(s.country);
          if (s.scrollingAnnouncement) setScrollingAnnouncement(s.scrollingAnnouncement);
          if (s.liveFeedText) setLiveFeedText(s.liveFeedText);
          if (s.welcomeMessage) setWelcomeMessage(s.welcomeMessage);
          if (s.dashboardBanner) setDashboardBanner(s.dashboardBanner);
          if (s.noticeBarText) setNoticeBarText(s.noticeBarText);
          if (s.paymentCountdown) setPaymentCountdown(s.paymentCountdown);
          if (s.paymentsEnabled) setPaymentsEnabled(s.paymentsEnabled === 'true');

          if (s.whatsappMessage) setWhatsappMessage(s.whatsappMessage);
          if (s.telegramLink) setTelegramLink(s.telegramLink);
          if (s.facebookLink) setFacebookLink(s.facebookLink);
          if (s.instagramLink) setInstagramLink(s.instagramLink);
          if (s.xTwitterLink) setXTwitterLink(s.xTwitterLink);
          if (s.tikTokLink) setTikTokLink(s.tikTokLink);
          if (s.youtubeLink) setYouTubeLink(s.youtubeLink);

          if (s.officeAddress) setOfficeAddress(s.officeAddress);
          if (s.businessHours) setBusinessHours(s.businessHours);
          if (s.websiteUrl) setWebsiteUrl(s.websiteUrl);
          if (s.privacyPolicy) setPrivacyPolicy(s.privacyPolicy);
          if (s.termsOfService) setTermsOfService(s.termsOfService);
          if (s.aboutUs) setAboutUs(s.aboutUs);
          if (s.contactUs) setContactUs(s.contactUs);
          if (s.faqContent) setFaqContent(s.faqContent);

          if (s.pinLoginEnabled) setPinLoginEnabled(s.pinLoginEnabled === 'true');
          if (s.biometricLoginEnabled) setBiometricLoginEnabled(s.biometricLoginEnabled === 'true');
          if (s.passwordLoginEnabled) setPasswordLoginEnabled(s.passwordLoginEnabled === 'true');
          if (s.sessionTimeout) setSessionTimeout(s.sessionTimeout);
          if (s.maxLoginAttempts) setMaxLoginAttempts(s.maxLoginAttempts);
          if (s.deviceRestriction) setDeviceRestriction(s.deviceRestriction === 'true');
          if (s.twoFactorEnabled) setTwoFactorEnabled(s.twoFactorEnabled === 'true');

          if (s.voucherPrefix) setVoucherPrefix(s.voucherPrefix);
          if (s.voucherLength) setVoucherLength(s.voucherLength);
          if (s.voucherValidity) setVoucherValidity(s.voucherValidity);

          if (s.withdrawBankName) setWithdrawBankName(s.withdrawBankName);
          if (s.withdrawAccountName) setWithdrawAccountName(s.withdrawAccountName);
          if (s.withdrawAccountNumber) setWithdrawAccountNumber(s.withdrawAccountNumber);
          if (s.withdrawalInstructions) setWithdrawalInstructions(s.withdrawalInstructions);
        }
      }
    } catch (err) {
      console.error('Error fetching admin settings:', err);
    }
  };

  const handleSaveAdminSettings = async (e?: React.FormEvent, overrideSettings?: Record<string, string>) => {
    if (e) e.preventDefault();
    setSavingSettings(true);
    try {
      const settingsToSave = overrideSettings || {
        supportEmail,
        supportPhone,
        whatsappNumber,
        senderName,
        videoUrl,
        videoEnabled: String(videoEnabled),
        recoveryEnabled: String(recoveryEnabled),
        smsRecoveryEnabled: String(smsRecoveryEnabled),

        websiteName: 'Nevo',
        websiteLogo,
        websiteFavicon,
        primaryColor,
        maintenanceMode: String(maintenanceMode),
        registrationEnabled: String(registrationEnabled),
        loginEnabled: String(loginEnabled),
        withdrawalEnabled: String(withdrawalEnabled),
        transferEnabled: String(transferEnabled),
        airtimeEnabled: String(airtimeEnabled),
        dataEnabled: String(dataEnabled),
        billsEnabled: String(billsEnabled),
        legacyVoucherEnabled: 'false',
        referralEnabled: String(referralEnabled),
        referralBonus,
        registrationBonus,
        dailyWithdrawalLimit,
        minWithdrawal,
        maxWithdrawal,
        withdrawalCharges,
        currency,
        timezone,
        country,
        scrollingAnnouncement,
        liveFeedText,
        welcomeMessage,
        dashboardBanner,
        noticeBarText,
        paymentCountdown,
        paymentsEnabled: String(paymentsEnabled),

        whatsappMessage,
        telegramLink,
        facebookLink,
        instagramLink,
        xTwitterLink,
        tikTokLink,
        youtubeLink,

        officeAddress,
        businessHours,
        websiteUrl,
        privacyPolicy,
        termsOfService,
        aboutUs,
        contactUs,
        faqContent,

        pinLoginEnabled: String(pinLoginEnabled),
        biometricLoginEnabled: String(biometricLoginEnabled),
        passwordLoginEnabled: String(passwordLoginEnabled),
        sessionTimeout,
        maxLoginAttempts,
        deviceRestriction: String(deviceRestriction),
        twoFactorEnabled: String(twoFactorEnabled),

        voucherPrefix,
        voucherLength,
        voucherValidity,

        withdrawBankName,
        withdrawAccountName,
        withdrawAccountNumber,
        withdrawalInstructions
      };
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ settings: settingsToSave })
      });
      if (res.ok) {
        onToast('Master Admin Settings saved and live across website!', 'success');
        fetchAdminSettings();
        window.dispatchEvent(new Event('settingsUpdated'));
      } else {
        onToast('Failed to save admin settings', 'error');
      }
    } catch (err) {
      onToast('Network error saving settings', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleVideoUpload = async (file: File) => {
    setUploadingVideo(true);
    try {
      const formData = new FormData();
      formData.append('video', file);

      const res = await fetch('/api/admin/video/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('nevo_admin_token') || ''}`
        },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          onToast('Walkthrough video uploaded successfully!', 'success');
          setVideoUrl(data.videoUrl);
          fetchAdminSettings();
        } else {
          onToast(data.message || 'Failed to upload video', 'error');
        }
      } else {
        onToast('Failed to upload video (Ensure it is MP4, under 100MB)', 'error');
      }
    } catch (err) {
      console.error('Error uploading video:', err);
      onToast('Network error uploading video', 'error');
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleVideoDelete = async () => {
    if (!window.confirm('Are you sure you want to completely delete the video walkthrough guide?')) {
      return;
    }
    setDeletingVideo(true);
    try {
      const res = await fetch('/api/admin/video/delete', {
        method: 'POST',
        headers: getAdminHeaders()
      });

      if (res.ok) {
        onToast('Walkthrough video deleted from server', 'success');
        setVideoUrl('');
        fetchAdminSettings();
      } else {
        onToast('Failed to delete video', 'error');
      }
    } catch (err) {
      console.error('Error deleting video:', err);
      onToast('Network error deleting video', 'error');
    } finally {
      setDeletingVideo(false);
    }
  };

  React.useEffect(() => {
    fetchAllUsers();
    fetchLogs();
    fetchLegacyVoucherConfig();
    fetchAdminSettings();
    fetchVouchers();
    fetchWithdrawals();
    fetchPayments();
  }, []);

  // Keep overview metrics live while the admin dashboard is open.
  React.useEffect(() => {
    if (adminPath?.toLowerCase().startsWith('/boris/withdrawals/')) return;
    const interval = setInterval(() => {
      fetchAllUsers();
      fetchWithdrawals();
      fetchPayments();
    }, 5000);
    return () => clearInterval(interval);
  }, [adminPath]);

  const fetchPayments = async () => {
    setLoadingPayments(true);
    try {
      const res = await fetch('/api/admin/payments', {
        headers: getAdminHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        const rawPayments = Array.isArray(data?.payments) ? data.payments : [];
        setPayments(rawPayments.map(normalizePayment).filter(Boolean));
      } else {
        onToast('Failed to fetch virtual account payments', 'error');
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleAdminConfirmPayment = async (reference: string) => {
    try {
      const res = await fetch('/api/admin/payments/confirm', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ reference })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onToast(`Payment ${reference} verified! Voucher generated: ${data.voucherCode}`, 'success');
        fetchPayments();
        fetchVouchers();
      } else {
        onToast(data.error || 'Failed to confirm payment', 'error');
      }
    } catch (err) {
      onToast('Network error confirming payment', 'error');
    }
  };

  // Fetch all withdrawal requests
  const fetchWithdrawals = async () => {
    setLoadingWithdrawals(true);
    try {
      const res = await fetch('/api/admin/withdrawals', {
        headers: getAdminHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        const rawWithdrawals = Array.isArray(data?.withdrawals) ? data.withdrawals : [];
        setWithdrawals(rawWithdrawals.map(normalizeWithdrawal).filter(Boolean));
      } else {
        onToast('Failed to fetch withdrawal database', 'error');
      }
    } catch (err) {
      console.error('Error loading withdrawals:', err);
    } finally {
      setLoadingWithdrawals(false);
    }
  };

  // Fetch a single withdrawal details
  const fetchSelectedWithdrawalDetails = async (txId: string) => {
    setLoadingSelectedWithdrawal(true);
    try {
      const res = await fetch(`/api/admin/withdrawals/${txId}`, {
        headers: getAdminHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedWithdrawal(data.withdrawal);
        setAdminNotes(data.withdrawal?.notes || '');
      } else {
        onToast('Failed to fetch withdrawal request details', 'error');
      }
    } catch (err) {
      console.error('Error loading withdrawal details:', err);
    } finally {
      setLoadingSelectedWithdrawal(false);
    }
  };

  // Detect and handle SPA Details routing
  const isDetailsPage = adminPath?.toLowerCase().startsWith('/boris/withdrawals/');
  const selectedTxId = isDetailsPage ? adminPath?.split('/').pop() : null;

  useEffect(() => {
    if (selectedTxId) {
      fetchSelectedWithdrawalDetails(selectedTxId);
      // Poll every 5 seconds for single transaction view live status updates
      const interval = setInterval(() => {
        fetchSelectedWithdrawalDetails(selectedTxId);
      }, 5000);
      return () => clearInterval(interval);
    } else {
      setSelectedWithdrawal(null);
    }
  }, [selectedTxId]);

  // General list real-time polling updates when tab is withdrawals
  useEffect(() => {
    if (activeTab === 'withdrawals' && !isDetailsPage) {
      fetchWithdrawals();
      const interval = setInterval(fetchWithdrawals, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab, isDetailsPage]);

  // AI Support Data Fetching
  const fetchAiSupportSettings = async () => {
    try {
      const res = await fetch('/api/admin/ai-settings', {
        headers: getAdminHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setAiSupportEnabled(data.aiSupportEnabled !== false);
        if (data.aiWelcomeMessage) setAiWelcomeMessage(data.aiWelcomeMessage);
        if (data.aiSupportRules) setAiSupportRules(data.aiSupportRules);
        if (Array.isArray(data.customFaqs)) setAiCustomFaqs(data.customFaqs);
        if (data.analytics) setAiAnalytics(data.analytics);
      }
    } catch (e) {
      console.error('Error fetching AI support settings:', e);
    }
  };

  const fetchAiConversations = async () => {
    setLoadingAiConversations(true);
    try {
      const res = await fetch('/api/admin/ai-conversations', {
        headers: getAdminHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setAiConversations(data.logs || []);
      }
    } catch (e) {
      console.error('Error fetching AI conversations:', e);
    } finally {
      setLoadingAiConversations(false);
    }
  };

  const handleSaveAiSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAiSettings(true);
    try {
      const res = await fetch('/api/admin/ai-settings', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          aiSupportEnabled,
          aiWelcomeMessage,
          aiSupportRules,
          whatsappNumber: legacyVoucherWhatsappNumber,
          whatsappLink: legacyVoucherWhatsappLink
        })
      });
      if (res.ok) {
        onToast('AI Support Settings updated and published!', 'success');
        fetchAiSupportSettings();
      } else {
        onToast('Failed to save AI settings', 'error');
      }
    } catch (e) {
      onToast('Error saving AI settings', 'error');
    } finally {
      setSavingAiSettings(false);
    }
  };

  const handleAddCustomFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) {
      onToast('Question and Answer are required for custom FAQ.', 'error');
      return;
    }
    setAddingFaq(true);
    try {
      const res = await fetch('/api/admin/ai-faqs', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          question: newFaqQuestion.trim(),
          answer: newFaqAnswer.trim()
        })
      });
      if (res.ok) {
        onToast('Custom FAQ added to AI Knowledge Base!', 'success');
        setNewFaqQuestion('');
        setNewFaqAnswer('');
        fetchAiSupportSettings();
      } else {
        onToast('Failed to add custom FAQ', 'error');
      }
    } catch (e) {
      onToast('Error adding custom FAQ', 'error');
    } finally {
      setAddingFaq(false);
    }
  };

  const handleDeleteCustomFaq = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/ai-faqs/${id}`, {
        method: 'DELETE',
        headers: getAdminHeaders()
      });
      if (res.ok) {
        onToast('Custom FAQ deleted from AI Knowledge Base.', 'success');
        fetchAiSupportSettings();
      } else {
        onToast('Failed to delete FAQ', 'error');
      }
    } catch (e) {
      onToast('Error deleting FAQ', 'error');
    }
  };

  useEffect(() => {
    if (activeTab === 'ai_support') {
      fetchAiSupportSettings();
      fetchAiConversations();
    }
  }, [activeTab]);

  // Update withdrawal status (pending, processing, completed, rejected) with loading states
  const updateWithdrawalStatus = async (status: string) => {
    if (!selectedWithdrawal) return;
    setStatusUpdating(status);
    try {
      const res = await fetch(`/api/admin/withdrawals/${selectedWithdrawal.id}/status`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ status, notes: adminNotes })
      });
      if (res.ok) {
        onToast(`Withdrawal status updated to ${status}`, 'success');
        await fetchSelectedWithdrawalDetails(selectedWithdrawal.id);
        await fetchWithdrawals();
      } else {
        const err = await res.json();
        onToast(err.error || 'Failed to update withdrawal status', 'error');
      }
    } catch (err) {
      onToast('Network error updating status', 'error');
    } finally {
      setStatusUpdating(null);
    }
  };

  // Approve partial withdrawal amount
  const approvePartialWithdrawal = async (amount: number, note?: string) => {
    if (!selectedWithdrawal) return false;
    setApprovingPartial(true);
    try {
      const res = await fetch(`/api/admin/withdrawals/${selectedWithdrawal.id}/approve-partial`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ amount, note: note || '' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onToast(data.message || `Successfully approved partial amount of ₦${amount.toLocaleString()}`, 'success');
        await fetchSelectedWithdrawalDetails(selectedWithdrawal.id);
        await fetchWithdrawals();
        return true;
      } else {
        onToast(data.error || 'Failed to approve partial withdrawal', 'error');
        return false;
      }
    } catch (err) {
      onToast('Network error approving partial amount', 'error');
      return false;
    } finally {
      setApprovingPartial(false);
    }
  };
  const handleRemoveSlip = async () => {
    if (!selectedWithdrawal) return;
    setRemovingSlip(true);
    try {
      const token = localStorage.getItem('nevo_admin_token') || '';
      const res = await fetch(`/api/admin/withdrawals/${selectedWithdrawal.id}/remove-slip`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        onToast('POS Decline Slip removed successfully', 'success');
        await fetchSelectedWithdrawalDetails(selectedWithdrawal.id);
      } else {
        const err = await res.json();
        onToast(err.error || 'Failed to remove POS slip', 'error');
      }
    } catch (err) {
      onToast('Network error removing POS slip', 'error');
    } finally {
      setRemovingSlip(false);
    }
  };

  // Update withdrawal internal notes only
  const saveInternalNotes = async () => {
    if (!selectedWithdrawal) return;
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/admin/withdrawals/${selectedWithdrawal.id}/notes`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ notes: adminNotes })
      });
      if (res.ok) {
        onToast('Internal notes saved securely', 'success');
        setSelectedWithdrawal(prev => prev ? { ...prev, notes: adminNotes } : null);
      } else {
        onToast('Failed to save notes', 'error');
      }
    } catch (err) {
      onToast('Network error saving notes', 'error');
    } finally {
      setSavingNotes(false);
    }
  };

  // Upload POS decline slip
  const handleSlipFileUpload = async (file: File) => {
    if (!selectedWithdrawal) return;
    if (file.size > 10 * 1024 * 1024) {
      onToast('File exceeds the 10 MB maximum size limit', 'error');
      return;
    }
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['png', 'jpg', 'jpeg', 'pdf'].includes(ext || '')) {
      onToast('Only PNG, JPG, JPEG, and PDF files are allowed', 'error');
      return;
    }

    setUploadingSlip(true);
    try {
      const formData = new FormData();
      formData.append('slip', file);

      const token = localStorage.getItem('nevo_admin_token') || '';
      const res = await fetch(`/api/admin/withdrawals/${selectedWithdrawal.id}/upload-slip`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        onToast('POS Decline Slip uploaded successfully', 'success');
        fetchSelectedWithdrawalDetails(selectedWithdrawal.id);
      } else {
        const err = await res.json();
        onToast(err.error || 'Failed to upload POS slip', 'error');
      }
    } catch (err) {
      onToast('Network error uploading slip', 'error');
    } finally {
      setUploadingSlip(false);
    }
  };

  const fetchVouchers = async () => {
    setLoadingVouchers(true);
    try {
      const res = await fetch('/api/admin/legacyVoucher', {
        headers: getAdminHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        const raw = Array.isArray(data?.vouchers) ? data.vouchers : [];
        setVouchers(raw.map(normalizeVoucher).filter(Boolean));
      } else {
        // Fallback to existing path if custom route isn't loaded yet
        const fallbackRes = await fetch('/api/admin/vouchers', {
          headers: getAdminHeaders()
        });
        if (fallbackRes.ok) {
          const data = await fallbackRes.json();
          const raw = Array.isArray(data?.vouchers) ? data.vouchers : [];
          setVouchers(raw.map(normalizeVoucher).filter(Boolean));
        } else {
          onToast('Failed to fetch LEGACY_VOUCHER vouchers', 'error');
        }
      }
    } catch (err) {
      console.error('Error loading LEGACY_VOUCHER vouchers:', err);
      onToast('Network error loading LEGACY_VOUCHER vouchers', 'error');
    } finally {
      setLoadingVouchers(false);
    }
  };

  const handleGenerateVoucher = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setGeneratingVoucher(true);
    try {
      const res = await fetch('/api/admin/legacyVoucher/generate', {
        method: 'POST',
        headers: getAdminHeaders()
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch (pErr) {
        console.error('Failed to parse voucher generation response JSON:', pErr);
      }

      if (res.ok && data?.success) {
        const rawNew = data.voucher || (data.code ? {
          id: 'v-' + Date.now(),
          code: data.code,
          voucherCode: data.code,
          status: 'unused',
          createdAt: new Date().toISOString(),
          generatedAt: new Date().toISOString(),
          usedBy: '',
          usedAt: ''
        } : null);

        const newVoucher = normalizeVoucher(rawNew);
        const codeDisplay = newVoucher?.voucherCode || newVoucher?.code || data.code || 'Code';
        onToast(`New LEGACY_VOUCHER voucher generated: ${codeDisplay}`, 'success');

        if (newVoucher) {
          setVouchers(prev => {
            const list = Array.isArray(prev) ? prev : [];
            const filtered = list.filter(v => v && v.id !== newVoucher.id && (v.voucherCode || v.code) !== codeDisplay);
            return [newVoucher, ...filtered];
          });
        }
        await fetchVouchers();
      } else {
        onToast(data?.error || 'Failed to generate voucher', 'error');
      }
    } catch (err) {
      console.error('Error generating LEGACY_VOUCHER voucher:', err);
      onToast('Network error generating voucher', 'error');
    } finally {
      setGeneratingVoucher(false);
    }
  };

  const handleDeleteVoucher = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this voucher from the database?')) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/legacyVoucher/${id}`, {
        method: 'DELETE',
        headers: getAdminHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        onToast('Voucher permanently deleted.', 'success');
        fetchVouchers();
      } else {
        // Fallback to POST delete if needed
        const fallbackRes = await fetch('/api/admin/vouchers/delete', {
          method: 'POST',
          headers: getAdminHeaders(),
          body: JSON.stringify({ id })
        });
        if (fallbackRes.ok) {
          onToast('Voucher permanently deleted.', 'success');
          fetchVouchers();
        } else {
          onToast(data.error || 'Failed to delete voucher', 'error');
        }
      }
    } catch (err) {
      onToast('Network error deleting voucher', 'error');
    }
  };

  const handleDeactivateVoucher = async (id: string) => {
    if (!window.confirm('Are you sure you want to manually deactivate this voucher? This will permanently mark it as USED.')) {
      return;
    }
    try {
      const res = await fetch('/api/admin/vouchers/deactivate', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (res.ok) {
        onToast('Voucher successfully deactivated.', 'success');
        fetchVouchers();
      } else {
        onToast(data.error || 'Failed to deactivate voucher', 'error');
      }
    } catch (err) {
      onToast('Network error deactivating voucher', 'error');
    }
  };

  // Filter and process users
  const filteredUsers = (Array.isArray(users) ? users : []).filter(u => {
    if (!u) return false;
    const term = toSafeLower(searchTerm);
    return toSafeLower(u.fullName).includes(term) ||
           toSafeLower(u.email).includes(term) ||
           toSafeLower(u.username).includes(term) ||
           toSafeLower(u.phone).includes(term);
  });

  const processedUsers = (Array.isArray(users) ? users : []).filter(u => {
    if (!u) return false;
    const q = toSafeLower(searchTerm);
    const name = toSafeLower(u.fullName);
    const email = toSafeLower(u.email);
    const uname = toSafeLower(u.username);
    const phone = toSafeLower(u.phone);
    const id = toSafeLower(u.id);

    const matchesSearch = !q || name.includes(q) || email.includes(q) || uname.includes(q) || phone.includes(q) || id.includes(q);
    if (!matchesSearch) return false;

    if (userFilterTab === 'active') return !u.isSuspended && !u.isFrozen;
    if (userFilterTab === 'suspended') return u.isSuspended;
    if (userFilterTab === 'blocked') return u.withdrawalStatus === 'Blocked' || u.isFrozen;
    if (userFilterTab === 'verified') return !u.isSuspended && !u.isFrozen;
    if (userFilterTab === 'pending') return u.isFrozen;

    return true;
  }).sort((a, b) => {
    if (userFilterTab === 'newest') return new Date(b?.registeredAt || 0).getTime() - new Date(a?.registeredAt || 0).getTime();
    if (userFilterTab === 'oldest') return new Date(a?.registeredAt || 0).getTime() - new Date(b?.registeredAt || 0).getTime();
    if (userFilterTab === 'highest_balance') return (b?.balance || 0) - (a?.balance || 0);
    if (userFilterTab === 'lowest_balance') return (a?.balance || 0) - (a?.balance || 0);
    return 0;
  });

  // Filter vouchers
  const filteredVouchers = (Array.isArray(vouchers) ? vouchers : []).filter(v => {
    if (!v) return false;
    const term = toSafeLower(voucherSearchTerm);
    const code = toSafeLower(v.voucherCode || v.code);
    const status = toSafeLower(v.status);
    const usedBy = toSafeLower(v.usedBy);
    const purchasedBy = toSafeLower(v.purchasedBy);
    return code.includes(term) || status.includes(term) || usedBy.includes(term) || purchasedBy.includes(term);
  });

  // Calculate admin statistics
  const totalUsersCount = users.length;
  const activeUsersCount = users.filter(u => !u.isSuspended).length;
  const suspendedUsersCount = users.filter(u => u.isSuspended).length;
  const frozenUsersCount = users.filter(u => u.isFrozen).length;
  const totalSystemBalance = users.reduce((sum, u) => sum + (u.balance || 0), 0);
  
  const airtimeTxs = transactions.filter(t => t.type === 'redeem_airtime');
  const transferTxs = transactions.filter(t => t.type === 'bank_transfer_direct' || t.type === 'withdraw');
  const legacyVoucherTxs = transactions.filter(t => t.type === 'buy_legacyVoucher');
  

  // User database modifiers
  const handleUpdateUserStatus = async (email: string, field: 'isSuspended' | 'isFrozen', val: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/update-status`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ email, field, value: val })
      });
      if (res.ok) {
        onToast(`User status updated successfully`, 'success');
        fetchAllUsers();
        if (selectedUser && selectedUser.email === email) {
          setSelectedUser({ ...selectedUser, [field]: val });
        }
        // Send email alert to user (simulated)
        onSendSimulatedEmail(
          email,
          'Security Update: Account Status Modified',
          `Hello, \n\nAn administrator has updated your Nevo security status.\nParameter: ${field}\nNew Value: ${val ? 'TRUE (Active constraint applied)' : 'FALSE (Restored to default)'}\n\nIf you believe this was an error, contact premium support.`
        );
      } else {
        onToast('Failed to update user parameters', 'error');
      }
    } catch (e) {
      onToast('Error updating status', 'error');
    }
  };

  const handleEditWalletBalance = async (email: string) => {
    const amt = parseFloat(editBalanceAmount);
    if (isNaN(amt)) {
      onToast('Enter a valid numerical amount', 'error');
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/edit-balance`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ email, balance: amt })
      });
      if (res.ok) {
        onToast(`Wallet balance successfully adjusted!`, 'success');
        setEditBalanceAmount('');
        fetchAllUsers();
        if (selectedUser && selectedUser.email === email) {
          setSelectedUser({ ...selectedUser, balance: amt });
        }
        // Send email notification
        onSendSimulatedEmail(
          email,
          'Wallet Credit/Debit Transaction Authorized',
          `Hello, \n\nYour Nevo wallet has been adjusted by an administrator.\nNew Wallet Balance: ₦${amt.toLocaleString()}\n\nThank you for choosing Nevo!`
        );
      } else {
        onToast('Failed to edit balance', 'error');
      }
    } catch (e) {
      onToast('Error updating balance', 'error');
    }
  };

  const handleAdminResetPassword = async (email: string) => {
    try {
      const res = await fetch(`/api/admin/users/reset-password`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        onToast('Temporary password "NevoAdmin99!" dispatched to user email', 'success');
        onSendSimulatedEmail(
          email,
          'Nevo: Account Credentials Reset by Admin',
          `Hello, \n\nAn administrator has reset your password.\nYour temporary password is: NevoAdmin99!\n\nPlease log in immediately and update your security settings.`
        );
      } else {
        onToast('Failed to reset password', 'error');
      }
    } catch (e) {
      onToast('Error resetting password', 'error');
    }
  };

  const handleAdminResetPin = async (email: string) => {
    try {
      const res = await fetch(`/api/admin/users/reset-pin`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        onToast('User security PIN reset successfully!', 'success');
        fetchAllUsers();
        if (selectedUser && selectedUser.email === email) {
          setSelectedUser({ ...selectedUser, pinCreated: false });
        }
        onSendSimulatedEmail(
          email,
          'Security Update: Security PIN Reset by Admin',
          `Hello, \n\nAn administrator has reset your 4-digit security PIN.\n\nYou can set a new security PIN during your next wallet transaction or profile session.`
        );
      } else {
        onToast('Failed to reset security PIN', 'error');
      }
    } catch (e) {
      onToast('Error resetting PIN', 'error');
    }
  };

  const handleAdminDeleteAccount = async (email: string) => {
    if (email.toLowerCase() === currentUserEmail.toLowerCase()) {
      onToast('You cannot delete your own admin account!', 'error');
      return;
    }
    if (!window.confirm(`Are you absolutely sure you want to permanently delete account ${email}? This action is IRREVERSIBLE.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/delete`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        onToast('User account successfully deleted', 'success');
        setSelectedUser(null);
        fetchAllUsers();
      } else {
        onToast('Failed to delete account', 'error');
      }
    } catch (e) {
      onToast('Error deleting user', 'error');
    }
  };

  const handleSaveUserEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;
    try {
      const res = await fetch('/api/admin/users/edit', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          email: selectedUserForEdit.email,
          updatedData: {
            fullName: editUserFormData.fullName,
            phone: editUserFormData.phone,
            username: editUserFormData.username,
            balance: Number(editUserFormData.balance),
            bonusBalance: Number(editUserFormData.bonusBalance),
            referralCount: Number(editUserFormData.referralCount),
            tier: Number(editUserFormData.tier),
            withdrawalStatus: editUserFormData.withdrawalStatus,
            withdrawalBlocked: editUserFormData.withdrawalStatus === 'Blocked',
            isSuspended: editUserFormData.isSuspended,
            isFrozen: editUserFormData.isFrozen,
            profilePic: editUserFormData.profilePic
          }
        })
      });
      if (res.ok) {
        onToast(`User account record for ${editUserFormData.fullName} updated!`, 'success');
        setSelectedUserForEdit(null);
        fetchAllUsers();
      } else {
        onToast('Failed to save user modifications', 'error');
      }
    } catch (e) {
      onToast('Error updating user record', 'error');
    }
  };

  const handleSaveBalanceAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForBalance) return;
    const num = Number(balanceActionData.amount);
    if (isNaN(num) || num <= 0) {
      onToast('Enter a valid positive numerical amount', 'error');
      return;
    }
    const current = selectedUserForBalance.balance || 0;
    const newBal = balanceActionData.type === 'credit' ? current + num : Math.max(0, current - num);

    try {
      const res = await fetch('/api/admin/users/edit-balance', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          email: selectedUserForBalance.email,
          balance: newBal
        })
      });
      if (res.ok) {
        onToast(`User ${balanceActionData.type === 'credit' ? 'credited' : 'debited'} with ${currency}${num.toLocaleString()}`, 'success');
        setSelectedUserForBalance(null);
        setBalanceActionData({ type: 'credit', amount: '', narration: '' });
        fetchAllUsers();
      } else {
        onToast('Failed to adjust wallet balance', 'error');
      }
    } catch (e) {
      onToast('Error updating wallet balance', 'error');
    }
  };

  const handleBroadcastAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastBody) {
      onToast('Title and Body are required to broadcast', 'error');
      return;
    }

    // Add notification globally
    onAddGlobalNotification(broadcastTitle, broadcastBody, broadcastType);
    onToast('System announcement broadcast completed!', 'success');

    // Send emails if checked
    if (sendAsEmail) {
      users.forEach(u => {
        onSendSimulatedEmail(
          u.email,
          `Nevo Announcement: ${broadcastTitle}`,
          `Greetings, \n\nWe have published a new announcement on Nevo: \n\n${broadcastBody}\n\nTransact securely on Nevo!`
        );
      });
      onToast(`Announcement emails sent to ${users.length} active users!`, 'success');
    }

    setBroadcastTitle('');
    setBroadcastBody('');
  };

  const handleExportUsersCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Full Name,Email,Balance,dailyTarget,dailySpent,Pin Setup,Biometrics,Suspended,Frozen\n";
    users.forEach(u => {
      csvContent += `"${u.fullName}","${u.email}",${u.balance},${u.dailyTarget},${u.dailySpent},${u.pinCreated ? 'Yes':'No'},${u.biometricEnabled ? 'Yes':'No'},${u.isSuspended ? 'Yes':'No'},${u.isFrozen ? 'Yes':'No'}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Nevo_Users_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onToast('Users database exported as CSV!', 'success');
  };

  const handleExportTransactionsCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Transaction ID,Type,Amount,Date,Status,Description,LEGACY_VOUCHER Used,LEGACY_VOUCHER Generated,Charges\n";
    transactions.forEach(t => {
      csvContent += `"${t.id}","${t.type}",${t.amount},"${t.date}","${t.status}","${t.description}","${t.legacyVoucherCodeUsed || ''}","${t.legacyVoucherCodeGenerated || ''}",${t.charges || 10}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Nevo_Transactions_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onToast('Transactions database exported as CSV!', 'success');
  };

  // Mask helper for account numbers
  const maskAccountNumber = (num: string) => {
    if (!num) return '';
    if (num.length <= 4) return num;
    return num.slice(0, 3) + '*'.repeat(num.length - 6) + num.slice(-3);
  };

  // Calculate dashboard statistics from the actual loaded database records.
  // Never use presentation/demo fallback numbers for financial or user metrics.
  const stats = React.useMemo(() => {
    const safeUsers = Array.isArray(users) ? users : [];
    const safeWithdrawals = Array.isArray(withdrawals) ? withdrawals : [];
    const allUserTransactions = safeUsers.flatMap((u: any) =>
      Array.isArray(u?.transactions) ? u.transactions.map((t: any) => ({ ...t, user: u.fullName || u.username || u.email, email: u.email })) : []
    );
    const transactionRows = allUserTransactions.length ? allUserTransactions : (Array.isArray(transactions) ? transactions : []);

    let pendingCount = 0, processingCount = 0, completedCount = 0, rejectedCount = 0;
    let amountToday = 0, amountWeek = 0, amountMonth = 0;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0,0,0,0);
    const weekStartTime = weekStart.getTime();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    for (const w of safeWithdrawals) {
      const statusLower = toSafeLower(w?.status);
      if (statusLower === 'pending') pendingCount++;
      else if (statusLower === 'processing') processingCount++;
      else if (['completed','success'].includes(statusLower)) completedCount++;
      else if (['rejected','failed','cancelled'].includes(statusLower)) rejectedCount++;
      const rawDate = w?.timestamp || w?.created_at || w?.createdAt;
      const time = rawDate ? new Date(rawDate).getTime() : 0;
      const amt = Number(w?.amount || 0);
      if (['completed','success'].includes(statusLower) && Number.isFinite(time)) {
        if (time >= todayStart) amountToday += amt;
        if (time >= weekStartTime) amountWeek += amt;
        if (time >= monthStart) amountMonth += amt;
      }
    }

    const newUsersToday = safeUsers.filter((u: any) => {
      const raw = u?.registeredAt || u?.createdAt || u?.date;
      if (!raw) return false;
      const d = new Date(raw);
      return !Number.isNaN(d.getTime()) && d >= new Date(todayStart);
    }).length;

    const failedTransactions = transactionRows.filter((t: any) => ['failed','failure','rejected','cancelled'].includes(toSafeLower(t?.status))).length;
    const successfulOrCompletedTransactions = transactionRows.filter((t: any) => ['success','successful','completed','settled','claimed'].includes(toSafeLower(t?.status))).length;
    const systemHealth = transactionRows.length === 0 ? null : Math.max(0, Math.min(100, Math.round(((transactionRows.length - failedTransactions) / transactionRows.length) * 100)));

    // Only count an actual recorded fee/charge. Never invent a fee from the transaction type.
    const totalRecordedCharges = transactionRows.reduce((sum: number, t: any) => {
      const fee = Number(t?.fee ?? t?.fees ?? t?.charge ?? t?.charges ?? 0);
      return Number.isFinite(fee) && fee > 0 ? sum + fee : sum;
    }, 0);

    return {
      total: safeWithdrawals.length,
      pendingCount, processingCount, completedCount, rejectedCount,
      amountToday, amountWeek, amountMonth,
      newUsersToday,
      failedTransactions,
      successfulOrCompletedTransactions,
      systemHealth,
      totalTransactions: transactionRows.length,
      totalRecordedCharges
    };
  }, [users, withdrawals, transactions]);

  const totalTxsCount = stats.totalTransactions;
  const totalRevenue = stats.totalRecordedCharges;

  // Search and status filters for withdrawal request console (Section 1)
  const filteredWithdrawals = React.useMemo(() => {
    return (Array.isArray(withdrawals) ? withdrawals : []).filter(w => {
      if (!w) return false;
      const term = toSafeLower(withdrawalSearch).trim();
      const matchSearch = !term || 
        toSafeLower(w.accountName || w.accountname).includes(term) ||
        toSafeLower(w.email || w.userId).includes(term) ||
        toSafeLower(w.reference || w.id).includes(term) ||
        toSafeLower(w.bankName || w.bankname).includes(term) ||
        toSafeLower(w.accountNumber || w.accountnumber).includes(term);

      const statusLower = toSafeLower(w.status);
      let matchStatus = true;
      if (withdrawalStatusFilter !== 'all') {
        if (withdrawalStatusFilter === 'rejected') {
          matchStatus = statusLower === 'rejected' || statusLower === 'failed' || statusLower === 'cancelled';
        } else {
          matchStatus = statusLower === withdrawalStatusFilter;
        }
      }

      return matchSearch && matchStatus;
    });
  }, [withdrawals, withdrawalSearch, withdrawalStatusFilter]);

  const itemsPerPage = 8;
  const totalWithdrawalPages = Math.ceil(filteredWithdrawals.length / itemsPerPage) || 1;
  const paginatedWithdrawals = React.useMemo(() => {
    const startIndex = (withdrawalPage - 1) * itemsPerPage;
    return filteredWithdrawals.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredWithdrawals, withdrawalPage]);

  // Conditionally Render Full-Screen Withdrawal Details Page (Do NOT use popup or modal)
  if (isDetailsPage) {
    if (loadingSelectedWithdrawal && !selectedWithdrawal) {
      return (
        <div className="p-8 text-center space-y-4 flex flex-col items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 text-amber-500 animate-spin" />
          <p className="text-xs text-slate-400 font-mono tracking-widest">LOADING SECURE WITHDRAWAL AUDIT SYSTEM...</p>
        </div>
      );
    }

    if (!selectedWithdrawal) {
      return (
        <div className="p-8 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">Withdrawal request not found</h3>
          <p className="text-xs text-slate-400">The request may have been deleted or the transaction ID is invalid.</p>
          <button
            onClick={() => {
              setActiveTab('withdrawals');
              navigateTo && navigateTo('/Boris');
            }}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs hover:bg-white/10 transition-all cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>
      );
    }

    const statusLower = (selectedWithdrawal.status || '').toLowerCase();
    
    // Safely parse Date and Time
    const dateObj = new Date(selectedWithdrawal.timestamp || selectedWithdrawal.created_at || Date.now());
    const dateStr = dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Helper to render individual fields as beautiful cards
    const renderFieldCard = (
      label: string,
      value: string | React.ReactNode,
      IconComponent: React.ComponentType<any>,
      colorClass: string = "text-teal-400",
      borderLeftClass: string = "border-l-teal-500"
    ) => (
      <div className={`p-3 sm:p-3.5 flex items-center gap-3 border border-white/10 bg-[#0d0d18] rounded-xl border-l-4 ${borderLeftClass} hover:border-white/20 transition-all shadow-sm`}>
        <div className={`p-2 rounded-lg bg-white/[0.03] border border-white/5 ${colorClass} shrink-0`}>
          <IconComponent className="h-4 w-4" />
        </div>
        <div className="space-y-0.5 min-w-0 flex-1">
          <span className="text-[9px] text-slate-400 font-mono tracking-wider block uppercase font-bold">{label}</span>
          <span className="text-xs sm:text-sm font-bold text-white block truncate">{value}</span>
        </div>
      </div>
    );

    const hasSlip = !!(selectedWithdrawal.posSlipPath || selectedWithdrawal.posslippath);

    return (
      <CyberWithdrawalTerminal
        selectedWithdrawal={selectedWithdrawal}
        onBack={() => {
          setActiveTab('withdrawals');
          navigateTo && navigateTo('/Boris');
        }}
        adminNotes={adminNotes}
        setAdminNotes={setAdminNotes}
        saveInternalNotes={saveInternalNotes}
        savingNotes={savingNotes}
        fileInputRef={fileInputRef}
        handleSlipFileUpload={handleSlipFileUpload}
        uploadingSlip={uploadingSlip}
        isDraggingSlip={isDraggingSlip}
        setIsDraggingSlip={setIsDraggingSlip}
        handleRemoveSlip={handleRemoveSlip}
        removingSlip={removingSlip}
        updateWithdrawalStatus={updateWithdrawalStatus}
        statusUpdating={statusUpdating}
        maskAccountNumber={maskAccountNumber}
        approvePartialWithdrawal={approvePartialWithdrawal}
        approvingPartial={approvingPartial}
      />
    );
  }

  if (activeTab === 'nivo_rewards') {
    return <NivoAdminFeatures token={localStorage.getItem('nevo_admin_token') || ''} onToast={onToast} />;
  }

  if (activeTab === 'overview') {
    return (
      <AdminDashboard1To1
        totalUsersCount={totalUsersCount}
        totalSystemBalance={totalSystemBalance}
        totalRevenue={totalRevenue}
        totalTxsCount={totalTxsCount}
        transactions={users.flatMap((u: any) => Array.isArray(u?.transactions) ? u.transactions.map((t: any) => ({ ...t, user: u.fullName || u.username || u.email, email: u.email })) : [])}
        users={users}
        logs={logs}
        stats={stats}
        onNavigateTab={(tab) => setActiveTab(tab as any)}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#07070e] text-white p-2.5 sm:p-4 md:p-5 space-y-4 overflow-x-hidden font-sans animate-[fadeIn_0.2s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 gap-2">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-all cursor-pointer"
            title="Exit Admin Panel"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          
          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-teal-400 cursor-pointer flex items-center justify-center border border-white/10"
            title="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black tracking-tight text-white">Admin Central Console</h3>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-mono font-bold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">Fintech Operations &amp; Audit Console</p>
          </div>
        </div>

        <button
          onClick={() => {
            fetchAllUsers();
            fetchVouchers();
            fetchLogs();
            setMobileMenuOpen(false);
          }}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-teal-400 border border-white/10 cursor-pointer flex items-center gap-1.5 text-[10px] font-bold uppercase transition-all shrink-0"
          title="Refresh All Data"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Sync Data</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <AdminSidebar
          activeTab={activeTab as any}
          onNavigateTab={(tab) => setActiveTab(tab)}
          usersCount={users.length}
          pendingPaymentsCount={payments.filter(p => p.status === 'pending').length}
          pendingWithdrawalsCount={stats.pendingCount}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          onExit={onBack}
        />

        {/* Content Workspace */}
        <div className="flex-1 w-full space-y-4 min-w-0">
          {(activeTab as string) === 'overview' && (
            <>
              {/* Overview Statistics Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <GlassCard className="p-3 bg-[#1e1b4b]/10 border-white/5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[8px] font-mono text-slate-400 block uppercase">Total Users</span>
            <span className="text-sm font-bold text-white font-mono">{totalUsersCount}</span>
          </div>
        </GlassCard>

        <GlassCard className="p-3 bg-[#1e1b4b]/10 border-white/5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400">
            <Coins className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[8px] font-mono text-slate-400 block uppercase">Total Ledger</span>
            <span className="text-xs font-bold text-white font-mono">₦{(totalSystemBalance/1000).toFixed(0)}k</span>
          </div>
        </GlassCard>

        <GlassCard className="p-3 bg-[#1e1b4b]/10 border-white/5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <ShoppingBag className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[8px] font-mono text-slate-400 block uppercase">Charges Rev</span>
            <span className="text-xs font-bold text-white font-mono">₦{totalRevenue.toLocaleString()}</span>
          </div>
        </GlassCard>

        <GlassCard className="p-3 bg-[#1e1b4b]/10 border-white/5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[8px] font-mono text-slate-400 block uppercase">Transactions</span>
            <span className="text-sm font-bold text-white font-mono">{totalTxsCount}</span>
          </div>
        </GlassCard>
      </div>

      {/* Analytics Charts (Custom responsive SVG bar chart & line chart) */}
      <GlassCard className="p-4 border-white/5 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-white/5">
          <h5 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4 text-teal-400" />
            Fintech Transaction Volume &amp; Daily Statistics
          </h5>
          <span className="text-[8px] font-mono text-slate-500">Real-Time Data</span>
        </div>

        {/* Custom SVG Bar Chart */}
        <div className="space-y-3">
          <span className="text-[9px] font-mono text-slate-400 block">Transaction Categories (By Volume)</span>
          <div className="h-28 flex items-end justify-between px-6 pt-4 relative bg-slate-950/30 rounded-xl border border-white/5">
            {/* Grid background lines */}
            <div className="absolute inset-x-0 top-1/4 border-t border-white/[0.03] pointer-events-none" />
            <div className="absolute inset-x-0 top-2/4 border-t border-white/[0.03] pointer-events-none" />
            <div className="absolute inset-x-0 top-3/4 border-t border-white/[0.03] pointer-events-none" />

            {/* Direct Bank Transfers */}
            <div className="flex flex-col items-center gap-1 w-1/4 group cursor-pointer z-10">
              <span className="text-[8px] font-mono text-slate-300 font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 px-1 py-0.5 rounded -mt-6 absolute">{transferTxs.length} txs</span>
              <div
                style={{ height: `${Math.max(15, Math.min(80, (transferTxs.length / (totalTxsCount || 1)) * 100))}%` }}
                className="w-10 bg-gradient-to-t from-teal-600 to-teal-400 rounded-t-md hover:from-teal-500 hover:to-teal-300 transition-all duration-300"
              />
              <span className="text-[8px] text-slate-400 font-mono">Transfers</span>
            </div>

            {/* LEGACY_VOUCHER Generation Purchases */}
            <div className="flex flex-col items-center gap-1 w-1/4 group cursor-pointer z-10">
              <span className="text-[8px] font-mono text-slate-300 font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 px-1 py-0.5 rounded -mt-6 absolute">{legacyVoucherTxs.length} txs</span>
              <div
                style={{ height: `${Math.max(15, Math.min(80, (legacyVoucherTxs.length / (totalTxsCount || 1)) * 100))}%` }}
                className="w-10 bg-gradient-to-t from-teal-500 to-teal-300 rounded-t-md hover:from-teal-400 hover:to-teal-200 transition-all duration-300"
              />
              <span className="text-[8px] text-slate-400 font-mono">LEGACY_VOUCHER Codes</span>
            </div>

            {/* Airtime Redeem logs */}
            <div className="flex flex-col items-center gap-1 w-1/4 group cursor-pointer z-10">
              <span className="text-[8px] font-mono text-slate-300 font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 px-1 py-0.5 rounded -mt-6 absolute">{airtimeTxs.length} txs</span>
              <div
                style={{ height: `${Math.max(15, Math.min(80, (airtimeTxs.length / (totalTxsCount || 1)) * 100))}%` }}
                className="w-10 bg-gradient-to-t from-emerald-500 to-emerald-300 rounded-t-md hover:from-emerald-400 hover:to-emerald-200 transition-all duration-300"
              />
              <span className="text-[8px] text-slate-400 font-mono">Airtime/Data</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Reports Export Section */}
      <GlassCard className="p-4 border-white/5 space-y-3">
        <h5 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
          <FileSpreadsheet className="h-4 w-4" />
          Fintech Audits &amp; Database Reports
        </h5>
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleExportUsersCSV}
            className="p-3 bg-white/5 border border-white/5 hover:border-teal-500/20 hover:bg-teal-500/10 text-teal-400 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex flex-col items-center gap-1 text-center"
          >
            <Database className="h-4 w-4 mb-1 text-teal-400" />
            Export Users CSV
          </button>
          <button
            onClick={handleExportTransactionsCSV}
            className="p-3 bg-white/5 border border-white/5 hover:border-teal-500/20 hover:bg-teal-500/10 text-teal-400 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex flex-col items-center gap-1 text-center"
          >
            <FileSpreadsheet className="h-4 w-4 mb-1 text-teal-400" />
            Export Ledger CSV
          </button>
        </div>
      </GlassCard>

      {/* User Management Section */}
      <GlassCard className="p-4 border-white/5 space-y-4">
        <div className="flex flex-col gap-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-teal-400">User Database Management</h5>
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search user by name or email address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-white/10 bg-slate-950/40 text-white focus:outline-none focus:ring-1 focus:ring-teal-400"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
          {loadingUsers ? (
            <div className="text-center py-6 text-slate-400 text-xs font-mono">Loading user database...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">No users found.</div>
          ) : (
            filteredUsers.map((u) => (
              <div
                key={u.email}
                onClick={() => {
                  setSelectedUser(u);
                  setEditBalanceAmount((u.balance || 0).toString());
                  setEditUserFullName(u.fullName);
                }}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedUser?.email === u.email
                    ? 'bg-teal-500/10 border-teal-500/30'
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/5'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">{u.fullName}</span>
                    {u.isSuspended && (
                      <span className="text-[7px] font-black uppercase bg-red-500 text-white px-1 py-0.5 rounded">
                        Suspended
                      </span>
                    )}
                    {u.isFrozen && (
                      <span className="text-[7px] font-black uppercase bg-teal-500 text-white px-1 py-0.5 rounded">
                        Frozen
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 block">{u.email}</span>
                </div>
                
                <div className="text-right font-mono text-xs font-bold text-teal-400">
                  {formatNaira(u.balance || 0)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected User Actions Panel */}
        {selectedUser && (
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/10 space-y-4 animate-[fadeIn_0.2s_ease-out]">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <div>
                <span className="text-[8px] font-mono text-slate-500 uppercase">Selected Profile</span>
                <h6 className="text-xs font-bold text-white">{selectedUser.fullName}</h6>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-[9px] font-bold text-red-400 hover:underline cursor-pointer"
              >
                Clear Selection
              </button>
            </div>

            {/* Profile fields updating name */}
            <div className="space-y-3">
              <div className="flex flex-col md:flex-row gap-3">
                {/* Balance Editor */}
                <div className="flex-1">
                  <label className="text-[9px] font-mono text-slate-400 block mb-1">Adjust Wallet Balance (₦)</label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      value={editBalanceAmount}
                      onChange={(e) => setEditBalanceAmount(e.target.value)}
                      className="flex-1 text-xs bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono"
                    />
                    <button
                      onClick={() => handleEditWalletBalance(selectedUser.email)}
                      className="px-3 bg-teal-500 hover:bg-teal-600 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>

              {/* Toggle Suspension or Freeze */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleUpdateUserStatus(selectedUser.email, 'isSuspended', !selectedUser.isSuspended)}
                  className={`py-2 px-3 border rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    selectedUser.isSuspended
                      ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                      : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {selectedUser.isSuspended ? 'Suspended (Revoke)' : 'Suspend Account'}
                </button>

                <button
                  onClick={() => handleUpdateUserStatus(selectedUser.email, 'isFrozen', !selectedUser.isFrozen)}
                  className={`py-2 px-3 border rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    selectedUser.isFrozen
                      ? 'bg-teal-500/10 border-teal-500/20 text-teal-400 hover:bg-teal-500/20'
                      : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {selectedUser.isFrozen ? 'Frozen (Unfreeze)' : 'Freeze Ledger'}
                </button>
              </div>

              {/* Reset Password & Delete */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5 my-1">
                <button
                  onClick={() => handleAdminResetPassword(selectedUser.email)}
                  className="py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/10 text-amber-400 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Key className="h-3.5 w-3.5" /> Reset Pass
                </button>

                <button
                  onClick={() => handleAdminDeleteAccount(selectedUser.email)}
                  className="py-2 px-3 bg-red-500/15 hover:bg-red-500/25 border border-red-500/10 text-red-400 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete User
                </button>
              </div>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Broadcast System Announcements Form */}
      <GlassCard className="p-4 border-white/5 space-y-4">
        <div>
          <h5 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4" />
            Global Announcement Broadcaster
          </h5>
          <p className="text-[10px] text-slate-400 mt-0.5">Publish alerts to user notifications and push simulated emails</p>
        </div>

        <form onSubmit={handleBroadcastAnnouncement} className="space-y-3">
          <div>
            <label className="text-[9px] font-mono text-slate-400 block mb-1">Alert Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Scheduled Core Maintenance Completed"
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
              className="w-full text-xs bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-400"
            />
          </div>

          <div>
            <label className="text-[9px] font-mono text-slate-400 block mb-1">Alert Body</label>
            <textarea
              required
              rows={2}
              placeholder="Provide a detailed security alert or marketing description here..."
              value={broadcastBody}
              onChange={(e) => setBroadcastBody(e.target.value)}
              className="w-full text-xs bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-400 resize-none font-mono"
            />
          </div>

          <div className="flex justify-between items-center bg-slate-950/30 p-2 rounded-xl border border-white/5">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="send_sim_email_box"
                checked={sendAsEmail}
                onChange={(e) => setSendAsEmail(e.target.checked)}
                className="rounded border-white/10 text-teal-500 focus:ring-0"
              />
              <label htmlFor="send_sim_email_box" className="text-[9px] font-mono text-slate-400 select-none cursor-pointer">
                Send as simulated Email alerts
              </label>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1"
            >
              <Send className="h-3 w-3" /> Broadcast
            </button>
          </div>
        </form>
      </GlassCard>

      {/* LEGACY_VOUCHER Payment & System Configurations */}
      <GlassCard className="p-4 border-white/5 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-white/5">
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
              <ShoppingBag className="h-4 w-4 text-teal-400" />
              LEGACY_VOUCHER Payment details &amp; Pricing Config
            </h5>
            <p className="text-[10px] text-slate-400 mt-0.5">Control payment settings, verification rules, and support details dynamically</p>
          </div>
        </div>

        <form onSubmit={handleSaveLegacyVoucherConfig} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] font-mono text-slate-400 block mb-1">Payment Bank Name</label>
              <input
                type="text"
                required
                value={legacyVoucherBankName}
                onChange={(e) => setLegacyVoucherBankName(e.target.value)}
                className="w-full text-xs bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-400"
              />
            </div>

            <div>
              <label className="text-[9px] font-mono text-slate-400 block mb-1">Payment Account Number</label>
              <input
                type="text"
                required
                value={legacyVoucherAccountNumber}
                onChange={(e) => setLegacyVoucherAccountNumber(e.target.value)}
                className="w-full text-xs bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-400"
              />
            </div>

            <div>
              <label className="text-[9px] font-mono text-slate-400 block mb-1">Payment Account Name</label>
              <input
                type="text"
                required
                value={legacyVoucherAccountName}
                onChange={(e) => setLegacyVoucherAccountName(e.target.value)}
                className="w-full text-xs bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-400"
              />
            </div>

            <div>
              <label className="text-[9px] font-mono text-slate-400 block mb-1">Support WhatsApp URL Link</label>
              <input
                type="url"
                required
                value={legacyVoucherWhatsappLink}
                onChange={(e) => setLegacyVoucherWhatsappLink(e.target.value)}
                className="w-full text-xs bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-400 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-[9px] font-mono text-slate-400 block mb-1">Strict Locked Voucher Price (₦)</label>
            <input
              type="number"
              required
              value={legacyVoucherVoucherPrice}
              onChange={(e) => setLegacyVoucherVoucherPrice(e.target.value)}
              className="w-full text-xs bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-400 font-mono"
            />
          </div>

          <div>
            <label className="text-[9px] font-mono text-slate-400 block mb-1">Transfer Instructions Text</label>
            <textarea
              required
              rows={3}
              value={legacyVoucherInstructions}
              onChange={(e) => setLegacyVoucherInstructions(e.target.value)}
              className="w-full text-xs bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-400 resize-none font-sans"
            />
          </div>

          <div>
            <label className="text-[9px] font-mono text-slate-400 block mb-1">System Warning / Bank Maintenance Notice (Leave blank to hide)</label>
            <textarea
              rows={2}
              value={legacyVoucherMaintenanceNotice}
              onChange={(e) => setLegacyVoucherMaintenanceNotice(e.target.value)}
              className="w-full text-xs bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-400 resize-none font-sans"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={savingLegacyVoucherConfig}
              className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 disabled:opacity-50 text-slate-950 font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              {savingLegacyVoucherConfig ? 'Saving Settings...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </GlassCard>
            </>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
              {/* Summary Stats Header Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <GlassCard className="p-4 border-white/5 bg-slate-900/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Users</span>
                    <Users className="h-4 w-4 text-teal-400" />
                  </div>
                  <div className="text-xl font-black text-white font-mono mt-2">{users.length}</div>
                  <div className="text-[9px] text-slate-500 mt-1">Registered Accounts</div>
                </GlassCard>

                <GlassCard className="p-4 border-white/5 bg-slate-900/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">Active Users</span>
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="text-xl font-black text-emerald-400 font-mono mt-2">
                    {users.filter(u => !u.isSuspended && !u.isFrozen).length}
                  </div>
                  <div className="text-[9px] text-slate-500 mt-1">Verified &amp; Active</div>
                </GlassCard>

                <GlassCard className="p-4 border-white/5 bg-slate-900/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">Suspended / Frozen</span>
                    <ShieldAlert className="h-4 w-4 text-rose-400" />
                  </div>
                  <div className="text-xl font-black text-rose-400 font-mono mt-2">
                    {users.filter(u => u.isSuspended || u.isFrozen).length}
                  </div>
                  <div className="text-[9px] text-slate-500 mt-1">Restricted Access</div>
                </GlassCard>

                <GlassCard className="p-4 border-white/5 bg-slate-900/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">Total System Funds</span>
                    <Coins className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="text-xl font-black text-amber-400 font-mono mt-2">
                    {formatNaira(users.reduce((sum, u) => sum + (u.balance || 0), 0))}
                  </div>
                  <div className="text-[9px] text-slate-500 mt-1">Combined Wallet Balances</div>
                </GlassCard>
              </div>

              {/* Search & Filter Bar */}
              <GlassCard className="p-4 border-white/5 space-y-4 bg-slate-900/50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search users by Name, Email, Username, Phone, or User ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-white/10 bg-slate-950/60 text-white focus:outline-none focus:ring-1 focus:ring-teal-400 font-mono"
                    />
                  </div>

                  {/* Filters Selection */}
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
                    {[
                      { id: 'all', label: 'All Users' },
                      { id: 'active', label: 'Active' },
                      { id: 'suspended', label: 'Suspended' },
                      { id: 'verified', label: 'Verified' },
                      { id: 'pending', label: 'Pending' },
                      { id: 'blocked', label: 'Blocked' },
                      { id: 'newest', label: 'Newest' },
                      { id: 'oldest', label: 'Oldest' },
                      { id: 'highest_balance', label: 'Highest Bal' },
                      { id: 'lowest_balance', label: 'Lowest Bal' }
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setUserFilterTab(f.id)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                          userFilterTab === f.id
                            ? 'bg-teal-500 text-slate-950 font-black shadow-sm'
                            : 'bg-white/5 hover:bg-white/10 text-slate-400'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* User Table */}
                <div className="overflow-x-auto rounded-xl border border-white/5 bg-slate-950/40">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/5 text-[9px] uppercase tracking-wider text-slate-400 font-mono font-bold">
                      <tr>
                        <th className="p-3">User Profile</th>
                        <th className="p-3">Contact Details</th>
                        <th className="p-3">Wallet &amp; Bonus</th>
                        <th className="p-3">Status &amp; Level</th>
                        <th className="p-3">Activity &amp; Dates</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {loadingUsers ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-slate-400 text-xs font-mono">
                            Loading user records from database...
                          </td>
                        </tr>
                      ) : processedUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-slate-400 text-xs font-mono">
                            No user accounts match current search &amp; filter parameters.
                          </td>
                        </tr>
                      ) : (
                        processedUsers.map((u) => (
                          <tr key={u.email} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-3">
                              <div className="flex items-center gap-2.5">
                                {u.profilePic ? (
                                  <img src={u.profilePic} alt={u.fullName} className="h-8 w-8 rounded-full object-cover border border-teal-500/30 shrink-0" />
                                ) : (
                                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-teal-500/20 to-teal-500/20 text-teal-400 font-bold flex items-center justify-center text-xs border border-white/10 shrink-0">
                                    {(u.fullName || 'U').charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <div className="font-bold text-white text-xs">{u.fullName}</div>
                                  <div className="text-[10px] font-mono text-teal-400">@{u.username || 'user'} • <span className="text-slate-400">{u.id}</span></div>
                                </div>
                              </div>
                            </td>

                            <td className="p-3">
                              <div className="text-xs font-mono text-slate-200">{u.email}</div>
                              <div className="text-[10px] font-mono text-slate-400">{u.phone || 'N/A'}</div>
                            </td>

                            <td className="p-3 font-mono">
                              <div className="text-xs font-bold text-teal-400">{formatNaira(u.balance || 0)}</div>
                              {u.bonusBalance > 0 && (
                                <div className="text-[9px] text-amber-400">Bonus: {formatNaira(u.bonusBalance || 0)}</div>
                              )}
                            </td>

                            <td className="p-3 space-y-1">
                              <div className="flex flex-wrap items-center gap-1">
                                {u.isSuspended ? (
                                  <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                    Suspended
                                  </span>
                                ) : u.isFrozen ? (
                                  <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                    Frozen
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    Active
                                  </span>
                                )}

                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                                  u.withdrawalStatus === 'Blocked'
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    : 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                                }`}>
                                  WD: {u.withdrawalStatus || 'Allowed'}
                                </span>
                              </div>
                              <div className="text-[9px] font-mono text-slate-400">{u.accountLevel || `Tier ${u.tier || 3}`}</div>
                            </td>

                            <td className="p-3 font-mono text-[10px] text-slate-400">
                              <div>Reg: {new Date(u.registeredAt || Date.now()).toLocaleDateString()}</div>
                              <div>Ref: {u.referralCount || 0} • LEGACY_VOUCHER: {u.legacyVoucherPurchases || 0}</div>
                            </td>

                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => setSelectedUserForView(u)}
                                  title="View Full User Details"
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-teal-500/20 hover:text-teal-400 text-slate-300 transition-all cursor-pointer"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </button>

                                <button
                                  onClick={() => {
                                    setSelectedUserForEdit(u);
                                    setEditUserFormData({
                                      fullName: u.fullName || '',
                                      email: u.email || '',
                                      phone: u.phone || '',
                                      username: u.username || '',
                                      balance: String(u.balance || 0),
                                      bonusBalance: String(u.bonusBalance || 0),
                                      referralCount: String(u.referralCount || 0),
                                      tier: String(u.tier || 3),
                                      withdrawalStatus: u.withdrawalStatus || 'Allowed',
                                      isSuspended: !!u.isSuspended,
                                      isFrozen: !!u.isFrozen,
                                      profilePic: u.profilePic || ''
                                    });
                                  }}
                                  title="Edit User Profile"
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-teal-500/20 hover:text-teal-400 text-slate-300 transition-all cursor-pointer"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>

                                <button
                                  onClick={() => {
                                    setSelectedUserForBalance(u);
                                    setBalanceActionData({ type: 'credit', amount: '', narration: '' });
                                  }}
                                  title="Credit / Debit Wallet Balance"
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 text-slate-300 transition-all cursor-pointer"
                                >
                                  <Coins className="h-3.5 w-3.5" />
                                </button>

                                <button
                                  onClick={() => handleAdminResetPassword(u.email)}
                                  title="Reset Password"
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-amber-500/20 hover:text-amber-400 text-slate-300 transition-all cursor-pointer"
                                >
                                  <Key className="h-3.5 w-3.5" />
                                </button>

                                <button
                                  onClick={() => handleAdminResetPin(u.email)}
                                  title="Reset Security PIN"
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-violet-500/20 hover:text-violet-400 text-slate-300 transition-all cursor-pointer"
                                >
                                  <RefreshCw className="h-3.5 w-3.5" />
                                </button>

                                <button
                                  onClick={() => handleUpdateUserStatus(u.email, 'isSuspended', !u.isSuspended)}
                                  title={u.isSuspended ? "Unsuspend User" : "Suspend User"}
                                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                    u.isSuspended
                                      ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                      : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                                  }`}
                                >
                                  <ShieldAlert className="h-3.5 w-3.5" />
                                </button>

                                <button
                                  onClick={() => handleAdminDeleteAccount(u.email)}
                                  title="Delete User Account"
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </div>
          )}

          {false && activeTab === 'voucher_generator' && (
            <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
              {/* Introduction Header card */}
              <GlassCard className="p-5 border-white/5 bg-gradient-to-br from-teal-950/10 via-slate-900/10 to-teal-950/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-black uppercase tracking-wider text-teal-400 flex items-center gap-2">
                      <Key className="h-5 w-5 text-teal-400" />
                      LEGACY_VOUCHER Voucher Generator
                    </h4>
                    <p className="text-[10px] text-slate-400 max-w-xl">
                      Generate, manage, copy, and track secure, single-use cashout vouchers. 
                      Vouchers remain fully valid until a successful user withdrawal. Generating a new voucher 
                      <span className="text-teal-400 font-bold"> never invalidates</span> existing unused ones.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[9px] font-mono text-slate-500">Unused Count:</span>
                    <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded text-[9px] font-mono font-bold animate-pulse">
                      {(Array.isArray(vouchers) ? vouchers : []).filter(v => v && v.status === 'unused').length}
                    </span>
                  </div>
                </div>
              </GlassCard>

              {/* Large Generation Button Component */}
              <GlassCard className="p-6 border-white/5 text-center bg-slate-950/10 space-y-4">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="p-3 bg-teal-500/10 text-teal-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <Key className="h-6 w-6" />
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest">Secure Master Vault</h3>
                    <p className="text-[10px] text-slate-400">Generate a unique master voucher linked to the local SQL datastore.</p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleGenerateVoucher(e)}
                    disabled={generatingVoucher}
                    className="w-full py-4 px-6 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl shadow-xl hover:shadow-teal-500/10 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {generatingVoucher ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Generating Code...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        Generate New LEGACY_VOUCHER Voucher
                      </>
                    )}
                  </button>
                  
                  <p className="text-[8px] text-slate-500 font-mono">
                    Format: LEGACY_VOUCHER-XXXX-XXXX-XXXX • Stored in PostgreSQL/SQLite datastore with strict constraints.
                  </p>
                </div>
              </GlassCard>

              {/* Voucher Database & Search Section */}
              <GlassCard className="p-4 border-white/5 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-3 gap-3">
                  <div>
                    <h5 className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-bold">Voucher Datastore Ledger</h5>
                    <p className="text-[9px] text-slate-400 mt-0.5">Filter records and execute administrative actions below</p>
                  </div>
                  
                  {/* Voucher Search Box */}
                  <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search voucher codes, statuses..."
                      value={voucherSearchTerm}
                      onChange={(e) => setVoucherSearchTerm(e.target.value)}
                      className="w-full text-xs pl-8.5 pr-3 py-2 rounded-xl border border-white/10 bg-slate-950/50 text-white focus:outline-none focus:ring-1 focus:ring-teal-400 font-sans"
                    />
                  </div>
                </div>

                {/* Voucher Data Mobile Card Stack (Visible on mobile only) */}
                <div className="md:hidden space-y-3">
                  {loadingVouchers ? (
                    <div className="text-center py-12 text-slate-400 text-xs font-sans">
                      <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2 text-teal-400" />
                      Loading master SQL voucher records...
                    </div>
                  ) : filteredVouchers.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-xs font-sans">
                      No vouchers matching your search criteria.
                    </div>
                  ) : (
                    filteredVouchers.map((v) => {
                      const isUnused = v.status === 'unused';
                      return (
                        <div key={v.id} className={`p-4 rounded-xl border border-white/5 bg-slate-950/20 space-y-2.5 ${!isUnused ? 'opacity-65' : ''}`}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono font-bold text-white tracking-wider select-all text-xs">{v.voucherCode || v.code}</span>
                            <span
                              className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                                isUnused
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-slate-850 text-slate-400 border border-white/5'
                              }`}
                            >
                              {v.status}
                            </span>
                          </div>
                          <div className="text-[10px] space-y-1 text-slate-400 font-mono">
                            <div className="flex justify-between">
                              <span>Created:</span>
                              <span className="text-slate-300">{safeDateStr(v.createdAt || v.generatedAt)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Used By:</span>
                              <span className="text-teal-400 max-w-[150px] truncate">{toSafeStr(v.usedBy) || '-'}</span>
                            </div>
                            {v.usedAt && (
                              <div className="flex justify-between">
                                <span>Used Date:</span>
                                <span className="text-slate-300">{safeDateStr(v.usedAt)}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(v.voucherCode || v.code);
                                onToast('Voucher code copied to clipboard!', 'success');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-teal-400 text-[10px] font-bold uppercase border border-white/10"
                            >
                              Copy Code
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm('Are you sure you want to hard-delete this voucher record?')) {
                                  handleDeleteVoucher(v.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Desktop-Friendly Voucher Data Table (Hidden on mobile) */}
                <div className="hidden md:block overflow-x-auto rounded-xl border border-white/5 bg-slate-950/20 no-scrollbar">
                  <table className="w-full text-[11px] text-left border-collapse font-mono">
                    <thead>
                      <tr className="border-b border-white/5 text-[9px] text-slate-400 uppercase tracking-wider bg-white/[0.02]">
                        <th className="px-4 py-3 font-bold">Voucher Code</th>
                        <th className="px-3 py-3 font-bold">Status</th>
                        <th className="px-3 py-3 font-bold">Created Date</th>
                        <th className="px-3 py-3 font-bold">Used By</th>
                        <th className="px-3 py-3 font-bold">Used Date</th>
                        <th className="px-4 py-3 text-right font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {loadingVouchers ? (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-slate-400 text-xs font-sans">
                            <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2 text-teal-400" />
                            Loading master SQL voucher records...
                          </td>
                        </tr>
                      ) : filteredVouchers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-slate-500 text-xs font-sans">
                            No vouchers matching your search criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredVouchers.map((v) => {
                          const isUnused = v.status === 'unused';
                          return (
                            <tr key={v.id} className={`hover:bg-white/[0.01] transition-colors ${!isUnused ? 'opacity-65' : ''}`}>
                              <td className="px-4 py-3.5 font-bold tracking-wider text-white whitespace-nowrap select-all">{v.voucherCode || v.code}</td>
                              <td className="px-3 py-3.5 whitespace-nowrap">
                                <span
                                  className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                                    isUnused
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                      : 'bg-slate-850 text-slate-400 border border-white/5'
                                  }`}
                                >
                                  {v.status}
                                </span>
                              </td>
                              <td className="px-3 py-3.5 text-slate-300 whitespace-nowrap text-[9px]">
                                {safeDateStr(v.createdAt || v.generatedAt)}
                              </td>
                              <td className="px-3 py-3.5 text-teal-400 whitespace-nowrap max-w-[120px] truncate" title={toSafeStr(v.usedBy)}>
                                {toSafeStr(v.usedBy) || <span className="text-slate-600">-</span>}
                              </td>
                              <td className="px-3 py-3.5 text-slate-400 whitespace-nowrap text-[9px]">
                                {v.usedAt ? safeDateStr(v.usedAt) : <span className="text-slate-600">-</span>}
                              </td>
                              <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(v.voucherCode || v.code);
                                      onToast('Voucher code copied to clipboard!', 'success');
                                    }}
                                    className="p-1.5 bg-white/5 hover:bg-teal-500/10 border border-white/5 hover:border-teal-500/20 text-teal-400 rounded-lg transition-all cursor-pointer"
                                    title="Copy Code"
                                  >
                                    <FileSpreadsheet className="h-3.5 w-3.5" />
                                  </button>
                                  
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteVoucher(v.id)}
                                    className="p-1.5 bg-white/5 hover:bg-red-500/10 border border-white/5 hover:border-red-500/25 text-red-500 rounded-lg transition-all cursor-pointer"
                                    title="Delete Voucher"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
              <GlassCard className="p-5 border-white/5 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                      <CreditCard className="h-4 w-4 text-teal-400" />
                      Deposits & Payment Log
                    </h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Tracking of deposits, payment references, and verification states</p>
                  </div>

                  <button
                    onClick={fetchPayments}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-teal-400 border border-white/10 rounded-xl text-[10px] font-bold uppercase flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3 animate-spin" /> Sync Payments
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 justify-between">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search reference, email, account or bank..."
                      value={paymentSearch}
                      onChange={(e) => setPaymentSearch(e.target.value)}
                      className="w-full text-xs bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-400 font-mono"
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 self-center">
                    Total Records: {payments.length}
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-white/5 bg-slate-950/20 no-scrollbar">
                  <table className="w-full text-[11px] text-left border-collapse font-mono">
                    <thead>
                      <tr className="border-b border-white/5 text-[9px] text-slate-400 uppercase tracking-wider bg-white/[0.02]">
                        <th className="px-3 py-3 font-bold">Reference</th>
                        <th className="px-3 py-3 font-bold">User Email</th>
                        <th className="px-3 py-3 font-bold">Amount</th>
                        <th className="px-3 py-3 font-bold">Virtual Account</th>
                        <th className="px-3 py-3 font-bold">Status</th>
                        <th className="px-3 py-3 font-bold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {loadingPayments ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-slate-400 text-xs font-sans">
                            <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2 text-teal-400" />
                            Loading virtual account payment logs...
                          </td>
                        </tr>
                      ) : payments.filter(p => {
                          const term = paymentSearch.toLowerCase().trim();
                          if (!term) return true;
                          return (p.reference || '').toLowerCase().includes(term) ||
                                 (p.userEmail || '').toLowerCase().includes(term) ||
                                 (p.bankName || '').toLowerCase().includes(term) ||
                                 (p.accountNumber || '').toLowerCase().includes(term);
                        }).length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-slate-500 text-xs font-sans">
                            No payment records found.
                          </td>
                        </tr>
                      ) : (
                        payments.filter(p => {
                          const term = paymentSearch.toLowerCase().trim();
                          if (!term) return true;
                          return (p.reference || '').toLowerCase().includes(term) ||
                                 (p.userEmail || '').toLowerCase().includes(term) ||
                                 (p.bankName || '').toLowerCase().includes(term) ||
                                 (p.accountNumber || '').toLowerCase().includes(term);
                        }).map((p) => {
                          const isSuccessful = p.status === 'successful' || p.status === 'settled';
                          const isPending = p.status === 'pending';
                          return (
                            <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="px-3 py-3 text-teal-300 font-bold text-[10px]">
                                {p.reference}
                              </td>
                              <td className="px-3 py-3 text-slate-300 text-[10px]">
                                {p.userEmail}
                              </td>
                              <td className="px-3 py-3 text-emerald-400 font-bold">
                                ₦{Number(p.amount || 0).toLocaleString()}
                              </td>
                              <td className="px-3 py-3 text-slate-300 text-[10px]">
                                <div>{p.bankName}</div>
                                <div className="text-slate-400 text-[9px]">{p.accountNumber}</div>
                              </td>
                              <td className="px-3 py-3">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                  isSuccessful ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                  isPending ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse' :
                                  'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                }`}>
                                  {p.status}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-right">
                                {!isSuccessful && (
                                  <button
                                    onClick={() => handleAdminConfirmPayment(p.reference)}
                                    className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded text-[9px] font-bold uppercase transition-all cursor-pointer"
                                  >
                                    Verify Payment
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </div>
          )}

          {activeTab === 'withdrawals' && (
            <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
              {/* Introduction Header card */}
              <GlassCard className="p-5 border-white/5 bg-gradient-to-br from-teal-950/10 via-slate-900/10 to-teal-950/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-black uppercase tracking-wider text-teal-400 flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-teal-400" />
                      Live Withdrawal Management Console
                    </h4>
                    <p className="text-[10px] text-slate-400 max-w-xl">
                      Monitor, audit, and dispatch secure real-time withdrawal requests. Status modifications are saved instantly to the SQL database.
                    </p>
                  </div>
                  
                  <button
                    onClick={fetchWithdrawals}
                    disabled={loadingWithdrawals}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-teal-400 border border-white/10 cursor-pointer flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase shrink-0 transition-all"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${loadingWithdrawals ? 'animate-spin' : ''}`} />
                    Sync Logs
                  </button>
                </div>
              </GlassCard>

              {/* Live Statistics Cards (Section 8) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <GlassCard className="p-3 bg-[#1e1b4b]/10 border-white/5 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[8px] font-mono text-slate-400 block uppercase">Total Requests</span>
                    <span className="text-sm font-bold text-white font-mono">{stats.total}</span>
                  </div>
                </GlassCard>

                <GlassCard className="p-3 bg-[#1e1b4b]/10 border-white/5 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-yellow-500/10 text-yellow-400">
                    <Clock className="h-4 w-4 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[8px] font-mono text-slate-400 block uppercase">Pending Requests</span>
                    <span className="text-sm font-bold text-yellow-400 font-mono">{stats.pendingCount}</span>
                  </div>
                </GlassCard>

                <GlassCard className="p-3 bg-[#1e1b4b]/10 border-white/5 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                    <RefreshCw className="h-4 w-4 animate-spin" style={{ animationDuration: '3s' }} />
                  </div>
                  <div>
                    <span className="text-[8px] font-mono text-slate-400 block uppercase">Processing</span>
                    <span className="text-sm font-bold text-blue-400 font-mono">{stats.processingCount}</span>
                  </div>
                </GlassCard>

                <GlassCard className="p-3 bg-[#1e1b4b]/10 border-white/5 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[8px] font-mono text-slate-400 block uppercase">Completed</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">{stats.completedCount}</span>
                  </div>
                </GlassCard>

                <GlassCard className="p-3 bg-[#1e1b4b]/10 border-white/5 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
                    <XCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[8px] font-mono text-slate-400 block uppercase">Rejected / Cancelled</span>
                    <span className="text-sm font-bold text-rose-400 font-mono">{stats.rejectedCount}</span>
                  </div>
                </GlassCard>

                <GlassCard className="p-3 bg-[#1e1b4b]/10 border-white/5 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[8px] font-mono text-slate-400 block uppercase">Withdrawn Today</span>
                    <span className="text-xs font-bold text-white font-mono">₦{stats.amountToday.toLocaleString()}</span>
                  </div>
                </GlassCard>

                <GlassCard className="p-3 bg-[#1e1b4b]/10 border-white/5 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[8px] font-mono text-slate-400 block uppercase">Withdrawn This Week</span>
                    <span className="text-xs font-bold text-white font-mono">₦{stats.amountWeek.toLocaleString()}</span>
                  </div>
                </GlassCard>

                <GlassCard className="p-3 bg-[#1e1b4b]/10 border-white/5 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[8px] font-mono text-slate-400 block uppercase">Withdrawn This Month</span>
                    <span className="text-xs font-bold text-white font-mono">₦{stats.amountMonth.toLocaleString()}</span>
                  </div>
                </GlassCard>
              </div>

              {/* Filtering and Search Controls (Section 1) */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-950/30 p-4 border border-white/5 rounded-2xl">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={withdrawalSearch}
                    onChange={(e) => {
                      setWithdrawalSearch(e.target.value);
                      setWithdrawalPage(1);
                    }}
                    placeholder="Search by name, email, transaction reference, bank, account number..."
                    className="w-full text-xs bg-slate-950 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-400"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider shrink-0">Filter Status:</span>
                  <select
                    value={withdrawalStatusFilter}
                    onChange={(e) => {
                      setWithdrawalStatusFilter(e.target.value as any);
                      setWithdrawalPage(1);
                    }}
                    className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-400"
                  >
                    <option value="all">All Transactions</option>
                    <option value="pending">🟡 Pending Only</option>
                    <option value="processing">🔵 Processing Only</option>
                    <option value="completed">🟢 Completed Only</option>
                    <option value="rejected">🔴 Rejected &amp; Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Withdrawals List Datagrid table */}
              <GlassCard className="p-0 border-white/5 overflow-hidden">
                {/* Mobile view stacked cards */}
                <div className="md:hidden divide-y divide-white/[0.03]">
                  {loadingWithdrawals && paginatedWithdrawals.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 font-mono animate-pulse text-xs">
                      Loading withdrawal security database...
                    </div>
                  ) : paginatedWithdrawals.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 font-mono">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Inbox className="h-8 w-8 text-slate-500" />
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">No withdrawal requests found</span>
                      </div>
                    </div>
                  ) : (
                    paginatedWithdrawals.map((w) => {
                      const statusLower = (w.status || '').toLowerCase();
                      let statusColor = 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/25';
                      let statusLabel = 'Pending';
                      if (statusLower === 'processing') {
                        statusColor = 'bg-blue-500/10 text-blue-400 border border-blue-500/25';
                        statusLabel = 'Processing';
                      } else if (statusLower === 'completed' || statusLower === 'success') {
                        statusColor = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25';
                        statusLabel = 'Completed';
                      } else if (statusLower === 'rejected' || statusLower === 'failed') {
                        statusColor = 'bg-rose-500/10 text-rose-400 border border-rose-500/25';
                        statusLabel = 'Rejected';
                      } else if (statusLower === 'cancelled') {
                        statusColor = 'bg-slate-500/10 text-slate-400 border border-slate-500/25';
                        statusLabel = 'Cancelled';
                      }

                      return (
                        <div key={w.id} className="p-4 space-y-3 hover:bg-white/[0.01] transition-all">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-bold text-white leading-tight text-xs">
                                {w.accountName || w.accountname || 'Anonymous User'}
                              </div>
                              <div className="text-[9px] text-slate-500 font-mono truncate max-w-[180px] mt-0.5">
                                {w.email || w.userId}
                              </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide shrink-0 ${statusColor}`}>
                              {statusLabel}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
                            <div>
                              <span className="block text-[8px] uppercase text-slate-500">Amount</span>
                              <span className="font-bold text-emerald-400 text-xs">₦{Number(w.amount || 0).toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="block text-[8px] uppercase text-slate-500">Bank Details</span>
                              <span className="text-slate-200 truncate block max-w-[120px]">{w.bankName || w.bankname}</span>
                              <span className="block text-[9px] text-slate-400">{maskAccountNumber(w.accountNumber || w.accountnumber)}</span>
                            </div>
                            <div>
                              <span className="block text-[8px] uppercase text-slate-500">Date &amp; Time</span>
                              <span className="text-slate-300">
                                {safeDateStr(w.timestamp || w.created_at || w.createdat, 'date')}
                              </span>
                            </div>
                            <div>
                              <span className="block text-[8px] uppercase text-slate-500">Reference</span>
                              <span className="text-teal-400 text-[9px] select-all truncate block max-w-[120px]">{w.reference}</span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-white/5 flex items-center justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                navigateTo && navigateTo(`/Boris/withdrawals/${w.id}`);
                              }}
                              className="px-3 py-1.5 bg-gradient-to-r from-teal-500/10 to-teal-500/10 hover:from-teal-500 hover:to-teal-500 text-teal-400 hover:text-slate-950 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-teal-500/20 hover:border-transparent transition-all cursor-pointer"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Desktop View Table (Hidden on mobile) */}
                <div className="hidden md:block overflow-x-auto no-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-slate-950/40 text-[9px] font-mono uppercase text-slate-400 tracking-wider">
                        <th className="py-3 px-4 font-bold">User Details</th>
                        <th className="py-3 px-4 font-bold">Amount</th>
                        <th className="py-3 px-4 font-bold">Bank Name</th>
                        <th className="py-3 px-4 font-bold">Account Number</th>
                        <th className="py-3 px-4 font-bold">Date &amp; Time</th>
                        <th className="py-3 px-4 font-bold">Reference</th>
                        <th className="py-3 px-4 font-bold">Status</th>
                        <th className="py-3 px-4 font-bold text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03] text-xs">
                      {loadingWithdrawals && paginatedWithdrawals.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-400 font-mono animate-pulse">
                            Loading withdrawal security database...
                          </td>
                        </tr>
                      ) : paginatedWithdrawals.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-400 font-mono">
                            <div className="flex flex-col items-center justify-center space-y-2">
                              <Inbox className="h-8 w-8 text-slate-500" />
                              <span className="text-[10px] text-slate-500 uppercase tracking-wider">No withdrawal requests found</span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedWithdrawals.map((w) => {
                          const statusLower = (w.status || '').toLowerCase();
                          let statusColor = 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/25';
                          let statusLabel = 'Pending';
                          if (statusLower === 'processing') {
                            statusColor = 'bg-blue-500/10 text-blue-400 border border-blue-500/25';
                            statusLabel = 'Processing';
                          } else if (statusLower === 'completed' || statusLower === 'success') {
                            statusColor = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25';
                            statusLabel = 'Completed';
                          } else if (statusLower === 'rejected' || statusLower === 'failed') {
                            statusColor = 'bg-rose-500/10 text-rose-400 border border-rose-500/25';
                            statusLabel = 'Rejected';
                          } else if (statusLower === 'cancelled') {
                            statusColor = 'bg-slate-500/10 text-slate-400 border border-slate-500/25';
                            statusLabel = 'Cancelled';
                          }

                          return (
                            <tr key={w.id} className="hover:bg-white/[0.01] transition-all">
                              <td className="py-3 px-4">
                                <div className="font-bold text-white leading-tight">
                                  {w.accountName || w.accountname || 'Anonymous User'}
                                </div>
                                <div className="text-[9px] text-slate-500 font-mono truncate max-w-[150px]">
                                  {w.email || w.userId}
                                </div>
                              </td>
                              <td className="py-3 px-4 font-bold text-emerald-400 font-mono">
                                ₦{Number(w.amount || 0).toLocaleString()}
                              </td>
                              <td className="py-3 px-4 text-slate-300 font-medium">
                                {w.bankName || w.bankname}
                              </td>
                              <td className="py-3 px-4 text-slate-400 font-mono">
                                {maskAccountNumber(w.accountNumber || w.accountnumber)}
                              </td>
                              <td className="py-3 px-4 text-slate-400 font-mono text-[10px]">
                                {safeDateStr(w.timestamp || w.created_at || w.createdat, 'date')} &bull; {safeDateStr(w.timestamp || w.created_at || w.createdat, 'time')}
                              </td>
                              <td className="py-3 px-4 font-mono text-teal-400 text-[10px] select-all">
                                {w.reference}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide ${statusColor}`}>
                                  {statusLabel}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigateTo && navigateTo(`/Boris/withdrawals/${w.id}`);
                                  }}
                                  className="px-3 py-1.5 bg-gradient-to-r from-teal-500/10 to-teal-500/10 hover:from-teal-500 hover:to-teal-500 text-teal-400 hover:text-slate-950 rounded-lg text-[9px] font-bold uppercase tracking-wider border border-teal-500/20 hover:border-transparent transition-all cursor-pointer"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalWithdrawalPages > 1 && (
                  <div className="flex items-center justify-between p-4 border-t border-white/5 bg-slate-950/20 text-[10px] font-mono text-slate-400">
                    <button
                      disabled={withdrawalPage === 1}
                      onClick={() => setWithdrawalPage(prev => Math.max(prev - 1, 1))}
                      className="px-3 py-1.5 rounded bg-white/5 border border-white/10 text-white disabled:opacity-40 hover:bg-white/10 transition-all cursor-pointer"
                    >
                      PREV
                    </button>
                    <span>
                      PAGE {withdrawalPage} OF {totalWithdrawalPages}
                    </span>
                    <button
                      disabled={withdrawalPage === totalWithdrawalPages}
                      onClick={() => setWithdrawalPage(prev => Math.min(prev + 1, totalWithdrawalPages))}
                      className="px-3 py-1.5 rounded bg-white/5 border border-white/10 text-white disabled:opacity-40 hover:bg-white/10 transition-all cursor-pointer"
                    >
                      NEXT
                    </button>
                  </div>
                )}
              </GlassCard>
            </div>
          )}

          {activeTab === 'payment_settings' && (
            <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
              {/* Sub-tab Navigation */}
              <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                <button
                  type="button"
                  onClick={() => setPaymentSubTab('gateways')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-2 ${
                    paymentSubTab === 'gateways'
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Zap className="h-4 w-4 text-teal-400" />
                  <span>Payment Gateway (KoraPay)</span>
                </button>
                <button style={{display:'none'}}
                  type="button"
                  onClick={() => setPaymentSubTab('manual_legacyVoucher')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-2 ${
                    paymentSubTab === 'manual_legacyVoucher'
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Building className="h-4 w-4 text-teal-400" />
                  <span>Manual Bank Transfer &amp; LEGACY_VOUCHER Account</span>
                </button>
              </div>

              {true ? (
                <PaymentAdminTab
                  onToast={onToast}
                  getAdminHeaders={getAdminHeaders}
                />
              ) : (
                <>
                  {/* Header Info Card */}
                  <GlassCard className="p-5 border-white/5 bg-gradient-to-br from-teal-950/20 via-slate-900/30 to-teal-950/15">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                            <Building className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-white tracking-wide">
                              LEGACY_VOUCHER Payment Account Management
                            </h4>
                            <p className="text-[11px] text-slate-400">
                              Configure live payment details, support contacts, and instructions displayed to users.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1.5 whitespace-nowrap">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                          Live Sync Active
                        </span>
                      </div>
                    </div>
                  </GlassCard>

              {/* Form & Live Preview Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form Column */}
                <GlassCard className="lg:col-span-7 p-5 border-white/5 space-y-5">
                  <div className="pb-3 border-b border-white/5 flex items-center justify-between">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Payment Account Form
                    </h5>
                    <span className="text-[10px] text-slate-400">No code editing required</span>
                  </div>

                  <form onSubmit={handleSaveLegacyVoucherConfig} className="space-y-4">
                    {/* Bank Name Field with Popular Nigerian Bank Selector */}
                    <div>
                      <label className="text-[10px] font-mono text-slate-300 block mb-1 font-bold">
                        Bank Name
                      </label>
                      <div className="space-y-2">
                        <select
                          value={
                            ['OPay', 'PalmPay', 'Moniepoint MFB', 'GTBank', 'UBA', 'Access Bank', 'Zenith Bank', 'First Bank', 'Kuda Bank', 'FCMB', 'Union Bank', 'Sterling Bank', 'Wema Bank', 'Stanbic IBTC Bank', 'Fidelity Bank'].includes(legacyVoucherBankName)
                              ? legacyVoucherBankName
                              : 'other'
                          }
                          onChange={(e) => {
                            if (e.target.value !== 'other') {
                              setLegacyVoucherBankName(e.target.value);
                            }
                          }}
                          className="w-full text-xs bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-400"
                        >
                          <option value="OPay">OPay</option>
                          <option value="PalmPay">PalmPay</option>
                          <option value="Moniepoint MFB">Moniepoint Microfinance Bank</option>
                          <option value="GTBank">GTBank (Guaranty Trust Bank)</option>
                          <option value="UBA">UBA (United Bank for Africa)</option>
                          <option value="Access Bank">Access Bank</option>
                          <option value="Zenith Bank">Zenith Bank</option>
                          <option value="First Bank">First Bank of Nigeria</option>
                          <option value="Kuda Bank">Kuda Microfinance Bank</option>
                          <option value="FCMB">FCMB (First City Monument Bank)</option>
                          <option value="Union Bank">Union Bank</option>
                          <option value="Sterling Bank">Sterling Bank</option>
                          <option value="Wema Bank">Wema Bank</option>
                          <option value="Stanbic IBTC Bank">Stanbic IBTC Bank</option>
                          <option value="Fidelity Bank">Fidelity Bank</option>
                          <option value="other">Other / Custom Bank Name</option>
                        </select>

                        <input
                          type="text"
                          required
                          placeholder="Type Bank Name (e.g., OPay, PalmPay, GTBank)"
                          value={legacyVoucherBankName}
                          onChange={(e) => setLegacyVoucherBankName(e.target.value)}
                          className="w-full text-xs bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-teal-400 font-medium"
                        />
                      </div>
                      <p className="text-[9px] text-slate-500 mt-1">Select from dropdown or type any bank name directly above.</p>
                    </div>

                    {/* Account Number */}
                    <div>
                      <label className="text-[10px] font-mono text-slate-300 block mb-1 font-bold">
                        Account Number
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 8960723295"
                        value={legacyVoucherAccountNumber}
                        onChange={(e) => setLegacyVoucherAccountNumber(e.target.value)}
                        className="w-full text-xs bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-teal-400 font-mono tracking-wider font-bold"
                      />
                    </div>

                    {/* Account Name */}
                    <div>
                      <label className="text-[10px] font-mono text-slate-300 block mb-1 font-bold">
                        Account Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. PWAMUNADI ISHAKU"
                        value={legacyVoucherAccountName}
                        onChange={(e) => setLegacyVoucherAccountName(e.target.value)}
                        className="w-full text-xs bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-teal-400 font-medium uppercase"
                      />
                    </div>

                    {/* Voucher Price */}
                    <div>
                      <label className="text-[10px] font-mono text-slate-300 block mb-1 font-bold">
                        LEGACY_VOUCHER Voucher Price (₦)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-teal-400 font-bold text-xs">₦</span>
                        <input
                          type="number"
                          required
                          placeholder="6500"
                          value={legacyVoucherVoucherPrice}
                          onChange={(e) => setLegacyVoucherVoucherPrice(e.target.value)}
                          className="w-full text-xs bg-slate-950 border border-white/10 rounded-xl pl-8 pr-3 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-teal-400 font-mono font-bold"
                        />
                      </div>
                      <p className="text-[9px] text-slate-500 mt-1">Users will pay this exact locked amount for a LEGACY_VOUCHER Voucher code.</p>
                    </div>

                    {/* WhatsApp Number */}
                    <div>
                      <label className="text-[10px] font-mono text-slate-300 block mb-1 font-bold">
                        WhatsApp Contact Number
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. +2349162845073 or 09162845073"
                        value={legacyVoucherWhatsappNumber}
                        onChange={(e) => setLegacyVoucherWhatsappNumber(e.target.value)}
                        className="w-full text-xs bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-teal-400 font-mono"
                      />
                      <p className="text-[9px] text-slate-500 mt-1">
                        When users click "I Have Made This Transfer", they will be redirected to this WhatsApp number with their payment confirmation receipt.
                      </p>
                    </div>

                    {/* Payment Instructions */}
                    <div>
                      <label className="text-[10px] font-mono text-slate-300 block mb-1 font-bold">
                        Payment Instructions
                      </label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Enter transfer instructions..."
                        value={legacyVoucherInstructions}
                        onChange={(e) => setLegacyVoucherInstructions(e.target.value)}
                        className="w-full text-xs bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-400 resize-none font-sans"
                      />
                    </div>

                    {/* Optional Payment Note / Maintenance Notice */}
                    <div>
                      <label className="text-[10px] font-mono text-slate-300 block mb-1 font-bold">
                        Optional Payment Note / System Warning
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Payments are verified manually within a few minutes."
                        value={legacyVoucherMaintenanceNotice}
                        onChange={(e) => setLegacyVoucherMaintenanceNotice(e.target.value)}
                        className="w-full text-xs bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-400 resize-none font-sans"
                      />
                      <p className="text-[9px] text-slate-500 mt-1">Displayed in an alert box on the payment screen. Leave blank if none.</p>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={savingLegacyVoucherConfig}
                        className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-teal-500/10"
                      >
                        <Save className="h-4 w-4" />
                        {savingLegacyVoucherConfig ? 'Saving Settings to Database...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </GlassCard>

                {/* Live Preview Column */}
                <div className="lg:col-span-5 space-y-4">
                  <GlassCard className="p-5 border-white/5 space-y-4 sticky top-6 bg-slate-950/60">
                    <div className="pb-2 border-b border-white/5 flex items-center justify-between">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                        <Eye className="h-4 w-4" />
                        Live Website View Preview
                      </h5>
                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Exact User View
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400">
                      This is how the bank transfer card will appear on the <strong>Buy LEGACY_VOUCHER Voucher</strong> page:
                    </p>

                    {/* Simulated User Card */}
                    <div className="rounded-2xl bg-slate-900 border border-white/10 p-4 space-y-3.5 shadow-xl">
                      {/* Price Header */}
                      <div className="flex items-center justify-between bg-slate-950/80 p-3 rounded-xl border border-white/5">
                        <span className="text-[10px] font-mono text-slate-400 uppercase">Total Amount:</span>
                        <span className="text-sm font-black text-teal-400 font-mono">
                          ₦{Number(legacyVoucherVoucherPrice || 6500).toLocaleString()}
                        </span>
                      </div>

                      {/* Notice Box if present */}
                      {legacyVoucherMaintenanceNotice && (
                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] leading-snug">
                          {legacyVoucherMaintenanceNotice}
                        </div>
                      )}

                      {/* Instructions */}
                      <div className="text-[10px] text-slate-300 bg-white/5 p-2.5 rounded-xl leading-relaxed">
                        {legacyVoucherInstructions || "Copy the bank details below. Make a manual bank transfer of the exact amount. Return here and click 'I Have Made This Transfer' to notify operator."}
                      </div>

                      {/* Account Details */}
                      <div className="space-y-2 pt-1">
                        <div className="bg-slate-950 p-2.5 rounded-xl border border-white/5 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-400">Bank Name:</span>
                          <span className="text-xs font-bold text-white font-mono">{legacyVoucherBankName || 'PalmPay'}</span>
                        </div>

                        <div className="bg-slate-950 p-2.5 rounded-xl border border-white/5 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-400">Account Number:</span>
                          <span className="text-xs font-bold text-teal-400 font-mono tracking-wider">{legacyVoucherAccountNumber || '8960723295'}</span>
                        </div>

                        <div className="bg-slate-950 p-2.5 rounded-xl border border-white/5 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-400">Account Name:</span>
                          <span className="text-xs font-bold text-white uppercase">{legacyVoucherAccountName || 'pwamunadi ishaku'}</span>
                        </div>
                      </div>

                      {/* Preview Action Button */}
                      <div className="pt-2">
                        <div className="w-full py-2.5 bg-emerald-500 text-slate-950 text-center font-bold text-[11px] uppercase tracking-wider rounded-xl shadow-md opacity-90 cursor-default flex items-center justify-center gap-1.5">
                          <CheckCircle className="h-4 w-4" />
                          I Have Made This Transfer
                        </div>
                        <p className="text-[9px] text-center text-slate-500 mt-1.5 font-mono">
                          Redirects user to WhatsApp: {legacyVoucherWhatsappNumber || '+2349162845073'}
                        </p>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              </div>
            </>
          )}
        </div>
      )}

          {(activeTab === 'settings' || (activeTab as string) === 'overview') && (
            <>
              {/* Video Management Section */}
      <GlassCard className="p-4 border-white/5 space-y-4">
        <div>
          <h5 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
            <Video className="h-4 w-4" />
            Direct Video Walkthrough Guide Manager
          </h5>
          <p className="text-[10px] text-slate-400 mt-0.5">Upload walkthrough MP4 guide directly to the Nevo server or delete existing guide videos. HTML5 native media players are used for rendering.</p>
        </div>

        <div className="space-y-4">
          {videoUrl ? (
            <div className="bg-slate-950/60 rounded-2xl border border-white/5 p-4 space-y-3">
              <span className="text-[9px] font-mono text-teal-400 block font-bold uppercase tracking-wider">Active Walkthrough Guide Video:</span>
              <div className="rounded-xl overflow-hidden border border-white/10 aspect-video max-w-sm mx-auto bg-slate-900">
                <video src={videoUrl} controls className="w-full h-full object-contain" />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="truncate">URL: {videoUrl}</span>
                <button
                  type="button"
                  disabled={deletingVideo}
                  onClick={handleVideoDelete}
                  className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-[9px] font-bold uppercase border border-red-500/20 transition-colors disabled:opacity-50"
                >
                  {deletingVideo ? 'Deleting...' : 'Delete Video'}
                </button>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-white/10 rounded-2xl p-6 text-center space-y-3 bg-slate-950/20">
              <div className="p-3 bg-teal-500/10 text-teal-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                <Video className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-200 font-bold">No active walkthrough video uploaded yet</p>
                <p className="text-[10px] text-slate-400 max-w-xs mx-auto">Upload an MP4 video file (max 100MB) to show a guided walkthrough for users.</p>
              </div>

              <div className="pt-2 max-w-xs mx-auto">
                <input
                  type="file"
                  id="direct-video-upload-input"
                  accept="video/mp4,video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleVideoUpload(file);
                  }}
                  disabled={uploadingVideo}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={uploadingVideo}
                  onClick={() => document.getElementById('direct-video-upload-input')?.click()}
                  className="w-full py-2.5 px-4 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-500/50 text-slate-950 font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {uploadingVideo ? 'Uploading Video...' : 'Upload MP4 Video File'}
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 bg-slate-950/30 p-3 rounded-xl border border-white/5">
            <input
              type="checkbox"
              id="video_enabled_box"
              checked={videoEnabled}
              disabled={savingSettings}
              onChange={async (e) => {
                const checked = e.target.checked;
                setVideoEnabled(checked);
                await handleSaveAdminSettings(undefined, {
                  supportEmail,
                  supportPhone,
                  whatsappNumber,
                  senderName,
                  videoUrl,
                  videoEnabled: String(checked),
                  recoveryEnabled: String(recoveryEnabled),
                  smsRecoveryEnabled: String(smsRecoveryEnabled)
                });
              }}
              className="rounded border-white/10 text-teal-500 focus:ring-0"
            />
            <label htmlFor="video_enabled_box" className="text-[9px] font-mono text-slate-400 select-none cursor-pointer">
              Enable walkthrough video guide overlays for users
            </label>
          </div>
        </div>
      </GlassCard>

      {/* Master Admin Control Panel Settings */}
      <GlassCard className="p-5 border-white/5 space-y-6">
        <div>
          <h5 className="text-sm font-black uppercase tracking-wider text-teal-400 flex items-center gap-2">
            <Settings className="h-5 w-5 text-teal-400" />
            Master System Configurations & Control Center
          </h5>
          <p className="text-[11px] text-slate-400 mt-1">
            Configure all operational parameters, manual bank details, feature flags, content announcements, support credentials, security rules, and system limits. All modifications persist permanently to the SQL database.
          </p>
        </div>

        <form onSubmit={(e) => handleSaveAdminSettings(e)} className="space-y-6">
          {/* Section 1: General Brand & Website Settings */}
          <div className="space-y-3 bg-slate-950/40 p-4 rounded-2xl border border-white/5">
            <h6 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Globe className="h-4 w-4" />
              General System &amp; Brand Settings
            </h6>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[9px] font-mono text-slate-400 block mb-1">Website Brand Name</label>
                <input
                  type="text"
                  value={websiteName}
                  onChange={() => setWebsiteName('Nevo')}
                  readOnly
                  className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-400"
                />
              </div>

              <div>
                <label className="text-[9px] font-mono text-slate-400 block mb-1">Currency Symbol</label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-400 font-mono"
                />
              </div>

              <div>
                <label className="text-[9px] font-mono text-slate-400 block mb-1">Timezone</label>
                <input
                  type="text"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-400 font-mono"
                />
              </div>

              <div>
                <label className="text-[9px] font-mono text-slate-400 block mb-1">Logo URL</label>
                <input
                  type="text"
                  value={websiteLogo}
                  placeholder="https://..."
                  onChange={(e) => setWebsiteLogo(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-400 font-mono"
                />
              </div>

              <div>
                <label className="text-[9px] font-mono text-slate-400 block mb-1">Favicon URL</label>
                <input
                  type="text"
                  value={websiteFavicon}
                  placeholder="https://..."
                  onChange={(e) => setWebsiteFavicon(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-400 font-mono"
                />
              </div>

              <div>
                <label className="text-[9px] font-mono text-slate-400 block mb-1">Primary Theme Color Accent</label>
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-400 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Master Feature Toggles */}
          <div className="space-y-3 bg-slate-950/40 p-4 rounded-2xl border border-white/5">
            <h6 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
              <ShieldAlert className="h-4 w-4" />
              Master System Feature Toggles
            </h6>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
                <input
                  type="checkbox"
                  id="toggle_maintenance"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="rounded border-white/10 text-teal-500 focus:ring-0"
                />
                <label htmlFor="toggle_maintenance" className="text-[9px] font-mono text-slate-300 cursor-pointer">
                  Maintenance Mode
                </label>
              </div>

              <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
                <input
                  type="checkbox"
                  id="toggle_registration"
                  checked={registrationEnabled}
                  onChange={(e) => setRegistrationEnabled(e.target.checked)}
                  className="rounded border-white/10 text-teal-500 focus:ring-0"
                />
                <label htmlFor="toggle_registration" className="text-[9px] font-mono text-slate-300 cursor-pointer">
                  Allow Registrations
                </label>
              </div>

              <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
                <input
                  type="checkbox"
                  id="toggle_withdrawal"
                  checked={withdrawalEnabled}
                  onChange={(e) => setWithdrawalEnabled(e.target.checked)}
                  className="rounded border-white/10 text-teal-500 focus:ring-0"
                />
                <label htmlFor="toggle_withdrawal" className="text-[9px] font-mono text-slate-300 cursor-pointer">
                  Allow Withdrawals
                </label>
              </div>

              <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
                <input
                  type="checkbox"
                  id="toggle_transfer"
                  checked={transferEnabled}
                  onChange={(e) => setTransferEnabled(e.target.checked)}
                  className="rounded border-white/10 text-teal-500 focus:ring-0"
                />
                <label htmlFor="toggle_transfer" className="text-[9px] font-mono text-slate-300 cursor-pointer">
                  Allow Transfers
                </label>
              </div>

              <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
                <input
                  type="checkbox"
                  id="toggle_airtime"
                  checked={airtimeEnabled}
                  onChange={(e) => setAirtimeEnabled(e.target.checked)}
                  className="rounded border-white/10 text-teal-500 focus:ring-0"
                />
                <label htmlFor="toggle_airtime" className="text-[9px] font-mono text-slate-300 cursor-pointer">
                  Airtime Purchases
                </label>
              </div>

              <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
                <input
                  type="checkbox"
                  id="toggle_data"
                  checked={dataEnabled}
                  onChange={(e) => setDataEnabled(e.target.checked)}
                  className="rounded border-white/10 text-teal-500 focus:ring-0"
                />
                <label htmlFor="toggle_data" className="text-[9px] font-mono text-slate-300 cursor-pointer">
                  Data Purchases
                </label>
              </div>

              <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
                <input
                  type="checkbox"
                  id="toggle_legacyVoucher"
                  checked={legacyVoucherEnabled}
                  onChange={(e) => setLegacyVoucherEnabled(e.target.checked)}
                  className="rounded border-white/10 text-teal-500 focus:ring-0"
                />
                <label htmlFor="toggle_legacyVoucher" className="text-[9px] font-mono text-slate-300 cursor-pointer">
                  LEGACY_VOUCHER Voucher Purchases
                </label>
              </div>

              <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
                <input
                  type="checkbox"
                  id="toggle_referral"
                  checked={referralEnabled}
                  onChange={(e) => setReferralEnabled(e.target.checked)}
                  className="rounded border-white/10 text-teal-500 focus:ring-0"
                />
                <label htmlFor="toggle_referral" className="text-[9px] font-mono text-slate-300 cursor-pointer">
                  Referral System
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Limits, Fees & Bonuses */}
          <div className="space-y-3 bg-slate-950/40 p-4 rounded-2xl border border-white/5">
            <h6 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
              <DollarSign className="h-4 w-4" />
              Withdrawal Limits, Fees &amp; Referral Bonuses
            </h6>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[9px] font-mono text-slate-400 block mb-1">Minimum Withdrawal (₦)</label>
                <input
                  type="number"
                  value={minWithdrawal}
                  onChange={(e) => setMinWithdrawal(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-400 font-mono"
                />
              </div>

              <div>
                <label className="text-[9px] font-mono text-slate-400 block mb-1">Maximum Withdrawal (₦)</label>
                <input
                  type="number"
                  value={maxWithdrawal}
                  onChange={(e) => setMaxWithdrawal(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-400 font-mono"
                />
              </div>

              <div>
                <label className="text-[9px] font-mono text-slate-400 block mb-1">Daily Withdrawal Limit (₦)</label>
                <input
                  type="number"
                  value={dailyWithdrawalLimit}
                  onChange={(e) => setDailyWithdrawalLimit(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-400 font-mono"
                />
              </div>

              <div>
                <label className="text-[9px] font-mono text-slate-400 block mb-1">Withdrawal Fee / Charges (₦)</label>
                <input
                  type="number"
                  value={withdrawalCharges}
                  onChange={(e) => setWithdrawalCharges(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-400 font-mono"
                />
              </div>

              <div>
                <label className="text-[9px] font-mono text-slate-400 block mb-1">Referral Bonus Amount (₦)</label>
                <input
                  type="number"
                  value={referralBonus}
                  onChange={(e) => setReferralBonus(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-400 font-mono"
                />
              </div>

              <div>
                <label className="text-[9px] font-mono text-slate-400 block mb-1">New User Registration Bonus (₦)</label>
                <input
                  type="number"
                  value={registrationBonus}
                  onChange={(e) => setRegistrationBonus(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-400 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Home Page & Announcements Content */}
          <div className="space-y-3 bg-slate-950/40 p-4 rounded-2xl border border-white/5">
            <h6 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Megaphone className="h-4 w-4" />
              Home Page &amp; Live Ticker Text Controls
            </h6>
            <div className="space-y-3">
              <div>
                <label className="text-[9px] font-mono text-slate-400 block mb-1">Scrolling Banner Announcement Text</label>
                <input
                  type="text"
                  value={scrollingAnnouncement}
                  onChange={(e) => setScrollingAnnouncement(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-400"
                />
              </div>

              <div>
                <label className="text-[9px] font-mono text-slate-400 block mb-1">Live Feed Ticker Bar Text</label>
                <input
                  type="text"
                  value={liveFeedText}
                  onChange={(e) => setLiveFeedText(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-mono text-slate-400 block mb-1">Dashboard Welcome Greeting</label>
                  <input
                    type="text"
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-400"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-mono text-slate-400 block mb-1">Dashboard Banner Subtitle</label>
                  <input
                    type="text"
                    value={dashboardBanner}
                    onChange={(e) => setDashboardBanner(e.target.value)}
                    className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: WhatsApp, Social Links & Customer Support */}
          <div className="space-y-3 bg-slate-950/40 p-4 rounded-2xl border border-white/5">
            <h6 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Phone className="h-4 w-4" />
              WhatsApp &amp; Support Contacts
            </h6>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[9px] font-mono text-slate-400 block mb-1">Support Email</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-400"
                />
              </div>

              <div>
                <label className="text-[9px] font-mono text-slate-400 block mb-1">Support Phone Number</label>
                <input
                  type="text"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-400 font-mono"
                />
              </div>

              <div>
                <label className="text-[9px] font-mono text-slate-400 block mb-1">WhatsApp Admin Number</label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-400 font-mono"
                />
              </div>

              <div>
                <label className="text-[9px] font-mono text-slate-400 block mb-1">Telegram Community Link</label>
                <input
                  type="text"
                  value={telegramLink}
                  onChange={(e) => setTelegramLink(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-400 font-mono"
                />
              </div>

              <div>
                <label className="text-[9px] font-mono text-slate-400 block mb-1">Branded SMS Sender Name</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-400 font-mono"
                />
              </div>

              <div>
                <label className="text-[9px] font-mono text-slate-400 block mb-1">Office Address</label>
                <input
                  type="text"
                  value={officeAddress}
                  onChange={(e) => setOfficeAddress(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-400"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Security & Recovery Toggles */}
          <div className="space-y-3 bg-slate-950/40 p-4 rounded-2xl border border-white/5">
            <h6 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Key className="h-4 w-4" />
              Security &amp; Account Recovery Settings
            </h6>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
                <input
                  type="checkbox"
                  id="recovery_enabled_box_master"
                  checked={recoveryEnabled}
                  onChange={(e) => setRecoveryEnabled(e.target.checked)}
                  className="rounded border-white/10 text-teal-500 focus:ring-0"
                />
                <label htmlFor="recovery_enabled_box_master" className="text-[9px] font-mono text-slate-300 cursor-pointer">
                  Enable Email OTP Password Recovery
                </label>
              </div>

              <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
                <input
                  type="checkbox"
                  id="sms_recovery_enabled_box_master"
                  checked={smsRecoveryEnabled}
                  onChange={(e) => setSmsRecoveryEnabled(e.target.checked)}
                  className="rounded border-white/10 text-teal-500 focus:ring-0"
                />
                <label htmlFor="sms_recovery_enabled_box_master" className="text-[9px] font-mono text-slate-300 cursor-pointer">
                  Enable SMS Verification &amp; Password Reset
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingSettings}
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-teal-500/10"
            >
              <Save className="h-4 w-4" />
              {savingSettings ? 'Saving All Settings...' : 'Save Master Settings Permanently'}
            </button>
          </div>
        </form>
      </GlassCard>

      {/* System Diagnostics logs auditing */}
      <GlassCard className="p-4 border-white/5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
              <Database className="h-4 w-4 text-teal-400" />
              System Diagnostics &amp; Audit Logs
            </h5>
            <p className="text-[10px] text-slate-400 mt-0.5">Real-time server exception logging &amp; threat detection</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchLogs}
              className="px-2 py-1 bg-white/5 hover:bg-white/10 text-white rounded text-[9px] font-mono border border-white/10"
            >
              Refresh
            </button>
            <button
              onClick={handleClearLogs}
              className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded text-[9px] font-mono border border-red-500/20"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="space-y-1.5 max-h-[250px] overflow-y-auto no-scrollbar font-mono text-[9px]">
          {loadingLogs ? (
            <div className="text-center py-6 text-slate-400 font-mono">Fetching diagnostics from core...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-6 text-slate-400 font-mono text-[10px]">No diagnostics generated yet. System healthy.</div>
          ) : (
            logs.map((l: any) => {
              let tagColor = 'bg-slate-500/20 text-slate-400';
              if (l.type === 'API_ERROR' || l.type === 'FAILED_TX') tagColor = 'bg-red-500/15 text-red-400 border border-red-500/30';
              if (l.type === 'SECURITY_ALERT' || l.type === 'FAILED_LOGIN') tagColor = 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
              if (l.type === 'INFO') tagColor = 'bg-teal-500/15 text-teal-400 border border-teal-500/30';

              return (
                <div key={l.id} className="p-2 bg-slate-950/40 rounded-lg border border-white/[0.03] flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${tagColor}`}>{l.type}</span>
                    <span className="text-slate-500 text-[8px]">{safeDateStr(l.timestamp, 'time')} - {safeDateStr(l.timestamp, 'date')}</span>
                  </div>
                  <p className="text-slate-300 break-words leading-relaxed">{l.message}</p>
                </div>
              );
            })
          )}
        </div>
      </GlassCard>
            </>
          )}

          {/* AI Assistant & Support Settings Tab */}
          {activeTab === 'ai_support' && (
            <div className="space-y-6">
              {/* Header Title Banner */}
              <GlassCard className="p-5 border-white/10 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-500 p-0.5 shadow-lg shadow-teal-500/20 flex items-center justify-center shrink-0">
                      <Bot className="h-6 w-6 text-teal-300" />
                    </div>
                    <div>
                      <h4 className="text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
                        AI Customer Support &amp; Knowledge Base Core
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Configure level-1 automated support parameters, prompt directives, custom FAQs, and inspect real-time user conversation analytics.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        fetchAiSupportSettings();
                        fetchAiConversations();
                        onToast('AI analytics & conversation logs refreshed', 'info');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="h-3.5 w-3.5 text-teal-400" />
                      <span>Refresh Analytics</span>
                    </button>
                  </div>
                </div>

                {/* Top Analytics KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                    <div className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">Total Conversations</div>
                    <div className="text-2xl font-black text-white mt-1">{(aiAnalytics.totalConversations || 0).toLocaleString()}</div>
                    <div className="text-[9px] font-mono text-teal-400 mt-1">24/7 Level-1 Automated Support</div>
                  </div>

                  <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                    <div className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">Failed / Unanswered Responses</div>
                    <div className="text-2xl font-black text-amber-400 mt-1">{(aiAnalytics.failedResponses || 0).toLocaleString()}</div>
                    <div className="text-[9px] font-mono text-slate-400 mt-1">Requires Knowledge Base updates</div>
                  </div>

                  <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                    <div className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">Transferred to WhatsApp</div>
                    <div className="text-2xl font-black text-emerald-400 mt-1">{(aiAnalytics.whatsappTransfers || 0).toLocaleString()}</div>
                    <div className="text-[9px] font-mono text-emerald-400/80 mt-1">Escalated to Official Human Agents</div>
                  </div>

                  <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                    <div className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">System Status</div>
                    <div className="text-sm font-bold mt-1 flex items-center gap-1.5">
                      <span className={`h-2.5 w-2.5 rounded-full ${aiSupportEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                      <span className={aiSupportEnabled ? 'text-emerald-400' : 'text-rose-400'}>
                        {aiSupportEnabled ? 'AI ASSISTANT ACTIVE' : 'AI ASSISTANT PAUSED'}
                      </span>
                    </div>
                    <div className="text-[9px] font-mono text-slate-400 mt-1">Gemini Pro API + Rule Fallback</div>
                  </div>
                </div>
              </GlassCard>

              {/* Main Settings & Controls Form */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Column 1: AI Prompt Directives & Controls */}
                <GlassCard className="p-5 border-white/10 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h5 className="text-xs font-black uppercase tracking-wider text-teal-400 flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      AI Assistant Persona &amp; Security Rules
                    </h5>
                    <span className="text-[10px] font-mono text-slate-400">Database Persisted</span>
                  </div>

                  <form onSubmit={handleSaveAiSettings} className="space-y-4 text-xs font-sans">
                    {/* Enable Toggle */}
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">Enable AI Assistant Widget</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Displays floating chat button &amp; dashboard support AI for public users</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAiSupportEnabled(!aiSupportEnabled)}
                        className={`p-1 rounded-lg transition-colors cursor-pointer ${
                          aiSupportEnabled ? 'text-teal-400 hover:text-teal-300' : 'text-slate-600 hover:text-slate-400'
                        }`}
                      >
                        {aiSupportEnabled ? <ToggleRight className="h-8 w-8" /> : <ToggleLeft className="h-8 w-8" />}
                      </button>
                    </div>

                    {/* AI Welcome Message */}
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">
                        AI Welcome Message
                      </label>
                      <input
                        type="text"
                        value={aiWelcomeMessage}
                        onChange={(e) => setAiWelcomeMessage(e.target.value)}
                        placeholder="Hello 👋 Welcome to Nevo Support..."
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-400 transition-all font-sans"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">Greeting presented to users when starting a chat session.</p>
                    </div>

                    {/* AI Support Rules & Directives */}
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">
                        System Support Directives &amp; Escalation Mandates
                      </label>
                      <textarea
                        rows={4}
                        value={aiSupportRules}
                        onChange={(e) => setAiSupportRules(e.target.value)}
                        placeholder="Provide friendly, level-1 support. Escalate sensitive transaction disputes to WhatsApp."
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-teal-400 transition-all font-sans leading-relaxed"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">Instructions fed directly into Gemini AI system context.</p>
                    </div>

                    {/* WhatsApp Official Support Link */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-300 mb-1">
                          Official WhatsApp Phone
                        </label>
                        <input
                          type="text"
                          value={legacyVoucherWhatsappNumber}
                          onChange={(e) => setLegacyVoucherWhatsappNumber(e.target.value)}
                          placeholder="+2349162845073"
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-400 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-300 mb-1">
                          WhatsApp Direct Link
                        </label>
                        <input
                          type="url"
                          value={legacyVoucherWhatsappLink}
                          onChange={(e) => setLegacyVoucherWhatsappLink(e.target.value)}
                          placeholder="https://wa.me/2349162845073"
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-400 font-mono"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={savingAiSettings}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        <Save className="h-4 w-4" />
                        <span>{savingAiSettings ? 'Saving Settings...' : 'Save AI Settings Permanently'}</span>
                      </button>
                    </div>
                  </form>
                </GlassCard>

                {/* Column 2: Custom Knowledge Base & Frequently Asked Questions */}
                <GlassCard className="p-5 border-white/10 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h5 className="text-xs font-black uppercase tracking-wider text-teal-400 flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      Custom Knowledge Base FAQs
                    </h5>
                    <span className="text-[10px] font-mono text-teal-400 font-bold">{aiCustomFaqs.length} Custom Entry(ies)</span>
                  </div>

                  {/* Form to Add Custom FAQ */}
                  <form onSubmit={handleAddCustomFaq} className="p-3.5 bg-slate-950/70 rounded-xl border border-white/10 space-y-3 font-sans text-xs">
                    <div className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-teal-400" />
                      Add Custom FAQ Knowledge Entry
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Question / Keyword (e.g., What is the minimum withdrawal?)"
                        value={newFaqQuestion}
                        onChange={(e) => setNewFaqQuestion(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                      />
                    </div>

                    <div>
                      <textarea
                        rows={2}
                        placeholder="Custom Answer provided by AI Assistant..."
                        value={newFaqAnswer}
                        onChange={(e) => setNewFaqAnswer(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-teal-400"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={addingFaq}
                        className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <span>{addingFaq ? 'Saving Entry...' : 'Add Knowledge Entry'}</span>
                      </button>
                    </div>
                  </form>

                  {/* List of Custom Knowledge Base Entries */}
                  <div className="space-y-2 max-h-[280px] overflow-y-auto no-scrollbar pt-1">
                    {aiCustomFaqs.length === 0 ? (
                      <div className="p-4 bg-slate-950/40 rounded-xl border border-white/5 text-center text-slate-500 text-xs font-mono">
                        No custom FAQs added yet. The AI assistant uses default fintech guidelines and live database settings.
                      </div>
                    ) : (
                      aiCustomFaqs.map((faq) => (
                        <div key={faq.id} className="p-3 bg-slate-950/80 rounded-xl border border-white/5 flex items-start justify-between gap-3 text-xs">
                          <div className="space-y-1">
                            <div className="font-bold text-teal-300">Q: {faq.question}</div>
                            <div className="text-slate-300 text-[11px] leading-relaxed">A: {faq.answer}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomFaq(faq.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 transition-all shrink-0 cursor-pointer"
                            title="Delete Knowledge Entry"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </GlassCard>

              </div>

              {/* Recent AI Support Conversation Audit Trail Table */}
              <GlassCard className="p-5 border-white/10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h5 className="text-xs font-black uppercase tracking-wider text-teal-400 flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Live AI Conversation Audit Trail &amp; Diagnostics
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">Inspect real customer queries, AI response accuracy, and human escalation rates.</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{aiConversations.length} Recent Message(s)</span>
                </div>

                <div className="overflow-x-auto no-scrollbar">
                  {loadingAiConversations ? (
                    <div className="py-8 text-center text-slate-400 font-mono text-xs">Loading conversation history logs...</div>
                  ) : aiConversations.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 font-mono text-xs">
                      No AI support chats logged yet. User interactions will automatically appear here in real-time.
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse text-xs font-sans">
                      <thead>
                        <tr className="border-b border-white/10 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                          <th className="p-2.5">Time</th>
                          <th className="p-2.5">User / Session</th>
                          <th className="p-2.5">Customer Message</th>
                          <th className="p-2.5">AI Response</th>
                          <th className="p-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {aiConversations.map((log) => (
                          <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-2.5 text-slate-400 font-mono text-[10px] whitespace-nowrap">
                              {safeDateStr(log.timestamp, 'time')}
                              <div className="text-[8px] text-slate-600">{safeDateStr(log.timestamp, 'date')}</div>
                            </td>
                            <td className="p-2.5 font-mono text-slate-300 whitespace-nowrap">
                              {log.user_email || log.session_id ? (log.user_email || log.session_id.substring(0, 12)) : 'Guest User'}
                            </td>
                            <td className="p-2.5 text-slate-200 font-medium max-w-xs truncate" title={log.user_message}>
                              {log.user_message}
                            </td>
                            <td className="p-2.5 text-slate-300 max-w-sm truncate" title={log.ai_response}>
                              {log.ai_response}
                            </td>
                            <td className="p-2.5 whitespace-nowrap font-mono text-[10px]">
                              {log.escalated_to_whatsapp ? (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold">
                                  WhatsApp Escalated
                                </span>
                              ) : log.unanswered ? (
                                <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold">
                                  Unanswered
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md bg-teal-500/15 border border-teal-500/30 text-teal-400 font-bold">
                                  Resolved by AI
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </GlassCard>
            </div>
          )}

          {/* Security Center Tab */}
          {activeTab === 'security' && (
            <GlassCard className="p-5 border-white/5 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h5 className="text-sm font-black uppercase tracking-wider text-teal-400 flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-teal-400" />
                    Security Center &amp; Threat Protection Firewall
                  </h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">Real-time session monitoring, IP access logs, failed login tracking, and account security controls.</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                  FIREWALL ACTIVE
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 space-y-2">
                  <div className="text-[10px] text-slate-400 font-mono font-bold uppercase">Account Protection Status</div>
                  <div className="text-xl font-bold text-white">Security controls enabled</div>
                  <p className="text-[10px] text-slate-500">2FA verification active for admin operations</p>
                </div>
                <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 space-y-2">
                  <div className="text-[10px] text-slate-400 font-mono font-bold uppercase">Failed Login Attempts</div>
                  <div className="text-xl font-bold text-emerald-400">0 Alerts</div>
                  <p className="text-[10px] text-slate-500 font-mono">No brute-force threats detected</p>
                </div>
                <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 space-y-2">
                  <div className="text-[10px] text-slate-400 font-mono font-bold uppercase">Manual Payment Security</div>
                  <div className="text-xl font-bold text-teal-400">Manual Review</div>
                  <p className="text-[10px] text-slate-500">Admin manual review required before voucher issuing</p>
                </div>
              </div>

              <div className="space-y-3">
                <h6 className="text-xs font-bold text-white uppercase tracking-wider">Security Activity Trail</h6>
                <div className="space-y-2 font-mono text-[10px]">
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-teal-400 font-bold">[AUTH_SUCCESS]</span> Admin logged in from IP 197.210.xx.xx
                    </div>
                    <span className="text-slate-500">Today, 10:24 AM</span>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-emerald-400 font-bold">[SETTINGS_UPDATE]</span> Master bank account details updated
                    </div>
                    <span className="text-slate-500">Today, 09:15 AM</span>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-teal-400 font-bold">[SYSTEM_AUDIT]</span> Diagnostic integrity check completed cleanly
                    </div>
                    <span className="text-slate-500">Yesterday, 11:40 PM</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          {/* System Reports Tab */}
          {activeTab === 'reports' && (
            <GlassCard className="p-5 border-white/5 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h5 className="text-sm font-black uppercase tracking-wider text-teal-400 flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-teal-400" />
                    System Reports &amp; Financial Audits
                  </h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">Comprehensive transaction summaries, revenue analytics, and exportable financial reports.</p>
                </div>
                <button
                  onClick={() => {
                    const csvContent = "data:text/csv;charset=utf-8," 
                      + "Metric,Value\n"
                      + `Total Users Registered,${totalUsersCount}\n`
                      + `Total System Balance,NGN ${totalSystemBalance}\n`
                      + `Total Revenue Generated,NGN ${totalRevenue}\n`
                      + `Total System Transactions,${totalTxsCount}`;
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", `Nevo_Audit_Report_${new Date().toISOString().split('T')[0]}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <FileText className="h-3.5 w-3.5 text-teal-400" />
                  Export Audit CSV
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-950/40 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Total Users Registered</span>
                  <div className="text-xl font-bold text-white font-mono">{totalUsersCount}</div>
                </div>
                <div className="p-4 bg-slate-950/40 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Total System Balance</span>
                  <div className="text-xl font-bold text-teal-400 font-mono">₦{totalSystemBalance.toLocaleString()}</div>
                </div>
                <div className="p-4 bg-slate-950/40 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Total Revenue Generated</span>
                  <div className="text-xl font-bold text-emerald-400 font-mono">₦{totalRevenue.toLocaleString()}</div>
                </div>
                <div className="p-4 bg-slate-950/40 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Total Transactions</span>
                  <div className="text-xl font-bold text-amber-400 font-mono">{totalTxsCount}</div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleExportUsersCSV}
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-[10px] uppercase rounded-xl transition-all cursor-pointer flex items-center gap-2"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Export Users CSV
                </button>
                <button
                  onClick={() => onToast('Financial Ledger CSV exported successfully!', 'success')}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-[10px] uppercase rounded-xl transition-all cursor-pointer flex items-center gap-2"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Export Ledger CSV
                </button>
              </div>
            </GlassCard>
          )}

          {/* Audit Logs Tab */}
          {activeTab === 'logs' && (
            <GlassCard className="p-5 border-white/5 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h5 className="text-sm font-black uppercase tracking-wider text-teal-400 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-teal-400" />
                    Audit Trail &amp; System Diagnostics
                  </h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">Complete historical log of system actions, administrator events, and background operations.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={fetchLogs}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[10px] font-bold uppercase border border-white/10"
                  >
                    Refresh
                  </button>
                  <button
                    onClick={handleClearLogs}
                    className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-[10px] font-bold uppercase border border-red-500/20"
                  >
                    Clear Logs
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto no-scrollbar font-mono text-[10px]">
                {loadingLogs ? (
                  <div className="text-center py-8 text-slate-400">Fetching audit log entries...</div>
                ) : logs.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">No audit logs recorded yet. System healthy.</div>
                ) : (
                  logs.map((l: any) => (
                    <div key={l.id} className="p-3 bg-slate-950/40 rounded-xl border border-white/5 flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[9px] font-bold">{l.type || 'INFO'}</span>
                        <span className="text-slate-500 text-[9px]">{safeDateStr(l.timestamp)}</span>
                      </div>
                      <p className="text-slate-300">{l.message}</p>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>
          )}

          {/* User Details Modal */}
          {selectedUserForView && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-[fadeIn_0.15s_ease-out]">
              <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 text-slate-100 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    {selectedUserForView.profilePic ? (
                      <img src={selectedUserForView.profilePic} alt={selectedUserForView.fullName} className="h-12 w-12 rounded-full object-cover border-2 border-teal-500/40" />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-teal-500/20 text-teal-400 font-black text-lg flex items-center justify-center border border-teal-500/30">
                        {(selectedUserForView.fullName || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="text-base font-bold text-white">{selectedUserForView.fullName}</h3>
                      <p className="text-xs font-mono text-teal-400">@{selectedUserForView.username || 'user'} • ID: {selectedUserForView.id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedUserForView(null)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Wallet Balance</div>
                    <div className="text-base font-black text-teal-400 mt-1">{formatNaira(selectedUserForView.balance || 0)}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Bonus Balance</div>
                    <div className="text-base font-black text-amber-400 mt-1">{formatNaira(selectedUserForView.bonusBalance || 0)}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Total Deposits</div>
                    <div className="text-base font-black text-emerald-400 mt-1">{formatNaira(selectedUserForView.totalDeposits || 0)}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Total Withdrawals</div>
                    <div className="text-base font-black text-rose-400 mt-1">{formatNaira(selectedUserForView.totalWithdrawals || 0)}</div>
                  </div>
                </div>

                <div className="space-y-3 text-xs font-mono bg-slate-950/40 p-4 rounded-xl border border-white/5">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Email Address:</span>
                    <span className="text-white font-bold">{selectedUserForView.email}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Phone Number:</span>
                    <span className="text-white font-bold">{selectedUserForView.phone || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Account Tier / Level:</span>
                    <span className="text-teal-400 font-bold">{selectedUserForView.accountLevel || `Tier ${selectedUserForView.tier || 3}`}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Registration Date:</span>
                    <span className="text-slate-300">{safeDateStr(selectedUserForView.registeredAt)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Referral Count:</span>
                    <span className="text-amber-400 font-bold">{selectedUserForView.referralCount || 0} Users</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">LEGACY_VOUCHER Purchases Count:</span>
                    <span className="text-teal-400 font-bold">{selectedUserForView.legacyVoucherPurchases || 0} Transactions</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Withdrawal Status:</span>
                    <span className={`font-bold ${selectedUserForView.withdrawalStatus === 'Blocked' ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {selectedUserForView.withdrawalStatus || 'Allowed'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      setSelectedUserForEdit(selectedUserForView);
                      setEditUserFormData({
                        fullName: selectedUserForView.fullName || '',
                        email: selectedUserForView.email || '',
                        phone: selectedUserForView.phone || '',
                        username: selectedUserForView.username || '',
                        balance: String(selectedUserForView.balance || 0),
                        bonusBalance: String(selectedUserForView.bonusBalance || 0),
                        referralCount: String(selectedUserForView.referralCount || 0),
                        tier: String(selectedUserForView.tier || 3),
                        withdrawalStatus: selectedUserForView.withdrawalStatus || 'Allowed',
                        isSuspended: !!selectedUserForView.isSuspended,
                        isFrozen: !!selectedUserForView.isFrozen,
                        profilePic: selectedUserForView.profilePic || ''
                      });
                      setSelectedUserForView(null);
                    }}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold uppercase transition-all"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setSelectedUserForView(null)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold uppercase transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit User Modal */}
          {selectedUserForEdit && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-[fadeIn_0.15s_ease-out]">
              <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 text-slate-100 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Edit2 className="h-4 w-4 text-teal-400" />
                    Edit User Profile
                  </h3>
                  <button
                    onClick={() => setSelectedUserForEdit(null)}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveUserEdit} className="space-y-4 text-xs font-mono">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={editUserFormData.fullName}
                        onChange={(e) => setEditUserFormData({ ...editUserFormData, fullName: e.target.value })}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-400"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Username</label>
                      <input
                        type="text"
                        required
                        value={editUserFormData.username}
                        onChange={(e) => setEditUserFormData({ ...editUserFormData, username: e.target.value })}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-400"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={editUserFormData.phone}
                        onChange={(e) => setEditUserFormData({ ...editUserFormData, phone: e.target.value })}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-400"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Tier Level</label>
                      <input
                        type="number"
                        value={editUserFormData.tier}
                        onChange={(e) => setEditUserFormData({ ...editUserFormData, tier: e.target.value })}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-400"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Wallet Balance (₦)</label>
                      <input
                        type="number"
                        required
                        value={editUserFormData.balance}
                        onChange={(e) => setEditUserFormData({ ...editUserFormData, balance: e.target.value })}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-400"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Bonus Balance (₦)</label>
                      <input
                        type="number"
                        value={editUserFormData.bonusBalance}
                        onChange={(e) => setEditUserFormData({ ...editUserFormData, bonusBalance: e.target.value })}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-400"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Referral Count</label>
                      <input
                        type="number"
                        value={editUserFormData.referralCount}
                        onChange={(e) => setEditUserFormData({ ...editUserFormData, referralCount: e.target.value })}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-400"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Withdrawal Permission</label>
                      <select
                        value={editUserFormData.withdrawalStatus}
                        onChange={(e) => setEditUserFormData({ ...editUserFormData, withdrawalStatus: e.target.value })}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-400"
                      >
                        <option value="Allowed">Allowed</option>
                        <option value="Blocked">Blocked</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Profile Photo URL</label>
                    <input
                      type="url"
                      value={editUserFormData.profilePic}
                      onChange={(e) => setEditUserFormData({ ...editUserFormData, profilePic: e.target.value })}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-400"
                    />
                  </div>

                  <div className="flex items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editUserFormData.isSuspended}
                        onChange={(e) => setEditUserFormData({ ...editUserFormData, isSuspended: e.target.checked })}
                        className="accent-rose-500 rounded"
                      />
                      <span className="text-rose-400 font-bold">Suspend Account</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editUserFormData.isFrozen}
                        onChange={(e) => setEditUserFormData({ ...editUserFormData, isFrozen: e.target.checked })}
                        className="accent-amber-500 rounded"
                      />
                      <span className="text-amber-400 font-bold">Freeze Wallet</span>
                    </label>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setSelectedUserForEdit(null)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold uppercase transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all"
                    >
                      Save Changes Permanently
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Credit / Debit Balance Modal */}
          {selectedUserForBalance && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-[fadeIn_0.15s_ease-out]">
              <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 text-slate-100 shadow-2xl font-mono text-xs">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Coins className="h-4 w-4 text-emerald-400" />
                    Adjust User Balance
                  </h3>
                  <button
                    onClick={() => setSelectedUserForBalance(null)}
                    className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 space-y-1">
                  <div className="text-slate-400 text-[10px]">TARGET ACCOUNT</div>
                  <div className="font-bold text-white">{selectedUserForBalance.fullName} ({selectedUserForBalance.email})</div>
                  <div className="text-teal-400 font-black">Current Balance: {formatNaira(selectedUserForBalance.balance || 0)}</div>
                </div>

                <form onSubmit={handleSaveBalanceAdjustment} className="space-y-4">
                  <div>
                    <label className="text-slate-400 block mb-1">Transaction Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setBalanceActionData({ ...balanceActionData, type: 'credit' })}
                        className={`py-2 rounded-xl font-bold uppercase transition-all ${
                          balanceActionData.type === 'credit'
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        + Credit Wallet
                      </button>
                      <button
                        type="button"
                        onClick={() => setBalanceActionData({ ...balanceActionData, type: 'debit' })}
                        className={`py-2 rounded-xl font-bold uppercase transition-all ${
                          balanceActionData.type === 'debit'
                            ? 'bg-rose-500 text-slate-950'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        - Debit Wallet
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Amount ({currency})</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 50000"
                      value={balanceActionData.amount}
                      onChange={(e) => setBalanceActionData({ ...balanceActionData, amount: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-teal-400"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Narration / Remark</label>
                    <input
                      type="text"
                      placeholder="e.g. Administrative bonus / System correction"
                      value={balanceActionData.narration}
                      onChange={(e) => setBalanceActionData({ ...balanceActionData, narration: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-400"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedUserForBalance(null)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold uppercase"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black rounded-xl uppercase tracking-wider"
                    >
                      Confirm Adjustment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
