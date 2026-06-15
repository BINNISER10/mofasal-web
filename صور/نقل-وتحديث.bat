@echo off
chcp 65001 >nul
echo ==========================================
echo   نقل الصور وتحديث المشروع تلقائياً
echo ==========================================
echo.

set SOURCE=G:\My Drive\OPEN CODE\MUFASAL\صور
set DEST=G:\My Drive\OPEN CODE\MUFASAL\apps\web\public\images

echo [1/3] نقل الصور...

if exist "%SOURCE%\1-hero-thobe.jpg" (
    copy /Y "%SOURCE%\1-hero-thobe.jpg" "%DEST%\hero-thobe.jpg" >nul
    echo ✓ hero-thobe.jpg
) else (
    echo ✗ لم يتم العثور على 1-hero-thobe.jpg
)

if exist "%SOURCE%\2-thobe-black.jpg" (
    copy /Y "%SOURCE%\2-thobe-black.jpg" "%DEST%\thobe-black.jpg" >nul
    echo ✓ thobe-black.jpg
) else (
    echo ✗ لم يتم العثور على 2-thobe-black.jpg
)

if exist "%SOURCE%\3-thobe-senior.jpg" (
    copy /Y "%SOURCE%\3-thobe-senior.jpg" "%DEST%\thobe-senior.jpg" >nul
    echo ✓ thobe-senior.jpg
) else (
    echo ✗ لم يتم العثور على 3-thobe-senior.jpg
)

if exist "%SOURCE%\4-thobe-looking-up.jpg" (
    copy /Y "%SOURCE%\4-thobe-looking-up.jpg" "%DEST%\thobe-looking-up.jpg" >nul
    echo ✓ thobe-looking-up.jpg
) else (
    echo ✗ لم يتم العثور على 4-thobe-looking-up.jpg
)

echo.
echo [2/3] تم النقل!
echo.
echo [3/3] الخطوة التالية:
echo   1. أعد تشغيل السيرفر (npm run dev)
echo   2. افتح http://localhost:3000
echo.
echo ==========================================
pause
