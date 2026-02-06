# Phase 7 — Realtime Gateway (WebSocket) (replace simulated realtime)

## Phase Number & Name
Phase 7 — Realtime Gateway (WebSocket) (replace simulated realtime)

## Phase Goal (outcome-focused)
Replace the client-only realtime simulation with a production-ready WebSocket gateway that delivers true multi-user presence (movement and chat) using room-scoped tokens and Redis-backed membership, while preserving existing UI/3D experiences.

## User Value Delivered
- Users can see and interact with other real users’ movements and chat in shared rooms.
- Reliable reconnect and token refresh flows enable stable multiplayer sessions.

## In Scope
- WebSocket gateway with auth using `realtimeToken` issued in Phase 6.
- Join/leave room, movement transform broadcast, local chat broadcast, basic anti-spam rate limits.
- Redis integration for room membership, transforms cache, and rate limiting counters.
- Frontend: swap simulation provider for WS provider via flag and DI, with reconnect and token refresh.

## Out of Scope
- Voice transport (Phase 12).
- Presence-based occupancy in rooms list (handled in Phase 9).
- Advanced moderation enforcement beyond basic block filtering.

## Dependencies / Preconditions
- Phase 6 join flow and token issuance available.
- Redis available for presence and rate limiting.
- Protocol alignment with `realtime-protocol.md`.

## Feature Flags (added / removed / modified)
- Modified: `USE_MOCK_REALTIME` default false after this phase; fallback to sim provider remains.
- Added: `REALTIME_PROVIDER=ws|sim` (if not already), `REALTIME_RECONNECT_INTERVAL_MS`, `REALTIME_RATE_LIMIT_DEBUG`.

## Functional Requirements
- FR-01: WS gateway authenticates connections via `realtimeToken` (room-scoped, TTL) and rejects invalid/expired tokens.
- FR-02: Supports events per `realtime-protocol.md`: `join_room`, `room_state`, `member_joined`, `member_left`, `avatar_transform_broadcast`, `chat_broadcast`, `auth_error`.
- FR-03: Rate limits: transforms (20/sec desktop, 15/sec mobile) and chat length max 240; excess events dropped with optional warning.
- FR-04: Redis stores room members and latest transforms; broadcasts to all room occupants.
- FR-05: Blocklist enforcement: if block list exists, gateway filters events from blocked users to a client.
- FR-06: Frontend WS provider implements connect/disconnect, join/leave, sendTransform, sendChat, with reconnect and token refresh (call `/rooms/join` to refresh).
- FR-07: Frontend swap between sim and WS providers via flag without UI code changes.

## Non-Functional Requirements
- Performance: Smooth movement at target update rates; gateway scales horizontally with Redis pub/sub or sharding approach.
- Accessibility: No UI regressions; indicators for connection loss shown accessibly.
- Responsiveness: Reconnects quickly (<3s) on transient drops; minimal input-to-display latency (~200ms perceived with smoothing).
- Error handling: Clear client toasts for auth errors, disconnects, rate limit hits; gateway logs structured errors.

## Mock vs Real Data Matrix
| Area                   | Mocked | Real | Notes |
|------------------------|:------:|:----:|-------|
| Auth/Profile           | ❌     | ✅   | Real from prior phases |
| Rooms directory/join   | ❌     | ✅   | From Phase 6 |
| Realtime transport     | ❌     | ✅   | WS replaces sim |
| Movement/chat events   | ❌     | ✅   | Live via WS |
| Voice                  | ✅     | ❌   | Still mocked |

## Acceptance Criteria
- Two real users in the same room see each other’s movement smoothly and receive chat messages in real time.
- Exceeding transform rate silently drops or warns without crashing; chat length limited per spec.
- Disconnect and reconnect recover session and rejoin room automatically; token refresh path works.
- Blocked user’s events are not delivered to blocker (if blocklist present).
- Toggling back to sim provider works for offline demos.

## Demo Checklist
- Login as two users, join same room, move both avatars; observe synced movement with smoothing.
- Exchange chat messages; verify broadcasts.
- Temporarily cut network or stop WS to show reconnect behavior and state recovery.
- Trigger rate limit (rapid movement) and show handling.
- Toggle provider to sim to show fallback still works.

## Exit Criteria (phase complete)
- WS gateway live with Redis integration; frontend uses WS by default.
- Reconnect and token refresh flows validated.
- Sim provider retained as fallback via flag.
- Ready for Phase 8 (safety enforcement) and Phase 9 (presence-based occupancy).
