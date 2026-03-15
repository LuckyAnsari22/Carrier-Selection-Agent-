# CarrierIQ v3 API - Quick Start Guide

## 🚀 Running the API

```bash
cd backend
python main.py
```

The API will start at `http://localhost:8000`

## 📚 API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI Schema**: http://localhost:8000/openapi.json

## 🔗 Key Endpoints

### 1. **Get All Carriers**
```bash
GET /api/carriers
```
Returns list of all carriers with their metrics.

### 2. **Score Carriers** ⭐ Main Endpoint
```bash
POST /api/score
Content-Type: application/json

{
  "carrier_data": []
}
```
Returns ranked carriers based on AI scoring.

**Response includes:**
- `carriers`: Sorted list with scores
- `rankings`: Detailed ranking info
- `weights_used`: Scoring weights
- `computation_ms`: Processing time

### 3. **Explain Carrier Score**
```bash
GET /api/explain/{carrier_id}
```
Returns SHAP-based explanation for why carrier was scored.

**Response includes:**
- `features`: Feature importance scores
- `explanation`: Human-readable narrative
- `contributions`: How each feature impacted score

### 4. **Research Carrier**
```bash
GET /api/research/{carrier_id}
```
Returns detailed research about carrier including financials and risk.

### 5. **Feedback Loop**
```bash
POST /api/feedback/
Content-Type: application/json

{
  "carrier_id": "CARRIER_001",
  "outcome": "selected",
  "performance_rating": 5.0
}
```
Submits feedback to improve model over time.

### 6. **Stream Scoring** (Real-time AI)
```bash
POST /api/score/stream
Content-Type: application/json

{
  "carrier_data": []
}
```
Streams scoring with real-time AI agent debate.

### 7. **What-If Analysis**
```bash
POST /api/whatif/
```
Simulate different carrier scenarios and costs.

### 8. **Financial Health**
```bash
GET /api/financial_health/
```
Get financial analysis of carriers.

## ✅ Health Check

```bash
GET /health
```

Returns:
```json
{
  "status": "healthy",
  "version": "3.0.0",
  "carriers_loaded": 30,
  "model_trained": true
}
```

## 📊 Sample Carrier IDs

- CARRIER_001 - TransIndia Premium Logistics
- CARRIER_020 - SwiftFreight India (Top ranked)
- CARRIER_030 - ValueCargo Services

## 🎯 Example Workflow

1. **Get carriers**: `GET /api/carriers`
2. **Score them**: `POST /api/score`
3. **Get top pick**: Select rank 1 carrier
4. **Explain why**: `GET /api/explain/CARRIER_020`
5. **Research details**: `GET /api/research/CARRIER_020`

## 🐛 Troubleshooting

### API not starting
- Check Python version: `python --version` (3.9+)
- Install dependencies: `pip install -r requirements.txt`
- Set ANTHROPIC_API_KEY in .env

### No carriers returned
- Check `data/carriers.csv` exists
- Run: `python backend/carrier_data.py`

### Slow responses
- First request trains model (~5 seconds)
- Subsequent requests are faster
- Check `computation_ms` in response

## 🎬 For Your Video Demo

**Quick 2-minute demo flow:**
1. Hit `/health` - show system is ready
2. Call `/api/score` - show ranked carriers
3. Show top 3 with scores
4. Call `/api/explain/CARRIER_020` - show explanation
5. Show SHAP feature importance

**Quick 5-minute demo flow:**
1. All above steps
2. Call `/api/research/{carrier_id}` - show financials
3. Call `/api/whatif/` - show cost scenarios
4. Call `/api/feedback/` - show feedback loop
5. Show Swagger docs at `/docs`

## 📦 Environment Setup

Create `.env` file in project root:
```
ANTHROPIC_API_KEY=sk-...
GEMINI_API_KEY=your-key
EXA_API_KEY=your-key
```

## 🚀 Next Steps

1. ✅ API is running
2. ✅ All endpoints working
3. ✅ Swagger docs available
4. Ready to record video!

---

**API Status**: ✅ All systems operational
**Last Updated**: 2026-03-15
