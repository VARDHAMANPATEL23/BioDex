#!/usr/bin/env bash

# ==============================================================================
# 🌿 BioDex Unified Startup Script (Linux / macOS)
# Runs Next.js 16 + FastAPI + BTOP-inspired TUI
# ==============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# Safely free up ports to prevent "Address already in use"
fuser -k 8000/tcp 2>/dev/null || true
fuser -k 3000/tcp 2>/dev/null || true

if ! command -v bun &> /dev/null; then 
    echo "bun is required. Please install bun."
    exit 1
fi
if ! command -v python3 &> /dev/null; then 
    echo "python3 is required."
    exit 1
fi

if [ ! -d "$BACKEND_DIR/venv" ]; then
    python3 -m venv "$BACKEND_DIR/venv"
    source "$BACKEND_DIR/venv/bin/activate"
    pip install --upgrade pip --quiet
    pip install -r "$BACKEND_DIR/requirements.txt" --quiet
    deactivate
fi

if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    (cd "$FRONTEND_DIR" && bun install)
fi

mkdir -p "$PROJECT_ROOT/.logs"
echo "" > "$PROJECT_ROOT/.logs/model.log"
echo "" > "$PROJECT_ROOT/.logs/backend.log"
echo "" > "$PROJECT_ROOT/.logs/frontend.log"

USE_TUI=true
BUN_ARGS=()
for arg in "$@"; do
    if [ "$arg" == "--no-tui" ]; then
        USE_TUI=false
    else
        BUN_ARGS+=("$arg")
    fi
done

if [ -t 1 ] && [ "$USE_TUI" = true ]; then
    exec python3 "$PROJECT_ROOT/runner.py" "${BUN_ARGS[@]}"
else
    echo "🌿 Starting BioDex in background mode (--no-tui)..."
    (cd "$BACKEND_DIR" && "$BACKEND_DIR/venv/bin/uvicorn" main:app --host 0.0.0.0 --port 8000) &
    BACKEND_PID=$!

    cleanup() {
        kill $BACKEND_PID 2>/dev/null || true
        exit 0
    }
    trap cleanup SIGINT SIGTERM EXIT

    sleep 2
    cd "$FRONTEND_DIR"
    bun run dev -p 3000
fi
