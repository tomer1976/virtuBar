# Phase 10 — Music MVP (replace mock music, add real playlists)

## Phase Number & Name
Phase 10 — Music MVP (replace mock music, add real playlists)

## Phase Goal (outcome-focused)
Deliver shared room ambience via backend-driven playlists and synchronized playback, replacing mock music with real tracks and lightweight sync so users in the same room hear aligned audio.

## User Value Delivered
- Users experience consistent background music across a room, strengthening the venue vibe and cohesion.
- Server-managed playlists enable curation and safer licensing control versus ad-hoc client mocks.

## In Scope
- Backend: playlist model/config and endpoint `GET /rooms/:id/music` returning current track metadata and optional sync timestamps.
- Client audio player: volume/mute controls, play/pause, basic time sync to server time.
- CDN/asset delivery for audio files; fallback handling if track unavailable.
- Feature flag to disable music or fall back to mock tracks.

## Out of Scope
- DJ rotation, voting, or jukebox mechanics (future phases).
- Rights-managed commercial catalog integrations; use curated/licensed tracks only.
- Voice features (handled later) and advanced latency compensation.

## Dependencies / Preconditions
- Real auth, rooms, realtime in place (Phases 4–9).
- Asset hosting available (CDN or public storage) for audio files.

## Feature Flags (added / removed / modified)
- Added: `ENABLE_MUSIC=true|false` (default true in capable environments), `USE_MOCK_MUSIC=false|true` fallback.

## Functional Requirements
- FR-01: Backend provides room playlist metadata (static config or DB) including track URL, duration, title/artist, and optional start time reference (`trackStartTimeMs`, `serverTimeMs`).
- FR-02: `GET /rooms/:id/music` returns current track info and optional next track for seamless loop.
- FR-03: Client audio player fetches music metadata on room entry and starts playback aligned to server time offset when provided.
- FR-04: Client exposes volume and mute controls; remembers preference per device via local storage.
- FR-05: If sync data is missing, client defaults to local start but remains resilient to track boundaries.
- FR-06: Error handling: if track fails to load, client retries next track or shows muted state with toast.
- FR-07: Feature flag allows disabling music entirely or using mock playlist for demos.

## Non-Functional Requirements
- Performance: Streaming should not stall primary app; preload/buffer to avoid UI hitches.
- Accessibility: Controls keyboard-navigable; visible focus states; captions not required for background music.
- Responsiveness: Player controls usable on mobile and desktop; minimal screen footprint.
- Error handling: Graceful degradation on CDN failure; log structured errors for missing assets.

## Mock vs Real Data Matrix
| Area                  | Mocked | Real | Notes |
|-----------------------|:------:|:----:|-------|
| Auth/Rooms/Realtime   | ❌     | ✅   | Existing stack |
| Music metadata        | ❌     | ✅   | From backend playlist endpoint |
| Audio delivery        | ❌     | ✅   | CDN/object storage |
| Music sync            | ✅/⚠️  | ✅   | Real server time sync when provided; mock fallback if flagged |
| Voice                 | ✅     | ❌   | Still mocked |

## Acceptance Criteria
- Room entry loads playlist metadata and starts audio; multiple users in same room hear the same track within acceptable skew (small offset based on network latency + sync buffer).
- Volume/mute controls work and persist per device.
- Track load failure falls back gracefully to next track or muted state with user notification.
- `ENABLE_MUSIC=false` or `USE_MOCK_MUSIC=true` cleanly disables or uses mock playlist without errors.

## Demo Checklist
- Enter a room; observe music autoplay (within user gesture constraints) and show track info.
- Open a second client; confirm both hear same track position (compare timestamps).
- Toggle mute/volume and reload; preferences persist.
- Simulate missing track URL to show fallback/mute behavior.
- Toggle mock/disable flags to demonstrate resiliency.

## Exit Criteria (phase complete)
- Backend playlist endpoint live; client audio player integrated with sync and controls.
- Music enabled by default with fallbacks documented.
- Mock/disable flags retained for demos; ready to proceed to Phase 11 (WebXR/VR entry).
