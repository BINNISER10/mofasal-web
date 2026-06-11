#!/bin/sh
set -e
cd /app

echo "==> prisma migrate deploy (with retry)"
MIGRATED=false
for i in 1 2 3 4 5; do
  if npx prisma migrate deploy --schema=./prisma/schema.prisma; then
    MIGRATED=true
    break
  fi
  echo "migrate attempt $i failed, retrying in 5s..."
  sleep 5
done
if [ "$MIGRATED" != "true" ]; then
  echo "==> migrate deploy failed, running prisma db push"
  npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss
fi

if [ "${SEED_DATABASE:-false}" = "true" ]; then
  echo "==> seed database"
  npx ts-node prisma/seed.ts || echo "seed skipped"
fi

echo "==> starting API on port ${PORT:-4001}"
exec node dist/index.js
