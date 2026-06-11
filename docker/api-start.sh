#!/bin/sh
cd /app

echo "==> wait for database"
sleep 10

echo "==> prisma db push (ensure schema)"
for i in 1 2 3 4 5 6 7 8 9 10; do
  if npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss; then
    break
  fi
  echo "db push attempt $i failed, retrying in 8s..."
  sleep 8
  if [ "$i" = "10" ]; then exit 1; fi
done

echo "==> prisma migrate deploy"
npx prisma migrate deploy --schema=./prisma/schema.prisma || echo "migrate deploy skipped"

if [ "${SEED_DATABASE:-false}" = "true" ]; then
  echo "==> seed database"
  node -r ts-node/register/transpile-only prisma/seed.ts || {
    echo "seed failed — see error above"
    exit 1
  }
fi

echo "==> starting API on port ${PORT:-4001}"
exec node dist/index.js
