<#
.SYNOPSIS
  MUFASAL Project Setup Script (Windows / PowerShell)
.DESCRIPTION
  Installs all dependencies, builds shared packages, runs database
  migrations, and seeds the database for local development.
.EXAMPLE
  .\scripts\setup.ps1
#>

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $PSCommandPath
$rootDir = Resolve-Path "$scriptDir\.."
$Host.UI.RawUI.ForegroundColor = "Green"

Write-Host "╔══════════════════════════════════════════════╗"
Write-Host "║        MUFASAL — Setup Script                ║"
Write-Host "╚══════════════════════════════════════════════╝"
Write-Host ""

# ─── 1. Check Node.js ────────────────────────────────────
Write-Host "🔍 Checking Node.js version..." -ForegroundColor Cyan
$nodeVersion = node -v
if (-not $nodeVersion) {
  Write-Host "❌ Node.js is not installed. Please install Node.js 18+." -ForegroundColor Red
  exit 1
}
Write-Host "   Found: $nodeVersion"

$majorVersion = [int]($nodeVersion -replace "[v\.,].*", "")
if ($majorVersion -lt 18) {
  Write-Host "❌ Node.js 18+ is required. Found: $nodeVersion" -ForegroundColor Red
  exit 1
}

# ─── 2. Check yarn / npm ─────────────────────────────────
Write-Host "🔍 Checking package manager..." -ForegroundColor Cyan
$pkgMgr = if (Get-Command yarn -ErrorAction SilentlyContinue) { "yarn" } else { "npm" }
Write-Host "   Using: $pkgMgr"

# ─── 3. Install root dependencies ────────────────────────
Write-Host "📦 Installing root dependencies..." -ForegroundColor Cyan
Push-Location $rootDir
if ($pkgMgr -eq "yarn") {
  yarn install --frozen-lockfile
} else {
  npm install
}

# ─── 4. Build shared package ─────────────────────────────
Write-Host "🔨 Building @mufasal/shared..." -ForegroundColor Cyan
if ($pkgMgr -eq "yarn") {
  yarn workspace @mufasal/shared build
} else {
  npm run build --workspace=packages/shared
}

# ─── 5. Install API dependencies ─────────────────────────
Write-Host "📦 Installing API dependencies..." -ForegroundColor Cyan
Push-Location "$rootDir\services\api"
if ($pkgMgr -eq "yarn") {
  yarn install
} else {
  npm install
}
Pop-Location

# ─── 6. Install web dependencies ─────────────────────────
Write-Host "📦 Installing web dependencies..." -ForegroundColor Cyan
Push-Location "$rootDir\apps\web"
if ($pkgMgr -eq "yarn") {
  yarn install
} else {
  npm install
}
Pop-Location

# ─── 7. Install mobile dependencies ──────────────────────
Write-Host "📦 Installing mobile dependencies..." -ForegroundColor Cyan
Push-Location "$rootDir\apps\mobile"
if ($pkgMgr -eq "yarn") {
  yarn install
} else {
  npm install
}
Pop-Location

# ─── 8. Prisma migrations ────────────────────────────────
Write-Host "🗄️  Running Prisma migrations..." -ForegroundColor Cyan
Push-Location "$rootDir\services\api"
npx prisma generate
npx prisma migrate dev --name init
Pop-Location

# ─── 9. Seed database ────────────────────────────────────
Write-Host "🌱 Seeding database..." -ForegroundColor Cyan
Push-Location "$rootDir\services\api"
npx prisma db seed
Pop-Location

Pop-Location

# ─── Done ─────────────────────────────────────────────────
Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║     ✅  Setup Complete!                       ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Copy .env.example to .env and fill in your variables"
Write-Host "  2. Start the API:          cd services\api && npm run dev"
Write-Host "  3. Start the web app:      cd apps\web && npm run dev"
Write-Host "  4. Start the mobile app:   cd apps\mobile && npx expo start"
Write-Host "  5. Open the web app at:    http://localhost:3000"
Write-Host "  6. View API docs at:       http://localhost:4000/api/docs"
Write-Host ""
