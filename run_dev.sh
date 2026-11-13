#!/usr/bin/env bash
set -euo pipefail

echo "=== AstroHealth AI V2.2: Starting Local Mission Control Stack ==="

cd backend
if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

if [ ! -f ".env" ]; then
  cp .env.example .env
fi

python -m scripts.seed_db_and_kb --reset --overwrite-kb --offline-embeddings

uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 1 &
BACKEND_PID=$!
cd ..

trap "kill $BACKEND_PID 2>/dev/null || true" EXIT

cd frontend
if [ ! -d "node_modules" ]; then
  npm install
fi
npm run dev
