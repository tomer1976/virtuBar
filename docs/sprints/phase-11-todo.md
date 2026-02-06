# Phase 11 — WebXR / VR entry (UI + locomotion + performance tuning)

## Phase Overview
Enable VR entry via WebXR with comfort locomotion, VR-friendly UI panels, and performance tuning for headset hardware.

## Frontend Tasks
- [ ] Add WebXR entry/exit UI control and feature flag `ENABLE_WEBXR` (default false until validated).
- [ ] Implement teleport locomotion as default for VR controllers; add snap turn with configurable angle (e.g., `VR_SNAP_TURN_DEG`).
- [ ] Optionally implement smooth locomotion with comfort vignette toggle.
- [ ] Map VR controller inputs: teleport, snap turn, UI laser/pointer selection.
- [ ] Implement wrist menu for settings and diegetic/floating panels for nearby list and profile card sized for VR legibility.
- [ ] Adjust UI typography/scale/contrast for VR readability; ensure panels stay within comfortable viewing distance.
- [ ] Add low-graphics VR preset (reduced shadows/post, lower texture resolution) toggleable in settings.
- [ ] Ensure exiting XR returns to flat mode cleanly and restores non-VR controls.

## Backend Tasks (if applicable)
- [ ] None specific; leverage existing auth/rooms/realtime stack.

## Realtime Tasks (if applicable)
- [ ] Ensure input/state flow remains compatible with WS provider; no protocol changes required.

## Voice Tasks (if applicable)
- [ ] None; voice stays mocked this phase.

## Infrastructure / DevOps Tasks (if applicable)
- [ ] Provide build targets/settings for WebXR-capable browsers (HTTPS, correct headers); ensure SSL/WSS for XR contexts.

## State & Mock Replacement Tasks
- [ ] Keep existing mocks only for voice; all movement/realtime remains real WS.

## File-Level Guidance
- [ ] Add XR entry handling in `apps/web/src/three` (SceneRoot or XR manager) and VR UI components under `.../ui/vr` or similar.
- [ ] Place locomotion controllers and input bindings under `.../three/input/vr`.
- [ ] Add comfort settings to global settings store and persist locally.

## Validation & Testing
- [ ] Manual on WebXR device (e.g., Quest): start XR session, teleport, snap turn; verify comfort options.
- [ ] Test wrist menu and panels for readability and interaction with laser pointer.
- [ ] Measure FPS with standard and low-graphics presets; confirm target performance.
- [ ] Verify exit from XR returns to flat mode without errors.

## Cleanup & Refactor
- [ ] Remove any placeholder VR UI from earlier phases; consolidate VR-specific styles and scales.
- [ ] Document VR input mappings and comfort defaults.

## Handoff to Next Phase
- [ ] Confirm VR entry and comfort locomotion stable; ready for Phase 12 (Voice) with VR-ready controls.
