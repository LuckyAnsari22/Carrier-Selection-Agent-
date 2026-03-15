# CarrierIQ v3 - Copy-Paste Demo Commands

Use these commands directly in your video. Just copy and paste!

## 🏥 Health Check (Start with this)

```bash
curl http://localhost:8000/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "version": "3.0.0",
  "carriers_loaded": 30,
  "model_trained": true
}
```

---

## 📋 Get All Carriers

```bash
curl http://localhost:8000/api/carriers | jq '.' | head -50
```

Or in Swagger: http://localhost:8000/docs → Click "GET /api/carriers" → Try It Out

---

## ⭐ Score Carriers (MAIN DEMO)

```bash
curl -X POST http://localhost:8000/api/score \
  -H "Content-Type: application/json" \
  -d '{
    "carrier_data": []
  }' | jq '.carriers[0:5] | .[] | {rank, carrier_name, final_score, cost_per_km, ontime_pct}'
```

**What to highlight in response:**
- Top carrier: `CARRIER_020 - SwiftFreight India (Score: 1.0)`
- Show top 5 rankings
- Point out score is between 0.0 and 1.0
- Mention computation took ~15ms

---

## 🔍 Explain Top Carrier Score

```bash
curl http://localhost:8000/api/explain/CARRIER_020 | jq '{
  carrier_id,
  carrier_name,
  final_score: .score,
  explanation,
  features: .features
}'
```

**What to emphasize:**
- Show feature importance scores
- Read the narrative explanation
- Mention SHAP for interpretability
- Point out negative factors (cost efficiency at -0.075)

---

## 🔬 Research Carrier Details

```bash
curl http://localhost:8000/api/research/CARRIER_020 | jq '.'
```

**What to show:**
- Financial metrics
- Risk indicators
- Capacity information

---

## 💰 Financial Health Assessment

```bash
curl -X POST http://localhost:8000/api/financial_health/ \
  -H "Content-Type: application/json" \
  -d '{
    "carrier_id": "CARRIER_020",
    "include_market_noise": true
  }' | jq '{
    carrier_name,
    health_score,
    assessment: (.assessment | split("\n")[0:3] | join(" "))
  }'
```

---

## 📊 What-If Scenario Analysis

```bash
curl -X POST http://localhost:8000/api/whatif/ \
  -H "Content-Type: application/json" \
  -d '{
    "scenario_name": "MONSOON PROTOCOL",
    "weights": {
      "cost": 20,
      "reliability": 60,
      "speed": 10,
      "quality": 10
    },
    "filters": {"max_damage": 1.5}
  }' | jq '{
    scenario_name,
    baseline_top_5: (.baseline_top_5[0] | {rank, carrier_id, carrier_name}),
    scenario_top_5: (.scenario_top_5[0] | {rank, carrier_id, carrier_name})
  }'
```

**What to highlight:**
- Show how weights change rankings
- Compare baseline vs scenario
- Demonstrate flexibility of algorithm

---

## 📝 Submit Feedback

```bash
curl -X POST http://localhost:8000/api/feedback/ \
  -H "Content-Type: application/json" \
  -d '{
    "carrier_id": "CARRIER_020",
    "lane": "Mumbai → Delhi",
    "actual_ontime_pct": 92.5,
    "actual_damage_rate": 0.5,
    "actual_cost_per_km": 28.66
  }' | jq '.message'
```

---

## 🌐 Open API Documentation

```bash
# Open in browser
xdg-open http://localhost:8000/docs

# Or manually paste this URL
http://localhost:8000/docs
```

**What to show:**
- All 23 endpoints listed
- Click "/api/score" to expand
- Show request schema
- Show response schema
- Click "Try It Out" to demo live
- Copy-paste examples

**Also available:**
- ReDoc: http://localhost:8000/redoc
- Raw OpenAPI: http://localhost:8000/openapi.json

---

## 🧪 Run Full Test Suite

```bash
python test_api_comprehensive.py
```

**Expected output:**
```
============================================================
SUMMARY
============================================================
Tests Passed: 9/9 (100.0%)
✅ ALL SYSTEMS OPERATIONAL - READY FOR VIDEO
```

---

## 🎯 Recommended Demo Flow (5 minutes)

**Time | Command | What to say**

**0:00-0:30 | Health check**
```bash
curl http://localhost:8000/health
```
"System is ready with 30 carriers and trained model"

**0:30-1:30 | Score carriers**
```bash
curl -X POST http://localhost:8000/api/score \
  -H "Content-Type: application/json" \
  -d '{"carrier_data": []}'
```
"The AI ranks all carriers using multi-criteria decision analysis"

**1:30-2:30 | Explain top carrier**
```bash
curl http://localhost:8000/api/explain/CARRIER_020
```
"SHAP analysis shows WHY SwiftFreight scored #1"

**2:30-3:30 | Financial health**
```bash
curl -X POST http://localhost:8000/api/financial_health/ \
  -H "Content-Type: application/json" \
  -d '{"carrier_id": "CARRIER_020", "include_market_noise": true}'
```
"AI agents assess risk and financial health"

**3:30-4:30 | What-if scenarios**
```bash
curl -X POST http://localhost:8000/api/whatif/ \
  -H "Content-Type: application/json" \
  -d '{"scenario_name": "MONSOON", "weights": {"cost": 20, "reliability": 60, "speed": 10, "quality": 10}}'
```
"Test different scenarios and weights"

**4:30-5:00 | Show Swagger docs**
```
http://localhost:8000/docs
```
"All endpoints documented and testable"

---

## 💻 Using Pretty Print (jq)

If you have `jq` installed, use it to format JSON nicely:

```bash
# Pretty print the entire response
curl http://localhost:8000/api/carriers | jq '.'

# Show only first 3 carriers
curl http://localhost:8000/api/carriers | jq '.[0:3]'

# Show just the carrier names and scores
curl http://localhost:8000/api/carriers | jq '.[] | {name: .carrier_name, score: .final_score}'

# Pretty print with specific fields
curl http://localhost:8000/api/explain/CARRIER_020 | jq '{features: .features, explanation: .explanation}'
```

**Don't have jq?**
You can use Python instead:
```bash
curl http://localhost:8000/api/carriers | python -m json.tool
```

---

## 🎬 Quick Tips

1. **Resize terminal big** so text is readable on video
2. **Run tests first** to confirm everything works
3. **Copy these commands** ahead of time
4. **Paste vs type** - pasting looks professionalism
5. **Pause between commands** - let viewers read output
6. **Zoom in on JSON** - responses are detailed, worth showing
7. **Use different colors** - dark background with light text

---

## 🚨 If Something Breaks

**Backend not responding?**
```bash
cd d:\sem4\carrierselectionagent
python backend/main.py
```

**Need to fix and restart?**
```bash
# Stop: Press Ctrl+C
# Restart: Up arrow + Enter
```

**Frontend not loading?**
```bash
cd d:\sem4\carrierselectionagent\frontend
npm run dev
```

**Run diagnostic?**
```bash
python test_api_comprehensive.py
```

---

## 📈 Expected Performance

- Health check: <10ms
- Score carriers: 15-20ms (includes ranking 30 carriers)
- Explain: 5-10ms
- Research: 10-15ms
- Financial health: 500-2000ms (uses AI agent)
- What-if: 50-100ms

---

**Ready to film? 🎬 Break a leg with your demo!**
