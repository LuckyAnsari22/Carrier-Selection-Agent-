"""
Reliability Agent: Priya Sharma - Supply Chain Risk Director
Focused on variance, consistency, and tail risk mitigation using Gemini.
"""

import google.generativeai as genai
from typing import List, Dict, Any
import logging
from config import settings, get_api_key

# Setup logging
logger = logging.getLogger(__name__)

RELIABILITY_AGENT_SYSTEM = """
You are Priya Sharma, a Supply Chain Risk Director who has managed carrier 
performance programs for companies shipping $500M+ in freight annually.
You have seen what happens when a carrier fails: stockouts, customer churn,
emergency air freight at 10x cost, brand damage that takes years to recover.

You believe: "The cheapest carrier is the one that never fails you."

Your obsession is variance, not average. A carrier with 97% OTD but 
20% standard deviation is more dangerous than one with 94% OTD and 2% variance.
Consistency is the true measure of reliability.

Red flags you watch for:
- Capacity utilization >85%: carrier will roll your shipment during peak
- Damage rate >1.5%: systemic quality control failure
- Claim resolution >10 days: they don't prioritize customer recovery
- OTD std dev >8%: seasonal or route-specific reliability collapse

In this committee, you are the SERVICE RELIABILITY champion.

Output format — STRICTLY follow this structure:
RECOMMENDATION: [Carrier Name] at [X%] allocation
RELIABILITY SCORECARD:
  OTD: [X%] (σ = [X%]) — [PASS/CONCERN/FAIL]
  Damage Rate: [X%] — [PASS/CONCERN/FAIL]  
  Capacity Buffer: [X%] remaining — [SAFE/TIGHT/OVEREXTENDED]
  Claims Speed: [X] days avg — [PASS/CONCERN/FAIL]
RELIABILITY CASE (3 evidence points):
  1. [Data-driven argument]
  2. [Data-driven argument]
  3. [Data-driven argument]
TAIL RISK SCENARIO: [Worst case and your mitigation]
RISKS I AM ACCEPTING: [Cost premium and other tradeoffs]
CONFIDENCE: [High/Medium/Low] — [One sentence reason]
"""

async def run_reliability_agent(
    carriers: List[Dict[str, Any]], 
    context: Dict[str, Any]
) -> str:
    """
    Reliability Agent: Priya Sharma analyzes variance, capacity, and tail risk.
    """
    if not settings.GEMINI_API_KEY:
        return "Gemini API key missing."

    genai.configure(api_key=get_api_key())
    model = genai.GenerativeModel(settings.MODEL, system_instruction=RELIABILITY_AGENT_SYSTEM)
    
    carrier_summary = "\n".join([
        f"- {c.get('name', c.get('carrier_name'))} (ID: {c.get('id', c.get('carrier_id'))}): "
        f"{c.get('otd_rate', c.get('ontime_pct', 0))*100:.0f}% OTD, "
        f"{c.get('damage_rate', 0)*100:.2f}% damage, "
        f"{c.get('claim_resolution_days', 5)}d claims, "
        f"{c.get('years_in_operation', 5)}yr, "
        f"~{c.get('capacity_utilization', 0.65)*100:.0f}% capacity utilization"
        for c in carriers
    ])
    
    prompt = f"""
Lane: {context.get('lane', 'Unknown')}
Shipment Criticality: {context.get('criticality', 'Standard')}

CARRIERS UNDER CONSIDERATION:
{carrier_summary}

Analyze from a VARIANCE AND RISK MITIGATION perspective.
Argue for the MOST RELIABLE CARRIER.
"""
    
    try:
        response = await model.generate_content_async(prompt)
        return response.text
    except Exception as e:
        logger.error(f"Error in Reliability Agent: {str(e)}")
        return f"Reliability analysis failed: {str(e)}"

async def reliability_agent_stream(
    carriers: List[Dict[str, Any]], 
    context: Dict[str, Any]
):
    """
    Stream version of Reliability Agent for real-time output.
    """
    if not settings.GEMINI_API_KEY:
        yield "API key missing."
        return

    genai.configure(api_key=get_api_key())
    model = genai.GenerativeModel(settings.MODEL, system_instruction=RELIABILITY_AGENT_SYSTEM)
    
    prompt = f"LANE: {context.get('lane')}\nCARRIERS: {str(carriers)}\nAnalyze reliability."
    
    try:
        response = await model.generate_content_async(prompt, stream=True)
        async for chunk in response:
            if chunk.text:
                yield chunk.text
    except Exception as e:
        yield f"Streaming failed: {e}"
