# Nevo Password Reset Setup

The app now uses a secure email OTP flow:

1. User enters their email.
2. A cryptographically random 6-digit OTP is emailed through Resend.
3. OTPs expire after 10 minutes and are limited to 5 verification attempts.
4. A single-use reset token is issued after successful OTP verification.
5. The user creates a new password (minimum 8 characters).
6. The Nevo password hash is updated in the production database. No external authentication service is required.

## Required server environment

Set these variables in the server/Render environment:

- `RESEND_API_KEY` — your Resend API key. Keep this secret.
- `RESEND_FROM_EMAIL` — a sender address/domain permitted by Resend, for example `Nevo <no-reply@your-verified-domain.com>`.

Do not put either value in frontend code or `VITE_` variables.

The existing `KORAPAY_SECRET_KEY`, other application secrets remain server-side as before.
