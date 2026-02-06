# Phase 14 — Social Graph Phase 2 (friends, invites, private rooms)

## Phase Overview
Add friends, invites, and private rooms with presence visibility and enforcement, keeping safety rules intact.

## Frontend Tasks
- [ ] Add friends UI: list friends with presence (online/offline, room name if allowed), pending requests, accept/decline/cancel actions.
- [ ] Add invite UI: create invite links/tokens for current room; show incoming invite prompts; handle expired/invalid invite errors.
- [ ] Add private room creation option in room creation/selection flow; indicate room privacy in UI.
- [ ] Integrate blocklist: hide blocked users from friends/presence/invites.
- [ ] Ensure mobile-friendly layout for friends and invites panels.

## Backend Tasks (if applicable)
- [ ] Add `friendships` table (user_id, friend_user_id, status=pending/accepted, timestamps) with unique constraint.
- [ ] Implement endpoints: send request, accept, decline, cancel, list friends, list pending.
- [ ] Integrate presence into friends list (online/offline + roomId when allowed); ensure private room respect.
- [ ] Add invites: create invite token/link for a room with TTL; endpoint to redeem invite and join if authorized.
- [ ] Implement private rooms flag in `rooms` table; enforce access control in `/rooms/join` (only inviter, invitees, or friends if allowed).
- [ ] Enforce blocklist: blocked pairs cannot friend, invite, or see presence.

## Realtime Tasks (if applicable)
- [ ] Ensure WS join authorization respects private room access decisions; reject unauthorized joins.
- [ ] Optionally push friend presence updates via existing channels (or rely on polling for now).

## Voice Tasks (if applicable)
- [ ] No changes; voice continues to work within authorized rooms.

## Infrastructure / DevOps Tasks (if applicable)
- [ ] Add migrations for friendships and invites; add necessary indexes.
- [ ] Add env/config for invite TTL and base URL for links.

## State & Mock Replacement Tasks
- [ ] Enable feature flags `ENABLE_FRIENDS`, `ENABLE_PRIVATE_ROOMS`, `ENABLE_INVITES` by default after validation; no mock path expected.

## File-Level Guidance
- [ ] Place friendships module under `apps/server/src/modules/friendships`; invites/private room logic under `rooms` module.
- [ ] Add shared types for friend records, invite payloads, and private room flags to `packages/shared`.
- [ ] Store friends/invite UI components under `apps/web/src/ui/social` (or similar).

## Validation & Testing
- [ ] Manual: send/accept friend request; verify presence status and room info when allowed.
- [ ] Manual: create private room; invite friend; friend joins; unauthorized user is denied.
- [ ] Manual: block user, then attempt friend/invite interactions to confirm denial.
- [ ] Automated: add integration tests for friend request lifecycle and invite redemption with access control.

## Cleanup & Refactor
- [ ] Remove any leftover mock social placeholders; ensure feature flags documented.
- [ ] Document access control rules and interactions with blocklist.

## Handoff to Next Phase
- [ ] Confirm social graph and private rooms stable; ready for Phase 15 (monetization) built on social layer.
