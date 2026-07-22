import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import {
  User,
  Transaction,
  DepositRequest,
  WithdrawalRequest,
  ActivationRequest,
  Task,
  TaskCompletion,
  ReferralRecord,
  NotificationItem,
  BankDetails,
  SiteSettings,
  AdminStats,
} from '../src/types/index.js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://qfedzccwjkgzftdtaysp.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  transactions: Transaction[];
  deposits: DepositRequest[];
  withdrawals: WithdrawalRequest[];
  activations: ActivationRequest[];
  tasks: Task[];
  taskCompletions: TaskCompletion[];
  referrals: ReferralRecord[];
  notifications: NotificationItem[];
  bankDetails: BankDetails;
  settings: SiteSettings;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'nivo_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getInitialDb(): DatabaseSchema {
  const adminPasswordHash = bcrypt.hashSync('Boris$689', 10);
  
  const adminUser: User & { passwordHash: string } = {
    id: 'admin-0000-0000-0000-000000000000',
    fullName: 'David John (Admin)',
    username: 'admin',
    email: 'talkdavidjohn@gmail.com',
    phone: '+2348000000000',
    walletBalance: 250000,
    referralCode: 'NIVOADMIN',
    referralLink: '',
    referrerId: null,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    status: 'active',
    totalReferrals: 15,
    totalReferralBonus: 18000,
    totalEarnings: 250000,
    emailVerified: true,
    isAdmin: true,
    activationPaid: true,
    activationPaidAt: new Date().toISOString(),
    passwordHash: adminPasswordHash,
  };

  const sampleTasks: Task[] = [
    {
      id: 'task-1',
      title: 'Follow Nivo Cash on X (Twitter)',
      description: 'Follow our official X handle @NivoCashApp for real-time updates and daily giveaway announcements.',
      rewardAmount: 500,
      category: 'social',
      actionUrl: 'https://x.com',
      enabled: true,
      createdAt: new Date().toISOString(),
      completionCount: 142,
    },
    {
      id: 'task-2',
      title: 'Join Official Nivo Telegram Community',
      description: 'Join over 25,000 active members in our official VIP Telegram group.',
      rewardAmount: 600,
      category: 'social',
      actionUrl: 'https://telegram.org',
      enabled: true,
      createdAt: new Date().toISOString(),
      completionCount: 289,
    },
    {
      id: 'task-3',
      title: 'Daily Check-In Streak',
      description: 'Log into Nivo Cash App daily to claim your free daily login bonus.',
      rewardAmount: 300,
      category: 'daily',
      actionUrl: '#',
      enabled: true,
      createdAt: new Date().toISOString(),
      completionCount: 512,
    },
    {
      id: 'task-4',
      title: 'Subscribe to Nivo Cash YouTube Channel',
      description: 'Subscribe and click the notification bell on our YouTube tutorials channel.',
      rewardAmount: 500,
      category: 'social',
      actionUrl: 'https://youtube.com',
      enabled: true,
      createdAt: new Date().toISOString(),
      completionCount: 98,
    },
    {
      id: 'task-5',
      title: 'Download Nivo Cash Android & iOS App',
      description: 'Download and rate our high-performance mobile app 5 stars on the app store.',
      rewardAmount: 1000,
      category: 'download',
      actionUrl: '#',
      enabled: true,
      createdAt: new Date().toISOString(),
      completionCount: 310,
    },
  ];

  const initialBank: BankDetails = {
    bankName: 'Guaranty Trust Bank (GTBank)',
    accountName: 'Nivo Cash App Global Ltd',
    accountNumber: '0123456789',
    instructions: 'Please transfer the exact amount and include your username in the transaction remarks. Upload or enter transaction reference after payment.',
    minDeposit: 1000,
    maxDeposit: 1000000,
  };

  const initialSettings: SiteSettings = {
    appName: 'Nivo Cash App',
    websiteName: 'Nivo Cash App',
    logoText: 'NIVO CASH',
    maintenanceMode: false,
    referralBonusAmount: 1200,
    welcomeBonusAmount: 0,
    activationFeeAmount: 520,
    minDeposit: 1000,
    minWithdrawal: 2000,
    announcementBanner: '🔥 Refer friends & earn ₦1,200 instantly per verified registration! Fast payouts guaranteed.',
    bannerNotice: '🔥 Refer friends & earn ₦1,200 instantly per verified registration! Fast payouts guaranteed.',
    supportEmail: 'support@nivocash.app',
    telegramChannel: 'https://t.me/NivoCashOfficial',
    telegramGroupUrl: 'https://t.me/NivoCashOfficial',
  };

  return {
    users: [adminUser],
    transactions: [],
    deposits: [],
    withdrawals: [],
    activations: [],
    tasks: sampleTasks,
    taskCompletions: [],
    referrals: [],
    notifications: [],
    bankDetails: initialBank,
    settings: initialSettings,
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
    this.ensureAdminUser();
    this.initSupabaseSync();
  }

  private async initSupabaseSync() {
    try {
      if (!supabase) return;
      const { data, error } = await supabase.storage.from('nivo_db').download('data.json');
      if (data) {
        const text = await data.text();
        const parsed = JSON.parse(text);
        if (parsed && Array.isArray(parsed.users) && parsed.users.length > 0) {
          this.data = {
            users: parsed.users.map((u: any) => ({
              ...u,
              activationPaid: u.activationPaid ?? u.isAdmin ?? false,
            })),
            transactions: parsed.transactions || [],
            deposits: parsed.deposits || [],
            withdrawals: parsed.withdrawals || [],
            activations: parsed.activations || [],
            tasks: parsed.tasks || [],
            taskCompletions: parsed.taskCompletions || [],
            referrals: parsed.referrals || [],
            notifications: parsed.notifications || [],
            bankDetails: parsed.bankDetails || getInitialDb().bankDetails,
            settings: {
              ...getInitialDb().settings,
              ...(parsed.settings || {}),
            },
          };
          this.ensureAdminUser();
          console.log(`✅ Loaded ${this.data.users.length} users and database state from Supabase PostgreSQL.`);
        }
      }
    } catch (err) {
      console.error('Error syncing data from Supabase PostgreSQL:', err);
    }
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          users: (parsed.users || []).map((u: any) => ({
            ...u,
            activationPaid: u.activationPaid ?? u.isAdmin ?? false,
          })),
          transactions: parsed.transactions || [],
          deposits: parsed.deposits || [],
          withdrawals: parsed.withdrawals || [],
          activations: parsed.activations || [],
          tasks: parsed.tasks || [],
          taskCompletions: parsed.taskCompletions || [],
          referrals: parsed.referrals || [],
          notifications: parsed.notifications || [],
          bankDetails: parsed.bankDetails || getInitialDb().bankDetails,
          settings: {
            ...getInitialDb().settings,
            ...(parsed.settings || {}),
          },
        };
      }
    } catch (err) {
      console.error('Error loading local database file, initializing fresh DB:', err);
    }
    const fresh = getInitialDb();
    this.saveData(fresh);
    return fresh;
  }

  private async saveData(dataToSave?: DatabaseSchema) {
    const data = dataToSave || this.data;
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving local database file:', err);
    }

    // Persist permanently to Supabase PostgreSQL database bucket
    try {
      if (supabase) {
        await supabase.storage.from('nivo_db').upload('data.json', JSON.stringify(data, null, 2), {
          contentType: 'application/json',
          upsert: true,
        });
      }
    } catch (err) {
      console.error('Error persisting to Supabase PostgreSQL:', err);
    }
  }

  private async ensureAdminUser() {
    const adminEmail = 'talkdavidjohn@gmail.com';
    let existingAdmin = this.data.users.find(u => u.email.toLowerCase() === adminEmail.toLowerCase());
    
    const adminPasswordHash = bcrypt.hashSync('Boris$689', 10);
    if (!existingAdmin) {
      const adminUser: User & { passwordHash: string } = {
        id: 'admin-0000-0000-0000-000000000000',
        fullName: 'David John (Admin)',
        username: 'admin',
        email: adminEmail,
        phone: '+2348000000000',
        walletBalance: 250000,
        referralCode: 'NIVOADMIN',
        referralLink: '',
        referrerId: null,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        status: 'active',
        totalReferrals: 15,
        totalReferralBonus: 18000,
        totalEarnings: 250000,
        emailVerified: true,
        isAdmin: true,
        activationPaid: true,
        activationPaidAt: new Date().toISOString(),
        passwordHash: adminPasswordHash,
      };
      this.data.users.push(adminUser);
      existingAdmin = adminUser;
    } else {
      if (!bcrypt.compareSync('Boris$689', existingAdmin.passwordHash)) {
        existingAdmin.passwordHash = adminPasswordHash;
      }
      existingAdmin.isAdmin = true;
      existingAdmin.activationPaid = true;
    }

    this.saveData();

    // Ensure admin is registered in Supabase Auth PostgreSQL
    try {
      if (supabase) {
        const { data: listData } = await supabase.auth.admin.listUsers();
        const found = listData?.users.find(u => u.email?.toLowerCase() === adminEmail.toLowerCase());
        if (!found) {
          await supabase.auth.admin.createUser({
            email: adminEmail,
            password: 'Boris$689',
            email_confirm: true,
            user_metadata: {
              fullName: existingAdmin.fullName,
              username: existingAdmin.username,
              isAdmin: true,
            },
          });
          console.log('✅ Admin account ensured in Supabase Auth PostgreSQL.');
        }
      }
    } catch (err) {
      console.error('Error syncing admin to Supabase Auth:', err);
    }
  }

  public generateReferralCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'NIVO';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // ensure uniqueness
    if (this.data.users.some(u => u.referralCode === code)) {
      return this.generateReferralCode();
    }
    return code;
  }

  // --- USER API ---
  public createUser(userData: {
    fullName: string;
    username: string;
    email: string;
    phone: string;
    passwordRaw: string;
    referralCodeInput?: string;
    appUrl?: string;
  }): { user: User; token: string } {
    const existingEmail = this.data.users.find(
      u => u.email.toLowerCase() === userData.email.toLowerCase()
    );
    if (existingEmail) {
      throw new Error('An account with this email address already exists.');
    }

    const existingUsername = this.data.users.find(
      u => u.username.toLowerCase() === userData.username.toLowerCase()
    );
    if (existingUsername) {
      throw new Error('This username is already taken. Please choose another.');
    }

    const refCode = this.generateReferralCode();
    const userId = crypto.randomUUID();
    const passwordHash = bcrypt.hashSync(userData.passwordRaw, 10);
    const domain = userData.appUrl || 'https://nivocash.app';
    const referralLink = `${domain.replace(/\/$/, '')}/register?ref=${refCode}`;

    // Find referrer if referralCodeInput provided
    let referrer: (User & { passwordHash: string }) | undefined;
    if (userData.referralCodeInput) {
      const cleanRefInput = userData.referralCodeInput.trim().toUpperCase();
      referrer = this.data.users.find(
        u => u.referralCode.toUpperCase() === cleanRefInput
      );
    }

    const newUser: User & { passwordHash: string } = {
      id: userId,
      fullName: userData.fullName,
      username: userData.username,
      email: userData.email,
      phone: userData.phone,
      walletBalance: 0,
      referralCode: refCode,
      referralLink: referralLink,
      referrerId: referrer ? referrer.id : null,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      status: 'active',
      totalReferrals: 0,
      referralCount: 0,
      totalReferralBonus: 0,
      totalEarnings: 0,
      emailVerified: true,
      isAdmin: false,
      activationPaid: false,
      activationPaidAt: null,
      passwordHash: passwordHash,
    };

    this.data.users.push(newUser);

    // REAL REFERRAL SYSTEM LOGIC
    if (referrer && referrer.id !== newUser.id) {
      const bonusAmount = this.data.settings.referralBonusAmount || 1200;

      // Check duplicate referral record to prevent double crediting
      const existingRefRecord = this.data.referrals.find(
        r => r.referrerId === referrer.id && r.referredUserId === newUser.id
      );

      if (!existingRefRecord) {
        // Credit Referrer automatically with exactly ₦1,200
        referrer.walletBalance += bonusAmount;
        referrer.totalReferrals += 1;
        referrer.totalReferralBonus += bonusAmount;
        referrer.totalEarnings += bonusAmount;

        // Create transaction record
        const refTransaction: Transaction = {
          id: crypto.randomUUID(),
          userId: referrer.id,
          type: 'referral_bonus',
          amount: bonusAmount,
          description: `Referral bonus for inviting @${newUser.username}`,
          status: 'completed',
          reference: `REF-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          createdAt: new Date().toISOString(),
          details: { referredUser: newUser.username, referredUserId: newUser.id },
        };
        this.data.transactions.unshift(refTransaction);

        // Record Referral
        const refRecord: ReferralRecord = {
          id: crypto.randomUUID(),
          referrerId: referrer.id,
          referredUserId: newUser.id,
          referredUserName: newUser.fullName,
          referredUserEmail: newUser.email,
          bonusAmount: bonusAmount,
          status: 'successful',
          createdAt: new Date().toISOString(),
        };
        this.data.referrals.unshift(refRecord);

        // Add Notification for Referrer
        const notification: NotificationItem = {
          id: crypto.randomUUID(),
          userId: referrer.id,
          title: '🎉 Referral Reward Received!',
          message: `Congratulations! You just earned ₦${bonusAmount.toLocaleString()} because ${newUser.fullName} (@${newUser.username}) joined using your referral link.`,
          type: 'success',
          read: false,
          createdAt: new Date().toISOString(),
        };
        this.data.notifications.unshift(notification);
      }
    }

    // Save changes to Supabase PostgreSQL database
    this.saveData();

    // Register user account in Supabase Auth PostgreSQL
    try {
      if (supabase) {
        supabase.auth.admin.createUser({
          email: newUser.email,
          password: userData.passwordRaw,
          email_confirm: true,
          user_metadata: {
            fullName: newUser.fullName,
            username: newUser.username,
            phone: newUser.phone,
            referralCode: refCode,
          },
        }).catch(err => console.error('Supabase Auth user creation error:', err));
      }
    } catch (e) {
      console.error('Supabase Auth error:', e);
    }

    const { passwordHash: _, ...cleanUser } = newUser;
    return { user: cleanUser, token: cleanUser.id };
  }

  public loginUser(emailOrUsername: string, passwordRaw: string): { user: User; token: string } {
    const input = emailOrUsername.trim().toLowerCase();
    const user = this.data.users.find(
      u => u.email.toLowerCase() === input || u.username.toLowerCase() === input
    );

    if (!user) {
      throw new Error('Invalid email/username or password.');
    }

    if (user.status === 'suspended') {
      throw new Error('Your account has been suspended. Please contact support.');
    }

    const passwordMatch = bcrypt.compareSync(passwordRaw, user.passwordHash);
    if (!passwordMatch) {
      throw new Error('Invalid email/username or password.');
    }

    user.lastLogin = new Date().toISOString();
    this.saveData();

    const { passwordHash: _, ...cleanUser } = user;
    return { user: cleanUser, token: cleanUser.id };
  }

  public getUserById(id: string): User | null {
    const user = this.data.users.find(u => u.id === id);
    if (!user) return null;
    const { passwordHash: _, ...cleanUser } = user;
    return cleanUser;
  }

  public listUsers(): User[] {
    return this.data.users.map(({ passwordHash: _, ...user }) => user);
  }

  public updateUserStatus(userId: string, status: 'active' | 'suspended'): User {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) throw new Error('User not found.');
    user.status = status;
    this.saveData();
    const { passwordHash: _, ...cleanUser } = user;
    return cleanUser;
  }

  public adjustUserBalance(userId: string, amount: number, type: 'credit' | 'debit', reason: string): User {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) throw new Error('User not found.');

    if (type === 'debit' && user.walletBalance < amount) {
      throw new Error(`Insufficient wallet balance. User has ₦${user.walletBalance.toLocaleString()}`);
    }

    if (type === 'credit') {
      user.walletBalance += amount;
      user.totalEarnings += amount;
    } else {
      user.walletBalance -= amount;
    }

    const tx: Transaction = {
      id: crypto.randomUUID(),
      userId: user.id,
      type: type === 'credit' ? 'admin_credit' : 'admin_debit',
      amount: amount,
      description: `Admin adjustment: ${reason}`,
      status: 'completed',
      reference: `ADM-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.data.transactions.unshift(tx);

    const notification: NotificationItem = {
      id: crypto.randomUUID(),
      userId: user.id,
      title: type === 'credit' ? '💳 Wallet Credited' : '💸 Wallet Debited',
      message: `Your wallet was ${type === 'credit' ? 'credited' : 'debited'} with ₦${amount.toLocaleString()} by administration. Reason: ${reason}`,
      type: type === 'credit' ? 'success' : 'warning',
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.data.notifications.unshift(notification);

    this.saveData();
    const { passwordHash: _, ...cleanUser } = user;
    return cleanUser;
  }

  public deleteUser(userId: string) {
    this.data.users = this.data.users.filter(u => u.id !== userId);
    this.data.transactions = this.data.transactions.filter(t => t.userId !== userId);
    this.data.deposits = this.data.deposits.filter(d => d.userId !== userId);
    this.data.withdrawals = this.data.withdrawals.filter(w => w.userId !== userId);
    this.saveData();
  }

  // --- TRANSACTIONS ---
  public getUserTransactions(userId: string): Transaction[] {
    return this.data.transactions.filter(t => t.userId === userId);
  }

  // --- DEPOSITS ---
  public createDeposit(userId: string, amount: number, senderName: string, paymentProofRef: string): DepositRequest {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) throw new Error('User not found.');

    if (amount < this.data.bankDetails.minDeposit) {
      throw new Error(`Minimum deposit amount is ₦${this.data.bankDetails.minDeposit.toLocaleString()}`);
    }

    const deposit: DepositRequest = {
      id: crypto.randomUUID(),
      userId: user.id,
      userName: user.fullName,
      userEmail: user.email,
      amount: amount,
      senderName: senderName,
      paymentProofRef: paymentProofRef,
      bankName: this.data.bankDetails.bankName,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    this.data.deposits.unshift(deposit);

    const tx: Transaction = {
      id: crypto.randomUUID(),
      userId: user.id,
      type: 'deposit',
      amount: amount,
      description: `Bank deposit request via ${this.data.bankDetails.bankName}`,
      status: 'pending',
      reference: `DEP-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.data.transactions.unshift(tx);

    this.saveData();
    return deposit;
  }

  public listDeposits(): DepositRequest[] {
    return this.data.deposits;
  }

  public approveDeposit(depositId: string, adminNote?: string): DepositRequest {
    const deposit = this.data.deposits.find(d => d.id === depositId);
    if (!deposit) throw new Error('Deposit request not found.');
    if (deposit.status !== 'pending') throw new Error(`Deposit is already ${deposit.status}`);

    deposit.status = 'approved';
    deposit.processedAt = new Date().toISOString();
    deposit.adminNote = adminNote || 'Approved by admin';

    const user = this.data.users.find(u => u.id === deposit.userId);
    if (user) {
      user.walletBalance += deposit.amount;
      user.totalEarnings += deposit.amount;

      // Update transaction status
      const tx = this.data.transactions.find(
        t => t.userId === deposit.userId && t.type === 'deposit' && t.amount === deposit.amount && t.status === 'pending'
      );
      if (tx) {
        tx.status = 'completed';
      } else {
        this.data.transactions.unshift({
          id: crypto.randomUUID(),
          userId: user.id,
          type: 'deposit',
          amount: deposit.amount,
          description: `Approved Bank Deposit`,
          status: 'completed',
          reference: `DEP-APP-${Date.now()}`,
          createdAt: new Date().toISOString(),
        });
      }

      this.data.notifications.unshift({
        id: crypto.randomUUID(),
        userId: user.id,
        title: '✅ Deposit Approved!',
        message: `Your deposit of ₦${deposit.amount.toLocaleString()} has been approved and added to your wallet balance.`,
        type: 'success',
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    this.saveData();
    return deposit;
  }

  public rejectDeposit(depositId: string, adminNote?: string): DepositRequest {
    const deposit = this.data.deposits.find(d => d.id === depositId);
    if (!deposit) throw new Error('Deposit request not found.');
    if (deposit.status !== 'pending') throw new Error(`Deposit is already ${deposit.status}`);

    deposit.status = 'rejected';
    deposit.processedAt = new Date().toISOString();
    deposit.adminNote = adminNote || 'Rejected by admin';

    const user = this.data.users.find(u => u.id === deposit.userId);
    if (user) {
      const tx = this.data.transactions.find(
        t => t.userId === deposit.userId && t.type === 'deposit' && t.amount === deposit.amount && t.status === 'pending'
      );
      if (tx) {
        tx.status = 'rejected';
      }

      this.data.notifications.unshift({
        id: crypto.randomUUID(),
        userId: user.id,
        title: '❌ Deposit Rejected',
        message: `Your deposit of ₦${deposit.amount.toLocaleString()} was not approved. Reason: ${deposit.adminNote}`,
        type: 'alert',
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    this.saveData();
    return deposit;
  }

  public getBankDetails(): BankDetails {
    return this.data.bankDetails;
  }

  public updateBankDetails(details: Partial<BankDetails>): BankDetails {
    this.data.bankDetails = { ...this.data.bankDetails, ...details };
    this.saveData();
    return this.data.bankDetails;
  }

  // --- WITHDRAWALS ---
  public createWithdrawal(userId: string, amount: number, bankName: string, accountNumber: string, accountName: string): WithdrawalRequest {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) throw new Error('User not found.');

    // MANDATORY WITHDRAWAL ELIGIBILITY CHECKS
    const requiredReferrals = 5;
    const currentRefs = user.totalReferrals || 0;
    const isActivated = !!user.activationPaid;
    const activationFee = this.data.settings.activationFeeAmount || 520;

    if (currentRefs < requiredReferrals || !isActivated) {
      throw new Error(
        `Withdrawal locked. Complete the following before withdrawing: Invite 5 successful referrals (Current: ${currentRefs}/${requiredReferrals}). Pay your ₦${activationFee} activation fee (Activation: ${isActivated ? 'Paid' : 'Not Paid'}).`
      );
    }

    if (amount < this.data.settings.minWithdrawal) {
      throw new Error(`Minimum withdrawal amount is ₦${this.data.settings.minWithdrawal.toLocaleString()}`);
    }

    if (user.walletBalance < amount) {
      throw new Error(`Insufficient funds. Your current balance is ₦${user.walletBalance.toLocaleString()}`);
    }

    // Debit wallet balance temporarily or hold
    user.walletBalance -= amount;

    const withdrawal: WithdrawalRequest = {
      id: crypto.randomUUID(),
      userId: user.id,
      userName: user.fullName,
      userEmail: user.email,
      amount: amount,
      bankName: bankName,
      accountNumber: accountNumber,
      accountName: accountName,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    this.data.withdrawals.unshift(withdrawal);

    this.data.transactions.unshift({
      id: crypto.randomUUID(),
      userId: user.id,
      type: 'withdrawal',
      amount: amount,
      description: `Withdrawal request to ${bankName} (${accountNumber})`,
      status: 'pending',
      reference: `WTH-${Date.now()}`,
      createdAt: new Date().toISOString(),
    });

    this.saveData();
    return withdrawal;
  }

  public listWithdrawals(): WithdrawalRequest[] {
    return this.data.withdrawals;
  }

  public approveWithdrawal(withdrawalId: string, adminNote?: string): WithdrawalRequest {
    const wth = this.data.withdrawals.find(w => w.id === withdrawalId);
    if (!wth) throw new Error('Withdrawal request not found.');
    if (wth.status !== 'pending') throw new Error(`Withdrawal is already ${wth.status}`);

    wth.status = 'approved';
    wth.processedAt = new Date().toISOString();
    wth.adminNote = adminNote || 'Approved and processed';

    const tx = this.data.transactions.find(
      t => t.userId === wth.userId && t.type === 'withdrawal' && t.amount === wth.amount && t.status === 'pending'
    );
    if (tx) tx.status = 'approved';

    this.data.notifications.unshift({
      id: crypto.randomUUID(),
      userId: wth.userId,
      title: '🎉 Withdrawal Approved!',
      message: `Your withdrawal of ₦${wth.amount.toLocaleString()} to ${wth.bankName} (${wth.accountNumber}) has been approved!`,
      type: 'success',
      read: false,
      createdAt: new Date().toISOString(),
    });

    this.saveData();
    return wth;
  }

  public rejectWithdrawal(withdrawalId: string, adminNote?: string): WithdrawalRequest {
    const wth = this.data.withdrawals.find(w => w.id === withdrawalId);
    if (!wth) throw new Error('Withdrawal request not found.');
    if (wth.status !== 'pending') throw new Error(`Withdrawal is already ${wth.status}`);

    wth.status = 'rejected';
    wth.processedAt = new Date().toISOString();
    wth.adminNote = adminNote || 'Rejected by administration';

    // Refund wallet balance to user
    const user = this.data.users.find(u => u.id === wth.userId);
    if (user) {
      user.walletBalance += wth.amount;

      const tx = this.data.transactions.find(
        t => t.userId === wth.userId && t.type === 'withdrawal' && t.amount === wth.amount && t.status === 'pending'
      );
      if (tx) tx.status = 'rejected';

      this.data.notifications.unshift({
        id: crypto.randomUUID(),
        userId: user.id,
        title: '❌ Withdrawal Rejected & Refunded',
        message: `Your withdrawal of ₦${wth.amount.toLocaleString()} was declined and ₦${wth.amount.toLocaleString()} has been refunded to your wallet. Reason: ${wth.adminNote}`,
        type: 'alert',
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    this.saveData();
    return wth;
  }

  // --- TASKS ---
  public getTasks(): Task[] {
    return this.data.tasks;
  }

  public createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'completionCount'>): Task {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      completionCount: 0,
    };
    this.data.tasks.unshift(newTask);
    this.saveData();
    return newTask;
  }

  public updateTask(taskId: string, taskData: Partial<Task>): Task {
    const task = this.data.tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found.');
    Object.assign(task, taskData);
    this.saveData();
    return task;
  }

  public deleteTask(taskId: string) {
    this.data.tasks = this.data.tasks.filter(t => t.id !== taskId);
    this.data.taskCompletions = this.data.taskCompletions.filter(tc => tc.taskId !== taskId);
    this.saveData();
  }

  public completeTask(userId: string, taskId: string): { rewardAmount: number; taskTitle: string } {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) throw new Error('User not found.');

    const task = this.data.tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found.');
    if (!task.enabled) throw new Error('This task is currently disabled.');

    // Check duplicate completion
    const existing = this.data.taskCompletions.find(
      tc => tc.userId === userId && tc.taskId === taskId
    );
    if (existing) {
      throw new Error('You have already completed this task.');
    }

    // Record completion
    const completion: TaskCompletion = {
      id: crypto.randomUUID(),
      userId: user.id,
      taskId: task.id,
      taskTitle: task.title,
      rewardAmount: task.rewardAmount,
      completedAt: new Date().toISOString(),
    };
    this.data.taskCompletions.unshift(completion);

    // Update task completion count
    task.completionCount += 1;

    // Credit user wallet balance
    user.walletBalance += task.rewardAmount;
    user.totalEarnings += task.rewardAmount;

    // Log transaction
    this.data.transactions.unshift({
      id: crypto.randomUUID(),
      userId: user.id,
      type: 'task_reward',
      amount: task.rewardAmount,
      description: `Reward for completing task: ${task.title}`,
      status: 'completed',
      reference: `TSK-${Date.now()}`,
      createdAt: new Date().toISOString(),
    });

    // Send notification
    this.data.notifications.unshift({
      id: crypto.randomUUID(),
      userId: user.id,
      title: '🎯 Task Reward Claimed!',
      message: `You earned ₦${task.rewardAmount.toLocaleString()} for completing "${task.title}".`,
      type: 'success',
      read: false,
      createdAt: new Date().toISOString(),
    });

    this.saveData();
    return { rewardAmount: task.rewardAmount, taskTitle: task.title };
  }

  public getUserTaskCompletions(userId: string): TaskCompletion[] {
    return this.data.taskCompletions.filter(tc => tc.userId === userId);
  }

  // --- REFERRALS ---
  public getUserReferrals(referrerId: string): ReferralRecord[] {
    return this.data.referrals.filter(r => r.referrerId === referrerId);
  }

  public getAllReferrals(): ReferralRecord[] {
    return this.data.referrals;
  }

  // --- NOTIFICATIONS ---
  public getUserNotifications(userId: string): NotificationItem[] {
    return this.data.notifications.filter(n => n.userId === userId);
  }

  public markNotificationRead(userId: string, notificationId?: string) {
    if (notificationId) {
      const notif = this.data.notifications.find(n => n.id === notificationId && n.userId === userId);
      if (notif) notif.read = true;
    } else {
      this.data.notifications.forEach(n => {
        if (n.userId === userId) n.read = true;
      });
    }
    this.saveData();
  }

  // --- ADMIN & SETTINGS ---
  public getAdminStats(): AdminStats {
    const totalUsers = this.data.users.length;
    const activeUsers = this.data.users.filter(u => u.status === 'active').length;

    const totalDepositsAmount = this.data.deposits
      .filter(d => d.status === 'approved')
      .reduce((sum, d) => sum + d.amount, 0);

    const pendingDepositsCount = this.data.deposits.filter(d => d.status === 'pending').length;

    const totalWithdrawalsAmount = this.data.withdrawals
      .filter(w => w.status === 'approved')
      .reduce((sum, w) => sum + w.amount, 0);

    const pendingWithdrawalsCount = this.data.withdrawals.filter(w => w.status === 'pending').length;

    const totalReferralsCount = this.data.referrals.length;

    const totalReferralBonusPaid = this.data.referrals
      .filter(r => r.status === 'successful')
      .reduce((sum, r) => sum + r.bonusAmount, 0);

    const totalWalletBalances = this.data.users.reduce((sum, u) => sum + u.walletBalance, 0);

    const totalTasksCompleted = this.data.taskCompletions.length;

    return {
      totalUsers,
      activeUsers,
      totalDepositsAmount,
      pendingDepositsCount,
      totalWithdrawalsAmount,
      pendingWithdrawalsCount,
      totalReferralsCount,
      totalReferralBonusPaid,
      totalWalletBalances,
      totalTasksCompleted,
    };
  }

  // --- ACTIVATION SYSTEM ---
  public createActivationRequest(userId: string, senderName: string, paymentProofRef: string): ActivationRequest {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) throw new Error('User not found.');

    if (user.activationPaid) {
      throw new Error('Your account is already activated for withdrawals.');
    }

    const pending = this.data.activations.find(a => a.userId === userId && a.status === 'pending');
    if (pending) {
      throw new Error('You already have a pending activation request awaiting approval.');
    }

    const feeAmount = this.data.settings.activationFeeAmount || 520;

    const activationReq: ActivationRequest = {
      id: crypto.randomUUID(),
      userId: user.id,
      userName: user.fullName,
      userEmail: user.email,
      amount: feeAmount,
      bankName: this.data.bankDetails.bankName,
      accountName: this.data.bankDetails.accountName,
      accountNumber: this.data.bankDetails.accountNumber,
      senderName: senderName,
      paymentProofRef: paymentProofRef,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    this.data.activations.unshift(activationReq);

    this.data.transactions.unshift({
      id: crypto.randomUUID(),
      userId: user.id,
      type: 'activation_fee',
      amount: feeAmount,
      description: `Withdrawal Activation Fee Payment (Ref: ${paymentProofRef})`,
      status: 'pending',
      reference: `ACT-${Date.now()}`,
      createdAt: new Date().toISOString(),
    });

    this.saveData();
    return activationReq;
  }

  public listActivations(): ActivationRequest[] {
    return this.data.activations;
  }

  public getUserActivation(userId: string): { request?: ActivationRequest; activationPaid: boolean; feeAmount: number } {
    const user = this.data.users.find(u => u.id === userId);
    const req = this.data.activations.find(a => a.userId === userId);
    const feeAmount = this.data.settings.activationFeeAmount || 520;
    return {
      request: req,
      activationPaid: user ? !!user.activationPaid : false,
      feeAmount,
    };
  }

  public approveActivation(activationId: string, adminNote?: string): ActivationRequest {
    const req = this.data.activations.find(a => a.id === activationId);
    if (!req) throw new Error('Activation request not found.');
    if (req.status !== 'pending') throw new Error(`Activation request is already ${req.status}`);

    req.status = 'approved';
    req.processedAt = new Date().toISOString();
    req.adminNote = adminNote || 'Approved by administrator';

    const user = this.data.users.find(u => u.id === req.userId);
    if (user) {
      user.activationPaid = true;
      user.activationPaidAt = new Date().toISOString();

      // Update tx
      const tx = this.data.transactions.find(
        t => t.userId === user.id && t.type === 'activation_fee' && t.status === 'pending'
      );
      if (tx) tx.status = 'approved';

      this.data.notifications.unshift({
        id: crypto.randomUUID(),
        userId: user.id,
        title: '🎉 Account Withdrawal Activated!',
        message: `Your activation payment of ₦${req.amount.toLocaleString()} has been approved. Your account is now activated for withdrawals!`,
        type: 'success',
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    this.saveData();
    return req;
  }

  public rejectActivation(activationId: string, adminNote?: string): ActivationRequest {
    const req = this.data.activations.find(a => a.id === activationId);
    if (!req) throw new Error('Activation request not found.');
    if (req.status !== 'pending') throw new Error(`Activation request is already ${req.status}`);

    req.status = 'rejected';
    req.processedAt = new Date().toISOString();
    req.adminNote = adminNote || 'Rejected by administrator';

    const tx = this.data.transactions.find(
      t => t.userId === req.userId && t.type === 'activation_fee' && t.status === 'pending'
    );
    if (tx) tx.status = 'rejected';

    this.data.notifications.unshift({
      id: crypto.randomUUID(),
      userId: req.userId,
      title: '❌ Activation Payment Declined',
      message: `Your activation payment request of ₦${req.amount.toLocaleString()} was declined. Reason: ${req.adminNote}`,
      type: 'alert',
      read: false,
      createdAt: new Date().toISOString(),
    });

    this.saveData();
    return req;
  }

  public setUserActivationStatus(userId: string, activationPaid: boolean): User {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) throw new Error('User not found.');

    user.activationPaid = activationPaid;
    if (activationPaid) {
      user.activationPaidAt = user.activationPaidAt || new Date().toISOString();
    } else {
      user.activationPaidAt = null;
    }

    this.saveData();
    const { passwordHash: _, ...cleanUser } = user;
    return cleanUser;
  }

  public setUserReferralCount(userId: string, count: number): User {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) throw new Error('User not found.');

    const newCount = Math.max(0, count);
    user.totalReferrals = newCount;
    user.referralCount = newCount;

    this.saveData();
    const { passwordHash: _, ...cleanUser } = user;
    return cleanUser;
  }

  public getSiteSettings(): SiteSettings {
    return this.data.settings;
  }

  public updateSiteSettings(settings: Partial<SiteSettings>): SiteSettings {
    this.data.settings = { ...this.data.settings, ...settings };
    this.saveData();
    return this.data.settings;
  }
}

export const db = new Database();
