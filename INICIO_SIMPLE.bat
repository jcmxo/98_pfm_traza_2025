@echo off
cd /d "%~dp0\frontend"
set NEXT_DISABLE_SWC=1
npm run dev

