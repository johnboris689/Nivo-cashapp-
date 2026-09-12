# 🚀 SwiftPay - Next-Generation Fintech Platform

SwiftPay is a complete, production-ready full-stack fintech web application featuring digital wallet management, WDV (Withdrawal Voucher) code processing, automated bank transfers, a cyber withdrawal terminal, a level-1 Gemini AI customer support assistant, real-time admin control panel, and robust security protocols.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Framer Motion
- **Backend**: Express.js (Node.js runtime), ESBuild bundled CommonJS server
- **AI Support Engine**: Google `@google/genai` SDK (Gemini 3.6 Flash) with smart fallback rule engine
- **Database Layer**: Dual-mode storage engine — native PostgreSQL (`pg`) with automatic fallback to JSON file storage (`swiftpay_db.json`)
- **Authentication**: Biometric WebAuthn (Fingerprint/FaceID), 4-digit Security PINs, OTP verification via SMTP/Resend/SendGrid/Twilio/Termii

---

## 📁 Project Structure

```
swiftpay/
├── server.ts               # Express API backend & Vite dev server middleware
├── db.ts                   # SQLite/JSON/Postgres database initialization & schema
├── email_sms_service.ts    # Transports for Email (SMTP/Resend) & SMS (Twilio/Termii)
├── index.html              # SPA entry point
├── package.json            # Scripts and npm dependencies
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build & bundler configuration
├── .env.example            # Environment variables template
├── public/                 # Static public assets & export ZIP archive
├── src/
│   ├── App.tsx             # Main React application component & state router
│   ├── main.tsx            # React application mounting
│   ├── index.css           # Tailwind v4 CSS imports & keyframe animations
│   ├── types.ts            # Shared TypeScript interfaces
│   ├── components/
│   │   ├── AdminPanel.tsx            # Admin dashboard with 8 control sections & AI settings
│   │   ├── AiSupportChat.tsx         # AI customer support chat interface (Embedded & Floating)
│   │   ├── CyberWithdrawalTerminal.tsx# High-security cyber withdrawal terminal
│   │   ├── WdvVoucher.tsx            # WDV Voucher purchase & generator modal
│   │   ├── DevicesHistory.tsx        # Biometrics & active device sessions tracker
│   │   ├── GlassCard.tsx             # Reusable frosted glass card UI wrapper
│   │   ├── LiveTicker.tsx            # Live transaction ticker banner
│   │   ├── QuickFabMenu.tsx          # Floating action button navigation menu
│   │   ├── TransactionReceipt.tsx    # Downloadable/Shareable PDF-style transaction receipt
│   │   └── StandaloneLegalPages.tsx  # Terms of Service & Privacy Policy views
```

---

## 💻 Local Development Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Step-by-Step Instructions

1. **Extract / Navigate to Project Directory**:
   ```bash
   cd swiftpay
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the template `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in your configuration:
   - Set `GEMINI_API_KEY` (Get a free key from [Google AI Studio](https://aistudio.google.com))
   - (Optional) Set `DATABASE_URL` if connecting to a PostgreSQL server, otherwise leave blank to use the built-in local JSON database.

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

5. **Access Application**:
   Open your browser and navigate to:
   `http://localhost:3000`

---

## ☁️ Production Deployment to Render

Deploying SwiftPay on **Render.com** is straightforward:

### Step 1: Repository Push
Push your project code to a private or public repository on GitHub or GitLab.

### Step 2: Create Web Service on Render
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository containing the SwiftPay code.

### Step 3: Configure Web Service
- **Name**: `swiftpay-app` (or your preferred name)
- **Region**: Choose your nearest region (e.g. Frankfurt, Oregon)
- **Branch**: `main`
- **Runtime**: `Node`
- **Build Command**:
  ```bash
  npm run build
  ```
- **Start Command**:
  ```bash
  npm run start
  ```

### Step 4: Add Environment Variables on Render
In the **Environment** section of your Web Service configuration, add the following variables:
- `NODE_ENV`: `production`
- `PORT`: `3000`
- `GEMINI_API_KEY`: *Your Google Gemini API Key*
- `APP_URL`: *https://your-service-name.onrender.com*
- `DATABASE_URL`: *(Optional) Render PostgreSQL Connection String*

### Step 5: (Optional) Attach a PostgreSQL Database
1. On Render, click **New +** > **PostgreSQL**.
2. Once created, copy the **Internal Database URL**.
3. Paste it as `DATABASE_URL` in your Web Service environment variables.
4. Render will automatically migrate tables on app startup.

### Step 6: Deploy
Click **Create Web Service**. Render will run `npm run build` and launch `npm run start`. Once complete, your live URL will be active.

---

## 🔑 Admin Dashboard Access

- **Admin URL**: `http://localhost:3000/admin/login` or click **Admin Login** in the footer menu.
- **Features in Admin Panel**:
  1. **Overview**: Total users, withdrawal statistics, deposit volumes, live charts.
  2. **User Management**: View, edit, freeze/unfreeze accounts, credit/debit balances.
  3. **Withdrawal Terminal**: Approve or reject pending bank withdrawals with instant receipts.
  4. **WDV Voucher Generator**: Issue and search unique 10-digit voucher codes.
  5. **AI Support Settings**: Enable/disable AI assistant, set welcome message, add custom FAQs, view real-time conversation logs & escalation analytics.
  6. **Security & System Center**: Master feature toggles, limits, maintenance mode, WhatsApp support phone links.

---

## 📦 Export & Source Archive

You can export this codebase at any time in two ways:
1. **Direct Download**: Download `swiftpay_complete_source.zip` directly from the `/public` folder or via the download link generated inside the app.
2. **AI Studio Export Menu**: Click **Settings / Export** in the AI Studio top navigation bar and select **Download ZIP** or **Push to GitHub**.

---

© 2026 SwiftPay Technologies. All rights reserved.
