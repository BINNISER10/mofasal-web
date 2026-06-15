#!/usr/bin/env bash
# Fallback Node build (512MB Render build env often OOMs on apps/web npm install).
# Prefer Docker: root Dockerfile — Settings → Environment: Docker on Render.
set -euo pipefail

export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=460}"
export npm_config_maxsockets="${npm_config_maxsockets:-1}"
export NEXT_TELEMETRY_DISABLED=1
export GENERATE_SOURCEMAP=false

echo "==> Node $(node -v) | NODE_OPTIONS=$NODE_OPTIONS"

echo "==> packages/shared"
cd packages/shared
npm install --no-audit --no-fund --prefer-offline 2>/dev/null || npm install --no-audit --no-fund

echo "==> packages/ui"
cd ../ui
npm install --no-audit --no-fund --prefer-offline 2>/dev/null || npm install --no-audit --no-fund

echo "==> apps/web install (skip postinstall)"
cd ../../apps/web
npm install --no-audit --no-fund --ignore-scripts --omit=optional --no-bin-links

echo "==> prisma generate"
npx prisma generate --schema=./prisma/schema.prisma

echo "==> next build (low memory)"
npx next build --no-lint

echo "==> Build complete"
