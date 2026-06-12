#!/usr/bin/env bash
set -euo pipefail

echo "==> MUFASAL Netlify build"

cd packages/shared && npm install --no-audit --no-fund --prefer-offline
cd ../ui && npm install --no-audit --no-fund --prefer-offline
cd ../../apps/web

npm ci --no-audit --no-fund --ignore-scripts --omit=optional

export DATABASE_URL="${DATABASE_URL:-postgresql://build:build@localhost:5432/build?schema=public}"
export DIRECT_DATABASE_URL="${DIRECT_DATABASE_URL:-$DATABASE_URL}"

npx prisma generate --schema=./prisma/schema.prisma
npm run build

echo "==> Build complete"
