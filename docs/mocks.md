# Mock Providers Overview (Phase 0)

Phase 0 is fully mocked. Feature flags default to mock implementations via `FeatureFlagsProvider` (all `USE_MOCK_*` true).

## Providers
- Auth: deterministic `mockUser`, persisted to `localStorage` key `virtubar:auth:user`.
- Profile: defaults to Guest profile; persisted to `virtubar:profile` with onboarding wizard writes.
- Rooms: static dataset in Rooms page (deterministic IDs and counts).
- Realtime: flag `USE_MOCK_REALTIME` stays true; no websocket code included.
- Voice: flag `USE_MOCK_VOICE` stays true; UI toggles are non-functional placeholders.

## Determinism
- Mock datasets are hard-coded (rooms, user), ensuring repeatable demos across reloads.
- Storage-backed mocks clear cleanly via providers, keeping deterministic defaults.
