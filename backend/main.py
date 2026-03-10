from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from api.routes import score, explain, research, feedback, stream, carriers, normalize, whatif, summary, financial_health, award_strategy, qbr, risks, compare, stats
import logging
from carrier_data import generate_carrier_dataset
from carrier_scorer_production import CarrierScoringEngine
from feedback_loop import FeedbackEngine
from config import settings
try:
    from langfuse import Langfuse
    HAS_LANGFUSE = True
except ImportError:
    HAS_LANGFUSE = False

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="CarrierIQ v3 API",
    description="AI-Powered Procurement Co-Pilot — Gemini Multi-Agent Backend",
    version="3.0.0"
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

@app.on_event("startup")
async def startup_event():
    """Initialize engines and data on startup."""
    logger.info("🚀 CarrierIQ v3 API Starting...")
    
    # Initialize Langfuse
    if HAS_LANGFUSE and settings.LANGFUSE_PUBLIC_KEY and settings.LANGFUSE_SECRET_KEY:
        try:
            langfuse = Langfuse(
                public_key=settings.LANGFUSE_PUBLIC_KEY,
                secret_key=settings.LANGFUSE_SECRET_KEY,
                host=settings.LANGFUSE_BASE_URL
            )
            app.state.langfuse = langfuse
            logger.info("🔗 Langfuse Observability Enabled.")
        except Exception as e:
            logger.error(f"Langfuse init failed: {e}")
    
    # Generate dataset
    df = generate_carrier_dataset(n_carriers=30)
    
    # Initialize engines
    engine = CarrierScoringEngine()
    engine.train_risk_model(df)
    
    # Initial scoring to populate risk metrics
    df_scored = engine.score_carriers(df)
    
    feedback_engine = FeedbackEngine(db_path='data/outcomes.db')
    
    # Store in state
    app.state.engine = engine
    app.state.df = df_scored
    app.state.feedback_engine = feedback_engine
    
    logger.info("✅ CarrierIQ v3 Systems Ready (30 nodes indexed).")

# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy", 
        "version": "3.0.0",
        "carriers_loaded": len(app.state.df) if hasattr(app.state, 'df') else 0,
        "model_trained": (app.state.engine.risk_model is not None) if hasattr(app.state, 'engine') else False
    }

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "CarrierIQ v3 API (Gemini Powered)",
        "docs": "/docs",
        "version": "3.0.0"
    }

# Include routers
app.include_router(carriers.router, prefix="/api/carriers", tags=["carriers"])
app.include_router(score.router, prefix="/api/score", tags=["score"])
app.include_router(explain.router, prefix="/api/explain", tags=["explain"])
app.include_router(research.router, prefix="/api/research", tags=["research"])
app.include_router(feedback.router, prefix="/api/feedback", tags=["feedback"])
app.include_router(stream.router, prefix="/api/stream", tags=["stream"])
app.include_router(normalize.router, prefix="/api/normalize", tags=["normalize"])
app.include_router(whatif.router, prefix="/api/whatif", tags=["whatif"])
app.include_router(summary.router, prefix="/api/summary", tags=["summary"])
app.include_router(financial_health.router, prefix="/api/financial_health", tags=["financial_health"])
app.include_router(award_strategy.router, prefix="/api/award_strategy", tags=["award_strategy"])
app.include_router(qbr.router, prefix="/api/qbr", tags=["qbr"])
app.include_router(risks.router, prefix="/api/risks", tags=["risks"])
app.include_router(compare.router, prefix="/api/compare", tags=["compare"])
app.include_router(stats.router, prefix="/api/stats", tags=["stats"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
