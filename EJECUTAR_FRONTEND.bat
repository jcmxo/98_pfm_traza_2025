@echo off
title Supply Chain Tracker - Frontend Puerto 8000
color 0A
cls
echo.
echo ========================================
echo   SUPPLY CHAIN TRACKER - FRONTEND
echo   Puerto: 8000
echo ========================================
echo.
cd /d "%~dp0\frontend"
echo Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install
    echo.
)
echo.
echo Iniciando servidor en puerto 8000...
echo.
echo El frontend estara disponible en: http://localhost:8000
echo.
echo Presiona Ctrl+C para detener el servidor
echo.
set NEXT_DISABLE_SWC=1
call npm run dev
