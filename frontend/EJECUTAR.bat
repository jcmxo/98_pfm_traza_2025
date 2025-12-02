@echo off
title Supply Chain Tracker - Frontend Puerto 9000
color 0A
cls
echo.
echo ========================================
echo   SUPPLY CHAIN TRACKER - FRONTEND
echo   Puerto: 9000
echo ========================================
echo.

REM Cambiar al directorio del script
cd /d "%~dp0"

REM Verificar que estamos en el directorio correcto
if not exist "package.json" (
    echo ERROR: No se encontro package.json
    echo Asegurate de ejecutar este script desde el directorio frontend
    pause
    exit /b 1
)

echo Directorio actual: %CD%
echo.

REM Verificar Node.js
echo Verificando Node.js...
where node >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no encontrado en el PATH
    echo Por favor instala Node.js o agregalo al PATH
    pause
    exit /b 1
)

node --version
echo.

REM Verificar npm
echo Verificando npm...
where npm >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm no encontrado en el PATH
    pause
    exit /b 1
)

npm --version
echo.

REM Verificar dependencias
echo Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install
    if errorlevel 1 (
        echo ERROR: Fallo la instalacion de dependencias
        pause
        exit /b 1
    )
    echo.
)

REM Limpiar cache
echo Limpiando cache de Next.js...
if exist ".next" (
    rmdir /s /q ".next" 2>nul
    echo Cache limpiado.
    echo.
)

REM Configurar variables de entorno
set NEXT_DISABLE_SWC=1

echo.
echo ========================================
echo   Iniciando servidor en puerto 9000...
echo ========================================
echo.
echo El frontend estara disponible en:
echo   http://localhost:9000
echo.
echo Presiona Ctrl+C para detener el servidor
echo.
echo ========================================
echo.

REM Ejecutar npm run dev
call npm run dev

pause

