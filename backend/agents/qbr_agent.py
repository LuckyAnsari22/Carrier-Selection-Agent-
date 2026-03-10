"""
QBR Agent: Quarterly Business Review Scorecard Generator
Produces professional, data-led performance reviews for carrier meetings using Gemini.
"""

import google.generativeai as genai
from typing import List, Dict, Any, Optional
import logging
from datetime import datetime
from config import settings, get_api_key

# Setup logging
logger = logging.getLogger(__name__)

QBR_SYSTEM = """
You are producing a Quarterly Business Review (QBR) scorecard for a 
carrier performance meeting. This document will be shared directly with 
the carrier's account team.

Tone: Professional, collaborative, data-led. Punitive language is forbidden.
Goal: Improvement, not blame. But consequences must be clearly stated.

SLA Reference Standards:
- OTD: ≥95% | Damage Rate: ≤0.8% | Invoice Accuracy: ≥99%
- Claims Resolution: ≤7 days | Response Time: ≤4 hours

Output format:
════════════════════════════════════
QUARTERLY CARRIER PERFORMANCE REVIEW
════════════════════════════════════
Carrier: [Name] | Lane: [Route] | Period: [Q] [Year]
Overall Status: 🟢 ON TRACK / 🟡 IMPROVEMENT NEEDED / 🔴 AT RISK

PERFORMANCE SCORECARD:
  On-Time Delivery:   [X%] vs ≥95% target   [✓ Met / ⚠ Close / ✗ Missed]
  Damage Rate:        [X%] vs ≤0.8% target   [✓ Met / ⚠ Close / ✗ Missed]
  Invoice Accuracy:   [X%] vs ≥99% target    [✓ Met / ⚠ Close / ✗ Missed]
  Claims Resolution:  [X] days vs ≤7 target  [✓ Met / ⚠ Close / ✗ Missed]

ROOT CAUSE (for any ✗ Missed SLAs):
[Specific, evidence-based, not generic]

JOINT IMPROVEMENT PLAN:
  Carrier commits to: [Specific action + deadline]
  We commit to: [What we will do to support]
  Verification: [How we will confirm improvement]

COMMERCIAL STATUS:
  Volume review: [Triggered / Not triggered]
  Rate review: [Triggered / Not triggered]
  Contract status: [Secure / Under review / Probation]

Next QBR: [Date] | Prepared by CarrierIQ v3
════════════════════════════════════
"""

async def generate_qbr_scorecard(
    carrier_name: str,
    lane: str,
    quarter: str,
    year: int,
    metrics: Dict[str, Any]
) -> str:
    """
    Generates a QBR scorecard using the QBR agent.
    """
    if not settings.GEMINI_API_KEY:
        return "Gemini API key missing."

    genai.configure(api_key=get_api_key())
    model = genai.GenerativeModel(settings.MODEL, system_instruction=QBR_SYSTEM)
    
    prompt = f"""
CARRIER: {carrier_name}
LANE: {lane}
PERIOD: {quarter} {year}

ACTUAL PERFORMANCE DATA:
- On-Time Delivery: {metrics.get('otd_pct', 0)}%
- Damage Rate: {metrics.get('damage_rate', 0)}%
- Invoice Accuracy: {metrics.get('invoice_accuracy_pct', 99.5)}%
- Claims Resolution: {metrics.get('claims_resolution_days', 5)} days
- Response Time: {metrics.get('response_time_hours', 2)} hours

Generate the QBR scorecard following the strict output format and tone guidelines.
"""
    
    try:
        response = await model.generate_content_async(prompt)
        return response.text
    except Exception as e:
        logger.error(f"Error in QBR Agent: {str(e)}")
        return f"QBR generation failed: {str(e)}"
