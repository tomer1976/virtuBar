# Phase 10 — Music MVP (replace mock music, add real playlists)

## Phase Overview
Implement backend-driven room playlists and a synced client audio player, with flags for disable/mock fallbacks.

## Frontend Tasks
- [ ] Add music feature flags `ENABLE_MUSIC` and `USE_MOCK_MUSIC` handling in client config.
- [ ] Implement audio player component with volume/mute controls and persistent preferences (local storage).
- [ ] On room entry, call `GET /rooms/:id/music`, start playback, and align to server time offset when provided.
- [ ] Handle autoplay restrictions (require user gesture if needed); provide play button fallback.
- [ ] Implement retry/fallback on track load failure (advance to next or mute with toast).
- [ ] Display minimal track info (title/artist) in HUD without cluttering UI.
- [ ] Ensure mobile-friendly controls (touch targets) and keyboard accessibility.

## Backend Tasks (if applicable)
- [ ] Add playlist model/config (static or DB) and seed room playlists.
- [ ] Implement `GET /rooms/:id/music` returning current track metadata (url, duration, title/artist) and optional sync fields `trackStartTimeMs`, `serverTimeMs`.
- [ ] Optionally include next track for seamless loop/rotation.
- [ ] Provide signed/CDN URLs or public links for audio assets; ensure CORS and content-type headers are correct.
- [ ] Add validation and error handling for missing playlist/track.

## Realtime Tasks (if applicable)
- [ ] None; music sync uses HTTP + server time. (Optional: future WS event hook, not in this phase.)

## Voice Tasks (if applicable)
- [ ] None; voice remains mocked.

## Infrastructure / DevOps Tasks (if applicable)
- [ ] Upload audio assets to CDN/object storage; verify availability and caching headers.
- [ ] Add env/config for playlist sources and asset base URL.

## State & Mock Replacement Tasks
- [ ] Default `ENABLE_MUSIC=true`, `USE_MOCK_MUSIC=false`; ensure mock playlist path works for demos.

## File-Level Guidance
- [ ] Place music service/controller under `apps/server/src/modules/music` (or within rooms module if simpler).
- [ ] Store playlist config or DB access layer near that module; add types to `packages/shared` for music payloads.
- [ ] Add client audio player under `apps/web/src/ui/hud/music` (or similar) and hook into room entry flow.

## Validation & Testing
- [ ] Manual: enter room with two clients, start music, verify approximate sync (compare timestamps).
- [ ] Manual: toggle mute/volume and reload to confirm persistence.
- [ ] Manual: simulate missing track URL to test fallback/mute path.
- [ ] Automated: add unit tests for time offset calculation and preference persistence.

## Cleanup & Refactor
- [ ] Remove Phase 1/2 mock music stubs when real mode active; keep mock path behind flag.
- [ ] Document sync assumptions and acceptable skew for future improvements.

## Handoff to Next Phase
- [ ] Confirm music MVP stable and documented; ready for Phase 11 (WebXR/VR entry) with music active.
