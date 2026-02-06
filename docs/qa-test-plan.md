# qa-test-plan.md

# VirtuBar — QA & Test Plan

Version: 1.0  
Last Updated: 2026-02-06

## 1. Test Levels
- Unit tests: shared validation, reducers, server services
- Integration tests: join flow, token issuance, WS auth
- E2E tests: browser automation (Playwright)
- Load tests: WS + voice (separate harness)

## 2. Critical User Journeys
1) Login → onboarding → join busiest room
2) Move around → see others move smoothly
3) Open profile card → mute user
4) Block user → ensure they do not appear again (matchmaking)
5) Report user → creates report record
6) VR mode entry (WebXR) on supported device

## 3. Realtime Edge Cases
- network drop + reconnect
- token expiry mid-session
- high packet loss (mobile)
- 40-user room movement burst

## 4. Voice Tests
- mic permission denied
- push-to-talk on/off
- spatial audio attenuation sanity
- echo cancellation validation

## 5. Compatibility Matrix
- Desktop: Chrome, Edge, Firefox
- Mobile: iOS Safari, Android Chrome
- VR: Meta Quest Browser (WebXR)

