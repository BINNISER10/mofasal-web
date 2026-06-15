# One-time: upload GitHub Actions workflow (needs PAT with "workflow" scope)
# Create token: https://github.com/settings/tokens/new?scopes=repo,workflow,write:packages
param([Parameter(Mandatory=$true)][string]$GitHubToken)

$path = Join-Path $PSScriptRoot "..\.github\workflows\render-build.yml"
$content = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes((Get-Content -Raw $path)))
$body = @{
  message = "ci: build web Docker on GitHub Actions (GHCR)"
  content = $content
  branch  = "master"
} | ConvertTo-Json

$headers = @{
  Authorization = "Bearer $GitHubToken"
  Accept        = "application/vnd.github+json"
}

Invoke-RestMethod -Method Put `
  -Uri "https://api.github.com/repos/BINNISER10/mofasal-web/contents/.github/workflows/render-build.yml" `
  -Headers $headers -Body $body -ContentType "application/json"

Write-Host "Done. Open https://github.com/BINNISER10/mofasal-web/actions"
