# Phase 2 — 3D Venue MVP (client-only) + avatar rendering (still mocked data)

## Phase Number & Name
Phase 2 — 3D Venue MVP (client-only) + avatar rendering (still mocked data)

## Phase Goal (outcome-focused)
Introduce a performant 3D bar scene with player avatar rendering, desktop/mobile controls, and simulated NPC crowd, keeping all data mocked and client-only to validate visual fidelity and interaction feel before real realtime networking.

## User Value Delivered
- Users can see and control their avatar in a 3D venue, making the experience feel tangible and closer to the product vision.
- Simulated crowd and chat bubbles provide a lively atmosphere to test UX affordances and performance targets on desktop and mobile.

## In Scope
- 3D renderer integration (Three.js or Babylon.js) with GLTF bar scene.
- Player avatar rendering with basic rigs/animations.
- Controls: desktop (WASD + mouse look), mobile (joystick + look drag).
- Simulated crowd: spawn 10–30 NPC avatars with pathing/looping animations.
- 3D picking to open profile card overlay on avatar tap/click.
- Chat bubbles anchored above avatars (client-only, mock data).
- Performance tuning to hit target framerates (60fps desktop, 30fps mobile baseline for this phase).

## Out of Scope
- Real multiplayer networking or authoritative server state.
- Voice, WebXR/VR mode, or SFU integration.
- Persistence beyond local mocks.

## Dependencies / Preconditions
- Phase 1 UI/HUD overlays, mock data engines, and feature flags are available.
- Asset pipeline can load GLTF models from `public/models`.

## Feature Flags (added / removed / modified)
- Existing mocks remain (default true): `USE_MOCK_REALTIME`, `USE_MOCK_VOICE`, etc.
- Add: `USE_MOCK_3D_SCENE` (toggle scene assets/mock), `ENABLE_NPC_CROWD_SIM` (default true).

## Functional Requirements
- FR-01: Load 3D bar scene (GLTF) with lighting/shadows tuned for performance; graceful fallback if asset missing.
- FR-02: Render player avatar with idle/walk animations and orientation matching input.
- FR-03: Desktop controls support WASD + mouse look with adjustable sensitivity.
- FR-04: Mobile controls render joystick + look drag, moving the player avatar accordingly.
- FR-05: Spawn 10–30 NPC avatars with looping pathing; avoid collisions with player spawn area.
- FR-06: NPCs emit mock chat snippets periodically; chat bubbles render above avatars.
- FR-07: 3D picking enables tap/click on avatar to open profile card overlay (existing UI from Phase 1).
- FR-08: Maintain target framerates: desktop ~60fps, mobile ~30fps with simplified settings if needed.

## Non-Functional Requirements
- Performance: Frame pacing stable; avoid GC spikes; lightweight materials; limit draw calls.
- Accessibility: Provide mouse/keyboard remapping options where feasible; ensure UI overlays remain readable over 3D scene (contrast/shadowed panels).
- Responsiveness: Controls adapt to input modality (desktop vs mobile) without layout breakage.
- Error handling: Asset load failures show fallback UI/toast; scene still loads minimal ground plane if GLTF missing.

## Mock vs Real Data Matrix
| Area                    | Mocked | Real | Notes |
|-------------------------|:------:|:----:|-------|
| Auth/Profile            | ✅     | ❌   | Same mocks as Phase 1 |
| Rooms/Presence          | ✅     | ❌   | No real networking; local context only |
| Avatar transforms       | ✅     | ❌   | Client-authoritative; simulated NPCs |
| Chat bubbles            | ✅     | ❌   | Mock snippets from NPCs + user local input |
| 3D assets               | ✅     | ❌   | Local GLTF; no CDN yet |
| Voice                   | ✅     | ❌   | UI-only |

## Acceptance Criteria
- 3D scene loads with player avatar visible at spawn; controls move avatar smoothly on desktop and mobile.
- NPC crowd present (10–30) with visible movement/animations and occasional chat bubbles.
- Profile card opens via 3D picking on any avatar (player or NPC) and shows data from mock profile store.
- Frame rate targets are met on a mid-range desktop (60fps) and mobile (30fps) in test environments; optional “low graphics” toggle reduces load.
- If GLTF asset fails to load, fallback ground plane renders and UI remains functional with an error toast.

## Demo Checklist
- Load scene, move avatar with desktop controls; show animation transitions.
- Switch to mobile viewport, use joystick/look drag to move avatar.
- Observe NPCs walking and emitting chat bubbles; crowd density adjustable via flag.
- Click/tap an NPC to open profile card; verify overlay from existing HUD.
- Toggle low-graphics mode to demonstrate performance headroom.

## Exit Criteria (phase complete)
- 3D renderer, controls, NPC simulation, and picking are functional with mocks only.
- Performance targets achieved or documented with mitigation toggles.
- Feature flags for scene/crowd documented; defaults favor demo stability.
- Ready to integrate protocol-ready realtime simulation in Phase 3 without UI rewrites.
