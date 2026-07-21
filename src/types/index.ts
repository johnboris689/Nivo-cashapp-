export type UserStatus = 'active' | 'suspended';

export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  walletBalance: number;
  referralCode: string;
  referralLink: string;
  referrerId?: string | null;
  createdAt: string;
  lastLogin: string;
  status: UserStatus;
  totalReferrals: number;
  referralCount?: number;
  totalReferralBonus: number;
  totalEarnings: number;
  emailVerified: boolean;
  isAdmin?: boolean;
  activationPaid: boolean;
  activationPaidAt?: string | null;
}

export type TransactionType = 'deposit' | 'withdrawal' | 'referral_bonus' | 'task_reward' | 'admin_credit' | 'admin_debit' | 'activation_fee';
export type TransactionStatus = 'pending' | 'completed' | 'approved' | 'rejected';

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

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  status: TransactionStatus;
  reference: string;
  createdAt: string;
  details?: Record<string, any>;
}

export interface DepositRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  paymentProofRef: string;
  senderName: string;
  bankName: string;
  status: TransactionStatus;
  createdAt: string;
  processedAt?: string;
  adminNote?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: TransactionStatus;
  createdAt: string;
  processedAt?: string;
  adminNote?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  rewardAmount: number;
  category: 'social' | 'survey' | 'daily' | 'download' | 'special';
  actionUrl: string;
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

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  read: boolean;
  createdAt: string;
}

export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  instructions: string;
  minDeposit: number;
  maxDeposit: number;
}

export interface SiteSettings {
  appName: string;
  websiteName: string;
  logoText: string;
  maintenanceMode: boolean;
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
