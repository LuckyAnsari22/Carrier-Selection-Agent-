"""
Award Strategy Agent: Freight Procurement Strategy Consultant
Designs carrier portfolio structures using Portfolio Theory, Real Options, and Performance Incentives using Gemini.
"""

import google.generativeai as genai
from typing import List, Dict, Any, Optional
import logging
from datetime import datetime
from config import settings, get_api_key

# Setup logging
logger = logging.getLogger(__name__)

AWARD_STRATEGY_SYSTEM = """
You are a freight procurement strategy consultant who designs carrier 
portfolio structures for complex freight networks.

You apply three frameworks:
1. PORTFOLIO THEORY — diversify carrier risk like financial assets
2. REAL OPTIONS — build optionality for capacity surge events  
3. PERFORMANCE INCENTIVES — structure volume commitments to maximize carrier motivation

You think in 12-month contract periods. Your recommendations must survive 
board scrutiny and supply chain audits.

Output format:
CARRIER AWARD STRATEGY
Lane: [Route] | Contract Term: [N months]

PORTFOLIO ALLOCATION:
  Primary (60-80%):  [Carrier] — Rationale: [One sentence]
  Secondary (20-40%): [Carrier] — Rationale: [One sentence]
  Spot Reserve: [%] — Trigger: [Specific condition]

PERFORMANCE GATES (triggers immediate reallocation):
  Gate 1: [Metric] drops below [threshold] for [N weeks]
  Gate 2: [Metric] exceeds [threshold]
  Recovery path: [How carrier can recover allocation]

RATE STRUCTURE: [Fixed / Variable / Hybrid]
Rationale: [One sentence on why this structure fits this lane]

CONTRACT OPTIONALITY:
  Volume flex clause: [+/- X% without penalty]
  Exit clause: [Conditions for early termination]
  Benchmark review: [When to re-RFQ vs renew]

EXPECTED OUTCOMES:
  Annual cost: $[X] | vs spot market: [X%] savings
  Expected OTD: [X%] | Risk level: [LOW/MEDIUM/HIGH]
"""

async def run_award_strategy_design(
    lane: str,
    primary_carrier: Dict[str, Any],
    secondary_carrier: Dict[str, Any],
    contract_term_months: int = 12,
    total_volume_annual: float = 1200000
) -> str:
    """
    Runs the award strategy design using the procurement consultant agent.
    """
    if not settings.GEMINI_API_KEY:
        return "Gemini API key missing."

    genai.configure(api_key=get_api_key())
    model = genai.GenerativeModel(settings.MODEL, system_instruction=AWARD_STRATEGY_SYSTEM)
    
    prompt = f"""
LANE: {lane}
TERM: {contract_term_months} months
TOTAL ANNUAL VOLUME: {total_volume_annual:,.0f} kg

PRIMARY CARRIER DATA:
- Name: {primary_carrier['carrier_name']}
- OTD %: {primary_carrier['ontime_pct']}%
- Cost/km: ${primary_carrier['cost_per_km']:.2f}
- Delay Risk Score: {primary_carrier['delay_risk']:.1f}
- Capacity Utilization: {primary_carrier['capacity_utilization']:.1f}

SECONDARY CARRIER DATA:
- Name: {secondary_carrier['carrier_name']}
- OTD %: {secondary_carrier['ontime_pct']}%
- Cost/km: ${secondary_carrier['cost_per_km']:.2f}
- Delay Risk Score: {secondary_carrier['delay_risk']:.1f}
- Capacity Utilization: {secondary_carrier['capacity_utilization']:.1f}

Design a robust 12-month award strategy based on the three core frameworks.
"""
    
    try:
        response = await model.generate_content_async(prompt)
        return response.text
    except Exception as e:
        logger.error(f"Error in Award Strategy Agent: {str(e)}")
        return f"Strategy design failed: {str(e)}"
