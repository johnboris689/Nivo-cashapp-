# SwiftPay Enterprise Update Changelog — Korapay Virtual Account & Automatic WDV Voucher Delivery

## Summary of Changes

### 1. Backend & Server (`server.ts`)
- **Korapay Virtual Account Integration**:
  - Implemented `POST /api/korapay/virtual-account` to automatically generate or retrieve a 10-digit virtual account for fixed ₦6,500 WDV voucher payments.
  - Implemented `GET /api/korapay/payment-status/:reference` to poll payment verification status.
  - Implemented `POST /api/korapay/webhook` with HMAC SHA256 signature verification (`x-korapay-signature`) for instant automated payment processing upon Korapay webhook events.
  - Implemented `GET /api/bank/resolve` for account name lookup across Nigerian banks.
  - Implemented `POST /api/korapay/simulate-payment` for instant test payment verification and automated voucher delivery.
- **Bank Account Resolution**:
  - Updated `verifyBankAccountService` in `server.ts` to automatically attempt Korapay resolution when `KORAPAY_SECRET_KEY` is present.
- **ZIP Download Endpoints**:
  - Added public download routes for `/swiftpay_complete_source_v2.zip` and `/download-source-v2`.

### 2. Database Schema (`db.ts`)
- Added/verified `wdv_payments` table schema with PostgreSQL dual-engine support and JSON file fallback (`swiftpay_db.json`).
- Added helper functions for creating, updating, and querying WDV payment records.

### 3. Frontend Application (`src/App.tsx`)
- **Korapay DVA Payment Flow**:
  - Updated "Buy WDV Voucher" screen to invoke Korapay virtual account creation endpoint with fixed price ₦6,500.
  - Displayed real-time Bank Name, Dedicated Account Number, Account Name, and 15-minute countdown window timer.
  - Added live background polling ticker checking Korapay payment status every 3 seconds.
  - Added "Simulate / Check Payment Received" action button for instant testing.
- **Automatic Voucher Issuance & PDF Receipt Download**:
  - Automatically generates and registers WDV Voucher code when Korapay payment status transitions to `successful` or `settled`.
  - Added **Copy Voucher Code** button on confirmation.
  - Added **Download PDF Receipt** button utilizing `jsPDF` to generate official A4 PDF payment certificates.

### 4. Environment Configuration (`.env.example`)
- Added `KORAPAY_SECRET_KEY` and `KORAPAY_PUBLIC_KEY`; Korapay webhook verification uses the Secret Key.
