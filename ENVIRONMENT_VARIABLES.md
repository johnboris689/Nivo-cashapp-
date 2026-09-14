# Nevo Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes in production | Render PostgreSQL connection |
| `KORAPAY_SECRET_KEY` | Yes | Server-side KoraPay API authentication |
| `KORAPAY_PUBLIC_KEY` | Optional | Public KoraPay integrations where required |
| `JWT_SECRET` | Yes | User authentication signing secret |
| `ADMIN_EMAIL` | Yes | First administrator account |
| `ADMIN_PASSWORD` | Yes | First administrator password |
| `APP_URL` | Recommended | Public Nevo URL |
| `GEMINI_API_KEY` | Optional | Nevo Assistant |
| `SUPPORT_EMAIL` | Optional | Support contact |
| `SUPPORT_PHONE` | Optional | Support contact |
| `WHATSAPP_NUMBER` | Optional | WhatsApp support target |
| `SENDER_NAME` | Optional | Email/SMS sender name |

Never commit real credentials to GitHub.
