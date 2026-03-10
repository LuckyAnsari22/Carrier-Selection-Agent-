"""
SHAP Explainer Agent: Plain-Language Explainability for Procurement
Translates machine learning feature importance into business prose using Gemini.
"""

import google.generativeai as genai
from typing import List, Dict, Any
import logging
import json
from config import settings, get_api_key

# Setup logging
logger = logging.getLogger(__name__)

SHAP_AGENT_SYSTEM = """
You are a plain-language AI explainability specialist. Your job is to 
translate SHAP machine learning values into business prose that a 
logistics VP can read in 30 seconds and completely understand.

You have been given:
- A carrier's SHAP feature contributions (positive = increases risk, negative = reduces risk)
- The carrier's actual performance metrics
- The carrier's rank in the final selection

Translation rules (strictly follow these):
1. NEVER say "SHAP value", "feature importance", "model weight", "coefficient"
2. ALWAYS use business language: "track record", "capacity headroom", "billing reliability"
3. Strengths = features with large NEGATIVE SHAP values (they REDUCE delay risk)  
4. Weaknesses = features with large POSITIVE SHAP values (they INCREASE delay risk)
5. Quantify impact: instead of "high SHAP value", say "increases expected delay risk by ~12 points"
6. End with a single actionable sentence for the procurement manager

Output format:
WHY [CARRIER NAME] IS RANKED #[RANK]:

STRENGTHS DRIVING THIS RANKING:
[2-3 sentences about what makes this carrier score well — in business terms]

RISKS TO MONITOR:
[1-2 sentences about the top weaknesses — with business impact described]

IF YOU AWARD THIS CARRIER:
[One concrete, specific action the procurement team should take based on the explanation]
"""

async def run_shap_explainer(
    winner_carrier: Dict[str, Any],
    all_carriers: List[Dict[str, Any]],
    shap_values: Dict[str, float],
    rank: int = 1
) -> str:
    """
    SHAP Explainer: Translates model decisions into business language.
    """
    if not settings.GEMINI_API_KEY:
        return "Gemini API key missing."

    genai.configure(api_key=get_api_key())
    model = genai.GenerativeModel(settings.MODEL, system_instruction=SHAP_AGENT_SYSTEM)
    
    competitor_list = ", ".join([
        f"{c.get('name', 'Competitor')} ({(c.get('otd_rate', 0)*100):.0f}% on-time)"
        for c in all_carriers if c.get('id') != winner_carrier.get('id')
    ])
    
    prompt = f"""
EXPLAIN WHY THIS CARRIER WAS RANKED #{rank}:

WINNER: {winner_carrier['name']}
SHAP DATA: {json.dumps(shap_values)}
COMPETITORS: {competitor_list}

Translate these technical signals into a business briefing.
"""
    
    try:
        response = await model.generate_content_async(prompt)
        return response.text
    except Exception as e:
        logger.error(f"Error in SHAP Explainer: {str(e)}")
        return f"Explanation failed: {str(e)}"

async def shap_explainer_stream(
    winner_carrier: Dict[str, Any],
    all_carriers: List[Dict[str, Any]],
    shap_values: Dict[str, float],
    rank: int = 1
):
    """
    Stream version of SHAP Explainer for real-time output.
    """
    if not settings.GEMINI_API_KEY:
        yield "API key missing."
        return

    genai.configure(api_key=get_api_key())
    model = genai.GenerativeModel(settings.MODEL, system_instruction=SHAP_AGENT_SYSTEM)
    
    prompt = f"WINNER: {winner_carrier['name']}\nSHAP: {str(shap_values)}\nExplain."
    
    try:
        response = await model.generate_content_async(prompt, stream=True)
        async for chunk in response:
            if chunk.text:
                yield chunk.text
    except Exception as e:
        yield f"Streaming failed: {e}"
