# Phase 14 — Social Graph Phase 2 (friends, invites, private rooms)

## Phase Number & Name
Phase 14 — Social Graph Phase 2 (friends, invites, private rooms)

## Phase Goal (outcome-focused)
Add social graph capabilities to increase retention: friend relationships, invites, and private rooms, enabling users to find and rejoin friends reliably.

## User Value Delivered
- Users can add/accept friends and see when friends are online/in rooms.
- Users can invite friends to join them and create private rooms for group hangouts.

## In Scope
- Friend requests/accepts with persistence.
- Invites to rooms (direct join links/tokens) respecting access controls.
- Private rooms with access limited to invited/friend lists.
- UI surfacing friends online and quick join actions.

## Out of Scope
- Direct messages (optional/future).
- Reputation or rich social feed.

## Dependencies / Preconditions
- Stable auth, profiles, rooms, realtime, safety, presence from prior phases.

## Feature Flags (added / removed / modified)
- Added: `ENABLE_FRIENDS`, `ENABLE_PRIVATE_ROOMS`, `ENABLE_INVITES`; defaults on when stable.

## Functional Requirements
- FR-01: Friend graph persistence (friendships table with pending/accepted states); endpoints to send/accept/decline/cancel requests; list friends and pending requests.
- FR-02: Presence integration: show online/offline and current room for friends (if not private/blocked).
- FR-03: Invites: create invite token or short link for a room (limited TTL); accept invite joins room if authorized.
- FR-04: Private rooms: creation flag makes room accessible only to inviter + allowed friends/invitees; enforcement on `/rooms/join` and WS gateway.
- FR-05: UI: friends list panel with online status and join/invite actions; pending requests management; show invite entry in HUD/room list.
- FR-06: Safety: blocklist supersedes friendship/invites (blocked users cannot be invited or see presence).

## Non-Functional Requirements
- Performance: Friends/presence queries efficient; caching acceptable.
- Accessibility: Friends and invite controls keyboard-accessible; status not color-only.
- Responsiveness: Mobile/desktop UI workable; concise flows for invites and accept.
- Error handling: Clear errors for invite expiry/invalid, private room access denied, and friend request conflicts.

## Mock vs Real Data Matrix
| Area                   | Mocked | Real | Notes |
|------------------------|:------:|:----:|-------|
| Auth/Profiles/Rooms    | ❌     | ✅   | Existing |
| Friends graph          | ❌     | ✅   | New real feature |
| Invites                | ❌     | ✅   | Real tokens/links |
| Private rooms access   | ❌     | ✅   | Enforced server-side |
| Voice                  | ❌     | ✅   | From Phase 12 |

## Acceptance Criteria
- Users can send/accept/decline friend requests; accepted friends appear in friends list with presence (online/offline, room when allowed).
- Users can create private rooms and invite friends; invitees can join via link/token; non-invited users are denied.
- Blocked users cannot be invited and do not see each other’s presence.
- UI works on desktop and mobile for friends/invites/private room flows.

## Demo Checklist
- Send and accept a friend request; show online status and room info when in a room.
- Create a private room; send invite link; invitee joins successfully; non-invited user is denied.
- Show block overriding friendship/invite (block prevents visibility/join).

## Exit Criteria (phase complete)
- Social graph, invites, and private room enforcement live with UI support and safety interoperability.
- Feature flags documented; defaults enabled after validation.
- Ready for Phase 15 (monetization) on top of social layer.
