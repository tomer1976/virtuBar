# Phase 4 — Backend Foundation: Server skeleton + DB + Auth (replace mock auth)

## Phase Overview
Stand up the server, Postgres, and Google OAuth, replacing mock auth while keeping profile/rooms/realtime/voice mocked.

## Frontend Tasks
- [ ] Wire login button to real OAuth `/auth/google` flow; handle redirect and post-login state.
- [ ] Update auth state provider to consume real `/me` response and display user identity in header/profile chip.
- [ ] Keep `USE_MOCK_AUTH` flag support; ensure UI toggles between real and mock without breaking flows.
- [ ] Add user-facing error toasts for auth failure or logout issues.

## Backend Tasks (if applicable)
- [ ] Scaffold server app (NestJS or Fastify) under `apps/server` with module layout per `file-structure.md`.
- [ ] Add Postgres client and run initial migration creating `users` table (id, email, provider, provider_user_id, status, timestamps, last_login_at).
- [ ] Implement Google OAuth endpoints: `/auth/google`, `/auth/google/callback`, `/auth/logout` using server-side code exchange.
- [ ] Implement session/JWT strategy (HttpOnly cookies or access+refresh) and secure cookie settings for dev/stage.
- [ ] Add `/me` endpoint returning authenticated user identity.
- [ ] Add `/health` endpoint that checks DB connectivity.
- [ ] Log auth events (success/failure) with structured fields (requestId, userId if available).

## Realtime Tasks (if applicable)
- [ ] No realtime backend introduced; keep `USE_MOCK_REALTIME` true.

## Voice Tasks (if applicable)
- [ ] No voice backend; keep `USE_MOCK_VOICE` true.

## Infrastructure / DevOps Tasks (if applicable)
- [ ] Add env vars for `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `DATABASE_URL`, `JWT_SECRET` (or cookie key), callback URL.
- [ ] Add dev scripts to run server and apply migrations.
- [ ] Configure lint/format for server code.
- [ ] Optionally add docker-compose for Postgres for local dev.

## State & Mock Replacement Tasks
- [ ] Set default `USE_MOCK_AUTH=false` for real auth; document fallback to mock for demo safety.
- [ ] Ensure profile/rooms/realtime/voice remain mocked; do not call backend for them.

## File-Level Guidance
- [ ] Place auth module under `apps/server/src/modules/auth`; users module under `.../users`.
- [ ] Store Prisma (or ORM) schema in `apps/server/prisma/schema.prisma`; add migration files under `prisma/migrations`.
- [ ] Add shared types for user identity to `packages/shared/types` if consumed by frontend.

## Validation & Testing
- [ ] Run migrations against local Postgres; confirm `users` table created.
- [ ] End-to-end OAuth login in browser; verify `/me` returns identity.
- [ ] Toggle `USE_MOCK_AUTH=true` and confirm mock flow still works.
- [ ] Hit `/health` to ensure DB connectivity status is reported.

## Cleanup & Refactor
- [ ] Remove any temporary mock-auth wiring that conflicts with real auth path; keep mock path behind flag only.
- [ ] Document auth flow and feature flags for future phases.

## Handoff to Next Phase
- [ ] Confirm auth foundation is stable and documented; prerequisites met for Phase 5 (profile persistence using real DB/auth).
