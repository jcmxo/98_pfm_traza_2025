@echo off
title Frontend - Puerto 9000
cd /d "%~dp0"
set NEXT_DISABLE_SWC=1
echo Iniciando frontend en puerto 9000...
echo Espera a ver "Ready" antes de abrir el navegador
echo.
npm run dev
