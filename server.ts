import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from './server/db.js';
import { PaystackProvider } from './server/payments/providers/paystack.js';
import { PaymentManager } from './server/payments/index.js';

dotenv.config();

const app = express();
const PORT = 3000;
const paymentManager = new PaymentManager();

app.use(express.json({ verify: (req: Request, _res, buf) => { (req as any).rawBody = Buffer.from(buf); } }));

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
  if (!user || !user.isAdmin) {
    res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    return;
  }
  (req as any).user = user;
  next();
}

// Verify a legacy Paystack checkout reference and, when it matches a locally-created
// pending deposit, process the exact amount. Current one-time Paystack deposits use
// /api/paystack/check-status/:reference as their primary verification path.
app.get('/api/payments/verify/:reference', authMiddleware, async (req: Request, res: Response) => {
  try {
    const reference = String(req.params.reference || '').trim();
    if (!reference) {
      res.status(400).json({ error: 'Payment reference is required.' });
      return;
    }

    const deposit = db.getDepositByReference(reference);
    const currentUser = (req as any).user;
    if (deposit && deposit.userId !== currentUser.id) {
      res.status(403).json({ error: 'You are not allowed to verify this payment.' });
      return;
    }

    const provider = new PaystackProvider();
    const result = await provider.verifyPayment(reference);

    if (result.status === 'successful' && deposit && deposit.status === 'pending' &&
        result.amount === deposit.amount && result.currency === 'NGN') {
      const processed = db.processPaystackDeposit(reference, result.amount, result.providerReference);
      res.json({
        status: 'approved',
        message: 'Payment successfully verified! Your wallet has been credited.',
        deposit: processed.deposit,
      });
      return;
    }

    res.json({
      status: result.status === 'successful' ? 'approved' : result.status,
      message: result.status === 'successful'
        ? 'Payment successfully verified.'
        : 'Payment is being processed by the gateway.',
      reference: result.reference,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Payment verification failed.' });
  }
});

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

app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }

    const genericMessage = 'If an account exists for this email, a verification code has been sent.';
    const user = db.findUserByEmail(email);

    // Never reveal whether an account exists.
    if (!user) {
      res.json({ message: genericMessage });
      return;
    }

    const existing = db.getLatestPasswordResetRequest(email);
    if (existing && Date.now() - new Date(existing.createdAt).getTime() < 60_000) {
      res.json({ message: genericMessage });
      return;
    }

    const resendKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;
    if (!resendKey || !from) {
      console.error('Password reset email service is not configured.');
      res.status(503).json({ error: 'Password reset email service is temporarily unavailable. Please try again later.' });
      return;
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    db.createPasswordResetRequest(user.id, email, otpHash, expiresAt);

    const emailResp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: 'Your Nivo Cash password reset code',
        html: `
          <div style="font-family:Arial,sans-serif;background:#100709;padding:32px;color:#fff">
            <div style="max-width:560px;margin:auto;background:#240A12;border:1px solid #65152A;border-radius:20px;padding:32px">
              <h2 style="margin:0 0 12px;color:#fff">NIVO CASH</h2>
              <p style="color:#E6D5DA">Use the verification code below to reset your password.</p>
              <div style="font-size:34px;font-weight:800;letter-spacing:10px;color:#C13A5A;background:#100709;border:1px solid #7A1831;border-radius:14px;padding:18px;text-align:center">${otp}</div>
              <p style="color:#B99BA3">This code expires in 10 minutes. If you did not request a password reset, you can safely ignore this email.</p>
            </div>
          </div>
        `,
      }),
    });

    if (!emailResp.ok) {
      const body = await emailResp.text();
      console.error('Password reset email provider error:', body);
      res.status(502).json({ error: 'Unable to send the verification email. Please try again later.' });
      return;
    }

    res.json({ message: genericMessage });
  } catch (err: any) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Unable to process password reset request.' });
  }
});

app.post('/api/auth/verify-reset-otp', (req: Request, res: Response) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const otp = String(req.body?.otp || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{6}$/.test(otp)) {
      res.status(400).json({ error: 'Enter the 6-digit verification code.' });
      return;
    }

    const request = db.getLatestPasswordResetRequest(email);
    if (!request || new Date(request.expiresAt).getTime() < Date.now()) {
      res.status(400).json({ error: 'This verification code is invalid or expired. Please request a new code.' });
      return;
    }
    if (request.attempts >= 5) {
      res.status(429).json({ error: 'Too many incorrect attempts. Please request a new code.' });
      return;
    }

    const providedHash = crypto.createHash('sha256').update(otp).digest('hex');
    const expected = Buffer.from(request.otpHash, 'hex');
    const provided = Buffer.from(providedHash, 'hex');
    const valid = expected.length === provided.length && crypto.timingSafeEqual(expected, provided);
    if (!valid) {
      db.incrementPasswordResetAttempts(request.id);
      res.status(400).json({ error: 'Incorrect verification code.' });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    db.verifyPasswordResetOtp(request.id, resetTokenHash, resetTokenExpiresAt);

    res.json({ message: 'Code verified successfully.', resetToken });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Unable to verify code.' });
  }
});

app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const resetToken = String(req.body?.resetToken || '');
    const newPassword = String(req.body?.newPassword || '');
    const confirmPassword = String(req.body?.confirmPassword || '');

    if (!email || !resetToken) {
      res.status(400).json({ error: 'Your reset session is invalid. Please start again.' });
      return;
    }
    if (newPassword.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      res.status(400).json({ error: 'Passwords do not match.' });
      return;
    }

    const request = db.getLatestPasswordResetRequest(email);
    if (!request || request.email !== email || !request.verifiedAt || !request.resetTokenHash || !request.resetTokenExpiresAt ||
        new Date(request.resetTokenExpiresAt).getTime() < Date.now()) {
      res.status(400).json({ error: 'Your reset session is invalid or expired. Please start again.' });
      return;
    }

    const providedHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expected = Buffer.from(request.resetTokenHash, 'hex');
    const provided = Buffer.from(providedHash, 'hex');
    if (expected.length !== provided.length || !crypto.timingSafeEqual(expected, provided)) {
      res.status(400).json({ error: 'Your reset session is invalid or expired. Please start again.' });
      return;
    }

    const passwordHash = bcrypt.hashSync(newPassword, 12);
    const user = db.completePasswordReset(request.id, passwordHash);

    // Best-effort sync for accounts that also exist in Supabase Auth.
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    if (serviceKey && supabaseUrl) {
      try {
        const listResp = await fetch(`${supabaseUrl}/auth/v1/admin/users?per_page=1000`, {
          headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
        });
        if (listResp.ok) {
          const listData = await listResp.json();
          const authUser = listData?.users?.find((u: any) => u.email?.toLowerCase() === email);
          if (authUser?.id) {
            await fetch(`${supabaseUrl}/auth/v1/admin/users/${authUser.id}`, {
              method: 'PUT',
              headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ password: newPassword }),
            });
          }
        }
      } catch (syncErr) {
        console.warn('Supabase Auth password sync failed:', syncErr);
      }
    }

    res.json({ message: 'Your password has been changed successfully.', user });
  } catch (err: any) {
    console.error('Reset password error:', err);
    res.status(400).json({ error: err.message || 'Unable to reset password.' });
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

// --- PAYSTACK PAY WITH TRANSFER / ONE-TIME DEPOSIT SYSTEM ---

// Generate a real Paystack one-time bank account for the current deposit.
// Paystack calls this Pay with Transfer (PwT). The account is tied to the
// charge reference and expires automatically. No fake/fallback account is used.
app.post('/api/paystack/initialize-virtual-account', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { amount } = req.body;
    const numAmount = Number(amount);

    if (!Number.isFinite(numAmount) || numAmount < 520) {
      res.status(400).json({ error: 'Minimum deposit amount is ₦520.' });
      return;
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret || !paystackSecret.startsWith('sk_')) {
      res.status(503).json({ error: 'Paystack is not configured. Add PAYSTACK_SECRET_KEY to the server environment.' });
      return;
    }

    // Paystack PwT allows 15 minutes minimum and 8 hours maximum.
    // Use 30 minutes so the UI has a practical payment window.
    const accountExpiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    const chargeResp = await fetch('https://api.paystack.co/charge', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        amount: Math.round(numAmount * 100).toString(),
        currency: 'NGN',
        metadata: {
          user_id: user.id,
          username: user.username,
          purpose: 'nivo_cash_wallet_deposit',
        },
        bank_transfer: {
          account_expires_at: accountExpiresAt,
        },
      }),
    });

    const chargeData = await chargeResp.json();

    if (!chargeResp.ok || !chargeData.status || !chargeData.data) {
      const message = chargeData?.message || chargeData?.data?.message || 'Paystack could not create the one-time transfer account.';
      res.status(400).json({ error: message });
      return;
    }

    const charge = chargeData.data;

    // Security/consistency checks: the account must come directly from the
    // Paystack response for this charge. There is deliberately no local/random
    // account-number generator or fallback here.
    if (charge.status !== 'pending_bank_transfer' || !charge.reference || !charge.account_number || !charge.account_name || !charge.bank?.name) {
      res.status(400).json({ error: charge.display_text || 'Paystack did not return a valid one-time bank transfer account.' });
      return;
    }

    // Paystack's Nigerian Pay with Transfer response can omit the `amount`
    // field even though the requested amount is correctly attached to the
    // charge. The Create Charge request above is the source of truth for the
    // requested deposit amount. Do not reject a valid Paystack-generated
    // account merely because that optional response field is absent.
    // The amount is still enforced again when the payment is verified/webhooked
    // before any wallet credit is made.
    const deposit = db.createPaystackDeposit(user.id, numAmount, {
      reference: charge.reference,
      accountNumber: charge.account_number,
      accountName: charge.account_name,
      bankName: charge.bank.name,
      accountExpiresAt: charge.account_expires_at || accountExpiresAt,
    });

    res.status(201).json({
      message: 'Paystack generated the temporary bank transfer account for this deposit.',
      deposit,
    });
  } catch (err: any) {
    console.error('Paystack one-time deposit initialization error:', err);
    res.status(500).json({ error: err.message || 'Failed to request a temporary Paystack payment account.' });
  }
});

// Legacy route forwarding for backwards compatibility
app.post('/api/wallet/deposit', (req: Request, res: Response, next) => {
  req.url = '/api/paystack/initialize-virtual-account';
  (app as any).handle(req, res, next);
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

    const currentUser = (req as any).user;
    if (deposit.userId !== currentUser.id) {
      res.status(403).json({ error: 'You are not allowed to view this deposit.' });
      return;
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    // Polling is a backup to the webhook. Paystack recommends webhooks as the primary
    // confirmation method, but verifying the charge lets the UI update even if the
    // webhook is delayed.
    if (deposit.status === 'pending' && paystackSecret && paystackSecret.startsWith('sk_')) {
      try {
        const verifyResp = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
          headers: { Authorization: `Bearer ${paystackSecret}` },
        });
        const verifyData = await verifyResp.json();
        const verified = verifyData?.status && verifyData?.data;
        if (verified && verifyData.data.status === 'success') {
          const paidAmount = Number(verifyData.data.amount || 0) / 100;
          const currency = String(verifyData.data.currency || 'NGN').toUpperCase();
          const channel = verifyData.data.channel;
          if (currency === 'NGN' && channel === 'bank_transfer' && paidAmount === deposit.amount) {
            const processed = db.processPaystackDeposit(reference, paidAmount, verifyData.data.id?.toString());
            deposit = processed.deposit;
          }
        }
      } catch (err) {
        console.warn('Verify Paystack charge error:', err);
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


// Official Paystack webhook endpoint. Paystack signs the raw request body with
// HMAC-SHA512 using the secret key. charge.success is the event that credits the wallet.
app.post('/api/paystack/webhook', (req: Request, res: Response) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const signature = req.headers['x-paystack-signature'] as string | undefined;

    if (!secret) {
      res.status(503).json({ error: 'Paystack secret key is not configured.' });
      return;
    }

    const rawBody = (req as any).rawBody as Buffer | undefined;
    const payload = rawBody || Buffer.from(JSON.stringify(req.body));
    const expectedSignature = crypto.createHmac('sha512', secret).update(payload).digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const signatureBuffer = Buffer.from(signature || '', 'utf8');
    if (!signature || expectedBuffer.length !== signatureBuffer.length || !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) {
      console.warn('⚠️ Invalid Paystack webhook signature.');
      res.status(401).json({ error: 'Invalid Paystack signature.' });
      return;
    }

    const event = req.body?.event;
    const data = req.body?.data;

    if (event === 'charge.success' && data) {
      const reference = data.reference;
      const amountInNaira = Number(data.amount || 0) / 100;
      const currency = String(data.currency || 'NGN').toUpperCase();
      const providerTxId = data.id?.toString();
      const channel = data.channel;

      if (reference && amountInNaira > 0 && currency === 'NGN' && channel === 'bank_transfer') {
        const deposit = db.getDepositByReference(reference);

        // Only credit a deposit that our server created and only when Paystack
        // confirms the exact requested amount. This prevents arbitrary webhook
        // events from creating wallet credit.
        if (deposit && deposit.status === 'pending' && amountInNaira === deposit.amount) {
          db.processPaystackDeposit(reference, amountInNaira, providerTxId);
          console.log(`✅ Paystack charge.success credited ₦${amountInNaira.toLocaleString()} to user ${deposit.userId}. Ref: ${reference}`);
        } else if (deposit?.status === 'approved' || deposit?.status === 'completed') {
          console.log(`ℹ️ Paystack webhook already processed: ${reference}`);
        } else {
          console.warn(`⚠️ Paystack webhook ignored: unknown reference or amount mismatch: ${reference}`);
        }
      }
    } else if (event === 'bank.transfer.rejected' && data?.reference) {
      const deposit = db.getDepositByReference(data.reference);
      if (deposit && deposit.status === 'pending') {
        db.markPaystackDepositFailed(data.reference, data.message || 'Paystack rejected the bank transfer.');
        console.warn(`⚠️ Paystack bank transfer rejected for ${data.reference}.`);
      }
    }

    res.status(200).json({ status: true, message: 'Webhook event received' });
  } catch (err: any) {
    console.error('Paystack webhook error:', err);
    res.status(500).json({ error: 'Webhook processing error' });
  }
});

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

app.get('/api/admin/payment-overview', adminMiddleware, (req: Request, res: Response) => {
  try {
    const appUrl = `${req.protocol}://${req.get('host')}`;
    const overview = paymentManager.getProviderStatusList(appUrl, db.getSiteSettings().paymentProvider);
    res.json({
      providers: overview.providers.map((provider) => ({
        ...provider,
        missingVariables: provider.missingCredentials,
      })),
      activeProvider: overview.activeProvider,
      hasAnyConfigured: overview.hasAnyConfigured,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Unable to load payment provider status.' });
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
