# devops.md

# VirtuBar — DevOps & Environments

Version: 1.0  
Last Updated: 2026-02-06

## 1. Environments
- dev: local
- staging: pre-prod
- prod: live

## 2. CI/CD
- Lint + test on PR
- Build web + server docker images
- Deploy staging on merge to develop
- Deploy prod on tag release

## 3. Infra Components
- Postgres (managed)
- Redis (managed)
- Object storage (S3-compatible)
- Load balancer with TLS
- TURN server credentials
- Voice SFU cluster (if used)

## 4. Secrets Management
- Kubernetes secrets or cloud secret manager
- Rotate OAuth secrets periodically

## 5. Rollback Strategy
- Blue/green or canary
- Automated health checks:
  - `/health`
  - WS connect test

