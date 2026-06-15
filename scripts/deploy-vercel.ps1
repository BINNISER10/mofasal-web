# ═════════════════════════════════════════════════════════
# MUFASAL Vercel Deployment Script
# ═════════════════════════════════════════════════════════
Write-Host "🚀 MUFASAL Vercel Deployment" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan

# ─── Check Vercel CLI ───────────────────────────────────
Write-Host "📦 Checking Vercel CLI..." -ForegroundColor Yellow
try {
    $vercelVersion = vercel --version
    Write-Host "   ✅ Vercel CLI found: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
    Write-Host "   ✅ Vercel CLI installed" -ForegroundColor Green
}

# ─── Login to Vercel ─────────────────────────────────────
Write-Host "🔐 Logging in to Vercel..." -ForegroundColor Yellow
vercel login

# ─── Deploy Web App ─────────────────────────────────────
Write-Host "🌐 Deploying web app to Vercel..." -ForegroundColor Yellow
Set-Location apps\web
vercel --prod --yes

# ─── Deploy API (if separate) ───────────────────────────
Write-Host "🔌 Deploying API to Vercel..." -ForegroundColor Yellow
Set-Location ..\..\services\api
vercel --prod --yes

# ─── Return to root ──────────────────────────────────────
Set-Location ..\..

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "   Check your Vercel dashboard for URLs" -ForegroundColor Cyan
