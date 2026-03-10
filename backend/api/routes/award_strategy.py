from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import logging
import pandas as pd
from agents.award_strategy_agent import run_award_strategy_design

# Setup logging
logger = logging.getLogger(__name__)

router = APIRouter()

class StrategyRequest(BaseModel):
    lane: str = Field(..., description="e.g., Mumbai-Delhi")
    priority_carrier_id: str = Field(..., description="e.g., CARRIER_001")
    secondary_carrier_id: str = Field(..., description="e.g., CARRIER_002")
    contract_term_months: int = 12
    annual_volume_impact_kg: float = 1200000

    class Config:
        json_schema_extra = {
            "example": {
                "lane": "Mumbai-Delhi",
                "priority_carrier_id": "CARRIER_001",
                "secondary_carrier_id": "CARRIER_002",
                "contract_term_months": 12,
                "annual_volume_impact_kg": 1200000
            }
        }

@router.post("/")
async def get_strategy(request: Request, body: StrategyRequest):
    """
    Design an Award Strategy portfolio for a shipment lane.
    """
    app = request.app
    if not hasattr(app.state, 'df'):
        raise HTTPException(status_code=500, detail="Carrier data not loaded.")
    
    df: pd.DataFrame = app.state.df
    
    primary_matches = df[df['carrier_id'] == body.priority_carrier_id]
    secondary_matches = df[df['carrier_id'] == body.secondary_carrier_id]
    
    if primary_matches.empty or secondary_matches.empty:
        raise HTTPException(status_code=404, detail="Primary or Secondary carrier not found.")
    
    primary_carrier = primary_matches.iloc[0].to_dict()
    secondary_carrier = secondary_matches.iloc[0].to_dict()
    
    strategy_report = await run_award_strategy_design(
        lane=body.lane,
        primary_carrier=primary_carrier,
        secondary_carrier=secondary_carrier,
        contract_term_months=body.contract_term_months,
        total_volume_annual=body.annual_volume_impact_kg
    )
    
    return {
        "strategy": strategy_report,
        "lane": body.lane,
        "primary": primary_carrier['carrier_name'],
        "secondary": secondary_carrier['carrier_name']
    }
