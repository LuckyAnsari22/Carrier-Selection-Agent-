from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import logging
import pandas as pd
import numpy as np
from agents.whatif_agent import run_whatif_analysis
from carrier_scorer_production import CarrierScoringEngine, AHPWeightGenerator

# Setup logging
logger = logging.getLogger(__name__)

router = APIRouter()

class WhatIfRequest(BaseModel):
    """Request model for what-if simulation."""
    scenario_name: str = Field(..., description="e.g., MONSOON PROTOCOL or CUSTOM")
    weights: Dict[str, int] = Field(..., description="Weights for cost, reliability, speed, quality (0-100)")
    filters: Optional[Dict[str, Any]] = Field(None, description="Optional filters (e.g., {'max_damage': 1.0, 'max_util': 0.8})")

    class Config:
        json_schema_extra = {
            "example": {
                "scenario_name": "MONSOON PROTOCOL",
                "weights": {"cost": 20, "reliability": 60, "speed": 10, "quality": 10},
                "filters": {"max_damage": 1.0}
            }
        }

@router.post("/")
async def simulate(request: Request, whatif_req: WhatIfRequest):
    """
    Simulate scenario impact on carrier rankings.
    """
    app = request.app
    if not hasattr(app.state, 'engine'):
        raise HTTPException(status_code=500, detail="Scoring engine not initialized.")
    
    engine: CarrierScoringEngine = app.state.engine
    df: pd.DataFrame = app.state.df
    
    # 1. Baseline Scoring (using default weights)
    baseline_weights = AHPWeightGenerator.get_default_weights()
    df_baseline = engine.score_carriers(df, weights=baseline_weights)
    
    # Get top 5 baseline
    baseline_top_5 = df_baseline.nsmallest(5, 'rank')[['carrier_id', 'carrier_name', 'rank', 'cost_per_km', 'ontime_pct']]
    
    # 2. Scenario Scoring
    scenario_weights = AHPWeightGenerator.generate_from_importance(
        cost=whatif_req.weights.get('cost', 25),
        reliability=whatif_req.weights.get('reliability', 25),
        speed=whatif_req.weights.get('speed', 25),
        quality=whatif_req.weights.get('quality', 25)
    )
    
    # Apply filters if any
    df_filtered = df.copy()
    if whatif_req.filters:
        if 'max_damage' in whatif_req.filters:
            df_filtered = df_filtered[df_filtered['damage_rate'] <= whatif_req.filters['max_damage']]
        if 'max_util' in whatif_req.filters:
            df_filtered = df_filtered[df_filtered['capacity_utilization'] <= whatif_req.filters['max_util']]
            
    if df_filtered.empty:
        raise HTTPException(status_code=400, detail="Filters are too restrictive. No carriers remain.")
    
    df_scenario = engine.score_carriers(df_filtered, weights=scenario_weights)
    
    # Get top 5 scenario and map original ranks
    scenario_top_5 = df_scenario.nsmallest(5, 'rank').copy()
    scenario_top_5['original_rank'] = scenario_top_5['carrier_id'].map(
        df_baseline.set_index('carrier_id')['rank']
    ).fillna(99) # 99 means it was outside baseline ranked top
    
    # Scale ranking to int
    scenario_top_5['original_rank'] = scenario_top_5['original_rank'].astype(int)
    
    # Calculate deltas (simple assumptions for impact)
    # Average cost delta per 1000km shipment
    baseline_weight_total = float(df_baseline.nsmallest(5, 'rank')['cost_per_km'].mean() * 1000)
    scenario_weight_total = float(scenario_top_5['cost_per_km'].mean() * 1000)
    financial_delta = float((scenario_weight_total - baseline_weight_total) * 200) # 200 shipments/month
    
    # OTD delta
    baseline_otd = float(df_baseline.nsmallest(5, 'rank')['ontime_pct'].mean())
    scenario_otd = float(scenario_top_5['ontime_pct'].mean())
    service_delta = float(scenario_otd - baseline_otd)
    
    # Prepare data for agent
    baseline_top_5_list = baseline_top_5.to_dict('records')
    scenario_top_5_list = scenario_top_5.to_dict('records')
    
    # 3. Get LLM Analysis
    analysis = await run_whatif_analysis(
        scenario_name=whatif_req.scenario_name,
        weights=scenario_weights,
        baseline_top_5=baseline_top_5_list,
        scenario_top_5=scenario_top_5_list,
        financial_delta=financial_delta,
        service_delta=service_delta
    )
    
    return {
        "analysis": analysis,
        "scenario_top_5": scenario_top_5_list,
        "weights": scenario_weights,
        "impact": {
            "financial_delta_usd": financial_delta,
            "service_delta_otd": service_delta
        }
    }
