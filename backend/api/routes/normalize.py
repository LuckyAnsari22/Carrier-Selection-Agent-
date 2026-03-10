from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any
import logging
from agents.bid_normalizer import normalize_bids

# Setup logging
logger = logging.getLogger(__name__)

router = APIRouter()

class NormalizeRequest(BaseModel):
    """Request model for bid normalization."""
    raw_submissions: str = Field(..., description="The raw carrier bid submissions text")

    class Config:
        json_schema_extra = {
            "example": {
                "raw_submissions": "Carrier A: $2 per kg, 3 business day transit. Fuel included. Liability $10/kg.\nCarrier B: 1500 USD per 500kg shipment. 5 calendar days. 15% fuel surcharge. Liability missing."
            }
        }

class NormalizedBid(BaseModel):
    """Response model for a normalized bid."""
    carrier_name: str
    normalized_cost_per_kg_usd: float | None = None
    transit_days_calendar: float | None = None
    fuel_surcharge_pct: float | None = None
    liability_per_kg_usd: float | None = None
    invoice_accuracy_sla_pct: float | None = None
    missing_fields: List[str]
    anomaly_flags: List[str]
    normalization_notes: str

@router.post("/", response_model=List[NormalizedBid])
async def normalize(request: NormalizeRequest):
    """
    Expert Bid Normalization
    
    Receives raw carrier bid submissions in inconsistent formats and 
    normalizes them to a single comparable standard:
    TOTAL ALL-IN COST PER KG, DOOR-TO-DOOR, CALENDAR DAYS.
    """
    try:
        normalized_data = await normalize_bids(request.raw_submissions)
        if not normalized_data:
            raise HTTPException(status_code=500, detail="Failed to normalize bids.")
        return normalized_data
    except Exception as e:
        logger.error(f"Error in bid normalization route: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Normalization failed: {str(e)}")
