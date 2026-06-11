#!/bin/sh
cd /app

echo "==> prisma db push (ensure schema)"
npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss || exit 1

echo "==> prisma migrate deploy"
npx prisma migrate deploy --schema=./prisma/schema.prisma || echo "migrate deploy skipped"

if [ "${SEED_DATABASE:-false}" = "true" ]; then
  echo "==> seed database"
  node -r ts-node/register/transpile-only prisma/seed.ts || echo "seed skipped"
fi

echo "==> starting API on port ${PORT:-4001}"
exec node dist/index.js
