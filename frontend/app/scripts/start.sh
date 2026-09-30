#!/usr/bin/env bash

# ==============================================================================
# 🌿 BioDex Unified Startup Script (Linux / macOS)
# Features a BTOP-inspired dual vertical terminal split:
#   - Left segment:  Frontend (Expo / Bun)
#   - Right segment: Backend (FastAPI / Uvicorn)
# Automatically rearranges and occupies space dynamically as terminal resizes.
# ==============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# 1. Check prerequisites
if ! command -v bun &> /dev/null; then
    echo "❌ Error: 'bun' package manager is not installed."
    echo "👉 Install Bun via: curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo "❌ Error: 'python3' is not installed."
    exit 1
fi

# 2. Setup backend virtual environment if needed
if [ ! -d "$BACKEND_DIR/venv" ]; then
    echo "📦 Creating Python virtual environment in backend/venv..."
    python3 -m venv "$BACKEND_DIR/venv"
    source "$BACKEND_DIR/venv/bin/activate"
    echo "📥 Installing backend dependencies..."
    pip install --upgrade pip
    pip install -r "$BACKEND_DIR/requirements.txt"
fi

# 3. Setup frontend dependencies if needed
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo "📥 Installing frontend dependencies via Bun..."
    (cd "$FRONTEND_DIR" && bun install)
fi

# 4. Check if TUI mode is requested and supported (interactive TTY)
USE_TUI=true
for arg in "$@"; do
    if [ "$arg" == "--no-tui" ]; then
        USE_TUI=false
    fi
done

if [ -t 1 ] && [ "$USE_TUI" = true ]; then
    # Launch BTOP-style dual-pane TUI
    exec python3 "$PROJECT_ROOT/runner.py" "$@"
else
    # Fallback to standard background processes if not a TTY or --no-tui passed
    echo ""
    echo "🌿 Starting BioDex in background mode (--no-tui)..."
    source "$BACKEND_DIR/venv/bin/activate"
    (cd "$BACKEND_DIR" && python3 main.py) &
    BACKEND_PID=$!

    cleanup() {
        echo ""
        echo "🛑 Shutting down BioDex services..."
        kill $BACKEND_PID 2>/dev/null || true
        exit 0
    }
    trap cleanup SIGINT SIGTERM EXIT

    sleep 2
    cd "$FRONTEND_DIR"
    if [ "$1" == "--web" ]; then
        bun run web
    elif [ "$1" == "--android" ]; then
        bun run android
    else
        bun run start "$@"
    fi
fi
