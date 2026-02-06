# Phase 4 — Backend Foundation: Server skeleton + DB + Auth (replace mock auth)

## Phase Number & Name
Phase 4 — Backend Foundation: Server skeleton + DB + Auth (replace mock auth)

## Phase Goal (outcome-focused)
Establish the first real backend slice with a runnable server, Postgres connectivity, and Google OAuth so the product moves from mock identities to real authenticated users without breaking existing UI flows.

## User Value Delivered
- Users can sign in with real Google accounts and see their authenticated identity reflected in the UI.
- The project gains a production-ready foundation (server + DB) to persist user accounts and enable subsequent profile/rooms features.

## In Scope
- Server framework setup (NestJS or Fastify) with basic module layout.
- Postgres connection and initial migrations (users table minimal footprint).
- Google OAuth endpoints: `/auth/google`, `/auth/google/callback`, `/auth/logout`.
- Session/JWT strategy (HttpOnly cookies or access+refresh tokens) and `/me` endpoint returning authenticated user identity.
- Frontend login flow wired to real OAuth; mock profile/rooms/realtime/voice remain.
- Feature flag toggle to fall back to mock auth if needed.

## Out of Scope
- Profile persistence (remains mocked).
- Rooms directory, realtime WebSocket, voice, or moderation enforcement.
- Analytics, music, or inventory systems.

## Dependencies / Preconditions
- Phase 0–3 UI, mocks, and feature flags in place.
- Environment variables available for Google OAuth and database URL.

## Feature Flags (added / removed / modified)
- Modified: `USE_MOCK_AUTH` (default false for real auth in this phase; fallback allowed for demos).
- Added: `AUTH_SESSION_MODE` (e.g., `cookies` | `jwt`), `REAL_AUTH_PROVIDER=google`.

## Functional Requirements
- FR-01: Server boots with Postgres connection and runs migrations for `users` (minimal auth identity fields).
- FR-02: OAuth endpoints (`/auth/google`, `/auth/google/callback`, `/auth/logout`) complete login/logout flow.
- FR-03: Session/JWT tokens are issued with secure settings (HttpOnly cookies or access+refresh pair) in dev/stage.
- FR-04: `/me` returns authenticated user identity (id, email if available, created_at/last_login_at).
- FR-05: Frontend login button initiates real OAuth and reflects logged-in user in header/profile chip.
- FR-06: Feature flag `USE_MOCK_AUTH` toggles between mock and real auth without UI changes.
- FR-07: Basic health check endpoint (`/health`) indicates DB connectivity.

## Non-Functional Requirements
- Performance: Auth round-trip completes within typical OAuth latency; server startup under a few seconds in dev.
- Accessibility: Login UI remains keyboard-navigable; error toasts readable.
- Responsiveness: Login button and redirects work on desktop and mobile browsers.
- Error handling: Clear errors for OAuth failure, missing env vars, or DB connectivity; frontend shows toast/fallback.

## Mock vs Real Data Matrix
| Area           | Mocked | Real | Notes |
|----------------|:------:|:----:|-------|
| Auth           | ❌     | ✅   | Google OAuth replaces mock when flag disabled |
| Profile data   | ✅     | ❌   | Still mock/local storage |
| Rooms          | ✅     | ❌   | Mock rooms continue |
| Realtime       | ✅     | ❌   | Simulation only |
| Voice          | ✅     | ❌   | UI-only |
| DB             | ❌     | ✅   | Postgres for users table |

## Acceptance Criteria
- Real Google sign-in works in dev; user can log in and out.
- `/me` returns authenticated user identity when logged in and rejects when not.
- Frontend displays logged-in user info; fallback to mock auth still works via flag.
- Health check shows DB connectivity; migrations succeed on setup.

## Demo Checklist
- Trigger Google OAuth from UI, complete login, show identity in header/profile chip.
- Call `/me` (via dev tools or UI) to show authenticated payload.
- Toggle `USE_MOCK_AUTH=true` to demonstrate mock fallback without code changes.
- Show `/health` returning healthy status with DB connected.

## Exit Criteria (phase complete)
- Server skeleton, DB connection, OAuth flow, and `/me` endpoint shipped and verified.
- Feature flag defaults to real auth; mock fallback documented.
- UI works end-to-end with real auth and unchanged for other mocked modules.
- Ready to proceed to Phase 5 (real profiles) using established auth + DB foundation.
