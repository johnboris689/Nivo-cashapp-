# Nevo — KoraPay Wallet Deposit Setup

Nevo wallet deposits use KoraPay Checkout Redirect. Each deposit creates a new KoraPay charge through the backend and redirects the user to the checkout URL returned by KoraPay.

## Environment variables

```env
APP_URL=https://your-nevo-domain.example
KORAPAY_SECRET_KEY=sk_live_...
KORAPAY_PUBLIC_KEY=pk_live_...
```

`KORAPAY_SECRET_KEY` is server-only. Never put it in React/browser code or commit a real key to Git.

## Deposit flow

1. User selects an amount of at least ₦520.
2. User selects KoraPay.
3. Nevo creates a unique pending `wallet_funding` transaction.
4. Nevo calls KoraPay's official charge initialization API from the backend.
5. KoraPay returns the hosted checkout URL for that newly-created transaction.
6. Nevo redirects the user to that returned URL; no static checkout URL is used.
7. KoraPay sends a signed webhook to Nevo.
8. Nevo verifies the transaction with KoraPay, including status, NGN currency, amount, and transaction ownership, before crediting the wallet.

Webhook endpoint:

`/api/payment/webhook/korapay`

The compatibility endpoint `/api/korapay/webhook` is also routed to the same verified webhook handler.
