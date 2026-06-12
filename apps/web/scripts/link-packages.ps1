# ربط حزم المونوريبو يدوياً (Google Drive على Windows لا يدعم symlinks دائماً)
$root = Resolve-Path (Join-Path $PSScriptRoot "../../..")
$nm = Join-Path $root "apps/web/node_modules/@mufasal"

New-Item -ItemType Directory -Force -Path $nm | Out-Null

function Link-Package($name, $target) {
  $link = Join-Path $nm $name
  $src = Join-Path $root $target
  if (Test-Path $link) { Remove-Item $link -Force -Recurse -ErrorAction SilentlyContinue }
  cmd /c mklink /J "`"$link`"" "`"$src`"" 2>$null
  if (-not (Test-Path $link)) {
    Copy-Item -Path $src -Destination $link -Recurse -Force
    Write-Host "Copied $name (junction failed)"
  } else {
    Write-Host "Linked $name"
  }
}

Link-Package "shared" "packages/shared"
Link-Package "ui" "packages/ui"
