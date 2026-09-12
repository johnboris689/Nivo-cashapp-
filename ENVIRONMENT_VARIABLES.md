# SwiftPay Environment Variables Reference Guide

The following environment variables are required for full SwiftPay operations, including Korapay Virtual Account & Automatic Webhook Processing:

| Variable Name | Required | Default / Example | Description |
|---|---|---|---|
| `PORT` | Optional | `3000` | HTTP server port |
| `DATABASE_URL` | Optional | `postgres://user:pass@host:5432/dbname` | PostgreSQL database connection string (falls back to local `swiftpay_db.json` if absent) |
| `JWT_SECRET` | Required | `swiftpay_secure_jwt_secret_key_2026` | Secret key for signing user authentication JSON Web Tokens |
| `KORAPAY_SECRET_KEY` | Recommended | `sk_test_1234567890abcdef...` or `sk_live_...` | Korapay API Secret Key for generating Virtual Accounts & bank verification |
| `KORAPAY_PUBLIC_KEY` | Recommended | `pk_test_1234567890abcdef...` or `pk_live_...` | Korapay API Public Key |
| `ADMIN_PASSWORD` | Optional | `admin123` | Default master administrator login password |
