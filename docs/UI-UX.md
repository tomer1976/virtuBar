# UI-UX.md

# VirtuBar — UI/UX Specification

Version: 1.0  
Last Updated: 2026-02-06

## 1. UX Principles (Derived from Shaker + Modern VR Social)
- **Immediate vibe**: entering the venue should feel like arriving at a lively place. Shaker’s sessions were best when the “bar felt packed.” :contentReference[oaicite:16]{index=16}
- **Frictionless social approach**: users should be able to “approach” and start interacting naturally. :contentReference[oaicite:17]{index=17}
- **Cross-platform parity**: every key action must be doable on mobile/desktop/VR. :contentReference[oaicite:18]{index=18}
- **Safety first**: mute/block/report must be fast and obvious.

## 2. Primary Screens / States

### 2.1 Landing
- Product value statement
- “Enter VirtuBar” CTA
- Sign in (Google)
- Supported devices icons (Desktop / Mobile / VR)

### 2.2 Onboarding Wizard (First Login)
Step 1: Display Name + Age Gate (if needed)  
Step 2: Avatar selection (basic presets)  
Step 3: Interest tags (choose 5–10)  
Step 4: Audio setup
- mic permission request
- input level meter
- push-to-talk toggle

### 2.3 Room Selection (Optional for MVP)
- “Join hottest room” big CTA (default)
- Room list:
  - room name, theme, occupancy, ping
- Create private room (phase 2)

### 2.4 In-Venue HUD (Desktop)
Layout:
- Center: 3D canvas
- Top left: Room name + occupancy
- Top right: Settings (audio, graphics, controls)
- Bottom left: Movement hints (WASD)
- Bottom center: Action bar (wave, dance, “cheers”)
- Right overlay panel (collapsible):
  - Nearby users list (sorted by distance)
  - Friends online (phase 2)
- Bottom right: Chat input (local text)

### 2.5 In-Venue HUD (Mobile)
- Full-screen 3D
- Left thumb: joystick
- Right thumb: camera look drag
- Buttons:
  - Push-to-talk
  - Actions (emote)
  - Nearby list
  - Profile card (on tap avatar)
  - Safety quick menu

### 2.6 In-Venue HUD (VR)
- Minimal HUD; diegetic panels:
  - Wrist menu (left controller) → settings
  - Laser pointer selection
  - Floating “Nearby” panel as optional toggle
- Teleport arc + smooth movement option
- Push-to-talk mapped to controller button

## 3. Core Interaction Patterns

### 3.1 Approach & Conversation (Local Cluster)
- Proximity voice always “available” if unmuted.
- When within talk radius:
  - show subtle ring/outline to indicate “in conversation range”
- Text chat bubble appears near avatar for local messages.

### 3.2 Profile Card (“Virtual Phone” concept)
Shaker used an in-bar profile viewer to show photos/interests without leaving the scene. :contentReference[oaicite:19]{index=19}

VirtuBar Profile Card fields:
- Avatar thumbnail
- Display Name
- “Shared interests” (computed from tags)
- Interest tags
- Buttons:
  - Add Friend (phase 2) / Follow
  - Invite to Table (phase 2)
  - Mute
  - Block
  - Report

### 3.3 Social Discovery Highlights
When opening a profile:
- “Icebreaker” banner:
  - “You both like: ___”
- Optional: “Conversation starter” prompt:
  - “Ask about their favorite ___”

### 3.4 Safety UX
Accessible within 1–2 actions:
- Long press / right-click avatar → quick actions
- VR: point + hold trigger → radial menu
Actions:
- Mute voice
- Hide avatar (local)
- Block
- Report

## 4. Visual Design System

### 4.1 Brand
- Name: VirtuBar
- Mood: warm, modern lounge, neon accents, friendly.

### 4.2 UI Style
- Glassmorphism panels with readable contrast
- Large tap targets on mobile
- VR panels with depth + legibility

### 4.3 Accessibility
- Subtitles (speech-to-text) toggle (phase 2)
- Color-blind friendly indicators (do not rely on color alone)
- Motion comfort:
  - VR teleport default
  - vignette option for smooth locomotion

## 5. Venue Design Guidelines
- Zones:
  - Entrance (spawn)
  - Bar counter
  - Dance floor
  - Quiet lounge corner
  - “Game nook” (phase 2)
- Encourage clustering: semi-enclosed areas help conversations form.

## 6. Empty Room Mitigation
- If occupancy low:
  - show “Join busiest room” CTA
  - schedule micro-events (“DJ set starts in 5 minutes”)
Because Shaker-style venues are “no fun” when empty. :contentReference[oaicite:20]{index=20}

