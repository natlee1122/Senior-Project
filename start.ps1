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

# Give them a few seconds, then open the site
Start-Sleep -Seconds 6
Start-Process 'http://localhost:5173'