@echo off
chcp 65001 >nul
title MUFASAL Development Server
echo ═══════════════════════════════════════════════
echo   MUFASAL — Development Startup
echo ═══════════════════════════════════════════════
echo.

REM ─── Configuration ────────────────────────────
set API_DIR=services\api
set WEB_DIR=apps\web
set TEMP_API=%TEMP%\mufasal-api-tmp
set TEMP_WEB=%TEMP%\mufasal-web-tmp

REM ─── 1. Check dependencies ─────────────────────
echo [1/4] Checking dependencies...
where node >nul 2>&1 || ( echo ERROR: Node.js not found & exit /b 1 )
where npm >nul 2>&1 || ( echo ERROR: npm not found & exit /b 1 )

REM ─── 2. Ensure temp directories exist ──────────
echo [2/4] Preparing temp directories...
if not exist "%TEMP_API%" mkdir "%TEMP_API%"
if not exist "%TEMP_WEB%" mkdir "%TEMP_WEB%"

REM ─── 3. Sync source to temp dirs ──────────────
echo [3/4] Syncing source files (workaround OneDrive)...
xcopy "%API_DIR%\src" "%TEMP_API%\src" /E /I /Q /Y >nul
xcopy "%API_DIR%\prisma" "%TEMP_API%\prisma" /E /I /Q /Y >nul
copy /Y "%API_DIR%\package.json" "%TEMP_API%\" >nul
copy /Y "%API_DIR%\tsconfig.json" "%TEMP_API%\" >nul
copy /Y "%API_DIR%\.env" "%TEMP_API%\" >nul

xcopy "%WEB_DIR%\src" "%TEMP_WEB%\src" /E /I /Q /Y >nul
xcopy "%WEB_DIR%\public" "%TEMP_WEB%\public" /E /I /Q /Y >nul
copy /Y "%WEB_DIR%\package.json" "%TEMP_WEB%\" >nul
copy /Y "%WEB_DIR%\next.config.js" "%TEMP_WEB%\" >nul
copy /Y "%WEB_DIR%\tsconfig.json" "%TEMP_WEB%\" >nul
copy /Y "%WEB_DIR%\tailwind.config.ts" "%TEMP_WEB%\" >nul
copy /Y "%WEB_DIR%\postcss.config.js" "%TEMP_WEB%\" >nul
copy /Y "%WEB_DIR%\.env" "%TEMP_WEB%\" >nul

REM ─── 4. Install deps if missing ────────────────
if not exist "%TEMP_API%\node_modules" (
    echo    Installing API dependencies...
    pushd "%TEMP_API%"
    call npm install --no-fund --no-audit >nul 2>&1
    call npx prisma generate >nul 2>&1
    popd
)
if not exist "%TEMP_WEB%\node_modules" (
    echo    Installing Web dependencies...
    pushd "%TEMP_WEB%"
    call npm install --no-fund --no-audit >nul 2>&1
    popd
)

REM ─── 5. Start servers ───────────────────────────
echo [4/4] Starting servers...
echo.
echo   API:  http://localhost:4001
echo   Web:  http://localhost:3000
echo.
echo   Press Ctrl+C to stop both servers
echo ═══════════════════════════════════════════════
echo.

start "MUFASAL-API" cmd /c "cd /d "%TEMP_API%" && npx tsx src/index.ts"
timeout /t 5 /nobreak >nul
start "MUFASAL-WEB" cmd /c "cd /d "%TEMP_WEB%" && npx next dev -p 3000"

echo.
echo Both servers started. Close this window to stop.
pause >nul
taskkill /f /fi "windowtitle eq MUFASAL-API" >nul 2>&1
taskkill /f /fi "windowtitle eq MUFASAL-WEB" >nul 2>&1
