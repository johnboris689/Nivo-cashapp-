export type UserStatus = 'active' | 'suspended';

export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  walletBalance: number;
  balance?: number; // Aliased to walletBalance for legacy components
  dailyTarget?: number;
  dailySpent?: number;
  pinCreated?: boolean;
  pinCode?: string;
  biometricEnabled?: boolean;
  biometricRegisteredAt?: string;
  lastBiometricLogin?: string;
  lastLoginMethod?: 'password' | 'pin' | 'biometric';
  webAuthnCredential?: {
    id: string;
    rawId?: string;
    type?: string;
    deviceName?: string;
  };
  phone_number?: string;
  profilePic?: string;
  avatarUrl?: string;
  isSuspended?: boolean;
  isFrozen?: boolean;
  status: UserStatus;
  tier?: number;
  is2faEnabled?: boolean;
  emailVerified: boolean;
  isAdmin?: boolean;
  welcomeRewardShown?: boolean;
  legacyVoucherVerified?: boolean;
  isLegacyVoucherVerified?: boolean;
  notifications?: NotificationItem[];
  referralCode: string;
  referralLink: string;
  referrerId?: string | null;
  referralCount?: number;
  totalReferrals: number;
  totalReferralBonus: number;
  totalEarnings: number;
  activationPaid: boolean;
  activationPaidAt?: string | null;
  createdAt: string;
  lastLogin: string;
}

export type LegacyVoucherStatus = 'unused' | 'redeemed';

export interface LegacyVoucherCode {
  id: string;
  code: string;
  voucherCode?: string;
  amount: number;
  fullName?: string;
  email?: string;
  createdAt?: string;
  generatedAt?: string;
  status: LegacyVoucherStatus;
  redeemedFor?: string;
}

export type TransactionType = 
  | 'deposit'
  | 'withdraw'
  | 'withdrawal'
  | 'buy_legacyVoucher'
  | 'redeem_airtime'
  | 'redeem_data'
  | 'redeem_transfer'
  | 'bank_transfer_direct'
  | 'promotional_bonus'
  | 'referral_bonus'
  | 'task_reward'
  | 'admin_credit'
  | 'admin_debit'
  | 'activation_fee';

export type TransactionStatus = 'pending' | 'completed' | 'approved' | 'rejected' | 'failed' | 'success';

export interface WithdrawalApprovalRecord {
  id: string;
  amount: number;
  approvedAt: string;
  approvedBy: string;
  remainingAfter: number;
  note?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  email?: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: TransactionStatus | string;
  createdAt: string;
  timestamp?: string;
  reference?: string;
  processedAt?: string;
  adminNote?: string;
  voucherCode?: string;
  notes?: string;
  posSlipPath?: string;
  posSlipUploadedAt?: string;
  posSlipUploadedBy?: string;
  approvedAmount?: number;
  approvalHistory?: WithdrawalApprovalRecord[];
  fullName?: string;
  phone?: string;
  userBalance?: number;
}

export interface Transaction {
  id: string;
  userId?: string;
  type: TransactionType;
  amount: number;
  date?: string;
  createdAt?: string;
  status: TransactionStatus;
  description: string;
  reference?: string;
  refNum?: string;
  legacyVoucherCodeUsed?: string;
  legacyVoucherCodeGenerated?: string;
  narration?: string;
  senderName?: string;
  recipientName?: string;
  recipientBank?: string;
  recipientAccount?: string;
  charges?: number;
  newBalance?: number;
  network?: string;
  phoneNumber?: string;
  dataPlan?: string;
  approvedAmount?: number;
  approvalHistory?: WithdrawalApprovalRecord[];
  details?: Record<string, any>;
}

export interface ActivationRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  bankName: string;
  accountName: string;
  accountNumber: string;
  paymentProofRef: string;
  senderName: string;
  status: TransactionStatus;
  createdAt: string;
  processedAt?: string;
  adminNote?: string;
}

export interface DepositRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  reference: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  accountExpiresAt?: string;
  provider: 'korapay' | string;
  webhookStatus: 'verified' | 'pending' | 'failed';
  status: TransactionStatus;
  createdAt: string;
  processedAt?: string;
  paymentProofRef?: string;
  senderName?: string;
  adminNote?: string;
  transactionId?: string;
  rawResponse?: any;
  checkoutUrl?: string;
  authorizationUrl?: string;
}

export type TaskVerificationType = 'timer' | 'proof';
export type TaskSubmissionStatus = 'not_started' | 'in_progress' | 'pending_verification' | 'approved' | 'claimed' | 'rejected';

export interface Task {
  id: string;
  title: string;
  description: string;
  rewardAmount: number;
  category: 'social' | 'survey' | 'daily' | 'download' | 'special';
  actionUrl: string;
  verificationType: TaskVerificationType;
  timerSeconds?: number;
  proofInstructions?: string;
  enabled: boolean;
  createdAt: string;
  completionCount: number;
}

export interface TaskCompletion {
  id: string;
  userId: string;
  taskId: string;
  taskTitle: string;
  rewardAmount: number;
  completedAt: string;
}

export interface TaskSubmission {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  taskId: string;
  taskTitle: string;
  rewardAmount: number;
  verificationType: TaskVerificationType;
  status: TaskSubmissionStatus;
  startedAt?: string;
  completedAt?: string;
  claimedAt?: string;
  proofText?: string;
  proofUrl?: string;
  adminNote?: string;
  createdAt: string;
}

export interface ReferralRecord {
  id: string;
  referrerId: string;
  referredUserId: string;
  referredUserName: string;
  referredUserEmail: string;
  bonusAmount: number;
  status: 'successful' | 'pending';
  createdAt: string;
}

export interface BankAccount {
  accountName: string;
  accountNumber: string;
  bankName: string;
}

export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  instructions: string;
  minDeposit: number;
  maxDeposit: number;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  title: string;
  message?: string;
  body?: string;
  date?: string;
  createdAt?: string;
  unread?: boolean;
  read?: boolean;
  type?: string;
  category?: string;
  status?: string;
  amount?: number | string;
  reference?: string;
  bankName?: string;
  recipientName?: string;
  senderName?: string;
  voucherCode?: string;
  accountNumber?: string;
  phoneNumber?: string;
  details?: Record<string, any>;
}

export interface SiteSettings {
  appName: string;
  websiteName: string;
  logoText: string;
  maintenanceMode: boolean | string;
  referralBonusAmount: number;
  welcomeBonusAmount: number;
  activationFeeAmount: number;
  minDeposit: number;
  minWithdrawal: number;
  announcementBanner?: string;
  bannerNotice: string;
  supportEmail: string;
  telegramChannel?: string;
  telegramGroupUrl: string;
  paymentProvider?: 'korapay';
}

export type PaymentProviderType = 'korapay';

export interface PaymentProviderStatus {
  id: PaymentProviderType;
  name: string;
  isConfigured: boolean;
  missingVariables: string[];
  requiredEnvVars: string[];
  isDefault: boolean;
  webhookUrl: string;
}

export interface ProviderConfigStatus {
  id: PaymentProviderType;
  name: string;
  isConfigured: boolean;
  missingCredentials?: string[];
  missingVariables: string[];
  requiredVariables?: string[];
  requiredEnvVars: string[];
  isDefault: boolean;
  webhookUrl: string;
}

export interface PaymentOverviewResponse {
  providers: PaymentProviderStatus[];
  activeProvider: PaymentProviderType | null;
  hasAnyConfigured: boolean;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalDepositsAmount: number;
  pendingDepositsCount: number;
  totalWithdrawalsAmount: number;
  pendingWithdrawalsCount: number;
  totalReferralsCount: number;
  totalReferralBonusPaid: number;
  totalWalletBalances: number;
  totalTasksCompleted: number;
}

export interface PasswordResetRequest {
  id: string;
  userId: string;
  email: string;
  otpHash: string;
  createdAt: string;
  expiresAt: string;
  attempts: number;
  verifiedAt?: string | null;
  resetTokenHash?: string | null;
  resetTokenExpiresAt?: string | null;
  usedAt?: string | null;
}

export interface DeviceSession {
  id: string;
  name: string;
  os: string;
  browser: string;
  loginDate: string;
  lastActivity: string;
  isCurrent: boolean;
}

export interface LoginHistoryItem {
  id: string;
  date: string;
  time: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  status: 'success' | 'failed' | 'locked';
}

export interface Beneficiary {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  phone?: string;
  network?: string;
}

export interface SimulatedEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  date: string;
  read: boolean;
}

export interface Advert {
  id: string;
  title: string;
  description: string;
  destinationUrl: string;
  rewardAmount: number;
  bannerUrl?: string;
  category?: string;
  clicks: number;
  impressions: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type AdminAdvert = Advert;

