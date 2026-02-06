# Phase 0 — Monorepo + UI foundation + navigation shell (UI-only, mocked)

## Phase Overview
Establish the VirtuBar monorepo scaffold and a fully navigable UI shell using mock providers and feature flags, enabling end-to-end clickthrough without backend services.

## Frontend Tasks
- [x] Scaffold web app structure under `apps/web` with routing for `/`, `/login`, `/onboarding`, `/rooms`, `/bar/:roomId`.
	- Completed with Vite React scaffold, route pages, and router tests covering all paths.
- [ ] Implement feature flag plumbing (env + provider) exposing `USE_MOCK_AUTH`, `USE_MOCK_PROFILE`, `USE_MOCK_ROOMS`, `USE_MOCK_REALTIME`, `USE_MOCK_VOICE` (default true).
- [ ] Build design tokens (colors, spacing, typography) and apply to global styles/theme provider.
- [ ] Implement UI kit components: Button, Input, Modal, Drawer, Toast, AvatarBadge, TagChip; add a showcase/demo route/page.
- [ ] Create mock auth provider returning deterministic fake user and storing identity in local storage.
- [ ] Create mock profile provider persisting profile data in local storage; wire onboarding wizard to it.
- [ ] Implement onboarding wizard screens (display name, avatar preset, interest tags, audio setup UI simulation) using mock providers.
- [ ] Implement rooms screen using mock rooms dataset; include “Join hottest room” CTA that routes to a selected room ID.
- [ ] Implement shell layout with settings panel; persist settings locally (e.g., audio/graphics/controls toggles) and reload to verify persistence.
- [ ] Add responsive styles for mobile (≥360px) and desktop breakpoints; verify layout for navigation and overlays.
- [ ] Add global error toast/fallback handling for mock provider failures.

## Backend Tasks (if applicable)
- [ ] Mark backend scope as N/A for Phase 0; create placeholder `apps/server` package directory with README noting backend starts Phase 4.

## Realtime Tasks (if applicable)
- [ ] Mark realtime scope as N/A for Phase 0; ensure mock realtime flag (`USE_MOCK_REALTIME`) remains true and no WS code is included yet.

## Voice Tasks (if applicable)
- [ ] Mark voice scope as N/A for Phase 0; ensure mock voice flag (`USE_MOCK_VOICE`) remains true and UI toggles are non-functional.

## Infrastructure / DevOps Tasks (if applicable)
- [ ] Initialize repo tooling (package manager config, lint/prettier base) for frontend only; note backend infra deferred to later phases.
- [ ] Add baseline scripts for running web app in dev mode.

## State & Mock Replacement Tasks
- [ ] Document mock providers (auth/profile/rooms/realtime/voice) and confirm all feature flags default to mock implementations.
- [ ] Ensure mock data sets (rooms, users) are deterministic or seeded for repeatable demos.

## File-Level Guidance
- [ ] Create `docs/sprints/` folder entries for this phase (already generated) and ensure README/changelog updated if needed.
- [ ] Populate `apps/web/src` with route components and UI kit directories per `file-structure.md` conventions.
- [ ] Add `packages/shared` with placeholder types to be expanded later.
- [ ] Add `apps/server` placeholder with note of future activation (Phase 4+).

## Validation & Testing
- [ ] Manually run dev server and click through Landing → Login → Onboarding → Rooms → Enter Bar using mocks.
- [ ] Verify settings persistence after reload and across routes.
- [ ] Validate responsive layout on mobile viewport (e.g., 360px) and desktop.
- [ ] Run lint/format scripts to ensure clean build.

## Cleanup & Refactor
- [ ] Remove any unused scaffold code or unused deps introduced during setup.
- [ ] Ensure feature flag defaults are clearly documented and centralized.

## Handoff to Next Phase
- [ ] Confirm Phase 0 acceptance criteria met and recorded; note that Phase 1 will extend UI/UX fidelity and mock liveness.
