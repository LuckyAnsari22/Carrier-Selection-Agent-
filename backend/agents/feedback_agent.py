"""
Feedback Agent: MLOps Specialist for CarrierIQ
Analyzes feedback loops, human overrides, and model drift to suggest improvements using Gemini.
"""

import google.generativeai as genai
from typing import List, Dict, Any, Optional
import logging
import json
from datetime import datetime
from config import settings, get_api_key

# Setup logging
logger = logging.getLogger(__name__)

FEEDBACK_AGENT_SYSTEM = """
You are an MLOps specialist analyzing the CarrierIQ feedback loop.
You identify patterns in AI prediction errors and human overrides,
then recommend targeted model improvements.

Your analysis looks for:
SYSTEMATIC BIAS: Is the model consistently wrong in specific conditions?
OVERRIDE PATTERNS: Why are humans overriding the AI? What does that reveal?
DRIFT SIGNALS: Is model performance degrading over time?

You write for an ML engineer who will act on your findings immediately.
Be specific, quantitative, and prioritized.

Output format:
FEEDBACK LOOP ANALYSIS
Period: [Date range] | Records analyzed: [N]

MODEL PERFORMANCE:
  Delay Risk MAE: [X] points (threshold: 10)
  Price Forecast MAPE: [X%] (threshold: 15%)
  Human Override Rate: [X%] (threshold: 20%)
  
SYSTEMATIC BIASES DETECTED:
[Specific bias with quantification, or "None detected"]

TOP OVERRIDE PATTERNS:
1. [Pattern with frequency and implication]
2. [Pattern]

DRIFT DETECTION:
[Status: Stable / Drift Detected + evidence]

RETRAINING RECOMMENDATION: [YES — URGENT / YES — SCHEDULED / NO]
Reason: [One sentence]

PRIORITY ACTIONS:
1. [Specific action for ML engineer]
2. [Action]
3. [Action]
"""

async def run_feedback_analysis(
    records_count: int,
    metrics: Dict[str, Any],
    bias_data: str,
    override_data: List[str],
    drift_status: str
) -> str:
    """
    Runs the feedback loop analysis using the MLOps specialist agent.
    """
    if not settings.GEMINI_API_KEY:
        return "Gemini API key missing."

    genai.configure(api_key=get_api_key())
    model = genai.GenerativeModel(settings.MODEL, system_instruction=FEEDBACK_AGENT_SYSTEM)
    
    period = f"{datetime.now().strftime('%Y-%m-%d')} (Last 30 days)"
    
    prompt = f"""
PERIOD: {period}
RECORDS: {records_count}

METRICS:
- Delay Risk MAE: {metrics.get('delay_mae', 'N/A')}
- Price Forecast MAPE: {metrics.get('price_mape', 'N/A')}%
- Human Override Rate: {metrics.get('override_rate', 'N/A')}%

BIAS OBSERVATIONS:
{bias_data}

OVERRIDE PATTERNS:
{json.dumps(override_data, indent=2)}

DRIFT STATUS:
{drift_status}

Analyze this data and generate the MLOps Feedback Loop Analysis report.
"""
    
    try:
        response = await model.generate_content_async(prompt)
        return response.text
    except Exception as e:
        logger.error(f"Error in Feedback Agent: {str(e)}")
        return f"Analysis failed: {str(e)}"
