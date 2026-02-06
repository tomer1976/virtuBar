# Phase 9 — Presence & Room Health (occupancy becomes real)

## Phase Number & Name
Phase 9 — Presence & Room Health (occupancy becomes real)

## Phase Goal (outcome-focused)
Implement real presence tracking with heartbeats and Redis-backed occupancy so rooms list shows live occupancy and “join hottest room” reflects current population, improving room vitality and user routing.

## User Value Delivered
- Users see live occupancy counts and join the liveliest rooms, reducing the “empty bar” experience.
- Backend gains durable signals to monitor room health for operations and future matchmaking improvements.

## In Scope
- Presence heartbeat protocol (client → WS gateway → Redis) with TTL refresh.
- Redis presence keys for room membership and occupancy aggregation.
- Rooms list uses real estimated occupancy from presence data.
- Join hottest room leverages real occupancy/region info.

## Out of Scope
- Advanced matchmaking heuristics beyond occupancy/region.
- Voice-specific presence (still mocked voice).
- VR-specific tuning (handled in later phases).

## Dependencies / Preconditions
- Phase 7 WS gateway in place with room membership.
- Redis available for presence storage.
- Rooms endpoints from Phase 6.

## Feature Flags (added / removed / modified)
- Modified: `USE_ESTIMATED_OCCUPANCY_STUB` set false by default (real presence on).
- Added: `PRESENCE_HEARTBEAT_INTERVAL_MS`, `PRESENCE_TTL_MS`.

## Functional Requirements
- FR-01: Clients send periodic heartbeat (interval defined) with roomId and clientTime; gateway refreshes Redis TTL for presence keys.
- FR-02: Redis presence data used to compute `estimatedOccupancy` per room; exposed in `GET /rooms`.
- FR-03: On disconnect/missed TTL, occupancy decrements within TTL window (grace period).
- FR-04: “Join hottest room” uses real occupancy and region preference.
- FR-05: Heartbeat failures trigger reconnect or fallback UX; UI shows connection status if presence lost.

## Non-Functional Requirements
- Performance: Heartbeat handling lightweight; avoid excess Redis writes (interval tuned).
- Accessibility: Connection status indicators accessible; no intrusive UI for temporary drops.
- Responsiveness: Occupancy updates visible within TTL window after join/leave.
- Error handling: If presence backend unavailable, fall back to last known occupancy or stub and show graceful degradation.

## Mock vs Real Data Matrix
| Area                  | Mocked | Real | Notes |
|-----------------------|:------:|:----:|-------|
| Auth/Profile          | ❌     | ✅   | Real |
| Rooms directory       | ❌     | ✅   | Real |
| Realtime transport    | ❌     | ✅   | WS |
| Presence/occupancy    | ❌     | ✅   | Redis heartbeats |
| Voice                 | ✅     | ❌   | Still mocked |

## Acceptance Criteria
- Rooms list displays live occupancy reflecting joins/leaves within TTL; decreases after disconnect/close within grace period.
- Join hottest room selects room based on real occupancy and region.
- Heartbeat stop (network drop) eventually reduces occupancy after TTL expiration.
- Presence degradation handled gracefully (fallback values, user messaging minimal).

## Demo Checklist
- Open two clients, join a room; show occupancy increment in rooms list.
- Close/disconnect one client; after TTL window, show occupancy decrement.
- Use “Join hottest room” and confirm it routes to room with highest current occupancy.
- Toggle presence off (simulate Redis failure) to show fallback behavior.

## Exit Criteria (phase complete)
- Presence heartbeat and occupancy computation live; rooms list uses real counts.
- Join strategy uses live occupancy; stubs removed by default.
- Ready for Phase 10 (music) and Phase 11 (WebXR/VR) with reliable occupancy signals.
