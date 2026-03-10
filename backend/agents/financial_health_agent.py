"""
Financial Health Agent: Carrier Credit & Distress Analyst
Predicts carrier financial distress using hard and soft signals using Gemini.
"""

import google.generativeai as genai
from typing import List, Dict, Any, Optional
import logging
from datetime import datetime
from config import settings, get_api_key

# Setup logging
logger = logging.getLogger(__name__)

FINANCIAL_HEALTH_SYSTEM = """
You are a freight industry credit analyst who predicts carrier financial 
distress 60-90 days before it impacts service.

You analyze public signals across hard and soft categories:

HARD SIGNALS (high reliability):
- Credit rating changes
- DOT/FMCSA safety rating changes  
- Equipment financing defaults (news-based)
- CSA score deterioration patterns

SOFT SIGNALS (medium reliability):
- Unusual driver/staff turnover visible on LinkedIn
- Glassdoor review pattern shifts (payroll complaints)
- Carrier reducing job postings (cash conservation)
- Peer carrier bankruptcies in same asset class
- News: acquisition rumors, restructuring

Health Score:
80-100: STABLE    — Normal monitoring
60-79:  WATCH     — Increase check-in frequency
40-59:  ALERT     — Begin backup carrier qualification immediately
0-39:   CRITICAL  — Reduce volume allocation now

Output format:
CARRIER FINANCIAL HEALTH ASSESSMENT
Carrier: [Name] | Date: [Today]

HEALTH SCORE: [0-100] | STATUS: [STABLE/WATCH/ALERT/CRITICAL]

HARD SIGNALS: [List or "None identified in available data"]
SOFT SIGNALS: [List or "None identified in available data"]

TREND (vs. 90 days ago): [IMPROVING / STABLE / DETERIORATING]
TREND EVIDENCE: [One sentence]

RECOMMENDED ACTION: [Specific procurement action]
URGENCY: [Within 24hrs / This Week / Next Review Cycle]

DATA CONFIDENCE: [High/Medium/Low — based on signal availability]
"""

async def run_financial_health_assessment(
    carrier_name: str,
    hard_signals: List[str],
    soft_signals: List[str],
    historical_status: str = "STABLE"
) -> str:
    """
    Runs the financial health assessment using the credit analyst agent.
    """
    if not settings.GEMINI_API_KEY:
        return "Gemini API key missing."

    genai.configure(api_key=get_api_key())
    model = genai.GenerativeModel(settings.MODEL, system_instruction=FINANCIAL_HEALTH_SYSTEM)
    
    today = datetime.now().strftime('%Y-%m-%d')
    
    prompt = f"""
CARRIER: {carrier_name}
DATE: {today}

DATA PROVIDED:
HARD SIGNALS:
{chr(10).join(['- ' + s for s in hard_signals]) if hard_signals else "None provided"}

SOFT SIGNALS:
{chr(10).join(['- ' + s for s in soft_signals]) if soft_signals else "None provided"}

HISTORICAL STATUS (90 DAYS AGO): {historical_status}

Analyze the provided signals and generate the Carrier Financial Health Assessment.
"""
    
    try:
        response = await model.generate_content_async(prompt)
        return response.text
    except Exception as e:
        logger.error(f"Error in Financial Health Agent: {str(e)}")
        return f"Assessment failed: {str(e)}"
