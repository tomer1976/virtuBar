# architecture.md

# VirtuBar — Architecture

Version: 1.0  
Last Updated: 2026-02-06

## 1. Architecture Summary
VirtuBar is a real-time, multi-user 3D web application supporting VR (WebXR), desktop, and mobile. Core real-time state sync uses WebSockets; voice uses WebRTC, ideally routed through an SFU for scalability. :contentReference[oaicite:13]{index=13}

## 2. High-Level System Diagram (Conceptual)

Client Apps:
- Web Client (Desktop)
- Web Client (Mobile / PWA)
- WebXR Client (VR browsers)

Backend Services:
- API Service (REST/GraphQL)
- Realtime Gateway (WebSocket)
- Voice Service (WebRTC SFU + signaling)
- Matchmaking/Rooms Service
- Moderation Service
- Media Service (music playlists)
- Observability (logs/metrics/traces)

Data Stores:
- Primary DB (Postgres recommended)
- Redis (presence, ephemeral room state, rate limits)
- Object Storage (avatars assets, screenshots, report evidence)
- Analytics pipeline (events)

## 3. Client Architecture

### 3.1 Core Tech Choices
- UI: React
- 3D: Three.js (or Babylon.js) with React Three Fiber optional
- WebXR: WebXR API integration
- Networking: Socket.IO (or WS) for realtime, WebRTC for media :contentReference[oaicite:14]{index=14}

### 3.2 Client Modules
- **Renderer**
  - Scene loader (GLTF)
  - Lighting, post-processing
  - Avatar rendering
- **Input Controller**
  - Desktop: WASD/mouse
  - Mobile: touch joystick
  - VR: controller input, teleport
- **Realtime Client**
  - Connect/disconnect lifecycle
  - Room join/leave
  - State interpolation & reconciliation
- **Voice Client**
  - Mic permission, device selection
  - WebRTC connect to SFU
  - Positional/spatial audio via WebAudio
- **UI Overlay**
  - Profile card
  - Room list
  - Settings
  - Safety controls

## 4. Backend Architecture

### 4.1 API Service
Responsible for:
- Auth callback handling (OAuth)
- Profile CRUD
- Inventory (cosmetics)
- Room directory metadata
- Moderation endpoints

Suggested stack:
- Node.js (NestJS or Fastify)
- Postgres via Prisma
- JWT auth (short-lived access + refresh) or secure cookies

### 4.2 Realtime Gateway (WebSocket)
Responsible for:
- Presence: join/leave
- Movement + animation events
- Local text chat events
- Emote events
- Server-authoritative constraints:
  - rate limits
  - anti-spam
  - basic validation

The original Shaker relied on a persistent connection to synchronize movements/chats; VirtuBar formalizes it with modern WebSockets. :contentReference[oaicite:15]{index=15}

### 4.3 Rooms Service
Responsible for:
- Room creation/destruction
- Capacity management
- “Fill rooms first” matchmaking strategy (avoid empty bar problem)
- Sticky rooms for friends (phase 2)

### 4.4 Voice Service (WebRTC)
Two layers:
1) Signaling (server) — exchange SDP/ICE
2) Media routing (SFU) — forward streams to room peers

Why SFU:
- Mesh WebRTC scales poorly with N users (N^2 streams)
- SFU centralizes routing per room

### 4.5 Media/Music Service
MVP:
- Stream or deliver playlist metadata
- Clients fetch audio via CDN/object storage
- Optional: simple “sync” via server time offsets

Phase 2:
- Voting, DJ rotation, event rooms

## 5. Data Model Strategy
- **Persistent** in Postgres:
  - users, profiles, friend edges, blocks, reports, inventory
- **Ephemeral** in Redis:
  - presence, room membership, last-known transforms, rate limiting buckets

## 6. Realtime State: Authoritative Model
Recommendation: **Server-authoritative room state for membership + basic validation**, with **client-authoritative movement** but bounded by sanity checks:
- Client sends movement intent or transform snapshots (rate limited)
- Server broadcasts to others
- Server can reject out-of-bounds transforms (teleport hacks)

## 7. Message Flow (Examples)

### 7.1 Join Room
1) Client calls API `POST /rooms/join`
2) Receives `roomId` + `realtimeToken` + `voiceToken`
3) Connect WebSocket → `join_room`
4) Server returns:
   - current occupants list
   - last-known transforms
5) Client connects to SFU with `voiceToken`

### 7.2 Movement Update
- Client → WS: `avatar_transform {x,y,z,rot,anim}`
- Server:
  - validate rate limit
  - broadcast to room occupants
- Other clients:
  - interpolate transform for smoothness

### 7.3 Proximity Voice (Conceptual)
- SFU forwards audio streams for all room users
- Client applies per-speaker gain based on distance
- Optional optimization: only subscribe to nearby speakers (advanced)

## 8. Security
- TLS for all traffic (HTTPS/WSS)
- JWT tokens scoped:
  - API token
  - Realtime token (room-scoped, short TTL)
  - Voice token (room-scoped, short TTL)
- Abuse prevention:
  - rate limiting WS events
  - profanity filter for public text chat (optional)
  - blocklist enforcement at matchmaking and room join

## 9. Scalability
- Horizontal scale:
  - multiple realtime gateway instances behind load balancer
  - sticky sessions or Redis pub/sub for room broadcast (or dedicated room shards)
- Voice:
  - SFU per region, per room allocation
- CDN for static assets (3D, audio)

## 10. Observability
- Structured logs (requestId, userId, roomId)
- Metrics:
  - active rooms, users per room
  - WS message rate
  - SFU bandwidth
- Tracing:
  - join-room flow across services

## 11. Deployment (Suggested)
- Docker + Kubernetes
- Environments:
  - dev, staging, production
- Secrets:
  - OAuth keys, DB creds, TURN creds

