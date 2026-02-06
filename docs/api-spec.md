# api-spec.md

# VirtuBar — API Specification (REST)

Version: 1.0  
Last Updated: 2026-02-06

Base URL: `/api`

## 1. Auth

### GET /auth/google
Redirect to Google OAuth.

### GET /auth/google/callback
Handles OAuth callback.
Response:
- sets session cookie OR returns JWT bundle
- redirects to `/onboarding` or `/bar`

### POST /auth/logout
Invalidate session.

## 2. Profile

### GET /me
Returns current user + profile.

### PUT /me/profile
Body:
- displayName: string
- avatarId: string
- avatarConfig: object
- interests: string[]
- privacyLevel: "public" | "limited"

Validations:
- interests max 20
- displayName length 3–20

## 3. Rooms

### GET /rooms
Query:
- region?
- theme?
Returns:
- rooms: [{id,name,theme,isPrivate,capacity,estimatedOccupancy}]

### POST /rooms/join
Body:
- roomId?: uuid (optional; if absent use matchmaking)
- deviceType: "desktop" | "mobile" | "vr"
Response:
- roomId
- realtimeToken (short TTL, room-scoped)
- voiceToken (short TTL, room-scoped)
- wsUrl
- voiceUrl
- serverTimeMs

## 4. Moderation

### POST /moderation/report
Body:
- reportedUserId: uuid
- roomId?: uuid
- type: "harassment" | "spam" | "hate" | "other"
- description: string
- evidenceUrl?: string

### POST /moderation/block
Body:
- blockedUserId: uuid

### DELETE /moderation/block/:blockedUserId

## 5. Inventory (Phase 2)

### GET /inventory/items
### GET /inventory/me
### POST /inventory/purchase

