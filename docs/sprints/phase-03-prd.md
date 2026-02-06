# Phase 3 — Protocol-ready realtime simulation (client-only, backend-compatible)

## Phase Number & Name
Phase 3 — Protocol-ready realtime simulation (client-only, backend-compatible)

## Phase Goal (outcome-focused)
Implement the realtime protocol end-to-end in client code with an in-memory simulation engine so that swapping to a real WebSocket backend later requires only provider injection, not UI rewrites.

## User Value Delivered
- Users can experience believable multi-user presence locally (multiple tabs/devices) with smooth movement and chat, demonstrating UX readiness for true multiplayer.
- Engineering de-risks backend integration by validating message schemas, rate limits, and smoothing logic ahead of server delivery.

## In Scope
- Define `RealtimeProvider` interface (connect, joinRoom/leaveRoom, sendTransform, sendChat, sendEmote, subscribe to events).
- In-memory simulation engine emitting room events (`member_joined`, `avatar_transform_broadcast`, `chat_broadcast`).
- Client-side smoothing (interpolation buffers, snap thresholds).
- Rate limiting and validation consistent with `realtime-protocol.md`.
- Support multiple local identities (e.g., per-tab) to simulate separate users.

## Out of Scope
- Actual backend WebSocket server or Redis presence.
- Voice, SFU, TURN, or media handling.

## Dependencies / Preconditions
- Phase 2 3D scene, avatar rendering, and controls are in place.
- Phase 1/2 UI/HUD overlays for chat, nearby list, and profile card exist.

## Feature Flags (added / removed / modified)
- Existing: `USE_MOCK_REALTIME` (default true).
- Added: `REALTIME_PROVIDER=sim|ws` (string selector for provider injection), default `sim`.

## Functional Requirements
- FR-01: Implement `RealtimeProvider` interface covering connect/disconnect, joinRoom/leaveRoom, sendTransform, sendChat, sendEmote, and event subscriptions.
- FR-02: Simulation engine maintains room state in-memory and emits `room_state`, `member_joined`, `member_left`, `avatar_transform_broadcast`, `chat_broadcast` per `realtime-protocol.md`.
- FR-03: Client smoothing uses interpolation buffer (100–200ms) with snap thresholds for outliers.
- FR-04: Rate limits enforced in sim: transforms max 20/sec (desktop) and 15/sec (mobile); chat length capped to protocol spec; drop/expose over-limit events.
- FR-05: Support multiple local identities (per tab/device) to join the same simulated room and see each other’s movement/chat.
- FR-06: Reconnect flow: simulation supports disconnect/reconnect without crashing UI; replays current room state on rejoin.
- FR-07: Integration with existing HUD: nearby list, profile card, and chat panels consume simulated events without API changes.

## Non-Functional Requirements
- Performance: Simulation tick/lightweight; no noticeable UI stutter under 5–10 simulated users.
- Accessibility: No regression to UI focus/labels; simulation controls exposed only via settings/flags.
- Responsiveness: Movement and chat updates appear within ~200ms locally with smoothing active.
- Error handling: If provider errors (e.g., invalid token placeholder), UI shows toast and allows retry; sim should not crash app.

## Mock vs Real Data Matrix
| Area                    | Mocked | Real | Notes |
|-------------------------|:------:|:----:|-------|
| Auth/Profile            | ✅     | ❌   | Same mocks as prior phases |
| Rooms directory         | ✅     | ❌   | Joins use simulated room IDs |
| Realtime events         | ✅     | ❌   | In-memory simulation only |
| Presence/occupancy      | ✅     | ❌   | Derived from sim state |
| Voice                   | ✅     | ❌   | Not included |

## Acceptance Criteria
- Two browser tabs using different mock identities can join the same simulated room and see movement and chat updates in near real time.
- Transform rate limits applied; exceeding limits drops/squelches events without crashing.
- Chat messages follow protocol constraints (length) and broadcast to simulated members.
- Reconnect (manual disconnect/reconnect) restores current room state and resumes updates.
- Smoothing produces stable movement without jitter for typical transform rates.

## Demo Checklist
- Open two tabs, join same simulated room, move both avatars and observe synced positions with smoothing.
- Send chat from each tab; verify chat bubbles and HUD updates.
- Exceed transform rate briefly to show rate limiting (e.g., squelch/log).
- Simulate disconnect/reconnect and show state restoration.
- Toggle provider flag (sim) to demonstrate injectable architecture for future WS provider.

## Exit Criteria (phase complete)
- `RealtimeProvider` interface and sim provider shipped and wired into UI/3D layers.
- Smoothing and rate limiting implemented per protocol guidance.
- Multiple-tab simulation works; reconnect path validated.
- Clear seam exists to swap in real WS provider in Phase 7 without UI changes.
