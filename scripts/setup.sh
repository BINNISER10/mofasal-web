#!/usr/bin/env bash
#
# MUFASAL — Setup Script (Linux / macOS)
#
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "╔══════════════════════════════════════════════╗"
echo "║        MUFASAL — Setup Script                ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# ─── 1. Check Node.js ────────────────────────────────────
echo "🔍 Checking Node.js version..."
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is not installed. Please install Node.js 18+."
  exit 1
fi

NODE_VERSION=$(node -v)
echo "   Found: $NODE_VERSION"

MAJOR=$(echo "$NODE_VERSION" | sed 's/v//' | cut -d. -f1)
if [ "$MAJOR" -lt 18 ]; then
  echo "❌ Node.js 18+ is required. Found: $NODE_VERSION"
  exit 1
fi

# ─── 2. Detect package manager ───────────────────────────
echo "🔍 Checking package manager..."
if command -v yarn &> /dev/null; then
  PKG_MGR="yarn"
else
  PKG_MGR="npm"
fi
echo "   Using: $PKG_MGR"

# ─── 3. Install root dependencies ────────────────────────
echo "📦 Installing root dependencies..."
if [ "$PKG_MGR" = "yarn" ]; then
  yarn install --frozen-lockfile
else
  npm install
fi

# ─── 4. Build shared package ─────────────────────────────
echo "🔨 Building @mufasal/shared..."
if [ "$PKG_MGR" = "yarn" ]; then
  yarn workspace @mufasal/shared build
else
  npm run build --workspace=packages/shared
fi

# ─── 5. Install API dependencies ─────────────────────────
echo "📦 Installing API dependencies..."
cd "$ROOT_DIR/services/api"
if [ "$PKG_MGR" = "yarn" ]; then
  yarn install
else
  npm install
fi

# ─── 6. Install web dependencies ─────────────────────────
echo "📦 Installing web dependencies..."
cd "$ROOT_DIR/apps/web"
if [ "$PKG_MGR" = "yarn" ]; then
  yarn install
else
  npm install
fi

# ─── 7. Install mobile dependencies ──────────────────────
echo "📦 Installing mobile dependencies..."
cd "$ROOT_DIR/apps/mobile"
if [ "$PKG_MGR" = "yarn" ]; then
  yarn install
else
  npm install
fi

# ─── 8. Prisma migrations ────────────────────────────────
echo "🗄️  Running Prisma migrations..."
cd "$ROOT_DIR/services/api"
npx prisma generate
npx prisma migrate dev --name init

# ─── 9. Seed database ────────────────────────────────────
echo "🌱 Seeding database..."
npx prisma db seed

cd "$ROOT_DIR"

# ─── Done ─────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║     ✅  Setup Complete!                       ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo "Next steps:" 
echo "  1. Copy .env.example to .env and fill in your variables"
echo "  2. Start the API:          cd services/api && npm run dev"
echo "  3. Start the web app:      cd apps/web && npm run dev"
echo "  4. Start the mobile app:   cd apps/mobile && npx expo start"
echo "  5. Open the web app at:    http://localhost:3000"
echo "  6. View API docs at:       http://localhost:4000/api/docs"
echo ""
