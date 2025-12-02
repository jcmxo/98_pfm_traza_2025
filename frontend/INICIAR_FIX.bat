@echo off
title Supply Chain Tracker - Frontend Puerto 9000
color 0A
cls
echo.
echo ========================================
echo   SUPPLY CHAIN TRACKER - FRONTEND
echo   Puerto: 9000 - FIX VERSION
echo ========================================
echo.

cd /d "%~dp0"

REM Agregar Node.js al PATH si no esta
set "PATH=%PATH%;C:\Program Files\nodejs"

echo Verificando Node.js...
"C:\Program Files\nodejs\node.exe" --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no encontrado en C:\Program Files\nodejs\
    echo.
    echo Intentando con PATH del sistema...
    node --version >nul 2>&1
    if errorlevel 1 (
        echo ERROR: Node.js no esta instalado o no esta en el PATH
        pause
        exit /b 1
    )
)

echo Node.js encontrado correctamente.
echo.

echo Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias...
    "C:\Program Files\nodejs\npm.cmd" install
    if errorlevel 1 (
        call npm install
        if errorlevel 1 (
            echo ERROR: Fallo la instalacion de dependencias
            pause
            exit /b 1
        )
    )
    echo.
)

echo Limpiando cache de Next.js...
if exist ".next" (
    rmdir /s /q ".next" 2>nul
)

echo.
echo Iniciando servidor en puerto 9000...
echo.
echo El frontend estara disponible en: http://localhost:9000
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

set NEXT_DISABLE_SWC=1
set PATH=%PATH%;C:\Program Files\nodejs

REM Intentar con ruta completa primero
"C:\Program Files\nodejs\npm.cmd" run dev
if errorlevel 1 (
    echo.
    echo Intentando con npm del PATH...
    call npm run dev
)

