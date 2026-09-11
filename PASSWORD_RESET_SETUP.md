# Nivo Cash Password Reset Setup

The app now uses a secure email OTP flow:

1. User enters their email.
2. A cryptographically random 6-digit OTP is emailed through Resend.
3. OTPs expire after 10 minutes and are limited to 5 verification attempts.
4. A single-use reset token is issued after successful OTP verification.
5. The user creates a new password (minimum 8 characters).
6. The local Nivo password hash is updated; matching Supabase Auth users are synchronized on a best-effort basis.

## Required server environment

Set these variables in the server/Render environment:

- `RESEND_API_KEY` — your Resend API key. Keep this secret.
- `RESEND_FROM_EMAIL` — a sender address/domain permitted by Resend, for example `Nivo Cash <no-reply@your-verified-domain.com>`.

Do not put either value in frontend code or `VITE_` variables.

The existing `PAYSTACK_SECRET_KEY`, Supabase variables, and other application secrets remain server-side as before.
