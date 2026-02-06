# db-schemas.md

# VirtuBar — Database Schemas (Postgres + Redis)

Version: 1.0  
Last Updated: 2026-02-06

## 1. Storage Strategy
- Postgres: durable data (users, profiles, relationships, reports, inventory)
- Redis: ephemeral state (presence, room membership, rate limits)

## 2. Postgres Schema (Logical)

### 2.1 users
Stores authentication identity and core account metadata.

| column | type | notes |
|---|---|---|
| id | uuid (pk) | |
| created_at | timestamptz | |
| updated_at | timestamptz | |
| email | text unique | from OAuth if available |
| auth_provider | text | `google`, `facebook`, `email` |
| auth_provider_user_id | text | provider subject |
| status | text | `active`, `suspended`, `deleted` |
| last_login_at | timestamptz | |

### 2.2 profiles
User-facing social identity (display name, avatar, tags).

| column | type | notes |
|---|---|---|
| user_id | uuid (pk/fk->users.id) | |
| display_name | text | unique-ish (enforce with suffix) |
| bio | text | optional |
| avatar_id | text | points to avatar assets |
| avatar_config | jsonb | colors, cosmetics |
| interests | text[] | tags (MVP) |
| locale | text | `en`, `he`, etc |
| privacy_level | text | `public`, `limited` |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 2.3 rooms
Room metadata (not occupancy).

| column | type | notes |
|---|---|---|
| id | uuid (pk) | |
| name | text | |
| theme | text | `lounge`, `dance`, `sports` |
| is_private | boolean | |
| capacity | int | |
| region | text | `eu`, `me`, etc |
| created_by | uuid fk | nullable for system rooms |
| created_at | timestamptz | |

### 2.4 room_memberships (optional durable, mostly for analytics)
| column | type | notes |
|---|---|---|
| id | uuid pk | |
| room_id | uuid fk | |
| user_id | uuid fk | |
| joined_at | timestamptz | |
| left_at | timestamptz | |
| join_source | text | `matchmaking`, `invite`, `direct` |

### 2.5 friendships (phase 2)
| column | type |
|---|---|
| user_id | uuid |
| friend_user_id | uuid |
| status | text (`pending`, `accepted`) |
| created_at | timestamptz |

Unique constraint on (user_id, friend_user_id).

### 2.6 blocks
| column | type |
|---|---|
| id | uuid pk |
| blocker_user_id | uuid fk |
| blocked_user_id | uuid fk |
| created_at | timestamptz |

### 2.7 reports
| column | type | notes |
|---|---|---|
| id | uuid pk | |
| reporter_user_id | uuid fk | |
| reported_user_id | uuid fk | |
| room_id | uuid fk | nullable |
| report_type | text | `harassment`, `spam`, `hate`, `other` |
| description | text | |
| evidence_url | text | object storage link |
| status | text | `open`, `reviewing`, `resolved` |
| created_at | timestamptz | |

### 2.8 inventory_items
Defines purchasable cosmetics/emotes (phase 2).

| column | type |
|---|---|
| id | uuid pk |
| sku | text unique |
| type | text (`cosmetic`, `emote`, `drink`) |
| name | text |
| metadata | jsonb |
| price_cents | int |
| active | boolean |

### 2.9 user_inventory
| column | type |
|---|---|
| id | uuid pk |
| user_id | uuid fk |
| item_id | uuid fk |
| acquired_at | timestamptz |

## 3. Redis Keys (Ephemeral)

### 3.1 Presence
- `presence:user:{userId}` → `{roomId, lastSeen, deviceType}`
- TTL refreshed every heartbeat

### 3.2 Room membership
- `room:{roomId}:members` → set(userId)
- `room:{roomId}:transforms` → hash(userId -> packedTransform)

### 3.3 Rate limiting
- `rl:ws:{userId}:{eventType}:{minuteBucket}` → counter

## 4. Event Analytics (Recommended)
Append-only event store or analytics SDK events:
- `room_join`
- `room_leave`
- `profile_open`
- `mute_user`
- `block_user`
- `report_user`
- `voice_active_seconds`
- `session_duration`

