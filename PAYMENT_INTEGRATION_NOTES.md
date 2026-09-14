# Nevo Real Payment Integration

This source uses real Paystack and KoraPay APIs for wallet deposits.

## Deposit flow

- Minimum amount: ₦520.
- User selects Paystack or KoraPay.
- The Nevo backend creates a unique `wallet_funding` transaction with `pending` status.
- The selected provider is called from the backend using its server environment secret.
- The provider-generated checkout URL is returned to the frontend.
- The frontend redirects to that URL; it never constructs a provider checkout URL.
- The wallet is never credited because the user opened checkout, returned to Nevo, or clicked a browser button.
- Provider webhook + direct provider verification are used before wallet credit.
- Amount, currency, user ownership, provider, transaction status, and idempotency are checked.

## Provider webhook URLs

Paystack:

`/api/payment/webhook/paystack`

KoraPay:

`/api/payment/webhook/korapay`

Compatibility aliases also exist at `/api/paystack/webhook` and `/api/korapay/webhook`.

## Required production environment

```env
APP_URL=https://your-nevo-domain.example
PAYSTACK_SECRET_KEY=...
PAYSTACK_PUBLIC_KEY=...
KORAPAY_SECRET_KEY=...
KORAPAY_PUBLIC_KEY=...
```

Do not commit real secret values.

## Static checkout links

No individual KoraPay or Paystack checkout transaction URL is stored in the source or seed database. Every deposit must obtain its checkout URL from the provider's current API response.
