#!/usr/bin/env bash
# Render Starter (512MB RAM) — بناء خفيف بدون OOM (exit 134)
set -euo pipefail

export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=460}"
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
npm install --no-audit --no-fund --ignore-scripts

echo "==> prisma generate"
npx prisma generate --schema=./prisma/schema.prisma

echo "==> next build"
npx next build

echo "==> Build complete"
