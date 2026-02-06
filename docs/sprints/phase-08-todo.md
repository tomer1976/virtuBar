# Phase 8 — Safety Enforcement (block/mute/report becomes real)

## Phase Overview
Implement persistent block/report flows with server enforcement across matchmaking and realtime; wire safety UI to real endpoints while keeping voice mocked.

## Frontend Tasks
- [ ] Replace mock safety calls with real API calls: `POST /moderation/block`, `DELETE /moderation/block/:blockedUserId`, `POST /moderation/report`.
- [ ] On block, immediately hide user locally and optimistically update UI; rollback if API fails.
- [ ] Ensure WS layer requests block state and filters incoming events locally until server enforcement applies.
- [ ] Add user feedback (toasts/dialog) for block/report success and error states.
- [ ] Keep `USE_MOCK_SAFETY` flag path working for demo fallback.

## Backend Tasks (if applicable)
- [ ] Add migrations for `blocks` (blocker_user_id, blocked_user_id, timestamps) and `reports` (reporter_user_id, reported_user_id, room_id?, type, description, evidence_url?, status, created_at/updated_at).
- [ ] Implement `POST /moderation/block` and `DELETE /moderation/block/:blockedUserId` with auth and idempotency checks.
- [ ] Implement `POST /moderation/report` storing report with type and optional evidence URL; default status open.
- [ ] Integrate block checks into `/rooms/join` to avoid placing blocked pairs together (reject or reroute strategy).
- [ ] Integrate block enforcement in WS gateway: suppress events from blocked users to blocker.
- [ ] Add structured logging for block/report actions.

## Realtime Tasks (if applicable)
- [ ] Update WS gateway to load block list on join and cache per-connection; enforce on broadcast path.
- [ ] Provide a lightweight blocklist refresh mechanism (e.g., on block event, push update or require reconnect) to apply mid-session.

## Voice Tasks (if applicable)
- [ ] Voice still mocked; ensure no-ops when voice token present.

## Infrastructure / DevOps Tasks (if applicable)
- [ ] Run migrations for blocks/reports tables; ensure rollback path.
- [ ] Add any needed indexes on block/report tables for lookup performance.

## State & Mock Replacement Tasks
- [ ] Default `USE_MOCK_SAFETY=false` to enable real enforcement; document mock fallback behavior.

## File-Level Guidance
- [ ] Place moderation module under `apps/server/src/modules/moderation` handling blocks/reports.
- [ ] Keep shared types for block/report payloads in `packages/shared`.
- [ ] Update WS gateway code in `apps/realtime` to consult block cache during broadcast.

## Validation & Testing
- [ ] Manual: User A blocks User B; verify B disappears locally for A and events stop arriving.
- [ ] Manual: Attempt joint room entry post-block; ensure join is rejected or rerouted.
- [ ] Manual: Submit report and verify creation via API/DB.
- [ ] Automated: Add integration tests for block/report endpoints and join enforcement logic.
- [ ] Toggle `USE_MOCK_SAFETY=true` to confirm mock path still functional.

## Cleanup & Refactor
- [ ] Remove obsolete mock safety wiring when real mode active; isolate mock path behind flag only.
- [ ] Document block/report flows and enforcement touchpoints for future moderation features.

## Handoff to Next Phase
- [ ] Confirm safety enforcement stable; prerequisites ready for Phase 9 (presence & room health) and later phases.
