"""
Research Agent: Logistics Intelligence Analyst
Synthesizes real-time operational risk intelligence using Exa Search and Gemini.
"""

import google.generativeai as genai
from exa_py import Exa
from typing import List, Dict, Any
import logging
from config import settings, get_api_key

# Setup logging
logger = logging.getLogger(__name__)

RESEARCH_AGENT_SYSTEM = """
You are a logistics intelligence analyst at a global freight intelligence firm.
You synthesize real-time news, weather, port bulletins, and carrier signals 
into concise operational risk briefings for procurement teams.

You write for procurement managers who need to make a decision TODAY. 
Not academic analysis — operational intelligence.

Risk tiers:
TIER 1 — STOP: Port closures, strikes, cyclones, border shutdowns
TIER 2 — CAUTION: Labour unrest signals, peak season capacity crunch, infrastructure delays
TIER 3 — MONITOR: Fuel price movements, soft financial signals, regulatory changes

Tone: Bloomberg terminal meets military briefing. Precise, fast, actionable.
No fluff. Every word earns its place.

Output format — STRICTLY:
LANE RISK BRIEFING: [Origin] → [Destination]
TIMESTAMP: [Now]
OVERALL STATUS: 🟢 CLEAR / 🟡 CAUTION / 🟠 ALERT / 🔴 CRITICAL

TIER 1 ALERTS: [List or "None identified"]
TIER 2 ALERTS: [List or "None identified"]
TIER 3 ALERTS: [List or "None identified"]

PROCUREMENT ACTIONS (specific, not generic):
1. [Action]
2. [Action if needed]

ASSESSMENT CONFIDENCE: [High/Medium/Low — why]
NEXT BRIEFING: [Recommended refresh interval]
"""

async def run_research_agent(
    lane: str,
    carriers: List[Dict[str, Any]] = [],
    context: Dict[str, Any] = {}
) -> str:
    """
    Research Agent: Logistics intelligence analyst generates operational risk briefing.
    Uses Exa for real-time search and Gemini for synthesis.
    """
    if not settings.GEMINI_API_KEY or not settings.EXA_API_KEY:
        return "Gemini or Exa API key missing."

    # 1. Search for real-time risk intelligence using Exa
    exa = Exa(api_key=settings.EXA_API_KEY)
    search_query = f"logistics risks port congestion weather delays shipping lane {lane}"
    
    try:
        search_results = exa.search(
            search_query,
            num_results=5,
            use_autoprompt=True,
            highlights=True
        )
        
        market_intelligence = "\n".join([
            f"Source: {r.url}\nHighlights: {' '.join(r.highlights)}" 
            for r in search_results.results
        ])
    except Exception as e:
        logger.error(f"Exa search failed: {e}")
        market_intelligence = "Live search failed. Using historical context."

    # 2. Synthesize using Gemini
    genai.configure(api_key=get_api_key())
    model = genai.GenerativeModel(settings.MODEL, system_instruction=RESEARCH_AGENT_SYSTEM)
    
    carrier_list = ", ".join([f"{c['name']} ({c['otd_rate']*100:.0f}% OTD)" for c in carriers]) if carriers else "General Market"
    
    prompt = f"""
Generate a REAL-TIME OPERATIONAL RISK BRIEFING for this shipping lane.

LANE: {lane}
CARRIERS: {carrier_list}
MARKET INTELLIGENCE (LIVE):
{market_intelligence}

SEASON: {context.get('season', 'Regular')}
CRITICALITY: {context.get('criticality', 'Standard')}
CURRENT DATE: {context.get('current_date', 'Today')}

As a logistics intelligence analyst, provide your assessment based on the live results and historical knowledge.
Frame as TIER 1 (stop), TIER 2 (caution), or TIER 3 (monitor) alerts.
Be concise. Every word matters.
"""
    
    try:
        response = await model.generate_content_async(prompt)
        return response.text
    except Exception as e:
        logger.error(f"Error in Research Agent: {str(e)}")
        return f"Research failed: {str(e)}"

async def research_agent_stream(
    lane: str,
    carriers: List[Dict[str, Any]] = [],
    context: Dict[str, Any] = {}
):
    """
    Stream version of Research Agent for real-time output.
    """
    if not settings.GEMINI_API_KEY or not settings.EXA_API_KEY:
        yield "API keys missing."
        return

    # Exa search is typically fast, do it synchronously or wrap in thread
    # For now, let's just do it directly
    exa = Exa(api_key=settings.EXA_API_KEY)
    search_query = f"logistics risks shipping lane {lane}"
    
    try:
        search_results = exa.search(search_query, num_results=3, use_autoprompt=True)
        market_intelligence = "\n".join([f"Source: {r.url}" for r in search_results.results])
    except:
        market_intelligence = "Live search limited."

    genai.configure(api_key=get_api_key())
    model = genai.GenerativeModel(settings.MODEL, system_instruction=RESEARCH_AGENT_SYSTEM)
    
    prompt = f"LANE: {lane}\nMARKET INTEL: {market_intelligence}\nGenerate briefing."
    
    try:
        response = await model.generate_content_async(prompt, stream=True)
        async for chunk in response:
            if chunk.text:
                yield chunk.text
    except Exception as e:
        yield f"Streaming failed: {e}"
