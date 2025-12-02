@echo off
title Supply Chain Tracker - Frontend
color 0A
echo.
echo ========================================
echo   SUPPLY CHAIN TRACKER - FRONTEND
echo ========================================
echo.
cd /d "%~dp0\frontend"
echo Iniciando servidor en puerto 8000...
echo.
set NEXT_DISABLE_SWC=1
call npm run dev
