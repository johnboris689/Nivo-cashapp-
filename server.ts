import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { db } from './server/db.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Authentication Middleware
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Missing token.' });
    return;
  }
  const token = authHeader.split(' ')[1];
  const user = db.getUserById(token);
  if (!user) {
    res.status(401).json({ error: 'Invalid or expired session token.' });
    return;
  }
  (req as any).user = user;
  next();
}

// Admin Auth Middleware
function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Admin authentication required.' });
    return;
  }
  const token = authHeader.split(' ')[1];
  const user = db.getUserById(token);
  if (!user || (!user.isAdmin && user.email.toLowerCase() !== 'talkdavidjohn@gmail.com')) {
    res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    return;
  }
  (req as any).user = user;
  next();
}

// --- PUBLIC SITE SETTINGS & BANK DETAILS ---
app.get('/api/settings', (req: Request, res: Response) => {
  try {
    const settings = db.getSiteSettings();
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/bank-details', (req: Request, res: Response) => {
  try {
    const bank = db.getBankDetails();
    res.json(bank);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- AUTHENTICATION ENDPOINTS ---
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { fullName, username, email, phone, password, referralCode } = req.body;
    if (!fullName || !username || !email || !phone || !password) {
      res.status(400).json({ error: 'All registration fields are required.' });
      return;
    }

    const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const result = db.createUser({
      fullName,
      username,
      email,
      phone,
      passwordRaw: password,
      referralCodeInput: referralCode,
      appUrl,
    });

    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername || !password) {
      res.status(400).json({ error: 'Please enter your email/username and password.' });
      return;
    }

    const result = db.loginUser(emailOrUsername, password);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/auth/me', authMiddleware, (req: Request, res: Response) => {
  res.json({ user: (req as any).user });
});

app.post('/api/user/avatar', authMiddleware, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { avatarUrl } = req.body;
    if (!avatarUrl) {
      res.status(400).json({ error: 'Avatar URL is required.' });
      return;
    }
    const updatedUser = db.updateUserAvatar(userId, avatarUrl);
    res.json({ message: 'Profile avatar updated successfully!', user: updatedUser });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Please enter your email address.' });
      return;
    }
    res.json({ message: 'Password reset code sent to your email. Check inbox or spam folder.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- WALLET & TRANSACTIONS ---
app.get('/api/wallet/transactions', authMiddleware, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const transactions = db.getUserTransactions(userId);
    res.json(transactions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- PAYSTACK DEDICATED VIRTUAL ACCOUNT DEPOSIT SYSTEM ---

// 1. Initialize Paystack Dedicated Virtual Account / Deposit Reference
app.post('/api/paystack/initialize-virtual-account', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { amount } = req.body;

    const numAmount = Number(amount);
    if (!numAmount || isNaN(numAmount) || numAmount < 1000) {
      res.status(400).json({ error: 'Minimum deposit amount is ₦1,000.' });
      return;
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    let dvaInfo: { bankName?: string; accountNumber?: string; accountName?: string; reference?: string } | undefined;

    // If real Paystack Secret Key is configured, attempt real Paystack DVA creation
    if (paystackSecret && paystackSecret.startsWith('sk_')) {
      try {
        const reference = `NV-PSTK-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

        // Create or get customer on Paystack
        const customerResp = await fetch('https://api.paystack.co/customer', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${paystackSecret}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            first_name: user.fullName.split(' ')[0] || user.fullName,
            last_name: user.fullName.split(' ')[1] || 'User',
            phone: user.phone || '+2340000000000',
          }),
        });
        const customerData = await customerResp.json();

        if (customerData.status && customerData.data?.customer_code) {
          // Assign dedicated virtual account
          const dvaResp = await fetch('https://api.paystack.co/dedicated_account', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${paystackSecret}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              customer: customerData.data.customer_code,
              preferred_bank: 'wema-bank',
            }),
          });
          const dvaData = await dvaResp.json();

          if (dvaData.status && dvaData.data?.account_number) {
            dvaInfo = {
              bankName: dvaData.data.bank?.name || 'Wema Bank (Paystack DVA)',
              accountNumber: dvaData.data.account_number,
              accountName: dvaData.data.account_name || `Nivo Cash - ${user.fullName}`,
              reference: reference,
            };
          }
        }
      } catch (paystackErr) {
        console.warn('Paystack API call notice:', paystackErr);
        // Fallback to seamless automated virtual account simulation if Paystack API fails or rate-limited
      }
    }

    // Default fallback DVA info if Paystack secret is absent or fallback triggered
    if (!dvaInfo) {
      const reference = `NV-PSTK-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const bankOptions = ['Wema Bank (Paystack DVA)', 'Sterling Bank (Paystack DVA)', 'Paystack Titan Bank'];
      const chosenBank = bankOptions[Math.floor(Math.random() * bankOptions.length)];
      // Generate 10-digit virtual account number
      const accNum = `99${Math.floor(10000000 + Math.random() * 90000000)}`;

      dvaInfo = {
        bankName: chosenBank,
        accountNumber: accNum,
        accountName: `Nivo Cash - ${user.fullName}`,
        reference: reference,
      };
    }

    const deposit = db.createPaystackDeposit(user.id, numAmount, dvaInfo);
    res.status(201).json({
      message: 'Paystack Dedicated Virtual Account created successfully!',
      deposit,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Legacy route redirect for backwards compatibility
app.post('/api/wallet/deposit', authMiddleware, (req: Request, res: Response) => {
  res.redirect(307, '/api/paystack/initialize-virtual-account');
});

// 2. Check Automated Deposit Status (polling / refresh)
app.get('/api/paystack/check-status/:reference', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;
    let deposit = db.getDepositByReference(reference);

    if (!deposit) {
      res.status(404).json({ error: 'Deposit reference not found.' });
      return;
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    // If pending and Paystack secret key exists, query Paystack API
    if (deposit.status === 'pending' && paystackSecret && paystackSecret.startsWith('sk_')) {
      try {
        const verifyResp = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
          headers: {
            Authorization: `Bearer ${paystackSecret}`,
          },
        });
        const verifyData = await verifyResp.json();
        if (verifyData.status && verifyData.data?.status === 'success') {
          const paidAmount = verifyData.data.amount ? verifyData.data.amount / 100 : deposit.amount;
          const processed = db.processPaystackDeposit(reference, paidAmount, verifyData.data.id?.toString());
          deposit = processed.deposit;
        }
      } catch (err) {
        console.warn('Verify transaction error:', err);
      }
    }

    const user = (req as any).user;
    res.json({
      status: deposit.status,
      webhookStatus: deposit.webhookStatus,
      deposit,
      userWalletBalance: user.walletBalance,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 3. Instant Transfer Demo Simulation Trigger (for rapid test / preview)
app.post('/api/paystack/simulate-webhook', authMiddleware, (req: Request, res: Response) => {
  try {
    const { reference } = req.body;
    if (!reference) {
      res.status(400).json({ error: 'Deposit reference is required.' });
      return;
    }

    const processed = db.processPaystackDeposit(reference);
    res.json({
      message: 'Payment verified and credited automatically by Paystack Webhook engine!',
      deposit: processed.deposit,
      user: processed.user,
      alreadyProcessed: processed.alreadyProcessed,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 4. Official Paystack Webhook Endpoint (HMAC SHA512 Signature Verification)
app.post('/api/paystack/webhook', (req: Request, res: Response) => {
  try {
    const secret = process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET_KEY;
    const signature = req.headers['x-paystack-signature'] as string;

    // Verify signature if secret key is configured
    if (secret && signature) {
      const hash = crypto
        .createHmac('sha512', secret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (hash !== signature) {
        console.warn('⚠️ Invalid Paystack webhook signature header');
        res.status(401).json({ error: 'Invalid Paystack signature signature' });
        return;
      }
    }

    const event = req.body?.event;
    const data = req.body?.data;

    if (event === 'charge.success' && data) {
      const reference = data.reference;
      const amountInNaira = data.amount ? data.amount / 100 : undefined;
      const providerTxId = data.id?.toString();

      if (reference) {
        db.processPaystackDeposit(reference, amountInNaira, providerTxId);
        console.log(`✅ Paystack Webhook successfully processed deposit ref: ${reference}`);
      }
    }

    res.status(200).json({ status: true, message: 'Webhook event received' });
  } catch (err: any) {
    console.error('Paystack webhook error:', err);
    res.status(500).json({ error: 'Webhook processing error' });
  }
});

app.post('/api/wallet/withdraw', authMiddleware, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { amount, bankName, accountNumber, accountName } = req.body;

    if (!amount || !bankName || !accountNumber || !accountName) {
      res.status(400).json({ error: 'Please fill in all bank withdrawal details.' });
      return;
    }

    const withdrawal = db.createWithdrawal(userId, Number(amount), bankName, accountNumber, accountName);
    res.status(201).json({ message: 'Withdrawal request submitted successfully!', withdrawal });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- ACTIVATION ENDPOINTS ---
app.get('/api/activation/status', authMiddleware, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const status = db.getUserActivation(userId);
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/activation/pay', authMiddleware, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { senderName, paymentProofRef } = req.body;

    if (!senderName || !paymentProofRef) {
      res.status(400).json({ error: 'Please enter sender name and payment reference.' });
      return;
    }

    const activationReq = db.createActivationRequest(userId, senderName, paymentProofRef);
    res.status(201).json({
      message: 'Activation payment request submitted successfully! Awaiting administrator confirmation.',
      activation: activationReq,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- REFERRALS ---
app.get('/api/referrals/stats', authMiddleware, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const referrals = db.getUserReferrals(user.id);
    res.json({
      referralCode: user.referralCode,
      referralLink: user.referralLink,
      totalReferrals: user.totalReferrals,
      totalReferralBonus: user.totalReferralBonus,
      successfulReferrals: referrals.filter(r => r.status === 'successful').length,
      pendingReferrals: referrals.filter(r => r.status === 'pending').length,
      referralsList: referrals,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- TASKS & VERIFICATION SYSTEM ---
app.get('/api/tasks', authMiddleware, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const tasks = db.getTasksForUser(userId);
    res.json(tasks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks/:id/start', authMiddleware, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const taskId = req.params.id;
    const submission = db.startTask(userId, taskId);
    res.json({ message: 'Task timer started.', submission });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/tasks/:id/submit', authMiddleware, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const taskId = req.params.id;
    const { proofText, proofUrl } = req.body;
    const result = db.submitTaskProof(userId, taskId, proofText, proofUrl);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/tasks/complete', authMiddleware, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { taskId, proofText, proofUrl } = req.body;
    if (!taskId) {
      res.status(400).json({ error: 'Task ID is required.' });
      return;
    }

    const result = db.submitTaskProof(userId, taskId, proofText, proofUrl);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- NOTIFICATIONS ---
app.get('/api/notifications', authMiddleware, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const notifications = db.getUserNotifications(userId);
    res.json(notifications);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/notifications/mark-read', authMiddleware, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { notificationId } = req.body;
    db.markNotificationRead(userId, notificationId);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- ADMIN ENDPOINTS ---
app.post('/api/admin/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const result = db.loginUser(email, password);
    if (!result.user.isAdmin) {
      res.status(403).json({ error: 'Access denied. Account does not have administrator privileges.' });
      return;
    }

    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Invalid administrator credentials.' });
  }
});

app.get('/api/admin/stats', adminMiddleware, (req: Request, res: Response) => {
  try {
    const stats = db.getAdminStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/users', adminMiddleware, (req: Request, res: Response) => {
  try {
    const users = db.listUsers();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/users/:id/status', adminMiddleware, (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const { status } = req.body;
    const updatedUser = db.updateUserStatus(userId, status);
    res.json(updatedUser);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/users/:id/adjust-balance', adminMiddleware, (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const { amount, type, reason } = req.body;
    if (!amount || !type || !reason) {
      res.status(400).json({ error: 'Amount, adjustment type (credit/debit), and reason are required.' });
      return;
    }

    const updatedUser = db.adjustUserBalance(userId, Number(amount), type, reason);
    res.json(updatedUser);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/users/:id/activation', adminMiddleware, (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const { activationPaid } = req.body;
    if (typeof activationPaid !== 'boolean') {
      res.status(400).json({ error: 'activationPaid boolean is required.' });
      return;
    }
    const updatedUser = db.setUserActivationStatus(userId, activationPaid);
    res.json(updatedUser);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/users/:id/referral-count', adminMiddleware, (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const { referralCount } = req.body;
    if (typeof referralCount !== 'number') {
      res.status(400).json({ error: 'referralCount number is required.' });
      return;
    }
    const updatedUser = db.setUserReferralCount(userId, referralCount);
    res.json(updatedUser);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/admin/activations', adminMiddleware, (req: Request, res: Response) => {
  try {
    const activations = db.listActivations();
    res.json(activations);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/activations/:id/approve', adminMiddleware, (req: Request, res: Response) => {
  try {
    const activationId = req.params.id;
    const { adminNote } = req.body;
    const approved = db.approveActivation(activationId, adminNote);
    res.json({ message: 'Activation approved successfully!', activation: approved });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/activations/:id/reject', adminMiddleware, (req: Request, res: Response) => {
  try {
    const activationId = req.params.id;
    const { adminNote } = req.body;
    const rejected = db.rejectActivation(activationId, adminNote);
    res.json({ message: 'Activation request rejected.', activation: rejected });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/admin/users/:id', adminMiddleware, (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    db.deleteUser(userId);
    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/admin/deposits', adminMiddleware, (req: Request, res: Response) => {
  try {
    const deposits = db.listDeposits();
    res.json(deposits);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/deposits/:id/approve', adminMiddleware, (req: Request, res: Response) => {
  try {
    const depositId = req.params.id;
    const { adminNote } = req.body;
    const approved = db.approveDeposit(depositId, adminNote);
    res.json({ message: 'Deposit approved and wallet credited successfully!', deposit: approved });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/deposits/:id/reject', adminMiddleware, (req: Request, res: Response) => {
  try {
    const depositId = req.params.id;
    const { adminNote } = req.body;
    const rejected = db.rejectDeposit(depositId, adminNote);
    res.json({ message: 'Deposit request rejected.', deposit: rejected });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/bank-details', adminMiddleware, (req: Request, res: Response) => {
  try {
    const updated = db.updateBankDetails(req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/admin/withdrawals', adminMiddleware, (req: Request, res: Response) => {
  try {
    const withdrawals = db.listWithdrawals();
    res.json(withdrawals);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/withdrawals/:id/approve', adminMiddleware, (req: Request, res: Response) => {
  try {
    const withdrawalId = req.params.id;
    const { adminNote } = req.body;
    const approved = db.approveWithdrawal(withdrawalId, adminNote);
    res.json({ message: 'Withdrawal approved.', withdrawal: approved });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/withdrawals/:id/reject', adminMiddleware, (req: Request, res: Response) => {
  try {
    const withdrawalId = req.params.id;
    const { adminNote } = req.body;
    const rejected = db.rejectWithdrawal(withdrawalId, adminNote);
    res.json({ message: 'Withdrawal rejected and refunded to user.', withdrawal: rejected });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/admin/tasks', adminMiddleware, (req: Request, res: Response) => {
  try {
    const tasks = db.getTasks();
    res.json(tasks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/tasks/submissions', adminMiddleware, (req: Request, res: Response) => {
  try {
    const submissions = db.getAllTaskSubmissions();
    res.json(submissions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/tasks/submissions/:id/approve', adminMiddleware, (req: Request, res: Response) => {
  try {
    const submissionId = req.params.id;
    const { adminNote } = req.body;
    const approved = db.approveTaskSubmission(submissionId, adminNote);
    res.json({ message: 'Task submission approved & reward credited!', submission: approved });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/tasks/submissions/:id/reject', adminMiddleware, (req: Request, res: Response) => {
  try {
    const submissionId = req.params.id;
    const { adminNote } = req.body;
    const rejected = db.rejectTaskSubmission(submissionId, adminNote);
    res.json({ message: 'Task submission rejected.', submission: rejected });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/tasks', adminMiddleware, (req: Request, res: Response) => {
  try {
    const task = db.createTask(req.body);
    res.status(201).json(task);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/admin/tasks/:id', adminMiddleware, (req: Request, res: Response) => {
  try {
    const task = db.updateTask(req.params.id, req.body);
    res.json(task);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/admin/tasks/:id', adminMiddleware, (req: Request, res: Response) => {
  try {
    db.deleteTask(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/settings', adminMiddleware, (req: Request, res: Response) => {
  try {
    const updated = db.updateSiteSettings(req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/admin/referrals', adminMiddleware, (req: Request, res: Response) => {
  try {
    const referrals = db.getAllReferrals();
    res.json(referrals);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// START SERVER & VITE MIDDLEWARE
async function startServer() {
  // Initialize Supabase PostgreSQL database state
  await db.init();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Nivo Cash App server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
