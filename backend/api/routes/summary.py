from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import logging
import pandas as pd
from agents.executive_summary import generate_executive_summary
from carrier_scorer_production import CarrierScoringEngine, AHPWeightGenerator

# Setup logging
logger = logging.getLogger(__name__)

router = APIRouter()

class SummaryRequest(BaseModel):
    """Request model for executive summary generation."""
    lane: str = Field(..., description="e.g., Mumbai-Delhi")
    urgency: str = Field("Standard", description="Standard / Priority / Critical")
    primary_carrier_id: str = Field(..., description="e.g., CARRIER_001")
    secondary_carrier_id: Optional[str] = Field(None, description="e.g., CARRIER_002")
    primary_allocation: int = Field(70, ge=0, le=100)
    secondary_allocation: int = Field(30, ge=0, le=100)
    current_spend: float = Field(..., description="Current annual spend on this lane")
    review_weeks: int = Field(12, description="Review period in weeks")

    class Config:
        json_schema_extra = {
            "example": {
                "lane": "Mumbai-Delhi",
                "urgency": "Standard",
                "primary_carrier_id": "CARRIER_001",
                "secondary_carrier_id": "CARRIER_002",
                "primary_allocation": 70,
                "secondary_allocation": 30,
                "current_spend": 1200000,
                "review_weeks": 12
            }
        }

@router.post("/")
async def get_summary(request: Request, body: SummaryRequest):
    """
    Generate CPO Management Briefing (Pyramid Principle)
    """
    app = request.app
    if not hasattr(app.state, 'engine'):
        raise HTTPException(status_code=500, detail="Scoring engine not initialized.")
    
    engine: CarrierScoringEngine = app.state.engine
    df: pd.DataFrame = app.state.df
    
    # Get primary carrier details
    primary_matches = df[df['carrier_id'] == body.primary_carrier_id]
    if primary_matches.empty:
        raise HTTPException(status_code=404, detail="Primary carrier not found.")
    primary = primary_matches.iloc[0]
    
    # Get secondary carrier details if provided
    secondary = None
    if body.secondary_carrier_id:
        secondary_matches = df[df['carrier_id'] == body.secondary_carrier_id]
        if not secondary_matches.empty:
            secondary = secondary_matches.iloc[0]
            
    # Calculate weighted metrics
    expected_otd = primary['ontime_pct'] * (body.primary_allocation / 100)
    if secondary is not None:
        expected_otd += secondary['ontime_pct'] * (body.secondary_allocation / 100)
    
    # Annual cost estimation (assuming 1,000,000 kg/year for this lane as simulation baseline)
    annual_volume_kg = 1000000 
    avg_cost_per_kg = (primary['cost_per_km'] * 1000 / 1000) * (body.primary_allocation/100) # Simplified
    if secondary is not None:
        avg_cost_per_kg += (secondary['cost_per_km'] * 1000 / 1000) * (body.secondary_allocation/100)
        
    annual_cost = avg_cost_per_kg * annual_volume_kg
    
    # Risk and Confidence
    risk_level = "LOW"
    if primary['delay_risk'] > 60 or (secondary is not None and secondary['delay_risk'] > 60):
        risk_level = "MEDIUM"
    if primary['delay_risk'] > 80 or (secondary is not None and secondary['delay_risk'] > 80):
        risk_level = "HIGH"
        
    confidence_score = 90 - (primary['damage_rate'] * 10)
    if secondary is not None:
        confidence_score = (confidence_score + (90 - secondary['damage_rate'] * 10)) / 2

    # Agent Reason and Monitor (to be synthesized by agent, but providing context)
    decision_reason = f"{primary['carrier_name']} shows strong reliability ({primary['ontime_pct']}% OTD) while secondary mitigates risk."
    risk_to_monitor = f"Monitor {primary['carrier_name']} capacity utilization (currently {primary['capacity_utilization']*100:.0f}%)."

    summary = await generate_executive_summary(
        lane=body.lane,
        urgency=body.urgency,
        primary_carrier=primary['carrier_name'],
        secondary_carrier=secondary['carrier_name'] if secondary is not None else "None",
        primary_allocation=body.primary_allocation,
        secondary_allocation=body.secondary_allocation,
        annual_cost=annual_cost,
        current_spend=body.current_spend,
        expected_otd=expected_otd,
        risk_level=risk_level,
        confidence_score=int(confidence_score),
        decision_reason=decision_reason,
        risk_to_monitor=risk_to_monitor,
        review_weeks=body.review_weeks
    )
    
    return {"summary": summary}
