# Phase 15 — Monetization Phase 2 (cosmetics, emotes, events)

## Phase Number & Name
Phase 15 — Monetization Phase 2 (cosmetics, emotes, events)

## Phase Goal (outcome-focused)
Introduce revenue features—cosmetics shop, emotes, and ticketed/sponsored events—without compromising core social experience or safety.

## User Value Delivered
- Users can personalize avatars with purchasable cosmetics and emotes.
- Users can participate in special events/rooms with tickets, enhancing engagement and giving reasons to return.

## In Scope
- Cosmetics catalog and inventory persistence.
- Emote purchases and usage in-venue (UI hook to existing emote system).
- Ticketed events / sponsored rooms with access control via tickets.
- Shop UI for browsing/purchasing cosmetics and emotes.

## Out of Scope
- Player-to-player trading or UGC items.
- Complex economy features (auctions, crafting, crypto).

## Dependencies / Preconditions
- Stable auth, profiles, rooms, realtime, voice, safety, social graph, and presence from prior phases.
- Payment integration (minimal) or placeholder purchase flow with entitlement grant if real payments deferred.

## Feature Flags (added / removed / modified)
- Added: `ENABLE_SHOP`, `ENABLE_EVENTS_TICKETS`, `ENABLE_EMOTE_PURCHASES`; defaults may be staged/gradual.

## Functional Requirements
- FR-01: Catalog endpoints for cosmetics/emotes (list with sku, type, price, metadata); backend schema for `inventory_items` and `user_inventory` (from db-schemas).
- FR-02: Purchase flow (real or placeholder) that grants entitlements to `user_inventory` and returns updated inventory.
- FR-03: Shop UI to browse/purchase cosmetics and emotes; show owned vs purchasable items.
- FR-04: Avatar customization applies owned cosmetics; emote wheel shows owned emotes and triggers existing emote event.
- FR-05: Events/tickets: endpoint to list ticketed/sponsored rooms/events; ticket purchase grants access; `/rooms/join` enforces ticket requirement for those rooms.
- FR-06: Safety and blocklist rules remain enforced; purchases do not bypass moderation.
- FR-07: Feature flags allow disabling shop/events or running in “entitlement-only” mode without payments.

## Non-Functional Requirements
- Performance: Catalog/shop loads quickly; purchases complete within reasonable latency.
- Accessibility: Shop and emote UI keyboard-accessible; prices and ownership clearly indicated without color-only cues.
- Responsiveness: Shop and inventory UI usable on mobile and desktop.
- Error handling: Clear errors for payment failure (if enabled), insufficient funds (if virtual currency), or entitlement issues.

## Mock vs Real Data Matrix
| Area                   | Mocked | Real | Notes |
|------------------------|:------:|:----:|-------|
| Auth/Rooms/Realtime    | ❌     | ✅   | Existing |
| Shop/Catalog           | ❌     | ✅   | Backend-driven |
| Purchases/Entitlements | ❌/⚠️  | ✅   | Real or staged depending on payments |
| Events/Tickets         | ❌     | ✅   | Access enforced server-side |
| Voice                  | ❌     | ✅   | From earlier phases |

## Acceptance Criteria
- Users can view catalog, see owned vs purchasable items, and complete a purchase that updates inventory.
- Owned cosmetics apply to avatar and persist across sessions; owned emotes appear in emote wheel and trigger correctly.
- Ticketed event room rejects users without tickets; purchasing a ticket grants access and `/rooms/join` succeeds.
- Feature flags can disable shop/events or run entitlement-only mode; no regressions to core social/voice/realtime flows.

## Demo Checklist
- Browse catalog; purchase a cosmetic; reopen avatar to show applied item.
- Purchase an emote; show it in emote wheel and play it.
- Attempt to join ticketed room without ticket (fail), then purchase ticket and join (success).
- Toggle flags to disable shop/events to demonstrate isolation.

## Exit Criteria (phase complete)
- Monetization features live with controlled flags; inventory and ticket enforcement working.
- Core experience remains stable; safety and moderation unaffected.
- Hand-off ready for post-MVP optimization/expansion of catalog and events.
