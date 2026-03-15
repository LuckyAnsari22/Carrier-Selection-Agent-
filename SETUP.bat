@echo off
REM Setup script for CarrierIQ v3 - Windows

echo.
echo ============================================
echo CarrierIQ v3 - Development Setup
echo ============================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not in PATH
    echo Please install Python or add it to your PATH
    pause
    exit /b 1
)

echo ✓ Python found: 
python --version

REM Check if venv exists
if not exist "venv\" (
    echo.
    echo Creating virtual environment...
    python -m venv venv
    echo ✓ Virtual environment created
)

REM Activate venv
echo.
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install requirements
echo.
echo Installing dependencies...
pip install -q -r backend\requirements.txt

echo.
echo ============================================
echo Setup Complete!
echo ============================================
echo.
echo Next steps:
echo 1. Start backend: python backend/main.py
echo 2. Start frontend: cd frontend && npm run dev
echo.
echo Background info:
echo - Backend runs at: http://localhost:8000
echo - Frontend runs at: http://localhost:5173
echo - API Docs at: http://localhost:8000/docs
echo.

pause
