from fastapi import APIRouter, Request, HTTPException
from typing import List, Dict

router = APIRouter()

@router.get("")
async def get_risks(request: Request):
    """
    Detect operational risks across the carrier network.
    """
    engine = getattr(request.app.state, "engine", None)
    df = getattr(request.app.state, "df", None)
    
    if engine is None or df is None:
        raise HTTPException(status_code=500, detail="Scoring engine not initialized")
        
    try:
        risks = engine.detect_operational_risks(df)
        summary = engine.get_performance_summary(df)
        
        # Add summary stats for dashboard
        # overextended, high_damage, delay_prone, total_flagged
        dashboard_summary = {
            "overextended": summary.get("n_overextended", 0),
            "high_damage": sum(1 for r in risks if r["risk_type"] == "Quality Risk"),
            "delay_prone": summary.get("n_high_risk", 0),
            "total_flagged": len(list(set(r["carrier_name"] for r in risks)))
        }
        
        return {
            "status": "success",
            "risks": risks,
            "summary": dashboard_summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
