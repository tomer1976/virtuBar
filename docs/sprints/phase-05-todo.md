# Phase 5 — Profiles: Persist onboarding & profile card data (replace mock profile)

## Phase Overview
Replace mock profile storage with real backend persistence, wiring onboarding and profile card to live data while leaving rooms/realtime/voice mocked.

## Frontend Tasks
- [ ] Update auth-aware data layer to call real `GET /me` (including profile) after login.
- [ ] Update onboarding wizard to submit `PUT /me/profile` and handle validation errors (display name length, interests count, etc.).
- [ ] Pre-fill onboarding fields from any existing mock/local profile and attempt migration save on completion.
- [ ] Update profile card to consume real profile data and compute shared interests locally if not returned by API.
- [ ] Add user-facing error handling/toasts for profile save/load failures.
- [ ] Keep `USE_MOCK_PROFILE` flag path working; ensure UI toggles cleanly between real and mock.

## Backend Tasks (if applicable)
- [ ] Add `profiles` table via migration with fields: user_id (pk/fk users.id), display_name, avatar_id, avatar_config (jsonb), interests (text[]), privacy_level, created_at, updated_at.
- [ ] Implement `GET /me` to include profile data (nullable if not created) with user identity.
- [ ] Implement `PUT /me/profile` with validation: display name length 3–20, interests max 20, avatar config JSON validation, privacy_level allowed values.
- [ ] Implement display name uniqueness strategy (suffix or similar) and return final display name in response.
- [ ] Update `/me` to set/update last_login_at on successful auth (if not already).

## Realtime Tasks (if applicable)
- [ ] None; keep realtime mocked.

## Voice Tasks (if applicable)
- [ ] None; voice remains mocked.

## Infrastructure / DevOps Tasks (if applicable)
- [ ] Run migrations against dev database; ensure rollback plan exists.
- [ ] Add environment validation for DB URL and any new config needed for profile module.

## State & Mock Replacement Tasks
- [ ] Set `USE_MOCK_PROFILE=false` by default for real profile; document mock fallback for demos.
- [ ] Remove or bypass local-storage-only profile writes when real mode is active; keep read for prefill/migration only.

## File-Level Guidance
- [ ] Place profile service/controller under `apps/server/src/modules/profiles` (or `users/profiles`).
- [ ] Add shared types/Zod schemas for profile payloads to `packages/shared` for reuse on client/server.
- [ ] Store migration under `apps/server/prisma/migrations` (or ORM equivalent) updating `schema.prisma`.

## Validation & Testing
- [ ] Create new user, complete onboarding, reload, and verify profile persists via `GET /me`.
- [ ] Attempt display name collision; verify server returns adjusted name and client displays it.
- [ ] Validate interests count enforcement (client min 5, server max 20) and error messaging.
- [ ] Confirm mock profile mode still functions when flag enabled.

## Cleanup & Refactor
- [ ] Remove obsolete mock profile persistence paths when real mode is active; centralize storage keys if still used for migration/prefill.
- [ ] Document API contract and validation rules for future phases.

## Handoff to Next Phase
- [ ] Confirm stable profile persistence and collision handling; prerequisites ready for Phase 6 (rooms directory + join tokens).
