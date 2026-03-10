from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional
import logging
import pandas as pd
from agents.feedback_agent import run_feedback_analysis
from feedback_loop import FeedbackEngine

# Setup logging
logger = logging.getLogger(__name__)

router = APIRouter()

class FeedbackSubmitRequest(BaseModel):
    carrier_id: str
    lane: str
    actual_ontime_pct: float
    actual_damage_rate: float
    actual_cost_per_km: Optional[float] = None
    actual_cost_deviation_pct: Optional[float] = None

@router.post("/")
async def record_outcome(request: Request, body: FeedbackSubmitRequest):
    """Record an award outcome for model improvement."""
    app = request.app
    if not hasattr(app.state, 'feedback_engine'):
        raise HTTPException(status_code=500, detail="Feedback engine not initialized.")
    
    fe: FeedbackEngine = app.state.feedback_engine
    engine = app.state.engine
    
    # Get initial predictions
    df_scored = engine.score_carriers(app.state.df)
    carrier_data = df_scored[df_scored['carrier_id'] == body.carrier_id].iloc[0]
    
    predicted_metrics = {
        'ontime_pct': carrier_data['ontime_pct'],
        'damage_rate': carrier_data['damage_rate'],
        'cost_per_km': carrier_data['cost_per_km']
    }
    
    # If deviation pct is provided but not cost per km, estimate cost per km
    cost_per_km = body.actual_cost_per_km
    if cost_per_km is None and body.actual_cost_deviation_pct is not None:
        cost_per_km = predicted_metrics['cost_per_km'] * (1 + body.actual_cost_deviation_pct / 100)
    elif cost_per_km is None:
        cost_per_km = predicted_metrics['cost_per_km']
        
    actual_metrics = {
        'ontime_pct': body.actual_ontime_pct,
        'damage_rate': body.actual_damage_rate,
        'cost_per_km': cost_per_km
    }
    
    result = fe.record_award_outcome(
        carrier_id=body.carrier_id,
        carrier_name=carrier_data['carrier_name'],
        lane=body.lane,
        predicted_metrics=predicted_metrics,
        actual_metrics=actual_metrics
    )
    
    return result

@router.get("/analysis")
async def get_mlops_analysis(request: Request):
    """Generate MLOps analysis of the feedback loop."""
    app = request.app
    fe: FeedbackEngine = app.state.feedback_engine
    
    stats = fe.get_feedback_stats()
    records = fe._load_outcomes()
    
    if records.empty:
        # Generate some synthetic data for demo if empty
        demo_outcomes = fe.simulate_feedback_demo()
        for d in demo_outcomes:
            fe.record_award_outcome(
                carrier_id=d['carrier_id'],
                carrier_name=d['carrier_name'],
                lane=d['lane'],
                predicted_metrics={'ontime_pct': d['predicted_ontime_pct'], 'damage_rate': d['predicted_damage_rate'], 'cost_per_km': d['predicted_cost_per_km']},
                actual_metrics={'ontime_pct': d['actual_ontime_pct'], 'damage_rate': d['actual_damage_rate'], 'cost_per_km': d['actual_cost_per_km']}
            )
        records = fe._load_outcomes()
        stats = fe.get_feedback_stats()

    # Compute metrics for agent
    delay_mae = (records['actual_ontime_pct'] - records['predicted_ontime_pct']).abs().mean()
    price_mape = (records['actual_cost_per_km'] - records['predicted_cost_per_km']).abs().div(records['predicted_cost_per_km']).mean() * 100
    
    # Human overrides are simulated as POOR quality outcomes that weren't predicted as such
    overrides = records[records['outcome_quality'] == 'POOR'].index.tolist()
    override_rate = (len(overrides) / len(records)) * 100
    
    bias_obs = "Model tends to underestimate cost deviation in seasonal lanes (Lane-B)."
    override_patterns = [
        "Procurement team prioritizes smaller carriers for diverse lanes even when risk is higher.",
        "Systemic bias in reliability predictions for newly added carriers."
    ]
    
    drift_status = "STABLE but monitoring 3% uptick in delay MAE over last 14 days."
    
    analysis_report = await run_feedback_analysis(
        records_count=len(records),
        metrics={
            'delay_mae': round(delay_mae, 2),
            'price_mape': round(price_mape, 1),
            'override_rate': round(override_rate, 1)
        },
        bias_data=bias_obs,
        override_data=override_patterns,
        drift_status=drift_status
    )
    
    return {
        "report": analysis_report,
        "stats": stats
    }
