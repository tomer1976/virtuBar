# Phase 0 — Monorepo + UI foundation + navigation shell (UI-only, mocked)

## Phase Number & Name
Phase 0 — Monorepo + UI foundation + navigation shell (UI-only, mocked)

## Phase Goal (outcome-focused)
Establish a runnable VirtuBar UI skeleton with routing, design tokens, and core UI kit components, backed entirely by mock data sources and feature flags so subsequent phases can iterate without backend dependencies.

## User Value Delivered
- Enables stakeholders to click through the end-to-end journey (Landing → Login → Onboarding → Rooms → Enter Bar) using polished UI states.
- Provides responsive design system and settings panel so early feedback can focus on UX quality and flow coherence before backend is ready.

## In Scope
- Monorepo scaffold with web app shell and placeholder server package.
- Routing for core screens: `/`, `/login`, `/onboarding`, `/rooms`, `/bar/:roomId`.
- UI kit components: Button, Input, Modal, Drawer, Toast, AvatarBadge, TagChip.
- Design tokens: typography, spacing, color system.
- Mock auth/profile/rooms/realtime/voice providers behind feature flags.
- Local settings panel with persistence (local storage).

## Out of Scope
- Real authentication or backend connectivity.
- Realtime networking, WebSockets, or WebRTC.
- 3D scene rendering or avatar movement.
- Music playback, moderation enforcement, or analytics pipelines.

## Dependencies / Preconditions
- None on backend services.
- Development environment capable of running React web app.

## Feature Flags (added / removed / modified)
- Added (default true): `USE_MOCK_AUTH`, `USE_MOCK_PROFILE`, `USE_MOCK_ROOMS`, `USE_MOCK_REALTIME`, `USE_MOCK_VOICE`.
- Added: global feature flag plumbing to switch providers at module level.

## Functional Requirements
- FR-01: User can navigate Landing → Login → Onboarding → Rooms → Enter Bar using mock routing and state.
- FR-02: UI kit components (Button, Input, Modal, Drawer, Toast, AvatarBadge, TagChip) are available and documented in-story/demo page.
- FR-03: Design tokens (colors, spacing, typography) are defined and applied across core screens.
- FR-04: Feature flag system exists and gates mock providers for auth, profile, rooms, realtime, voice.
- FR-05: Settings panel opens from shell, allows toggling local preferences, and persists locally.
- FR-06: Mock auth provider returns deterministic fake user identity for UI flows.
- FR-07: Mock profile provider stores profile data in local storage for session continuity within mocks.

## Non-Functional Requirements
- Performance: UI loads within 2 seconds on modern desktop; bundle kept minimal (no heavy 3D libs yet).
- Accessibility: Buttons/inputs support keyboard focus order; color contrast meets WCAG AA for primary text and buttons.
- Responsiveness: Layout adapts for desktop and mobile widths; navigation and panels remain usable at 360px width.
- Error handling: Mock providers surface predictable error states; global toast/fallback screen available for failures.

## Mock vs Real Data Matrix
| Area               | Mocked | Real | Notes |
|--------------------|:------:|:----:|-------|
| Auth               | ✅     | ❌   | Fake user via mock provider keyed by local storage |
| Profile            | ✅     | ❌   | Stored locally; survives reload for demo |
| Rooms list         | ✅     | ❌   | Static/dynamic mock data set |
| Realtime presence  | ✅     | ❌   | Simulated only for navigation states |
| Voice              | ✅     | ❌   | No media; UI toggles only |
| Settings storage   | ✅     | ❌   | Local storage |

## Acceptance Criteria
- End-to-end clickthrough works with mocks: Landing → Login → Onboarding → Rooms → Enter Bar.
- UI kit components present and consistent with design tokens; responsive on desktop and mobile.
- Settings panel opens and persists selections locally.
- Feature flags visible/configurable and default to mock implementations.
- App builds and runs in dev mode without backend services.

## Demo Checklist
- Show navigation through all routes using mock data.
- Toggle feature flags in UI or config and observe mock behavior remains stable.
- Open settings panel, change a preference, reload, and confirm it persists.
- Display UI kit component demo page to review tokens and components.

## Exit Criteria (phase complete)
- Monorepo structure exists with `apps/web`, `apps/server` placeholder, and `packages/shared` for types.
- All functional requirements are satisfied with mocks only.
- Feature flags implemented and default to mock providers.
- Documentation updated to note Phase 0 completion and readiness for Phase 1.
- App is runnable and demoable without backend connectivity.
