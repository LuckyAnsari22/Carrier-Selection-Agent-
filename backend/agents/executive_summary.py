"""
Executive Summary Agent: CPO Management Briefing
Generates high-impact management briefings for C-suite executives using Gemini.
"""

import google.generativeai as genai
from typing import List, Dict, Any, Optional
import logging
from config import settings, get_api_key

# Setup logging
logger = logging.getLogger(__name__)

EXECUTIVE_SUMMARY_SYSTEM = """
You are writing a management briefing for a CPO who has 90 seconds.

Rules of the Pyramid Principle:
- Lead with the DECISION, not the analysis
- Every claim has a number
- Maximum 220 words
- Zero jargon
- Active voice throughout

The CPO will share this with the CFO and legal.
It must be defensible, clear, and decisive.

Output format — EXACTLY this structure:
════════════════════════════════════
CARRIER SELECTION RECOMMENDATION
════════════════════════════════════
Lane: [Route] | Urgency: [Standard / Priority / Critical]

DECISION:
Award [Primary Carrier] [X%] + [Secondary Carrier] [Y%]

FINANCIAL IMPACT:
  Estimated Annual Cost: $[X]
  vs. Current Spend: [+/- $X] ([X%] [savings/increase])

EXPECTED PERFORMANCE:
  On-Time Delivery: [X%]   Risk Level: [LOW / MEDIUM / HIGH]
  Confidence Score: [X/100]

WHY THIS DECISION:
[2 sentences — plain language, no jargon, specific to this lane and these carriers]

MONITOR CLOSELY:
[1 sentence — single biggest risk to watch with specific threshold]

Review Date: [N weeks] | Full Analysis: CarrierIQ v3 Dashboard
════════════════════════════════════
"""

async def generate_executive_summary(
    lane: str,
    urgency: str,
    primary_carrier: str,
    secondary_carrier: str,
    primary_allocation: int,
    secondary_allocation: int,
    annual_cost: float,
    current_spend: float,
    expected_otd: float,
    risk_level: str,
    confidence_score: int,
    decision_reason: str,
    risk_to_monitor: str,
    review_weeks: int
) -> str:
    """
    Generates an executive summary using the CPO briefing system.
    """
    if not settings.GEMINI_API_KEY:
        return "Gemini API key missing."

    genai.configure(api_key=get_api_key())
    model = genai.GenerativeModel(settings.MODEL, system_instruction=EXECUTIVE_SUMMARY_SYSTEM)
    
    prompt = f"""
Generate a management briefing for:
LANE: {lane}
URGENCY: {urgency}
PRIMARY: {primary_carrier} ({primary_allocation}%)
SECONDARY: {secondary_carrier} ({secondary_allocation}%)
ANNUAL COST: ${annual_cost:,.2f}
CURRENT SPEND: ${current_spend:,.2f}
EXPECTED OTD: {expected_otd}%
RISK LEVEL: {risk_level}
CONFIDENCE: {confidence_score}/100
DECISION REASON: {decision_reason}
RISK TO MONITOR: {risk_to_monitor}
REVIEW PERIOD: {review_weeks} weeks

Follow the strict structure and rules of the Pyramid Principle.
"""
    
    try:
        response = await model.generate_content_async(prompt)
        return response.text
    except Exception as e:
        logger.error(f"Error in Executive Summary Agent: {str(e)}")
        return f"Briefing generation failed: {str(e)}"
