# Nevo — Paystack Wallet Deposit Setup

Nevo wallet deposits use Paystack's server-side Transaction API. Each deposit creates a new Paystack transaction and redirects the user to the checkout URL returned by Paystack.

## Environment variables

```env
APP_URL=https://your-nevo-domain.example
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_PUBLIC_KEY=pk_live_...
```

`PAYSTACK_SECRET_KEY` is server-only. Never put it in React/browser code or commit a real key to Git.

## Deposit flow

1. User selects an amount of at least ₦520.
2. User selects Paystack.
3. Nevo creates a unique pending `wallet_funding` transaction.
4. Nevo calls Paystack's `transaction/initialize` endpoint from the backend.
5. Nevo redirects the user to the `authorization_url` returned by Paystack for that transaction.
6. A browser callback never credits the wallet by itself.
7. Nevo verifies the transaction with Paystack and processes the Paystack webhook.
8. Only a verified successful NGN payment matching the stored amount and user can credit the wallet.

Webhook endpoint:

`/api/payment/webhook/paystack`

Paystack webhook signatures are verified with `PAYSTACK_SECRET_KEY`, and duplicate events are protected by transaction idempotency.
