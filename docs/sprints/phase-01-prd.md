# Phase 1 — UI/UX completion with high-fidelity mocks (UI-only, mocked)

## Phase Number & Name
Phase 1 — UI/UX completion with high-fidelity mocks (UI-only, mocked)

## Phase Goal (outcome-focused)
Deliver a fully interactive, high-fidelity UI that mirrors the intended VirtuBar experience using robust mock data and simulated liveness, enabling stakeholder demos and usability feedback without backend or realtime dependencies.

## User Value Delivered
- Users can experience realistic flows (Landing → Login → Onboarding → Rooms → In-venue HUD) with believable occupancy, nearby users, and safety interactions, establishing confidence in UX before backend work.
- Provides product/design with a demo-quality prototype to validate interaction patterns, mobile ergonomics, and safety control discoverability.

## In Scope
- Completion of all screens and overlays per UI/UX spec with high-fidelity states.
- Mock liveness for rooms and nearby users (dynamic occupancy and proximity updates).
- Onboarding wizard (4 steps) wired to mock profile store.
- In-venue HUD overlays: room header, nearby list, chat panel simulation, profile card, safety menu, settings.
- Mobile-specific UI (joystick, controls UI) as non-functional visuals.
- State model and typed fake API modules backing mocks.

## Out of Scope
- Any real backend, auth, or persistence beyond local storage mocks.
- Actual 3D rendering, realtime networking, WebSockets, or voice.
- Moderation enforcement on server; analytics pipelines.

## Dependencies / Preconditions
- Phase 0 UI shell, routing, design tokens, and mock feature flags are in place.

## Feature Flags (added / removed / modified)
- Existing flags remain (default true): `USE_MOCK_AUTH`, `USE_MOCK_PROFILE`, `USE_MOCK_ROOMS`, `USE_MOCK_REALTIME`, `USE_MOCK_VOICE`.
- Optional: `USE_MOCK_LIVENESS` to toggle simulated occupancy/nearby updates.

## Functional Requirements
- FR-01: Onboarding wizard implements 4 steps: display name + age gate (optional UI), avatar preset picker, interest tags picker (min 5 enforced in UI), audio setup UI simulation with permission prompts mocked.
- FR-02: Rooms screen shows room cards with occupancy and theme filters and a “Join hottest room” CTA using mock data.
- FR-03: Mock data engine generates 20–60 fake users and 5–15 rooms with dynamic occupancy changes over time.
- FR-04: Nearby users panel updates periodically (distance-sorted) based on simulated movement.
- FR-05: Local chat panel shows bubbles and histories from mock events; sending a chat updates mock store and UI.
- FR-06: Profile card overlay shows display name, interest tags, shared interests highlighting, and safety actions (mute/block/report) reflected in mock state.
- FR-07: Safety menu allows mute/block/report actions that update mock state and UI badges immediately.
- FR-08: Settings panel exposes audio/graphics/controls toggles; persists locally and reflects state across sessions within mocks.
- FR-09: Mobile layout renders joystick controls UI (non-functional) and preserves primary actions accessibly.

## Non-Functional Requirements
- Performance: UI interactions remain responsive (<100ms UI updates) on modern desktop and mobile; no heavy 3D assets yet.
- Accessibility: Focus order and screen-reader labels on primary controls and modals; color not sole indicator for status/badges.
- Responsiveness: Layouts adapt cleanly at common breakpoints (mobile ≥360px width) for onboarding, rooms, and in-venue overlays.
- Error handling: Mock providers expose predictable error paths (e.g., simulated network failure) and render toasts/fallbacks without crashes.

## Mock vs Real Data Matrix
| Area                  | Mocked | Real | Notes |
|-----------------------|:------:|:----:|-------|
| Auth                  | ✅     | ❌   | Fake user identity persisted locally |
| Profile storage       | ✅     | ❌   | Local storage mock; onboarding writes/reads |
| Rooms directory       | ✅     | ❌   | Simulated rooms with occupancy + filters |
| Nearby presence       | ✅     | ❌   | Client-side simulated positions and proximity |
| Chat events           | ✅     | ❌   | Local mock timeline; no network |
| Safety actions        | ✅     | ❌   | Mock mute/block/report stored locally |
| Voice                 | ✅     | ❌   | UI-only; no audio |

## Acceptance Criteria
- Onboarding enforces minimum interest tags and progresses through all steps using mock data.
- Rooms list displays dynamic occupancy/theme filters; “Join hottest room” routes into a room context with updated mock occupants.
- Nearby users list updates periodically to reflect simulated proximity; profile card opens reliably from list or avatar click.
- Safety actions (mute/block/report) update UI state (badges, blocked indicator) immediately via mocks.
- Chat panel accepts input, displays outgoing messages, and shows mock incoming messages over time.
- Settings changes persist across reloads within the mock environment.
- Mobile layout verified for onboarding, rooms, and HUD overlays with joystick UI visible.

## Demo Checklist
- Walk through onboarding, enforcing tag minimum and showing avatar preset selection.
- Display rooms list with changing occupancy; use “Join hottest room” to enter a mocked bar context.
- Show nearby list updating; open profile card; demonstrate shared interest highlighting.
- Perform mute/block/report in UI and show badges/state changes.
- Send and receive mock chat messages; show chat bubbles in HUD.
- Toggle settings and reload to confirm persistence.
- Switch to mobile viewport to show joystick UI and responsive layout.

## Exit Criteria (phase complete)
- All functional requirements met using mocks only; no backend dependencies introduced.
- UI is demo-ready with believable liveness for rooms and nearby users.
- Feature flags remain default to mocks; `USE_MOCK_LIVENESS` documented if added.
- Docs updated to record Phase 1 completion and readiness for Phase 2 (3D venue MVP).
