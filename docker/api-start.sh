#!/bin/sh
set -e
cd /app

echo "==> prisma migrate deploy"
npx prisma migrate deploy --schema=./prisma/schema.prisma

if [ "${SEED_DATABASE:-false}" = "true" ]; then
  echo "==> seed database"
  npx ts-node prisma/seed.ts || echo "seed skipped"
fi

echo "==> starting API on port ${PORT:-4001}"
exec node dist/index.js
