# development-phases.md

# VirtuBar — End-to-End Development Phases (UI-first → mocks → gradual backend replacement)

Version: 1.1  
Last Updated: 2026-02-06

## Strategy (non-negotiable)
1) **UI/UX first with mocks** (prove flows + polish quickly)
2) Add **3D venue** with simulated population (still mocked data)
3) Add **protocol-ready realtime simulation** (client-only)
4) Replace mocks **phase-by-phase** with real backend modules:
   - Auth/Profile → Rooms/Matchmaking → WebSocket Realtime → Safety enforcement → Music → Voice
5) Every phase must end with a runnable app and demoable user journey

## Global Definition of Done (applies to every phase)
- App builds and runs in dev mode
- Basic error UI (toast + fallback screen)
- Feature flags allow switching between mock and real implementations per module
- Logging + minimal telemetry events are added for the phase’s new features
- Docs updated (CHANGELOG-style entry)

---

# PHASE 0 — Monorepo + UI foundation + navigation shell (UI-only, mocked)
**Priority:** P0 (start here)  
**Goal:** A working VirtuBar UI skeleton with routing and design system baseline.

## Scope
- Frontend app shell, routing, layout, UI kit, theme tokens.
- No backend.

## Deliverables
- Monorepo scaffold:
  - `apps/web`
  - `apps/server` (empty placeholder)
  - `packages/shared` (types only)
  - `docs/` (all spec docs)
- Frontend:
  - Routing: `/`, `/login`, `/onboarding`, `/rooms`, `/bar/:roomId`
  - UI kit: Button, Input, Modal, Drawer, Toast, AvatarBadge, TagChip
  - Design tokens (typography, spacing, color system)
- Feature flag system:
  - `USE_MOCK_AUTH=true`
  - `USE_MOCK_PROFILE=true`
  - `USE_MOCK_ROOMS=true`
  - `USE_MOCK_REALTIME=true`
  - `USE_MOCK_VOICE=true`

## Acceptance Criteria
- Click-through journey works end-to-end using mock navigation:
  - Landing → Login → Onboarding → Rooms → Enter Bar
- Components are responsive (desktop + mobile)
- A “Settings” panel opens and saves locally

## Mocks
- Mock auth provider returns a fake user
- Mock profile provider stores profile in local storage

---

# PHASE 1 — UI/UX completion with high-fidelity mocks (UI-only, mocked)
**Priority:** P0  
**Goal:** Fully implement UI/UX spec with realistic interactive states and mock data.

## Scope
- Complete all screens and overlays.
- Mock “liveness” (occupancy changes, nearby list changes).

## Deliverables
- Landing + Login UI (mock Google button)
- Onboarding Wizard (4 steps):
  - Display name + age gate (optional)
  - Avatar preset picker
  - Interest tags picker (min 5)
  - Audio setup UI (permission prompts simulated)
- Rooms screen:
  - Room cards, occupancy, theme filters
  - “Join hottest room” CTA
- In-Venue HUD overlays (still no 3D):
  - Room header + occupancy
  - Nearby users panel (distance-sorted)
  - Local chat panel + bubbles (UI simulation)
  - Profile card overlay (shared interests highlight)
  - Safety menu: mute/block/report UI state
  - Settings: audio/graphics/controls toggles
- Mock data engine:
  - Generates 20–60 fake users
  - Generates 5–15 rooms with dynamic “occupancy”
  - Simulates movement proximity to update “nearby list”
- State model + fake API modules (typed)

## Acceptance Criteria
- UI behaves like a product demo:
  - Profile actions update state (muted/blocked badges)
  - Report flow opens modal and “submits” to mock store
  - Nearby list updates periodically
- Mobile layout has joystick controls UI (non-functional yet)

## Mocks
- Everything uses mock data sources
- No network calls required

---

# PHASE 2 — 3D Venue MVP (client-only) + avatar rendering (still mocked data)
**Priority:** P0  
**Goal:** Real 3D bar scene with your avatar + simulated crowd.

## Scope
- 3D engine integration and performance baseline.
- No real multiplayer yet.

## Deliverables
- 3D renderer integration:
  - Three.js or Babylon.js
  - GLTF bar scene loader
  - Basic lighting + shadows tuned for performance
- Player avatar rendering (simple rigs OK)
- Controls:
  - Desktop: WASD + mouse look
  - Mobile: joystick + look drag
- “Simulated crowd”:
  - Spawn 10–30 NPC avatars
  - Looping animations and pathing
- 3D picking:
  - Tap/click avatar → open profile card overlay
- Chat bubbles appear anchored above avatar heads (client-only)

## Acceptance Criteria
- Stable framerate:
  - Desktop target 60fps
  - Mobile target 30fps
- Interactions feel smooth; profile card opens reliably on avatar selection

## Mocks
- NPC crowd + positions are generated locally
- Chat/messages remain client-only

---

# PHASE 3 — Protocol-ready realtime simulation (client-only, backend-compatible)
**Priority:** P0  
**Goal:** Implement realtime protocol + smoothing locally so backend swap is low-risk.

## Scope
- Implement the realtime message schema/events in TS.
- Simulate a “server” in-memory.

## Deliverables
- `RealtimeProvider` interface:
  - connect/disconnect
  - joinRoom/leaveRoom
  - sendTransform/sendChat/sendEmote
  - event subscriptions
- Simulation engine:
  - emits `member_joined`, `transform_broadcast`, `chat_broadcast`
  - applies rate limits (drop excessive transforms)
- Client smoothing:
  - interpolation buffer for remote avatars
  - snap thresholds
- Room state model aligned with `realtime-protocol.md`

## Acceptance Criteria
- Switching from simulated provider to real WS provider requires only dependency injection change
- Two browser tabs can “simulate” being separate users by using different local identities

## Mocks
- Realtime uses in-memory simulation; no network

---

# PHASE 4 — Backend Foundation: Server skeleton + DB + Auth (replace mock auth)
**Priority:** P0 (first backend phase)  
**Goal:** Real authentication and user identity, without breaking UI-first progress.

## Scope
- Introduce server app and Postgres.
- Replace mock auth only.

## Deliverables (Backend)
- Server framework (NestJS or Fastify)
- Postgres connection + migrations (Prisma recommended)
- Google OAuth:
  - `/auth/google`, `/auth/google/callback`, `/auth/logout`
- Session strategy:
  - secure HttpOnly cookies OR access+refresh JWT
- `/me` endpoint returns user + profile status

## Deliverables (Frontend)
- Replace mock login with real OAuth flow
- Keep profile/rooms/realtime mocked

## Acceptance Criteria
- Real Google sign-in works in dev
- `/me` returns authenticated user
- UI shows logged-in user identity

## Mock Replacement
- `USE_MOCK_AUTH=false` now uses real server auth

---

# PHASE 5 — Profiles: Persist onboarding & profile card data (replace mock profile)
**Priority:** P0  
**Goal:** Onboarding saves real profiles and loads them consistently.

## Scope
- Replace mock profile store with DB-backed profile service.

## Deliverables (Backend)
- DB schema: `profiles`
- Endpoints:
  - `GET /me` includes profile
  - `PUT /me/profile`
- Validation rules (display name length, interests count)
- Unique display name strategy (suffix if taken)

## Deliverables (Frontend)
- Onboarding wizard calls real endpoints
- Profile card reads real tags and shared interests computed locally or server

## Acceptance Criteria
- Refresh browser: profile persists
- Profile card displays real saved data

## Mock Replacement
- `USE_MOCK_PROFILE=false`

---

# PHASE 6 — Rooms Directory + Join Tokens (replace mock rooms list)
**Priority:** P0  
**Goal:** Real rooms list and join flow; realtime still simulated.

## Scope
- Rooms are real in DB, occupancy can be estimated via Redis presence later.

## Deliverables (Backend)
- DB schema: `rooms`
- `GET /rooms` returns room list
- `POST /rooms/join`:
  - chooses room if none provided (“join hottest” strategy)
  - returns `roomId`, `realtimeToken`, `serverTimeMs`, `wsUrl`
- Room join authorization checks:
  - blocklist enforcement (if already built)
  - capacity check (soft in early phase)

## Deliverables (Frontend)
- Rooms UI uses real `/rooms`
- “Join hottest” uses `/rooms/join`
- Still uses simulated realtime after join

## Acceptance Criteria
- Room list loads from backend
- Join flow returns token and enters bar

## Mock Replacement
- `USE_MOCK_ROOMS=false`

---

# PHASE 7 — Realtime Gateway (WebSocket) (replace simulated realtime)
**Priority:** P0  
**Goal:** True multi-user presence: movement + chat synced via WS.

## Scope
- Introduce WS gateway + Redis for room membership.

## Deliverables (Backend)
- WS gateway with:
  - auth using `realtimeToken`
  - join/leave room
  - broadcast movement transforms
  - broadcast local chat messages
  - basic anti-spam rate limits
- Redis:
  - `room:{id}:members`
  - `room:{id}:transforms`
  - rate limit counters

## Deliverables (Frontend)
- Replace realtime provider with WS provider
- Reconnect logic + token refresh flow (calls `/rooms/join` if needed)

## Acceptance Criteria
- Two real users in same room see each other move smoothly
- Chat messages broadcast to room users
- Disconnect/reconnect restores state

## Mock Replacement
- `USE_MOCK_REALTIME=false`

---

# PHASE 8 — Safety Enforcement (block/mute/report becomes real)
**Priority:** P0  
**Goal:** Safety tools work for real and are enforced across systems.

## Scope
- Add moderation endpoints, block enforcement in matchmaking + realtime.

## Deliverables (Backend)
- DB: `blocks`, `reports`
- Endpoints:
  - `POST /moderation/block`
  - `DELETE /moderation/block/:id`
  - `POST /moderation/report`
- Enforcement:
  - Matchmaking won’t place blocked users together
  - WS gateway filters events from blocked users
- Admin-only tools (basic):
  - view reports list (optional)

## Deliverables (Frontend)
- Safety UI calls real endpoints
- Block immediately removes user from your view (client) + prevents future events

## Acceptance Criteria
- Blocking is persistent and effective instantly
- Reporting creates server record

## Mock Replacement
- Safety flows no longer “local-only”; they are persisted and enforced

---

# PHASE 9 — Presence & Room Health (occupancy becomes real)
**Priority:** P1  
**Goal:** Real occupancy counts and “room health” signals to keep rooms lively.

## Scope
- Use Redis presence heartbeats to compute occupancy.

## Deliverables
- Heartbeat protocol:
  - clients send periodic heartbeat
  - presence TTL refreshed
- Rooms list returns `estimatedOccupancy`
- “Join hottest room” uses real occupancy and region

## Acceptance Criteria
- Rooms UI shows live-ish occupancy
- Occupancy drops on disconnect within TTL window

---

# PHASE 10 — Music MVP (replace mock music, add real playlists)
**Priority:** P1  
**Goal:** Shared ambience with simple, legally-safe playback.

## Scope
- Room playlist metadata from backend; client fetches audio from CDN.

## Deliverables (Backend)
- Playlist model (static config or DB)
- Endpoint: `GET /rooms/:id/music`
- Optional sync:
  - serverTime + trackStartTimeMs

## Deliverables (Frontend)
- Audio player:
  - volume control
  - mute toggle
  - basic sync to server time

## Acceptance Criteria
- Users in the same room hear the same track and roughly aligned timing

---

# PHASE 11 — WebXR / VR entry (UI + locomotion + performance tuning)
**Priority:** P1  
**Goal:** Enter VirtuBar in VR with basic controls and readable panels.

## Scope
- WebXR mode, VR input, comfort settings.

## Deliverables
- WebXR session start
- Teleport locomotion default; snap turn option
- VR UI:
  - wrist menu (settings)
  - diegetic panels for nearby list/profile card
- Performance:
  - reduce draw calls / texture sizes for VR

## Acceptance Criteria
- Quest browser can enter room and move
- UI readable; comfort settings available

---

# PHASE 12 — Voice Phase 1 (WebRTC) (replace mock voice)
**Priority:** P1 (only after WS stability)  
**Goal:** Reliable voice with safe defaults.

## Scope
- Signaling + TURN + SFU recommended.

## Deliverables (Backend)
- Voice signaling endpoint/token
- SFU integration (or managed SFU)
- Room-scoped voice authorization

## Deliverables (Frontend)
- Mic permission flow (real)
- Push-to-talk, per-user mute
- Spatial audio attenuation (distance-based)

## Acceptance Criteria
- Stable voice for small to medium rooms
- Mute works and persists locally per session

## Mock Replacement
- `USE_MOCK_VOICE=false`

---

# PHASE 13 — Performance, Stability, and Observability
**Priority:** P1  
**Goal:** Prepare for real users and debugging.

## Deliverables
- Structured logging in server + gateway
- Metrics:
  - active rooms/users
  - WS event rate
  - voice bandwidth (if enabled)
- Client perf:
  - LOD, frustum culling, asset compression
- Load testing:
  - WS rooms with 40 users

## Acceptance Criteria
- App remains usable under target concurrency
- Clear dashboards/logs for incidents

---

# PHASE 14 — Social Graph Phase 2 (friends, invites, private rooms)
**Priority:** P2  
**Goal:** Longer-term retention via social ties.

## Deliverables
- Friend requests/accepts
- Invites to rooms
- Private rooms / reserved tables
- DMs (optional)

## Acceptance Criteria
- Users can find and rejoin friends reliably

---

# PHASE 15 — Monetization Phase 2 (cosmetics, emotes, events)
**Priority:** P3  
**Goal:** Add revenue without harming core vibe.

## Deliverables
- Cosmetics shop + inventory
- Ticketed events / sponsored rooms
- Admin content tools

---

## Quick Priority Summary
**P0 (must do first):** Phases 0 → 8  
**P1 (next):** Phases 9 → 13  
**P2+ (later):** Phases 14 → 15
