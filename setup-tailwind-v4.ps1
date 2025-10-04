# Setup Tailwind CSS v4.0 with Vite plugin
Write-Host "Setting up Tailwind CSS v4.0..." -ForegroundColor Green

# Remove old dependencies
Write-Host "Removing old dependencies..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue

# Install new dependencies
Write-Host "Installing Tailwind CSS v4.0 with Vite plugin..." -ForegroundColor Yellow
& "C:\Program Files\nodejs\npm.cmd" install

Write-Host "Tailwind CSS v4.0 setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Key improvements in v4.0:" -ForegroundColor Cyan
Write-Host "  ✓ 5x faster full builds" -ForegroundColor White
Write-Host "  ✓ 100x faster incremental builds" -ForegroundColor White
Write-Host "  ✓ Zero configuration required" -ForegroundColor White
Write-Host "  ✓ Automatic content detection" -ForegroundColor White
Write-Host "  ✓ CSS-first configuration" -ForegroundColor White
Write-Host "  ✓ First-party Vite plugin for maximum performance" -ForegroundColor White
Write-Host ""
Write-Host "Your app now uses:" -ForegroundColor Magenta
Write-Host "  - Tailwind CSS v4.0 with Vite plugin" -ForegroundColor White
Write-Host "  - Custom primary and military color palettes" -ForegroundColor White
Write-Host "  - Inter font family" -ForegroundColor White
Write-Host "  - Polish translations throughout" -ForegroundColor White
Write-Host ""
Write-Host "Restart your dev server to see the improvements!" -ForegroundColor Yellow


