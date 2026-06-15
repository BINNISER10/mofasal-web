# إزالة submodule معطوب يمنع Netlify من clone المستودع
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot\..

Write-Host '=== Before ==='
if (Test-Path .gitmodules) { Get-Content .gitmodules }
git ls-files -s _archive/api_python 2>$null

git submodule deinit -f _archive/api_python 2>$null
git rm -f _archive/api_python 2>$null
git rm --cached _archive/api_python 2>$null
Remove-Item -Recurse -Force .git\modules\_archive -ErrorAction SilentlyContinue

if (Test-Path .gitmodules) {
  $lines = Get-Content .gitmodules
  $filtered = @()
  $skip = $false
  foreach ($line in $lines) {
    if ($line -match '^\[submodule "_archive/api_python"\]') { $skip = $true; continue }
    if ($skip -and $line -match '^\[submodule ') { $skip = $false }
    if (-not $skip) { $filtered += $line }
  }
  if ($filtered.Count -eq 0 -or ($filtered -join "`n") -notmatch '\[submodule') {
    git rm -f .gitmodules 2>$null
    Remove-Item -Force .gitmodules -ErrorAction SilentlyContinue
  } else {
    Set-Content -Path .gitmodules -Value ($filtered -join "`n")
  }
}

git add -A
git status --short
git commit -m "fix: remove broken submodule blocking Netlify deploy" 2>$null
git rev-parse HEAD
git push origin master
