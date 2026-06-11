#!/bin/sh
set -e
cd /app

echo "==> prisma migrate deploy (with retry)"
for i in 1 2 3 4 5; do
  npx prisma migrate deploy --schema=./prisma/schema.prisma && break
  echo "migrate attempt $i failed, retrying in 5s..."
  sleep 5
done

if [ "${SEED_DATABASE:-false}" = "true" ]; then
  echo "==> seed database"
  npx ts-node prisma/seed.ts || echo "seed skipped"
fi

echo "==> starting API on port ${PORT:-4001}"
exec node dist/index.js
