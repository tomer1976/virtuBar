# PRD.md

# VirtuBar — Product Requirements Document (PRD)

Version: 1.0  
Owner: Product / Founder  
Last Updated: 2026-02-06

## 1. Overview

### 1.1 Product Summary
VirtuBar is a modern, cross-platform virtual pub experience that recreates the “serendipitous social interactions” of a real nightlife scene in a 3D environment. Users enter a virtual venue, move around as avatars, meet friends and new people, chat (text + spatial voice), discover shared interests, and participate in light social mini-activities and music experiences. :contentReference[oaicite:2]{index=2}

VirtuBar will run on:
- Desktop web browsers
- Mobile browsers (PWA-friendly)
- VR headsets via WebXR

### 1.2 Problem Statement
Traditional social apps and chatrooms are too “flat” and do not replicate the flow of meeting people organically. Shaker’s core insight was that a bar-like spatial environment makes approaching people and forming small conversations feel natural, while still being online. :contentReference[oaicite:3]{index=3}

### 1.3 Goals
- Deliver an immersive “virtual pub” where socializing feels spontaneous and fun.
- Support real-time multi-user presence (movement, proximity interactions).
- Enable safe, controllable social interaction (mute/block/report).
- Offer cross-platform access (VR/desktop/mobile) to avoid fragmented communities. :contentReference[oaicite:4]{index=4}

### 1.4 Non-Goals (v1)
- Full user-generated worlds / building tools (no Roblox-style creation).
- Full-body or face tracking as a requirement.
- Dating-only positioning (can be a use case, but product is “social venue”).
- Complex economy (player-to-player trading, crypto, etc.).

---

## 2. Target Users & Personas

### 2.1 Personas
1) **The Nightlife Socializer**
- Wants casual conversation, music, and quick connections.
- Joins busy rooms; dislikes empty venues.

2) **Friends Hangout Group**
- Wants a “third place” to meet remotely.
- Needs private areas / easy group formation.

3) **VR Regular**
- Uses Quest/VR frequently, expects spatial voice and gestures.

4) **Mobile Drop-in**
- Wants easy access without installation; simplified controls.

---

## 3. Key Product Pillars (from Shaker DNA → modern VirtuBar)

1) **Spatial Serendipity**
- Users move in a venue; conversations form in clusters.
- “Approach” someone to start interaction—like real life. :contentReference[oaicite:5]{index=5}

2) **Identity + Comfort Controls**
- Shaker used real identities to reduce bad behavior. VirtuBar balances:
  - Display name + optional verification
  - Strong moderation and user controls (mute/block/report). :contentReference[oaicite:6]{index=6}

3) **Shared Atmosphere**
- Music and ambient sound matter; room feels like an event. :contentReference[oaicite:7]{index=7}

4) **Cross-Platform**
- Desktop/mobile/VR in the same rooms. :contentReference[oaicite:8]{index=8}

---

## 4. Core Features (MVP)

### 4.1 Account & Onboarding
- Auth methods:
  - OAuth: Google (required MVP)
  - Optional: Facebook (phase 2)
  - Email/password (optional; phase 2)
- First-time onboarding:
  - Pick display name
  - Select avatar base
  - Choose interest tags (icebreakers)
  - Mic permission & calibration flow (if voice enabled)

### 4.2 Rooms / Venues
- Concept: multiple “bars” (rooms) to keep density healthy.
- Room types:
  - **Public**: default matchmaking
  - **Theme**: music lounge / sports bar / quiet lounge
  - **Private**: invite-only (phase 2)
- Capacity:
  - 20–40 users per room target (tunable)
- Anti-empty strategy:
  - “Hot rooms” directory
  - Matchmaking favors filling rooms to maintain vibe.

### 4.3 Avatar Presence & Movement
- 3D avatars in a shared space.
- Movement:
  - Desktop: WASD + mouse look
  - Mobile: virtual joystick + tap interactions
  - VR: teleport or smooth locomotion
- Basic animations:
  - walk/idle
  - wave/dance
  - mouth movement when speaking (simple)

### 4.4 Proximity Social Interaction
- Proximity voice (MVP if possible, otherwise phase 1.5):
  - Users hear nearby voices with spatial attenuation
  - Push-to-talk optional toggle
- Text chat:
  - Local (nearby) text chat bubble
  - Direct message (DM) (phase 2)

### 4.5 Profile / “Virtual Phone” Panel (Shaker-inspired)
Shaker had a profile viewer inside the bar so users didn’t have to leave the scene. VirtuBar will implement:
- Click/tap an avatar → Profile Card overlay:
  - Display name
  - Interest tags / “shared interests” highlights
  - Mutual friends (future if we add social graph)
  - Actions: Add Friend, Invite to private table, Mute, Block, Report :contentReference[oaicite:9]{index=9}

### 4.6 Interest Icebreakers
- When viewing someone:
  - “You both like: Jazz, Startups, Travel”
- Privacy:
  - Users choose what to share (tags only in MVP).

### 4.7 Music
- MVP approach (simple & legal):
  - Curated playlists of licensed/royalty-free tracks hosted by VirtuBar
- Phase 2:
  - Jukebox voting
  - DJ rotation

---

## 5. Safety, Trust, and Moderation (MVP Required)
- Client controls:
  - Mute user (voice)
  - Hide user (local)
  - Block user (prevents future matchmaking contact)
  - Report user (with optional clip/metadata)
- Server enforcement:
  - Rate limit spam chat events
  - Kick/ban tools for moderators
- Compliance:
  - Store minimal data; clear privacy policy.

---

## 6. Business Model (Phased)
Shaker planned monetization via virtual goods and sponsored events. VirtuBar modernizes this. :contentReference[oaicite:10]{index=10}
- MVP: free
- Phase 2:
  - Virtual goods (cosmetics, emotes, “buy a drink” animations)
  - Premium subscription:
    - Exclusive venues
    - Cosmetic packs
    - Custom “reserved table”
  - Ticketed events / sponsored rooms

---

## 7. Success Metrics
- Activation:
  - % users who complete onboarding + enter a room
- Engagement:
  - Avg session length
  - Return rate (D1, D7)
- Social:
  - Avg interactions per session (profile opens, chats, voice proximity events)
  - Friend adds / follow actions
- Safety:
  - Reports per DAU
  - Repeat offender rate

---

## 8. MVP Scope & Phased Roadmap

### Phase 0: Prototype (Single Room)
- 3D scene load
- Multi-user movement sync
- Basic text chat
- Basic profile card

### Phase 1: MVP Launch
- Auth + onboarding
- Rooms + matchmaking
- Movement + interactions
- Proximity voice (if stable) or staged rollout
- Safety toolkit (mute/block/report)
- Music playback (room ambient)

### Phase 2
- Private rooms / reserved tables
- DM system
- Jukebox voting / DJ rotation
- Events (host tools)
- Expanded avatar customization

---

## 9. Requirements (Detailed)

### 9.1 Functional Requirements
**FR-001** User can sign in with Google OAuth.  
**FR-010** User can enter a public room and see other avatars in near real-time.  
**FR-020** User movement updates are broadcast to others in the same room via WebSockets. :contentReference[oaicite:11]{index=11}  
**FR-030** User can open another user’s profile card and see shared interest tags.  
**FR-040** User can mute another user’s voice and block them.  
**FR-050** Room plays music track(s) synced enough for shared vibe.  
**FR-060** VR mode works via WebXR if device supports it. :contentReference[oaicite:12]{index=12}  

### 9.2 Non-Functional Requirements
- Latency targets:
  - Movement: < 200ms perceived update (with interpolation)
  - Voice: < 300ms round-trip perceived
- Performance:
  - Desktop: 60 fps target
  - Mobile: 30 fps acceptable
  - VR: 72 fps target (Quest) with adaptive quality
- Reliability:
  - Room server handles disconnects gracefully
- Security:
  - HTTPS/WSS only; JWT or session cookies

---

## 10. Open Questions
- Which avatar pipeline for MVP: Ready Player Me vs built-in basic avatars?
- Voice architecture: pure P2P vs SFU (recommended SFU for scaling).
- Music licensing strategy for phase 2 integrations.

