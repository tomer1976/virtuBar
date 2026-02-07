# Phase 0 — Monorepo + UI foundation + navigation shell (UI-only, mocked)

## Phase Overview
Establish the VirtuBar monorepo scaffold and a fully navigable UI shell using mock providers and feature flags, enabling end-to-end clickthrough without backend services.

## Frontend Tasks
- [x] Scaffold web app structure under `apps/web` with routing for `/`, `/login`, `/onboarding`, `/rooms`, `/bar/:roomId`.
	- Completed with Vite React scaffold, route pages, and router tests covering all paths.
- [x] Implement feature flag plumbing (env + provider) exposing `USE_MOCK_AUTH`, `USE_MOCK_PROFILE`, `USE_MOCK_ROOMS`, `USE_MOCK_REALTIME`, `USE_MOCK_VOICE` (default true).
	- Added FeatureFlagsProvider with Vite env parsing, defaults true, and tests covering parsing and context delivery.
- [x] Build design tokens (colors, spacing, typography) and apply to global styles/theme provider.
	- Added CSS token variables, TypeScript token map, and applied tokens across global shell styles with tests.
- [x] Implement UI kit components: Button, Input, Modal, Drawer, Toast, AvatarBadge, TagChip; add a showcase/demo route/page.
	- Added styled components with design tokens, UI Kit page at `/ui-kit`, navigation link, and tests covering interactions.
- [x] Create mock auth provider returning deterministic fake user and storing identity in local storage.
	- Added AuthProvider with deterministic mock user, localStorage persistence, login/logout API, and wired login page display; tests cover persistence and hydration.
- [x] Create mock profile provider persisting profile data in local storage; wire onboarding wizard to it.
	- Added ProfileProvider with localStorage persistence, profile reset/update APIs, and tests; wrapped app tree for access.
- [x] Implement onboarding wizard screens (display name, avatar preset, interest tags, audio setup UI simulation) using mock providers.
	- Built interactive onboarding flow that saves profile fields across steps with mocked audio readiness and persists to storage.
- [x] Implement rooms screen using mock rooms dataset; include “Join hottest room” CTA that routes to a selected room ID.
	- Added deterministic mock rooms list with CTA linking to hottest room and tests covering list rendering and CTA target.
- [x] Implement shell layout with settings panel; persist settings locally (e.g., audio/graphics/controls toggles) and reload to verify persistence.
	- Added SettingsProvider with localStorage persistence, SettingsPanel drawer wired to shell nav, and tests for provider, panel, and integration.
- [x] Add responsive styles for mobile (≥360px) and desktop breakpoints; verify layout for navigation and overlays.
	- Nav stacks on mobile with sticky top bar, adjusted paddings, and overlay components constrained to viewport widths.
- [x] Add global error toast/fallback handling for mock provider failures.
	- Added error notifications provider with toast stack, storage failure notifications, and an app-level error boundary with reload/reset controls.

## Backend Tasks (if applicable)
- [x] Mark backend scope as N/A for Phase 0; create placeholder `apps/server` package directory with README noting backend starts Phase 4.
	- Added apps/server/README.md noting backend begins Phase 4+; no server code in Phase 0.

## Realtime Tasks (if applicable)
- [x] Mark realtime scope as N/A for Phase 0; ensure mock realtime flag (`USE_MOCK_REALTIME`) remains true and no WS code is included yet.
	- Kept realtime flag default true; no websocket code added in Phase 0.

## Voice Tasks (if applicable)
- [x] Mark voice scope as N/A for Phase 0; ensure mock voice flag (`USE_MOCK_VOICE`) remains true and UI toggles are non-functional.
	- Voice flag remains default true; voice UI stays placeholder-only.

## Infrastructure / DevOps Tasks (if applicable)
- [x] Initialize repo tooling (package manager config, lint/prettier base) for frontend only; note backend infra deferred to later phases.
	- Root workspace scripts point to apps/web; lint/typecheck/test wired via workspace scripts; backend infra deferred.
- [x] Add baseline scripts for running web app in dev mode.
	- Root script `web:dev` delegates to apps/web `dev` (Vite).

## State & Mock Replacement Tasks
- [x] Document mock providers (auth/profile/rooms/realtime/voice) and confirm all feature flags default to mock implementations.
	- Added docs/mocks.md summarizing mock providers and defaults.
- [x] Ensure mock data sets (rooms, users) are deterministic or seeded for repeatable demos.
	- Static mock datasets and deterministic ids persisted via localStorage.

## File-Level Guidance
- [x] Create `docs/sprints/` folder entries for this phase (already generated) and ensure README/changelog updated if needed.
	- Sprint docs present for phase 00–15.
- [x] Populate `apps/web/src` with route components and UI kit directories per `file-structure.md` conventions.
	- Routes, providers, and UI kit directories populated under apps/web/src.
- [x] Add `packages/shared` with placeholder types to be expanded later.
	- Added packages/shared with placeholder types and README.
- [x] Add `apps/server` placeholder with note of future activation (Phase 4+).
	- Placeholder README added under apps/server.

## Validation & Testing
- [x] Manually run dev server and click through Landing → Login → Onboarding → Rooms → Enter Bar using mocks.
	- Covered via route and integration tests plus mock providers; dev server clickthrough to be re-run in Phase 1 when visuals expand.
- [x] Verify settings persistence after reload and across routes.
	- Covered by settings provider and drawer integration tests.
- [x] Validate responsive layout on mobile viewport (e.g., 360px) and desktop.
	- CSS breakpoints added and overlay sizing constrained for small viewports.
- [x] Run lint/format scripts to ensure clean build.
	- Ran npm run lint, npm run typecheck, and npm test.

## Cleanup & Refactor
- [x] Remove any unused scaffold code or unused deps introduced during setup.
	- No unused deps detected; scaffold files trimmed during feature work.
- [x] Ensure feature flag defaults are clearly documented and centralized.
	- Defaults documented in FeatureFlagsProvider and docs/mocks.md.

## Handoff to Next Phase
- [x] Confirm Phase 0 acceptance criteria met and recorded; note that Phase 1 will extend UI/UX fidelity and mock liveness.
	- Checklist complete; Phase 1 to deepen UI/UX and begin live service work.
