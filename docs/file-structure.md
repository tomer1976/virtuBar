# file-structure.md

# VirtuBar — Repo & File Structure

Version: 1.0  
Last Updated: 2026-02-06

## 1. Monorepo Layout (Recommended)

virtu-bar/
  README.md
  docs/
    PRD.md
    architecture.md
    UI-UX.md
    db-schemas.md
    file-structure.md
    api-spec.md
    realtime-protocol.md
    security-privacy.md
    moderation-ops.md
    analytics.md
    qa-test-plan.md
    devops.md
    accessibility.md
  apps/
    web/
      package.json
      index.html
      src/
        main.tsx
        app/
          App.tsx
          routes/
          providers/
        ui/
          components/
          pages/
          styles/
        three/
          SceneRoot.tsx
          assets/
          loaders/
          avatar/
          input/
          physics/
        net/
          realtime/
          voice/
          api/
        state/
        utils/
      public/
        icons/
        audio/
        models/
    server/
      package.json
      src/
        main.ts
        modules/
          auth/
          users/
          profiles/
          rooms/
          moderation/
          inventory/
        common/
          config/
          guards/
          interceptors/
          validators/
          utils/
      prisma/
        schema.prisma
        migrations/
    realtime/
      package.json
      src/
        index.ts
        room/
        events/
        rate-limit/
        redis/
        auth/
    voice/
      package.json
      src/
        signaling/
        sfu-adapter/
        auth/
  packages/
    shared/
      src/
        types/
        zod/
        constants/
    ui-kit/
      src/
        components/
  infra/
    k8s/
    docker/
    terraform/
  scripts/
    dev/
    ci/

## 2. Key Conventions
- Shared types live in `packages/shared`
- Runtime validation with Zod (server + client)
- Event names standardized and versioned (see realtime-protocol.md)
- Asset pipeline:
  - GLTF models in `public/models`
  - Audio in `public/audio` (MVP)

## 3. Environment Variables
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `TURN_URL`, `TURN_USER`, `TURN_PASS`
- `ASSET_CDN_BASE_URL`

## 4. Branching
- `main` (production)
- `develop` (staging)
- feature branches: `feat/<name>`
