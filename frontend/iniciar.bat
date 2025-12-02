@echo off
title Frontend - Puerto 9000
cd /d "%~dp0"

echo ========================================
echo   SUPPLY CHAIN TRACKER - FRONTEND
echo   Puerto: 9000
echo ========================================
echo.

REM Agregar Node.js al PATH (con comillas para espacios)
set "PATH=%PATH%;C:\Program Files\nodejs"

REM Verificar si npm existe en la ruta estándar
if exist "C:\Program Files\nodejs\npm.cmd" (
    set "NPM_CMD=C:\Program Files\nodejs\npm.cmd"
    goto :run_npm
)

REM Intentar con npm del PATH
where npm >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm no encontrado
    echo Por favor instala Node.js
    pause
    exit /b 1
)
set "NPM_CMD=npm"

:run_npm
echo Limpiando cache...
if exist .next rmdir /s /q .next 2>nul
echo.

echo Iniciando servidor en puerto 9000...
echo El frontend estara disponible en: http://localhost:9000
echo.

set NEXT_DISABLE_SWC=1

REM Usar comillas alrededor de la ruta completa si contiene espacios
if "%NPM_CMD:~0,1%"=="C" (
    "%NPM_CMD%" run dev
) else (
    %NPM_CMD% run dev
)

pause
