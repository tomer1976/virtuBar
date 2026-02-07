# realtime-protocol.md

# VirtuBar — Realtime Protocol (WebSocket)

Version: 1.0  
Last Updated: 2026-02-06

## 1. Transport
- WebSocket (Socket.IO or raw WS)
- Auth via `realtimeToken` (room-scoped, short TTL)

## 2. Envelope
All events follow:
{
  "v": 1,
  "t": "event_name",
  "ts": 1710000000000,
  "payload": { ... }
}

## 3. Client → Server Events

### join_room
payload:
- roomId: string
- user: { userId, displayName, avatarId }

### heartbeat
payload:
- roomId
- clientTimeMs
- lastSeq

### avatar_transform
payload:
- roomId
- seq: number
- x,y,z: number
- rotY: number
- anim: "idle" | "walk" | "dance" | "wave"
- speaking: boolean

Rate limit:
- max 20/sec (desktop), 15/sec (mobile)

### local_chat
payload:
- roomId
- text: string (max 240)
- mode: "local"

### emote
payload:
- roomId
- emoteId: "cheers" | "laugh" | ...

## 4. Server → Client Events

### room_state
payload:
- roomId
- serverTimeMs
- members: [{userId, displayName, avatarId, x,y,z,rotY,anim}]

### member_joined
payload:
- member: { ... }

### member_left
payload:
- userId

### avatar_transform_broadcast
payload:
- userId
- seq
- x,y,z,rotY,anim,speaking

### chat_broadcast
payload:
- userId
- text
- messageId

### moderation_action
payload:
- type: "kicked" | "banned" | "mutedByMod"
- reason

## 5. Client Smoothing
- Interpolate transforms over 100–200ms buffer
- Snap if error > threshold (anti-drift)

## 6. Error Handling
- If token expired:
  - server emits `auth_error`
  - client calls `/rooms/join` again

## 7. Phase 7 Handoff (Client Expectations)
- Client seam: implement `RealtimeProvider` (apps/web/src/net/realtime/types.ts) and reuse protocol constants from apps/web/src/net/realtime/constants.ts; envelopes and payload shapes must match this doc.
- Provider selection: `VITE_REALTIME_PROVIDER=sim|ws` (default `sim`); `ws` should bind a real WebSocket transport while keeping identical event names and payloads.
- Auth & join: client expects a room-scoped `realtimeToken` from `/rooms/join`, then sends `join_room` immediately after WS connect. Expired/invalid tokens should emit `auth_error` and keep the socket open for retry.
- Rate limits: enforce `avatar_transform` at 20/sec desktop and 15/sec mobile; `local_chat` max length 240. Over-limit events can be dropped or throttled but must not crash the client.
- Ordering: transforms are applied in seq order per user; stale or out-of-order seq should be ignored server-side. Broadcasting echoes to the sender is acceptable and used for smoothing.
- Reconnect: on reconnect, emit `room_state` with current members and last-known transforms so clients can resync without a full reload.

