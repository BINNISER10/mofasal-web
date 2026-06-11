#!/bin/bash
# ═════════════════════════════════════════════════════════
# MUFASAL Deployment Script
# ═════════════════════════════════════════════════════════
set -euo pipefail

echo "🚀 MUFASAL Deployment"
echo "======================"

# ─── Load environment ──────────────────────────────────
if [ -f .env ]; then
  export $(grep -v '^\s*#' .env | xargs)
fi

APP_DIR="/opt/mufasal"
BACKUP_DIR="${APP_DIR}/backups/$(date +%Y%m%d_%H%M%S)"

# ─── 1. Pull latest images ─────────────────────────────
echo "📦 Pulling latest Docker images..."
docker compose pull

# ─── 2. Database backup ────────────────────────────────
echo "💾 Backing up database..."
mkdir -p "${BACKUP_DIR}"
docker exec mufasal-postgres pg_dump -U mufasal mufasal > "${BACKUP_DIR}/db.sql"
echo "   Backup saved to ${BACKUP_DIR}"

# ─── 3. Run database migrations ────────────────────────
echo "🗄️  Running database migrations..."
docker compose run --rm api npx prisma migrate deploy

# ─── 4. Start services ─────────────────────────────────
echo "🐳 Starting services..."
docker compose up -d --remove-orphans

# ─── 5. Health check ───────────────────────────────────
echo "🏥 Running health checks..."
for i in {1..30}; do
  if curl -sf http://localhost:4001/api/health > /dev/null 2>&1; then
    echo "   ✅ API healthy"
    break
  fi
  sleep 2
done

if curl -sf http://localhost:3000 > /dev/null 2>&1; then
  echo "   ✅ Web healthy"
fi

# ─── 6. Cleanup ────────────────────────────────────────
echo "🧹 Cleaning up..."
docker image prune -f
echo "   Old images removed"

# ─── 7. Keep last 7 backups ────────────────────────────
echo "📀 Pruning old backups..."
ls -dt "${APP_DIR}/backups"/*/ | tail -n +8 | xargs rm -rf 2>/dev/null || true

echo "✅ Deployment complete!"
echo "   Web:  https://mufasal.com"
echo "   API:  https://api.mufasal.com"
