from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import logging
import pandas as pd
import numpy as np
import json
from agents.financial_health_agent import run_financial_health_assessment

# Setup logging
logger = logging.getLogger(__name__)

router = APIRouter()

class HealthRequest(BaseModel):
    carrier_id: str
    include_market_noise: bool = True

    class Config:
        json_schema_extra = {
            "example": {
                "carrier_id": "CARRIER_001",
                "include_market_noise": True
            }
        }

@router.post("/")
async def assessment(request: Request, body: HealthRequest):
    """
    Generate Financial Health Assessment for a specific carrier.
    """
    app = request.app
    if not hasattr(app.state, 'df'):
        raise HTTPException(status_code=500, detail="Carrier data not loaded.")
    
    df: pd.DataFrame = app.state.df
    matches = df[df['carrier_id'] == body.carrier_id]
    
    if matches.empty:
        raise HTTPException(status_code=404, detail="Carrier not found.")
    
    carrier = matches.iloc[0]
    
    # 1. Synthesize HARD signals based on existing metrics (Simulation logic)
    hard_signals = []
    if carrier['delay_risk'] > 85:
        hard_signals.append("FMCSA safety rating downgraded to 'CONSIDERATION' after 3-month incident pattern.")
    if carrier['rating'] < 3.0:
        hard_signals.append("Credit score (Dun & Bradstreet) dropped 15 points below industry average.")
    if carrier['capacity_utilization'] > 0.95:
        hard_signals.append("CSA scores in Maintenance and HOS compliance show 22% deterioration vs. Q1.")
    
    # 2. Synthesize SOFT signals
    soft_signals = []
    if carrier['delay_risk'] > 75:
        soft_signals.append("Glassdoor spike in anonymous reports mentioning 'payroll delays' and 'driver turnover'.")
    if carrier['capacity_utilization'] > 0.9:
        soft_signals.append("Public news: Carrier confirmed restructuring talks with equipment financiers.")
    if np.random.rand() > 0.5 and body.include_market_noise:
        soft_signals.append("Market Rumor: Peer carrier in same asset class filed for Chapter 11; observing fleet reductions.")

    # 3. Get LLM Assessment
    try:
        assessment_text = await run_financial_health_assessment(
            carrier_name=carrier['carrier_name'],
            hard_signals=hard_signals,
            soft_signals=soft_signals,
            historical_status="WATCH" if carrier['delay_risk'] > 60 else "STABLE"
        )
    except Exception as e:
        logger.error(f"Financial Health LLM Error: {e}")
        assessment_text = "Assessment failed. The AI service is currently unavailable or encountering limits."
    
    # Extract score for UI visualization (naive extraction)
    health_score = 85 # Default
    if "HEALTH SCORE:" in assessment_text:
        try:
            score_line = [l for l in assessment_text.split('\n') if "HEALTH SCORE:" in l][0]
            val = score_line.split(':')[1].split('|')[0].strip()
            health_score = int(val)
        except:
            pass

    return {
        "assessment": assessment_text,
        "health_score": health_score,
        "carrier_name": carrier['carrier_name'],
        "metrics": {
            "delay_risk": float(carrier['delay_risk']),
            "utilization": float(carrier['capacity_utilization']),
            "rating": float(carrier['rating'])
        }
    }
