# ═════════════════════════════════════════════════════════
# MUFASAL Auto Deployment Script
# Priority: Render → Vercel
# ═════════════════════════════════════════════════════════
Write-Host "🚀 MUFASAL Auto Deployment" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan
Write-Host ""

# ─── Check Git Status ───────────────────────────────────
Write-Host "📋 Checking git status..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "   ⚠️  Uncommitted changes detected. Committing..." -ForegroundColor Yellow
    git add .
    git commit -m "Auto-commit before deployment"
    git push origin master
    Write-Host "   ✅ Changes pushed to GitHub" -ForegroundColor Green
} else {
    Write-Host "   ✅ No uncommitted changes" -ForegroundColor Green
}

# ─── Try Render First ────────────────────────────────────
Write-Host ""
Write-Host "🎯 Attempting Render deployment..." -ForegroundColor Yellow
Write-Host "   Note: Render requires manual setup via dashboard" -ForegroundColor Gray
Write-Host "   1. Go to https://dashboard.render.com" -ForegroundColor Cyan
Write-Host "   2. New + → Blueprint" -ForegroundColor Cyan
Write-Host "   3. Connect: BINNISER10/mofasal-web" -ForegroundColor Cyan
Write-Host "   4. Select branch: master" -ForegroundColor Cyan
Write-Host "   5. Apply render.yaml" -ForegroundColor Cyan
Write-Host ""

$renderChoice = Read-Host "Have you set up Render? (Y/N)"
if ($renderChoice -eq 'Y' -or $renderChoice -eq 'y') {
    Write-Host "   ✅ Render deployment in progress. Check dashboard." -ForegroundColor Green
    Write-Host "   URLs: https://mufasal-web.onrender.com" -ForegroundColor Cyan
    Write-Host "          https://mofasal-api.onrender.com" -ForegroundColor Cyan
    exit 0
}

# ─── Fallback to Vercel ─────────────────────────────────
Write-Host ""
Write-Host "🔄 Falling back to Vercel deployment..." -ForegroundColor Yellow
Write-Host ""

# Check Vercel CLI
try {
    $vercelVersion = vercel --version
    Write-Host "   ✅ Vercel CLI found: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
    Write-Host "   ✅ Vercel CLI installed" -ForegroundColor Green
}

# Login to Vercel
Write-Host "🔐 Logging in to Vercel..." -ForegroundColor Yellow
vercel login

# Deploy Web App
Write-Host "🌐 Deploying web app to Vercel..." -ForegroundColor Yellow
Set-Location apps\web
$webUrl = vercel --prod --yes
Write-Host "   ✅ Web deployed: $webUrl" -ForegroundColor Green

# Deploy API
Write-Host "🔌 Deploying API to Vercel..." -ForegroundColor Yellow
Set-Location ..\..\services\api
$apiUrl = vercel --prod --yes
Write-Host "   ✅ API deployed: $apiUrl" -ForegroundColor Green

# Return to root
Set-Location ..\..

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "   Web: $webUrl" -ForegroundColor Cyan
Write-Host "   API: $apiUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  Remember to update environment variables:" -ForegroundColor Yellow
Write-Host "   NEXT_PUBLIC_API_URL = $apiUrl/api/v1" -ForegroundColor Gray
