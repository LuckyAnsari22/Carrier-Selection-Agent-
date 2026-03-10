from fastapi import APIRouter, Request, HTTPException

router = APIRouter()

@router.get("")
async def get_stats(request: Request):
    """
    Get system statistics and feedback log summary.
    """
    df = getattr(request.app.state, "df", None)
    engine = getattr(request.app.state, "engine", None)
    
    if df is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
        
    return {
        "total_carriers": len(df),
        "total_feedback_entries": len(getattr(request.app.state, "feedback_log", [])),
        "model_status": "trained" if engine and engine.risk_model else "not_trained",
        "api_version": "3.0.0"
    }
