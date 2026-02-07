# Phase 2 → Phase 3 Realtime Handoff Notes

## What stays mocked in Phase 2
- Transforms: NPC crowd sim + player motion are client-authoritative via SceneRoot.
- Chat: NPC chat bubbles are seeded mock events; no network.
- Profiles: Nearby users from mockDataEngine; player profile from ProfileProvider.
- Assets: GLTF served locally; no CDN handshake.

## Switch-points for Phase 3
- SceneRoot inputs: use `mobileMoveRef`/keyboard state to emit player intent to a realtime service; accept an injected stream of remote transforms to drive NPC/player groups (replace `stepNpcGroup` outputs).
- Scene model: keep `rendererFactory`/`loaderFactory` injectable; allow remote asset URIs or CDN auth in a new loader wrapper while retaining fallback plane + overlay.
- Profile selection: `onSelectProfile` already surfaces NearbyUser; reuse for server-fetched profiles or raise a profileId lookup.
- Feature flags: `USE_MOCK_3D_SCENE`, `ENABLE_NPC_CROWD_SIM`, and mock profile/chat flags can gate the realtime provider to simplify rollout and A/B.
- Chat overlay: replace `stepNpcChat` with server chat events; reuse HUD anchoring to avatars; keep `data-testid="npc-chat-layer"` for UI assertions.
- Perf knobs: keep low-graphics toggle and `data-testid="fps-overlay"` to monitor client FPS under realtime load.

## Minimal interface sketch
- Intent out: `onPlayerIntent(delta: { move: Vector2; look: Vector2; dtMs: number })` from the input step.
- State in: `onTransforms(payload: { entities: Array<{ id: string; position: Vector3; heading: number }> })` to update avatar groups (player + others) instead of `stepNpcGroup`.
- Chat in: `onChat(payload: { id: string; actorId: string; text: string; ttl: number })` to drive HUD bubbles.

## Migration plan (incremental)
1) Add a `RealtimeProvider` that implements the interfaces above and can be toggled on/off via feature flags.
2) When enabled, bypass local NPC sim in SceneRoot and hydrate transforms from the provider while still rendering player locally if server lags.
3) Gate GLTF loading through provider when remote assets are required; keep fallback plane for failure tolerance.
4) Move profile sourcing to provider (by id) while preserving the local mock as a fallback for demo/offline.
5) Keep unit tests on SceneRoot fallbacks and add contract tests for provider stubs feeding SceneRoot in headless mode.
