#!/usr/bin/env bash
set -euo pipefail

echo "==> MUFASAL Netlify build (optimized)"

cd apps/web

# تثبيت واحد فقط — shared/ui عبر file: في package.json
npm ci --no-audit --no-fund --ignore-scripts --omit=optional --prefer-offline 2>/dev/null \
  || npm install --no-audit --no-fund --ignore-scripts --omit=optional

export DATABASE_URL="${DATABASE_URL:-postgresql://build:build@localhost:5432/build?schema=public}"
export DIRECT_DATABASE_URL="${DIRECT_DATABASE_URL:-$DATABASE_URL}"
export GENERATE_SOURCEMAP=false
export NEXT_TELEMETRY_DISABLED=1

npx prisma generate --schema=./prisma/schema.prisma
npm run build

echo "==> Build complete"
