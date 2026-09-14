# Nevo KoraPay Setup

KoraPay is the only payment provider enabled by Nevo.

## Environment variables

```env
KORAPAY_SECRET_KEY=sk_live_...
KORAPAY_PUBLIC_KEY=pk_live_...
```

The secret key must exist only in the server environment.

## Wallet deposits

Nevo creates a fresh transaction through KoraPay for every deposit. The application never stores or reuses a customer checkout URL.

The backend sends:

- unique reference
- amount
- `NGN`
- customer name and email
- redirect URL
- webhook notification URL
- Nevo metadata
- supported KoraPay checkout channels

KoraPay returns a new `checkout_url`; Nevo redirects the customer to that exact URL.

## Webhook

Configure this public URL in KoraPay if required by your merchant settings:

```text
https://YOUR-NEVO-DOMAIN/api/payment/webhook/korapay
```

Nevo validates `x-korapay-signature`, then performs a direct KoraPay transaction verification before crediting the wallet.

## Wallet-credit rules

A redirect is not proof of payment. A frontend callback is not proof of payment. Only a verified successful KoraPay transaction with the exact stored amount and `NGN` currency can credit a wallet.

Duplicate webhook deliveries are idempotent.
