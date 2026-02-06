# Phase 15 — Monetization Phase 2 (cosmetics, emotes, events)

## Phase Overview
Add monetization features: cosmetics/emotes shop, entitlements, and ticketed/sponsored events with access control.

## Frontend Tasks
- [ ] Implement shop UI to browse cosmetics/emotes, showing owned vs purchasable items and prices.
- [ ] Implement purchase flow UI (real payment or staged entitlement grant); show success/error states.
- [ ] Update avatar customization UI to apply owned cosmetics from inventory.
- [ ] Update emote wheel to show owned emotes; trigger emote events for owned items only.
- [ ] Implement ticket purchase flow and indicate ticket requirement on event rooms.
- [ ] Respect feature flags `ENABLE_SHOP`, `ENABLE_EMOTE_PURCHASES`, `ENABLE_EVENTS_TICKETS`; allow entitlement-only mode without payments.
- [ ] Ensure mobile-friendly layouts for shop and inventory views.

## Backend Tasks (if applicable)
- [ ] Implement catalog endpoints for cosmetics/emotes using `inventory_items` schema; include sku, type, price, metadata, active flag.
- [ ] Implement purchase endpoint (real or placeholder) that grants entitlement to `user_inventory` and returns updated inventory.
- [ ] Implement inventory retrieval endpoint to load owned items for avatar/emote UI.
- [ ] Implement events/tickets: list ticketed/sponsored rooms/events; ticket purchase endpoint; enforce ticket requirement in `/rooms/join` for those rooms.
- [ ] Ensure safety/blocklist checks still apply; purchases do not bypass moderation or access controls.

## Realtime Tasks (if applicable)
- [ ] Ensure emote trigger events remain compatible; restrict to owned emotes client-side and optionally validated server-side.

## Voice Tasks (if applicable)
- [ ] No changes; voice continues as-is.

## Infrastructure / DevOps Tasks (if applicable)
- [ ] Add migrations for catalog/inventory if not already (inventory_items, user_inventory) and any event/ticket tables.
- [ ] Add config/env for payment provider (if real) or placeholder purchase mode; add feature flag defaults.

## State & Mock Replacement Tasks
- [ ] Default monetization flags off until validated; enable per environment when ready.

## File-Level Guidance
- [ ] Place shop/catalog endpoints under `apps/server/src/modules/inventory` (or shop module); events/tickets under `rooms` or dedicated module.
- [ ] Store shared types for catalog items, inventory, and tickets in `packages/shared`.
- [ ] Place shop UI under `apps/web/src/ui/shop` and inventory/emote integration under avatar/emote components.

## Validation & Testing
- [ ] Manual: purchase cosmetic, reload, and verify ownership persists; apply to avatar.
- [ ] Manual: purchase emote, see it in emote wheel, trigger successfully.
- [ ] Manual: attempt to join ticketed room without ticket (fail), then purchase ticket and join (pass).
- [ ] Automated: add API tests for catalog listing, purchase, and ticket enforcement on `/rooms/join`.

## Cleanup & Refactor
- [ ] Remove legacy mock shop placeholders; keep fallback only if required by flag.
- [ ] Document purchase modes (real vs entitlement-only) and flag behaviors.

## Handoff to Next Phase
- [ ] Summarize monetization readiness and open items for post-MVP expansion.
