# Phase 3 — Protocol-ready realtime simulation (client-only, backend-compatible)

## Phase Overview
Implement a protocol-compatible realtime simulation with a pluggable provider interface, enabling multi-tab simulated multiplayer and smoothing while keeping everything client-only.

## Frontend Tasks
- [x] Define `RealtimeProvider` TypeScript interface (connect/disconnect, joinRoom/leaveRoom, sendTransform, sendChat, sendEmote, subscribe handlers) matching `realtime-protocol.md` event shapes.
	- Added protocol-aligned types, envelopes, limits, and tests under apps/web/src/net/realtime.
- [x] Implement simulation provider that maintains in-memory room state and emits `room_state`, `member_joined`, `member_left`, `avatar_transform_broadcast`, `chat_broadcast` events.
	- Added in-memory sim provider with shared room state and tests covering join/member events, transforms, chat limits, and leaves.
- [x] Add provider selector flag `REALTIME_PROVIDER=sim|ws` (default sim) with DI wiring in app bootstrapping.
	- Added env-driven provider resolver with mock override, React context wiring, and default sim fallback.
- [x] Implement transform smoothing/interpolation buffer (100–200ms) with snap thresholds; integrate with avatar render pipeline.
	- Added reusable transform smoother with snap thresholds and wired NPC avatars through it to prep realtime rendering.
- [x] Enforce client-side rate limits: transforms (20/sec desktop, 15/sec mobile), chat length max per protocol; drop or delay over-limit events with optional debug log.
	- Added client-side rate-limited provider wrapper for transforms and chat with optional debug logging; integrated into provider factory.
- [x] Support multiple local identities (e.g., per-tab user IDs) to simulate multi-user presence; allow identity override via query param or dev toggle.
	- Added realtime identity resolver with per-tab session IDs, query-param override hooks, and React provider context.
- [x] Ensure reconnect flow: on simulated disconnect, allow reconnect that replays current room state and resumes event stream.
	- Sim provider now replays room_state on reconnect without dropping membership; tests cover state replay and resumed broadcasts.
- [x] Wire simulated events into existing HUD (nearby list, chat panel, profile card) without changing UI contracts.
	- Added realtime room context and fed live chat/members into HUD panels while preserving mock-liveness toggle.

## Backend Tasks (if applicable)
- [x] Mark backend as N/A; no network services added this phase.
	- Backend intentionally deferred; phase remains client-only simulation.

## Realtime Tasks (if applicable)
- [x] Keep provider purely client-side; ensure shapes match `realtime-protocol.md` to enable Phase 7 swap.
	- Sim provider remains in-memory only; event envelopes and payloads match docs/realtime-protocol.md via apps/web/src/net/realtime/types.

## Voice Tasks (if applicable)
- [x] Voice remains mocked; no changes.
	- No voice wiring added; `USE_MOCK_VOICE` still defaults to true.

## Infrastructure / DevOps Tasks (if applicable)
- [x] Add minimal config/env handling for `REALTIME_PROVIDER` flag in dev builds.
	- Added apps/web/.env.example and devops.md guidance for Vite `VITE_REALTIME_PROVIDER`.
- [x] Optional: add lightweight logging toggle for simulation events to aid QA.
	- Added env-driven debug switches `VITE_REALTIME_DEBUG` (rate limit logs) and `VITE_REALTIME_LOG_EVENTS` (event tracing) in provider factory.

## State & Mock Replacement Tasks
- [x] Document simulation behavior, rate limits, and identity override mechanism; ensure defaults remain mock/sim.
	- Added realtime simulation section in docs/mocks.md covering rate limits, identity overrides, and env toggles.

## File-Level Guidance
- [x] Place provider interfaces in `apps/web/src/net/realtime` (or shared package if reused later); keep sim implementation nearby.
	- Provider factory, sim provider, and helpers live under apps/web/src/net/realtime.
- [x] Add smoothing utilities near avatar rendering logic to avoid cross-layer churn.
	- Transform smoothing utilities live in the realtime layer and feed SceneRoot avatar rendering.
- [x] Keep protocol event types in `packages/shared/types` or `.../zod` for validation.
	- Protocol-aligned types centralized in apps/web/src/net/realtime/types for now; ready to hoist to shared when backend arrives.

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
