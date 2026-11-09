@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1" %*
set SCRIPT_EXIT=%ERRORLEVEL%
if %SCRIPT_EXIT% neq 0 (
    echo.
    echo [Error] Photobooth startup exited with code %SCRIPT_EXIT%.
    pause
)
