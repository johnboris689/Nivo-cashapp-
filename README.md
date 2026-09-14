# Nevo — Digital Rewards & Wallet Platform

Nevo is a full-stack Nigerian digital rewards and wallet platform built around **tasks, rewarded adverts, referrals, wallet deposits, withdrawals, and everyday wallet services**.

Users can create an account, complete eligible tasks, watch supported rewarded adverts, invite friends, fund their wallet through real payment gateways, and withdraw when the platform's eligibility requirements are satisfied.

This repository contains the existing Nevo application source. It is not a demo-only frontend: payment initialization, provider verification, webhook handling, wallet crediting, authentication, rewards, and administrative controls are implemented on the server.

## Core Features

- User registration and authentication
- Secure password reset with OTP verification
- Wallet balance and transaction history
- Real wallet deposits through **Paystack** or **KoraPay**
- Fresh provider transaction generated for every deposit
- Server-side payment verification and webhook processing
- Idempotent wallet crediting to prevent duplicate deposits
- Minimum wallet deposit of **₦520**
- Task-based rewards
- Rewarded advert experience with server-side reward verification
- Referral tracking and referral rewards
- Withdrawal eligibility based on the configured Nevo requirements
- Airtime, data, transfer, and bill-payment services
- In-app notifications
- Fingerprint / Face ID / passkey support where supported by the device
- Nevo Assistant customer-support experience
- Admin dashboard for users, rewards, referrals, deposits, withdrawals, and settings

## Payment Architecture

Nevo keeps payment credentials on the backend. Browser code never receives provider secret keys.

### Paystack

When a user selects Paystack, the Nevo backend creates a new transaction through the Paystack API using `PAYSTACK_SECRET_KEY`. The checkout/authorization URL returned by Paystack is then sent to the browser for redirection.

### KoraPay

When a user selects KoraPay, the Nevo backend creates a new checkout transaction through the KoraPay API using `KORAPAY_SECRET_KEY`. The checkout URL returned by KoraPay is used for the current transaction.

No permanent checkout URL, fake transaction reference, fake account number, or simulated payment is used for wallet deposits.

A successful redirect is **not** treated as proof of payment. Nevo verifies the provider transaction and processes the provider webhook before crediting the wallet.

## Deposit Flow

1. User opens **Deposit**.
2. User selects an amount of at least ₦520.
3. User chooses **Paystack** or **KoraPay**.
4. Nevo creates a fresh pending payment transaction.
5. Nevo calls the selected provider API from the backend.
6. The provider returns the real checkout information.
7. User completes payment on the provider's hosted checkout.
8. The provider notifies Nevo through its webhook and/or verification API.
9. Nevo verifies the provider, reference, user, currency, amount, and successful status.
10. Nevo credits the wallet exactly once.

## Environment Variables

Create a local `.env` from `.env.example` and provide real values through your deployment platform in production.

Important variables include:

```env
NODE_ENV=production
PORT=3000
APP_URL=https://your-nevo-domain.example

PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key

KORAPAY_SECRET_KEY=your_korapay_secret_key
KORAPAY_PUBLIC_KEY=your_korapay_public_key

GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=your_postgresql_connection_string

SENDER_NAME=Nevo
SUPPORT_EMAIL=your_support_email
SUPPORT_PHONE=your_support_phone
WHATSAPP_NUMBER=your_whatsapp_number
```

**Never commit real secret keys to GitHub and never place provider secret keys in React/browser code.**

## Payment Webhooks

Configure the provider dashboards to send successful payment notifications to the deployed Nevo service using the webhook routes implemented by the backend:

- Paystack: `/api/payment/webhook/paystack`
- KoraPay: `/api/payment/webhook/korapay`

The public webhook endpoint must be reachable over HTTPS in production.

## Technology Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- Express.js
- Node.js
- PostgreSQL support through `pg`
- JSON persistence fallback for environments without PostgreSQL
- Google Gemini SDK for the Nevo Assistant
- WebAuthn/passkey browser APIs
- Lucide icons
- Motion animations

## Project Structure

```text
nevo/
├── server.ts
├── db.ts
├── email_sms_service.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env.example
├── payments/
├── server/payments/
├── public/
├── data/
├── nevo_db.json
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── index.css
    ├── data.ts
    ├── types.ts
    ├── components/
    ├── pages/
    ├── services/
    └── lib/
```

## Local Development

### Requirements

- Node.js 18+
- npm 9+

### Install

```bash
npm install
```

### Configure

```bash
cp .env.example .env
```

Fill in the required environment variables. Do not put production secrets into source files.

### Start development

```bash
npm run dev
```

The development server runs on the configured port, normally `3000`.

### Production build

```bash
npm run build
npm start
```

The build creates the Vite frontend and bundles the Express server into `dist/server.cjs`.

## Render Deployment

Use a Render Web Service connected to the Nevo GitHub repository.

Recommended commands:

**Build Command**

```bash
npm run build
```

**Start Command**

```bash
npm start
```

Add the production environment variables in the Render service settings. In particular, configure the database, application URL, Paystack credentials, KoraPay credentials, and Gemini key before testing production payment or assistant functionality.

## Security Principles

- Provider secret keys stay server-side.
- Payment initialization is performed by the backend.
- The frontend cannot declare that a payment succeeded.
- Wallet credits are based on verified provider transactions.
- Provider amount and currency are checked before crediting.
- Duplicate webhook delivery does not create duplicate wallet credits.
- Failed, cancelled, or expired payments do not credit the wallet.
- Authentication tokens are handled through the application's authenticated API flow.
- OTP values and payment secrets are not intended to be exposed in the browser.

## Rewards Model

Nevo's earning experience is centered on:

- Completing available tasks
- Watching eligible rewarded adverts
- Referring other users
- Viewing reward history

Reward amounts and eligibility are controlled by the application/backend configuration rather than by a fake client-side balance update.

## Administration

The admin area provides controls for the operational parts of Nevo, including users, deposits/payments, withdrawals, tasks, submissions, referrals, activations/eligibility, notifications, support settings, and other configured platform settings.

## Important Deployment Notes

Before going live:

1. Add production PostgreSQL credentials if PostgreSQL is being used.
2. Add real Paystack credentials.
3. Add real KoraPay credentials.
4. Set `APP_URL` to the exact HTTPS Nevo deployment URL.
5. Configure Paystack and KoraPay webhook URLs.
6. Confirm webhook requests can reach the service.
7. Test a small real deposit with each provider.
8. Confirm the wallet is credited only after provider confirmation.
9. Confirm a duplicate webhook does not duplicate the credit.
10. Keep all secret values out of GitHub.

## License / Ownership

This source is the Nevo application codebase and is intended to be maintained as the existing project rather than recreated as a separate demo application.

© 2026 Nevo. All rights reserved.
