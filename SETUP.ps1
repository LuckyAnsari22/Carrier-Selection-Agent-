#!/usr/bin/env pwsh
<#
.SYNOPSIS
    CarrierIQ v3 Development Environment Setup
.DESCRIPTION
    This script sets up the development environment for CarrierIQ v3
#>

param(
    [switch]$SkipVenv = $false
)

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "CarrierIQ v3 - Development Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is available
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "OK Python found: $pythonVersion" -ForegroundColor Green
}
else {
    Write-Host "ERROR: Python is not found in PATH" -ForegroundColor Red
    Write-Host "Please install Python or add it to your PATH" -ForegroundColor Yellow
    exit 1
}

# Create virtual environment if it doesn't exist
if (-not (Test-Path "venv")) {
    Write-Host ""
    Write-Host "Creating virtual environment..." -ForegroundColor Cyan
    python -m venv venv
    Write-Host "OK Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment
Write-Host ""
Write-Host "Activating virtual environment..." -ForegroundColor Cyan
& ".\venv\Scripts\Activate.ps1"
Write-Host "OK Virtual environment activated" -ForegroundColor Green

# Install requirements
Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Cyan
pip install -q -r backend/requirements.txt
Write-Host "OK Dependencies installed" -ForegroundColor Green

# Verify installation
Write-Host ""
Write-Host "Verifying installation..." -ForegroundColor Cyan
python -c "import fastapi; import pandas; import numpy; print('OK All core packages verified')"

# Display next steps
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Start backend:   python backend/main.py"
Write-Host "2. Start frontend:  cd frontend; npm run dev"
Write-Host ""
Write-Host "Access Points:" -ForegroundColor Cyan
Write-Host "- Backend API:      http://localhost:8000"
Write-Host "- Frontend:         http://localhost:5173"
Write-Host "- API Docs:         http://localhost:8000/docs"
Write-Host ""
