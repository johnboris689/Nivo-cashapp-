# Nevo production persistence and KoraPay deposit setup

## Persistent users

Set `DATABASE_URL` on Render to a persistent PostgreSQL database. Do not rely on `nevo_db.json` inside the Render web-service filesystem for production users because a normal redeploy can replace that filesystem.

The JSON fallback is intended for local development. If a persistent Render Disk is intentionally used instead, set `NEVO_DB_FILE` to the mounted disk path. PostgreSQL remains recommended for financial/user data.

## KoraPay environment

Set these as Render environment variables and never commit the secret values:

- `KORAPAY_SECRET_KEY`
- `KORAPAY_PUBLIC_KEY`
- `KORAPAY_WEBHOOK_SECRET` (optional; if omitted, Nevo uses the KoraPay secret key for webhook HMAC verification)

## KoraPay webhook

Configure the KoraPay Notification/Webhook URL as:

`https://YOUR-NEVO-DOMAIN/api/payment/webhook/korapay`

The endpoint is public to KoraPay and does not require a user session. Nevo verifies the `x-korapay-signature` HMAC and then performs a server-side KoraPay charge query before crediting a wallet.

## Deposit confirmation

Nevo now uses three confirmation paths:

1. KoraPay webhook -> signature validation -> server-side charge verification -> wallet credit.
2. KoraPay redirect -> server-side verification using KoraPay's `reference` query parameter.
3. A background reconciliation sweep every 15 seconds for pending wallet deposits.

The browser redirect is never treated as proof of payment.
