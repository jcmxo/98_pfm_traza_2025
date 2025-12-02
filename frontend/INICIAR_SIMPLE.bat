@echo off
title Frontend - Puerto 9000
cd /d "%~dp0"

echo ========================================
echo   SUPPLY CHAIN TRACKER - FRONTEND
echo   Puerto: 9000
echo ========================================
echo.

REM Agregar Node.js al PATH
set "PATH=%PATH%;C:\Program Files\nodejs"

echo Limpiando cache...
if exist .next rmdir /s /q .next 2>nul
if exist .next\.cache rmdir /s /q .next\.cache 2>nul
echo Cache limpiado completamente.
echo.

echo Iniciando servidor en puerto 9000...
echo El frontend estara disponible en: http://localhost:9000
echo.
echo NOTA: La primera compilacion puede tardar 1-2 minutos
echo.

set NEXT_DISABLE_SWC=1
set NODE_ENV=development

REM Usar call para ejecutar npm correctamente
call npm run dev

pause

