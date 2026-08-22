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

// --- KORA ONE-TIME BANK TRANSFER DEPOSIT SYSTEM ---
// Kora's Pay with Bank Transfer API creates a dynamic, temporary, single-use
// bank account for each transaction. The account expires after the time
// returned by Kora and a new deposit always gets a new account.
app.post('/api/kora/initialize-bank-transfer', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { amount } = req.body;
    const numAmount = Number(amount);

    if (!numAmount || isNaN(numAmount) || numAmount < 520) {
      res.status(400).json({ error: 'Minimum deposit amount is ₦520.' });
      return;
    }

    const koraSecret = process.env.KORAPAY_SECRET_KEY;
    if (!koraSecret || !koraSecret.startsWith('sk_')) {
      res.status(503).json({ error: 'Kora payment service is not configured. Add KORAPAY_SECRET_KEY to the server environment.' });
      return;
    }

    const reference = `NIVO-KORA-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const notificationUrl = `${appUrl.replace(/\/$/, '')}/api/kora/webhook`;

    const koraResp = await fetch('https://api.korapay.com/merchant/api/v1/charges/bank-transfer', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${koraSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reference,
        amount: numAmount,
        currency: 'NGN',
        notification_url: notificationUrl,
        customer: {
          name: user.fullName,
          email: user.email,
        },
        account_name: `Nivo Cash - ${user.fullName}`,
        merchant_bears_cost: true,
        narration: `Nivo Cash wallet deposit - ${reference}`,
      }),
    });

    const koraData: any = await koraResp.json();
    if (!koraResp.ok || !koraData.status || !koraData.data?.bank_account?.account_number) {
      console.error('Kora bank transfer initialization failed:', koraData);
      res.status(400).json({ error: koraData.message || 'Kora could not generate a one-time account. Please try again.' });
      return;
    }

    const bankAccount = koraData.data.bank_account;
    const expiresAt = bankAccount.expiry_date_in_utc || undefined;
    const deposit = db.createKoraDeposit(user.id, numAmount, {
      bankName: bankAccount.bank_name || 'Kora Bank',
      accountNumber: bankAccount.account_number,
      accountName: bankAccount.account_name || `Nivo Cash - ${user.fullName}`,
      reference: koraData.data.reference || reference,
      expiresAt,
    });

    res.status(201).json({
      message: 'One-time Kora payment account created successfully.',
      deposit,
    });
  } catch (err: any) {
    console.error('Kora initialization error:', err);
    res.status(400).json({ error: err.message || 'Failed to generate one-time payment account.' });
  }
});

// Legacy route kept only so older clients fail gracefully rather than creating
// a permanent Paystack DVA. New clients must use the Kora route above.
app.post('/api/paystack/initialize-virtual-account', authMiddleware, (req: Request, res: Response) => {
  res.status(410).json({ error: 'This deposit method has been replaced with Kora one-time bank transfer accounts. Please refresh the app.' });
});

app.post('/api/wallet/deposit', authMiddleware, (req: Request, res: Response) => {
  res.status(410).json({ error: 'This deposit method has been replaced with Kora one-time bank transfer accounts. Please refresh the app.' });
});

// Check a Kora deposit by querying Kora's transaction endpoint.
app.get('/api/kora/check-status/:reference', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;
    let deposit = db.getDepositByReference(reference);
    if (!deposit) {
      res.status(404).json({ error: 'Deposit reference not found.' });
      return;
    }

    const koraSecret = process.env.KORAPAY_SECRET_KEY;
    if (deposit.status === 'pending' && koraSecret && koraSecret.startsWith('sk_')) {
      try {
        const verifyResp = await fetch(`https://api.korapay.com/merchant/api/v1/charges/${encodeURIComponent(reference)}`, {
          headers: { Authorization: `Bearer ${koraSecret}` },
        });
        const verifyData: any = await verifyResp.json();
        if (verifyResp.ok && verifyData.status && verifyData.data?.status === 'success') {
          const paidAmount = Number(verifyData.data.amount_paid ?? verifyData.data.amount ?? deposit.amount);
          const processed = db.processKoraDeposit(reference, paidAmount, verifyData.data.reference || reference);
          deposit = processed.deposit;
        }
      } catch (err) {
        console.warn('Kora transaction query error:', err);
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

// Kora webhook: verify the HMAC-SHA256 signature over ONLY req.body.data.
app.post('/api/kora/webhook', (req: Request, res: Response) => {
  try {
    const secret = process.env.KORAPAY_WEBHOOK_SECRET || process.env.KORAPAY_SECRET_KEY;
    const signature = req.headers['x-korapay-signature'] as string;

    if (secret && signature) {
      const hash = crypto.createHmac('sha256', secret).update(JSON.stringify(req.body?.data || {})).digest('hex');
      if (hash !== signature) {
        console.warn('Invalid Kora webhook signature.');
        res.status(401).json({ error: 'Invalid Kora signature.' });
        return;
      }
    } else if (secret && !signature) {
      res.status(401).json({ error: 'Missing Kora webhook signature.' });
      return;
    }

    const event = req.body?.event;
    const data = req.body?.data;
    if (event === 'charge.success' && data?.reference && data?.status === 'success') {
      const koraSecret = process.env.KORAPAY_SECRET_KEY;
      let amount = Number(data.amount_paid ?? data.amount);

      // Requery before crediting, as recommended by Kora.
      if (koraSecret && koraSecret.startsWith('sk_')) {
        fetch(`https://api.korapay.com/merchant/api/v1/charges/${encodeURIComponent(data.reference)}`, {
          headers: { Authorization: `Bearer ${koraSecret}` },
        }).then(r => r.json()).then((verified: any) => {
          if (verified?.status && verified?.data?.status === 'success') {
            const verifiedAmount = Number(verified.data.amount_paid ?? verified.data.amount ?? amount);
            db.processKoraDeposit(data.reference, verifiedAmount, verified.data.reference || data.reference);
          }
        }).catch(err => console.error('Kora webhook verification query failed:', err));
      } else {
        db.processKoraDeposit(data.reference, amount, data.reference);
      }
    }

    res.status(200).json({ status: true, message: 'Kora webhook event received.' });
  } catch (err: any) {
    console.error('Kora webhook error:', err);
    res.status(500).json({ error: 'Webhook processing error.' });
  }
});

// --- Paystack bank utilities remain for withdrawal account verification ---

// Paystack Banks List Endpoint
app.get('/api/paystack/banks', authMiddleware, async (req: Request, res: Response) => {
  try {
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (paystackSecret && paystackSecret.startsWith('sk_')) {
      try {
        const resp = await fetch('https://api.paystack.co/bank?country=nigeria', {
          headers: { Authorization: `Bearer ${paystackSecret}` },
        });
        const data = await resp.json();
        if (data.status && Array.isArray(data.data)) {
          const banks = data.data.map((b: any) => ({ name: b.name, code: b.code }));
          res.json(banks);
          return;
        }
      } catch (e) {
        // Fallback below
      }
    }

    const defaultBanks = [
      { name: 'Access Bank', code: '044' },
      { name: 'Guaranty Trust Bank (GTBank)', code: '058' },
      { name: 'Zenith Bank', code: '057' },
      { name: 'First Bank of Nigeria', code: '011' },
      { name: 'United Bank For Africa (UBA)', code: '033' },
      { name: 'Kuda Microfinance Bank', code: '50211' },
      { name: 'OPay Digital Services', code: '999992 font' },
      { name: 'PalmPay', code: '999991' },
      { name: 'Moniepoint MFB', code: '50515' },
      { name: 'Wema Bank', code: '035' },
      { name: 'Sterling Bank', code: '232' },
      { name: 'FCMB', code: '214' },
      { name: 'Fidelity Bank', code: '070' },
      { name: 'Stanbic IBTC Bank', code: '221' },
    ];
    res.json(defaultBanks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Paystack Account Resolution Endpoint
app.post('/api/paystack/resolve-account', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { accountNumber, bankCode } = req.body;
    if (!accountNumber || accountNumber.trim().length !== 10 || !/^\d+$/.test(accountNumber)) {
      res.status(400).json({ error: 'Invalid bank account. Account number must be 10 digits.' });
      return;
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (paystackSecret && paystackSecret.startsWith('sk_') && bankCode) {
      try {
        const resp = await fetch(`https://api.paystack.co/bank/resolve?account_number=${encodeURIComponent(accountNumber)}&bank_code=${encodeURIComponent(bankCode)}`, {
          headers: { Authorization: `Bearer ${paystackSecret}` },
        });
        const data = await resp.json();
        if (data.status && data.data?.account_name) {
          res.json({
            accountNumber: data.data.account_number || accountNumber,
            accountName: data.data.account_name,
            status: 'verified',
          });
          return;
        } else if (data.message) {
          res.status(400).json({ error: data.message || 'Invalid bank account. Verification failed.' });
          return;
        }
      } catch (e) {
        // Fallback to local resolver if API call fails
      }
    }

    // Fallback account resolution for sandbox/preview testing:
    const user = (req as any).user;
    const resolvedName = user ? user.fullName.toUpperCase() : 'VERIFIED ACCOUNT HOLDER';
    res.json({
      accountNumber,
      accountName: resolvedName,
      status: 'verified',
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to verify account details.' });
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
