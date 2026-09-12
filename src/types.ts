export interface User {
  fullName: string;
  email: string;
  balance: number;
  dailyTarget: number;
  dailySpent: number;
  pinCreated: boolean;
  pinCode?: string;
  biometricEnabled: boolean;
  biometricRegisteredAt?: string;
  lastBiometricLogin?: string;
  lastLoginMethod?: 'password' | 'pin' | 'biometric';
  webAuthnCredential?: {
    id: string;
    rawId?: string;
    type?: string;
    deviceName?: string;
  };
  phone?: string;
  profilePic?: string;
  isSuspended?: boolean;
  isFrozen?: boolean;
  tier?: number; // Verification tier, e.g. 1, 2, 3
  is2faEnabled?: boolean;
  welcomeRewardShown?: boolean;
  wdvVerified?: boolean;
  isWdvVerified?: boolean;
  notifications?: NotificationItem[];
  username?: string;
  referralCode?: string;
  referralLink?: string;
  referralCount?: number;
  totalReferralBonus?: number;
  totalEarnings?: number;
  activationPaid?: boolean;
  activationPaidAt?: string;
}

export type WdvStatus = 'unused' | 'redeemed';

export interface WdvCode {
  id: string;
  code: string;
  voucherCode?: string;
  amount: number;
  fullName?: string;
  email?: string;
  createdAt?: string;
  generatedAt?: string;
  status: WdvStatus;
  redeemedFor?: string; // e.g. "Airtime to 08012345678" or "Bank Transfer"
}

export type TransactionType = 
  | 'deposit'
  | 'withdraw'
  | 'buy_wdv'
  | 'redeem_airtime'
  | 'redeem_data'
  | 'redeem_transfer'
  | 'bank_transfer_direct'
  | 'promotional_bonus';

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
  email: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: 'pending' | 'partially_approved' | 'processing' | 'completed' | 'rejected' | 'cancelled' | string;
  timestamp: string;
  reference: string;
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
  type: TransactionType;
  amount: number;
  date: string;
  status: 'pending' | 'success' | 'failed';
  description: string;
  refNum?: string;
  reference?: string;
  wdvCodeUsed?: string;
  wdvCodeGenerated?: string;
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
}

export interface BankAccount {
  accountName: string;
  accountNumber: string;
  bankName: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  date: string;
  unread: boolean;
  type?: 'login' | 'airtime' | 'data' | 'transfer' | 'withdraw' | 'security' | 'system' | 'voucher' | 'balance' | string;
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
