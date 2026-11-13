$ErrorActionPreference = "Stop"

Write-Host "=== AstroHealth AI V2.2: Starting Local Mission Control Stack ===" -ForegroundColor Cyan

# 1. Backend Setup & Seed
Push-Location backend
if (-not (Test-Path ".venv")) {
    python -m venv .venv
}
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\pip.exe install -r requirements.txt

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
}

Write-Host "Seeding SQLite DB and NASA HRP Knowledge Base Index..." -ForegroundColor Yellow
.\.venv\Scripts\python.exe -m scripts.seed_db_and_kb --reset --overwrite-kb --offline-embeddings

Write-Host "Starting FastAPI Backend on http://localhost:8000 (workers=1)..." -ForegroundColor Green
$backendProc = Start-Process -FilePath ".\.venv\Scripts\uvicorn.exe" -ArgumentList "app.main:app --host 0.0.0.0 --port 8000 --workers 1" -PassThru
Pop-Location

# 2. Frontend Setup & Start
Push-Location frontend
if (-not (Test-Path "node_modules")) {
    npm install
}
Write-Host "Starting Next.js Frontend on http://localhost:3000..." -ForegroundColor Green
try {
    npm run dev
} finally {
    if ($backendProc -and -not $backendProc.HasExited) {
        Stop-Process -Id $backendProc.Id -Force
    }
    Pop-Location
}
