from fastapi import APIRouter, HTTPException
from typing import Dict, List

router = APIRouter()


@router.get("/{carrier_id}")
async def research_carrier(carrier_id: str):
    """Get live research on a carrier from Exa News API."""
    try:
        # Placeholder: In production, call Exa API for real-time news
        return {
            "carrier_id": carrier_id,
            "carrier_name": f"Carrier {carrier_id}",
            "news": [
                {
                    "headline": "Port strike impact on Q1 deliveries",
                    "source": "Supply Chain Dive",
                    "sentiment": "negative",
                    "impact": "Potential 5% delay increase",
                    "date": "2024-03-08"
                },
                {
                    "headline": "New capacity addition announced",
                    "source": "Logistics Journal",
                    "sentiment": "positive",
                    "impact": "10% capacity increase by Q2",
                    "date": "2024-03-06"
                }
            ],
            "weather_impact": {
                "region": "Mumbai",
                "forecast": "Monsoon risk in 2 weeks",
                "risk_level": "medium"
            },
            "port_status": {
                "port": "Mumbai Port",
                "congestion": 72,
                "estimated_delay_hours": 24
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/batch")
async def research_batch(request: dict):
    """Get research for multiple carriers."""
    carrier_ids = request.get("carrier_ids", [])
    
    research_results = []
    for cid in carrier_ids:
        research_results.append({
            "carrier_id": cid,
            "news_count": 3,
            "risk_score": 35
        })
    
    return {"research": research_results}
