# MUFASAL — Setup Guide

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | ≥ 18.0.0 | Runtime |
| **npm** | ≥ 9.0.0 or **yarn** ≥ 1.22 | Package manager |
| **PostgreSQL** | ≥ 16 | Database |
| **Redis** | ≥ 7 | Cache & queues |
| **Docker** (optional) | ≥ 24 | Containerized deployment |
| **EAS CLI** (mobile only) | latest | Expo builds |
| **Expo Go** (mobile only) | latest | Physical device testing |

---

## 1. Clone & Install

```bash
git clone https://github.com/mufasal/mufasal.git
cd mufasal
```

### Windows (PowerShell)

```powershell
.\scripts\setup.ps1
```

### Linux / macOS

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Manual Installation

```bash
# Install root dependencies
npm install
# or: yarn install

# Build shared packages
npm run build --workspace=packages/shared
# or: yarn workspace @mufasal/shared build

# Install per-app dependencies
cd services/api && npm install && cd ../..
cd apps/web && npm install && cd ../..
cd apps/mobile && npm install && cd ../..
```

---

## 2. Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your local configuration. At minimum, set:

| Variable | Example Value | Required |
|----------|--------------|----------|
| `DATABASE_URL` | `postgresql://user:pass@localhost:5432/mufasal` | Yes |
| `JWT_SECRET` | `openssl rand -hex 64` | Yes |
| `JWT_REFRESH_SECRET` | `openssl rand -hex 64` | Yes |
| `REDIS_URL` | `redis://localhost:6379` | Yes |
| `PORT` | `4000` | No (default: 4000) |

For third-party integrations (Twilio, Firebase, payment gateways, ZATCA, delivery APIs), obtain credentials from the respective providers and fill in the remaining fields.

---

## 3. Database Setup

```bash
# Ensure PostgreSQL is running

# Generate Prisma client
cd services/api
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed the database with sample data
npx prisma db seed

cd ../..
```

The seed script creates:
- Default admin account (phone: `+966500000000`, password: `Admin@123`)
- Sample vendors, products, and categories
- Test delivery zones and pricing rules

---

## 4. Running in Development

### Start the API server

```bash
cd services/api
npm run dev
# Server starts on http://localhost:4000
```

### Start the Web app (in a new terminal)

```bash
cd apps/web
npm run dev
# App opens at http://localhost:3000
```

### Start the Mobile app (in a new terminal)

```bash
cd apps/mobile
npx expo start
# Scan QR code with Expo Go, or press 'a' for Android / 'i' for iOS
```

### Start Redis (if not running as a service)

```bash
# Docker
docker run -d --name mufasal-redis -p 6379:6379 redis:7-alpine
```

---

## 5. Building for Production

### Build all packages

```bash
npm run build --workspaces
```

### Run tests

```bash
npm run test --workspaces -- --passWithNoTests
```

### Start production servers

```bash
# API
cd services/api
NODE_ENV=production node dist/index.js

# Web
cd apps/web
NODE_ENV=production npm start
```

---

## 6. Docker Deployment

### Prerequisites

- Docker & Docker Compose installed
- SSL certificates in `docker/certs/`
- `.env` file with production values

### Build & Run

```bash
# Build all services
docker compose build

# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Run migrations
docker compose exec api npx prisma migrate deploy

# Seed (first time only)
docker compose exec api npx prisma db seed
```

### Stop

```bash
docker compose down
```

### Full reset

```bash
docker compose down -v
docker compose up -d
```

---

## 7. Mobile App Build (Expo / EAS)

### Prerequisites

- Expo account (`npx expo register`)
- EAS CLI installed (`npm install -g eas-cli`)
- EAS credentials configured

### Build for development

```bash
cd apps/mobile
eas build --profile development --platform all
```

### Build for production

```bash
eas build --profile production --platform all
```

### Submit to App Stores

```bash
eas submit --platform ios
eas submit --platform android
```

### OTA Updates

```bash
eas update --branch production --message "Fix checkout layout"
```

---

## 8. Useful Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all services in dev mode |
| `npm run lint` | Lint all packages |
| `npm run typecheck` | Type-check all packages |
| `npm run test` | Run all tests |
| `npm run format` | Format code with Prettier |
| `npx prisma studio` | Open Prisma Studio (DB GUI) |
| `npx prisma migrate dev` | Create & apply a new migration |
| `npx prisma generate` | Regenerate Prisma client |

---

## 9. Troubleshooting

### "NODE_MODULES not found"

```bash
# Clean install
rm -rf node_modules packages/*/node_modules apps/*/node_modules services/*/node_modules
npm cache clean --force
npm install
```

### "Port 4000 already in use"

```bash
# Find the process
netstat -ano | findstr :4000
# Kill it
taskkill /PID <PID> /F
```

### "Prisma client not generated"

```bash
cd services/api
npx prisma generate
```

### "Redis connection refused"

Ensure Redis is running. On Windows with Docker:
```bash
docker run -d --name mufasal-redis -p 6379:6379 redis:7-alpine
```

### "Expo build failed"

```bash
# Clear cache
npx expo start -c
```

### "Migrations pending"

```bash
# Deploy pending migrations
npx prisma migrate deploy
```
