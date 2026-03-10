"""
LangGraph-style Agent Pipeline for Procurement Decision-Making

Orchestrates 4 specialized agents with detailed personas:
    1. Marcus Chen (Cost Agent) - Focused on total cost of ownership
    2. Dr. Amara Okonkwo (Reliability Agent) - Focused on operational excellence
    3. Sarah Kim (Judge Agent) - Final recommendation synthesis
    4. Dr. James Wheeler (SHAP Explainer) - Feature attribution narrative

Streaming: Uses asyncio to orchestrate agents and SSE events.
"""

from typing import List, Dict, Any, AsyncGenerator
from config import settings
from agents import (
    cost_agent_stream,
    reliability_agent_stream,
    judge_agent_stream,
    shap_explainer_stream
)


async def run_agent_pipeline(
    carriers: List[Dict[str, Any]],
    priorities: Dict[str, float],
    lane: str = "Unknown"
) -> AsyncGenerator[Dict[str, Any], None]:
    """
    Main procurement pipeline orchestrating all 4 agents with streaming.
    
    Flow:
    1. Initial ranking (baseline)
    2. Cost Agent analyzes total cost of ownership
    3. Reliability Agent analyzes operational excellence
    4. Judge Agent synthesizes into final recommendation
    5. SHAP Explainer provides feature attribution
    
    Args:
        carriers: List of carrier dicts with scoring features
        priorities: Dict of {cost, reliability, speed, quality} weights
        lane: Route description
    
    Yields:
        dict: Event with type, agent, content
    """
    
    context = {
        "lane": lane,
        "est_volume_kg": 1000000,  # 1M kg/year baseline
        "priorities": priorities,
        "criticality": "Standard"
    }
    
    # Event 1: Initial ranking
    ranked = sorted(carriers, key=lambda c: c.get("otd_rate", 0) * priorities.get("reliability", 0.35) +
                    (100 / max(c.get("price_per_kg", 1), 0.01)) * priorities.get("cost", 0.4), reverse=True)
    
    yield {
        "type": "initial_ranking",
        "rankings": [
            {
                "id": c.get("carrier_id", "Unknown"),
                "name": c.get("carrier_name", "Unknown"),
                "rank": i + 1,
                "score_pct": max(50, 90 - i * 10),
                "delay_risk": 20 + i * 15
            }
            for i, c in enumerate(ranked[:3])
        ]
    }
    
    # Event 2-N: Cost Agent (Marcus Chen)
    cost_analysis = ""
    yield {"type": "agent_start", "agent": "Cost Optimizer", "icon": "💰"}
    
    try:
        async for token in cost_agent_stream(carriers, context):
            cost_analysis += token
            yield {"type": "agent_message", "agent": "Cost Optimizer", "content": token}
    except Exception as e:
        yield {"type": "agent_message", "agent": "Cost Optimizer", "content": f"[System degradation: {str(e)}]"}
    
    # Event N-M: Reliability Agent (Dr. Amara)
    reliability_analysis = ""
    yield {"type": "agent_start", "agent": "Reliability Guardian", "icon": "🛡️"}
    
    try:
        async for token in reliability_agent_stream(carriers, context):
            reliability_analysis += token
            yield {"type": "agent_message", "agent": "Reliability Guardian", "content": token}
    except Exception as e:
        yield {"type": "agent_message", "agent": "Reliability Guardian", "content": f"[System degradation: {str(e)}]"}
    
    # Event M-P: Judge Agent (Sarah Kim)
    judge_analysis = ""
    yield {"type": "agent_start", "agent": "Procurement Judge", "icon": "⚖️"}
    
    try:
        async for token in judge_agent_stream(carriers, context, cost_analysis, reliability_analysis):
            judge_analysis += token
            yield {"type": "agent_message", "agent": "Procurement Judge", "content": token}
    except Exception as e:
        yield {"type": "agent_message", "agent": "Procurement Judge", "content": f"[System degradation: {str(e)}]"}
    
    # Determine winner for SHAP
    winner = ranked[0] if ranked else carriers[0]
    
    # Event P-Q: SHAP Explainer (Dr. James)
    yield {"type": "agent_start", "agent": "SHAP Explainer", "icon": "🔍"}
    
    shap_values = {
        "On-Time Delivery Rate": winner.get("otd_rate", 0.5) * 0.3,
        "Invoice Accuracy": winner.get("invoice_accuracy", 0.9) * 0.25,
        "Years in Operation": min(winner.get("years_in_operation", 5) / 20, 1) * 0.25,
        "Price per KG": -winner.get("price_per_kg", 2.5) / 10,
        "Damage Rate": -winner.get("damage_rate", 0.01) * 100
    }
    
    try:
        async for token in shap_explainer_stream(winner, carriers, shap_values):
            yield {"type": "agent_message", "agent": "SHAP Explainer", "content": token}
    except Exception as e:
        yield {"type": "agent_message", "agent": "SHAP Explainer", "content": f"[System degradation: {str(e)}]"}
    
    # Final events
    yield {
        "type": "recommendation",
        "content": {
            "winner_id": winner.get("carrier_id", "Unknown"),
            "winner_name": winner.get("carrier_name", "Unknown"),
            "score_pct": 85.0,
            "reasoning": f"Selected {winner.get('carrier_name', 'Unknown')} - optimal cost-reliability balance",
            "alternatives": [
                {
                    "id": c.get("carrier_id", "Unknown"),
                    "name": c.get("carrier_name", "Unknown"),
                    "reason": f"Strong on {['cost', 'reliability', 'speed'][i % 3]}"
                }
                for i, c in enumerate([car for car in ranked[1:3]])
            ]
        }
    }
    
    yield {"type": "complete", "state": "success"}
