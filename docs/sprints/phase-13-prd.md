# Phase 13 — Performance, Stability, and Observability

## Phase Number & Name
Phase 13 — Performance, Stability, and Observability

## Phase Goal (outcome-focused)
Harden the stack for real usage by improving client/server performance, adding observability (logs/metrics/traces), and validating stability under load for realtime and voice.

## User Value Delivered
- Users experience smoother sessions with fewer drops and better frame rates.
- Team gains visibility into issues via metrics and logs, enabling faster debugging and operational readiness.

## In Scope
- Structured logging and metrics on server, realtime gateway, and voice services.
- Client performance optimizations: LOD, frustum culling, asset compression, quality presets.
- Load testing for WS rooms (target ~40 users) and voice pathways.
- Basic tracing across join flow (API → realtime → voice signaling) if feasible.

## Out of Scope
- New feature work; focus is hardening and telemetry.
- Advanced autoscaling policies (beyond basic readiness).

## Dependencies / Preconditions
- Realtime (Phase 7), presence (Phase 9), music (Phase 10), VR (Phase 11), and voice (Phase 12) are functional.

## Feature Flags (added / removed / modified)
- Added: `CLIENT_QUALITY_PRESET=low|med|high`, `ENABLE_LOD`, `ENABLE_FRUSTUM_CULLING`, `ENABLE_TELEMETRY`.
- Optional: `VOICE_QOS_DEBUG`, `WS_RATE_LIMIT_DEBUG`.

## Functional Requirements
- FR-01: Server/gateway/voice emit structured logs with requestId/userId/roomId where applicable.
- FR-02: Metrics exposed (Prometheus or similar): active rooms, users per room, WS message rate, voice bandwidth, auth/room join latency.
- FR-03: Load test WS rooms to ~40 concurrent users; document results and bottlenecks.
- FR-04: Client performance: implement LOD and frustum culling for avatars/scene; compress assets (textures/models) and provide quality presets.
- FR-05: Tracing (optional): correlate join flow across API, realtime, and voice signaling.
- FR-06: Error handling improvements: clearer toasts and recovery for reconnect, token expiry, and voice disconnects.

## Non-Functional Requirements
- Performance: Maintain target FPS (desktop 60, mobile 30, VR 72 where applicable) under typical load.
- Stability: Reconnect paths validated; rate limits configured and observed.
- Observability: Dashboards available for key metrics; logs are queryable by room/user.
- Error handling: Meaningful error surfaces to users; silent failures reduced.

## Mock vs Real Data Matrix
| Area                  | Mocked | Real | Notes |
|-----------------------|:------:|:----:|-------|
| Auth/Rooms/Realtime   | ❌     | ✅   | Live stack |
| Voice                 | ❌     | ✅   | Live voice |
| Telemetry             | ❌     | ✅   | New metrics/logs |
| Client perf mocks     | ✅     | ❌   | Real optimizations applied |

## Acceptance Criteria
- Metrics and logging dashboards show active rooms, WS message rates, and voice bandwidth; logs contain requestId/userId where applicable.
- Load test demonstrates room handling for ~40 concurrent users with acceptable latency; issues documented with mitigation plan.
- Client quality presets and LOD/culling reduce load; measurable FPS improvement on mid-tier devices.
- Reconnect/token expiry flows produce clear user feedback and recover without manual refresh.

## Demo Checklist
- Show dashboards with live metrics (rooms/users, WS rate, voice bandwidth).
- Run a small load test or replay results demonstrating stability at target concurrency.
- Toggle quality presets and show FPS/CPU improvement.
- Demonstrate reconnection handling for WS/voice with user-visible status.

## Exit Criteria (phase complete)
- Observability in place with actionable dashboards; structured logs deployed.
- Performance optimizations implemented and validated with measurable improvements.
- Stability validated via load tests; known issues documented for follow-up.
- Ready for Phase 14 (social graph) and Phase 15 (monetization) on a hardened platform.
