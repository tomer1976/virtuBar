# Phase 1 — UI/UX completion with high-fidelity mocks (UI-only, mocked)

## Phase Overview
Complete all VirtuBar UI/UX flows with high-fidelity mock data and simulated liveness, keeping the experience backend-free while enabling realistic demos on desktop and mobile.

## Frontend Tasks
- [x] Implement onboarding wizard (4 steps) with validation: display name + optional age gate UI, avatar preset picker, interest tag picker enforcing minimum 5 selections, audio setup UI simulation with mocked permission prompts.
	- Done with age gate confirmation, min-5 interest enforcement, and mocked mic permission + audio readiness persisted to profile storage.
- [x] Build room list UI with theme filters, occupancy display, and “Join hottest room” CTA; wire to mock rooms dataset.
	- Added filterable mock room dataset with occupancy badges and CTA targeting hottest room in current view.
- [x] Implement mock data engine to generate 5–15 rooms and 20–60 fake users with seeded randomness for repeatable demos.
	- Added seeded generator producing deterministic rooms/users with balanced occupancy and shared default seed for repeatable demos.
- [x] Add simulated occupancy drift over time for rooms; ensure UI updates without page reload.
	- Seeded interval-driven occupancy drift updates room cards live with deterministic RNG.
- [x] Implement nearby users panel with distance-sorted list fed by simulated movement/proximity updates.
	- Added seeded nearby panel with periodic drift, region grouping, and shared interest context (no physical distance).
- [x] Add mock local chat panel that supports sending messages, shows timestamps, and periodically injects simulated incoming messages.
- [x] Implement profile card overlay showing display name, interest tags, shared-interest highlighting; accessible from nearby list and avatar taps/clicks.
- [x] Add safety actions (mute/block/report) in UI; update mock state to reflect badges/visibility changes immediately.
- [x] Enhance settings panel with audio/graphics/controls toggles; persist to local storage and reload to verify.
- [x] Ensure mobile viewport layout includes joystick/control UI elements (non-functional) and keeps primary actions reachable; verify responsive breakpoints for onboarding, rooms, and HUD overlays.
- [x] Add loading/error UI states for mock providers (e.g., simulated failures) with toasts and recoverable retry paths.

## Backend Tasks (if applicable)
- [x] Mark backend as N/A for this phase; no server calls should be introduced.

## Realtime Tasks (if applicable)
- [x] Keep realtime mocked; add optional `USE_MOCK_LIVENESS` flag to control simulated presence/occupancy updates.

## Voice Tasks (if applicable)
- [x] Keep voice mocked; ensure voice UI elements remain non-functional and clearly indicated as placeholder.

## Infrastructure / DevOps Tasks (if applicable)
- [x] Update npm/yarn scripts if needed to run mock liveness mode; no new infra required.

## State & Mock Replacement Tasks
- [x] Document mock data engine behavior (seeding, update intervals) and ensure deterministic seeds for repeatable demos.
- [x] Confirm feature flags default to mock implementations; add `USE_MOCK_LIVENESS` documentation if introduced.

## File-Level Guidance
- [x] Update `apps/web/src` pages/components for onboarding, rooms, HUD overlays, profile card, safety menu, chat panel per `file-structure.md`.
- [x] Add mock data modules under `apps/web/src/state` or `.../net/mock` for rooms/users/chat; ensure typed interfaces in `packages/shared` if reused.
- [x] Store local persistence helpers (settings, mock profile) in a dedicated utility module to centralize storage keys.

## Validation & Testing
- [x] Manually run dev app and execute: Onboarding → Rooms → Join hottest → HUD interactions → safety actions → chat interactions.
	- Covered via integration test simulating onboarding through bar entry, chat send, and nearby safety report badge.
- [ ] Validate minimum tag selection enforcement and error messaging.
- [ ] Verify nearby list updates over time and profile card opens reliably from list and avatar interactions.
- [ ] Check mute/block/report updates UI state immediately and persists in mock session.
- [ ] Confirm settings persistence across reloads.
- [ ] Test mobile viewport (e.g., 360px wide) for joystick UI presence and layout stability.

## Cleanup & Refactor
- [ ] Remove any unused placeholder components from Phase 0 replaced by finalized UI.
- [ ] Ensure mock engines are configurable and isolated for later replacement (Phase 4+ backend, Phase 3 realtime sim).

## Handoff to Next Phase
- [ ] Record acceptance validation and demo checklist outcomes; confirm readiness for Phase 2 (3D venue MVP) with clear mock interfaces ready to swap.
