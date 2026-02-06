# security-privacy.md

# VirtuBar — Security & Privacy

Version: 1.0  
Last Updated: 2026-02-06

## 1. Security Goals
- Protect user identity and prevent account takeover
- Prevent abuse/spam in realtime channels
- Ensure safe voice/media signaling and transport

## 2. Authentication
- OAuth (Google) with server-side code exchange
- Session cookies (HttpOnly, Secure, SameSite=Lax) or JWT
- Refresh tokens rotated and stored securely

## 3. Authorization
- API:
  - user must be authenticated
- Realtime:
  - token is room-scoped and short-lived
  - blocks enforced on join/matchmaking

## 4. Transport Security
- HTTPS/WSS only
- HSTS enabled
- TURN over TLS

## 5. Privacy Principles
- Minimize stored personal info:
  - display name, interests (tags), avatar config
- Interests are user-provided tags (MVP), not scraped.
- Voice:
  - not recorded by default
  - optional moderation evidence upload is explicit and user-consented

## 6. Abuse Protections
- WS rate limiting by event type
- Spam protection (chat cooldown)
- Blocklist:
  - prevents being placed in same room (matchmaking)
- Report pipeline:
  - reports stored with metadata

## 7. Data Retention
- Accounts: until deletion
- Reports: retain 12–24 months (configurable)
- Room session analytics: aggregate after 30 days

