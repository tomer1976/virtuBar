# Phase 6 — Rooms Directory + Join Tokens (replace mock rooms list)

## Phase Number & Name
Phase 6 — Rooms Directory + Join Tokens (replace mock rooms list)

## Phase Goal (outcome-focused)
Replace mock rooms directory with real backend-backed rooms and join flow, issuing realtime/voice tokens for future phases while keeping realtime transport and voice themselves mocked/simulated.

## User Value Delivered
- Users see real rooms from the backend and can request to join a room via API, preparing for true multiplayer by delivering room selection tied to server state.
- Enables matchmaking strategy (“join hottest room”) with server-side logic, improving perceived liveness beyond static mocks.

## In Scope
- Backend rooms schema and endpoints: `GET /rooms`, `POST /rooms/join`.
- Token issuance for realtime/voice placeholders (short TTL, room-scoped) even if not yet consumed by real services.
- Room selection UX wired to backend responses; mock realtime still drives in-venue state.
- Blocklist and capacity checks (soft) in join logic.

## Out of Scope
- Actual WebSocket realtime transport (Phase 7).
- Actual voice transport (Phase 12).
- Presence-based live occupancy (comes Phase 9); use estimated occupancy or stub for now.

## Dependencies / Preconditions
- Real auth + profiles (Phases 4–5) in place.
- DB and migrations pipeline available.

## Feature Flags (added / removed / modified)
- Modified: `USE_MOCK_ROOMS` default false after this phase; mock fallback kept.
- Added: `ROOM_JOIN_STRATEGY` (e.g., `hottest`, `direct`), `USE_ESTIMATED_OCCUPANCY_STUB=true` until Phase 9.

## Functional Requirements
- FR-01: DB schema `rooms` with fields (id, name, theme, is_private, capacity, region, created_by, created_at).
- FR-02: `GET /rooms` returns list with {id, name, theme, isPrivate, capacity, estimatedOccupancy} (estimated occupancy may be stubbed/static until presence is real).
- FR-03: `POST /rooms/join` accepts optional roomId; if absent, selects per “join hottest room” strategy; returns roomId, realtimeToken, voiceToken (placeholder), wsUrl, voiceUrl, serverTimeMs.
- FR-04: Join logic applies blocklist check (if blocks table exists) and capacity soft check (warn but allow if soft limit exceeded for now).
- FR-05: Frontend rooms screen consumes real `GET /rooms`; “Join hottest room” calls `POST /rooms/join` and transitions into bar with returned roomId + tokens stored for later use.
- FR-06: Feature flag allows fallback to mock rooms list without code changes.

## Non-Functional Requirements
- Performance: Rooms list fetch within normal API latency (<500ms dev); join call responsive.
- Accessibility: Rooms list and buttons keyboard accessible; statuses not color-only.
- Responsiveness: Rooms cards and CTA render well on mobile widths.
- Error handling: Clear errors for join failures (capacity, block) and fetch failures; retry paths.

## Mock vs Real Data Matrix
| Area                   | Mocked | Real | Notes |
|------------------------|:------:|:----:|-------|
| Auth/Profile           | ❌     | ✅   | From prior phases |
| Rooms directory        | ❌     | ✅   | Real `GET /rooms` |
| Room join tokens       | ❌     | ✅   | Real issuance; realtime still mock |
| Realtime state         | ✅     | ❌   | Still simulated (Phase 7) |
| Voice                  | ✅     | ❌   | Placeholder token only |
| Occupancy estimates    | ⚠️     | ⚠️   | Stub/estimated until Phase 9 |

## Acceptance Criteria
- Rooms screen loads from backend and displays list with theme/capacity/estimated occupancy.
- “Join hottest room” uses backend selection; returns tokens and roomId; UI transitions to bar using that room context while still using mock realtime inside.
- Join failure due to blocklist (if present) or capacity soft-check surfaces a user-facing error.
- Mock rooms fallback works when `USE_MOCK_ROOMS=true`.

## Demo Checklist
- Load rooms list from backend; show cards and filters working.
- Trigger “Join hottest room”; display returned roomId/tokens and enter bar mock session.
- Show direct join of a specific room ID.
- Demonstrate error state (e.g., simulate capacity/block) and UI handling.
- Toggle `USE_MOCK_ROOMS` to show fallback list still works.

## Exit Criteria (phase complete)
- Real rooms directory and join API live; frontend wired and stable with fallback to mocks.
- Token issuance in place for realtime/voice handoff in later phases.
- Ready for Phase 7 to replace simulated realtime with actual WebSocket gateway.
