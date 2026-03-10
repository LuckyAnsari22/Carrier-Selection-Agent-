"""
Bid Normalizer Agent: Freight Contract Analyst
Normalizes raw carrier bid submissions into a standard comparable format using Gemini.
"""

import google.generativeai as genai
from typing import List, Dict, Any
import json
import logging
from config import settings, get_api_key

# Setup logging
logger = logging.getLogger(__name__)

BID_NORMALIZER_SYSTEM = """
You are a freight contract analyst specializing in bid normalization.
You receive raw carrier bid submissions in inconsistent formats and 
normalize them to a single comparable standard.

Target format: TOTAL ALL-IN COST PER KG, DOOR-TO-DOOR, CALENDAR DAYS

Normalization logic:
- Per-shipment quotes: divide by average shipment weight (assume 500kg if not stated)
- Business day transit: multiply by 1.4 to get calendar days
- USD-only output (convert other currencies at current rates if stated)
- Add ALL accessorial charges to base rate
- If fuel surcharge not separated: note as "embedded" and flag
- Missing liability limit: flag as MISSING — do not estimate

For each bid, output valid JSON only. No preamble. No explanation outside JSON.
Return an array of normalized bid objects.

Schema per carrier:
{
  "carrier_name": string,
  "normalized_cost_per_kg_usd": number,
  "transit_days_calendar": number,
  "fuel_surcharge_pct": number | null,
  "liability_per_kg_usd": number | null,
  "invoice_accuracy_sla_pct": number | null,
  "missing_fields": string[],
  "anomaly_flags": string[],
  "normalization_notes": string
}

If a field cannot be determined from the submission, use null.
Never estimate missing data — always flag it as missing.
"""

async def normalize_bids(raw_submissions: str) -> List[Dict[str, Any]]:
    """
    Normalizes raw carrier bid submissions using LLM.
    
    Args:
        raw_submissions: Text content of raw carrier bids
        
    Returns:
        List[Dict]: Normalized bid objects
    """
    if not settings.GEMINI_API_KEY:
        logger.error("Gemini API key is missing. Cannot normalize bids.")
        return []

    genai.configure(api_key=get_api_key())
    model = genai.GenerativeModel(settings.MODEL, system_instruction=BID_NORMALIZER_SYSTEM)
    
    prompt = f"""
RAW CARRIER BID SUBMISSIONS:
{raw_submissions}

Normalize the above bids according to the system instructions.
Return valid JSON only.
"""
    
    try:
        response = await model.generate_content_async(prompt)
        response_text = response.text
        
        # Strip markdown if present
        if "```json" in response_text:
            json_str = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            json_str = response_text.split("```")[1].split("```")[0].strip()
        else:
            json_str = response_text.strip()
            
        normalized_data = json.loads(json_str)
        
        if isinstance(normalized_data, dict):
            return [normalized_data]
        return normalized_data
        
    except Exception as e:
        logger.error(f"Error in Bid Normalizer: {str(e)}")
        return []
