@echo off
title Supply Chain Tracker - Reiniciar Frontend
color 0A
cls
echo.
echo ========================================
echo   REINICIANDO FRONTEND
echo ========================================
echo.

cd /d "%~dp0\frontend"

echo Deteniendo procesos anteriores...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul

echo.
echo Limpiando cache de Next.js...
if exist .next (
    rmdir /s /q .next
    echo Cache limpiado
)

echo.
echo Iniciando servidor en puerto 8000...
echo.
echo El frontend estara disponible en: http://localhost:8000
echo.
echo Espera a ver "Ready" o "Compiled" antes de abrir el navegador
echo.
set NEXT_DISABLE_SWC=1
npm run dev

