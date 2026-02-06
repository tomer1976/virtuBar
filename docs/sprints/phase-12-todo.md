# Phase 12 — Voice Phase 1 (WebRTC) (replace mock voice)

## Phase Overview
Enable real voice via WebRTC/SFU with room-scoped tokens, mic permissions, spatial audio, and reconnect handling; keep mock fallback via flag.

## Frontend Tasks
- [ ] Add voice feature flags: `USE_MOCK_VOICE`, `VOICE_MODE`, `VOICE_SPATIAL_ENABLED`, `VOICE_PTT_DEFAULT`.
- [ ] Implement mic permission flow with clear grant/deny handling and user prompts.
- [ ] Implement voice client to connect to signaling URL with voiceToken; join room audio via SFU.
- [ ] Add push-to-talk toggle and per-user mute UI; ensure state reflects in subscriptions/gain nodes.
- [ ] Implement spatial audio attenuation using positions from realtime updates; allow disable via flag.
- [ ] Handle reconnect on network drops or token expiry; refresh token via `/rooms/join` if required.
- [ ] Ensure blocked users are not subscribed/played locally.
- [ ] Provide error toasts for permission denial, token errors, and SFU connection failures; fall back to mock voice if flag set.

## Backend Tasks (if applicable)
- [ ] Implement voice signaling endpoint and token issuance (room-scoped, short TTL) returned from `/rooms/join`.
- [ ] Integrate with SFU (managed or self-hosted); configure TURN credentials.
- [ ] Enforce room scoping in signaling and SFU access; validate tokens.
- [ ] Optionally expose voiceUrl in join response; ensure CORS and secure WS/WSS.
- [ ] Ensure blocklist is respected server-side if applicable (do not route audio to blocker).

## Realtime Tasks (if applicable)
- [ ] Ensure position data from WS is available for spatial attenuation; no protocol change needed.

## Voice Tasks (if applicable)
- [ ] Configure audio constraints (AEC/NS/AGC) and WebRTC connection options tuned for SFU.
- [ ] Add minimal SFU room setup and teardown flows.

## Infrastructure / DevOps Tasks (if applicable)
- [ ] Provision/validate SFU and TURN services; ensure bandwidth and region alignment.
- [ ] Add env vars for voice signaling URL, TURN creds, SFU tokens/keys.
- [ ] Update CI/CD to include voice service config where needed.

## State & Mock Replacement Tasks
- [ ] Default `USE_MOCK_VOICE=false` after validation; retain mock path for demos.

## File-Level Guidance
- [ ] Place voice client code under `apps/web/src/net/voice` with provider similar to realtime.
- [ ] Place signaling server integration under `apps/voice` or within server module depending on architecture; share types in `packages/shared`.

## Validation & Testing
- [ ] Manual: two users in same room exchange audio; verify spatial attenuation.
- [ ] Manual: deny mic permission, ensure graceful handling; then allow.
- [ ] Manual: toggle PTT and per-user mute; verify behavior.
- [ ] Manual: simulate network drop; ensure voice reconnects.
- [ ] Manual: verify blocked user audio is suppressed.
- [ ] Manual: toggle mock voice flag and confirm UI-only mode works.

## Cleanup & Refactor
- [ ] Remove or isolate mock voice stubs when real mode active; keep behind flag for fallback.
- [ ] Document voice token flow, signaling endpoints, and spatial settings.

## Handoff to Next Phase
- [ ] Confirm voice stable enough for Phase 13 hardening (performance, stability, observability).
