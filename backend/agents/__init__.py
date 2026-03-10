"""
Agents module - Multi-agent procurement decision system.

Five specialized agents analyze carriers and operational risk:

PROCUREMENT COMMITTEE:
    1. Cost Agent (Marcus Chen) - Total cost of ownership analysis
    2. Reliability Agent (Priya Sharma) - Operational risk & variance analysis
    3. Judge Agent (Dr. Ananya) - Final award recommendation & gates
    4. SHAP Explainer - Plain-language feature attribution for decisions

INTELLIGENCE:
    5. Research Agent - Operational risk intelligence briefing

Exports:
    run_cost_agent / cost_agent_stream
    run_reliability_agent / reliability_agent_stream
    run_judge_agent / judge_agent_stream
    run_shap_explainer / shap_explainer_stream
    run_research_agent / research_agent_stream
"""

from .cost_agent import run_cost_agent, cost_agent_stream
from .reliability_agent import run_reliability_agent, reliability_agent_stream
from .judge_agent import run_judge_agent, judge_agent_stream
from .shap_explainer import run_shap_explainer, shap_explainer_stream
from .research_agent import run_research_agent, research_agent_stream

__all__ = [
    "run_cost_agent",
    "cost_agent_stream",
    "run_reliability_agent",
    "reliability_agent_stream",
    "run_judge_agent",
    "judge_agent_stream",
    "run_shap_explainer",
    "shap_explainer_stream",
    "run_research_agent",
    "research_agent_stream"
]
