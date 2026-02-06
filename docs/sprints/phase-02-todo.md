# Phase 2 — 3D Venue MVP (client-only) + avatar rendering (still mocked data)

## Phase Overview
Integrate a 3D bar scene with player avatar rendering, desktop/mobile controls, NPC crowd simulation, and mock chat bubbles, all client-only with performance tuned for demo targets.

## Frontend Tasks
- [ ] Integrate Three.js or Babylon.js renderer into `apps/web/src/three` with scene root component.
- [ ] Load GLTF bar scene from `public/models`; add fallback ground plane if asset load fails.
- [ ] Implement lighting preset (key/fill/ambient) tuned for performance; add shadow toggle for low/med quality modes.
- [ ] Implement player avatar rendering with idle/walk animations; hook to input-driven velocity.
- [ ] Add desktop controls: WASD + mouse look with sensitivity setting; clamp pitch to avoid gimbal lock.
- [ ] Add mobile controls: joystick + look drag; ensure UI placement doesn’t conflict with HUD overlays.
- [ ] Implement NPC crowd spawner (10–30) with seeded randomness; simple pathing loops and idle/walk animations.
- [ ] Emit periodic mock chat snippets from NPCs; render chat bubbles anchored above avatars.
- [ ] Implement 3D picking (raycast) to open profile card overlay on avatar tap/click; reuse Phase 1 profile UI.
- [ ] Add low-graphics mode toggle (disables shadows/reduces post-processing) exposed via settings panel.
- [ ] Ensure frame pacing and render loop are decoupled from UI thread; avoid unnecessary React re-renders.

## Backend Tasks (if applicable)
- [ ] Mark backend as N/A; no network calls introduced.

## Realtime Tasks (if applicable)
- [ ] Keep realtime mocked; no sockets. Ensure avatar/NPC transforms remain client-authoritative.

## Voice Tasks (if applicable)
- [ ] Voice remains mocked; confirm voice UI remains disabled/non-functional in this phase.

## Infrastructure / DevOps Tasks (if applicable)
- [ ] Add build step to copy GLTF assets into `public/models`; ensure dev server serves them correctly.
- [ ] Optional: add bundle analyzer to watch for 3D lib size regressions.

## State & Mock Replacement Tasks
- [ ] Introduce `USE_MOCK_3D_SCENE` and `ENABLE_NPC_CROWD_SIM` flags; default to enabled for demos.
- [ ] Keep existing mock providers for auth/profile/rooms; wire scene to use their data for avatar names/interests when opening profile cards.

## File-Level Guidance
- [ ] Place renderer/scene code under `apps/web/src/three` (SceneRoot, loaders, input controllers).
- [ ] Store NPC simulation logic under `apps/web/src/three/sim` or similar; keep pure and deterministic with seed.
- [ ] Keep chat bubble UI anchored via a small bridge component between 3D world positions and HUD overlay.

## Validation & Testing
- [ ] Manually test desktop controls for smooth movement and animation transitions.
- [ ] Manually test mobile viewport for joystick/look drag and HUD coexistence.
- [ ] Measure FPS on mid-range desktop; enable low-graphics mode and confirm uplift.
- [ ] Trigger GLTF load failure (rename file) to verify fallback plane and error toast.
- [ ] Click/tap avatars (player + NPC) to open profile card and confirm correct data renders from mock profile store.

## Cleanup & Refactor
- [ ] Remove any placeholder 2D-only stubs superseded by the 3D canvas container.
- [ ] Document performance knobs (shadow toggle, NPC count) for demo stability.

## Handoff to Next Phase
- [ ] Document readiness for Phase 3 (protocol-ready realtime simulation) with clear interfaces for swapping local sim to injectable realtime provider.
