# CarrierIQ v3 Backend API Documentation

## Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp ../.env.example ../.env
# Edit .env and add your ANTHROPIC_API_KEY
```

### 3. Start the API Server

**Linux/Mac:**
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Windows (PowerShell):**
```powershell
& venv\Scripts\activate
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Verify It's Running

```bash
curl http://localhost:8000/health
# Returns: {"status": "healthy", "version": "3.0.0"}
```

## API Endpoints

### 1. **Score Carriers** → `POST /api/score`

Score and rank carriers based on priorities.

**Request:**
```json
{
  "lane": "Mumbai → Delhi",
  "carriers": [
    {
      "id": "C001",
      "name": "TransCo Express",
      "otd_rate": 0.96,
      "damage_rate": 0.002,
      "capacity_utilization": 0.78,
      "price_per_kg": 2.50,
      "avg_transit_days": 3,
      "claim_resolution_days": 5,
      "invoice_accuracy": 0.98,
      "years_in_operation": 12
    }
  ],
  "priorities": {
    "cost": 0.40,
    "reliability": 0.35,
    "speed": 0.15,
    "quality": 0.10
  }
}
```

**Response:**
```json
{
  "status": "success",
  "lane": "Mumbai → Delhi",
  "rankings": [
    {
      "id": "C001",
      "name": "TransCo Express",
      "rank": 1,
      "score_pct": 87.3,
      "delay_risk": 25.5,
      "shap_values": {...}
    }
  ],
  "global_health": 95
}
```

### 2. **Stream Agent Debate** → `POST /api/score/stream`

Get real-time agent debate via Server-Sent Events.

**Request:**
```json
{
  "lane": "Mumbai → Delhi",
  "carriers": [...],
  "priorities": {...}
}
```

**Response (SSE):**
```
data: {"type": "initial_ranking", "rankings": [...]}
data: {"type": "agent_start", "agent": "Cost Optimizer", "icon": "💰"}
data: {"type": "agent_message", "agent": "Cost Optimizer", "content": "..."}
data: {"type": "agent_start", "agent": "Reliability Guardian", "icon": "🛡️"}
...
data: {"type": "recommendation", "content": {...}}
data: {"type": "complete", "state": {...}}
```

### 3. **Explain Score** → `GET /api/explain/{carrier_id}`

Get SHAP explanation for a carrier.

**Response:**
```json
{
  "carrier_id": "C001",
  "carrier_name": "TransCo Express",
  "score": 87.3,
  "prediction": "Delay risk probability",
  "features": {
    "On-Time Delivery Rate": 0.18,
    "Cargo Damage Rate": -0.12,
    "Network Capacity Utilization": -0.05,
    ...
  },
  "base_value": 0.70,
  "narrative": "This carrier scores well primarily due to..."
}
```

### 4. **Research Carrier** → `GET /api/research/{carrier_id}`

Get live news, weather, and port status for a carrier.

**Response:**
```json
{
  "carrier_id": "C001",
  "news": [
    {
      "headline": "Port strike impact on Q1 deliveries",
      "source": "Supply Chain Dive",
      "sentiment": "negative",
      "impact": "Potential 5% delay increase"
    }
  ],
  "weather_impact": {...},
  "port_status": {...}
}
```

### 5. **Submit Feedback** → `POST /api/feedback`

Record procurement decision outcomes for model improvement.

**Request:**
```json
{
  "lane": "Mumbai → Delhi",
  "awarded_carrier_id": "C001",
  "decision_rationale": "Highest score (87.3%) with low risk (25.5%)",
  "actual_outcome": {
    "otd_pct": 96.5,
    "damage_rate": 0.001,
    "cost_actual": 2.45
  },
  "feedback_text": "Excellent performance, recommend for future lanes"
}
```

**Response:**
```json
{
  "status": "recorded",
  "message": "Feedback saved for model retraining"
}
```

## System Architecture

```
FastAPI App (main.py)
├── /api/score → score.py (XGBoost + TOPSIS ranking)
├── /api/score/stream → stream.py (SSE agent debate)
├── /api/explain → explain.py (SHAP explanations)
├── /api/research → research.py (Live intelligence)
└── /api/feedback → feedback.py (Outcomes tracking)

Core Engine (core/)
├── scorer.py (XGBoost model, TOPSIS, AHP weighting)
└── pipeline.py (LangGraph agent orchestration)

Agents (agents/)
├── judge_agent.py (Cost vs Reliability synthesis)
├── cost_agent.py (Price analysis)
├── reliability_agent.py (OTD & damage analysis)
└── shap_explainer.py (SHAP narrative generation)
```

## Scoring Methodology

### 1. **Risk Prediction** (XGBoost)
- Trained on 2000 synthetic carrier profiles
- Predicts: Delay Risk Score (0-100)
- Uses: OTD, damage, capacity, cost, transit time, claims, invoice accuracy, experience

### 2. **TOPSIS Ranking**
- Normalizes all features to [0, 1]
- Weights features based on priorities (cost, reliability, speed, quality)
- Calculates distance to ideal solution
- Returns TOPSIS score (0-100%)

### 3. **AHP Priority Weighting**
- Maps business priorities to feature weights:
  - Cost: price_per_kg, invoice_accuracy
  - Reliability: otd_rate, damage_rate, claim_resolution_days, years_in_operation
  - Speed: avg_transit_days
  - Quality: capacity_utilization

### 4. **Agent Debate**
- **Cost Optimizer**: Analyzes pricing and billing
- **Reliability Guardian**: Evaluates OTD and safety
- **Procurement Judge**: Synthesizes recommendations
- **SHAP Explainer**: Generates attribution narrative

## Development

### Run Tests

```bash
python -m pytest tests/ -v
```

### Generate Sample Data

```python
from backend.data.carriers import generate_sample_carriers
carriers = generate_sample_carriers()
```

### View API Documentation

Visit: **http://localhost:8000/docs**

Interactive Swagger UI with all endpoints and schemas.

## Configuration

### Environment Variables (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | Claude API key | ✅ Yes |
| `EXA_API_KEY` | News API key | ❌ No |
| `LANGFUSE_PUBLIC_KEY` | Observability | ❌ No |
| `LANGFUSE_SECRET_KEY` | Observability | ❌ No |
| `DB_URL` | Database URL | ❌ No (defaults to SQLite) |
| `MODEL` | Claude model name | ❌ No (defaults to sonnet-4) |
| `DEBUG` | Debug mode | ❌ No |

## Troubleshooting

### "ANTHROPIC_API_KEY not set"
```bash
# Create .env file
cp ../.env.example ../.env
# Edit and add your key
```

### "Module not found: anthropic"
```bash
pip install anthropic
```

### Port 8000 already in use
```bash
# Use a different port
uvicorn main:app --port 8001
```

### SHAP calculation is slow
- SHAP uses tree explainer (faster than kernel)
- For first run, model training takes ~5 seconds
- Subsequent predictions are instant

## Performance Notes

- **Model Training**: ~5 seconds (first run)
- **Scoring (1 carrier)**: ~10ms
- **TOPSIS Ranking (5 carriers)**: ~20ms
- **Agent Debate (SSE)**: 2-5 seconds (depends on Claude latency)
- **SHAP Explanation**: ~50ms per carrier

## Next Steps

1. **Connect Frontend** → Update vite.config.js proxy if needed
2. **Add Authentication** → JWT or API keys
3. **Database Integration** → Replace SQLite with PostgreSQL
4. **Real-time Updates** → WebSocket for live alerts
5. **Exa News Integration** → Live research data
6. **Model Retraining** → Feedback loop pipeline
