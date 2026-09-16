import { User, Transaction, DepositRequest, WithdrawalRequest, ActivationRequest, Task, NotificationItem, BankDetails, SiteSettings, AdminStats, ReferralRecord, TaskSubmission, TaskSubmissionStatus, PaymentOverviewResponse } from '../types';

const TOKEN_KEY = 'nevo_auth_token';
const ADMIN_TOKEN_KEY = 'nevo_admin_token';

export function getAuthToken(): string | null {
  return (
    localStorage.getItem('nevo_auth_token') ||
    localStorage.getItem(TOKEN_KEY) ||
    localStorage.getItem('token') ||
    sessionStorage.getItem('nevo_auth_token') ||
    null
  );
}

export function setAuthToken(token: string) {
  localStorage.setItem('nevo_auth_token', token);
  localStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem('nevo_auth_token', token);
}

export function removeAuthToken() {
  localStorage.removeItem('nevo_auth_token');
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('token');
  sessionStorage.removeItem('nevo_auth_token');
}

export function getAdminToken(): string | null {
  return (
    localStorage.getItem('nevo_admin_token') ||
    localStorage.getItem(ADMIN_TOKEN_KEY) ||
    localStorage.getItem('admin_token') ||
    null
  );
}

export function setAdminToken(token: string) {
  localStorage.setItem('nevo_admin_token', token);
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function removeAdminToken() {
  localStorage.removeItem('nevo_admin_token');
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem('admin_token');
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

  let data: any = {};
  try {
    data = await response.json();
  } catch {
    try {
      const text = await response.text();
      data = { error: text || `Request failed with status ${response.status}` };
    } catch {
      data = {};
    }
  }

  if (!response.ok) {
    const fallbackMessage =
      response.status === 401
        ? 'Session expired or not logged in. Please sign in to continue.'
        : response.status === 403
        ? 'Access forbidden. Please check your credentials.'
        : response.status === 404
        ? 'Requested service is currently unavailable.'
        : `Server error (${response.status}). Please try again shortly.`;

    const errorMessage = data.error || data.message || fallbackMessage;
    throw new Error(errorMessage);
  }

  return data as T;
}

export const api = {
  // --- Public ---
  getSettings: () => request<SiteSettings>('/api/settings'),
  getBankDetails: () => request<BankDetails>('/api/bank-details'),
  getBanks: () => request<{ name: string; code: string }[]>('/api/banks'),
  resolveBankAccount: (payload: { accountNumber: string; bankCode: string; bankName?: string }) =>
    request<{ success: boolean; accountName?: string; accountNumber?: string; bankCode?: string }>('/api/verify-account', {
      method: 'POST',
      body: JSON.stringify({
        accountNumber: payload.accountNumber,
        bank: payload.bankName || payload.bankCode,
        bankCode: payload.bankCode,
      }),
    }),

  verifyBankAccount: (payload: { bank: string; accountNumber: string }) =>
    request<{ success: boolean; accountName: string; bankName: string; accountNumber: string }>('/api/verify-account', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

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

  updateAvatar: (avatarUrl: string) =>
    request<{ message: string; user: User }>('/api/user/avatar', {
      method: 'POST',
      body: JSON.stringify({ avatarUrl }),
    }),

  uploadProfilePicture: async (file: File) => {
    const token = getAuthToken();
    const form = new FormData();
    form.append('image', file);
    const response = await fetch('/api/user/profile-picture', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Failed to upload profile picture.');
    return data as { success: boolean; profilePic: string };
  },

  forgotPassword: (email: string) =>
    request<{ message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  verifyPayment: (reference: string) =>
    request<{ status: string; message?: string; reference?: string }>(`/api/payments/verify/${encodeURIComponent(reference)}`),

  verifyResetOtp: (payload: { email: string; otp: string }) =>
    request<{ message: string; resetToken: string }>('/api/auth/verify-reset-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  resetPassword: (payload: { email: string; resetToken: string; newPassword: string; confirmPassword: string }) =>
    request<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // --- Wallet & KoraPay Deposits ---
  getTransactions: () => request<Transaction[]>('/api/wallet/transactions'),

  initializeKoraPayDeposit: (amount: number) =>
    request<{ message: string; deposit: DepositRequest }>('/api/korapay/initialize-wallet-deposit', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),

  checkKoraPayDepositStatus: (reference: string) =>
    request<any>(`/api/korapay/check-status/${encodeURIComponent(reference)}`),

  getTransactionEligibility: () =>
    request<{ successfulReferrals: number; referralsRequired: number; verifiedDeposit: boolean; depositMinimum: number; canWithdraw: boolean }>('/api/transactions/eligibility'),

  getWithdrawalEligibility: () =>
    request<{ successfulReferrals: number; referralsRequired: number; verifiedDeposit: boolean; depositMinimum: number; canWithdraw: boolean }>('/api/transactions/eligibility'),

  submitWithdrawal: (payload: { amount: number; bankName: string; accountNumber: string; accountName: string }) =>
    request<{ message: string; withdrawal?: WithdrawalRequest; transaction?: any; balance?: number }>('/api/transactions/withdraw', {
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
  getTasks: async () => {
    const res = await request<{ tasks: any[] }>('/api/nivo/tasks');
    return (res.tasks || []).map((t: any) => {
      const status = (t.status || 'not_started') as TaskSubmissionStatus;
      return {
        ...t,
        rewardAmount: Number(t.rewardamount ?? t.rewardAmount ?? 0),
        timerSeconds: Number(t.timerseconds ?? t.timerSeconds ?? 0),
        completionCount: Number(t.completioncount ?? t.completionCount ?? 0),
        enabled: Boolean(Number(t.enabled ?? 1)),
        verificationType: t.verificationtype ?? t.verificationType ?? 'timer',
        proofInstructions: t.proofinstructions ?? t.proofInstructions ?? '',
        actionUrl: t.actionurl ?? t.actionUrl ?? '/',
        userStatus: status,
        submission: t.submission || null,
        completed: status === 'claimed' || status === 'approved',
      };
    });
  },

  startTask: (taskId: string) =>
    request<{ message: string; submission: TaskSubmission }>(`/api/nivo/tasks/${taskId}/start`, {
      method: 'POST',
    }),

  submitTaskProof: (taskId: string, proofText?: string, proofUrl?: string) =>
    request<{ message: string; submission: TaskSubmission; credited?: boolean }>(`/api/nivo/tasks/${taskId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ proofText, proofUrl }),
    }),

  completeTask: (taskId: string, proofText?: string, proofUrl?: string) =>
    request<{ message: string; submission: TaskSubmission; credited?: boolean }>(`/api/nivo/tasks/${taskId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ taskId, proofText, proofUrl }),
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

  getAdminPaymentOverview: () => request<PaymentOverviewResponse>('/api/admin/payment-overview', {}, true),

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

  getAdminTasks: async () => {
    const res = await request<{ success: boolean; tasks: any[] }>('/api/admin/nivo/tasks', {}, true);
    return (res.tasks || []).map((t: any) => ({
      ...t,
      rewardAmount: Number(t.rewardamount ?? t.rewardAmount ?? 0),
      timerSeconds: Number(t.timerseconds ?? t.timerSeconds ?? 0),
      completionCount: Number(t.completioncount ?? t.completionCount ?? 0),
      enabled: Boolean(Number(t.enabled ?? 0)),
      verificationType: t.verificationtype ?? t.verificationType ?? 'timer',
      proofInstructions: t.proofinstructions ?? t.proofInstructions ?? '',
      actionUrl: t.actionurl ?? t.actionUrl ?? '/',
    }));
  },

  getAdminTaskSubmissions: async () => {
    const res = await request<{ success: boolean; submissions: any[] }>('/api/admin/nivo/tasks', {}, true);
    return (res.submissions || []).map((s: any) => ({
      ...s,
      userId: s.userid ?? s.userId,
      taskId: s.taskid ?? s.taskId,
      taskTitle: s.tasktitle ?? s.taskTitle,
      rewardAmount: Number(s.rewardamount ?? s.rewardAmount ?? 0),
      userEmail: s.useremail ?? s.userEmail,
      userName: s.username ?? s.userName ?? s.useremail ?? s.userEmail ?? 'User',
      status: s.status,
      completedAt: s.completedat ?? s.completedAt,
      createdAt: s.createdat ?? s.createdAt,
      proofText: s.prooftext ?? s.proofText ?? '',
      adminNote: s.adminnote ?? s.adminNote ?? '',
    }));
  },

  approveTaskSubmission: (submissionId: string, adminNote?: string) =>
    request<{ success: boolean; message?: string; submission?: TaskSubmission }>(`/api/admin/nivo/submissions/${submissionId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ adminNote }),
    }, true),

  rejectTaskSubmission: (submissionId: string, adminNote?: string) =>
    request<{ success: boolean; message?: string; submission?: TaskSubmission }>(`/api/admin/nivo/submissions/${submissionId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason: adminNote }),
    }, true),

  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'completionCount'>) =>
    request<Task>('/api/admin/nivo/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    }, true),

  updateTask: (taskId: string, task: Partial<Task>) =>
    request<Task>(`/api/admin/nivo/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(task),
    }, true),

  deleteTask: (taskId: string) =>
    request<{ success: boolean }>(`/api/admin/nivo/tasks/${taskId}`, {
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

  // Activation & Manual Overrides
  getActivationStatus: () =>
    request<{ request?: ActivationRequest; activationPaid: boolean; feeAmount: number }>('/api/activation/status'),

  submitActivationPayment: (senderName: string, paymentProofRef: string) =>
    request<{ message: string; activation: ActivationRequest }>('/api/activation/pay', {
      method: 'POST',
      body: JSON.stringify({ senderName, paymentProofRef }),
    }),

  getAdminActivations: () => request<ActivationRequest[]>('/api/admin/activations', {}, true),

  approveActivation: (activationId: string, adminNote?: string) =>
    request<{ message: string; activation: ActivationRequest }>(`/api/admin/activations/${activationId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ adminNote }),
    }, true),

  rejectActivation: (activationId: string, adminNote?: string) =>
    request<{ message: string; activation: ActivationRequest }>(`/api/admin/activations/${activationId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ adminNote }),
    }, true),

  setUserActivationStatus: (userId: string, activationPaid: boolean) =>
    request<User>(`/api/admin/users/${userId}/activation`, {
      method: 'POST',
      body: JSON.stringify({ activationPaid }),
    }, true),

  setUserReferralCount: (userId: string, referralCount: number) =>
    request<User>(`/api/admin/users/${userId}/referral-count`, {
      method: 'POST',
      body: JSON.stringify({ referralCount }),
    }, true),

  // Rewarded Ads (Google Ad Manager / GPT Web Rewarded)
  getAdConfig: () =>
    request<{
      success: boolean;
      provider: string;
      adUnitPath: string;
      rewardAmount: number;
      currency: string;
      currencySymbol: string;
      instruction: string;
    }>('/api/ads/config'),

  getAdStats: () =>
    request<{
      success: boolean;
      rewardAmount: number;
      totalAdsWatched: number;
      totalEarnings: number;
      todayEarnings: number;
      todayAdsCount: number;
      history: {
        id: string;
        sessionId: string;
        provider: string;
        rewardAmount: number;
        status: string;
        reference: string;
        createdAt: string;
        completedAt: string;
      }[];
    }>('/api/ads/stats'),

  createAdSession: () =>
    request<{
      success: boolean;
      sessionId: string;
      adUnitPath: string;
      rewardAmount: number;
      clientNonce: string;
      timestamp: number;
    }>('/api/ads/session', {
      method: 'POST',
    }),

  verifyAdReward: (payload: { sessionId: string; providerToken?: any; providerTxId?: string }) =>
    request<{
      success: boolean;
      message: string;
      rewardAmount: number;
      newBalance?: number;
      alreadyClaimed?: boolean;
      reference?: string;
    }>('/api/ads/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
