# Phase 9 — Presence & Room Health (occupancy becomes real)

## Phase Overview
Implement heartbeat-based presence with Redis to power live occupancy in rooms list and “join hottest room,” replacing occupancy stubs.

## Frontend Tasks
- [ ] Send heartbeat payload on interval with roomId and clientTime via WS provider; pause when unfocused if protocol allows.
- [ ] Handle presence-related disconnects (missed heartbeats) with reconnect and user indicator.
- [ ] Update rooms UI to consume live `estimatedOccupancy` from backend; remove stub usage when real data is present.
- [ ] Ensure “Join hottest room” uses live occupancy/region selection.
- [ ] Provide graceful fallback messaging if presence service unreachable (optional toast/badge).

## Backend Tasks (if applicable)
- [ ] Implement heartbeat handling in WS gateway to refresh Redis presence TTL per user/room.
- [ ] Define Redis keys for presence (e.g., `presence:user:{userId}` and `room:{roomId}:members`).
- [ ] Compute `estimatedOccupancy` from Redis and expose via `GET /rooms`.
- [ ] Ensure disconnect/WS close removes presence or lets TTL expire; apply grace period via TTL.
- [ ] Add config for heartbeat interval and TTL; enforce reasonable defaults.

## Realtime Tasks (if applicable)
- [ ] Integrate presence updates into gateway broadcast logic if needed; ensure no extra traffic to clients.
- [ ] Load test heartbeats at target room sizes to confirm Redis write throughput is acceptable.

## Voice Tasks (if applicable)
- [ ] None; voice remains mocked.

## Infrastructure / DevOps Tasks (if applicable)
- [ ] Verify Redis sizing and eviction policy; monitor key counts and write rates.
- [ ] Add dashboards/alerts for presence errors or missed heartbeat spikes.

## State & Mock Replacement Tasks
- [ ] Set `USE_ESTIMATED_OCCUPANCY_STUB=false` by default; keep stub path as fallback if Redis unavailable.

## File-Level Guidance
- [ ] Store presence key helpers in `apps/realtime/src/redis` (or similar).
- [ ] Update rooms service in `apps/server` to read occupancy from Redis when assembling `GET /rooms` response.

## Validation & Testing
- [ ] Manual: open two clients in a room; verify occupancy increments; close one and confirm decrement after TTL.
- [ ] Manual: use “Join hottest room” and ensure routing to highest occupancy room.
- [ ] Fault injection: disable Redis or block heartbeats to validate fallback handling.
- [ ] Automated: add integration tests for `GET /rooms` occupancy calculation with seeded Redis state.

## Cleanup & Refactor
- [ ] Remove or isolate stub occupancy providers now that real presence is default.
- [ ] Document heartbeat intervals and TTL for future tuning.

## Handoff to Next Phase
- [ ] Confirm live occupancy stable; prerequisites ready for Phase 10 (music) and beyond.
