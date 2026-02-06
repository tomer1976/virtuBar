# Phase 11 — WebXR / VR entry (UI + locomotion + performance tuning)

## Phase Number & Name
Phase 11 — WebXR / VR entry (UI + locomotion + performance tuning)

## Phase Goal (outcome-focused)
Enable entering VirtuBar in VR via WebXR with comfort-first locomotion, readable UI panels, and performance optimizations suitable for headset hardware.

## User Value Delivered
- VR users can join rooms, move comfortably (teleport default, snap turn option), and access core UI in-headset.
- Cross-platform parity improves: desktop/mobile users can coexist with VR users in the same rooms.

## In Scope
- WebXR session start/exit flow and VR-specific input bindings.
- Locomotion: teleport default; optional smooth locomotion with vignette; snap turning.
- VR UI adaptations: wrist menu for settings, diegetic panels for nearby list/profile card.
- Performance tuning for VR: reduced draw calls, texture budgets, and quality toggles.

## Out of Scope
- Hand tracking or full-body IK (not required this phase).
- Voice-specific VR UX (voice still mocked until Phase 12).
- Advanced VR interactions (grabbing objects) beyond navigation and UI selection.

## Dependencies / Preconditions
- 3D venue and realtime already functioning (Phases 2–10).
- Controls and HUD overlays exist for desktop/mobile; need VR adaptations.
- Quest or equivalent WebXR-capable device for testing.

## Feature Flags (added / removed / modified)
- Added: `ENABLE_WEBXR` (default false until validated), `VR_LOCOMOTION_MODE=teleport|smooth`, `VR_SNAP_TURN_DEG=30`, `VR_VIGNETTE_ENABLED=true`.

## Functional Requirements
- FR-01: Enter/exit WebXR session from UI; handle permission prompts and fallback if unsupported.
- FR-02: Teleport locomotion implemented and default; snap turn option with configurable angle; optional smooth locomotion with comfort vignette.
- FR-03: VR UI: wrist menu for settings; diegetic or floating panels for nearby list and profile card readable at VR distances.
- FR-04: Input mapping for VR controllers (teleport, snap turn, UI selection via laser/pointer).
- FR-05: Performance optimizations: reduce draw calls (instancing/culling), appropriate texture resolution, optional low-graphics VR preset.
- FR-06: HUD readability: text size, contrast, and panel placement suitable for VR; avoid excessive head movement for core actions.
- FR-07: Fallback to non-VR mode gracefully if WebXR not available or user exits session.

## Non-Functional Requirements
- Performance: Target ~72 fps on Quest; provide low-quality preset to maintain comfort.
- Accessibility/Comfort: Teleport default, snap turn, vignette for smooth locomotion; avoid motion sickness triggers.
- Responsiveness: UI interactions via controllers feel immediate; laser pointers align accurately with hit targets.
- Error handling: Clear messaging when WebXR unsupported or permission denied; safe fallback to 2D mode without crashing.

## Mock vs Real Data Matrix
| Area                  | Mocked | Real | Notes |
|-----------------------|:------:|:----:|-------|
| Auth/Rooms/Realtime   | ❌     | ✅   | Live stack |
| VR locomotion/UI      | ❌     | ✅   | Real WebXR mode |
| Voice                 | ✅     | ❌   | Still mocked this phase |
| Music                 | ❌     | ✅   | From Phase 10 |

## Acceptance Criteria
- Quest (or WebXR-capable) user can start XR session, teleport and snap turn, and interact with settings and nearby/profile panels in VR.
- Teleport is default; smooth locomotion only when explicitly enabled with vignette option.
- VR UI panels are legible and reachable; controller laser selection works reliably.
- Performance preset for VR maintains target frame rate in test scene; low-graphics option available.
- Exiting VR returns user to desktop/mobile view without errors.

## Demo Checklist
- Start WebXR session on headset; demonstrate teleport and snap turn.
- Open wrist menu and adjust a setting; verify change applies.
- Open nearby list/profile card panel and read content comfortably.
- Toggle low-graphics VR preset and observe performance improvement.
- Exit XR session and resume standard view smoothly.

## Exit Criteria (phase complete)
- VR entry and core locomotion/UI delivered with comfort defaults and performance tuning.
- Flags allow enabling/disabling WebXR and adjusting comfort settings.
- Ready for Phase 12 (Voice) with VR support in place.
