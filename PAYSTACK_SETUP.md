# SwiftPay WDV Voucher — Paystack Setup

SwiftPay now sells the WDV voucher directly from **Buy WDV Voucher**. The fixed purchase price is **₦6,500**. There is no wallet-deposit step in this flow.

## Configure Paystack

Add these server-side environment variables in Render (or your hosting provider):

```env
PAYMENT_PROVIDER=paystack
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_PUBLIC_KEY=pk_live_...
```

The secret key must never be placed in frontend code.

## Payment flow

1. User opens **Buy WDV Voucher** and taps **BUY WDV VOUCHER — ₦6,500**.
2. SwiftPay creates a unique payment reference on the server.
3. Paystack opens its secure checkout.
4. SwiftPay verifies the reference directly with Paystack's API.
5. Only a verified successful **₦6,500 NGN** payment can create a WDV voucher.
6. The voucher is stored in the existing WDV voucher database and shown with a **Copy Voucher** button.

Paystack webhooks are also supported at:
`/api/payment/webhook/paystack`

The webhook does not trust the browser and cannot create a voucher for the wrong amount. Duplicate notifications are handled idempotently.
