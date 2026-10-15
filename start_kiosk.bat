@echo off
title Photobooth Commercial Dual-Mode Kiosk System
cd /d "%~dp0"
echo ========================================================
echo   Photobooth Commercial Kiosk (大头贴 + AI变身照)
echo   Starting 24/7 Watchdog Guardian & Kiosk Shell...
echo ========================================================
python bin\photobooth_kiosk.py
pause
