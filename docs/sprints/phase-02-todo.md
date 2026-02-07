# Phase 2 — 3D Venue MVP (client-only) + avatar rendering (still mocked data)

## Phase Overview
Integrate a 3D bar scene with player avatar rendering, desktop/mobile controls, NPC crowd simulation, and mock chat bubbles, all client-only with performance tuned for demo targets.

## Frontend Tasks
- [x] Integrate Three.js or Babylon.js renderer into `apps/web/src/three` with scene root component.
	- Completed: Added Three.js-based `SceneRoot` with fallback-safe mount, styling, and unit tests.
- [x] Load GLTF bar scene from `public/models`; add fallback ground plane if asset load fails.
	- Completed: SceneRoot attempts to load `/models/bar.glb` with graceful fallback overlay when unavailable.
- [x] Implement lighting preset (key/fill/ambient) tuned for performance; add shadow toggle for low/med quality modes.
	- Completed: Quality-aware lighting presets with shadows disabled on low and pixel ratio tuned by graphics setting.
- [x] Implement player avatar rendering with idle/walk animations; hook to input-driven velocity.
- [x] Add desktop controls: WASD + mouse look with sensitivity setting; clamp pitch to avoid gimbal lock.
- [x] Add mobile controls: joystick + look drag; ensure UI placement doesn’t conflict with HUD overlays.
- [x] Implement NPC crowd spawner (10–30) with seeded randomness; simple pathing loops and idle/walk animations.
	- Completed: Seeded NPC spawn counts by quality with idle/walk loops driven by deterministic sim.
- [x] Emit periodic mock chat snippets from NPCs; render chat bubbles anchored above avatars.
	- Completed: Seeded NPC chat emitter with anchored HUD bubbles above NPC heads.
- [x] Implement 3D picking (raycast) to open profile card overlay on avatar tap/click; reuse Phase 1 profile UI.
	- Completed: Raycast selection on NPCs triggers ProfileCard overlay using seeded nearby profiles.
- [x] Add low-graphics mode toggle (disables shadows/reduces post-processing) exposed via settings panel.
	- Completed: Settings toggle disables shadows and clamps pixel ratio for perf.
- [x] Ensure frame pacing and render loop are decoupled from UI thread; avoid unnecessary React re-renders.
	- Completed: Render loop runs via renderer animation loop/rAF outside React state updates.

## Backend Tasks (if applicable)
- [x] Mark backend as N/A; no network calls introduced.
	- Completed: Frontend remains client-only with mocks; no backend added in Phase 2.

## Realtime Tasks (if applicable)
- [x] Keep realtime mocked; no sockets. Ensure avatar/NPC transforms remain client-authoritative.
	- Completed: No socket use added; transforms simulated locally.

## Voice Tasks (if applicable)
- [x] Voice remains mocked; confirm voice UI remains disabled/non-functional in this phase.
	- Completed: No voice plumbing added; UI remains placeholder only.

## Infrastructure / DevOps Tasks (if applicable)
- [x] Add build step to copy GLTF assets into `public/models`; ensure dev server serves them correctly.
	- Completed: `predev`/`prebuild` run `scripts/copy-models.js` (no-op if assets missing) into `public/models`.
- [x] Optional: add bundle analyzer to watch for 3D lib size regressions.
	- Completed: `npm run web:analyze` generates `stats/bundle.html` via rollup visualizer.

## State & Mock Replacement Tasks
- [x] Introduce `USE_MOCK_3D_SCENE` and `ENABLE_NPC_CROWD_SIM` flags; default to enabled for demos.
	- Completed: Feature flags wired to SceneRoot to toggle scene load and NPC sim.
- [x] Keep existing mock providers for auth/profile/rooms; wire scene to use their data for avatar names/interests when opening profile cards.
	- Completed: Scene uses seeded `generateNearbyUsers` data for NPC profile overlays.

## File-Level Guidance
- [x] Place renderer/scene code under `apps/web/src/three` (SceneRoot, loaders, input controllers).
	- Completed: SceneRoot, sim, input live under `apps/web/src/three`.
- [x] Store NPC simulation logic under `apps/web/src/three/sim` or similar; keep pure and deterministic with seed.
	- Completed: Added `sim/npcSim.ts` with RNG, state generation, and stepping helpers.
- [x] Keep chat bubble UI anchored via a small bridge component between 3D world positions and HUD overlay.
	- Completed: NPC chat bubbles projected to HUD overlay layer.

## Validation & Testing
- [x] Manually test desktop controls for smooth movement and animation transitions.
	- Desktop: 1080p, mouse-look + WASD; verify pitch clamp and idle/walk blend stays smooth at stop/start.
	- Completed: Arrow keys no longer scroll and avatars stay grounded while moving.
- [x] Manually test mobile viewport for joystick/look drag and HUD coexistence.
	- Use devtools device emulation (~390px wide); ensure joystick + look drag work and overlays avoid chat/profile HUD.
	- Completed: Joystick overlay drives mobile move/look refs without layout blockers (automated test coverage).
- [ ] Measure FPS on mid-range desktop; enable low-graphics mode and confirm uplift.
	- Capture FPS in Chrome perf overlay; compare default vs low graphics to confirm uplift and no visual regressions (shadows/pixel ratio).
- [ ] Trigger GLTF load failure (rename file) to verify fallback plane and error toast.
	- Temporarily rename `public/models/bar.glb` (or block network) and confirm fallback ground + toast message, then restore asset.
- [ ] Click/tap avatars (player + NPC) to open profile card and confirm correct data renders from mock profile store.
	- Validate profile name/interests match mock nearby provider; ensure selection raycast works on NPC crowd and player avatar.

## Cleanup & Refactor
- [ ] Remove any placeholder 2D-only stubs superseded by the 3D canvas container.
	- Strip legacy 2D canvas/overlay scaffolding if still present and confirm styles/layout favor the 3D mount container.
- [x] Document performance knobs (shadow toggle, NPC count) for demo stability.
	- Completed: Added Phase 2 client perf knobs to architecture doc.

## Handoff to Next Phase
- [ ] Document readiness for Phase 3 (protocol-ready realtime simulation) with clear interfaces for swapping local sim to injectable realtime provider.
	- Capture handoff notes: API surface for injecting realtime transforms/chat, ownership rules (client-authoritative vs server), and how to disable mocks/flags when wiring sockets.
