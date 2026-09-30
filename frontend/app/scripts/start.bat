@echo off
setlocal enabledelayedexpansion

REM ==============================================================================
REM 🌿 BioDex Unified Startup Script (Windows)
REM Automatically creates vertical split panes for Frontend and Backend
REM ==============================================================================

echo.
echo =======================================================
echo    BioDex -- Deep Learning Biodiversity Identifier
echo =======================================================
echo.

REM 1. Check prerequisites
where bun >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] 'bun' package manager is not installed or not in PATH.
    echo Please install Bun from https://bun.sh
    pause
    exit /b 1
)

where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] 'python' is not installed or not in PATH.
    pause
    exit /b 1
)

REM 2. Backend virtualenv setup
echo [1/3] Preparing Backend environment...
cd /d "%~dp0backend"

if not exist "venv\Scripts\activate.bat" (
    echo [*] Creating Python virtual environment in backend\venv...
    python -m venv venv
    call venv\Scripts\activate.bat
    echo [*] Installing backend dependencies...
    python -m pip install --upgrade pip
    pip install -r requirements.txt
) else (
    call venv\Scripts\activate.bat
)

REM 3. Frontend dependency setup
echo [2/3] Checking Frontend dependencies...
cd /d "%~dp0frontend"
if not exist "node_modules" (
    echo [*] Installing frontend dependencies via Bun...
    bun install
)

cd /d "%~dp0"

REM 4. Check for Windows Terminal (wt.exe) for native vertical split
where wt >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [3/3] Launching in Windows Terminal with vertical split panes...
    wt -d "%~dp0frontend" --title "BioDex Frontend (Expo / Bun)" cmd /k "bun run start %*" ; split-pane -V -d "%~dp0backend" --title "BioDex Backend (FastAPI)" cmd /k "call venv\Scripts\activate.bat && python main.py"
    exit /b 0
)

REM Fallback if Windows Terminal is not installed
echo [3/3] Launching Backend and Frontend in separate windows...
start "BioDex Backend (FastAPI - Port 8000)" cmd /k "cd /d ""%~dp0backend"" && call venv\Scripts\activate.bat && python main.py"
timeout /t 2 /nobreak >nul
cd /d "%~dp0frontend"
bun run start %*

pause
