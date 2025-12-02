@echo off
title Frontend - Puerto 9000
cd /d "%~dp0"

REM Detener procesos anteriores
echo Deteniendo procesos anteriores...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Agregar Node.js al PATH
set "PATH=%PATH%;C:\Program Files\nodejs"

REM Limpiar cache solo si hay problemas
echo Verificando cache...
if exist ".next\fallback-build-manifest.json" (
    echo Cache encontrado, usando compilacion existente.
) else (
    echo Limpiando cache corrupto...
    if exist .next rmdir /s /q .next >nul 2>&1
    if exist node_modules\.cache rmdir /s /q node_modules\.cache >nul 2>&1
    echo Cache limpiado. Next.js compilara automaticamente.
)
echo.

echo ========================================
echo   SUPPLY CHAIN TRACKER - FRONTEND
echo   Puerto: 9000
echo ========================================
echo.
echo Iniciando servidor de desarrollo...
echo El frontend estara disponible en: http://localhost:9000
echo.
echo NOTA: La primera compilacion puede tardar 1-2 minutos
echo.

set NEXT_DISABLE_SWC=1
call npm run dev

pause

