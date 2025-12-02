@echo off
title Frontend - Puerto 9000
cd /d "%~dp0"

REM Agregar Node.js al PATH
set "PATH=%PATH%;C:\Program Files\nodejs"

REM Verificar npm
where npm >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm no encontrado
    echo Verificando en C:\Program Files\nodejs...
    if exist "C:\Program Files\nodejs\npm.cmd" (
        set "NPM_CMD=C:\Program Files\nodejs\npm.cmd"
    ) else (
        echo ERROR: npm no esta instalado
        pause
        exit /b 1
    )
) else (
    set "NPM_CMD=npm"
)

echo Limpiando cache...
if exist .next rmdir /s /q .next 2>nul

echo.
echo Iniciando servidor en puerto 9000...
echo.

set NEXT_DISABLE_SWC=1
%NPM_CMD% run dev

pause

