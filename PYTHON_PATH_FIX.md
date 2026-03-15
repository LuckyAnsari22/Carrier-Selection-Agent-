# CarrierIQ v3 - Python PATH and VS Code Setup Guide

## ✅ Problem Fixed

Your Python wasn't being found by VS Code's terminal. Here's what was set up:

---

## 🔧 What Was Configured

### 1. **VS Code Settings** (`.vscode/settings.json`)
- Python interpreter path: `${workspaceFolder}/venv/Scripts/python.exe`
- Terminal: PowerShell (Windows native)
- Linting and formatting configured

### 2. **VS Code Launch Configuration** (`.vscode/launch.json`)
- Debug configurations for:
  - Python: Current File
  - Python: Test API
  - Python: Backend API

### 3. **VS Code Tasks** (`.vscode/tasks.json`)
- Task: Start Backend API
- Task: Run API Tests
- Task: Run All Tests
- Task: Install Dependencies
- Task: Start Frontend Dev Server

### 4. **Setup Scripts** (Automated environment setup)
- `SETUP.bat` - Windows batch setup
- `SETUP.ps1` - PowerShell setup

---

## 🚀 Quick Start (Choose One)

### Option A: Using PowerShell Setup (Recommended)
```powershell
cd d:\sem4\carrierselectionagent
.\SETUP.ps1
```

This will:
- ✓ Check Python is installed
- ✓ Create virtual environment (if needed)
- ✓ Activate the venv
- ✓ Install all dependencies
- ✓ Verify Python packages

### Option B: Using Batch Setup
```cmd
cd d:\sem4\carrierselectionagent
SETUP.bat
```

### Option C: Manual Setup
```powershell
cd d:\sem4\carrierselectionagent
.\venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
```

---

## 🎯 Using VS Code Tasks

Once setup is complete, you can use VS Code's built-in task runner:

**Open Command Palette:** `Ctrl + Shift + P`

**Run these tasks:**
- `Tasks: Run Task` → `Start Backend API` (starts backend)
- `Tasks: Run Task` → `Run API Tests` (runs test suite)
- `Tasks: Run Task` → `Start Frontend Dev Server` (starts frontend)
- `Tasks: Run Task` → `Install Dependencies` (installs packages)

---

## 🐍 Running Python Files Now

### Method 1: Using VS Code Debug (Recommended)
1. Open any Python file (e.g., `test_api_comprehensive.py`)
2. Press `F5` or click "Run and Debug"
3. Select the configuration:
   - "Python: Current File" (for any file)
   - "Python: Test API" (for tests)
   - "Python: Backend API" (for backend)

### Method 2: Using Terminal
```powershell
# The venv should be in your path now
python test_api_comprehensive.py
python backend/main.py
```

### Method 3: Using Tasks
1. `Ctrl + Shift + P`
2. Type "Tasks: Run Task"
3. Select task to run

---

## ✨ Verify Setup Works

Run this in VS Code integrated terminal:

```powershell
# Should show your Python path
python --version

# Should work now
python test_api_comprehensive.py

# Should start the API
python backend/main.py
```

Expected output:
```
CarrierIQ v3 - Comprehensive API Test Suite
Started: 2026-03-15
Server: http://localhost:8000

✅ PASS | Health endpoint reachable
...
✅ ALL SYSTEMS OPERATIONAL - READY FOR VIDEO
```

---

## 🔍 If Still Getting Errors

### Error: "python is not recognized"
**Solution:** 
1. Try running `SETUP.ps1` first
2. Retry in a fresh terminal (close and reopen terminal)
3. Reload VS Code: `Ctrl + Shift + P` → Type "Reload Window"

### Error: "venv/Scripts/python.exe not found"
**Solution:**
1. Verify you have a venv: `ls venv/`
2. Recreate venv: `python -m venv venv`
3. Run SETUP.ps1

### Error: "Module not found" after starting
**Solution:**
1. Run: `.\SETUP.ps1`
2. Or install manually: `pip install -r backend/requirements.txt`
3. Verify: `python -c "import fastapi"`

---

## 📋 Complete Verification Checklist

After setup, verify each works:

```powershell
# 1. Python should be found
python --version
# Expected: Python 3.9+ (or 3.12)

# 2. Virtual environment should be active
# Expected: (venv) prefix in terminal

# 3. FastAPI should be installed
python -c "import fastapi; print(fastapi.__version__)"
# Expected: version number (e.g., 0.104.1)

# 4. Pandas should be installed
python -c "import pandas; print(pandas.__version__)"
# Expected: version number (e.g., 2.1.0)

# 5. Tests should run
python test_api_comprehensive.py
# Expected: 9/9 tests passing

# 6. Backend should start
python backend/main.py
# Expected: "Uvicorn running on http://0.0.0.0:8000"
```

---

## 🎬 Now Ready for Video!

Once all checks pass:

1. Run: `python backend/main.py` (in one terminal)
2. Run: `cd frontend && npm run dev` (in another terminal)
3. Open: http://localhost:5173 (frontend)
4. Open: http://localhost:8000/docs (API docs)
5. Start recording!

---

## 💡 VS Code Pro Tips

### Keyboard Shortcuts
- `F5` - Run/Debug current file
- `Ctrl + `` - Open terminal
- `Ctrl + Shift + P` - Command Palette (access tasks)
- `Ctrl + Shift + D` - Debug panel

### Useful Commands
```powershell
# Always use this to start
.\SETUP.ps1

# Quick test
python test_api_comprehensive.py

# Backend start
python backend/main.py

# Frontend start (from frontend folder)
npm run dev
```

---

## 🎯 Summary

| What | Where | How |
|------|-------|-----|
| Python | `C:\Users\ansar\anaconda3\python.exe` | Uses your conda Python |
| Venv | `d:\sem4\carrierselectionagent\venv` | Created by SETUP script |
| Python (in venv) | `venv/Scripts/python.exe` | Used by VS Code automatically |
| Settings | `.vscode/settings.json` | Configures Python interpreter |
| Tasks | `.vscode/tasks.json` | Quick task launching |
| Test | `test_api_comprehensive.py` | Run to verify everything |

---

## ✅ Expected Final State

```
✓ Python found in PATH
✓ Virtual environment active
✓ All dependencies installed
✓ VS Code configured with Python interpreter
✓ Tasks available in VS Code
✓ Can run: python test_api_comprehensive.py
✓ Can run: python backend/main.py
✓ Can run: npm run dev
✓ API tests passing 9/9
✓ Ready for video! 🎬
```

---

**Everything is now configured. Run SETUP.ps1 and you're ready to go!**
