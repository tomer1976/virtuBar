# Phase 12 — Voice Phase 1 (WebRTC) (replace mock voice)

## Phase Number & Name
Phase 12 — Voice Phase 1 (WebRTC) (replace mock voice)

## Phase Goal (outcome-focused)
Introduce real voice chat via WebRTC with SFU-backed signaling, room-scoped authorization, and spatial audio controls, replacing mock voice while prioritizing stability and safety.

## User Value Delivered
- Users can speak and hear each other in rooms with spatial attenuation and mute controls.
- Voice is authenticated and scoped to rooms, improving trust and cohesion in live sessions.

## In Scope
- Voice signaling endpoint/token issuance; integration with SFU (managed or self-hosted).
- Client voice flow: mic permissions, connect/disconnect, push-to-talk toggle, per-user mute.
- Spatial audio attenuation based on distance (client-side) using WebAudio.
- Room-scoped voice authorization tokens (short TTL).

## Out of Scope
- Advanced voice moderation/recording/evidence capture (future work).
- Echo suppression beyond browser-provided AEC.
- Cross-room or global voice.

## Dependencies / Preconditions
- Realtime WS gateway live (Phase 7), room join tokens include voice token placeholders (Phase 6).
- Backend able to issue voice tokens and provide voice signaling URL.
- TURN credentials available; SFU cluster accessible.

## Feature Flags (added / removed / modified)
- Modified: `USE_MOCK_VOICE` default false after this phase; mock fallback retained.
- Added: `VOICE_MODE=webrtc|mock`, `VOICE_SPATIAL_ENABLED=true`, `VOICE_PTT_DEFAULT=true|false`.

## Functional Requirements
- FR-01: Voice signaling endpoint issues room-scoped voice tokens with short TTL; join flow returns voiceUrl/voiceToken.
- FR-02: Client requests mic permission; handles denied/blocked cases with clear UI.
- FR-03: Client connects to SFU using signaling endpoint/token; subscribes to room peers.
- FR-04: Per-user mute (local) and push-to-talk toggle; UI reflects mute state.
- FR-05: Spatial audio attenuation based on distance using position data from realtime updates; allow disable via flag.
- FR-06: Disconnect/reconnect handling: voice reconnects on network drops or token refresh.
- FR-07: If blocked users exist, their audio is not subscribed/played for the blocker.

## Non-Functional Requirements
- Performance: Stable audio with acceptable latency/jitter; adaptive bitrate if SFU supports.
- Accessibility: Clear controls for mute/PTT; indicators for speaking state.
- Responsiveness: Join voice quickly after entering room (<2s typical in dev); recovery after drop within a few seconds.
- Error handling: Graceful fallbacks on permission denial, token failure, or SFU unreachability with user-visible toasts.

## Mock vs Real Data Matrix
| Area                  | Mocked | Real | Notes |
|-----------------------|:------:|:----:|-------|
| Auth/Rooms/Realtime   | ❌     | ✅   | Existing |
| Voice signaling/token | ❌     | ✅   | New real tokens |
| Voice media           | ❌     | ✅   | WebRTC/SFU |
| Spatial audio         | ❌     | ✅   | Client attenuation |
| Voice mock fallback   | ✅     | ⚠️   | Retained for demos when flag on |

## Acceptance Criteria
- Two real users in the same room can talk and hear each other with spatial attenuation applied.
- Mic permission flow handles grant/deny gracefully; UI reflects mute/PTT states.
- Blocked users’ audio is not heard by the blocker.
- Network drop and reconnect restore voice within a few seconds without full page reload.
- `USE_MOCK_VOICE=true` falls back cleanly to mock UI-only mode.

## Demo Checklist
- Join room with two users; enable voice; verify audio both directions with positional attenuation.
- Toggle push-to-talk and per-user mute; observe state changes and audio behavior.
- Deny mic permission to show error handling; then allow and connect.
- Simulate network blip and show voice reconnection.
- Toggle mock voice flag to demonstrate fallback.

## Exit Criteria (phase complete)
- Real voice via WebRTC/SFU live by default; mock fallback retained.
- Spatial audio and mute/PTT controls working with room-scoped authorization.
- Ready for Phase 13 (performance, stability, observability) to harden the stack.
