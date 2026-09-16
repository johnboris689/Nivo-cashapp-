import pg from 'pg';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const { Pool } = pg;

function getDatabaseUrl(): string {
  const raw = (process.env.DATABASE_URL || '').trim();
  // Render/environment UIs sometimes preserve surrounding quotes when values are pasted.
  return raw.replace(/^['"]|['"]$/g, '').trim();
}

function hasPostgresConfig(): boolean {
  return Boolean(getDatabaseUrl() || (process.env.SQL_HOST || '').trim());
}

let pgPool: pg.Pool | null = null;

async function configureNevoPostgresPool(pool: pg.Pool, createSchema = false) {
  if (createSchema) {
    await pool.query('CREATE SCHEMA IF NOT EXISTS nevo');
  }
  pool.on('connect', (client) => {
    client.query('SET search_path TO nevo, public').catch((err) => {
      console.error('[Nevo DB] Failed to set PostgreSQL search path:', err.message);
    });
  });
  await pool.query('SET search_path TO nevo, public');
}

const JSON_FILE = process.env.NEVO_DB_FILE?.trim() || path.join(process.cwd(), 'nevo_db.json');

const DEFAULT_WDV_CONFIG = {};

interface JsonData {
  users: any[];
  vouchers: any[];
  password_resets: any[];
  admin_settings: Record<string, string>;
  logs: any[];
  admins: any[];
  withdraw_requests: any[];
  wdv_payments: any[];
  payment_transactions: any[];
  ai_chat_logs: any[];
  ai_custom_faqs: any[];
  nivo_tasks?: any[];
  nivo_task_submissions?: any[];
  nivo_referrals?: any[];
  nivo_activations?: any[];
  ad_reward_sessions?: any[];
  ad_rewards?: any[];
}

// -------------------- JSON DATABASE ENGINE FALLBACK --------------------
function safeParseJsonField(val: any): any {
  if (!val) return [];
  if (typeof val !== 'string') return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    return [];
  }
}

function safeStringifyJsonField(val: any): string {
  if (val === undefined || val === null) return '[]';
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (typeof parsed === 'string') {
        return safeStringifyJsonField(parsed);
      }
      return val;
    } catch (e) {
      if (val.trim().startsWith('[') || val.trim().startsWith('{')) {
        return val;
      }
      return JSON.stringify(val);
    }
  }
  return JSON.stringify(val);
}

function getJsonDb(): JsonData {
  if (!fs.existsSync(JSON_FILE)) {
    const defaultSettings: Record<string, string> = {
      websiteName: "Nevo",
      supportEmail: process.env.SUPPORT_EMAIL || "support@nevo.com",
      supportPhone: process.env.SUPPORT_PHONE || "+2349162845073",
      whatsappNumber: process.env.WHATSAPP_NUMBER || "+2349162845073",
      senderName: "Nevo",
      currency: "₦",
      registrationBonus: "750",
      minWithdrawal: "5000",
      maxWithdrawal: "500000",
      referralRequired: "5",
      depositMinimum: "520",
      recoveryEnabled: "true",
      smsRecoveryEnabled: "true",
      aiSupportEnabled: "true",
      videoUrl: ""
    };
    const initial: JsonData = {
      users: [],
      vouchers: [],
      password_resets: [],
      admin_settings: defaultSettings,
      logs: [],
      admins: [],
      withdraw_requests: [],
      wdv_payments: [],
      payment_transactions: [],
      ai_chat_logs: [],
      ai_custom_faqs: [], nivo_tasks: [], nivo_task_submissions: [], nivo_referrals: [], nivo_activations: [],
      ad_reward_sessions: [],
      ad_rewards: []
    };
    fs.writeFileSync(JSON_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  
  try {
    const raw = fs.readFileSync(JSON_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    
    // Normalize properties for database matching
    const data: JsonData = {
      users: (parsed.users || []).map((u: any) => ({
        fullname: u.fullName || u.fullname || '',
        username: u.username || '',
        email: (u.email || '').toLowerCase(),
        phone: u.phone || '',
        passwordhash: u.passwordHash || u.passwordhash || '',
        balance: Number(u.balance ?? 0),
        dailytarget: Number(u.dailyTarget ?? u.dailytarget ?? 50000),
        dailyspent: Number(u.dailySpent ?? u.dailyspent ?? 0),
        pincreated: u.pinCreated || u.pincreated ? 1 : 0,
        pincode: u.pinCode || u.pincode || '',
        biometricenabled: u.biometricEnabled || u.biometricenabled ? 1 : 0,
        profilepic: u.profilePic || u.profilepic || '',
        tier: Number(u.tier ?? 3),
        issuspended: u.isSuspended || u.issuspended ? 1 : 0,
        isfrozen: u.isFrozen || u.isfrozen ? 1 : 0,
        registrationdate: u.registrationDate || u.registrationdate || '',
        accountstatus: u.accountStatus || u.accountstatus || 'active',
        beneficiaries: safeStringifyJsonField(u.beneficiaries),
        phonebeneficiaries: safeStringifyJsonField(u.phonebeneficiaries || u.phoneBeneficiaries),
        loginhistory: safeStringifyJsonField(u.loginhistory || u.loginHistory),
        notifications: safeStringifyJsonField(u.notifications),
        transactions: safeStringifyJsonField(u.transactions),
        wdvverified: u.wdvVerified || u.wdvverified ? 1 : 0,
        iswdvverified: u.isWdvVerified || u.iswdvverified ? 1 : 0,
        welcomerewardshown: u.welcomeRewardShown || u.welcomerewardshown ? 1 : 0,
        giftday: Number(u.giftDay ?? u.giftday ?? 0),
        giftactive: u.giftActive !== 0 && u.giftactive !== 0 ? 1 : 0,
        lastgiftcredittime: u.lastGiftCreditTime || u.lastgiftcredittime || '',
        giftexpiresat: u.giftExpiresAt || u.giftexpiresat || ''
      })),
      vouchers: (parsed.vouchers || []).map((v: any) => {
        const c = v.code || v.voucherCode || v.vouchercode || '';
        const idVal = v.id || c || `v-${Date.now()}`;
        return {
          id: idVal,
          vouchercode: c,
          code: c,
          voucherCode: c,
          amount: Number(v.amount ?? 6500),
          status: v.status || 'unused',
          usedby: v.usedBy || v.usedby || '',
          usedBy: v.usedBy || v.usedby || '',
          usedat: v.usedAt || v.usedat || '',
          usedAt: v.usedAt || v.usedat || '',
          generatedat: v.generatedAt || v.generatedat || new Date().toISOString(),
          generatedAt: v.generatedAt || v.generatedat || new Date().toISOString(),
          withdrawalid: v.withdrawalId || v.withdrawalid || '',
          withdrawalId: v.withdrawalId || v.withdrawalid || '',
          purchasedby: v.purchasedBy || v.purchasedby || 'admin',
          purchasedBy: v.purchasedBy || v.purchasedby || 'admin',
          redeemedby: safeStringifyJsonField(v.redeemedBy || v.redeemedby),
          redeemedBy: safeStringifyJsonField(v.redeemedBy || v.redeemedby)
        };
      }),
      password_resets: (parsed.password_resets || parsed.passwordResets || []).map((r: any) => ({
        id: r.id || r.token || '',
        emailorphone: (r.emailorphone || r.email || '').toLowerCase(),
        otp: r.otp || '',
        expiresat: Number(r.expiresAt || r.expiresat || 0),
        used: r.used ? 1 : 0,
        createdat: Number(r.createdAt || r.createdat || 0)
      })),
      admin_settings: parsed.admin_settings || {},
      logs: (parsed.logs || []).map((l: any) => ({
        id: l.id,
        timestamp: l.timestamp,
        message: l.message,
        type: l.type
      })),
      admins: (parsed.admins || []).map((a: any) => ({
        email: (a.email || '').toLowerCase(),
        passwordhash: a.passwordHash || a.passwordhash || ''
      })),
      withdraw_requests: (parsed.withdraw_requests || parsed.withdrawRequests || []).map((w: any) => ({
        id: w.id || '',
        userId: w.userId || w.userid || '',
        userid: w.userId || w.userid || '',
        email: w.email || '',
        phone: w.phone || '',
        amount: Number(w.amount || 0),
        bankName: w.bankName || w.bankname || '',
        bankname: w.bankName || w.bankname || '',
        accountNumber: w.accountNumber || w.accountnumber || '',
        accountnumber: w.accountNumber || w.accountnumber || '',
        accountName: w.accountName || w.accountname || '',
        accountname: w.accountName || w.accountname || '',
        reference: w.reference || '',
        status: w.status || 'pending',
        timestamp: w.timestamp || w.created_at || new Date().toISOString(),
        created_at: w.created_at || w.timestamp || new Date().toISOString(),
        notes: w.notes || w.adminNotes || w.adminnotes || '',
        vouchercode: w.voucherCode || w.vouchercode || '',
        voucherCode: w.voucherCode || w.vouchercode || '',
        posSlipPath: w.posSlipPath || w.posslippath || '',
        posSlippath: w.posSlipPath || w.posslippath || '',
        posSlipUploadedAt: w.posSlipUploadedAt || w.posslipuploadedat || '',
        posSlipuploadedAt: w.posSlipUploadedAt || w.posslipuploadedat || '',
        posSlipUploadedBy: w.posSlipUploadedBy || w.posslipuploadedby || '',
        posSlipuploadedBy: w.posSlipUploadedBy || w.posslipuploadedby || '',
        approvedAmount: Number(w.approvedAmount || w.approvedamount || 0),
        approvedamount: Number(w.approvedAmount || w.approvedamount || 0),
        approvalHistory: typeof w.approvalHistory === 'string'
          ? (safeParseJsonField(w.approvalHistory) || [])
          : (Array.isArray(w.approvalHistory) ? w.approvalHistory : (Array.isArray(w.approval_history) ? w.approval_history : []))
      })),
      wdv_payments: (parsed.wdv_payments || parsed.wdvPayments || []).map((p: any) => ({
        id: p.id || '',
        reference: p.reference || '',
        userEmail: (p.userEmail || p.useremail || '').toLowerCase(),
        useremail: (p.userEmail || p.useremail || '').toLowerCase(),
        amount: Number(p.amount || 0),
        bankName: p.bankName || p.bankname || '',
        bankname: p.bankName || p.bankname || '',
        accountNumber: p.accountNumber || p.accountnumber || '',
        accountnumber: p.accountNumber || p.accountnumber || '',
        accountName: p.accountName || p.accountname || '',
        accountname: p.accountName || p.accountname || '',
        status: p.status || 'pending',
        createdAt: p.createdAt || p.createdat || new Date().toISOString(),
        createdat: p.createdAt || p.createdat || new Date().toISOString(),
        expiresAt: p.expiresAt || p.expiresat || '',
        expiresat: p.expiresAt || p.expiresat || '',
        paidAt: p.paidAt || p.paidat || '',
        paidat: p.paidAt || p.paidat || '',
        voucherCode: p.voucherCode || p.vouchercode || '',
        vouchercode: p.voucherCode || p.vouchercode || '',
        provider: p.provider || 'manual_transfer',
        webhookData: p.webhookData || p.webhookdata || '',
        webhookdata: p.webhookData || p.webhookdata || ''
      })),
      payment_transactions: (parsed.payment_transactions || parsed.paymentTransactions || []).map((pt: any) => ({
        id: pt.id || '',
        reference: pt.reference || '',
        userEmail: (pt.userEmail || pt.useremail || '').toLowerCase(),
        useremail: (pt.userEmail || pt.useremail || '').toLowerCase(),
        userName: pt.userName || pt.username || '',
        username: pt.userName || pt.username || '',
        amount: Number(pt.amount || 0),
        currency: pt.currency || 'NGN',
        provider: pt.provider || 'korapay',
        providerReference: pt.providerReference || pt.providerreference || '',
        providerreference: pt.providerReference || pt.providerreference || '',
        purpose: pt.purpose || 'wallet_funding',
        status: pt.status || 'pending',
        channel: pt.channel || '',
        authorizationUrl: pt.authorizationUrl || pt.authorizationurl || '',
        authorizationurl: pt.authorizationUrl || pt.authorizationurl || '',
        metadata: pt.metadata || '{}',
        createdAt: pt.createdAt || pt.createdat || new Date().toISOString(),
        createdat: pt.createdAt || pt.createdat || new Date().toISOString(),
        verifiedAt: pt.verifiedAt || pt.verifiedat || '',
        verifiedat: pt.verifiedAt || pt.verifiedat || '',
        webhookData: pt.webhookData || pt.webhookdata || '',
        webhookdata: pt.webhookData || pt.webhookdata || ''
      })),
      ai_chat_logs: parsed.ai_chat_logs || [],
      ai_custom_faqs: parsed.ai_custom_faqs || [],
      nivo_tasks: parsed.nivo_tasks || [],
      nivo_task_submissions: parsed.nivo_task_submissions || [],
      nivo_referrals: parsed.nivo_referrals || [],
      nivo_activations: parsed.nivo_activations || [],
      ad_reward_sessions: parsed.ad_reward_sessions || [],
      ad_rewards: parsed.ad_rewards || []
    };

    // Migrations
    if (Object.keys(data.admin_settings).length === 0 && (parsed.bpcConfig || parsed.wdvConfig)) {
      const c = parsed.wdvConfig || parsed.bpcConfig;
      data.admin_settings = {
        supportEmail: "support@nevo.com",
        supportPhone: "+2349162845073",
        whatsappNumber: "+2349162845073",
        senderName: "Nevo",
        videoUrl: "",
        recoveryEnabled: "true",
        smsRecoveryEnabled: "true",
        wdvBankName: c.bankName,
        wdvAccountNumber: c.accountNumber,
        wdvAccountName: c.accountName,
        wdvVoucherPrice: String(c.voucherPrice),
        wdvInstructions: c.instructions,
        wdvMaintenanceNotice: c.maintenanceNotice
      };
    } else {
      // Migrate bpc settings to wdv settings in database settings
      if (data.admin_settings.bpcBankName && !data.admin_settings.wdvBankName) {
        data.admin_settings.wdvBankName = data.admin_settings.bpcBankName;
        data.admin_settings.wdvAccountNumber = data.admin_settings.bpcAccountNumber;
        data.admin_settings.wdvAccountName = data.admin_settings.bpcAccountName;
        data.admin_settings.wdvVoucherPrice = data.admin_settings.bpcVoucherPrice;
        data.admin_settings.wdvInstructions = data.admin_settings.bpcInstructions;
        data.admin_settings.wdvMaintenanceNotice = data.admin_settings.bpcMaintenanceNotice;
      }
      if (data.admin_settings.videoUrl && data.admin_settings.videoUrl.includes('youtube')) {
        data.admin_settings.videoUrl = '';
      }
    }

    return data;
  } catch (err) {
    console.error('Error loading JSON DB:', err);
    return {
      users: [],
      vouchers: [],
      password_resets: [],
      admin_settings: {},
      logs: [],
      admins: [],
      withdraw_requests: [],
      wdv_payments: [],
      payment_transactions: [],
      ai_chat_logs: [],
      ai_custom_faqs: [], nivo_tasks: [], nivo_task_submissions: [], nivo_referrals: [], nivo_activations: [],
      ad_reward_sessions: [], ad_rewards: []
    };
  }
}

function saveJsonDb(data: JsonData) {
  try {
    fs.writeFileSync(JSON_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error saving JSON DB:', err);
  }
}

// Helper to normalize voucher codes for lookup
function normVCode(codeStr: string | undefined): string {
  if (!codeStr) return '';
  return codeStr.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

// -------------------- DATABASE INITIALIZATION --------------------
export async function initDb() {
  if (hasPostgresConfig()) {
    console.log('[Nevo DB] Connecting to PostgreSQL database (Admin privileges for Schema setup)...');
    if (process.env.SQL_HOST) {
      console.log('[Nevo DB] Using Cloud SQL socket/host connection params with ADMIN privileges...');
      pgPool = new Pool({
        host: process.env.SQL_HOST,
        user: process.env.SQL_ADMIN_USER || process.env.SQL_USER,
        password: process.env.SQL_ADMIN_PASSWORD || process.env.SQL_PASSWORD,
        database: process.env.SQL_DB_NAME,
        connectionTimeoutMillis: 15000,
      });
      pgPool.on('error', (err) => {
        console.error('[Nevo DB Admin Pool Error]', err.message);
      });
    } else {
      console.log('[Nevo DB] Using DATABASE_URL connection string...');
      pgPool = new Pool({
        connectionString: getDatabaseUrl(),
        connectionTimeoutMillis: 15000,
        ssl: getDatabaseUrl() && !getDatabaseUrl().includes('localhost') ? { rejectUnauthorized: false } : false
      });
      pgPool.on('error', (err) => {
        console.error('[Nevo DB Admin Pool Error]', err.message);
      });
    }
  } else {
    if (process.env.NODE_ENV === 'production') {
      console.error('[Nevo DB] WARNING: production has no DATABASE_URL/SQL_HOST. JSON storage will only survive redeploys if NEVO_DB_FILE points to a persistent mounted disk. Render PostgreSQL is strongly recommended for user/payment data.');
    }
    console.log(`[Nevo DB] No DATABASE_URL or SQL_HOST found. Initializing pure JS JSON database fallback at ${JSON_FILE}...`);
    getJsonDb(); // ensure initialized
  }

  if (pgPool) {
    await configureNevoPostgresPool(pgPool, true);
    console.log('[Nevo DB] Using dedicated PostgreSQL schema: nevo');
  }

  // Create tables if they do not exist (PostgreSQL or local stub run)
  await execute(`
    CREATE TABLE IF NOT EXISTS users (
      fullName TEXT,
      username TEXT,
      email TEXT PRIMARY KEY,
      phone TEXT,
      passwordHash TEXT,
      balance REAL,
      dailyTarget REAL,
      dailySpent REAL,
      pinCreated INTEGER,
      pinCode TEXT,
      biometricEnabled INTEGER,
      profilePic TEXT,
      tier INTEGER,
      isSuspended INTEGER,
      isFrozen INTEGER,
      registrationDate TEXT,
      accountStatus TEXT,
      beneficiaries TEXT,
      phoneBeneficiaries TEXT,
      loginHistory TEXT,
      notifications TEXT,
      transactions TEXT,
      wdvVerified INTEGER DEFAULT 0,
      isWdvVerified INTEGER DEFAULT 0,
      welcomeRewardShown INTEGER DEFAULT 0,
      giftDay INTEGER DEFAULT 0,
      giftActive INTEGER DEFAULT 1,
      lastGiftCreditTime TEXT,
      giftExpiresAt TEXT,
      lastActivityTime TEXT,
      referralCode TEXT,
      referralCount INTEGER DEFAULT 0,
      totalReferralBonus REAL DEFAULT 0,
      totalEarnings REAL DEFAULT 0,
      activationPaid INTEGER DEFAULT 0,
      activationPaidAt TEXT
    )
  `);

  try {
    await execute(`ALTER TABLE users ADD COLUMN IF NOT EXISTS wdvVerified INTEGER DEFAULT 0`);
  } catch (e) {}
  try {
    await execute(`ALTER TABLE users ADD COLUMN IF NOT EXISTS isWdvVerified INTEGER DEFAULT 0`);
  } catch (e) {}
  try {
    await execute(`ALTER TABLE users ADD COLUMN IF NOT EXISTS welcomeRewardShown INTEGER DEFAULT 0`);
  } catch (e) {}
  try {
    await execute(`ALTER TABLE users ADD COLUMN IF NOT EXISTS giftDay INTEGER DEFAULT 0`);
  } catch (e) {}
  try {
    await execute(`ALTER TABLE users ADD COLUMN IF NOT EXISTS giftActive INTEGER DEFAULT 1`);
  } catch (e) {}
  try {
    await execute(`ALTER TABLE users ADD COLUMN IF NOT EXISTS lastGiftCreditTime TEXT`);
  } catch (e) {}
  try {
    await execute(`ALTER TABLE users ADD COLUMN IF NOT EXISTS giftExpiresAt TEXT`);
  } catch (e) {}
  try {
    await execute(`ALTER TABLE users ADD COLUMN IF NOT EXISTS lastActivityTime TEXT`);
  } catch (e) {}
  try { await execute(`ALTER TABLE users ADD COLUMN IF NOT EXISTS referralCode TEXT`); } catch (e) {}
  try { await execute(`ALTER TABLE users ADD COLUMN IF NOT EXISTS referralCount INTEGER DEFAULT 0`); } catch (e) {}
  try { await execute(`ALTER TABLE users ADD COLUMN IF NOT EXISTS totalReferralBonus REAL DEFAULT 0`); } catch (e) {}
  try { await execute(`ALTER TABLE users ADD COLUMN IF NOT EXISTS totalEarnings REAL DEFAULT 0`); } catch (e) {}
  try { await execute(`ALTER TABLE users ADD COLUMN IF NOT EXISTS activationPaid INTEGER DEFAULT 0`); } catch (e) {}
  try { await execute(`ALTER TABLE users ADD COLUMN IF NOT EXISTS activationPaidAt TEXT`); } catch (e) {}
  await execute(`CREATE TABLE IF NOT EXISTS nivo_tasks (id TEXT PRIMARY KEY, title TEXT, description TEXT, rewardAmount REAL, category TEXT, actionUrl TEXT, verificationType TEXT, timerSeconds INTEGER, proofInstructions TEXT, enabled INTEGER DEFAULT 1, createdAt TEXT, completionCount INTEGER DEFAULT 0)`);
  await execute(`CREATE TABLE IF NOT EXISTS nivo_task_submissions (id TEXT PRIMARY KEY, userId TEXT, taskId TEXT, taskTitle TEXT, rewardAmount REAL, verificationType TEXT, status TEXT, startedAt TEXT, completedAt TEXT, claimedAt TEXT, proofText TEXT, adminNote TEXT, createdAt TEXT)`);
  await execute(`CREATE TABLE IF NOT EXISTS nivo_referrals (id TEXT PRIMARY KEY, referrerEmail TEXT, referredEmail TEXT, referredUserName TEXT, bonusAmount REAL, status TEXT, createdAt TEXT)`);
  await execute(`CREATE TABLE IF NOT EXISTS nivo_activations (id TEXT PRIMARY KEY, userEmail TEXT, amount REAL, status TEXT, createdAt TEXT, processedAt TEXT, adminNote TEXT)`);
  await execute(`CREATE TABLE IF NOT EXISTS ad_reward_sessions (id TEXT PRIMARY KEY, userEmail TEXT, adUnitPath TEXT, provider TEXT, rewardAmount REAL, status TEXT, providerToken TEXT, providerTxId TEXT, clientNonce TEXT, createdAt TEXT, completedAt TEXT, ipAddress TEXT)`);
  await execute(`CREATE TABLE IF NOT EXISTS ad_rewards (id TEXT PRIMARY KEY, userEmail TEXT, sessionId TEXT, provider TEXT, providerTxId TEXT, rewardAmount REAL, status TEXT, reference TEXT, completedAt TEXT, createdAt TEXT)`);
  try {
    await execute(`CREATE INDEX IF NOT EXISTS idx_ad_reward_sessions_user ON ad_reward_sessions(userEmail)`);
    await execute(`CREATE INDEX IF NOT EXISTS idx_ad_rewards_user ON ad_rewards(userEmail)`);
  } catch (e) {}
  try {
    // Ensure the standard Nevo tasks exist individually so the task wall and
    // admin task manager always use the same database-backed task records.
    const tasks = [
      ['task-1','Follow Nevo on X','Follow the official Nevo social account for product updates and announcements.',500,'social','https://x.com/Nevo','proof',0,'Enter your X username or profile link.'],
      ['task-2','Join the Nevo Telegram Community','Join the official community to receive updates and reward announcements.',600,'social','https://t.me/Nevo','proof',0,'Enter your Telegram username.'],
      ['task-3','Daily Check-In','Visit the featured Nevo page for 30 seconds to complete today’s check-in.',300,'daily','/','timer',30,''],
      ['task-4','Watch Advert & Earn','Watch the featured advert for 45 seconds and submit completion.',500,'special','/','timer',45,'']
    ];
    for (const t of tasks) {
      const existing = await getRow(`SELECT id FROM nivo_tasks WHERE id=$1`, [t[0]]);
      if (!existing) {
        await execute(`INSERT INTO nivo_tasks (id,title,description,rewardAmount,category,actionUrl,verificationType,timerSeconds,proofInstructions,enabled,createdAt,completionCount) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,1,$10,0)`, [...t, new Date().toISOString()]);
      }
    }
  } catch (e) { console.warn('[Nevo] Nivo feature seed skipped:', e); }
  try {
    await execute(`ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS redeemedBy TEXT DEFAULT '[]'`);
  } catch (e) {}

  await execute(`
    CREATE TABLE IF NOT EXISTS wallets (
      id TEXT PRIMARY KEY,
      userId TEXT,
      balance REAL,
      currency TEXT
    )
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      userId TEXT,
      amount REAL,
      type TEXT,
      status TEXT,
      reference TEXT,
      timestamp TEXT
    )
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      userId TEXT,
      title TEXT,
      message TEXT,
      isRead INTEGER,
      timestamp TEXT
    )
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS activity_ticker (
      id TEXT PRIMARY KEY,
      message TEXT,
      timestamp TEXT
    )
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS admins (
      email TEXT PRIMARY KEY,
      passwordHash TEXT
    )
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id TEXT PRIMARY KEY,
      email TEXT,
      token TEXT,
      expiresAt INTEGER,
      used INTEGER
    )
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS email_verification (
      id TEXT PRIMARY KEY,
      email TEXT,
      code TEXT,
      expiresAt INTEGER,
      verified INTEGER
    )
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS b_voucher_codes (
      code TEXT PRIMARY KEY,
      amount REAL,
      status TEXT
    )
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS withdraw_requests (
      id TEXT PRIMARY KEY,
      userId TEXT,
      email TEXT,
      amount REAL,
      bankName TEXT,
      accountNumber TEXT,
      accountName TEXT,
      status TEXT,
      timestamp TEXT,
      reference TEXT,
      voucherCode TEXT,
      notes TEXT,
      posSlipPath TEXT,
      posSlipUploadedAt TEXT,
      posSlipUploadedBy TEXT,
      approvedAmount REAL DEFAULT 0,
      approvalHistory TEXT DEFAULT '[]'
    )
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS saved_recipients (
      id TEXT PRIMARY KEY,
      userId TEXT,
      name TEXT,
      bankName TEXT,
      accountNumber TEXT
    )
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS saved_banks (
      id TEXT PRIMARY KEY,
      code TEXT,
      name TEXT
    )
  `);

  // Extra tables required by server
  await execute(`
    CREATE TABLE IF NOT EXISTS wdv_payments (
      id TEXT PRIMARY KEY,
      reference TEXT UNIQUE,
      userEmail TEXT,
      amount REAL,
      bankName TEXT,
      accountNumber TEXT,
      accountName TEXT,
      status TEXT,
      createdAt TEXT,
      expiresAt TEXT,
      paidAt TEXT,
      voucherCode TEXT,
      provider TEXT,
      webhookData TEXT
    )
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS payment_transactions (
      id TEXT PRIMARY KEY,
      reference TEXT UNIQUE,
      userEmail TEXT,
      userName TEXT,
      amount REAL,
      currency TEXT DEFAULT 'NGN',
      provider TEXT,
      providerReference TEXT,
      purpose TEXT DEFAULT 'wallet_funding',
      status TEXT DEFAULT 'pending',
      channel TEXT,
      authorizationUrl TEXT,
      metadata TEXT,
      createdAt TEXT,
      verifiedAt TEXT,
      webhookData TEXT,
      walletCreditedAt TEXT
    )
  `);
  try { await execute(`ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS walletCreditedAt TEXT`); } catch (e) {}

  await execute(`
    CREATE TABLE IF NOT EXISTS vouchers (
      id TEXT PRIMARY KEY,
      voucherCode TEXT UNIQUE,
      code TEXT,
      amount REAL,
      status TEXT,
      usedBy TEXT,
      usedAt TEXT,
      redeemedBy TEXT DEFAULT '[]',
      generatedAt TEXT,
      withdrawalId TEXT,
      purchasedBy TEXT
    )
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS ai_chat_logs (
      id TEXT PRIMARY KEY,
      session_id TEXT,
      user_email TEXT,
      user_message TEXT,
      ai_response TEXT,
      escalated_to_whatsapp INTEGER DEFAULT 0,
      is_unanswered INTEGER DEFAULT 0,
      timestamp TEXT
    )
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS ai_custom_faqs (
      id TEXT PRIMARY KEY,
      question TEXT,
      answer TEXT,
      created_at TEXT
    )
  `);

  // Run ALTER TABLE migrations for existing databases
  try {
    await execute(`ALTER TABLE withdraw_requests ADD COLUMN IF NOT EXISTS email TEXT`);
  } catch (e) {}
  try {
    await execute(`ALTER TABLE withdraw_requests ADD COLUMN IF NOT EXISTS accountName TEXT`);
  } catch (e) {}
  try {
    await execute(`ALTER TABLE withdraw_requests ADD COLUMN IF NOT EXISTS reference TEXT`);
  } catch (e) {}
  try {
    await execute(`ALTER TABLE withdraw_requests ADD COLUMN IF NOT EXISTS voucherCode TEXT`);
  } catch (e) {}
  try {
    await execute(`ALTER TABLE withdraw_requests ADD COLUMN IF NOT EXISTS notes TEXT`);
  } catch (e) {}
  try {
    await execute(`ALTER TABLE withdraw_requests ADD COLUMN IF NOT EXISTS posSlipPath TEXT`);
  } catch (e) {}
  try {
    await execute(`ALTER TABLE withdraw_requests ADD COLUMN IF NOT EXISTS posSlipUploadedAt TEXT`);
  } catch (e) {}
  try {
    await execute(`ALTER TABLE withdraw_requests ADD COLUMN IF NOT EXISTS posSlipUploadedBy TEXT`);
  } catch (e) {}
  try {
    await execute(`ALTER TABLE withdraw_requests ADD COLUMN IF NOT EXISTS approvedAmount REAL DEFAULT 0`);
  } catch (e) {}
  try {
    await execute(`ALTER TABLE withdraw_requests ADD COLUMN IF NOT EXISTS approvalHistory TEXT DEFAULT '[]'`);
  } catch (e) {}

  try {
    await execute(`ALTER TABLE users ADD COLUMN IF NOT EXISTS wdvVerified INTEGER DEFAULT 0`);
  } catch (e) {}
  try {
    await execute(`ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS redeemedBy TEXT DEFAULT '[]'`);
  } catch (e) {}
  try {
    await execute(`ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS id TEXT`);
  } catch (e) {}
  try {
    await execute(`ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS voucherCode TEXT`);
  } catch (e) {}
  try {
    await execute(`ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS generatedAt TEXT`);
  } catch (e) {}
  try {
    await execute(`ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS withdrawalId TEXT`);
  } catch (e) {}
  try {
    await execute(`ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS purchasedBy TEXT`);
  } catch (e) {}

  await execute(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id TEXT PRIMARY KEY,
      emailOrPhone TEXT,
      otp TEXT,
      expiresAt INTEGER,
      used INTEGER,
      createdAt INTEGER
    )
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS admin_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT,
      message TEXT,
      type TEXT
    )
  `);

  // Ensure unique indexes for ON CONFLICT target resolution in PostgreSQL
  try { await execute(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_uniq ON users(email)`); } catch (e) {}
  try { await execute(`CREATE UNIQUE INDEX IF NOT EXISTS idx_vouchers_id_uniq ON vouchers(id)`); } catch (e) {}
  try { await execute(`CREATE UNIQUE INDEX IF NOT EXISTS idx_vouchers_code_uniq ON vouchers(voucherCode)`); } catch (e) {}
  try { await execute(`CREATE UNIQUE INDEX IF NOT EXISTS idx_vouchers_withdrawal_id_uniq ON vouchers(withdrawalId) WHERE withdrawalId <> ''`); } catch (e) {}
  try { await execute(`CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_settings_key_uniq ON admin_settings(key)`); } catch (e) {}
  try { await execute(`CREATE UNIQUE INDEX IF NOT EXISTS idx_password_resets_id_uniq ON password_resets(id)`); } catch (e) {}
  try { await execute(`CREATE UNIQUE INDEX IF NOT EXISTS idx_wdv_payments_ref_uniq ON wdv_payments(reference)`); } catch (e) {}

  // Create the first admin only when explicit server credentials are supplied.
  // No demo/default credentials are ever created.
  const configuredAdminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const configuredAdminPassword = String(process.env.ADMIN_PASSWORD || '').trim();
  if (configuredAdminEmail && configuredAdminPassword) {
    const existingAdmin = await getRow(`SELECT * FROM admins WHERE email = $1`, [configuredAdminEmail]);
    if (!existingAdmin) {
      const hash = crypto.createHash('sha256').update(configuredAdminPassword).digest('hex');
      await execute(`INSERT INTO admins (email, passwordHash) VALUES ($1, $2)`, [configuredAdminEmail, hash]);
      console.log('[Nevo DB] Initial admin account created from ADMIN_EMAIL/ADMIN_PASSWORD.');
    }
  }

  // Seed default admin settings if not present
  const settingsCount = await getRow(`SELECT COUNT(*) as count FROM admin_settings`);
  if (!settingsCount || Number(settingsCount.count || 0) === 0) {
    const defaultSettings: Record<string, string> = {
      websiteName: "Nevo",
      supportEmail: process.env.SUPPORT_EMAIL || "support@nevo.com",
      supportPhone: process.env.SUPPORT_PHONE || "+2349162845073",
      whatsappNumber: process.env.WHATSAPP_NUMBER || "+2349162845073",
      senderName: "Nevo",
      currency: "₦",
      registrationBonus: "750",
      minWithdrawal: "5000",
      maxWithdrawal: "500000",
      referralRequired: "5",
      depositMinimum: "520",
      aiSupportEnabled: "true",
      recoveryEnabled: "true",
      smsRecoveryEnabled: "true",
      videoUrl: ""
    };

    for (const [key, value] of Object.entries(defaultSettings)) {
      try {
        await execute(`INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT(key) DO UPDATE SET value = $2`, [key, value]);
      } catch (_) {
        try { await execute(`UPDATE admin_settings SET value = $1 WHERE key = $2`, [value, key]); } catch (e2) {}
      }
    }
    console.log('[Nevo DB] Default admin settings seeded.');
  }

  // Nevo is the canonical product brand. Normalize any legacy SwiftPay setting
  // so old persisted configuration cannot reintroduce the previous brand.
  try {
    await execute(`INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT(key) DO UPDATE SET value = EXCLUDED.value`, ['websiteName', 'Nevo']);
  } catch (e) {
    try { await execute(`UPDATE admin_settings SET value = $1 WHERE key = $2`, ['Nevo', 'websiteName']); } catch (_) {}
  }

  // Reinitialize the pool with App user (least privilege) for runtime database access
  if (hasPostgresConfig()) {
    console.log('[Nevo DB] Schema setup and seeding complete. Switching database connection pool to App user (least privilege)...');
    try {
      if (pgPool) {
        await pgPool.end();
      }
    } catch (err) {
      console.error('[Nevo DB] Error closing Admin pool:', err);
    }
    
    if (process.env.SQL_HOST) {
      pgPool = new Pool({
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DB_NAME,
        connectionTimeoutMillis: 15000,
      });
      pgPool.on('error', (err) => {
        console.error('[Nevo DB Pool Error]', err.message);
      });
    } else {
      pgPool = new Pool({
        connectionString: getDatabaseUrl(),
        connectionTimeoutMillis: 15000,
        ssl: getDatabaseUrl() && !getDatabaseUrl().includes('localhost') ? { rejectUnauthorized: false } : false
      });
      pgPool.on('error', (err) => {
        console.error('[Nevo DB Pool Error]', err.message);
      });
    }
    await configureNevoPostgresPool(pgPool, false);
  }
}

// -------------------- QUERY EXECUTION CONTROLLER --------------------
export function execute(sql: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    if (hasPostgresConfig()) {
      if (!pgPool) {
        return reject(new Error('PostgreSQL pool not initialized.'));
      }
      pgPool.query(sql, params, (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    } else {
      // In-memory pure JS simulator for JSON mode
      try {
        const db = getJsonDb();
        const sqlUpper = sql.toUpperCase();

        if (sqlUpper.includes('INSERT INTO ADMINS')) {
          const email = (params[0] || '').toLowerCase();
          const hash = params[1] || '';
          db.admins = db.admins.filter(a => a.email !== email);
          db.admins.push({ email, passwordhash: hash });
        } else if (sqlUpper.includes('INSERT INTO USERS')) {
          const u: any = {
            fullname: params[0],
            username: params[1],
            email: (params[2] || '').toLowerCase(),
            phone: params[3],
            passwordhash: params[4],
            balance: Number(params[5] ?? 0),
            dailytarget: Number(params[6] ?? 50000),
            dailyspent: Number(params[7] ?? 0),
            pincreated: Number(params[8] ?? 0),
            pincode: params[9] || '',
            biometricenabled: Number(params[10] ?? 0),
            profilepic: params[11] || '',
            tier: Number(params[12] ?? 3),
            issuspended: Number(params[13] ?? 0),
            isfrozen: Number(params[14] ?? 0),
            registrationdate: params[15] || new Date().toISOString(),
            accountstatus: params[16] || 'active',
            beneficiaries: safeStringifyJsonField(params[17]),
            phonebeneficiaries: safeStringifyJsonField(params[18]),
            loginhistory: safeStringifyJsonField(params[19]),
            notifications: safeStringifyJsonField(params[20]),
            transactions: safeStringifyJsonField(params[21]),
            wdvverified: Number(params[22] ?? 0),
            iswdvverified: Number(params[23] ?? 0),
            welcomerewardshown: Number(params[24] ?? 0),
            giftday: Number(params[25] ?? 0),
            giftactive: Number(params[26] ?? 1),
            lastgiftcredittime: params[27] || '',
            giftexpiresat: params[28] || '',
            referralcode: params[29] || '', referralcount: Number(params[30] || 0), totalreferralbonus: Number(params[31] || 0), totaleearnings: Number(params[32] || 0), activationpaid: Number(params[33] || 0), activationpaidat: params[34] || ''
          };
          db.users = db.users.filter(x => x.email !== u.email);
          db.users.push(u);
        } else if (sqlUpper.includes('UPDATE USERS')) {
          const emailParam = params[params.length - 1];
          if (emailParam) {
            const lowerEmail = String(emailParam).toLowerCase();
            const u = db.users.find(x => x.email === lowerEmail);
            if (u) {
              if (sqlUpper.includes('BALANCE =')) u.balance = Number(params[0]);
              if (sqlUpper.includes('REFERRALCODE')) u.referralcode=params[0] || '';
              if (sqlUpper.includes('REFERRALCOUNT')) u.referralcount=Number(params[1] ?? params[0] ?? 0);
              if (sqlUpper.includes('TOTALREFERRALBONUS')) u.totalreferralbonus=Number(params[2] ?? 0);
              if (sqlUpper.includes('TOTALEARNINGS')) u.totalearnings=Number(params[3] ?? 0);
              if (sqlUpper.includes('ACTIVATIONPAID')) u.activationpaid=Number(params[2] ?? params[0] ?? 0);
              if (sqlUpper.includes('ACTIVATIONPAIDAT')) u.activationpaidat=params[1] || '';
            }
          }
        } else if (sqlUpper.includes('DELETE FROM USERS')) {
          const email = (params[0] || '').toLowerCase();
          db.users = db.users.filter(u => u.email !== email);
        } else if (sqlUpper.includes('INSERT INTO VOUCHERS')) {
          // Flexible mapping for vouchers insert
          let vId = '';
          let vCode = '';
          let amt = 6500;
          let st = 'unused';
          let uBy = '';
          let uAt = '';
          let genAt = new Date().toISOString();
          let wId = '';
          let pBy = 'admin';
          let rBy = '[]';

          if (params.length >= 11) {
            vId = params[0];
            vCode = params[1] || params[2];
            amt = Number(params[3] ?? 6500);
            st = params[4] || 'unused';
            uBy = params[5] || '';
            uAt = params[6] || '';
            genAt = params[7] || new Date().toISOString();
            wId = params[8] || '';
            pBy = params[9] || 'admin';
            rBy = safeStringifyJsonField(params[10]);
          } else {
            vCode = params[0];
            amt = Number(params[1] ?? 6500);
            st = params[2] || 'unused';
            uBy = params[3] || '';
            uAt = params[4] || '';
            rBy = safeStringifyJsonField(params[5]);
            vId = `v-${normVCode(vCode) || Date.now()}`;
          }

          const voucherObj = {
            id: vId || `v-${normVCode(vCode)}`,
            vouchercode: vCode,
            code: vCode,
            voucherCode: vCode,
            amount: amt,
            status: st,
            usedby: uBy,
            usedBy: uBy,
            usedat: uAt,
            usedAt: uAt,
            generatedat: genAt,
            generatedAt: genAt,
            withdrawalid: wId,
            withdrawalId: wId,
            purchasedby: pBy,
            purchasedBy: pBy,
            redeemedby: rBy,
            redeemedBy: rBy
          };

          db.vouchers = db.vouchers.filter(x => x.id !== voucherObj.id && normVCode(x.code) !== normVCode(vCode));
          db.vouchers.push(voucherObj);
        } else if (sqlUpper.includes('UPDATE VOUCHERS')) {
          // Match voucher by ID or code at end of params
          const target = params[params.length - 1];
          const normTarget = normVCode(String(target));

          const v = db.vouchers.find(x => x.id === target || normVCode(x.code) === normTarget || normVCode(x.voucherCode) === normTarget);
          if (v) {
            if (sqlUpper.includes('STATUS =') || sqlUpper.includes('STATUS=')) {
              v.status = params[0];
            }
            if (sqlUpper.includes('USEDAT =') || sqlUpper.includes('USEDAT=')) {
              v.usedat = params[1] || new Date().toISOString();
              v.usedAt = v.usedat;
            }
            if (sqlUpper.includes('USEDBY =') || sqlUpper.includes('USEDBY=')) {
              v.usedby = params[2] || '';
              v.usedBy = v.usedby;
            }
            if (sqlUpper.includes('WITHDRAWALID =') || sqlUpper.includes('WITHDRAWALID=')) {
              v.withdrawalid = params[3] || '';
              v.withdrawalId = v.withdrawalid;
            }
            if (sqlUpper.includes('REDEEMEDBY =') || sqlUpper.includes('REDEEMEDBY=')) {
              const rVal = params[3] || params[2] || '[]';
              v.redeemedby = safeStringifyJsonField(rVal);
              v.redeemedBy = v.redeemedby;
            }
          }
        } else if (sqlUpper.includes('DELETE FROM VOUCHERS')) {
          const target = params[0];
          const normTarget = normVCode(String(target));
          db.vouchers = db.vouchers.filter(v => v.id !== target && normVCode(v.code) !== normTarget && normVCode(v.voucherCode) !== normTarget);
        } else if (sqlUpper.includes('INSERT INTO WDV_PAYMENTS')) {
          const p = {
            id: params[0],
            reference: params[1],
            useremail: (params[2] || '').toLowerCase(),
            userEmail: (params[2] || '').toLowerCase(),
            amount: Number(params[3] ?? 0),
            bankname: params[4],
            bankName: params[4],
            accountnumber: params[5],
            accountNumber: params[5],
            accountname: params[6],
            accountName: params[6],
            status: params[7] || 'pending',
            createdat: params[8] || new Date().toISOString(),
            createdAt: params[8] || new Date().toISOString(),
            expiresat: params[9] || '',
            expiresAt: params[9] || '',
            paidat: params[10] || '',
            paidAt: params[10] || '',
            vouchercode: params[11] || '',
            voucherCode: params[11] || '',
            provider: params[12] || 'manual_transfer',
            webhookdata: params[13] || '',
            webhookData: params[13] || ''
          };
          db.wdv_payments = db.wdv_payments || [];
          db.wdv_payments = db.wdv_payments.filter((x: any) => x.reference !== p.reference && x.id !== p.id);
          db.wdv_payments.push(p);
        } else if (sqlUpper.includes('INSERT INTO PAYMENT_TRANSACTIONS')) {
          const pt = {
            id: params[0],
            reference: params[1],
            useremail: (params[2] || '').toLowerCase(),
            userEmail: (params[2] || '').toLowerCase(),
            username: params[3] || '',
            userName: params[3] || '',
            amount: Number(params[4] || 0),
            currency: params[5] || 'NGN',
            provider: params[6] || 'korapay',
            providerreference: params[7] || '',
            providerReference: params[7] || '',
            purpose: params[8] || 'wallet_funding',
            status: params[9] || 'pending',
            channel: params[10] || '',
            authorizationurl: params[11] || '',
            authorizationUrl: params[11] || '',
            metadata: params[12] || '{}',
            createdat: params[13] || new Date().toISOString(),
            createdAt: params[13] || new Date().toISOString(),
            verifiedat: params[14] || '',
            verifiedAt: params[14] || '',
            webhookdata: params[15] || '',
            webhookData: params[15] || ''
          };
          db.payment_transactions = db.payment_transactions || [];
          db.payment_transactions = db.payment_transactions.filter((x: any) => x.reference !== pt.reference && x.id !== pt.id);
          db.payment_transactions.push(pt);
        } else if (sqlUpper.includes('UPDATE PAYMENT_TRANSACTIONS')) {
          db.payment_transactions = db.payment_transactions || [];
          const refParam = params[params.length - 1];
          const pt = db.payment_transactions.find((x: any) => x.reference === refParam || x.id === refParam);
          if (pt) {
            if (sqlUpper.includes('STATUS =') || sqlUpper.includes('STATUS=')) {
              pt.status = params[0];
            }
            if (sqlUpper.includes('VERIFIEDAT =') || sqlUpper.includes('VERIFIEDAT=')) {
              pt.verifiedat = params[1] || new Date().toISOString();
              pt.verifiedAt = pt.verifiedat;
            }
            if (sqlUpper.includes('PROVIDERREFERENCE =') || sqlUpper.includes('PROVIDERREFERENCE=')) {
              pt.providerreference = params[2] || '';
              pt.providerReference = pt.providerreference;
            }
          }
        } else if (sqlUpper.includes('UPDATE WDV_PAYMENTS')) {
          db.wdv_payments = db.wdv_payments || [];
          const refParam = params[params.length - 1];
          const p = db.wdv_payments.find((x: any) => x.reference === refParam || x.id === refParam);
          if (p) {
            if (sqlUpper.includes('STATUS =') || sqlUpper.includes('STATUS=')) {
              p.status = params[0];
            }
            if (sqlUpper.includes('PAIDAT =') || sqlUpper.includes('PAIDAT=')) {
              p.paidat = params[1] || new Date().toISOString();
              p.paidAt = p.paidat;
            }
            if (sqlUpper.includes('VOUCHERCODE =') || sqlUpper.includes('VOUCHERCODE=')) {
              p.vouchercode = params[2] || params[1] || '';
              p.voucherCode = p.vouchercode;
            }
          }
        } else if (sqlUpper.includes('INSERT INTO WITHDRAW_REQUESTS')) {
          const w = {
            id: params[0],
            userid: params[1],
            userId: params[1],
            email: params[2],
            amount: Number(params[3] ?? 0),
            bankname: params[4],
            bankName: params[4],
            accountnumber: params[5],
            accountNumber: params[5],
            accountname: params[6],
            accountName: params[6],
            status: params[7] || 'pending',
            timestamp: params[8] || new Date().toISOString(),
            created_at: params[8] || new Date().toISOString(),
            reference: params[9],
            vouchercode: params[10] || '',
            voucherCode: params[10] || '',
            notes: params[11] || '',
            posSlippath: params[12] || '',
            posSlipPath: params[12] || '',
            posSlipuploadedAt: params[13] || '',
            posSlipUploadedAt: params[13] || '',
            posSlipuploadedBy: params[14] || '',
            posSlipUploadedBy: params[14] || ''
          };
          db.withdraw_requests = db.withdraw_requests || [];
          db.withdraw_requests = db.withdraw_requests.filter((x: any) => x.id !== w.id);
          db.withdraw_requests.push(w);
        } else if (sqlUpper.includes('UPDATE WITHDRAW_REQUESTS')) {
          db.withdraw_requests = db.withdraw_requests || [];
          const targetId = params[params.length - 1];
          if (targetId) {
            const req = db.withdraw_requests.find((x: any) => x.id === targetId);
            if (req) {
              if (sqlUpper.includes('APPROVEDAMOUNT =') || sqlUpper.includes('APPROVEDAMOUNT=')) {
                // If updating status, approvedAmount, approvalHistory
                if (sqlUpper.includes('STATUS =') && sqlUpper.includes('APPROVALHISTORY =')) {
                  req.status = params[0];
                  req.approvedAmount = Number(params[1] || 0);
                  req.approvedamount = Number(params[1] || 0);
                  req.approvalHistory = typeof params[2] === 'string' ? (safeParseJsonField(params[2]) || []) : (params[2] || []);
                } else if (sqlUpper.includes('APPROVEDAMOUNT =')) {
                  req.approvedAmount = Number(params[0] || 0);
                  req.approvedamount = Number(params[0] || 0);
                }
              }
              if (sqlUpper.includes('APPROVALHISTORY =') || sqlUpper.includes('APPROVALHISTORY=')) {
                if (!sqlUpper.includes('STATUS =')) {
                  req.approvalHistory = typeof params[0] === 'string' ? (safeParseJsonField(params[0]) || []) : (params[0] || []);
                }
              }
              if (sqlUpper.includes('STATUS =') || sqlUpper.includes('STATUS=')) {
                if (sqlUpper.includes('STATUS =') && sqlUpper.includes('NOTES =')) {
                  req.status = params[0];
                  req.notes = params[1];
                } else if (!sqlUpper.includes('APPROVEDAMOUNT =')) {
                  req.status = params[0];
                }
              }
              if (sqlUpper.includes('NOTES =') || sqlUpper.includes('NOTES=')) {
                if (!sqlUpper.includes('STATUS =')) {
                  req.notes = params[0];
                }
              }
              if (sqlUpper.includes('POSSLIPPATH =') || sqlUpper.includes('POSSLIPPATH=')) {
                req.posSlippath = params[0];
                req.posSlipPath = params[0];
                req.posSlipuploadedAt = params[1];
                req.posSlipUploadedAt = params[1];
                req.posSlipuploadedBy = params[2];
                req.posSlipUploadedBy = params[2];
              }
            }
          }
        } else if (sqlUpper.includes('INSERT INTO NIVO_TASKS')) {
          db.nivo_tasks = db.nivo_tasks || [];
          const row:any = { id:params[0], title:params[1], description:params[2], rewardamount:Number(params[3]||0), category:params[4], actionurl:params[5], verificationtype:params[6], timerseconds:Number(params[7]||0), proofinstructions:params[8]||'', enabled:Number(params[9]??1), createdat:params[10]||new Date().toISOString(), completioncount:Number(params[11]||0) };
          db.nivo_tasks = db.nivo_tasks.filter((x:any)=>x.id!==row.id); db.nivo_tasks.push(row);
        } else if (sqlUpper.includes('UPDATE NIVO_TASKS')) {
          const id=params[params.length-1]; const row=(db.nivo_tasks||[]).find((x:any)=>x.id===id); if(row){ if(sqlUpper.includes('ENABLED')) row.enabled=Number(params[0]); if(sqlUpper.includes('COMPLETIONCOUNT')) row.completioncount=Number(params[0]); }
        } else if (sqlUpper.includes('INSERT INTO NIVO_TASK_SUBMISSIONS')) {
          db.nivo_task_submissions=db.nivo_task_submissions||[]; const row:any={id:params[0],userid:params[1],taskid:params[2],tasktitle:params[3],rewardamount:Number(params[4]||0),verificationtype:params[5],status:params[6],startedat:params[7]||'',completedat:params[8]||'',claimedat:params[9]||'',prooftext:params[10]||'',adminnote:params[11]||'',createdat:params[12]||new Date().toISOString()}; db.nivo_task_submissions=db.nivo_task_submissions.filter((x:any)=>x.id!==row.id); db.nivo_task_submissions.push(row);
        } else if (sqlUpper.includes('UPDATE NIVO_TASK_SUBMISSIONS')) {
          const id=params[params.length-1]; const row=(db.nivo_task_submissions||[]).find((x:any)=>x.id===id); if(row){ if(sqlUpper.includes('STATUS')) row.status=params[0]; if(sqlUpper.includes('STARTEDAT')) row.startedat=params[1]||params[0]; if(sqlUpper.includes('COMPLETEDAT')) row.completedat=params[1]||params[0]; if(sqlUpper.includes('CLAIMEDAT')) row.claimedat=params[1]||params[0]; if(sqlUpper.includes('PROOFTEXT')) row.prooftext=params[0]; }
        } else if (sqlUpper.includes('INSERT INTO NIVO_REFERRALS')) {
          db.nivo_referrals=db.nivo_referrals||[]; const row:any={id:params[0],referreremail:(params[1]||'').toLowerCase(),referredemail:(params[2]||'').toLowerCase(),referredusername:params[3]||'',bonusamount:Number(params[4]||0),status:params[5]||'pending',createdat:params[6]||new Date().toISOString()}; db.nivo_referrals=db.nivo_referrals.filter((x:any)=>x.id!==row.id); db.nivo_referrals.push(row);
        } else if (sqlUpper.includes('INSERT INTO NIVO_ACTIVATIONS')) {
          db.nivo_activations=db.nivo_activations||[]; const row:any={id:params[0],useremail:(params[1]||'').toLowerCase(),amount:Number(params[2]||0),status:params[3]||'pending',createdat:params[4]||new Date().toISOString(),processedat:params[5]||'',adminnote:params[6]||''}; db.nivo_activations=db.nivo_activations.filter((x:any)=>x.id!==row.id); db.nivo_activations.push(row);
        } else if (sqlUpper.includes('UPDATE NIVO_ACTIVATIONS')) { const id=params[params.length-1]; const row=(db.nivo_activations||[]).find((x:any)=>x.id===id); if(row){row.status=params[0]; row.processedat=params[1]||new Date().toISOString();} 
        } else if (sqlUpper.includes('INSERT INTO AD_REWARD_SESSIONS')) {
          db.ad_reward_sessions = db.ad_reward_sessions || [];
          const row: any = {
            id: params[0],
            useremail: (params[1] || '').toLowerCase(),
            adunitpath: params[2] || '',
            provider: params[3] || 'Google Ad Manager (GPT Web Rewarded)',
            rewardamount: Number(params[4] || 200),
            status: params[5] || 'pending',
            providertoken: params[6] || '',
            providertxid: params[7] || '',
            clientnonce: params[8] || '',
            createdat: params[9] || new Date().toISOString(),
            completedat: params[10] || '',
            ipaddress: params[11] || ''
          };
          db.ad_reward_sessions = db.ad_reward_sessions.filter((x: any) => x.id !== row.id);
          db.ad_reward_sessions.push(row);
        } else if (sqlUpper.includes('UPDATE AD_REWARD_SESSIONS')) {
          db.ad_reward_sessions = db.ad_reward_sessions || [];
          const id = params[params.length - 1];
          const row = db.ad_reward_sessions.find((x: any) => x.id === id);
          if (row) {
            if (sqlUpper.includes('STATUS')) row.status = params[0];
            if (sqlUpper.includes('COMPLETEDAT')) row.completedat = params[1] || new Date().toISOString();
            if (sqlUpper.includes('PROVIDERTXID')) row.providertxid = params[2] || '';
          }
        } else if (sqlUpper.includes('INSERT INTO AD_REWARDS')) {
          db.ad_rewards = db.ad_rewards || [];
          const row: any = {
            id: params[0],
            useremail: (params[1] || '').toLowerCase(),
            sessionid: params[2] || '',
            provider: params[3] || 'Google Ad Manager (GPT Web Rewarded)',
            providertxid: params[4] || '',
            rewardamount: Number(params[5] || 200),
            status: params[6] || 'verified',
            reference: params[7] || '',
            completedat: params[8] || new Date().toISOString(),
            createdat: params[9] || new Date().toISOString()
          };
          db.ad_rewards = db.ad_rewards.filter((x: any) => x.id !== row.id);
          db.ad_rewards.push(row);
        } else if (sqlUpper.includes('INSERT INTO PASSWORD_RESETS')) {
          const r = {
            id: params[0],
            emailorphone: (params[1] || '').toLowerCase(),
            otp: params[2],
            expiresat: Number(params[3] ?? 0),
            used: Number(params[4] ?? 0),
            createdat: Number(params[5] ?? Date.now())
          };
          db.password_resets = db.password_resets.filter(x => x.id !== r.id);
          db.password_resets.push(r);
        } else if (sqlUpper.includes('INSERT INTO ADMIN_SETTINGS')) {
          db.admin_settings[params[0]] = String(params[1] ?? '');
        } else if (sqlUpper.includes('DELETE FROM ADMIN_SETTINGS')) {
          const k = params[0];
          if (k) {
            delete db.admin_settings[k];
          }
        } else if (sqlUpper.includes('INSERT INTO LOGS')) {
          const log = {
            id: params[0],
            timestamp: params[1] || new Date().toISOString(),
            message: params[2] || '',
            type: params[3] || 'INFO'
          };
          db.logs.unshift(log);
          if (db.logs.length > 500) {
            db.logs.pop();
          }
        } else if (sqlUpper.includes('INSERT INTO AI_CHAT_LOGS')) {
          db.ai_chat_logs = db.ai_chat_logs || [];
          db.ai_chat_logs.unshift({
            id: params[0],
            session_id: params[1],
            user_email: params[2],
            user_message: params[3],
            ai_response: params[4],
            escalated_to_whatsapp: params[5],
            is_unanswered: params[6],
            timestamp: params[7]
          });
        } else if (sqlUpper.includes('INSERT INTO AI_CUSTOM_FAQS')) {
          db.ai_custom_faqs = db.ai_custom_faqs || [];
          db.ai_custom_faqs.push({
            id: params[0],
            question: params[1],
            answer: params[2],
            created_at: params[3]
          });
        } else if (sqlUpper.includes('DELETE FROM AI_CUSTOM_FAQS')) {
          db.ai_custom_faqs = db.ai_custom_faqs || [];
          db.ai_custom_faqs = db.ai_custom_faqs.filter((f: any) => f.id !== params[0]);
        }
        
        saveJsonDb(db);
        resolve({ rows: [], lastID: Date.now(), changes: 1 });
      } catch (err) {
        reject(err);
      }
    }
  });
}

export function getRow(sql: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    if (hasPostgresConfig()) {
      if (!pgPool) {
        return reject(new Error('PostgreSQL pool not initialized.'));
      }
      pgPool.query(sql, params, (err, res) => {
        if (err) return reject(err);
        resolve(res.rows[0] || null);
      });
    } else {
      try {
        const db = getJsonDb();
        const sqlUpper = sql.toUpperCase();

        if (sqlUpper.includes('SELECT COUNT(*) AS COUNT FROM USERS') || sqlUpper.includes('COUNT(*) AS COUNT FROM USERS')) {
          return resolve({ count: db.users.length });
        }
        if (sqlUpper.includes('SELECT COUNT(*) AS COUNT FROM VOUCHERS') || sqlUpper.includes('COUNT(*) AS COUNT FROM VOUCHERS')) {
          return resolve({ count: db.vouchers.length });
        }
        if (sqlUpper.includes('SELECT COUNT(*) AS COUNT FROM ADMIN_SETTINGS') || sqlUpper.includes('COUNT(*) AS COUNT FROM ADMIN_SETTINGS')) {
          return resolve({ count: Object.keys(db.admin_settings).length });
        }
        if (sqlUpper.includes('FROM ADMINS')) {
          const email = (params[0] || '').toLowerCase();
          const row = db.admins.find(a => a.email === email);
          return resolve(row || null);
        }
        if (sqlUpper.includes('FROM USERS')) {
          const target = (params[0] || '').toLowerCase();
          const row = db.users.find(u => u.email === target || u.phone === target);
          return resolve(row || null);
        }
        if (sqlUpper.includes('FROM VOUCHERS')) {
          const rawCode = params[0] || params[1] || '';
          const normCode = normVCode(String(rawCode));
          const row = db.vouchers.find(v => v.id === rawCode || normVCode(v.code) === normCode || normVCode(v.voucherCode) === normCode);
          return resolve(row || null);
        }
        if (sqlUpper.includes('FROM WITHDRAW_REQUESTS')) {
          db.withdraw_requests = db.withdraw_requests || [];
          const idVal = params[0];
          const row = db.withdraw_requests.find((w: any) => w.id === idVal);
          return resolve(row || null);
        }
        if (sqlUpper.includes('FROM WDV_PAYMENTS')) {
          db.wdv_payments = db.wdv_payments || [];
          const refVal = params[0];
          const row = db.wdv_payments.find((p: any) => p.reference === refVal || p.id === refVal);
          return resolve(row || null);
        }
        if (sqlUpper.includes('FROM PAYMENT_TRANSACTIONS')) {
          db.payment_transactions = db.payment_transactions || [];
          const refVal = params[0];
          const row = db.payment_transactions.find((p: any) => p.reference === refVal || p.id === refVal);
          return resolve(row || null);
        }
        if (sqlUpper.includes('COUNT(*)') && sqlUpper.includes('FROM NIVO_REFERRALS')) { const email=String(params[0]||'').toLowerCase(); return resolve({count:(db.nivo_referrals||[]).filter((r:any)=>String(r.referreremail||'').toLowerCase()===email && (!sqlUpper.includes('STATUS') || r.status==='successful')).length}); }
        if (sqlUpper.includes('COUNT(*)') && sqlUpper.includes('FROM NIVO_TASKS')) return resolve({count:(db.nivo_tasks||[]).length});
        if (sqlUpper.includes('FROM NIVO_TASK_SUBMISSIONS')) { const id = params[0]; const rows = db.nivo_task_submissions || []; return resolve(rows.find((x:any)=>x.id===id) || null); }
        if (sqlUpper.includes('FROM NIVO_TASKS')) { const id = params[0]; const rows = db.nivo_tasks || []; return resolve(rows.find((x:any)=>x.id===id) || null); }
        if (sqlUpper.includes('FROM NIVO_REFERRALS')) { const id = params[0]; const rows = db.nivo_referrals || []; return resolve(rows.find((x:any)=>x.id===id) || null); }
        if (sqlUpper.includes('FROM NIVO_ACTIVATIONS')) { const id = params[0]; const rows = db.nivo_activations || []; return resolve(rows.find((x:any)=>x.id===id) || null); }
        if (sqlUpper.includes('FROM AD_REWARD_SESSIONS')) {
          const id = params[0];
          const rows = db.ad_reward_sessions || [];
          return resolve(rows.find((x: any) => x.id === id || x.sessionid === id) || null);
        }
        if (sqlUpper.includes('FROM AD_REWARDS')) {
          const id = params[0];
          const rows = db.ad_rewards || [];
          return resolve(rows.find((x: any) => x.id === id || x.sessionid === id || x.providertxid === id) || null);
        }
        if (sqlUpper.includes('FROM ADMIN_SETTINGS')) {
          const keyVal = params[0];
          if (keyVal && db.admin_settings[keyVal] !== undefined) {
            return resolve({ key: keyVal, value: db.admin_settings[keyVal] });
          }
          return resolve(null);
        }
        
        resolve(null);
      } catch (err) {
        reject(err);
      }
    }
  });
}

export function getAllRows(sql: string, params: any[] = []): Promise<any[]> {
  return new Promise((resolve, reject) => {
    if (hasPostgresConfig()) {
      if (!pgPool) {
        return reject(new Error('PostgreSQL pool not initialized.'));
      }
      pgPool.query(sql, params, (err, res) => {
        if (err) return reject(err);
        resolve(res.rows);
      });
    } else {
      try {
        const db = getJsonDb();
        const sqlUpper = sql.toUpperCase();

        if (sqlUpper.includes('FROM NIVO_TASKS')) return resolve(db.nivo_tasks || []);
        if (sqlUpper.includes('FROM NIVO_TASK_SUBMISSIONS')) return resolve(db.nivo_task_submissions || []);
        if (sqlUpper.includes('FROM NIVO_REFERRALS')) return resolve(db.nivo_referrals || []);
        if (sqlUpper.includes('FROM NIVO_ACTIVATIONS')) return resolve(db.nivo_activations || []);
        if (sqlUpper.includes('FROM AD_REWARD_SESSIONS')) return resolve(db.ad_reward_sessions || []);
        if (sqlUpper.includes('FROM AD_REWARDS')) return resolve(db.ad_rewards || []);
        if (sqlUpper.includes('FROM ADMIN_SETTINGS')) {
          const rows = Object.entries(db.admin_settings).map(([key, value]) => ({ key, value }));
          return resolve(rows);
        }
        if (sqlUpper.includes('FROM USERS')) {
          return resolve(db.users);
        }
        if (sqlUpper.includes('FROM VOUCHERS')) {
          return resolve(db.vouchers);
        }
        if (sqlUpper.includes('FROM PASSWORD_RESETS')) {
          return resolve(db.password_resets);
        }
        if (sqlUpper.includes('FROM LOGS')) {
          return resolve(db.logs);
        }
        if (sqlUpper.includes('FROM WITHDRAW_REQUESTS')) {
          db.withdraw_requests = db.withdraw_requests || [];
          return resolve(db.withdraw_requests);
        }
        if (sqlUpper.includes('FROM WDV_PAYMENTS')) {
          db.wdv_payments = db.wdv_payments || [];
          return resolve(db.wdv_payments);
        }
        if (sqlUpper.includes('FROM PAYMENT_TRANSACTIONS')) {
          db.payment_transactions = db.payment_transactions || [];
          return resolve(db.payment_transactions);
        }
        if (sqlUpper.includes('FROM AI_CHAT_LOGS')) {
          db.ai_chat_logs = db.ai_chat_logs || [];
          return resolve(db.ai_chat_logs);
        }
        if (sqlUpper.includes('FROM AI_CUSTOM_FAQS')) {
          db.ai_custom_faqs = db.ai_custom_faqs || [];
          return resolve(db.ai_custom_faqs);
        }

        resolve([]);
      } catch (err) {
        reject(err);
      }
    }
  });
}

