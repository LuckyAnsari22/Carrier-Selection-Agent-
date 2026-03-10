"""
Judge Agent: Procurement Audit & Synthesis
Synthesizes specialized agent verdicts into a final award decision using Gemini.
"""

import google.generativeai as genai
from typing import Dict, Any, Tuple
from .prompts import JUDGE_AGENT_SYSTEM
from config import settings, get_api_key

async def run_judge_agent(state: dict, client: Any = None, model: str = None):
    """Synthesize cost and reliability verdicts into final award."""
    
    if model is None:
        model = settings.MODEL

    if not settings.GEMINI_API_KEY:
        state['judge_synthesis'] = "Gemini API key missing."
        return state

    genai.configure(api_key=get_api_key())
    model_instance = genai.GenerativeModel(model, system_instruction=JUDGE_AGENT_SYSTEM)

    prompt = f"""
COST OPTIMIZER'S VERDICT:
{state.get('cost_verdict', 'No cost analysis available.')}

RELIABILITY GUARDIAN'S VERDICT:
{state.get('reliability_verdict', 'No reliability analysis available.')}

ORGANIZATIONAL PRIORITIES:
{state.get('priorities', 'Standard weights: Cost 40%, Reliability 40%, Speed 20%')}

TOPSIS-RANKED CARRIERS:
{state.get('ranked_carriers', 'No rankings available.')}

LIVE LANE CONTEXT:
{state.get('live_context', 'No live context available.')}

Synthesize these perspectives into your final award recommendation.
"""
    
    try:
        response = await model_instance.generate_content_async(prompt)
        text = response.text
    except Exception as e:
        text = f"Synthesis failed: {str(e)}. Defaulting to primary carrier based on raw scores."
    
    state['judge_synthesis'] = text
    
    # Parse the recommendation for structured output
    state['final_recommendation'] = parse_recommendation(text)
    
    return state

def parse_recommendation(text: str) -> dict:
    """Extract structured data from judge synthesis text."""
    lines = text.split('\n')
    rec = {
        'primary': 'Unknown',
        'backup': 'None',
        'confidence': 75,
        'reasoning': text[:200] + "..."
    }
    for line in lines:
        if 'Primary Carrier:' in line:
            rec['primary'] = line.split('Primary Carrier:')[1].strip()
        if 'Backup Carrier:' in line:
            rec['backup'] = line.split('Backup Carrier:')[1].strip()
        if 'CONFIDENCE SCORE:' in line:
            try:
                # Extract digits
                score_str = ''.join(filter(str.isdigit, line.split(':')[1]))
                if score_str:
                    rec['confidence'] = int(score_str)
            except:
                pass
    return rec

async def judge_agent_stream(carriers, context, cost_verdict, reliability_verdict):
    """Stream version of Judge Agent for real-time output."""
    if not settings.GEMINI_API_KEY:
        yield "Gemini API key missing."
        return

    genai.configure(api_key=get_api_key())
    model = genai.GenerativeModel(settings.MODEL, system_instruction=JUDGE_AGENT_SYSTEM)
    
    prompt = f"""
COST VERDICT: {cost_verdict}
RELIABILITY VERDICT: {reliability_verdict}
LANE: {context.get('lane')}
PRIORITIES: {context.get('priorities')}

Synthesize the final award decision.
"""
    
    try:
        response = await model.generate_content_async(prompt, stream=True)
        async for chunk in response:
            if chunk.text:
                yield chunk.text
    except Exception as e:
        yield f"Synthesis failed: {e}"
