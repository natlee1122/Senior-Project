# Starts the Lifescape backend and frontend, each in its own window.
$root = $PSScriptRoot

# Backend: activate venv, apply any new migrations, start the API
Start-Process powershell -ArgumentList '-NoExit', '-Command', @"
Set-Location -LiteralPath '$root\backend'
.\.venv\Scripts\Activate.ps1
alembic upgrade head
uvicorn app.main:app --reload
"@

# Frontend: start Vite
Start-Process powershell -ArgumentList '-NoExit', '-Command', @"
Set-Location -LiteralPath '$root\FRONTEND'
npm run dev
"@

function Wait-Url($url, $seconds) {
  $deadline = (Get-Date).AddSeconds($seconds)
  while ((Get-Date) -lt $deadline) {
    try { Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2 | Out-Null; return }
    catch { Start-Sleep -Seconds 1 }
  }
}

Write-Host "Waiting for the servers..."
Wait-Url 'http://localhost:5173' 30
Wait-Url 'http://127.0.0.1:8000/health' 10
Start-Process 'http://localhost:5173'