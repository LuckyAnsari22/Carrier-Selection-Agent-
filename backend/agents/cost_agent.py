"""
Cost Agent: Marcus Chen - Freight Procurement Cost Analyst
Focused on total cost of ownership and hidden cost structures using Gemini.
"""

import google.generativeai as genai
from typing import List, Dict, Any
import logging
from config import settings, get_api_key

# Setup logging
logger = logging.getLogger(__name__)

COST_AGENT_SYSTEM = """
You are Marcus Chen, a freight procurement analyst who has saved companies 
$47M over 12 years by finding hidden cost inefficiencies in carrier contracts.
You are relentlessly focused on total cost of ownership — not just base rates.

You see hidden costs everywhere:
- Fuel surcharge structures that balloon during peak seasons
- Invoice accuracy gaps that cause 30-60 day payment delays
- Liability limits that transfer cost of damage back to the shipper
- Accessorial charges buried in footnotes of carrier bids

In this multi-agent procurement committee, you are the COST champion.
Your job is to argue the strongest possible case for cost efficiency.

You must:
1. Calculate total annual cost per carrier (not just per-shipment rate)
2. Flag any cost structures that appear favorable but hide risk
3. Quantify the financial impact of your recommendation in dollars
4. Acknowledge what service quality you are sacrificing for cost savings
5. Be direct: your goal is to make the CFO happy, not comfortable

Output format — STRICTLY follow this structure:
RECOMMENDATION: [Carrier Name] at [X%] allocation
ANNUAL COST ANALYSIS:
  Base freight: $[X]/year
  Fuel surcharges (est.): $[X]/year  
  Accessorial exposure: $[X]/year
  Total: $[X]/year vs market avg $[X]/year
COST CASE (3 evidence points with data):
  1. [Data-driven argument with numbers]
  2. [Data-driven argument with numbers]  
  3. [Data-driven argument with numbers]
RISKS I AM ACCEPTING: [Honest list of what you are trading]
CONFIDENCE: [High/Medium/Low] — [One sentence reason]
"""

async def run_cost_agent(
    carriers: List[Dict[str, Any]], 
    context: Dict[str, Any]
) -> str:
    """
    Cost Agent: Marcus Chen analyzes total cost of ownership.
    """
    if not settings.GEMINI_API_KEY:
        return "Gemini API key missing."

    genai.configure(api_key=get_api_key())
    model = genai.GenerativeModel(settings.MODEL, system_instruction=COST_AGENT_SYSTEM)
    
    carrier_summary = "\n".join([
        f"- {c.get('name', c.get('carrier_name'))} (ID: {c.get('id', c.get('carrier_id'))}): "
        f"${c.get('price_per_kg', 0):.2f}/kg, "
        f"OTD: {(c.get('otd_rate', c.get('ontime_pct', 0))*100):.0f}%, "
        f"Invoice Accuracy: {c.get('invoice_accuracy', 0.9)*100:.0f}%"
        for c in carriers
    ])
    
    prompt = f"""
Lane: {context.get('lane', 'Unknown')}
Estimated Annual Volume: {context.get('est_volume_kg', '1000000')} kg

CARRIERS UNDER CONSIDERATION:
{carrier_summary}

Analyze these carriers from a COST PERSPECTIVE ONLY. 
Calculate total cost of ownership and argue for the LOWEST COST.
"""
    
    try:
        response = await model.generate_content_async(prompt)
        return response.text
    except Exception as e:
        logger.error(f"Error in Cost Agent: {str(e)}")
        return f"Cost analysis failed: {str(e)}"

async def cost_agent_stream(
    carriers: List[Dict[str, Any]], 
    context: Dict[str, Any]
):
    """
    Stream version of Cost Agent for real-time output.
    """
    if not settings.GEMINI_API_KEY:
        yield "API key missing."
        return

    genai.configure(api_key=get_api_key())
    model = genai.GenerativeModel(settings.MODEL, system_instruction=COST_AGENT_SYSTEM)
    
    prompt = f"LANE: {context.get('lane')}\nCARRIERS: {str(carriers)}\nAnalyze cost."
    
    try:
        response = await model.generate_content_async(prompt, stream=True)
        async for chunk in response:
            if chunk.text:
                yield chunk.text
    except Exception as e:
        yield f"Streaming failed: {e}"
