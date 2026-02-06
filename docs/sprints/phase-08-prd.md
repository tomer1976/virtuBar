# Phase 8 — Safety Enforcement (block/mute/report becomes real)

## Phase Number & Name
Phase 8 — Safety Enforcement (block/mute/report becomes real)

## Phase Goal (outcome-focused)
Move safety controls from local mocks to enforced backend logic so blocks and reports persist, and realtime respects block relationships, improving trust and safety in live sessions.

## User Value Delivered
- Users can block others and have that block enforced across matchmaking and realtime delivery.
- Reports create server records for moderation review, enabling accountability.

## In Scope
- Backend: `blocks`, `reports` tables and moderation endpoints (`POST /moderation/block`, `DELETE /moderation/block/:id`, `POST /moderation/report`).
- Enforcement: matchmaking/join checks and WS gateway filtering events from blocked users.
- Frontend: Wire safety UI to real endpoints; immediate local removal/hiding plus server persistence.
- Basic admin visibility optional (list reports) but not required for user-facing flow.

## Out of Scope
- Voice moderation (still mocked voice).
- Advanced moderator tooling (kick/ban UI) beyond endpoints.
- Reputation scoring.

## Dependencies / Preconditions
- Real auth/profiles (Phases 4–5), real rooms/join tokens (Phase 6), realtime gateway (Phase 7) in place.
- Blocklist awareness in join flow and WS gateway integration.

## Feature Flags (added / removed / modified)
- Modified: `USE_MOCK_SAFETY` default false after this phase; mock fallback allowed.

## Functional Requirements
- FR-01: DB migrations for `blocks` (blocker_user_id, blocked_user_id, timestamps) and `reports` (reporter_user_id, reported_user_id, room_id?, type, description, evidence_url?, status, timestamps).
- FR-02: `POST /moderation/block` creates block; `DELETE /moderation/block/:blockedUserId` removes it.
- FR-03: `POST /moderation/report` stores report with type and optional evidence URL; status defaults to open.
- FR-04: Matchmaking (`/rooms/join`) prevents placing blocked pairs together (blocker vs blocked) where feasible.
- FR-05: WS gateway filters events from blocked users to blocker (movement/chat not delivered).
- FR-06: Frontend safety UI calls real endpoints; block immediately hides user locally and requests server block; report sends data and shows confirmation.
- FR-07: Block state persists across sessions and is respected on reconnect.

## Non-Functional Requirements
- Performance: Safety checks add minimal latency to join/WS processing.
- Accessibility: Safety actions remain reachable within 1–2 interactions; confirmations readable.
- Responsiveness: Safety UI works on mobile/desktop; block/report feedback is prompt (<1s perceived).
- Error handling: Server errors surface as toasts; UI reverts local changes if block fails.

## Mock vs Real Data Matrix
| Area                | Mocked | Real | Notes |
|---------------------|:------:|:----:|-------|
| Auth/Profile        | ❌     | ✅   | Real |
| Rooms/Join          | ❌     | ✅   | Real |
| Realtime transport  | ❌     | ✅   | WS |
| Safety enforcement  | ❌     | ✅   | Blocks/reports persisted and enforced |
| Voice               | ✅     | ❌   | Still mocked |

## Acceptance Criteria
- Blocking a user persists server-side and immediately hides them locally; their realtime events no longer appear for the blocker after next tick.
- Blocklist prevents co-placement in the same room when possible; joining same room is rejected or rerouted.
- Reporting a user creates a record with correct type and description; confirmation shown to reporter.
- Safety flows remain functional when toggling to mock mode (`USE_MOCK_SAFETY=true`).

## Demo Checklist
- User A blocks User B; B disappears for A and cannot send visible chat/movement to A.
- Attempt to join same room after block; observe block enforcement (reject or reroute).
- Submit a report with description; verify backend record via admin/dev tool or API response.
- Toggle mock safety to show legacy mock behavior still works for demos.

## Exit Criteria (phase complete)
- Safety endpoints live; block/report persist and are enforced in join and WS layers.
- Frontend safety UI integrated with real endpoints and shows reliable feedback.
- Mock safety fallback retained via flag.
- Ready for Phase 9 (presence & room health) and beyond.
