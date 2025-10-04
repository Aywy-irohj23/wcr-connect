# Fix Tailwind CSS setup
Write-Host "Fixing Tailwind CSS configuration..." -ForegroundColor Green

# Remove node_modules and package-lock.json
Write-Host "Removing old dependencies..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue

# Install dependencies
Write-Host "Installing dependencies with Tailwind v3..." -ForegroundColor Yellow
& "C:\Program Files\nodejs\npm.cmd" install

Write-Host "Tailwind CSS should now be working!" -ForegroundColor Green
Write-Host "Restart your dev server to see the changes." -ForegroundColor Cyan

