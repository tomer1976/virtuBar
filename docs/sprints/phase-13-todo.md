# Phase 13 — Performance, Stability, and Observability

## Phase Overview
Harden client and backend for performance and stability; add observability (logs/metrics/traces) and validate load for realtime/voice.

## Frontend Tasks
- [ ] Add quality presets (`CLIENT_QUALITY_PRESET`) and toggles for `ENABLE_LOD`, `ENABLE_FRUSTUM_CULLING`.
- [ ] Implement LOD for avatars/scene objects and frustum culling in the renderer.
- [ ] Compress/optimize assets (textures/models); provide lower-res variants for low preset.
- [ ] Improve reconnect UX for WS and voice: clear status indicators, retries, and token refresh handling.
- [ ] Add client-side telemetry hooks (if enabled) for join latency and reconnect events (respect `ENABLE_TELEMETRY`).

## Backend Tasks (if applicable)
- [ ] Add structured logging (requestId, userId, roomId) to API, realtime gateway, and voice services.
- [ ] Expose metrics endpoints (Prometheus or similar): active rooms, users per room, WS msg rate, voice bandwidth, auth/room join latency.
- [ ] Add tracing (optional) for join flow across API → realtime → voice signaling.
- [ ] Improve error handling responses for token expiry and reconnect scenarios.

## Realtime Tasks (if applicable)
- [ ] Load test WS gateway to ~40 concurrent users in a room; capture latency, drop rate, and CPU/memory usage.
- [ ] Tune rate limits and backpressure settings based on load test results.

## Voice Tasks (if applicable)
- [ ] Perform voice path soak test with multiple participants; monitor SFU bandwidth and reconnect behavior.
- [ ] Add `VOICE_QOS_DEBUG` flag/logging to inspect jitter/packet loss metrics if available.

## Infrastructure / DevOps Tasks (if applicable)
- [ ] Ensure metrics collection and dashboards are set up (Grafana or similar) for API, realtime, and voice services.
- [ ] Add alerts for critical signals (WS connect errors, high latency, voice bandwidth spikes).
- [ ] Verify Redis/Postgres resource sizing under load; tune as needed.

## State & Mock Replacement Tasks
- [ ] Ensure all core paths (auth, rooms, realtime, voice, music) use real services; mocks only behind flags for demos.

## File-Level Guidance
- [ ] Place logging/metrics middleware in API and gateway services (`apps/server`, `apps/realtime`, `apps/voice`).
- [ ] Store client quality preset and graphics settings in settings store; persist locally.
- [ ] Keep telemetry event schemas/types in `packages/shared` if emitted.

## Validation & Testing
- [ ] Run WS load test to ~40 users; document results and regressions.
- [ ] Run voice group test; verify stability and measure jitter/latency if possible.
- [ ] Validate FPS improvements when toggling quality presets/LOD/culling on mid-tier device.
- [ ] Test reconnect flows for WS and voice with network drop simulation.

## Cleanup & Refactor
- [ ] Remove unused debug code from earlier phases; keep controlled via flags.
- [ ] Document metrics dashboards, alert thresholds, and how to access logs.

## Handoff to Next Phase
- [ ] Summarize performance and stability status; capture follow-ups for Phase 14+.
