# analytics.md

# VirtuBar — Analytics & Telemetry

Version: 1.0  
Last Updated: 2026-02-06

## 1. Why Analytics
Shaker-like experiences succeed when rooms are lively and social; we must measure density, engagement, and safety to avoid the “empty bar” problem. :contentReference[oaicite:21]{index=21}

## 2. Event Taxonomy (Client)
- auth_success
- onboarding_completed
- room_joined {roomId, theme, deviceType}
- room_left {durationSec}
- profile_opened {targetUserId}
- local_chat_sent {len}
- voice_active_seconds {seconds}
- mute_user {targetUserId}
- block_user {targetUserId}
- report_user {type}

## 3. Metrics
- DAU/WAU/MAU
- Avg session length
- Rooms distribution:
  - occupancy histogram
  - time-to-fill
- Social interaction:
  - profile opens per session
  - chat per session
- Safety:
  - reports per 1k sessions
  - blocks per session

## 4. Dashboards
- “Room Health” dashboard
- “Safety & Abuse” dashboard
- “Device Mix” dashboard (VR vs mobile vs desktop)

