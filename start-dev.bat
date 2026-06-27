@echo off
:: ============================================================
::  SHEHERLY — Dev Environment Launcher
:: ============================================================

:: ── Self-elevate to Administrator ────────────────────────────
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Requesting administrator rights...
    powershell -Command "Start-Process 'cmd.exe' -ArgumentList '/k cd /d %~dp0 && \"%~f0\" ELEVATED' -Verb RunAs"
    exit /b
)

:: ── Open firewall ports ──────────────────────────────────────
echo [FIREWALL] Opening ports...
netsh advfirewall firewall delete rule name="Expo Metro"       >nul 2>&1
netsh advfirewall firewall delete rule name="Sheherly Admin"   >nul 2>&1
netsh advfirewall firewall delete rule name="Sheherly Map"     >nul 2>&1
netsh advfirewall firewall delete rule name="Sheherly Chatbot" >nul 2>&1
netsh advfirewall firewall delete rule name="Sheherly Search"  >nul 2>&1
netsh advfirewall firewall add rule name="Expo Metro"       dir=in action=allow protocol=TCP localport=8082 >nul
netsh advfirewall firewall add rule name="Sheherly Admin"   dir=in action=allow protocol=TCP localport=9000 >nul
netsh advfirewall firewall add rule name="Sheherly Map"     dir=in action=allow protocol=TCP localport=8002 >nul
netsh advfirewall firewall add rule name="Sheherly Chatbot" dir=in action=allow protocol=TCP localport=8001 >nul
netsh advfirewall firewall add rule name="Sheherly Search"  dir=in action=allow protocol=TCP localport=7000 >nul
echo [FIREWALL] Done.
echo.

:: ── Auto-detect IP and update config.js ──────────────────────
echo [IP] Detecting LAN IP...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4" ^| findstr /v "127.0.0.1"') do (
    set RAW=%%a
    goto :gotip
)
:gotip
set MY_IP=%RAW: =%
echo [IP] Found: %MY_IP%

powershell -ExecutionPolicy Bypass -File "%~dp0scripts\update-ip.ps1" -ip "%MY_IP%"
echo.

:: ── Start all servers ─────────────────────────────────────────
echo ========================================
echo   SHEHERLY Starting...  IP: %MY_IP%
echo ========================================
echo.

echo [1/5] Admin server (port 9000)...
start "ADMIN"   cmd /k "cd /d %~dp0 && npm run server:admin"

echo [2/5] Map server (port 8002)...
start "MAP"     cmd /k "cd /d %~dp0 && npm run server:map"

echo [3/5] Search server (port 7000)...
start "SEARCH"  cmd /k "cd /d %~dp0 && npm run server:search"

echo [4/5] Chatbot server (port 8001)...
start "CHATBOT" cmd /k "cd /d %~dp0 && npm run server:chatbot"

echo [5/5] Expo (port 8082)...
start "EXPO"    cmd /k "cd /d %~dp0 && npx expo start --port 8082 --lan"

echo.
echo ========================================
echo   All done! IP set to: %MY_IP%
echo   Scan QR in the EXPO window with Expo Go
echo ========================================
echo.
pause
