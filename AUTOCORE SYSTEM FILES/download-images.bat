@echo off
chcp 65001 >nul
echo ==========================================
echo  تحميل صور Unsplash لمشروع مفصل
echo ==========================================
echo.

set IMAGES_DIR=..\apps\web\public\images

if not exist "%IMAGES_DIR%" mkdir "%IMAGES_DIR%"

echo جاري تحميل الصور...

:: ثياب سعودية
curl -L "https://unsplash.com/photos/I4B-IZ7cd-g/download?force=true" -o "%IMAGES_DIR%\hero-thobe.jpg"
curl -L "https://unsplash.com/photos/o212Sa90JFs/download?force=true" -o "%IMAGES_DIR%\thobe-portrait.jpg"
curl -L "https://unsplash.com/photos/4G1Tt98JGfQ/download?force=true" -o "%IMAGES_DIR%\thobe-business.jpg"
curl -L "https://unsplash.com/photos/iAoWErdRRHs/download?force=true" -o "%IMAGES_DIR%\thobe-modern.jpg"

:: أقمشة
curl -L "https://unsplash.com/photos/W_kZiuhWu0k/download?force=true" -o "%IMAGES_DIR%\fabric-detail.jpg"
curl -L "https://unsplash.com/photos/5HGf4pM80IM/download?force=true" -o "%IMAGES_DIR%\fabric-colorful.jpg"

:: خياطة
curl -L "https://unsplash.com/photos/3mk39C5YrRY/download?force=true" -o "%IMAGES_DIR%\tailor-shop.jpg"
curl -L "https://unsplash.com/photos/6XpJu2pdDvE/download?force=true" -o "%IMAGES_DIR%\workshop.jpg"

:: منتجات
curl -L "https://unsplash.com/photos/DBl_RqvZL84/download?force=true" -o "%IMAGES_DIR%\thobe-casual.jpg"
curl -L "https://unsplash.com/photos/XO_nCztOrFc/download?force=true" -o "%IMAGES_DIR%\thobe-street.jpg"
curl -L "https://unsplash.com/photos/Y7XBu_69fpM/download?force=true" -o "%IMAGES_DIR%\thobe-walking.jpg"
curl -L "https://unsplash.com/photos/8GSJdmfmbiE/download?force=true" -o "%IMAGES_DIR%\men-group.jpg"

echo.
echo ==========================================
echo  تم التحميل!
echo  الموقع: %IMAGES_DIR%
echo ==========================================
pause
