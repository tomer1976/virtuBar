# Phase 3 — Protocol-ready realtime simulation (client-only, backend-compatible)

## Phase Overview
Implement a protocol-compatible realtime simulation with a pluggable provider interface, enabling multi-tab simulated multiplayer and smoothing while keeping everything client-only.

## Frontend Tasks
- [x] Define `RealtimeProvider` TypeScript interface (connect/disconnect, joinRoom/leaveRoom, sendTransform, sendChat, sendEmote, subscribe handlers) matching `realtime-protocol.md` event shapes.
	- Added protocol-aligned types, envelopes, limits, and tests under apps/web/src/net/realtime.
- [ ] Implement simulation provider that maintains in-memory room state and emits `room_state`, `member_joined`, `member_left`, `avatar_transform_broadcast`, `chat_broadcast` events.
- [ ] Add provider selector flag `REALTIME_PROVIDER=sim|ws` (default sim) with DI wiring in app bootstrapping.
- [ ] Implement transform smoothing/interpolation buffer (100–200ms) with snap thresholds; integrate with avatar render pipeline.
- [ ] Enforce client-side rate limits: transforms (20/sec desktop, 15/sec mobile), chat length max per protocol; drop or delay over-limit events with optional debug log.
- [ ] Support multiple local identities (e.g., per-tab user IDs) to simulate multi-user presence; allow identity override via query param or dev toggle.
- [ ] Ensure reconnect flow: on simulated disconnect, allow reconnect that replays current room state and resumes event stream.
- [ ] Wire simulated events into existing HUD (nearby list, chat panel, profile card) without changing UI contracts.

## Backend Tasks (if applicable)
- [ ] Mark backend as N/A; no network services added this phase.

## Realtime Tasks (if applicable)
- [ ] Keep provider purely client-side; ensure shapes match `realtime-protocol.md` to enable Phase 7 swap.

## Voice Tasks (if applicable)
- [ ] Voice remains mocked; no changes.

## Infrastructure / DevOps Tasks (if applicable)
- [ ] Add minimal config/env handling for `REALTIME_PROVIDER` flag in dev builds.
- [ ] Optional: add lightweight logging toggle for simulation events to aid QA.

## State & Mock Replacement Tasks
- [ ] Document simulation behavior, rate limits, and identity override mechanism; ensure defaults remain mock/sim.

## File-Level Guidance
- [ ] Place provider interfaces in `apps/web/src/net/realtime` (or shared package if reused later); keep sim implementation nearby.
- [ ] Add smoothing utilities near avatar rendering logic to avoid cross-layer churn.
- [ ] Keep protocol event types in `packages/shared/types` or `.../zod` for validation.

## Validation & Testing
- [ ] Open two browser tabs with different mock identities; join same room and verify mutual movement and chat visibility.
- [ ] Manually exceed transform rate to confirm rate limiting behavior without crashes.
- [ ] Test reconnect: force disconnect and reconnect, ensuring room state rehydrates.
- [ ] Verify smoothing produces stable, non-jittery motion at normal update rates.

## Cleanup & Refactor
- [ ] Remove any ad-hoc mock movement code superseded by the simulation provider.
- [ ] Centralize protocol constants (event names, limits) to avoid duplication.

## Handoff to Next Phase
- [ ] Confirm provider seam is ready for Phase 7 WS implementation; document expected server contract matching `realtime-protocol.md`.
