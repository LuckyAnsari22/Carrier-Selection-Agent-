from fastapi import APIRouter, HTTPException, Request, Query
from typing import Dict

router = APIRouter()

@router.get("")
async def compare_carriers(
    request: Request,
    ids: str = Query(..., description="Comma-separated carrier IDs (max 5)")
) -> Dict:
    """
    Compare up to 5 carriers side-by-side.
    """
    df = getattr(request.app.state, "df", None)
    engine = getattr(request.app.state, "engine", None)
    
    if df is None or engine is None:
        raise HTTPException(status_code=500, detail="Data or engine not initialized")
        
    carrier_ids = [id.strip() for id in ids.split(',')]
    if len(carrier_ids) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 carriers allowed")
        
    # Score carriers to get ranks
    df_scored = engine.score_carriers(df)
    
    carriers_list = []
    for cid in carrier_ids:
        match = df_scored[df_scored['carrier_id'] == cid]
        if not match.empty:
            row = match.iloc[0]
            carriers_list.append(row.to_dict())
            
    return {"carriers": carriers_list}
