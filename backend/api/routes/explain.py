from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Dict, List

router = APIRouter()


class ExplainResponse(BaseModel):
    carrier_name: str
    score: float
    rank: int
    contributions: Dict[str, float]
    explanation: str
    warnings: List[str] = []
    # v3 fields
    carrier_id: str
    features: Dict[str, float]
    base_value: float
    prediction: str
    narrative: str


@router.get("/{carrier_id}")
async def explain_score(carrier_id: str, request: Request):
    """Get SHAP-style explanation for a carrier score using real data."""
    try:
        df = getattr(request.app.state, "df", None)
        
        if df is not None and 'carrier_id' in df.columns:
            match = df[df['carrier_id'] == carrier_id]
            if not match.empty:
                import json
                # Use pandas to_json trick for ultimate safety with numpy types
                carrier_json = match.iloc[:1].to_json(orient="records")
                carrier = json.loads(carrier_json)[0]
                
                # Compute relative contributions (vs market averages)
                avg_otd = float(df['ontime_pct'].mean()) if 'ontime_pct' in df else 90.0
                avg_damage = float(df['damage_rate'].mean()) if 'damage_rate' in df else 1.0
                avg_cost = float(df['cost_per_km'].mean()) if 'cost_per_km' in df else 30.0
                avg_util = float(df['capacity_utilization'].mean()) if 'capacity_utilization' in df else 0.7
                avg_rating = float(df['rating'].mean()) if 'rating' in df else 3.5
                
                otd = float(carrier.get('ontime_pct', 90))
                damage = float(carrier.get('damage_rate', 1.0))
                cost = float(carrier.get('cost_per_km', 30))
                util = float(carrier.get('capacity_utilization', 0.7))
                rating = float(carrier.get('rating', 3.5))
                experience = float(carrier.get('years_experience', 5))
                delay_risk = float(carrier.get('delay_risk', 50))
                
                features = {
                    "On-Time Delivery Rate": round((otd - avg_otd) * 0.03, 3),
                    "Cargo Damage Rate": round((avg_damage - damage) * 0.15, 3),
                    "Network Capacity Utilization": round((0.75 - util) * 0.2, 3),
                    "Cost Efficiency": round((avg_cost - cost) / max(avg_cost, 1) * 0.4, 3),
                    "Transit Speed": round((100 - delay_risk) * 0.002, 3),
                    "Carrier Rating": round((rating - avg_rating) * 0.1, 3),
                    "Operational Experience": round(min(experience / 20, 1) * 0.09, 3),
                }
                
                final_score = carrier.get('final_score', 0.75)
                
                # Generate narrative
                sorted_feats = sorted(features.items(), key=lambda x: abs(x[1]), reverse=True)
                top_positive = [f for f in sorted_feats if f[1] > 0]
                top_negative = [f for f in sorted_feats if f[1] < 0]
                
                strengths = ", ".join([f[0].lower() for f in top_positive[:2]]) if top_positive else "balanced metrics"
                weaknesses = ", ".join([f[0].lower() for f in top_negative[:2]]) if top_negative else "no significant weaknesses"
                
                narrative = (
                    f"This carrier scores well primarily due to strong {strengths}, "
                    f"partially offset by {weaknesses}. "
                    f"Overall risk-adjusted score: {final_score*100:.1f}/100."
                )
                
                return {
                    "carrier_id": str(carrier_id),
                    "carrier_name": str(carrier.get('carrier_name', f'Carrier {carrier_id}')),
                    "score": float(final_score),
                    "rank": int(carrier.get('rank', 0)),
                    "prediction": "On-time delivery probability",
                    "features": {k: float(v) for k, v in features.items()},
                    "contributions": {k: float(v) for k, v in features.items()}, # v2 mapping
                    "explanation": str(narrative), # v2 mapping
                    "base_value": 0.70,
                    "narrative": str(narrative),
                    "warnings": [] # v2 mapping
                }
        
        # Fallback if carrier not found in scored data
        raise HTTPException(status_code=404, detail=f"Carrier {carrier_id} not found in scored results")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/batch")
async def explain_batch(request_body: dict, request: Request):
    """Get explanations for multiple carriers."""
    carrier_ids = request_body.get("carrier_ids", [])
    df = getattr(request.app.state, "df", None)
    
    explanations = []
    for cid in carrier_ids:
        if df is not None and 'carrier_id' in df.columns:
            match = df[df['carrier_id'] == cid]
            if not match.empty:
                carrier = match.iloc[0]
                explanations.append({
                    "carrier_id": cid,
                    "score": float(round(carrier.get('final_score', 0.7) * 100, 1)),
                    "features": {
                        "On-Time Delivery": float(round((carrier.get('ontime_pct', 90) - 90) * 0.03, 3)),
                        "Damage Rate": float(round((1.0 - carrier.get('damage_rate', 1.0)) * 0.15, 3)),
                    }
                })
            else:
                explanations.append({"carrier_id": cid, "score": 0, "features": {}})
        else:
            explanations.append({"carrier_id": cid, "score": 0, "features": {}})
    
    return {"explanations": explanations}
