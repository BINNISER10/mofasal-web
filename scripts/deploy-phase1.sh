#!/bin/bash
set -euo pipefail

# ═══════════════════════════════════════════════════════════
# MUFASAL Phase 1 — Production Deployment
# Target: 100K concurrent clients
# ═══════════════════════════════════════════════════════════

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/var/log/mufasal/deploy_${TIMESTAMP}.log"
BACKUP_DIR="/var/backups/mufasal"
PROJECT_DIR="/opt/mufasal"
COMPOSE_FILE="${PROJECT_DIR}/docker-compose.yml"
COMPOSE_PROD="${PROJECT_DIR}/docker-compose.prod.yml"
ENV_FILE="${PROJECT_DIR}/.env.production"

mkdir -p /var/log/mufasal
exec 1> >(tee -a "$LOG_FILE") 2>&1

echo "========================================="
echo " MUFASAL Phase 1 Deployment — ${TIMESTAMP}"
echo "========================================="

echo "[1/7] Pulling latest code..."
cd "$PROJECT_DIR"
git pull origin main

echo "[2/7] Backing up database..."
mkdir -p "${BACKUP_DIR}"
docker compose exec -T postgres pg_dump -U mufasal mufasal > "${BACKUP_DIR}/mufasal_${TIMESTAMP}.sql"
gzip "${BACKUP_DIR}/mufasal_${TIMESTAMP}.sql"
find "${BACKUP_DIR}" -name "*.sql.gz" -mtime +7 -delete

echo "[3/7] Running database migrations..."
docker compose -f "$COMPOSE_FILE" -f "$COMPOSE_PROD" run --rm api npx prisma migrate deploy

echo "[4/7] Building & starting services..."
docker compose -f "$COMPOSE_FILE" -f "$COMPOSE_PROD" up --build -d --scale api=4 --scale web=2 --scale reports=1

echo "[5/7] Waiting for health checks..."
for i in {1..30}; do
  if curl -sf http://localhost/health > /dev/null 2>&1; then
    echo "  ✅ API healthy after ${i}s"
    break
  fi
  sleep 2
done

for i in {1..15}; do
  if curl -sf http://localhost/api/v1/auth/health > /dev/null 2>&1; then
    echo "  ✅ Auth endpoint responding after ${i}s"
    break
  fi
  sleep 2
done

echo "[6/7] Warming cache..."
curl -s http://localhost/api/v1/products?limit=100 > /dev/null 2>&1 || true
curl -s http://localhost/api/v1/categories > /dev/null 2>&1 || true
curl -s http://localhost/api/v1/shops?limit=100 > /dev/null 2>&1 || true

echo "[7/7] Cleaning up old images..."
docker image prune -f --filter "until=24h"

echo "========================================="
echo " ✅ Deploy complete — ${TIMESTAMP}"
echo " Logs: ${LOG_FILE}"
echo "========================================="

echo "Active containers:"
docker compose ps --status running
