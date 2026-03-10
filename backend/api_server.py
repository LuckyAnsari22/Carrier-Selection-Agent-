"""
CarrierIQ v2 — FastAPI REST Backend
Production-grade API for carrier scoring, explanations, and risk detection
"""

import time
import json
import sqlite3
from datetime import datetime
from typing import Optional, List, Dict
from functools import lru_cache
import logging

from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import pandas as pd
import numpy as np

# Import scoring engine components
from carrier_data import generate_carrier_dataset
from carrier_scorer_production import CarrierScoringEngine, AHPWeightGenerator

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class WeightRequest(BaseModel):
    """Request model for carrier scoring with custom weights."""
    cost: int = Field(35, ge=0, le=100, description="Cost weight (0-100)")
    reliability: int = Field(30, ge=0, le=100, description="Reliability weight (0-100)")
    speed: int = Field(20, ge=0, le=100, description="Speed weight (0-100)")
    quality: int = Field(15, ge=0, le=100, description="Quality weight (0-100)")
    
    class Config:
        schema_extra = {
            "example": {
                "cost": 35,
                "reliability": 30,
                "speed": 20,
                "quality": 15
            }
        }


class FeedbackRequest(BaseModel):
    """Request model for recording award outcomes."""
    carrier_id: str = Field(..., description="e.g., CARRIER_001")
    actual_ontime_pct: float = Field(..., ge=0, le=100, description="Actual on-time percentage")
    actual_damage_rate: float = Field(..., ge=0, le=100, description="Actual damage rate %")
    actual_cost_deviation_pct: float = Field(..., ge=-50, le=50, description="Cost deviation %")
    lane: str = Field(..., description="Procurement lane name")
    
    class Config:
        schema_extra = {
            "example": {
                "carrier_id": "CARRIER_001",
                "actual_ontime_pct": 94.2,
                "actual_damage_rate": 0.5,
                "actual_cost_deviation_pct": 2.3,
                "lane": "Mumbai-Delhi"
            }
        }


class CarrierScore(BaseModel):
    """Scored carrier profile."""
    carrier_id: str
    carrier_name: str
    tier: str
    rank: int
    final_score: float
    topsis_score: float
    delay_risk: float
    cost_per_km: float
    ontime_pct: float
    damage_rate: float
    capacity_utilization: float
    rating: float
    years_experience: int
    
    class Config:
        response_model_exclude_none = True


class ScoreResponse(BaseModel):
    """Response from /score endpoint."""
    carriers: List[Dict]
    computation_ms: float
    weights_used: Dict[str, float]
    
    class Config:
        response_model_exclude_none = True


class HealthResponse(BaseModel):
    """Response from /health endpoint."""
    status: str
    carriers_loaded: int
    model_trained: bool
    version: str


class ExplanationResponse(BaseModel):
    """Response from /explain endpoint."""
    carrier_name: str
    score: float
    rank: int
    contributions: Dict[str, float]
    explanation: str
    warnings: List[str] = []
    
    class Config:
        response_model_exclude_none = True


class RiskSummary(BaseModel):
    """Summary of risk detection."""
    overextended: int
    high_damage: int
    delay_prone: int
    total_flagged: int


class RisksResponse(BaseModel):
    """Response from /risks endpoint."""
    risks: List[Dict]
    summary: RiskSummary
    
    class Config:
        response_model_exclude_none = True


class FeedbackResponse(BaseModel):
    """Response from /feedback endpoint."""
    received: bool
    carrier_id: str
    outcome_quality: str
    message: str


# ============================================================================
# FASTAPI APPLICATION
# ============================================================================

app = FastAPI(
    title="CarrierIQ v2 API",
    description="🚛 Explainable Carrier Scoring Engine with XGBoost + AHP + TOPSIS",
    version="2.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware for Streamlit integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for demo; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# STARTUP & SHUTDOWN EVENTS
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize scoring engine with carrier data on app startup."""
    logger.info("🚀 CarrierIQ API Starting...")
    
    try:
        # Generate 30 carriers
        logger.info("📊 Loading carrier dataset...")
        df = generate_carrier_dataset(n_carriers=30)
        logger.info(f"✅ Loaded {len(df)} carriers")
        
        # Train XGBoost risk model
        logger.info("🤖 Training XGBoost delay risk model...")
        engine = CarrierScoringEngine()
        metrics = engine.train_risk_model(df)
        logger.info(f"✅ Model trained: R²={metrics['r2']:.3f}, MAE={metrics['mae']:.2f}")
        
        # Store in app state
        app.state.engine = engine
        app.state.df = df
        app.state.feedback_log = []
        
        logger.info("✅ CarrierIQ API ready. 30 carriers loaded. Model trained.")
        
    except Exception as e:
        logger.error(f"❌ Startup failed: {str(e)}")
        raise


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("🛑 CarrierIQ API shutting down...")


# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

@lru_cache(maxsize=128)
def _get_scored_df(weights_json: str) -> pd.DataFrame:
    """
    Get scored DataFrame with caching (30 second TTL via startup/shutdown).
    
    Args:
        weights_json: JSON string of weights dict
    
    Returns:
        Scored DataFrame
    """
    weights = json.loads(weights_json)
    return app.state.engine.score_carriers(app.state.df, weights=weights)


def _compute_outcome_quality(predicted: Dict, actual: Dict) -> str:
    """
    Compute outcome quality based on predictions vs actuals.
    
    Args:
        predicted: dict with predicted_ontime_pct, predicted_damage_rate, predicted_cost_per_km
        actual: dict with actual_ontime_pct, actual_damage_rate, actual_cost_deviation_pct
    
    Returns:
        outcome quality: "EXCELLENT", "GOOD", "MIXED", or "POOR"
    """
    ontime_match = actual['actual_ontime_pct'] >= predicted['predicted_ontime_pct'] - 5
    damage_match = actual['actual_damage_rate'] <= predicted['predicted_damage_rate'] * 1.2
    cost_match = abs(actual['actual_cost_deviation_pct']) < 10
    
    matches = sum([ontime_match, damage_match, cost_match])
    
    if matches == 3 and actual['actual_cost_deviation_pct'] < 5:
        return "EXCELLENT"
    elif matches >= 2:
        return "GOOD"
    elif matches == 1:
        return "MIXED"
    else:
        return "POOR"


# ============================================================================
# REST ENDPOINTS
# ============================================================================

@app.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """
    Health check endpoint.
    
    Returns:
        dict: {status, carriers_loaded, model_trained, version}
    """
    return HealthResponse(
        status="ok",
        carriers_loaded=len(app.state.df),
        model_trained=app.state.engine.risk_model is not None,
        version="2.0"
    )


@app.post("/score", response_model=ScoreResponse)
async def score_carriers(request: Optional[WeightRequest] = None) -> ScoreResponse:
    """
    Score all carriers with given weights using XGBoost risk prediction + TOPSIS ranking.
    
    Args:
        request: Optional WeightRequest with cost, reliability, speed, quality (0-100 each)
    
    Returns:
        dict: {carriers: top 10 scored, computation_ms, weights_used}
    """
    # Use default weights if not provided
    if request is None:
        weights = AHPWeightGenerator.get_default_weights()
    else:
        weights = AHPWeightGenerator.generate_from_importance(
            cost=request.cost,
            reliability=request.reliability,
            speed=request.speed,
            quality=request.quality
        )
    
    # Score carriers and time it
    start_time = time.time()
    df_scored = app.state.engine.score_carriers(app.state.df, weights=weights)
    computation_ms = (time.time() - start_time) * 1000
    
    # Format top 10 carriers for response
    top_10 = df_scored.nsmallest(10, 'rank')
    carriers = [
        {
            "carrier_id": row["carrier_id"],
            "carrier_name": row["carrier_name"],
            "tier": row["tier"],
            "rank": int(row["rank"]),
            "final_score": float(row["final_score"]),
            "topsis_score": float(row["topsis_score"]),
            "delay_risk": float(row["delay_risk"]),
            "cost_per_km": float(row["cost_per_km"]),
            "ontime_pct": float(row["ontime_pct"]),
            "damage_rate": float(row["damage_rate"]),
            "capacity_utilization": float(row["capacity_utilization"]),
            "rating": float(row["rating"]),
            "years_experience": int(row["years_experience"])
        }
        for _, row in top_10.iterrows()
    ]
    
    logger.info(f"✅ Scored 30 carriers in {computation_ms:.1f}ms")
    
    return ScoreResponse(
        carriers=carriers,
        computation_ms=float(computation_ms),
        weights_used=weights
    )


@app.get("/explain/{carrier_id}", response_model=ExplanationResponse)
async def explain_carrier(carrier_id: str) -> ExplanationResponse:
    """
    Get SHAP-based explanation for why a carrier received its score.
    
    Args:
        carrier_id: Carrier ID (e.g., "CARRIER_001")
    
    Returns:
        dict: {carrier_name, score, rank, contributions, explanation, warnings}
    """
    # Score carriers with default weights
    df_scored = app.state.engine.score_carriers(app.state.df)
    
    # Find carrier
    carrier_matches = df_scored[df_scored['carrier_id'] == carrier_id]
    if carrier_matches.empty:
        raise HTTPException(status_code=404, detail=f"Carrier {carrier_id} not found")
    
    carrier_idx = df_scored.index.get_loc(carrier_matches.index[0])
    
    # Get explanation
    try:
        explanation_dict = app.state.engine.get_explanation(df_scored, carrier_idx)
        logger.info(f"✅ Generated explanation for {carrier_id}")
        return ExplanationResponse(**explanation_dict)
    except Exception as e:
        logger.error(f"❌ Explanation failed for {carrier_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Explanation generation failed: {str(e)}")


@app.get("/risks", response_model=RisksResponse)
async def detect_risks() -> RisksResponse:
    """
    Detect operational risks in the carrier network.
    
    Returns:
        dict: {risks: list of risk dicts, summary: {overextended, high_damage, delay_prone, total_flagged}}
    """
    # Score carriers with default weights
    df_scored = app.state.engine.score_carriers(app.state.df)
    
    # Detect risks
    risks = app.state.engine.detect_operational_risks(df_scored)
    
    # Summarize
    risk_summary = {
        "overextended": len([r for r in risks if r['risk_type'] == 'Overextension']),
        "high_damage": len([r for r in risks if r['risk_type'] == 'Quality Risk']),
        "delay_prone": len([r for r in risks if r['risk_type'] == 'Delay Risk']),
        "total_flagged": len(set(r['carrier_name'] for r in risks))
    }
    
    logger.info(f"✅ Detected {risk_summary['total_flagged']} at-risk carriers")
    
    return RisksResponse(
        risks=risks,
        summary=RiskSummary(**risk_summary)
    )


@app.post("/feedback", response_model=FeedbackResponse)
async def record_feedback(request: FeedbackRequest) -> FeedbackResponse:
    """
    Record award outcome for feedback loop and model retraining.
    
    Args:
        request: FeedbackRequest with carrier_id, actual metrics, lane
    
    Returns:
        dict: {received, carrier_id, outcome_quality, message}
    """
    # Score for predicted values
    df_scored = app.state.engine.score_carriers(app.state.df)
    
    # Get predicted values
    carrier_matches = df_scored[df_scored['carrier_id'] == request.carrier_id]
    if carrier_matches.empty:
        raise HTTPException(status_code=404, detail=f"Carrier {request.carrier_id} not found")
    
    carrier = carrier_matches.iloc[0]
    
    predicted = {
        'predicted_ontime_pct': carrier['ontime_pct'],
        'predicted_damage_rate': carrier['damage_rate'],
        'predicted_cost_per_km': carrier['cost_per_km']
    }
    
    actual = {
        'actual_ontime_pct': request.actual_ontime_pct,
        'actual_damage_rate': request.actual_damage_rate,
        'actual_cost_deviation_pct': request.actual_cost_deviation_pct
    }
    
    # Determine outcome quality
    outcome_quality = _compute_outcome_quality(predicted, actual)
    
    # Store in feedback log
    feedback_entry = {
        'timestamp': datetime.now().isoformat(),
        'carrier_id': request.carrier_id,
        'carrier_name': carrier['carrier_name'],
        'lane': request.lane,
        'predicted': predicted,
        'actual': actual,
        'outcome_quality': outcome_quality
    }
    app.state.feedback_log.append(feedback_entry)
    
    message = f"Recorded outcome: {outcome_quality}. "
    if outcome_quality == "POOR":
        message += "Consider evaluating this carrier's network status."
    elif outcome_quality == "EXCELLENT":
        message += "Strong performance. Consider increasing volume."
    
    logger.info(f"✅ Feedback recorded for {request.carrier_id}: {outcome_quality}")
    
    return FeedbackResponse(
        received=True,
        carrier_id=request.carrier_id,
        outcome_quality=outcome_quality,
        message=message
    )


@app.get("/compare", response_model=Dict)
async def compare_carriers(
    ids: str = Query(..., description="Comma-separated carrier IDs (max 5)")
) -> Dict:
    """
    Compare up to 5 carriers side-by-side with full metrics.
    
    Args:
        ids: Comma-separated carrier IDs (e.g., "CARRIER_001,CARRIER_002")
    
    Returns:
        dict: {carriers: list of full carrier profiles with scores}
    """
    # Parse IDs
    carrier_ids = [id.strip() for id in ids.split(',')]
    if len(carrier_ids) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 carriers allowed for comparison")
    
    # Score carriers
    df_scored = app.state.engine.score_carriers(app.state.df)
    
    # Get requested carriers
    carriers_list = []
    for cid in carrier_ids:
        match = df_scored[df_scored['carrier_id'] == cid]
        if match.empty:
            logger.warning(f"⚠️  Carrier {cid} not found in comparison")
            continue
        
        carrier = match.iloc[0]
        carriers_list.append({
            "carrier_id": carrier['carrier_id'],
            "carrier_name": carrier['carrier_name'],
            "tier": carrier['tier'],
            "rank": int(carrier['rank']),
            "final_score": float(carrier['final_score']),
            "topsis_score": float(carrier['topsis_score']),
            "delay_risk": float(carrier['delay_risk']),
            "cost_per_km": float(carrier['cost_per_km']),
            "ontime_pct": float(carrier['ontime_pct']),
            "damage_rate": float(carrier['damage_rate']),
            "capacity_utilization": float(carrier['capacity_utilization']),
            "rating": float(carrier['rating']),
            "years_experience": int(carrier['years_experience']),
            "routes_covered": int(carrier['routes_covered']),
            "transit_consistency": float(carrier['transit_consistency']),
            "avg_delay_hours": float(carrier['avg_delay_hours']),
            "claims_last_month": int(carrier['claims_last_month'])
        })
    
    logger.info(f"✅ Compared {len(carriers_list)} carriers")
    
    return {"carriers": carriers_list}


@app.get("/stats", response_model=Dict)
async def get_stats() -> Dict:
    """
    Get system statistics and feedback log summary.
    
    Returns:
        dict: {total_carriers, total_feedback, feedback_outcomes, ...}
    """
    feedback_log = app.state.feedback_log
    
    stats = {
        "total_carriers": len(app.state.df),
        "total_feedback_entries": len(feedback_log),
        "feedback_outcomes": {
            "EXCELLENT": len([f for f in feedback_log if f['outcome_quality'] == 'EXCELLENT']),
            "GOOD": len([f for f in feedback_log if f['outcome_quality'] == 'GOOD']),
            "MIXED": len([f for f in feedback_log if f['outcome_quality'] == 'MIXED']),
            "POOR": len([f for f in feedback_log if f['outcome_quality'] == 'POOR']),
        },
        "model_status": "trained" if app.state.engine.risk_model is not None else "not_trained",
        "api_version": "2.0"
    }
    
    return stats


# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Custom HTTP exception handler."""
    logger.error(f"❌ HTTP Error: {exc.status_code} - {exc.detail}")
    return {
        "error": True,
        "status_code": exc.status_code,
        "message": exc.detail
    }


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Catch-all exception handler."""
    logger.error(f"❌ Unexpected error: {str(exc)}")
    return {
        "error": True,
        "status_code": 500,
        "message": "Internal server error"
    }


# ============================================================================
# ROOT ENDPOINT
# ============================================================================

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "api": "CarrierIQ v2",
        "description": "Explainable Carrier Scoring Engine with XGBoost + AHP + TOPSIS",
        "docs": "/docs",
        "redoc": "/redoc",
        "endpoints": [
            "GET /health - System health check",
            "POST /score - Score all carriers with custom weights",
            "GET /explain/{carrier_id} - Get SHAP explanation for carrier",
            "GET /risks - Detect operational risks",
            "POST /feedback - Record award outcome",
            "GET /compare?ids=CARRIER_001,CARRIER_002 - Compare carriers",
            "GET /stats - System statistics"
        ]
    }


if __name__ == "__main__":
    import uvicorn
    
    print("\n" + "="*80)
    print("🚀 Starting CarrierIQ v2 FastAPI Server...")
    print("="*80)
    print("\n✅ API Documentation: http://localhost:8000/docs")
    print("✅ Alternative Docs:  http://localhost:8000/redoc")
    print("✅ Health Check:      http://localhost:8000/health\n")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
