$ErrorActionPreference = "Stop"
$apiDir = "C:\Users\Administrator\AppData\Local\Temp\mufasal-api-tmp"
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/mufasal"
Set-Location $apiDir

# Kill old
netstat -ano | Select-String ":4001 " | ForEach-Object { $pid = ($_ -split '\s+')[-1]; if ($pid -ne '0') { Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue } }

# Start server logging to file
$logFile = "C:\Users\Administrator\AppData\Local\Temp\mufasal-api.log"
$ps = Start-Process -NoNewWindow -FilePath "node" -ArgumentList "dist/index.js" -WorkingDirectory $apiDir -RedirectStandardError $logFile -PassThru
Start-Sleep -Seconds 6

# Test
$login = Invoke-RestMethod -Uri "http://localhost:4001/api/v1/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"admin@mufasal.com","password":"admin123"}'
$token = $login.data.access_token
$auth = @{Authorization="Bearer $token"}

$tests = @(
    @{n="HR Employees"; u="/hr/employees"},
    @{n="HR Departments"; u="/hr/departments"},
    @{n="HR Attendance"; u="/hr/attendance"},
    @{n="HR Leaves"; u="/hr/leaves"},
    @{n="HR Payrolls"; u="/hr/payrolls"},
    @{n="Procurement"; u="/procurement"},
    @{n="Suppliers"; u="/suppliers"},
    @{n="POS Sessions"; u="/pos/sessions"}
)

foreach ($t in $tests) {
    try {
        $r = Invoke-RestMethod "http://localhost:4001/api/v1$($t.u)" -Headers $auth
        Write-Host "✅ $($t.n)" -ForegroundColor Green
    } catch {
        Write-Host "❌ $($t.n) — $($_.Exception.Message)" -ForegroundColor Red
        try { $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream()); $body = $reader.ReadToEnd(); Write-Host "   $body" -ForegroundColor Yellow } catch {}
    }
}

Write-Host ""
Write-Host "=== Server Log ===" -ForegroundColor Cyan
Get-Content $logFile -Tail 20

Stop-Process -Id $ps.Id -Force -ErrorAction SilentlyContinue
