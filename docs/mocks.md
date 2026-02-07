# Mock Providers Overview (Phase 1)

Phase 1 remains fully mocked. Feature flags default to mock implementations via `FeatureFlagsProvider` (all `USE_MOCK_*` true). A `USE_MOCK_LIVENESS` flag optionally disables simulated drift/presence updates.

## Providers
- Auth: deterministic `mockUser`, persisted to `localStorage` key `virtubar:auth:user`.
- Profile: defaults to Guest profile; persisted to `virtubar:profile` with onboarding wizard writes.
- Rooms: generated via seeded mock data engine (5–15 rooms, balanced occupancy) with optional drift when `USE_MOCK_LIVENESS` is true.
- Nearby: seeded list derived from mock users, sorted by region/affinity; drifted activity scores gated by `USE_MOCK_LIVENESS`.
- Chat: seeded local thread with periodic incoming messages; history clamped.
- Realtime: flag `USE_MOCK_REALTIME` remains true; no websocket code included.
- Voice: flag `USE_MOCK_VOICE` remains true; UI toggles are non-functional placeholders.

## Determinism
- Mock datasets and liveness use seeded RNG (`DEFAULT_MOCK_SEED`), ensuring repeatable demos across reloads.
- Storage-backed mocks clear cleanly via providers, keeping deterministic defaults.
