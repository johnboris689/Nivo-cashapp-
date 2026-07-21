import { User, Transaction, DepositRequest, WithdrawalRequest, Task, NotificationItem, BankDetails, SiteSettings, AdminStats, ReferralRecord } from '../types';

const TOKEN_KEY = 'nivo_auth_token';
const ADMIN_TOKEN_KEY = 'nivo_admin_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function removeAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}, isAdmin: boolean = false): Promise<T> {
  const token = isAdmin ? getAdminToken() : getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'An unexpected server error occurred.');
  }

  return data as T;
}

export const api = {
  // --- Public ---
  getSettings: () => request<SiteSettings>('/api/settings'),
  getBankDetails: () => request<BankDetails>('/api/bank-details'),

  // --- Auth ---
  register: (payload: { fullName: string; username: string; email: string; phone: string; password: string; referralCode?: string }) =>
    request<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { emailOrUsername: string; password: string }) =>
    request<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getCurrentUser: () => request<{ user: User }>('/api/auth/me'),

  forgotPassword: (email: string) =>
    request<{ message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  // --- Wallet & Transactions ---
  getTransactions: () => request<Transaction[]>('/api/wallet/transactions'),

  submitDeposit: (payload: { amount: number; senderName: string; paymentProofRef: string }) =>
    request<{ message: string; deposit: DepositRequest }>('/api/wallet/deposit', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  submitWithdrawal: (payload: { amount: number; bankName: string; accountNumber: string; accountName: string }) =>
    request<{ message: string; withdrawal: WithdrawalRequest }>('/api/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // --- Referrals ---
  getReferralStats: () =>
    request<{
      referralCode: string;
      referralLink: string;
      totalReferrals: number;
      totalReferralBonus: number;
      successfulReferrals: number;
      pendingReferrals: number;
      referralsList: ReferralRecord[];
    }>('/api/referrals/stats'),

  // --- Tasks ---
  getTasks: () => request<(Task & { completed: boolean })[]>('/api/tasks'),

  completeTask: (taskId: string) =>
    request<{ message: string; result: { rewardAmount: number; taskTitle: string } }>('/api/tasks/complete', {
      method: 'POST',
      body: JSON.stringify({ taskId }),
    }),

  // --- Notifications ---
  getNotifications: () => request<NotificationItem[]>('/api/notifications'),

  markNotificationRead: (notificationId?: string) =>
    request<{ success: boolean }>('/api/notifications/mark-read', {
      method: 'POST',
      body: JSON.stringify({ notificationId }),
    }),

  // --- Admin ---
  adminLogin: (payload: { email: string; password: string }) =>
    request<{ user: User; token: string }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getAdminStats: () => request<AdminStats>('/api/admin/stats', {}, true),

  getAdminUsers: () => request<User[]>('/api/admin/users', {}, true),

  updateUserStatus: (userId: string, status: 'active' | 'suspended') =>
    request<User>(`/api/admin/users/${userId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }, true),

  adjustUserBalance: (userId: string, amount: number, type: 'credit' | 'debit', reason: string) =>
    request<User>(`/api/admin/users/${userId}/adjust-balance`, {
      method: 'POST',
      body: JSON.stringify({ amount, type, reason }),
    }, true),

  deleteUser: (userId: string) =>
    request<{ success: boolean }>(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    }, true),

  getAdminDeposits: () => request<DepositRequest[]>('/api/admin/deposits', {}, true),

  approveDeposit: (depositId: string, adminNote?: string) =>
    request<{ message: string; deposit: DepositRequest }>(`/api/admin/deposits/${depositId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ adminNote }),
    }, true),

  rejectDeposit: (depositId: string, adminNote?: string) =>
    request<{ message: string; deposit: DepositRequest }>(`/api/admin/deposits/${depositId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ adminNote }),
    }, true),

  updateBankDetails: (details: Partial<BankDetails>) =>
    request<BankDetails>('/api/admin/bank-details', {
      method: 'POST',
      body: JSON.stringify(details),
    }, true),

  getAdminWithdrawals: () => request<WithdrawalRequest[]>('/api/admin/withdrawals', {}, true),

  approveWithdrawal: (withdrawalId: string, adminNote?: string) =>
    request<{ message: string; withdrawal: WithdrawalRequest }>(`/api/admin/withdrawals/${withdrawalId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ adminNote }),
    }, true),

  rejectWithdrawal: (withdrawalId: string, adminNote?: string) =>
    request<{ message: string; withdrawal: WithdrawalRequest }>(`/api/admin/withdrawals/${withdrawalId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ adminNote }),
    }, true),

  getAdminTasks: () => request<Task[]>('/api/admin/tasks', {}, true),

  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'completionCount'>) =>
    request<Task>('/api/admin/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    }, true),

  updateTask: (taskId: string, task: Partial<Task>) =>
    request<Task>(`/api/admin/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    }, true),

  deleteTask: (taskId: string) =>
    request<{ success: boolean }>(`/api/admin/tasks/${taskId}`, {
      method: 'DELETE',
    }, true),

  getAdminSettings: () => request<SiteSettings>('/api/settings'),

  updateSiteSettings: (settings: Partial<SiteSettings>) =>
    request<SiteSettings>('/api/admin/settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    }, true),

  updateAdminSettings: (settings: Partial<SiteSettings>) =>
    request<SiteSettings>('/api/admin/settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    }, true),

  getAdminReferrals: () => request<ReferralRecord[]>('/api/admin/referrals', {}, true),
};
