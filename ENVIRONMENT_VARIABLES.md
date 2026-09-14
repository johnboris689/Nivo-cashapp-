# Nevo Environment Variables Reference

## Wallet deposits

Nevo wallet deposits support **both Paystack and KoraPay**. The user chooses the provider at deposit time. Each deposit is initialized from the Nevo backend and receives a fresh provider-generated checkout URL.

| Variable | Required | Used for |
|---|---|---|
| `PAYSTACK_SECRET_KEY` | For Paystack deposits | Server-side Paystack transaction initialization and verification |
| `PAYSTACK_PUBLIC_KEY` | Optional for the current redirect flow | Public Paystack integrations that may be added later |
| `KORAPAY_SECRET_KEY` | For KoraPay deposits | Server-side KoraPay checkout initialization, verification, and webhook signature validation |
| `KORAPAY_PUBLIC_KEY` | Optional for the current redirect flow | Public KoraPay integrations that may be added later |
| `APP_URL` | Recommended in production | Base URL used for provider callback and webhook URLs |

## Server/runtime

| Variable | Required | Description |
|---|---|---|
| `PORT` | Optional | HTTP server port |
| `NODE_ENV` | Recommended | `production` for production deployment |
| `DATABASE_URL` | Recommended | PostgreSQL connection string; the app has a JSON fallback when it is not configured |
| `GEMINI_API_KEY` | If AI support is enabled | Nevo Assistant backend API access |
| `RESEND_API_KEY` | If password-reset email is enabled | Server-side email delivery |
| `RESEND_FROM_EMAIL` | If password-reset email is enabled | Verified sender address |
| `ADMIN_EMAIL` | Optional | Administrator provisioning configuration |
| `ADMIN_PASSWORD` | Optional | Administrator provisioning configuration |

### Security rules

- Never put `PAYSTACK_SECRET_KEY` or `KORAPAY_SECRET_KEY` in React/browser code.
- Never return either secret key from an API endpoint.
- Never commit real secret values to GitHub.
- Configure Paystack and KoraPay webhooks to use the public Nevo webhook endpoints documented in their setup files.
- `APP_URL` should be the public HTTPS URL of the deployed Nevo application.
