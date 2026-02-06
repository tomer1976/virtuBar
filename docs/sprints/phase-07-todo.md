# Phase 7 — Realtime Gateway (WebSocket) (replace simulated realtime)

## Phase Overview
Swap the client-only realtime simulation for a WebSocket gateway with room-scoped auth, movement/chat broadcast, Redis-backed membership, and client reconnect/token refresh, while retaining a sim fallback.

## Frontend Tasks
- [ ] Implement WS provider conforming to `RealtimeProvider` interface (connect/disconnect, join/leave, sendTransform, sendChat, subscriptions) per `realtime-protocol.md`.
- [ ] Wire provider selection via `REALTIME_PROVIDER=ws|sim` flag; default to ws, keep sim fallback.
- [ ] Implement reconnect strategy with backoff and token refresh via `/rooms/join` when auth errors occur.
- [ ] Integrate WS events into existing smoothing/interpolation pipeline; ensure no UI API changes.
- [ ] Surface connection status and errors (auth_error, disconnect) via UI toasts/indicators.
- [ ] Enforce client-side rate hints (do not exceed 20/sec desktop, 15/sec mobile) and handle server rate-limit responses gracefully.

## Backend Tasks (if applicable)
- [ ] Implement WebSocket gateway server with authentication using `realtimeToken` (room-scoped, TTL).
- [ ] Support protocol events: `join_room`, `room_state`, `member_joined`, `member_left`, `avatar_transform_broadcast`, `chat_broadcast`, `auth_error`.
- [ ] Integrate Redis for room membership sets and latest transforms; use pub/sub or room shards for broadcast.
- [ ] Enforce rate limits (transforms per device type, chat length 240); drop/notify on excess.
- [ ] Enforce blocklist filtering (if blocks table present) to suppress events from blocked users to blocker.
- [ ] Provide `wsUrl` in join response (Phase 6) and validate tokens server-side.
- [ ] Add structured logging for connects, joins, disconnects, rate-limit events, and auth errors.

## Realtime Tasks (if applicable)
- [ ] Deploy WS gateway in dev/stage; verify connectivity from web app.
- [ ] Load test a room with simulated clients (e.g., 20–40) to validate broadcast performance and Redis integration.

## Voice Tasks (if applicable)
- [ ] None; voice remains mocked. Ensure voice token is ignored safely.

## Infrastructure / DevOps Tasks (if applicable)
- [ ] Ensure Redis available and configured; add env vars for Redis URL and WS token secret.
- [ ] Add process manager or container setup for gateway service; expose WS port via ingress.
- [ ] Update CI to run gateway lint/tests.

## State & Mock Replacement Tasks
- [ ] Set `USE_MOCK_REALTIME=false` by default; document sim fallback for offline demos.
- [ ] Keep sim provider code intact; ensure seamless switch via flag without redeploy.

## File-Level Guidance
- [ ] Place gateway server under `apps/realtime` (or equivalent) with room, events, rate-limit modules.
- [ ] Keep shared protocol/event types in `packages/shared` to avoid drift.
- [ ] Place WS provider client code in `apps/web/src/net/realtime/wsProvider` and retain sim provider alongside.

## Validation & Testing
- [ ] Manually connect two real users to same room; verify movement and chat sync in real time.
- [ ] Simulate rapid movement to trigger rate limiting; confirm no crash and possible warning.
- [ ] Simulate network drop; verify reconnect and rejoin with state restoration.
- [ ] Verify blocklist filtering prevents blocked user events from reaching blocker (if blocklist exists).
- [ ] Toggle back to sim provider and confirm functionality remains for offline demo.

## Cleanup & Refactor
- [ ] Remove any obsolete hooks from the Phase 3 sim that are no longer needed when ws is active; keep sim cleanly separated.
- [ ] Document token refresh flow and provider selection for future phases.

## Handoff to Next Phase
- [ ] Confirm realtime foundation is stable; prerequisites ready for Phase 8 (safety enforcement) and Phase 9 (presence-based occupancy).
