@echo off
chcp 65001 >nul
title Photobooth Commercial Dual-Mode Kiosk System
cd /d "%~dp0"
echo ========================================================
echo   Photobooth Commercial Kiosk [大头贴 + AI变身照]
echo   Starting 24/7 Watchdog Guardian and Kiosk Shell...
echo ========================================================
python -X utf8 bin\photobooth_kiosk.py
pause
