# SwiftPay WDV Voucher — Korapay Setup

SwiftPay supports Korapay as an online gateway for the **Buy WDV Voucher** flow. The fixed purchase price is **₦6,500**.

## Configure Korapay

Add these server-side environment variables:

```env
PAYMENT_PROVIDER=korapay
KORAPAY_SECRET_KEY=sk_live_...
KORAPAY_PUBLIC_KEY=pk_live_...
```

Keep the Secret Key server-side. Korapay webhook signatures are verified with `KORAPAY_SECRET_KEY`; no separate webhook-secret environment variable is required.

## Payment flow

1. User selects **Buy WDV Voucher**.
2. SwiftPay starts a ₦6,500 Korapay checkout.
3. Korapay processes the payment.
4. SwiftPay verifies the transaction server-side.
5. A WDV voucher is generated only after a successful ₦6,500 NGN verification.
6. The existing WDV voucher ledger stores the generated voucher.

Webhook endpoints:
`/api/payment/webhook/korapay` and the legacy `/api/korapay/webhook` endpoint.
