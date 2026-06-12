# نسخ الوسائط الثابتة من Google Drive إلى مجلد النشر المحلي
$driveRoot = "G:\My Drive\OPEN CODE\MOFASAL"
$deployRoot = "C:\dev\mofasal-deploy"
$imagesSrc = Join-Path $driveRoot "apps\web\public\images"
$imagesDst = Join-Path $deployRoot "apps\web\public\images"
$photosSrc = Join-Path $driveRoot "صور"
$fashionDst = Join-Path $imagesDst "fashion"

New-Item -ItemType Directory -Force -Path $imagesDst, (Join-Path $imagesDst "lomar"), $fashionDst | Out-Null

if (Test-Path $imagesSrc) {
  Copy-Item -Path "$imagesSrc\*" -Destination $imagesDst -Recurse -Force
  Write-Host "Copied images from Drive"
}

if (Test-Path $photosSrc) {
  for ($i = 1; $i -le 20; $i++) {
    $src = Join-Path $photosSrc "thobe-$i.jpg"
    if (Test-Path $src) {
      Copy-Item -Path $src -Destination (Join-Path $fashionDst "model-$i.jpg") -Force
    }
  }
  Write-Host "Synced fashion lookbook models"
}

$count = (Get-ChildItem -Path $imagesDst -Recurse -File).Count
Write-Host "Total image files: $count"
