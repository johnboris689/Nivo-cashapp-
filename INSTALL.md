# Nevo Installation

## Local

```bash
npm install
npm run build
npm start
```

## Render

Build command:

```bash
npm install && npm run build
```

Start command:

```bash
npm start
```

Required Render variables are documented in `.env.example` and `README.md`. Use a Render PostgreSQL `DATABASE_URL`, live `KORAPAY_SECRET_KEY`, `KORAPAY_PUBLIC_KEY`, `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.
