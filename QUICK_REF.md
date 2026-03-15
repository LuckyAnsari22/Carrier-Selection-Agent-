# CarrierIQ v3 - Quick Reference Card

## 🚀 Get Started (Copy-Paste)

### Terminal 1 - Run Setup
```powershell
.\SETUP.ps1
```

### Terminal 2 - Start Backend
```powershell
python backend/main.py
```

### Terminal 3 - Start Frontend
```powershell
cd frontend
npm run dev
```

---

## 🌐 Open These in Browser

- **Frontend**: http://localhost:5173
- **API Docs**: http://localhost:8000/docs
- **API Health**: http://localhost:8000/health
- **ReDoc**: http://localhost:8000/redoc

---

## ✅ Test Everything Works

```powershell
python test_api_comprehensive.py
```

Expected result: `9/9 tests passing`

---

## 🎬 Video Demo (5 minutes)

1. Show health: `curl http://localhost:8000/health`
2. Score carriers: See [DEMO_COMMANDS.md](DEMO_COMMANDS.md)
3. Explain score: See [VIDEO_DEMO_GUIDE.md](VIDEO_DEMO_GUIDE.md)
4. Show Swagger: http://localhost:8000/docs

---

## 🐛 Troubleshooting

**Python not found?** → Run `.\SETUP.ps1`

**Port in use?** → Press Ctrl+C to stop, restart

**API not responding?** → Check backend is running

**Error importing modules?** → Reinstall: `.\SETUP.ps1`

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| `FIXED_AND_READY.md` | Current status & next steps |
| `PYTHON_PATH_FIX.md` | PATH configuration details |
| `VIDEO_DEMO_GUIDE.md` | Complete video script |
| `DEMO_COMMANDS.md` | Copy-paste API commands |
| `API_QUICK_START.md` | Endpoint reference |

---

## ⌨️ VS Code Shortcuts

| Action | Key |
|--------|-----|
| Debug current file | `F5` |
| Run task | `Ctrl + Shift + P` → "Tasks: Run Task" |
| Open terminal | `` Ctrl + ` `` |
| Command palette | `Ctrl + Shift + P` |

---

## 📊 System Status

```
✓ Python: Working
✓ Backend: Running
✓ Frontend: Running  
✓ API: 23 endpoints
✓ Tests: 9/9 passing
✓ Docs: Available
✓ Ready: For video!
```

---

**Keep this open while working! Everything is configured and ready.** 🎬
