# SwiftPay Enterprise Update — Installation Guide

## Package Name
`swiftpay_complete_source_v2.zip`

---

## How to Install this Update

1. **Extract the ZIP Archive**
   Unzip `swiftpay_complete_source_v2.zip` on your computer.

2. **Overwrite Project Files**
   Copy all extracted files directly into the root directory of your existing SwiftPay project repository, overwriting existing files:
   - `server.ts`
   - `db.ts`
   - `.env.example`
   - `src/App.tsx`
   - `CHANGELOG.md`
   - `INSTALL.md`
   - `ENVIRONMENT_VARIABLES.md`
   - `KORAPAY_SETUP.md`

3. **Configure Environment Variables**
   Set the following variables in your hosting environment (e.g., Render, Railway, Heroku, or `.env` file):
   - `KORAPAY_SECRET_KEY`: Your Korapay Secret Key (e.g. `sk_live_...` or `sk_test_...`)
   - `KORAPAY_PUBLIC_KEY`: Your Korapay Public Key (e.g. `pk_live_...` or `pk_test_...`)

4. **Git Commit & Push**
   ```bash
   git add .
   git commit -m "Apply SwiftPay Korapay Virtual Account & Auto WDV Voucher update"
   git push origin main
   ```

5. **Deploy on Render**
   - Trigger a new deployment on Render or your cloud provider.
   - Build Command: `npm run build`
   - Start Command: `npm run start`

6. **Configure Korapay Webhook URL**
   In your Korapay Dashboard -> Settings -> API Keys & Webhooks:
   - Set **Webhook URL** to: `https://your-domain.onrender.com/api/korapay/webhook`
