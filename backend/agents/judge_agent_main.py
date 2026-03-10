"""
Judge Agent: Dr. Ananya Krishnamurthy - Chief Procurement Officer

Synthesizes competing Cost vs Reliability viewpoints into auditable award decision.
Responsible for defense against both CFO (cost) and supply chain (operational) audits.
"""

from anthropic import Anthropic
from typing import List, Dict, Any

JUDGE_AGENT_SYSTEM = """
You are Dr. Ananya Krishnamurthy, Chief Procurement Officer with an MBA from 
INSEAD and 20 years running procurement for manufacturing conglomerates.

You have heard thousands of procurement debates. You know that the best 
decisions are rarely at the extremes — they are thoughtful balances that 
serve the organization's current strategic context.

You have just heard two agents debate carrier selection:
- Marcus (Cost Optimizer) argued for minimum total cost
- Priya (Reliability Guardian) argued for maximum service reliability

Your job is to synthesize their debate into a final, defensible, 
explainable award recommendation. You must balance their arguments against 
the actual procurement priorities the organization has set.

Principles you apply:
1. For critical lanes (high revenue impact): reliability > cost
2. For commodity lanes (low SKU value): cost > reliability  
3. Never award 100% to a single carrier on any lane >$500K/year
4. A carrier Priya flags as "Overextended" cannot be primary carrier
5. A carrier Marcus flags as "cost trap" gets max 30% allocation
6. Your recommendation must survive a CFO audit AND a supply chain audit

Output format — STRICTLY follow this structure:
FINAL AWARD DECISION:
  Primary Carrier: [Name] — [X%] allocation — Est. $[X]/year
  Backup Carrier:  [Name] — [X%] allocation — Activated when: [conditions]
  
SYNTHESIS RATIONALE:
[2-3 sentences explaining how you balanced cost vs reliability arguments]

PERFORMANCE GATE — Trigger immediate reallocation if:
  OTD drops below: [X%] for [N] consecutive weeks
  Damage rate exceeds: [X%]
  [Other trigger]

DISSENTING VIEW ON RECORD (for audit trail):
[Summarize the losing argument — it belongs in the decision record]

CONFIDENCE SCORE: [0-100]
UNCERTAINTY FACTORS: [What could make this recommendation wrong]
REVIEW DATE: [N weeks from now based on risk level]
"""

async def run_judge_agent(
    carriers: List[Dict[str, Any]], 
    context: Dict[str, Any],
    cost_analysis: str = "",
    reliability_analysis: str = ""
) -> str:
    """
    Judge Agent: Dr. Ananya synthesizes Cost vs Reliability into auditable decision.
    
    Args:
        carriers: List of carrier dicts
        context: Shared context (lane, volume, priorities, criticality)
        cost_analysis: Marcus's cost analysis
        reliability_analysis: Priya's reliability analysis
    
    Returns:
        str: Dr. Ananya's final award decision with gates and audit trail
    """
    client = Anthropic()
    
    carrier_summary = "\n".join([
        f"- {c['name']} (ID: {c['id']}): "
        f"${c['price_per_kg']:.2f}/kg, "
        f"{c['otd_rate']*100:.0f}% OTD, "
        f"{c['damage_rate']*100:.2f}% damage"
        for c in carriers
    ])
    
    # Determine lane criticality for prioritization
    est_annual_value = context.get('est_volume_kg', 1000000) * 5 / 1000  # rough $5/kg avg
    is_critical = est_annual_value > 500000 or context.get('criticality') == 'Critical'
    
    prompt = f"""
You have received the following analyses from your expert team:

COST EXPERT (Marcus Chen):
{cost_analysis if cost_analysis else "[Cost analysis would be inserted here]"}

RELIABILITY EXPERT (Priya Sharma):
{reliability_analysis if reliability_analysis else "[Reliability analysis would be inserted here]"}

CARRIERS BEING EVALUATED:
{carrier_summary}

Lane Context: {context.get('lane', 'Unknown')}
Estimated Annual Value: ${est_annual_value:,.0f}
Lane Criticality: {'CRITICAL (Reliability priority)' if is_critical else 'COMMODITY (Cost priority)'}
Business Priorities: Cost={context.get('priorities', {}).get('cost', 0.4)}, Reliability={context.get('priorities', {}).get('reliability', 0.35)}

Make your FINAL AWARD DECISION. You are defending this to both the CFO (on cost) 
and the supply chain director (on reliability). Your allocation strategy must:

1. For this {"CRITICAL" if is_critical else "COMMODITY"} lane, prioritize {"reliability" if is_critical else "cost"}
2. Use a primary/backup split to de-risk (never 100% single carrier on >$500K lanes)
3. Document performance gates (what triggers reallocation)
4. Include dissenting view in the record (shows you heard both sides)
5. Be honest about uncertainties

Remember: Your decision record will be audited. Make it defensible.
"""
    
    message = await client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1000,
        system=JUDGE_AGENT_SYSTEM,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )
    
    return message.content[0].text


async def judge_agent_stream(
    carriers: List[Dict[str, Any]], 
    context: Dict[str, Any],
    cost_analysis: str = "",
    reliability_analysis: str = ""
):
    """
    Stream version of Judge Agent for real-time output.
    
    Yields:
        str: Tokens from Dr. Ananya's decision
    """
    client = Anthropic()
    
    carrier_summary = "\n".join([
        f"- {c['name']} (ID: {c['id']}): "
        f"${c['price_per_kg']:.2f}/kg, "
        f"{c['otd_rate']*100:.0f}% OTD, "
        f"{c['damage_rate']*100:.2f}% damage"
        for c in carriers
    ])
    
    # Determine lane criticality for prioritization
    est_annual_value = context.get('est_volume_kg', 1000000) * 5 / 1000  # rough $5/kg avg
    is_critical = est_annual_value > 500000 or context.get('criticality') == 'Critical'
    
    prompt = f"""
You have received the following analyses from your expert team:

COST EXPERT (Marcus Chen):
{cost_analysis if cost_analysis else "[Cost analysis would be inserted here]"}

RELIABILITY EXPERT (Priya Sharma):
{reliability_analysis if reliability_analysis else "[Reliability analysis would be inserted here]"}

CARRIERS BEING EVALUATED:
{carrier_summary}

Lane Context: {context.get('lane', 'Unknown')}
Estimated Annual Value: ${est_annual_value:,.0f}
Lane Criticality: {'CRITICAL (Reliability priority)' if is_critical else 'COMMODITY (Cost priority)'}
Business Priorities: Cost={context.get('priorities', {}).get('cost', 0.4)}, Reliability={context.get('priorities', {}).get('reliability', 0.35)}

Make your FINAL AWARD DECISION. You are defending this to both the CFO (on cost) 
and the supply chain director (on reliability). Your allocation strategy must:

1. For this {"CRITICAL" if is_critical else "COMMODITY"} lane, prioritize {"reliability" if is_critical else "cost"}
2. Use a primary/backup split to de-risk (never 100% single carrier on >$500K lanes)
3. Document performance gates (what triggers reallocation)
4. Include dissenting view in the record (shows you heard both sides)
5. Be honest about uncertainties

Remember: Your decision record will be audited. Make it defensible.
"""
    
    with client.messages.stream(
        model="claude-sonnet-4-20250514",
        max_tokens=1000,
        system=JUDGE_AGENT_SYSTEM,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    ) as stream:
        for text in stream.text_stream:
            yield text
