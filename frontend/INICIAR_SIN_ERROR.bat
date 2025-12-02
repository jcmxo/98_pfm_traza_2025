@echo off
title Frontend - Puerto 9000
cd /d "%~dp0"
echo.
echo ========================================
echo   INICIANDO FRONTEND
echo ========================================
echo.
echo Limpiando cache de SWC...
if exist node_modules\@next\swc-win32-x64-msvc (
    echo Eliminando binario SWC problemático...
    rmdir /s /q node_modules\@next\swc-win32-x64-msvc >nul 2>&1
)
echo.
echo Iniciando servidor en puerto 9000...
echo Espera a ver "Ready" antes de abrir el navegador
echo.
set NEXT_DISABLE_SWC=1
set NEXT_TELEMETRY_DISABLED=1
npm run dev

