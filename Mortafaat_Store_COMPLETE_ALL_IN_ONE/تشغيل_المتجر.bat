@echo off
chcp 65001 > nul
echo ========================================================
echo        جاري تشغيل مرتفعات ستور (Mortafaat Store)
echo ========================================================
echo.
cd /d "%~dp0"
echo فتح المتصفح على: http://localhost:3000
start http://localhost:3000
echo.
echo لتشغيل المتجر، يرجى عدم غلق هذه النافذة...
npm.cmd run dev
pause
