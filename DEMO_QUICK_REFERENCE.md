
# 🎬 CarrierIQ Demo - Quick Reference Card

## THREE TABS YOU NEED

```
TAB 1: Frontend Dashboard
URL: http://localhost:5173

TAB 2: API Documentation (Swagger)
URL: http://localhost:8000/docs

TAB 3: Notes (keep this script visible)
```

---

## DEMO FLOW (Follow in Order)

### **START (0:00)**
Voice intro: "AI-powered carrier selection platform..."
*Then start clicking*

---

### **PHASE 1: DASHBOARD (1:00 - 2:30)**
**Tab:** Frontend (localhost:5173)

```
Point to 3D Globe 
  → "Supply chain map, green = healthy, orange = risk"
  
Scroll down to show carrier rankings table
  → "Scores, delays risks, reliability metrics"
  
Click on first carrier card
  → Shows popup with all metrics
```

---

### **PHASE 2: SCORING API (2:30 - 3:30)**
**Tab:** Swagger (localhost:8000/docs)

```
Find: POST /api/score
  → Click to expand

Click "Try it out" button

See the JSON with priorities:
  - Cost: 0.40
  - Reliability: 0.35
  - Speed: 0.15
  - Quality: 0.10

Click "Execute" 
  → Wait 3-5 seconds for response
  
Say: "See the ranked carriers—Fast Haul Express is #1"
```

---

### **PHASE 3: AGENT DEBATE (4:30 - 6:00)**
**Tab:** Swagger (localhost:8000/docs)

```
Scroll down to: POST /api/score/stream
  → Click to expand
  
Say: "This streams real-time AI agent debate"

Click "Try it out"

Click "Execute"

Watch output appear in real-time:
  - COST_AGENT: (analyzing costs...)
  - RELIABILITY_AGENT: (analyzing reliability...)
  - JUDGE: (final synthesis...)

Say: "Transparency—you see the actual debate, not just a score"
```

---

### **PHASE 4: EXPLANATIONS (6:00 - 7:00)**
**Tab:** Swagger (localhost:8000/docs)

```
Scroll down to: GET /api/explain
  → Click to expand

Click "Try it out"

Click "Execute"

Show SHAP output:
  - Positive values = helps the score
  - Negative values = hurts the score

Say: "SHAP shows exactly which metrics pushed each carrier up"
```

---

### **PHASE 5: WHAT-IF SIMULATOR (7:15 - 8:30)**
**Tab:** Frontend (localhost:5173)

```
Navigate to "What-If Simulator" section
  (or look for sliders on main dashboard)

Say: "Now change priorities in real-time"

DRAG RELIABILITY SLIDER → Right (drag to 70%)
  → Watch rankings change instantly

DRAG COST SLIDER → Left (drag to 20%)
  → Watch rankings re-shuffle
  
Say: "All recalculated in under 50ms"

Restore sliders to original position
```

---

### **END (8:45 - 9:30)**
**Action:** 
Voice outro over the dashboard showing final rankings

"CarrierIQ = TOPSIS + XGBoost + Multi-Agent AI + SHAP
Result = Transparent, explainable carrier selection"

---

## ⏱️ TIMING REFERENCE

| Time | Action | Duration |
|------|--------|----------|
| 0:00 | Intro voiceover | 45 sec |
| 0:45 | Switch to dashboard | - |
| 1:00 | Show 3D globe | 30 sec |
| 1:30 | Scroll carriers | 40 sec |
| 2:10 | Click carrier card | 20 sec |
| 2:30 | Switch to Swagger | - |
| 2:30 | Show /api/score | 60 sec |
| 3:30 | Execute & show results | 60 sec |
| 4:30 | Show /api/score/stream | 60 sec |
| 5:30 | Show stream output | 30 sec |
| 6:00 | Show /api/explain | 60 sec |
| 7:00 | Switch back to Dashboard | - |
| 7:15 | What-If sliders | 90 sec |
| 8:45 | Closing voiceover | 45 sec |
| 9:30 | END | - |

---

## 🎯 KEY SCRIPT LINES TO MEMORIZE

**Opening:**
"This is CarrierIQ—AI-powered vehicle for intelligent carrier selection. 
Instead of gut instinct, we use machine learning AND multi-agent AI debate to rank carriers."

**Middle (When showing Swagger):**
"Under the hood, TOPSIS handles multi-criteria ranking, XGBoost predicts risks, 
and our agents debate like a procurement board. Transparent. Explainable."

**What-If Section:**
"Change one priority and everything recalculates in under 50 milliseconds. 
That's real-time enterprise capability."

**Closing:**
"No more black-box AI. No more guessing. Just data-driven decisions 
you can explain to anyone."

---

## ✅ BEFORE YOU RECORD

- [ ] Backend running? (Check terminal shows "Application startup complete")
- [ ] Frontend running? (Check localhost:5173 loads)
- [ ] Swagger accessible? (Check localhost:8000/docs shows API)
- [ ] Screen resolution? (1920x1080 is best)
- [ ] Zoom reset? (Ctrl+0 in all browsers)
- [ ] Microphone working? (Test recording software)
- [ ] Both servers in background? (Don't close terminals)

---

## 🚨 IF SOMETHING BREAKS

| Problem | Solution |
|---------|----------|
| API slow | First request trains XGBoost (~5 sec), then fast |
| Page blank | Refresh (Ctrl+R) |
| Swagger 404 | Restart backend: `python -m uvicorn main:app --port 8000` |
| Frontend 404 | Restart frontend: `npm run dev` |
| Slider not working | Go back to main dashboard |

---

Done! Print this out and follow it step-by-step. You'll crush this demo! 🚀
