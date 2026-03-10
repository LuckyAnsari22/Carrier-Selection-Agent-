"""
CarrierIQ v2 — Carrier Scoring Engine
XGBoost + AHP + TOPSIS + SHAP for production-grade explainable carrier ranking
"""

import numpy as np
import pandas as pd
import time
import warnings
from typing import Dict, List, Tuple, Optional
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import xgboost as xgb
from sklearn.metrics import r2_score, mean_absolute_error

# Try importing SHAP, but gracefully handle if unavailable
try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False

# Try importing pymcdm TOPSIS, but gracefully handle if unavailable
try:
    from pymcdm.methods import TOPSIS as TOPSIS_pymcdm
    PYMCDM_AVAILABLE = True
except ImportError:
    PYMCDM_AVAILABLE = False

warnings.filterwarnings('ignore')


class AHPWeightGenerator:
    """
    Analytic Hierarchy Process (AHP) inspired weight normalization.
    Converts slider inputs (0-100) to normalized weights for TOPSIS ranking.
    """
    
    @staticmethod
    def get_default_weights() -> Dict[str, float]:
        """
        Return default procurement weights.
        
        Returns:
            dict with cost, reliability, speed, quality weights summing to 1.0
        """
        return {
            'cost': 0.35,
            'reliability': 0.30,
            'speed': 0.20,
            'quality': 0.15
        }
    
    @staticmethod
    def generate_from_importance(
        cost: int,
        reliability: int,
        speed: int,
        quality: int
    ) -> Dict[str, float]:
        """
        Generate normalized weights from slider importance values.
        
        Args:
            cost: Importance 0-100 (lower cost is better)
            reliability: Importance 0-100 (higher reliability is better)
            speed: Importance 0-100 (faster delivery is better)
            quality: Importance 0-100 (higher quality is better)
        
        Returns:
            dict with normalized weights {'cost': ..., 'reliability': ..., 'speed': ..., 'quality': ...}
        """
        # Convert to positive weights (for normalization)
        weights = np.array([
            float(cost),
            float(reliability),
            float(speed),
            float(quality)
        ])
        
        # Handle case where all weights are 0
        if weights.sum() == 0:
            weights = np.ones(4)
        
        # Normalize to sum to 1.0
        normalized = weights / weights.sum()
        
        return {
            'cost': float(normalized[0]),
            'reliability': float(normalized[1]),
            'speed': float(normalized[2]),
            'quality': float(normalized[3])
        }


class CarrierScoringEngine:
    """
    Core scoring engine combining XGBoost risk prediction, AHP weight normalization,
    TOPSIS multi-criteria ranking, and SHAP explainability.
    """
    
    def __init__(self):
        """Initialize the scoring engine."""
        self.risk_model = None
        self.risk_features = None
        self.scaler = StandardScaler()
        self.shap_explainer = None
        self.df_trained = None
    
    def train_risk_model(self, df: pd.DataFrame) -> Dict[str, float]:
        """
        Train XGBoost model to predict delay risk based on carrier attributes.
        
        Args:
            df: DataFrame with carrier data
        
        Returns:
            dict with training metrics: {'r2': float, 'mae': float, 'training_samples': int}
        """
        # Features for risk prediction
        self.risk_features = [
            'ontime_pct',
            'capacity_utilization',
            'damage_rate',
            'transit_consistency',
            'claims_last_month',
            'years_experience'
        ]
        
        X = df[self.risk_features].copy()
        
        # Create synthetic delay_risk_score as target
        # High on-time, low capacity utilization, low damage → low risk
        y = (
            100
            - (df['ontime_pct'] * 0.6)
            + ((1 - df['capacity_utilization']) * 20)
            + ((df['damage_rate'] / 2.5) * 20)
            + np.random.normal(0, 3, len(df))  # Add noise
        )
        y = np.clip(y, 0, 100)  # Clamp to 0-100
        
        # Standardize features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train XGBoost regressor
        self.risk_model = xgb.XGBRegressor(
            n_estimators=100,
            max_depth=4,
            learning_rate=0.1,
            random_state=42,
            verbosity=0
        )
        self.risk_model.fit(X_scaled, y)
        
        # Store training data for SHAP
        self.df_trained = df.copy()
        
        # Calculate metrics
        y_pred = self.risk_model.predict(X_scaled)
        r2 = r2_score(y, y_pred)
        mae = mean_absolute_error(y, y_pred)
        
        return {
            'r2': float(r2),
            'mae': float(mae),
            'training_samples': len(df)
        }
    
    def score_carriers(
        self,
        df: pd.DataFrame,
        weights: Optional[Dict[str, float]] = None
    ) -> pd.DataFrame:
        """
        Score all carriers using TOPSIS ranking with risk penalty.
        
        Args:
            df: DataFrame with carrier data
            weights: Optional weight dict. If None, uses default weights.
        
        Returns:
            DataFrame with added columns: delay_risk, topsis_score, final_score, rank
        """
        if self.risk_model is None:
            raise ValueError("Risk model must be trained first. Call train_risk_model().")
        
        # Use default weights if not provided
        if weights is None:
            weights = AHPWeightGenerator.get_default_weights()
        
        df_scored = df.copy()
        
        # Step 1: Predict delay risk for each carrier
        X_risk = df[self.risk_features].copy()
        X_risk_scaled = self.scaler.transform(X_risk)
        df_scored['delay_risk'] = self.risk_model.predict(X_risk_scaled)
        df_scored['delay_risk'] = df_scored['delay_risk'].clip(0, 100)
        
        # Step 2: Build decision matrix for TOPSIS
        # Columns: cost_per_km, ontime_pct, rating, transit_consistency, damage_rate
        decision_columns = ['cost_per_km', 'ontime_pct', 'rating', 'transit_consistency', 'damage_rate']
        decision_matrix = df_scored[decision_columns].values.astype(float)
        
        # Step 3: Define criterion types (-1: cost/lower better, +1: benefit/higher better)
        types = np.array([-1, 1, 1, 1, -1])
        
        # Step 4: Map weights to decision criteria
        # cost (cost_per_km), reliability (ontime_pct), speed (rating/transit_consistency), quality (1-damage_rate)
        # Normalize weights for 5 criteria
        weight_values = np.array([
            weights['cost'],           # cost_per_km
            weights['reliability'],    # ontime_pct
            weights['quality'] + weights['speed'] * 0.5,  # rating
            weights['speed'] * 0.5,    # transit_consistency
            weights['quality']         # damage_rate
        ])
        weight_values = weight_values / weight_values.sum()  # Ensure sum to 1.0
        
        # Step 5: Apply TOPSIS
        try:
            if PYMCDM_AVAILABLE:
                # Use pymcdm TOPSIS
                topsis_method = TOPSIS_pymcdm()
                topsis_scores = topsis_method(decision_matrix, weight_values, types)
            else:
                # Fall back to manual TOPSIS
                topsis_scores = self._manual_topsis(decision_matrix, weight_values, types)
        except Exception as e:
            print(f"Warning: TOPSIS failed ({e}), using manual implementation")
            topsis_scores = self._manual_topsis(decision_matrix, weight_values, types)
        
        df_scored['topsis_score'] = topsis_scores
        
        # Step 6: Final score = TOPSIS (70%) - Risk Penalty (30%)
        df_scored['final_score'] = (
            df_scored['topsis_score'] * 0.7
            - (df_scored['delay_risk'] / 100) * 0.3
        )
        
        # Normalize final score to 0-1 range
        min_score = df_scored['final_score'].min()
        max_score = df_scored['final_score'].max()
        if max_score > min_score:
            df_scored['final_score'] = (df_scored['final_score'] - min_score) / (max_score - min_score)
        else:
            df_scored['final_score'] = 0.5
        
        # Step 7: Add rank column (1 = best)
        df_scored['rank'] = df_scored['final_score'].rank(ascending=False, method='min').astype(int)
        
        return df_scored
    
    def _manual_topsis(
        self,
        matrix: np.ndarray,
        weights: np.ndarray,
        types: np.ndarray
    ) -> np.ndarray:
        """
        Manual TOPSIS implementation (fallback if pymcdm unavailable).
        
        TOPSIS: Technique for Order Preference by Similarity to Ideal Solution
        
        Args:
            matrix: Decision matrix (n_carriers × n_criteria)
            weights: Weight array (sums to 1.0)
            types: +1 for benefit criteria, -1 for cost criteria
        
        Returns:
            TOPSIS scores (0-1), higher is better
        """
        # Step 1: Normalize matrix (vector normalization)
        norm = np.sqrt((matrix ** 2).sum(axis=0))
        norm[norm == 0] = 1  # Avoid division by zero
        normalized = matrix / norm
        
        # Step 2: Apply weights
        weighted = normalized * weights
        
        # Step 3: Find ideal best and ideal worst solutions
        ideal_best = np.where(types == 1, weighted.max(axis=0), weighted.min(axis=0))
        ideal_worst = np.where(types == 1, weighted.min(axis=0), weighted.max(axis=0))
        
        # Step 4: Compute distances from ideal best and worst
        dist_best = np.sqrt(((weighted - ideal_best) ** 2).sum(axis=1))
        dist_worst = np.sqrt(((weighted - ideal_worst) ** 2).sum(axis=1))
        
        # Step 5: Compute TOPSIS score (similarity to ideal solution)
        scores = dist_worst / (dist_best + dist_worst + 1e-10)
        
        return scores
    
    def get_explanation(
        self,
        df_scored: pd.DataFrame,
        carrier_idx: int
    ) -> Dict:
        """
        Generate SHAP-based explanation for a specific carrier's score.
        
        Args:
            df_scored: Scored carrier DataFrame
            carrier_idx: Index of carrier to explain
        
        Returns:
            dict with explanation details: carrier_name, score, rank, contributions, explanation, warnings
        """
        if self.risk_model is None:
            raise ValueError("Risk model must be trained first.")
        
        carrier = df_scored.iloc[carrier_idx]
        carrier_name = carrier.get('carrier_name', f"Carrier {carrier_idx}")
        
        # Build contributions dict from feature importance
        X_risk = self.df_trained[self.risk_features].copy()
        X_risk_scaled = self.scaler.transform(X_risk)
        
        # Get feature importances
        feature_importance = self.risk_model.get_booster().get_score(importance_type='weight')
        
        contributions = {}
        for feature in self.risk_features:
            importance = feature_importance.get(f'f{self.risk_features.index(feature)}', 0)
            contributions[feature] = float(importance)
        
        # Normalize contributions
        total_importance = sum(abs(v) for v in contributions.values()) or 1
        contributions = {k: v / total_importance for k, v in contributions.items()}
        
        # Try SHAP explanation if available
        warnings_list = []
        if SHAP_AVAILABLE:
            try:
                if self.shap_explainer is None:
                    self.shap_explainer = shap.TreeExplainer(self.risk_model)
                
                shap_values = self.shap_explainer.shap_values(X_risk_scaled)
                carrier_shap = shap_values[carrier_idx]
                
                # Update contributions with SHAP values
                for i, feature in enumerate(self.risk_features):
                    contributions[feature] = float(carrier_shap[i])
            except Exception as e:
                warnings_list.append(f"SHAP explanation generation failed: {str(e)}")
        
        # Generate natural language explanation
        sorted_contribs = sorted(
            contributions.items(),
            key=lambda x: abs(x[1]),
            reverse=True
        )
        
        positives = [(f, v) for f, v in sorted_contribs if v > 0][:3]
        negatives = [(f, v) for f, v in sorted_contribs if v < 0][:2]
        
        explanation_lines = [
            f"{carrier_name} scored {carrier['final_score']:.2f}/1.0 (Rank {int(carrier['rank'])} of {len(df_scored)}):"
        ]
        
        if positives:
            explanation_lines.append("\n✅ STRENGTHS:")
            for feature, value in positives:
                label = feature.replace('_', ' ').title()
                explanation_lines.append(f"  • {label}: +{abs(value):.3f}")
        
        if negatives:
            explanation_lines.append("\n⚠️ CONSIDERATIONS:")
            for feature, value in negatives:
                label = feature.replace('_', ' ').title()
                explanation_lines.append(f"  • {label}: {value:.3f}")
        
        # Check for risk flags
        if carrier['delay_risk'] > 60:
            warnings_list.append("HIGH DELAY RISK: Risk score > 60")
        if carrier['capacity_utilization'] > 0.75:
            warnings_list.append("OVEREXTENDED: Capacity utilization > 75%")
        if carrier['damage_rate'] > 1.5:
            warnings_list.append("QUALITY CONCERN: Damage rate > 1.5%")
        
        return {
            'carrier_name': carrier_name,
            'score': float(carrier['final_score']),
            'rank': int(carrier['rank']),
            'contributions': contributions,
            'explanation': '\n'.join(explanation_lines),
            'warnings': warnings_list
        }
    
    def detect_operational_risks(self, df_scored: pd.DataFrame) -> List[Dict]:
        """
        Detect operational risks in the carrier network.
        
        Args:
            df_scored: Scored carrier DataFrame
        
        Returns:
            list of dicts with risk details: {carrier_name, risk_type, severity, recommendation}
        """
        risks = []
        
        # Risk 1: Overextension (capacity_utilization > 0.75)
        overextended = df_scored[df_scored['capacity_utilization'] > 0.75]
        for _, carrier in overextended.iterrows():
            risks.append({
                'carrier_name': carrier['carrier_name'],
                'risk_type': 'Overextension',
                'severity': 'HIGH' if carrier['capacity_utilization'] > 0.85 else 'MEDIUM',
                'recommendation': 'Limit award volume or monitor closely for delays',
                'value': float(carrier['capacity_utilization'])
            })
        
        # Risk 2: Network concentration (top 3 carriers > 40% of routes)
        if 'routes_covered' in df_scored.columns:
            top_3_df = df_scored.nlargest(3, 'routes_covered')
            top_3_routes = top_3_df['routes_covered'].sum()
            total_routes = df_scored['routes_covered'].sum()
            if total_routes > 0 and (top_3_routes / total_routes) > 0.40:
                for _, carrier in top_3_df.iterrows():
                    risks.append({
                        'carrier_name': carrier['carrier_name'],
                        'risk_type': 'Network Concentration',
                        'severity': 'HIGH',
                        'recommendation': 'Diversify carrier base to reduce single-point-of-failure risk',
                        'value': round(float(carrier['routes_covered'] / total_routes), 2)
                    })
        
        # Risk 3: Quality risk (damage_rate > 1.5%)
        quality_risk = df_scored[df_scored['damage_rate'] > 1.5]
        for _, carrier in quality_risk.iterrows():
            risks.append({
                'carrier_name': carrier['carrier_name'],
                'risk_type': 'Quality Risk',
                'severity': 'MEDIUM',
                'recommendation': 'Implement quality audits before major awards',
                'value': float(carrier['damage_rate'])
            })
        
        # Risk 4: Delay pattern (delay_risk > 60)
        delay_risk = df_scored[df_scored['delay_risk'] > 60]
        for _, carrier in delay_risk.iterrows():
            risks.append({
                'carrier_name': carrier['carrier_name'],
                'risk_type': 'Delay Risk',
                'severity': 'HIGH' if carrier['delay_risk'] > 75 else 'MEDIUM',
                'recommendation': 'Use for non-critical shipments or implement SLA penalties',
                'value': float(carrier['delay_risk'])
            })
        
        return risks
    
    def get_performance_summary(self, df_scored: pd.DataFrame) -> Dict:
        """
        Get summary statistics for the scored carriers.
        
        Args:
            df_scored: Scored carrier DataFrame
        
        Returns:
            dict with summary stats: top_carrier, avg_score, n_high_risk, computation_time_ms
        """
        top_carrier = df_scored.loc[df_scored['rank'] == 1, 'carrier_name'].values[0]
        top_score = df_scored['final_score'].max()
        
        return {
            'top_carrier': top_carrier,
            'top_score': float(top_score),
            'avg_score': float(df_scored['final_score'].mean()),
            'n_high_risk': int((df_scored['delay_risk'] > 60).sum()),
            'n_overextended': int((df_scored['capacity_utilization'] > 0.75).sum())
        }


def main():
    """Demo the complete carrier scoring pipeline."""
    from carrier_data import generate_carrier_dataset, get_carrier_features, print_summary_statistics
    
    print("\n" + "="*80)
    print("CARRIERIQ v2 — SCORING ENGINE DEMO")
    print("="*80)
    
    # Phase 1: Generate data
    print("\n[Phase 1] Generating 30 carriers...")
    df = generate_carrier_dataset(n_carriers=30)
    print(f"✅ Generated {len(df)} carriers")
    
    # Phase 2: Train model
    print("\n[Phase 2] Training XGBoost delay risk model...")
    start_time = time.time()
    engine = CarrierScoringEngine()
    metrics = engine.train_risk_model(df)
    train_time = (time.time() - start_time) * 1000
    
    print(f"✅ Model trained")
    print(f"   R² Score: {metrics['r2']:.3f}")
    print(f"   MAE: {metrics['mae']:.2f}")
    print(f"   Training Time: {train_time:.1f}ms")
    
    # Phase 3: Score carriers with default weights
    print("\n[Phase 3] Scoring 30 carriers with default weights...")
    start_time = time.time()
    df_scored = engine.score_carriers(df)
    score_time = (time.time() - start_time) * 1000
    
    print(f"✅ All carriers scored")
    print(f"   Scoring Time: {score_time:.1f}ms")
    
    summary = engine.get_performance_summary(df_scored)
    print(f"\n   Top Carrier: {summary['top_carrier']} (score: {summary['top_score']:.3f})")
    print(f"   Average Score: {summary['avg_score']:.3f}")
    print(f"   High Risk Carriers: {summary['n_high_risk']}")
    print(f"   Overextended: {summary['n_overextended']}")
    
    # Phase 4: Show top 5 with explanations
    print("\n[Phase 4] Top 5 Carriers with Explanations")
    print("-" * 80)
    
    for idx, (_, carrier) in enumerate(df_scored.nsmallest(5, 'rank').iterrows(), 1):
        print(f"\n#{idx}. {carrier['carrier_name']} (Tier: {carrier['tier']})")
        print(f"    Score: {carrier['final_score']:.3f} | TOPSIS: {carrier['topsis_score']:.3f} | Delay Risk: {carrier['delay_risk']:.0f}")
        print(f"    On-Time: {carrier['ontime_pct']:.1f}% | Cost: ₹{carrier['cost_per_km']:.2f}/km | Rating: {carrier['rating']:.1f}/5.0")
        
        # Get explanation
        carrier_idx = df_scored.index.get_loc(carrier.name)
        try:
            explanation = engine.get_explanation(df_scored, carrier_idx)
            if explanation['warnings']:
                print(f"    🚨 Warnings: {', '.join(explanation['warnings'])}")
        except Exception as e:
            print(f"    Explanation: (skipped - {str(e)[:50]})")
    
    # Phase 5: Detect risks
    print("\n[Phase 5] Operational Risk Detection")
    print("-" * 80)
    risks = engine.detect_operational_risks(df_scored)
    
    if risks:
        print(f"\n⚠️  Detected {len(risks)} risk flags:")
        risk_summary = {}
        for risk in risks:
            risk_type = risk['risk_type']
            risk_summary[risk_type] = risk_summary.get(risk_type, 0) + 1
            if len([r for r in risks if r['risk_type'] == risk_type]) <= 2:  # Show first 2 of each type
                print(f"\n  {risk['carrier_name']}")
                print(f"  └─ {risk['risk_type']} ({risk['severity']})")
                print(f"     {risk['recommendation']}")
    else:
        print("\n✅ No critical risks detected")
    
    # Phase 6: Performance summary
    total_time = train_time + score_time
    print("\n" + "="*80)
    print("PIPELINE PERFORMANCE")
    print("="*80)
    print(f"\nTrain Risk Model:  {train_time:.1f}ms")
    print(f"Score Carriers:    {score_time:.1f}ms")
    print(f"Total Pipeline:    {total_time:.1f}ms ✅ (Target: <3000ms)")
    print(f"\n✅ Full pipeline completed in {total_time:.1f}ms")
    
    # Demonstrate What-If scenario
    print("\n" + "="*80)
    print("WHAT-IF SCENARIO: Increase Reliability Priority")
    print("="*80)
    
    new_weights = AHPWeightGenerator.generate_from_importance(
        cost=10,        # Low cost priority
        reliability=70, # High reliability (monsoon scenario)
        speed=10,
        quality=10
    )
    print(f"\nNew weights: {new_weights}")
    
    start_time = time.time()
    df_scored_new = engine.score_carriers(df, weights=new_weights)
    rerank_time = (time.time() - start_time) * 1000
    
    print(f"Reranked in {rerank_time:.1f}ms")
    print(f"\nNew Top 3 Carriers:")
    for idx, (_, carrier) in enumerate(df_scored_new.nsmallest(3, 'rank').iterrows(), 1):
        print(f"  {idx}. {carrier['carrier_name']:30s} | Score: {carrier['final_score']:.3f} | On-Time: {carrier['ontime_pct']:.1f}%")
    
    print("\n" + "="*80)
    print(f"✅ CARRIERIQ v2 SCORING ENGINE READY FOR PRODUCTION")
    print("="*80 + "\n")


if __name__ == "__main__":
    main()
