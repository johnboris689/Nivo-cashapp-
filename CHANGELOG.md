# Nevo Changelog

## Current release — KoraPay-only wallet and database cleanup

- KoraPay is now the only payment provider.
- Every deposit creates a fresh KoraPay hosted checkout session.
- Removed legacy payment-provider integrations and configuration.
- Added KoraPay webhook signature validation and direct transaction verification.
- Added duplicate-payment protection for wallet credits.
- Added transaction eligibility enforcement: 5 successful referrals + verified ₦520 minimum deposit.
- Set minimum withdrawal to ₦5,000.
- Removed legacy welcome-capital messaging and daily balance reset behavior.
- Added a one-time registration welcome screen.
- Reworked the live activity ticker to display real completed database activity instead of hardcoded claims.
- Added profile-picture upload and database persistence.
- Added a dedicated `nevo` PostgreSQL schema for production data.
- Removed demo user/admin seeding.
- Updated project documentation and environment configuration for Nevo.
