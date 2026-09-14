# Nevo

Nevo is a mobile-first Nigerian rewards and wallet platform focused on **tasks, rewarded adverts, referrals, verified wallet deposits and eligible withdrawals**.

## Core features

- User registration, login, password recovery and security PIN
- ₦750 one-time registration reward
- Tasks and task-reward history
- Rewarded adverts and ad-reward history
- Referral codes and referral rewards
- KoraPay-only wallet deposits with fresh hosted checkout sessions
- Server-side KoraPay webhook verification and transaction verification
- Idempotent wallet crediting
- Wallet, transaction and withdrawal history stored in PostgreSQL
- Profile information and profile pictures stored with the user record
- Admin dashboard for users, tasks, referrals, deposits and withdrawals
- Gemini-powered Nevo Assistant when `GEMINI_API_KEY` is configured

## Payment architecture

KoraPay is the **only payment gateway** in this project.

For every deposit:

```text
User
  ↓
Nevo Deposit Screen
  ↓
Nevo Backend
  ↓
KoraPay API — create a NEW charge
  ↓
KoraPay returns checkout_url
  ↓
Nevo redirects the user
  ↓
KoraPay webhook + direct verification
  ↓
Nevo validates user / amount / currency / status / idempotency
  ↓
Wallet credited exactly once
```

The application never hardcodes a customer payment URL. `KORAPAY_SECRET_KEY` is server-side only.

## Transaction eligibility

The following wallet-spending and cash-out services are locked until the user satisfies **both** requirements:

1. At least **5 successful referrals**.
2. At least one **verified KoraPay wallet deposit of ₦520 or more**.

Tasks and rewarded adverts remain available without those requirements.

The minimum withdrawal amount is **₦5,000**.

## Database

Production deployments use the Render PostgreSQL database supplied through `DATABASE_URL`.

Nevo creates and uses a dedicated PostgreSQL schema named `nevo`, so the application no longer reads the previous legacy database tables. Existing legacy tables outside that schema are not used by the application.

Important information stored in the Nevo database includes:

- user profile and credentials
- wallet balances
- transaction history
- KoraPay payment transactions
- withdrawal requests and approval history
- notifications
- task submissions and rewards
- referral records
- rewarded-ad sessions and rewards
- password-reset records
- administrator accounts and settings
- AI support logs

A local `nevo_db.json` fallback is retained for development only when PostgreSQL is not configured. No demo user or demo administrator is created automatically.

## Required production environment

```env
NODE_ENV=production
PORT=10000
APP_URL=https://your-nevo-app.onrender.com
DATABASE_URL=postgresql://...
KORAPAY_SECRET_KEY=...
KORAPAY_PUBLIC_KEY=...
JWT_SECRET=...
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
```

Optional:

```env
GEMINI_API_KEY=...
SUPPORT_EMAIL=...
SUPPORT_PHONE=...
WHATSAPP_NUMBER=...
SENDER_NAME=Nevo
```

Never commit real secrets to GitHub.

## KoraPay webhook

Configure:

```text
https://YOUR-NEVO-DOMAIN/api/payment/webhook/korapay
```

The webhook is intentionally unauthenticated at the HTTP layer because it is called by KoraPay. Its `x-korapay-signature` is validated using the KoraPay secret key, and the transaction is then verified directly against KoraPay before any wallet credit.

## Local development

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm start
```

## Render

Use a Node service with:

- **Build command:** `npm install && npm run build`
- **Start command:** `npm start`
- `DATABASE_URL` connected to your Render PostgreSQL database
- KoraPay live credentials configured in Render Environment Variables
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` configured before first deployment

## Security principles

- No payment is considered successful because a browser was redirected.
- No wallet credit is created from a frontend button.
- Provider confirmation is verified server-side.
- Amount and currency are compared with the original pending transaction.
- Duplicate webhooks cannot credit the wallet twice.
- KoraPay secret credentials never enter React/browser code.
- Profile images are validated and stored with the user profile.
- No demo admin password or demo user is automatically created.
