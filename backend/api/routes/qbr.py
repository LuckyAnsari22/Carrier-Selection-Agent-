from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import logging
import pandas as pd
from agents.qbr_agent import generate_qbr_scorecard

# Setup logging
logger = logging.getLogger(__name__)

router = APIRouter()

class QBRRequest(BaseModel):
    carrier_id: str
    lane: str = "Mumbai-Delhi"
    quarter: str = "Q1"
    year: int = 2026

@router.post("/")
async def get_qbr(request: Request, body: QBRRequest):
    """
    Generate QBR Scorecard for a carrier performance meeting.
    """
    app = request.app
    if not hasattr(app.state, 'df'):
        raise HTTPException(status_code=500, detail="Carrier data not loaded.")
    
    df: pd.DataFrame = app.state.df
    matches = df[df['carrier_id'] == body.carrier_id]
    
    if matches.empty:
        raise HTTPException(status_code=404, detail="Carrier not found.")
    
    carrier = matches.iloc[0]
    
    # Use real or simulated metrics
    metrics = {
        'otd_pct': float(carrier['ontime_pct']),
        'damage_rate': float(carrier['damage_rate']),
        'invoice_accuracy_pct': 99.2, # Hardcoded/simulated for QBR
        'claims_resolution_days': float(round(carrier['delay_risk'] / 15, 1)),
        'response_time_hours': 2.5
    }
    
    qbr_text = await generate_qbr_scorecard(
        carrier_name=carrier['carrier_name'],
        lane=body.lane,
        quarter=body.quarter,
        year=body.year,
        metrics=metrics
    )
    
    return {
        "qbr_report": qbr_text,
        "carrier_name": carrier['carrier_name'],
        "metrics": metrics
    }
