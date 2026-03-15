export const MOCK_CARRIERS = [
  {
    id: 'C001',
    carrier_id: 'C001',
    name: 'TransCo Express',
    carrier_name: 'TransCo Express',
    otd_rate: 0.96,
    damage_rate: 0.002,
    capacity_utilization: 0.78,
    price_per_kg: 2.50,
    avg_transit_days: 3,
    claim_resolution_days: 5,
    invoice_accuracy: 0.98,
    years_in_operation: 12,
    hub_city: 'Delhi',
    network_size: 8,
    tier: 'Premium',
    rating: 4.8,
    rank: 2,
    final_score: 0.88,
    cost_score: 0.75,
    reliability_score: 0.92,
    speed_score: 0.85,
    quality_score: 0.95
  },
  {
    id: 'C002',
    carrier_id: 'C002',
    name: 'Logistics Prime',
    carrier_name: 'Logistics Prime',
    otd_rate: 0.92,
    damage_rate: 0.005,
    capacity_utilization: 0.65,
    price_per_kg: 1.20, // Low price for anomaly
    avg_transit_days: 4,
    claim_resolution_days: 7,
    invoice_accuracy: 0.95,
    years_in_operation: 8,
    hub_city: 'Mumbai',
    network_size: 6,
    tier: 'Standard',
    rating: 4.2,
    rank: 4,
    final_score: 0.72,
    cost_score: 0.85,
    reliability_score: 0.70,
    speed_score: 0.65,
    quality_score: 0.80,
    anomalous: true
  },
  {
    id: 'C003',
    carrier_id: 'C003',
    name: 'RoadKing Networks',
    carrier_name: 'RoadKing Networks',
    otd_rate: 0.89,
    damage_rate: 0.008,
    capacity_utilization: 0.82,
    price_per_kg: 2.75,
    avg_transit_days: 2,
    claim_resolution_days: 10,
    invoice_accuracy: 0.92,
    years_in_operation: 15,
    hub_city: 'Bangalore',
    network_size: 12,
    tier: 'Premium',
    rating: 4.5,
    rank: 3,
    final_score: 0.78,
    cost_score: 0.65,
    reliability_score: 0.85,
    speed_score: 0.92,
    quality_score: 0.75
  },
  {
    id: 'C005',
    carrier_id: 'C005',
    name: 'EliteShip Corp',
    carrier_name: 'EliteShip Corp',
    otd_rate: 0.98,
    damage_rate: 0.001,
    capacity_utilization: 0.90,
    price_per_kg: 3.20,
    avg_transit_days: 2,
    claim_resolution_days: 3,
    invoice_accuracy: 0.99,
    years_in_operation: 18,
    hub_city: 'Delhi',
    network_size: 10,
    tier: 'Premium',
    rating: 4.9,
    rank: 1,
    final_score: 0.94,
    cost_score: 0.60,
    reliability_score: 0.98,
    speed_score: 0.95,
    quality_score: 0.99
  }
];

export const MOCK_RANKINGS = {
  status: 'success',
  lane: 'Mumbai → Delhi',
  rankings: [...MOCK_CARRIERS].sort((a,b) => a.rank - b.rank),
  carriers: [...MOCK_CARRIERS].sort((a,b) => a.rank - b.rank),
  global_health: 92,
  computation_ms: 145
};

export const MOCK_AGENT_MESSAGES = [
  { agent: 'Cost Optimizer', content: "Initial analysis of the Mumbai-Delhi corridor indicates that EliteShip Corp provides the best value-to-cost ratio despite a 15% higher base rate. Their network density reduces idle time by 22%." },
  { agent: 'Reliability Guardian', content: "Confirmed. TransCo Express and EliteShip have maintained 98%+ OTD for the last 4 quarters. RoadKing shows a minor anomaly in claim resolution speed (avg 10 days vs target 5)." },
  { agent: 'Procurement Judge', content: "Based on current priorities (Cost: 40%, Reliability: 35%), EliteShip is the optimal strategic choice. Their Tier-1 status and capacity utilization of 90% ensure long-term stability." }
];

export const MOCK_EXPLANATION = {
  carrier_id: 'C005',
  carrier_name: 'EliteShip Corp',
  summary: "EliteShip Corp dominates this lane due to extreme transit consistency and low damage rates. Their higher price point is offset by significantly lower insurance and claim costs.",
  factors: [
    { name: 'Reliability', contribution: 0.45, impact: 'Very High' },
    { name: 'Speed', contribution: 0.25, impact: 'High' },
    { name: 'Cost Efficiency', contribution: -0.15, impact: 'Medium' },
    { name: 'Risk Mitigation', contribution: 0.30, impact: 'High' }
  ],
  recommendation: "Select for high-value priority shipments."
};

export const MOCK_WHATIF = {
  analysis: "Simulation Model v3.2 Output:\n\nUnder the 'MONSOON' scenario, we see a critical shift in the network equilibrium. \n\n1. Reliability metrics now carry 60% of the total decision weight. \n2. EliteShip Corp maintains its #1 position due to its all-weather fleet capabilities.\n3. TransCo Express rises to #2, displacing lower-cost carriers who lack transit consistency guards.\n4. Budget carriers like ValueFreight see a 32% drop in rank as their risk profile exceeds the threshold.\n\nFinancial recommendation: Accept the 8.5% increase in base rates to secure Tier-1 capacity during the disruption period.",
  impact: {
      financial_delta_usd: 12450.0,
      service_delta_otd: 4.2
  },
  scenario_top_5: [
      { carrier_name: 'EliteShip Corp', ontime_pct: 98.2, cost_per_km: 3.2, original_rank: 1 },
      { carrier_name: 'TransCo Express', ontime_pct: 96.5, cost_per_km: 2.5, original_rank: 2 },
      { carrier_name: 'PremiumLogistics', ontime_pct: 97.1, cost_per_km: 3.5, original_rank: 5 },
      { carrier_name: 'Logistics Prime', ontime_pct: 92.4, cost_per_km: 2.1, original_rank: 4 },
      { carrier_name: 'GreenRoute', ontime_pct: 91.8, cost_per_km: 2.2, original_rank: 6 }
  ]
};

export const MOCK_AWARD_STRATEGY = {
  lane: "Mumbai-Delhi",
  strategy: "## STRATEGIC AWARD PORTFOLIO - Q3/Q4\n\n**Primary Allocation (70%): EliteShip Corp**\n- **Rationale:** Lowest total cost of quality (TCQ) and highest service level agreement (SLA) compliance.\n- **Pricing Structure:** Fixed base rate with 5% quarterly flex window.\n- **Performance Gates:** Must maintain OTD > 97.5% to retain primary status.\n\n**Secondary / Continuity Allocation (30%): TransCo Express**\n- **Rationale:** High network density in the NCR region provides robust overflow capacity.\n- **Pricing Structure:** Market-index linked with a 10% premium for surge capacity.\n- **Flex Clause:** Option to shift up to 15% of volume to secondary if primary OTD falls below 95% for 3 consecutive weeks.\n\n**Financial Outcome:**\n- Projected Annual Spend: $1.85M\n- Risk-Adjusted Savings: $142,000 (vs Spot Market Baseline)\n- Network Reliability: 97.2% Expected"
};

export const MOCK_FINANCIAL_HEALTH = {
  health_score: 88,
  assessment: "### FINANCIAL AUDIT REPORT: EliteShip Corp\n\n**Executive Summary:**\nEliteShip Corp demonstrates strong solvency and liquidity ratios (Current Ratio: 2.1). Despite rising fuel costs, their asset-heavy model is hedged by long-term contract stability.\n\n**Signal Analysis:**\n- **FMCSA Profile:** Clean. No significant safety violations or insurance lapses in the last 24 months.\n- **Driver Retention:** Industry-leading turnover rate of 12% (Average: 45%). High glassdoor ratings suggest employee satisfaction.\n- **Credit Growth:** Secured $50M in Series C funding recently for fleet electrification.\n\n**Risk Verdict:** \nLOW RISK. Highly recommended for long-term strategic contracts. Watch for potential labor cost shifts in the Q4 period."
};

export const MOCK_SUMMARY = "## CPO EXECUTIVE BRIEFING: MUM-DEL CORRIDOR\n\n**Recommendation:** Award 70% volume to EliteShip Corp and 30% to TransCo Express.\n\n**Key Findings:**\n1. **Cost Stability:** While EliteShip is 12% more expensive than the market average, their 0.1% damage rate reduces total cost of procurement by 8% more than standard carriers.\n2. **Network Resilience:** Diversification into TransCo Express mitigates the 15% volume surge risk expected in Q4 due to consumer durables demand peaks.\n3. **Long-term Value:** Total projected savings through structured contract flex clauses: $1.2M annually.\n\n**Decision Gate:** Implementation of the Portfolio Award Strategy by EOD Friday ensures capacity locking before the seasonal rate hike.";

export const MOCK_QBR = {
    carrier_name: "EliteShip Corp",
    qbr_report: "### QUARTERLY BUSINESS REVIEW: Q1 2026\n\n**Performance Overview:**\n- **OTD Excellence:** Maintained a 98.4% On-Time Delivery rate, exceeding the SLA of 95%.\n- **Quality Milestone:** Damage rates fell to an all-time low of 0.08%.\n- **Cost Trends:** Base rates remained within the agreed corridor despite local fuel fluctuations.\n\n**Areas for Mutual Improvement:**\n- **Integration:** API response times for milestone updates have been lagging (avg 1500ms). Target 500ms.\n- **Claims Speed:** Average resolution time is 4 days, but documentation missing for 3 instances.\n\n**Joint Action Plan:**\n1. Migrate to Tier-1 API endpoints for real-time tracking.\n2. Monthly sync between procurement teams to review volume forecast accuracy.\n\n**Status:** STRATEGIC PARTNER - RETAIN AND GROW"
};

export const MOCK_NORMALIZATION = [
    {
        carrier_name: "Carrier Alpha",
        normalized_cost_per_kg_usd: 2.15,
        transit_days_calendar: 3,
        fuel_surcharge_pct: 0,
        liability_per_kg_usd: 10,
        invoice_accuracy_sla_pct: 98,
        normalization_notes: "Converted from per-mile rate and 3 business days into calendar days. Fuel surcharge assumed embedded as per Section 4.2.",
        anomaly_flags: []
    },
    {
        carrier_name: "Carrier Bravo",
        normalized_cost_per_kg_usd: 3.12,
        transit_days_calendar: 5,
        fuel_surcharge_pct: 15,
        liability_per_kg_usd: null,
        invoice_accuracy_sla_pct: 95,
        normalization_notes: "Converted from fixed flat rate for 500kg. 15% surcharge added to base. MISSING: Liability limits not specified in raw email.",
        anomaly_flags: ["High Cost Delta", "Missing Liability Coverage"]
    }
];

export const MOCK_FEEDBACK = {
    stats: {
        total_awards: 145,
        total_unique_carriers: 28,
        excellent_pct: 72.4,
        good_pct: 18.6,
        mixed_pct: 6.2,
        poor_pct: 2.8,
        top_performing_carrier: "EliteShip Corp"
    },
    report: "### MLOPS PERFORMANCE ANALYSIS v3.4.1\n\n**Model Stability Index:** 94.2%\n\n**Observability Highlights:**\n- **Drift Detected:** In Lane-B (Bangalore-Pune), the predicted damage rate variance has drifted by 4.2% from actuals due to seasonal monsoon impact. Retraining scheduled for EOD.\n- **Human Override Bias:** Procurement teams overridden AI rankings in 12% of cases. Metadata analysis shows a 85% correlation with 'Relationship Tenure' factor, which is currently undervalued in the primary model weights.\n- **Feature Importance:** 'Invoice Accuracy' has risen to the top 3 most predictive signals for long-term carrier reliability, surpassing 'Total Fleet Size'.\n\n**Retraining Recommendation:**\nInject 145 new outcome records into the XGBoost training pipeline with a 0.15 shrinkage rate to stabilize the 'Damage Predictor' node."
};
