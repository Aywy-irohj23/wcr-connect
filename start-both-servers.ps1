# Start both frontend and backend servers
Write-Host "Starting WCR Connect Development Environment..." -ForegroundColor Green

# Start backend server
Write-Host "Starting backend server on port 4000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-Command", "cd server; & 'C:\Program Files\nodejs\npm.cmd' run dev" -WindowStyle Normal

# Wait for backend to start
Write-Host "Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start frontend server
Write-Host "Starting frontend server on port 5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-Command", "& 'C:\Program Files\nodejs\npm.cmd' run dev" -WindowStyle Normal

Write-Host "Both servers are starting..." -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend API: http://localhost:4000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Demo Credentials:" -ForegroundColor Magenta
Write-Host "  Admin: admin / start123" -ForegroundColor White
Write-Host "  Reservist (PR): jan.kowalski / start123" -ForegroundColor White
Write-Host "  Reservist (AR): anna.nowak / start123" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")


