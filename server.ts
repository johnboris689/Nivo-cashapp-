import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
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

app.post('/api/wallet/deposit', authMiddleware, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { amount, senderName, paymentProofRef } = req.body;

    if (!amount || !senderName || !paymentProofRef) {
      res.status(400).json({ error: 'Please provide deposit amount, sender name, and payment reference.' });
      return;
    }

    const deposit = db.createDeposit(userId, Number(amount), senderName, paymentProofRef);
    res.status(201).json({ message: 'Deposit request submitted successfully! Awaiting admin approval.', deposit });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
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

// --- TASKS ---
app.get('/api/tasks', authMiddleware, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const allTasks = db.getTasks().filter(t => t.enabled);
    const completions = db.getUserTaskCompletions(userId);
    const completedTaskIds = completions.map(c => c.taskId);

    const tasksWithCompletion = allTasks.map(t => ({
      ...t,
      completed: completedTaskIds.includes(t.id),
    }));

    res.json(tasksWithCompletion);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks/complete', authMiddleware, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { taskId } = req.body;
    if (!taskId) {
      res.status(400).json({ error: 'Task ID is required.' });
      return;
    }

    const result = db.completeTask(userId, taskId);
    res.json({ message: `Successfully claimed ₦${result.rewardAmount.toLocaleString()} reward!`, result });
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
    if (email !== 'talkdavidjohn@gmail.com') {
      res.status(401).json({ error: 'Invalid administrator email or credentials.' });
      return;
    }

    const result = db.loginUser(email, password);
    if (!result.user.isAdmin) {
      res.status(403).json({ error: 'User is not an administrator.' });
      return;
    }

    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: 'Invalid administrator credentials.' });
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
