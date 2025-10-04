# Install new dependencies for enhanced UI
Write-Host "Installing enhanced UI dependencies..." -ForegroundColor Green

# Install new packages
& "C:\Program Files\nodejs\npm.cmd" install react-datepicker react-select react-hook-form lucide-react @types/react-datepicker

Write-Host "Dependencies installed successfully!" -ForegroundColor Green
Write-Host "New packages added:" -ForegroundColor Cyan
Write-Host "  - react-datepicker: Enhanced date picker" -ForegroundColor White
Write-Host "  - react-select: Advanced select components" -ForegroundColor White
Write-Host "  - react-hook-form: Form management" -ForegroundColor White
Write-Host "  - lucide-react: Modern icons" -ForegroundColor White
Write-Host ""
Write-Host "Restart your dev server to use the new components!" -ForegroundColor Yellow

