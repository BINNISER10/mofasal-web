@echo off
echo ====================================
echo     MUFASAL - ????? ???????
echo ====================================
echo.

echo [1/2] ????? API (???? 4001)...
start "MUFASAL API" cmd /c "cd /d "C:\Users\Administrator\AppData\Local\Temp\mufasal-api-tmp" ^
  && set PORT=4001 ^
  && set DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mufasal ^
  && set JWT_SECRET=mufasal-jwt-secret-key-change-in-production-2024 ^
  && set JWT_REFRESH_SECRET=mufasal-jwt-refresh-secret-key-2024 ^
  && set NODE_ENV=development ^
  && set CORS_ORIGIN=http://localhost:3000 ^
  && npx ts-node --transpile-only src/index.ts"

echo ?? ?????? API...
:retry_api
timeout /t 3 /nobreak >nul
call :check_port 4001
if errorlevel 1 goto retry_api
echo ? API ???? ??? http://localhost:4001

echo [2/2] ????? ??????? ???????? (???? 3000)...
start "MUFASAL Web" cmd /c "cd /d "C:\Users\Administrator\AppData\Local\Temp\mufasal-web-tmp" ^
  && set NEXT_PUBLIC_API_URL=http://localhost:4001/api/v1 ^
  && set NEXT_PUBLIC_WS_URL=ws://localhost:4001 ^
  && npx next dev"

echo ?? ?????? ??????? ????????...
:retry_web
timeout /t 5 /nobreak >nul
call :check_port 3000
if errorlevel 1 goto retry_web
echo ? ??????? ???????? ???? ??? http://localhost:3000

echo.
echo ====================================
echo     ? ?? ????? ??????? ?????
echo     API:  http://localhost:4001
echo     Web:  http://localhost:3000
echo ====================================
pause
goto :eof

:check_port
netstat -an | findstr ":%1 " | findstr "LISTEN" >nul
exit /b %errorlevel%
