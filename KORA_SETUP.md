# Kora One-Time Deposit Setup

The deposit flow has been changed from a Paystack Dedicated Virtual Account (DVA) to Kora's **Pay with Bank Transfer API**.

## What the new flow does

1. User chooses a deposit amount (minimum ₦520).
2. The server creates a unique Kora bank-transfer transaction.
3. Kora returns a temporary, single-use bank account and its expiry time.
4. The UI displays the bank, account name, account number, amount, and live countdown.
5. Kora sends a `charge.success` webhook after payment.
6. The server verifies the webhook signature and requeries Kora before crediting the wallet.
7. After the transaction is completed or expires, the next deposit request creates a completely new account number.

## Required environment variables

```env
KORAPAY_SECRET_KEY=sk_live_...
KORAPAY_WEBHOOK_SECRET=
APP_URL=https://your-public-domain.example
```

`KORAPAY_WEBHOOK_SECRET` can be left empty when the Kora secret key is the signing secret. The server falls back to `KORAPAY_SECRET_KEY` for webhook signature verification.

## Kora dashboard configuration

Enable **Bank Transfer payments via API** for the Kora merchant account. Kora's documentation says this feature must be enabled on the merchant account before the API can generate dynamic bank accounts.

Configure the Kora webhook URL as:

`https://YOUR_DOMAIN/api/kora/webhook`

The webhook must be publicly reachable over HTTPS in production.

## Important

Do not put `KORAPAY_SECRET_KEY` in client-side Vite variables such as `VITE_*`. It must remain server-side only.

The previous Paystack withdrawal bank-list/account-resolution endpoints are intentionally left in place because they are unrelated to the deposit redesign.
