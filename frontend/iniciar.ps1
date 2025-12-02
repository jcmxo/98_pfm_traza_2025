Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Iniciando Supply Chain Tracker" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $PSScriptRoot

if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

Write-Host "Iniciando servidor en puerto 8000..." -ForegroundColor Green
Write-Host ""
Write-Host "El frontend estará disponible en: http://localhost:8000" -ForegroundColor Green
Write-Host ""
Write-Host "Presiona Ctrl+C para detener el servidor" -ForegroundColor Yellow
Write-Host ""

npm run dev

