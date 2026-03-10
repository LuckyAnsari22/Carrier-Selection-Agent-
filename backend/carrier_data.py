"""
CarrierIQ v2 — Carrier Data Generation Module
Generates realistic Indian freight carrier profiles for ML model training
and procurement decision-making.
"""

import numpy as np
import pandas as pd
import random
from typing import Tuple, List


# Indian freight company name templates for realistic company generation
CARRIER_NAMES = {
    "Premium": [
        "TransIndia Premium Logistics",
        "BharatFreight Elite",
        "IndoLogistics Pro",
        "ExpressRoute Carriers",
    ],
    "Standard": [
        "TransCo Standard",
        "RaasLogistics",
        "IndiaFreight Services",
        "LogiRoute Express",
        "CargoAssure Logistics",
        "FastTrack Carriers",
        "VelocityFreight Ltd",
        "TrustFreight India",
        "Routemax Logistics",
        "SpeedCargo Services",
        "ProFreight Networks",
        "JourneyLogistics",
        "CargoConnect India",
        "TransRoute Standard",
        "SafeFreight Solutions",
        "ValueFreight Carriers",
        "PrimeRoute Logistics",
        "SwiftFreight India",
    ],
    "Budget": [
        "BudgetFreight Co",
        "EconomyTransport",
        "ValueCargo Services",
        "BasicFreight India",
        "DirectRoute Logistics",
        "CostFreight Express",
        "SimpleFreight Ltd",
        "LoadFreight Services",
    ],
}


def generate_carrier_dataset(n_carriers: int = 30, random_seed: int = 42) -> pd.DataFrame:
    """
    Generate a realistic dataset of Indian freight carriers with correlated attributes.
    
    Args:
        n_carriers: Total number of carriers to generate (default 30)
                   Breakdown: 4 Premium, 18 Standard, 8 Budget
        random_seed: Random seed for reproducibility
    
    Returns:
        pd.DataFrame with carrier profiles and realistic correlations
    """
    
    # Set seeds for reproducibility
    np.random.seed(random_seed)
    random.seed(random_seed)
    
    # Tier distribution
    n_premium = 4
    n_standard = 18
    n_budget = n_carriers - n_premium - n_standard
    
    carriers = []
    carrier_idx = 1
    
    # Generate Premium tier carriers
    for _ in range(n_premium):
        carrier = _generate_carrier_by_tier(
            carrier_idx=carrier_idx,
            tier="Premium",
            carrier_names=CARRIER_NAMES["Premium"]
        )
        carriers.append(carrier)
        carrier_idx += 1
    
    # Generate Standard tier carriers
    for _ in range(n_standard):
        carrier = _generate_carrier_by_tier(
            carrier_idx=carrier_idx,
            tier="Standard",
            carrier_names=CARRIER_NAMES["Standard"]
        )
        carriers.append(carrier)
        carrier_idx += 1
    
    # Generate Budget tier carriers
    for _ in range(n_budget):
        carrier = _generate_carrier_by_tier(
            carrier_idx=carrier_idx,
            tier="Budget",
            carrier_names=CARRIER_NAMES["Budget"]
        )
        carriers.append(carrier)
        carrier_idx += 1
    
    # Create DataFrame
    df = pd.DataFrame(carriers)
    
    # Shuffle to avoid tier-based ordering
    df = df.sample(frac=1).reset_index(drop=True)
    
    return df


def _generate_carrier_by_tier(
    carrier_idx: int,
    tier: str,
    carrier_names: List[str]
) -> dict:
    """
    Generate a single carrier profile with tier-specific realistic attributes.
    
    Constraints by tier:
    - Premium: Lower costs, higher reliability, better ratings
    - Standard: Mid-range across all metrics
    - Budget: Higher costs savings, lower consistency, budget-friendly
    
    Correlations:
    - Higher ontime_pct → Lower damage_rate and avg_delay_hours
    - Higher rating → Lower damage_rate
    - Higher capacity_utilization → More claims_last_month
    - Higher transit_consistency → Lower avg_delay_hours
    """
    
    carrier_id = f"CARRIER_{carrier_idx:03d}"
    carrier_name = random.choice(carrier_names)
    
    # Tier-specific base ranges
    if tier == "Premium":
        cost_range = (35, 42)
        ontime_range = (94, 98)
        damage_range = (0.2, 0.8)
        rating_range = (4.5, 5.0)
        experience_range = (8, 15)
    elif tier == "Standard":
        cost_range = (28, 35)
        ontime_range = (86, 94)
        damage_range = (0.5, 1.5)
        rating_range = (3.5, 4.5)
        experience_range = (4, 10)
    else:  # Budget
        cost_range = (22, 30)
        ontime_range = (78, 88)
        damage_range = (1.0, 2.5)
        rating_range = (2.5, 3.8)
        experience_range = (1, 6)
    
    # Generate base on-time percentage (core differentiator by tier)
    ontime_pct = np.random.uniform(ontime_range[0], ontime_range[1])
    
    # Damage rate inversely correlates with on-time percentage
    # High on-time carriers are more careful
    damage_rate_base = damage_range[1] * (1 - (ontime_pct - ontime_range[0]) / (ontime_range[1] - ontime_range[0]))
    damage_rate = np.clip(
        damage_rate_base + np.random.normal(0, damage_range[1] * 0.15),
        damage_range[0],
        damage_range[1]
    )
    
    # Average delay hours inversely correlates with on-time percentage
    max_delay = 24 * (1 - ontime_pct / 100)
    avg_delay_hours = np.clip(
        max_delay + np.random.normal(0, max_delay * 0.3),
        0,
        24
    )
    
    # Cost per km with slight noise
    cost_per_km = np.random.uniform(cost_range[0], cost_range[1])
    cost_per_km = float(np.round(cost_per_km, 2))
    
    # Capacity utilization (realistic distribution across all tiers)
    capacity_utilization = np.random.uniform(0.45, 0.92)
    capacity_utilization = float(np.round(capacity_utilization, 2))
    
    # Rating correlated with tier and on-time performance
    rating_noise = np.random.normal(0, 0.3)
    rating_base = rating_range[0] + (ontime_pct - ontime_range[0]) / (ontime_range[1] - ontime_range[0]) * (rating_range[1] - rating_range[0])
    rating = np.clip(rating_base + rating_noise, rating_range[0], 5.0)
    rating = float(np.round(rating, 1))
    
    # Years of experience (tier-based)
    years_experience = int(np.random.uniform(experience_range[0], experience_range[1]))
    
    # Routes covered (uniform across tiers)
    routes_covered = int(np.random.uniform(40, 180))
    
    # Transit consistency (correlated with on-time performance)
    consistency_base = ontime_pct / 100  # High on-time → high consistency
    transit_consistency = np.clip(
        consistency_base + np.random.normal(0, 0.15),
        0.0,
        1.0
    )
    transit_consistency = float(np.round(transit_consistency, 2))
    
    # Claims last month (correlated with capacity utilization and damage rate)
    claims_base = 4 * capacity_utilization * (damage_rate / 1.5)  # More capacity & damage → more claims
    claims_last_month = int(np.clip(claims_base + np.random.normal(0, 1.5), 0, 8))
    
    # Round percentages
    ontime_pct = float(np.round(ontime_pct, 1))
    damage_rate = float(np.round(damage_rate, 2))
    avg_delay_hours = float(np.round(avg_delay_hours, 1))
    
    return {
        "carrier_id": carrier_id,
        "carrier_name": carrier_name,
        "tier": tier,
        "cost_per_km": cost_per_km,
        "ontime_pct": ontime_pct,
        "damage_rate": damage_rate,
        "capacity_utilization": capacity_utilization,
        "rating": rating,
        "years_experience": years_experience,
        "routes_covered": routes_covered,
        "transit_consistency": transit_consistency,
        "avg_delay_hours": avg_delay_hours,
        "claims_last_month": claims_last_month,
    }


def get_carrier_features() -> List[str]:
    """
    Return list of feature column names for ML models.
    
    Returns:
        List of feature column names (excludes carrier_id, carrier_name, tier)
    """
    return [
        "cost_per_km",
        "ontime_pct",
        "damage_rate",
        "capacity_utilization",
        "rating",
        "years_experience",
        "routes_covered",
        "transit_consistency",
        "avg_delay_hours",
        "claims_last_month",
    ]


def print_summary_statistics(df: pd.DataFrame) -> None:
    """
    Print summary statistics grouped by tier.
    
    Args:
        df: Carrier dataset
    """
    print("\n" + "="*80)
    print("CARRIERIQ v2 — CARRIER DATASET SUMMARY")
    print("="*80)
    
    print(f"\nTotal Carriers: {len(df)}")
    print(f"Distribution: Premium {len(df[df['tier']=='Premium'])} | "
          f"Standard {len(df[df['tier']=='Standard'])} | "
          f"Budget {len(df[df['tier']=='Budget'])}")
    
    for tier in ["Premium", "Standard", "Budget"]:
        tier_df = df[df["tier"] == tier]
        if len(tier_df) == 0:
            continue
        
        print(f"\n{tier.upper()} TIER ({len(tier_df)} carriers):")
        print(f"  Cost (Rs/km):          {tier_df['cost_per_km'].min():.2f} - {tier_df['cost_per_km'].max():.2f} (mean: {tier_df['cost_per_km'].mean():.2f})")
        print(f"  On-time %:             {tier_df['ontime_pct'].min():.1f}% - {tier_df['ontime_pct'].max():.1f}% (mean: {tier_df['ontime_pct'].mean():.1f}%)")
        print(f"  Damage Rate %:         {tier_df['damage_rate'].min():.2f}% - {tier_df['damage_rate'].max():.2f}% (mean: {tier_df['damage_rate'].mean():.2f}%)")
        print(f"  Capacity Util:         {tier_df['capacity_utilization'].min():.2f} - {tier_df['capacity_utilization'].max():.2f} (mean: {tier_df['capacity_utilization'].mean():.2f})")
        print(f"  Rating (1-5):          {tier_df['rating'].min():.1f} - {tier_df['rating'].max():.1f} (mean: {tier_df['rating'].mean():.1f})")
        print(f"  Experience (years):    {tier_df['years_experience'].min()} - {tier_df['years_experience'].max()} (mean: {tier_df['years_experience'].mean():.1f})")
        print(f"  Routes Covered:        {tier_df['routes_covered'].min()} - {tier_df['routes_covered'].max()} (mean: {tier_df['routes_covered'].mean():.0f})")
        print(f"  Transit Consistency:   {tier_df['transit_consistency'].min():.2f} - {tier_df['transit_consistency'].max():.2f} (mean: {tier_df['transit_consistency'].mean():.2f})")
        print(f"  Avg Delay (hours):     {tier_df['avg_delay_hours'].min():.1f} - {tier_df['avg_delay_hours'].max():.1f} (mean: {tier_df['avg_delay_hours'].mean():.1f})")
        print(f"  Claims (last month):   {tier_df['claims_last_month'].min()} - {tier_df['claims_last_month'].max()} (mean: {tier_df['claims_last_month'].mean():.1f})")
    
    print("\n" + "="*80 + "\n")


if __name__ == "__main__":
    # Generate 30 carriers
    print("Generating carrier dataset...")
    df = generate_carrier_dataset(n_carriers=30)
    
    # Print summary statistics
    print_summary_statistics(df)
    
    # Display first 5 carriers
    print("SAMPLE CARRIERS (first 5):")
    print(df.head(5).to_string(index=False))
    
    # Save to CSV
    output_path = "data/carriers.csv"
    df.to_csv(output_path, index=False)
    print(f"\n✅ Saved {len(df)} carriers to {output_path}")
    
    # Verify correlations
    print("\nQUICK CORRELATION CHECK:")
    print(f"  On-time % vs Damage Rate: {df['ontime_pct'].corr(df['damage_rate']):.3f} (should be negative)")
    print(f"  On-time % vs Avg Delay:   {df['ontime_pct'].corr(df['avg_delay_hours']):.3f} (should be negative)")
    print(f"  Rating vs Damage Rate:    {df['rating'].corr(df['damage_rate']):.3f} (should be negative)")
    print(f"  Capacity vs Claims:       {df['capacity_utilization'].corr(df['claims_last_month']):.3f} (should be positive)")
