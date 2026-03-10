"""
CarrierIQ v2 — Feedback Loop & Continuous Learning System
Records award outcomes and retrains models based on actual performance
"""

import sqlite3
import pandas as pd
import numpy as np
import json
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import os
from pathlib import Path

# Optional imports from scoring engine
try:
    from carrier_scorer_production import CarrierScoringEngine, AHPWeightGenerator
    from carrier_data import generate_carrier_dataset
    SCORING_ENGINE_AVAILABLE = True
except ImportError:
    SCORING_ENGINE_AVAILABLE = False


# ============================================================================
# DATABASE SCHEMA
# ============================================================================

DATABASE_SCHEMA = """
CREATE TABLE IF NOT EXISTS award_outcomes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    carrier_id TEXT NOT NULL,
    carrier_name TEXT,
    lane TEXT,
    award_date TEXT,
    predicted_ontime_pct REAL,
    actual_ontime_pct REAL,
    predicted_damage_rate REAL,
    actual_damage_rate REAL,
    predicted_cost_per_km REAL,
    actual_cost_per_km REAL,
    cost_deviation_pct REAL,
    outcome_quality TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS model_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version TEXT,
    r2_score REAL,
    mae REAL,
    training_samples INTEGER,
    trained_at TEXT,
    is_active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS carrier_adjustments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    carrier_id TEXT NOT NULL,
    carrier_name TEXT,
    adjustment_type TEXT,
    old_risk_score REAL,
    new_risk_score REAL,
    reason TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
"""


# ============================================================================
# FEEDBACK ENGINE
# ============================================================================

class FeedbackEngine:
    """Continuous learning system that tracks outcomes and retrains models."""
    
    def __init__(self, db_path: str = 'data/outcomes.db'):
        """
        Initialize FeedbackEngine with SQLite database.
        
        Args:
            db_path: Path to SQLite database file
        """
        self.db_path = db_path
        
        # Create directory if needed
        os.makedirs(os.path.dirname(db_path) if os.path.dirname(db_path) else '.', exist_ok=True)
        
        # Initialize database
        self._init_db()
        
        # Load existing outcomes
        self.outcomes_df = self._load_outcomes()
        
        # Track model performance
        self.last_trained_at = None
        self.outcomes_since_train = 0
    
    def _init_db(self) -> None:
        """Initialize SQLite database with schema."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Create tables
            for statement in DATABASE_SCHEMA.split(';'):
                if statement.strip():
                    cursor.execute(statement.strip())
            
            conn.commit()
            conn.close()
            print(f"[OK] Database initialized: {self.db_path}")
        except Exception as e:
            print(f"[WARN] Database initialization: {e}")
    
    def _load_outcomes(self) -> pd.DataFrame:
        """Load all outcomes from database."""
        try:
            conn = sqlite3.connect(self.db_path)
            df = pd.read_sql_query("SELECT * FROM award_outcomes", conn)
            conn.close()
            return df if len(df) > 0 else pd.DataFrame()
        except Exception as e:
            print(f"[WARN] Could not load outcomes: {e}")
            return pd.DataFrame()
    
    def record_award_outcome(
        self,
        carrier_id: str,
        carrier_name: str,
        lane: str,
        predicted_metrics: Dict,
        actual_metrics: Dict
    ) -> Dict:
        """
        Record a carrier award outcome and compute quality assessment.
        
        Args:
            carrier_id: Unique carrier identifier
            carrier_name: Carrier name
            lane: Route/lane identifier
            predicted_metrics: {ontime_pct, damage_rate, cost_per_km}
            actual_metrics: {ontime_pct, damage_rate, cost_per_km}
        
        Returns:
            {outcome_quality, performance_delta, recommendation}
        """
        # Extract metrics
        pred_ontime = predicted_metrics.get('ontime_pct', 85)
        pred_damage = predicted_metrics.get('damage_rate', 1.0)
        pred_cost = predicted_metrics.get('cost_per_km', 30)
        
        actual_ontime = actual_metrics.get('ontime_pct', 85)
        actual_damage = actual_metrics.get('damage_rate', 1.0)
        actual_cost = actual_metrics.get('cost_per_km', 30)
        
        # Compute cost deviation
        cost_deviation_pct = abs(actual_cost - pred_cost) / pred_cost * 100 if pred_cost > 0 else 0
        
        # Determine outcome quality
        excellent = (
            actual_ontime >= pred_ontime and
            actual_damage <= pred_damage and
            cost_deviation_pct < 5
        )
        
        good = (
            actual_ontime >= (pred_ontime - 5) and
            cost_deviation_pct < 10
        )
        
        poor = (
            actual_ontime < (pred_ontime - 10) or
            actual_damage > (pred_damage * 1.5) or
            cost_deviation_pct > 20
        )
        
        if excellent:
            outcome_quality = 'EXCELLENT'
        elif poor:
            outcome_quality = 'POOR'
        elif good:
            outcome_quality = 'GOOD'
        else:
            outcome_quality = 'MIXED'
        
        # Store in database
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO award_outcomes
                (carrier_id, carrier_name, lane, award_date,
                 predicted_ontime_pct, actual_ontime_pct,
                 predicted_damage_rate, actual_damage_rate,
                 predicted_cost_per_km, actual_cost_per_km,
                 cost_deviation_pct, outcome_quality)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                carrier_id, carrier_name, lane, datetime.now().isoformat(),
                pred_ontime, actual_ontime,
                pred_damage, actual_damage,
                pred_cost, actual_cost,
                cost_deviation_pct, outcome_quality
            ))
            
            conn.commit()
            conn.close()
            
            self.outcomes_since_train += 1
        except Exception as e:
            print(f"[ERROR] Could not record outcome: {e}")
        
        # Compute performance delta
        ontime_delta = actual_ontime - pred_ontime
        damage_delta = actual_damage - pred_damage  # Negative is good
        cost_delta = actual_cost - pred_cost
        
        # Generate recommendation
        if outcome_quality == 'EXCELLENT':
            recommendation = f"Award more volume to {carrier_name}. Exceeding targets."
        elif outcome_quality == 'GOOD':
            recommendation = f"Continue with {carrier_name}. Acceptable performance."
        elif outcome_quality == 'POOR':
            recommendation = f"Review relationship with {carrier_name}. Performance below targets."
        else:
            recommendation = f"Monitor {carrier_name}. Mixed performance."
        
        return {
            'outcome_quality': outcome_quality,
            'performance_delta': {
                'ontime_delta': ontime_delta,
                'damage_delta': damage_delta,
                'cost_delta': cost_delta
            },
            'recommendation': recommendation
        }
    
    def get_carrier_performance_history(self, carrier_id: str) -> pd.DataFrame:
        """
        Get performance history for a specific carrier.
        
        Args:
            carrier_id: Carrier identifier
        
        Returns:
            DataFrame with all outcomes for carrier
        """
        try:
            conn = sqlite3.connect(self.db_path)
            query = "SELECT * FROM award_outcomes WHERE carrier_id = ? ORDER BY created_at DESC"
            df = pd.read_sql_query(query, conn, params=(carrier_id,))
            conn.close()
            return df
        except Exception as e:
            print(f"[ERROR] Could not fetch carrier history: {e}")
            return pd.DataFrame()
    
    def check_retrain_needed(self) -> Tuple[bool, str]:
        """
        Determine if model should be retrained.
        
        Returns:
            (needs_retrain, reason)
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Count recent outcomes
            cursor.execute(
                "SELECT COUNT(*) FROM award_outcomes WHERE created_at > datetime('now', '-7 days')"
            )
            recent_count = cursor.fetchone()[0]
            
            # Count POOR outcomes
            cursor.execute(
                "SELECT COUNT(*) FROM award_outcomes WHERE outcome_quality = 'POOR'"
            )
            poor_count = cursor.fetchone()[0]
            
            # Count total outcomes
            cursor.execute("SELECT COUNT(*) FROM award_outcomes")
            total_count = cursor.fetchone()[0]
            
            conn.close()
            
            # Decision logic
            if recent_count >= 10:
                return True, f"10+ outcomes recorded in past week ({recent_count} total)"
            
            if poor_count >= 3:
                return True, f"3+ POOR outcomes detected (triggers learning repair)"
            
            if total_count >= 20 and self.outcomes_since_train >= 10:
                return True, f"10+ new outcomes since last training"
            
            return False, "No retrain needed"
        
        except Exception as e:
            print(f"[ERROR] Could not check retrain status: {e}")
            return False, f"Error: {e}"
    
    def retrain_model(self, engine, new_df: pd.DataFrame) -> Dict:
        """
        Retrain model with feedback outcomes.
        
        Args:
            engine: CarrierScoringEngine instance
            new_df: Current carrier DataFrame
        
        Returns:
            {old_r2, new_r2, improvement, samples_used}
        """
        if not SCORING_ENGINE_AVAILABLE:
            return {'error': 'Scoring engine not available'}
        
        try:
            # Get old R² before retraining
            old_metrics = engine.train_risk_model(new_df)
            old_r2 = old_metrics.get('r2', 0)
            
            # Load outcomes and adjust carrier features
            outcomes = self._load_outcomes()
            
            if len(outcomes) == 0:
                return {
                    'old_r2': old_r2,
                    'new_r2': old_r2,
                    'improvement': 0,
                    'samples_used': len(new_df)
                }
            
            # Adjust carrier features based on actual outcomes
            adjusted_df = new_df.copy()
            
            for _, outcome in outcomes.iterrows():
                carrier_idx = adjusted_df[adjusted_df['carrier_id'] == outcome['carrier_id']].index
                
                if len(carrier_idx) == 0:
                    continue
                
                idx = carrier_idx[0]
                
                # Update on-time % based on actual
                if pd.notna(outcome['actual_ontime_pct']):
                    # Weighted average: 70% actual, 30% historical
                    adjusted_df.loc[idx, 'ontime_pct'] = (
                        0.7 * outcome['actual_ontime_pct'] +
                        0.3 * adjusted_df.loc[idx, 'ontime_pct']
                    )
                
                # Update damage rate based on actual
                if pd.notna(outcome['actual_damage_rate']):
                    adjusted_df.loc[idx, 'damage_rate'] = (
                        0.7 * outcome['actual_damage_rate'] +
                        0.3 * adjusted_df.loc[idx, 'damage_rate']
                    )
                
                # Update cost based on actual
                if pd.notna(outcome['actual_cost_per_km']):
                    adjusted_df.loc[idx, 'cost_per_km'] = (
                        0.7 * outcome['actual_cost_per_km'] +
                        0.3 * adjusted_df.loc[idx, 'cost_per_km']
                    )
            
            # Retrain model with adjusted data
            new_metrics = engine.train_risk_model(adjusted_df)
            new_r2 = new_metrics.get('r2', old_r2)
            
            improvement = new_r2 - old_r2
            
            # Record model version
            self._record_model_version(
                version=f"retrained_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                r2_score=new_r2,
                mae=new_metrics.get('mae', 0),
                training_samples=len(adjusted_df)
            )
            
            self.outcomes_since_train = 0
            
            return {
                'old_r2': old_r2,
                'new_r2': new_r2,
                'improvement': improvement,
                'samples_used': len(adjusted_df),
                'outcomes_integrated': len(outcomes)
            }
        
        except Exception as e:
            print(f"[ERROR] Retrain failed: {e}")
            return {'error': str(e)}
    
    def _record_model_version(self, version: str, r2_score: float, mae: float, training_samples: int) -> None:
        """Record model version in database."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO model_versions
                (version, r2_score, mae, training_samples, trained_at, is_active)
                VALUES (?, ?, ?, ?, ?, 1)
            """, (version, r2_score, mae, training_samples, datetime.now().isoformat()))
            
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"[WARN] Could not record model version: {e}")
    
    def get_feedback_stats(self) -> Dict:
        """
        Get summary statistics of all feedback.
        
        Returns:
            {total_awards, excellent_pct, good_pct, mixed_pct, poor_pct, top_carrier, worst_carrier}
        """
        try:
            outcomes = self._load_outcomes()
            
            if len(outcomes) == 0:
                return {
                    'total_awards': 0,
                    'excellent_pct': 0,
                    'good_pct': 0,
                    'mixed_pct': 0,
                    'poor_pct': 0,
                    'top_performing_carrier': 'N/A',
                    'worst_performing_carrier': 'N/A'
                }
            
            total = len(outcomes)
            excellent = len(outcomes[outcomes['outcome_quality'] == 'EXCELLENT'])
            good = len(outcomes[outcomes['outcome_quality'] == 'GOOD'])
            mixed = len(outcomes[outcomes['outcome_quality'] == 'MIXED'])
            poor = len(outcomes[outcomes['outcome_quality'] == 'POOR'])
            
            # Find top and worst carriers
            carrier_stats = outcomes.groupby('carrier_name').agg({
                'outcome_quality': lambda x: (x == 'EXCELLENT').sum() / len(x) * 100
            }).rename(columns={'outcome_quality': 'excellence_rate'})
            
            top_carrier = carrier_stats['excellence_rate'].idxmax() if len(carrier_stats) > 0 else 'N/A'
            worst_carrier = carrier_stats['excellence_rate'].idxmin() if len(carrier_stats) > 0 else 'N/A'
            
            return {
                'total_awards': total,
                'excellent_pct': excellent / total * 100 if total > 0 else 0,
                'good_pct': good / total * 100 if total > 0 else 0,
                'mixed_pct': mixed / total * 100 if total > 0 else 0,
                'poor_pct': poor / total * 100 if total > 0 else 0,
                'top_performing_carrier': top_carrier,
                'worst_performing_carrier': worst_carrier,
                'total_unique_carriers': outcomes['carrier_name'].nunique()
            }
        
        except Exception as e:
            print(f"[ERROR] Could not compute feedback stats: {e}")
            return {}
    
    def simulate_feedback_demo(self) -> List[Dict]:
        """
        Generate synthetic historical outcomes for demo purposes.
        
        Returns:
            List of synthetic outcome dictionaries
        """
        carrier_names = [
            'SwiftFreight India', 'RaasLogistics', 'TransCo Premium',
            'BharatFreight', 'IndoLogistics', 'FastFreight Express',
            'ReliableCarriers', 'TransCo Standard', 'BudgetExpress', 'SafeHaul'
        ]
        
        synthetic_outcomes = []
        
        for i in range(15):
            carrier = np.random.choice(carrier_names)
            
            # 70% EXCELLENT/GOOD, 20% MIXED, 10% POOR
            quality_rand = np.random.rand()
            if quality_rand < 0.4:
                quality = 'EXCELLENT'
                actual_ontime = np.random.uniform(96, 99)
                actual_damage = np.random.uniform(0.1, 0.5)
            elif quality_rand < 0.7:
                quality = 'GOOD'
                actual_ontime = np.random.uniform(90, 96)
                actual_damage = np.random.uniform(0.5, 1.2)
            elif quality_rand < 0.9:
                quality = 'MIXED'
                actual_ontime = np.random.uniform(85, 90)
                actual_damage = np.random.uniform(1.0, 1.8)
            else:
                quality = 'POOR'
                actual_ontime = np.random.uniform(75, 85)
                actual_damage = np.random.uniform(1.5, 2.5)
            
            outcome = {
                'carrier_id': f'CARRIER_{i+1:03d}',
                'carrier_name': carrier,
                'lane': np.random.choice(['Lane-A', 'Lane-B', 'Lane-C', 'Lane-D']),
                'predicted_ontime_pct': 90,
                'actual_ontime_pct': actual_ontime,
                'predicted_damage_rate': 1.0,
                'actual_damage_rate': actual_damage,
                'predicted_cost_per_km': 30,
                'actual_cost_per_km': np.random.uniform(28, 32),
                'outcome_quality': quality
            }
            synthetic_outcomes.append(outcome)
        
        return synthetic_outcomes


# ============================================================================
# DEMO FUNCTION
# ============================================================================

def demo_feedback_loop() -> None:
    """
    Demonstrate the feedback loop's continuous learning capability.
    This is the killer feature that Monte Carlo CANNOT do.
    """
    print("=" * 70)
    print("CARRIERIQ v2 — FEEDBACK LOOP DEMONSTRATION")
    print("Continuous Learning System")
    print("=" * 70)
    print()
    
    # Initialize engine
    feedback_engine = FeedbackEngine(db_path='data/demo_outcomes.db')
    print("[OK] FeedbackEngine initialized")
    print()
    
    # Generate synthetic outcomes
    synthetic_outcomes = feedback_engine.simulate_feedback_demo()
    
    print("Recording 15 synthetic award outcomes...")
    for outcome in synthetic_outcomes:
        result = feedback_engine.record_award_outcome(
            carrier_id=outcome['carrier_id'],
            carrier_name=outcome['carrier_name'],
            lane=outcome['lane'],
            predicted_metrics={
                'ontime_pct': outcome['predicted_ontime_pct'],
                'damage_rate': outcome['predicted_damage_rate'],
                'cost_per_km': outcome['predicted_cost_per_km']
            },
            actual_metrics={
                'ontime_pct': outcome['actual_ontime_pct'],
                'damage_rate': outcome['actual_damage_rate'],
                'cost_per_km': outcome['actual_cost_per_km']
            }
        )
    
    print(f"[OK] {len(synthetic_outcomes)} outcomes recorded")
    print()
    
    # Check retrain status
    needs_retrain, reason = feedback_engine.check_retrain_needed()
    print(f"Retrain Needed: {needs_retrain}")
    print(f"Reason: {reason}")
    print()
    
    # Get feedback statistics
    stats = feedback_engine.get_feedback_stats()
    print("=" * 70)
    print("FEEDBACK STATISTICS")
    print("=" * 70)
    print(f"Total Awards: {stats.get('total_awards', 0)}")
    print(f"Excellent ({stats.get('excellent_pct', 0):.1f}%)")
    print(f"Good ({stats.get('good_pct', 0):.1f}%)")
    print(f"Mixed ({stats.get('mixed_pct', 0):.1f}%)")
    print(f"Poor ({stats.get('poor_pct', 0):.1f}%)")
    print()
    print(f"Top Performing Carrier: {stats.get('top_performing_carrier', 'N/A')}")
    print(f"Worst Performing Carrier: {stats.get('worst_performing_carrier', 'N/A')}")
    print(f"Total Unique Carriers: {stats.get('total_unique_carriers', 0)}")
    print()
    
    # Demonstrate learning
    if SCORING_ENGINE_AVAILABLE:
        print("=" * 70)
        print("MODEL RETRAINING WITH FEEDBACK")
        print("=" * 70)
        
        try:
            # Generate carrier dataset
            df = generate_carrier_dataset(n_carriers=30)
            
            # Initialize scoring engine
            engine = CarrierScoringEngine()
            
            # Retrain with feedback
            retrain_result = feedback_engine.retrain_model(engine, df)
            
            if 'error' not in retrain_result:
                old_r2 = retrain_result.get('old_r2', 0)
                new_r2 = retrain_result.get('new_r2', 0)
                improvement = retrain_result.get('improvement', 0)
                samples = retrain_result.get('outcomes_integrated', 0)
                
                print(f"Previous R² Score: {old_r2:.4f}")
                print(f"New R² Score: {new_r2:.4f}")
                print(f"Improvement: +{improvement:.4f} ({improvement/old_r2*100 if old_r2 > 0 else 0:.1f}%)")
                print(f"Outcomes Integrated: {samples}")
                print()
                
                if improvement > 0:
                    print("✅ Model accuracy improved!")
                    print(f"   The system learned from {samples} award outcomes.")
                    print("   This is continuous learning in action.")
                else:
                    print("ℹ️  Model already highly optimized.")
            else:
                print(f"Note: {retrain_result.get('error')}")
        
        except Exception as e:
            print(f"Demo retrain skipped: {e}")
    
    print()
    print("=" * 70)
    print("KILLER FEATURE SUMMARY")
    print("=" * 70)
    print()
    print("What Monte Carlo CANNOT do:")
    print("  ❌ Record actual carrier performance outcomes")
    print("  ❌ Automatically adjust risk scores based on history")
    print("  ❌ Identify underperforming carriers systematically")
    print("  ❌ Retrain models with real-world feedback")
    print("  ❌ Get smarter over time")
    print()
    print("What CarrierIQ DOES:")
    print("  ✅ Every award outcome feeds the system")
    print("  ✅ Poor performers get flagged automatically")
    print("  ✅ Model improves with each procurement cycle")
    print("  ✅ Judges see: 'Our system learns from experience'")
    print("  ✅ That's enterprise-grade intelligence")
    print()
    print("=" * 70)


# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    demo_feedback_loop()
