"""
What-If Agent: Interactive Procurement Scenario Modeler
Analyzes ranking shifts and impacts when procurement priorities change using Gemini.
"""

import google.generativeai as genai
from typing import List, Dict, Any
import logging
from config import settings, get_api_key

# Setup logging
logger = logging.getLogger(__name__)

WHATIF_AGENT_SYSTEM = """
You are an interactive procurement scenario modeler — like a Bloomberg 
terminal for carrier decisions.

When procurement priorities change (via scenario activation or manual sliders),
you must:
1. Identify which carriers gain or lose rank under the new weights
2. Explain why in 1 precise sentence
3. Quantify the financial and service impact of the scenario
4. Recommend whether to apply it permanently

Scenarios and their weight profiles:
MONSOON PROTOCOL:    cost=0.20, reliability=0.60, speed=0.10, quality=0.10
COST EMERGENCY:      cost=0.65, reliability=0.20, speed=0.10, quality=0.05
ZERO TOLERANCE:      Eliminate carriers with damage_rate > 1.0% from consideration
CAPACITY CRISIS:     Deprioritize carriers with capacity_util > 0.80
BALANCED:            cost=0.40, reliability=0.35, speed=0.15, quality=0.10

Output format — STRICTLY:
SCENARIO ACTIVATED: [Name]
WEIGHT PROFILE: Cost [X%] | Reliability [Y%] | Speed [Z%] | Quality [W%]

RANKING CHANGES:
  #1: [Carrier] (was #[N]) [↑ rose / — unchanged / ↓ fell] [N] positions
  #2: [Carrier] (was #[N]) [...]
  #3: [Carrier] (was #[N]) [...]

KEY SHIFT: [Most significant change in 1 sentence with reason]

FINANCIAL IMPACT: [+/- $X/month vs baseline]
SERVICE IMPACT:   [+/- X% expected OTD vs baseline]

APPLY PERMANENTLY? [Yes/No] — [One sentence rationale]
"""

async def run_whatif_analysis(
    scenario_name: str,
    weights: Dict[str, float],
    baseline_top_5: List[Dict[str, Any]],
    scenario_top_5: List[Dict[str, Any]],
    financial_delta: float,
    service_delta: float
) -> str:
    """
    Runs the What-If analysis using LLM to generate the report.
    """
    if not settings.GEMINI_API_KEY:
        return "Gemini API key missing."

    genai.configure(api_key=get_api_key())
    model = genai.GenerativeModel(settings.MODEL, system_instruction=WHATIF_AGENT_SYSTEM)
    
    # Format ranking changes string
    ranking_summary = ""
    for i, carrier in enumerate(scenario_top_5):
        orig_rank = carrier.get('original_rank', 'N/A')
        current_rank = i + 1
        
        if orig_rank == 'N/A':
            trend = "newly ranked"
            change = ""
        elif orig_rank > current_rank:
            trend = "↑ rose"
            change = f"{orig_rank - current_rank}"
        elif orig_rank < current_rank:
            trend = "↓ fell"
            change = f"{current_rank - orig_rank}"
        else:
            trend = "— unchanged"
            change = "0"
            
        ranking_summary += f"  #{current_rank}: {carrier['carrier_name']} (was #{orig_rank}) [{trend}] {change} positions\n"

    prompt = f"""
SCENARIO: {scenario_name}
WEIGHTS: {weights}

RANKING DATA:
{ranking_summary}

IMPACT DATA:
- Financial Delta: ${financial_delta:,.2f}/month
- Service Delta: {service_delta:+.1f}% OTD

Generate the What-If analysis report following the strict output format.
"""
    
    try:
        response = await model.generate_content_async(prompt)
        return response.text
    except Exception as e:
        logger.error(f"Error in What-If Agent: {str(e)}")
        return f"Analysis failed: {str(e)}"
