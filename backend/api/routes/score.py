from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
import json
import pandas as pd

router = APIRouter()


import uuid
import time

# Ticket cache: id -> {data: ..., expiry: ...}
STREAM_TICKETS: Dict[str, dict] = {}


class CarrierData(BaseModel):
    """Carrier data model with required fields."""
    carrier_id: str = Field(..., description="Unique carrier identifier")
    carrier_name: str = Field(..., description="Carrier company name")
    tier: str = Field(..., description="Carrier tier (Premium, Standard, Budget)")
    cost_per_km: float = Field(..., description="Cost per kilometer")
    ontime_pct: float = Field(..., description="On-time delivery percentage (0-100)")
    damage_rate: float = Field(..., description="Damage rate (lower is better)")
    capacity_utilization: float = Field(..., description="Capacity utilization (0-1)")
    rating: float = Field(..., description="Rating (0-5)")
    years_experience: int = Field(..., description="Years in operation")
    routes_covered: int = Field(..., description="Number of routes covered")
    transit_consistency: float = Field(..., description="Transit consistency (0-1)")
    avg_delay_hours: float = Field(..., description="Average delay in hours")
    claims_last_month: int = Field(..., description="Number of claims last month")


class ScoreRequest(BaseModel):
    """Request model for carrier scoring API."""
    lane: Optional[str] = Field("Global Lane", description="Lane/route description")
    carriers: Optional[List[CarrierData]] = Field(None, description="List of carriers to score")
    priorities: Optional[Dict[str, float]] = Field(
        None, 
        description="Priority weights: cost, reliability, speed, quality (should sum to 1.0)"
    )
    # Support for v2 flat structure
    cost: Optional[int] = Field(None, description="Cost priority slider (0-100)")
    reliability: Optional[int] = Field(None, description="Reliability priority slider (0-100)")
    speed: Optional[int] = Field(None, description="Speed priority slider (0-100)")
    quality: Optional[int] = Field(None, description="Quality priority slider (0-100)")
    
    class Config:
        schema_extra = {
            "example": {
                "lane": "Mumbai → Delhi",
                "carriers": [
                    {
                        "carrier_id": "C001",
                        "carrier_name": "Fast Haul Express",
                        "tier": "Premium",
                        "cost_per_km": 2.50,
                        "ontime_pct": 96.0,
                        "damage_rate": 0.2,
                        "capacity_utilization": 0.78,
                        "rating": 4.8,
                        "years_experience": 12,
                        "routes_covered": 120,
                        "transit_consistency": 0.95,
                        "avg_delay_hours": 1.5,
                        "claims_last_month": 2
                    },
                    {
                        "carrier_id": "C002",
                        "carrier_name": "SafeRoute Logistics",
                        "tier": "Premium",
                        "cost_per_km": 3.20,
                        "ontime_pct": 98.0,
                        "damage_rate": 0.1,
                        "capacity_utilization": 0.85,
                        "rating": 4.9,
                        "years_experience": 15,
                        "routes_covered": 150,
                        "transit_consistency": 0.97,
                        "avg_delay_hours": 0.8,
                        "claims_last_month": 1
                    }
                ],
                "priorities": {
                    "cost": 0.40,
                    "reliability": 0.35,
                    "speed": 0.15,
                    "quality": 0.10
                }
            }
        }


class StreamTicketRequest(BaseModel):
    lane: Optional[str] = Field("Global Lane", description="Lane/route description")
    carriers: Optional[List[CarrierData]] = Field(None, description="List of carriers to score")
    priorities: Optional[Dict[str, float]] = Field(None, description="Priority weights")


@router.get("")
async def get_scored_carriers(fast_api_request: Request):
    """Return pre-scored carriers from the engine (used by pages that just need carrier list)."""
    df = getattr(fast_api_request.app.state, "df", None)
    if df is None:
        raise HTTPException(status_code=500, detail="Carrier data not loaded")
    
    # Use pandas to_json trick for ultimate safety with numpy types
    records_json = df.to_json(orient="records")
    ranked = json.loads(records_json)
    ranked = sorted(ranked, key=lambda x: x.get('rank', 999))
    
    top_score = ranked[0].get("final_score", 0) if ranked else 0
    
    return {
        "status": "success",
        "carriers": ranked,
        "rankings": ranked,
        "global_health": 95 if float(top_score) > 0.8 else 75,
    }


@router.post("")
async def score_carriers(request: ScoreRequest, fast_api_request: Request):
    """Score and rank carriers using the production engine."""
    engine = getattr(fast_api_request.app.state, "engine", None)
    if not engine:
        raise HTTPException(status_code=500, detail="Scoring engine not initialized")
        
    try:
        start_time = time.time()
        
        # Determine weights
        if request.priorities:
            weights = request.priorities
        elif any(v is not None for v in [request.cost, request.reliability, request.speed, request.quality]):
            from carrier_scorer_production import AHPWeightGenerator
            weights = AHPWeightGenerator.generate_from_importance(
                cost=request.cost or 35,
                reliability=request.reliability or 30,
                speed=request.speed or 20,
                quality=request.quality or 15
            )
        else:
            weights = {"cost": 0.35, "reliability": 0.30, "speed": 0.20, "quality": 0.15}

        # Determine carriers
        if request.carriers:
            df = pd.DataFrame(request.carriers)
        else:
            df = getattr(fast_api_request.app.state, "df", None)
            if df is None:
                raise HTTPException(status_code=500, detail="Carrier data not loaded")
        
        # Scored carriers
        df_scored = engine.score_carriers(df, weights=weights)
        computation_ms = (time.time() - start_time) * 1000
        
        # Safe serialization using pandas to_json trick
        records_json = df_scored.to_json(orient="records")
        ranked = json.loads(records_json)
        
        # Sort by rank
        ranked = sorted(ranked, key=lambda x: x.get('rank', 999))
        
        return {
            "status": "success",
            "lane": request.lane,
            "carriers": ranked, # For v2 compatibility
            "rankings": ranked,
            "computation_ms": computation_ms, # For v2 compatibility
            "weights_used": weights, # For v2 compatibility
            "global_health": 95 if ranked[0].get("final_score", 0) > 0.8 else 75,
        }
    except Exception as e:
        import traceback
        print(f"Scoring Error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ticket")
async def create_stream_ticket(request: StreamTicketRequest, fast_api_request: Request):
    """Store large carrier data temporarily to avoid 431 errors in SSE."""
    ticket_id = str(uuid.uuid4())
    
    # Use provided data or fallback to app state
    carriers_list = request.carriers if request.carriers else None
    priorities_dict = request.priorities if request.priorities else {"cost": 0.35, "reliability": 0.30, "speed": 0.20, "quality": 0.15}
    lane_name = request.lane if request.lane else "Global Lane"
    
    STREAM_TICKETS[ticket_id] = {
        "lane": lane_name,
        "carriers": carriers_list,
        "priorities": priorities_dict,
        "expiry": time.time() + 600  # 10 minutes
    }
    
    # Simple cleanup of expired tickets
    now = time.time()
    expired = [tid for tid, obj in STREAM_TICKETS.items() if obj["expiry"] < now]
    for tid in expired:
        del STREAM_TICKETS[tid]
            
    return {"ticket_id": ticket_id}


@router.get("/stream")
async def stream_scores(
    lane: Optional[str] = None, 
    carriers: Optional[str] = None, 
    priorities: Optional[str] = None,
    ticket_id: Optional[str] = None,
    fast_api_request: Request = None
):
    """Score carriers and stream real-time agent debate (SSE)."""
    from core.pipeline import run_agent_pipeline
    try:
        if ticket_id and ticket_id in STREAM_TICKETS:
            ticket = STREAM_TICKETS[ticket_id]
            lane_name = ticket["lane"]
            carriers_list = ticket["carriers"]
            priorities_dict = ticket["priorities"]
        else:
            lane_name = lane or "Global Lane"
            carriers_list = json.loads(carriers) if carriers else None
            priorities_dict = json.loads(priorities) if priorities else {"cost": 0.35, "reliability": 0.30, "speed": 0.20, "quality": 0.15}
        
        # If no carriers provided, use app state carriers
        if not carriers_list:
            df = getattr(fast_api_request.app.state, "df", None) if fast_api_request else None
            if df is not None:
                carriers_list = df.to_dict('records')
            else:
                carriers_list = []
            
        async def event_generator():
            try:
                # Run agent pipeline with streaming
                async for event in run_agent_pipeline(
                    carriers=carriers_list,
                    priorities=priorities_dict,
                    lane=lane_name
                ):
                    yield f"data: {json.dumps(event)}\n\n"
            except Exception as inner_e:
                yield f"data: {json.dumps({'error': str(inner_e)})}\n\n"
        
        from fastapi.responses import StreamingResponse
        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
                "Connection": "keep-alive",
            }
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
