# Phase 5 — Profiles: Persist onboarding & profile card data (replace mock profile)

## Phase Number & Name
Phase 5 — Profiles: Persist onboarding & profile card data (replace mock profile)

## Phase Goal (outcome-focused)
Replace mock profile storage with a real backend service and DB persistence so onboarding data and profile cards load consistently across sessions and devices, while keeping rooms/realtime/voice mocked.

## User Value Delivered
- Users’ display names, avatar presets/config, and interests persist after login and across devices.
- Profile cards show real saved data, enabling authentic identity representation ahead of realtime multiplayer.

## In Scope
- Backend profile service with DB schema `profiles`.
- Endpoints: `GET /me` (with profile), `PUT /me/profile` with validation.
- Frontend onboarding wizard calling real endpoints; profile card reading real data.
- Shared interest computation (client or server) using saved tags.
- Migration strategy for existing mock/local profile to real profile on first save (best-effort).

## Out of Scope
- Realtime/rooms/voice remain mocked.
- Social graph, friends, or invites.
- Avatar cosmetics shop/inventory.

## Dependencies / Preconditions
- Phase 4 real auth + users table available.
- Postgres connection and migrations pipeline in place.

## Feature Flags (added / removed / modified)
- Modified: `USE_MOCK_PROFILE` (default false after this phase; mock fallback allowed).

## Functional Requirements
- FR-01: DB schema `profiles` with fields: user_id (pk/fk), display_name, avatar_id, avatar_config (json), interests (text array), privacy_level, created_at, updated_at.
- FR-02: `GET /me` returns user identity plus profile (nullable until created) or sensible defaults.
- FR-03: `PUT /me/profile` validates display name length (3–20), interests count (max 20; require min 5 on client), and stores avatar config.
- FR-04: Display name uniqueness strategy: allow suffixing if collision (server-resolved); respond with final name.
- FR-05: Frontend onboarding wizard saves profile via real API and reloads profile on success; retries with error toasts on failure.
- FR-06: Profile card reads real profile data and computes shared interests locally or via response field.
- FR-07: Migration: if mock/local profile exists, prefill onboarding fields and attempt first real save when user completes wizard.

## Non-Functional Requirements
- Performance: Profile fetch/save under typical API latency (<500ms in dev); avoid blocking UI.
- Accessibility: Form fields have labels, errors are announced; profile card remains keyboard accessible.
- Responsiveness: Onboarding and profile card layouts remain functional on mobile.
- Error handling: Validation errors return structured responses; frontend surfaces inline errors and toasts.

## Mock vs Real Data Matrix
| Area              | Mocked | Real | Notes |
|-------------------|:------:|:----:|-------|
| Auth              | ❌     | ✅   | Real from Phase 4 |
| Profile storage   | ❌     | ✅   | DB-backed; mock fallback via flag |
| Rooms             | ✅     | ❌   | Still mock |
| Realtime          | ✅     | ❌   | Simulation only |
| Voice             | ✅     | ❌   | UI-only |

## Acceptance Criteria
- After login, `GET /me` returns profile data when present; empty/placeholder when not.
- Completing onboarding saves profile via `PUT /me/profile`; refresh shows persisted data.
- Profile card displays saved display name, avatar preset/config, and interest tags; shared-interest highlighting works with saved tags.
- Display name collision handled gracefully with server-adjusted name returned and shown.
- `USE_MOCK_PROFILE=true` still allows mock flow for demos.

## Demo Checklist
- Login with real auth; load `/me` showing missing profile, then complete onboarding.
- Save profile; reload page to confirm persistence.
- Open profile card to show real tags and shared-interest highlight.
- Attempt display name already taken to show collision resolution.
- Toggle `USE_MOCK_PROFILE=true` and show mock behavior still works.

## Exit Criteria (phase complete)
- Real profile persistence live; onboarding and profile card use backend data.
- Validation rules enforced; collision strategy implemented.
- Mock profile fallback remains available via flag.
- Ready for Phase 6 (rooms directory + join tokens) on top of real auth/profile.
