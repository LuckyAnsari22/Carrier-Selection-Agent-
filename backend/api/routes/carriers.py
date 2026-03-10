"""
Carriers data endpoints.

GET /api/carriers - List all available carriers
"""

from fastapi import APIRouter, HTTPException, Request

router = APIRouter()

@router.get("", response_description="List of all carriers")
async def list_carriers(request: Request):
    """
    Get all available carriers from database.
    """
    df = getattr(request.app.state, "df", None)
    
    if df is not None:
        # Convert DataFrame to list of dicts
        return df.to_dict(orient="records")
    
    # Fallback to loading from CSV if DF not in state
    from pathlib import Path
    import csv
    csv_path = Path(__file__).parent.parent.parent / "data" / "carriers.csv"
    carriers = []
    
    try:
        with open(csv_path, "r") as f:
            reader = csv.DictReader(f)
            for row in reader:
                carrier = {
                    "id": row.get("id", row.get("carrier_id")),
                    "name": row.get("name", row.get("carrier_name")),
                    "otd_rate": float(row.get("otd_rate", row.get("ontime_pct", 0)) / 100 if "ontime_pct" in row else row.get("otd_rate", 0)),
                    "damage_rate": float(row.get("damage_rate", 0)),
                    "capacity_utilization": float(row.get("capacity_utilization", 0)),
                    "price_per_kg": float(row.get("price_per_kg", row.get("cost_per_km", 0))),
                    # ... add more mapping if needed
                }
                carriers.append(carrier)
    except Exception as e:
        print(f"Error loading fallback carriers: {e}")
    
    if not carriers:
        raise HTTPException(status_code=500, detail="Failed to load carriers")
    return carriers

@router.get("/{carrier_id}", response_description="Single carrier details")
async def get_carrier(carrier_id: str, request: Request):
    """
    Get details for a specific carrier.
    """
    df = getattr(request.app.state, "df", None)
    
    if df is not None:
        carrier = df[df['carrier_id'] == carrier_id]
        if not carrier.empty:
            return carrier.iloc[0].to_dict()
    
    raise HTTPException(status_code=404, detail=f"Carrier {carrier_id} not found")
