# Phase 6 — Rooms Directory + Join Tokens (replace mock rooms list)

## Phase Overview
Replace mock rooms list with real backend endpoints and join flow, issuing tokens for future realtime/voice while keeping realtime/voice mocked.

## Frontend Tasks
- [ ] Call real `GET /rooms` to render rooms list with theme/capacity/estimated occupancy fields.
- [ ] Implement “Join hottest room” CTA to call `POST /rooms/join` without roomId and handle returned roomId/tokens.
- [ ] Implement direct room join via selected room card calling `POST /rooms/join` with roomId.
- [ ] Store returned `roomId`, `realtimeToken`, `voiceToken` (placeholder), `wsUrl`, `voiceUrl`, `serverTimeMs` in client state for later phases.
- [ ] Add user-facing error handling for join failures (capacity soft-check, blocklist) and fetch failures.
- [ ] Preserve `USE_MOCK_ROOMS` flag path; ensure UI toggles between real and mock directories cleanly.

## Backend Tasks (if applicable)
- [ ] Add `rooms` table migration with fields: id (uuid), name, theme, is_private, capacity, region, created_by (nullable), created_at.
- [ ] Implement `GET /rooms` returning required fields, including `estimatedOccupancy` (stubbed/heuristic until presence is real).
- [ ] Implement `POST /rooms/join`:
  - [ ] Accept optional roomId; if absent, select per `ROOM_JOIN_STRATEGY` (default hottest).
  - [ ] Perform blocklist check if blocks table exists.
  - [ ] Perform soft capacity check (warn/allow for now).
  - [ ] Return roomId, realtimeToken (short TTL), voiceToken (placeholder), wsUrl, voiceUrl, serverTimeMs.
- [ ] Generate/jwt-sign realtime/voice tokens (placeholders) with room scoping.
- [ ] Add basic validation and error responses (invalid room, blocked, capacity exceeded if enforced).

## Realtime Tasks (if applicable)
- [ ] None; keep `USE_MOCK_REALTIME` true. Tokens are placeholders for Phase 7/12.

## Voice Tasks (if applicable)
- [ ] None; voice remains mocked; provide placeholder voiceUrl/voiceToken.

## Infrastructure / DevOps Tasks (if applicable)
- [ ] Ensure migrations run for rooms table; include rollback plan.
- [ ] Add env/config for `ROOM_JOIN_STRATEGY`, token secrets, ws/voice base URLs.

## State & Mock Replacement Tasks
- [ ] Default `USE_MOCK_ROOMS=false` to use real endpoints; document fallback behavior.
- [ ] Keep occupancy stub flag `USE_ESTIMATED_OCCUPANCY_STUB=true` until Phase 9 enables presence-based counts.

## File-Level Guidance
- [ ] Place rooms module under `apps/server/src/modules/rooms` with service/controller.
- [ ] Add shared types for room metadata and join response to `packages/shared/types` or Zod schemas.
- [ ] Update frontend rooms data layer in `apps/web/src/net/api/rooms` (or equivalent) to call new endpoints.

## Validation & Testing
- [ ] Manually fetch rooms list from UI; verify data reflects backend entries.
- [ ] Trigger “Join hottest room” and verify roomId/tokens stored; enter bar context.
- [ ] Join a specific room card; verify behavior.
- [ ] Simulate capacity/blocklist error and confirm user-facing error messaging.
- [ ] Toggle `USE_MOCK_ROOMS=true` and confirm mock list still works.

## Cleanup & Refactor
- [ ] Remove or isolate Phase 1 mock room list logic when real mode is active; keep for fallback only.
- [ ] Document token payload structure for handoff to Phase 7/12.

## Handoff to Next Phase
- [ ] Confirm real rooms/join flow stable; document token contract and readiness for Phase 7 realtime gateway integration.
