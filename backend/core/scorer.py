import numpy as np
import pickle
from pathlib import Path
from typing import List, Dict

try:
    import xgboost as xgb
    XGB_AVAILABLE = True
except ImportError:
    XGB_AVAILABLE = False

try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False

# Resolve model path relative to this file
_BASE_DIR = Path(__file__).resolve().parent.parent  # backend/

class CarrierScoringEngine:
    """XGBoost + TOPSIS + AHP scoring system."""
    
    FEATURE_COLS = [
        'otd_rate', 'damage_rate', 'capacity_utilization',
        'price_per_kg', 'avg_transit_days', 'claim_resolution_days',
        'invoice_accuracy', 'years_in_operation'
    ]
    
    FEATURE_DISPLAY = {
        'otd_rate': 'On-Time Delivery Rate',
        'damage_rate': 'Cargo Damage Rate',
        'capacity_utilization': 'Network Capacity Utilization',
        'price_per_kg': 'Cost Efficiency',
        'avg_transit_days': 'Transit Speed',
        'claim_resolution_days': 'Claims Responsiveness',
        'invoice_accuracy': 'Billing Accuracy',
        'years_in_operation': 'Operational Experience',
    }

    def __init__(self):
        """Initialize scoring engine, loading or training model."""
        model_path = _BASE_DIR / "models" / "xgb_delay_risk.pkl"
        if model_path.exists():
            with open(model_path, 'rb') as f:
                self.model = pickle.load(f)
        elif XGB_AVAILABLE:
            self.model = self._train_synthetic_model()
            self._save_model()
        else:
            self.model = None
            print("Warning: XGBoost not available, scoring engine disabled")
        
        self.explainer = None
        if SHAP_AVAILABLE and self.model is not None:
            try:
                self.explainer = shap.TreeExplainer(self.model)
            except Exception as e:
                print(f"Warning: SHAP explainer initialization failed: {e}")

    def _train_synthetic_model(self) -> xgb.XGBRegressor:
        """Train synthetic XGBoost model on generated data."""
        np.random.seed(42)
        n = 2000
        
        X = np.column_stack([
            np.random.beta(9, 1, n),           # otd_rate (skewed high)
            np.random.gamma(1, 0.005, n),      # damage_rate (skewed low)
            np.random.uniform(0.5, 0.95, n),   # capacity_utilization
            np.random.gamma(2, 1.5, n),        # price_per_kg
            np.random.randint(1, 8, n),        # avg_transit_days
            np.random.gamma(2, 2, n),          # claim_resolution_days
            np.random.beta(9, 1, n),           # invoice_accuracy
            np.random.randint(1, 30, n),       # years_in_operation
        ])
        
        # Delay risk formula
        y = (
            (1 - X[:, 0]) * 40 +               # Low OTD → high risk
            X[:, 1] * 1000 +                   # High damage → risk
            (X[:, 2] - 0.85).clip(0) * 60 +   # Overutilization → risk
            X[:, 4] * 3 +                      # Longer transit → risk
            X[:, 5] * 2 +                      # Slow claims → risk
            np.random.normal(0, 5, n)          # Noise
        ).clip(0, 100)
        
        model = xgb.XGBRegressor(
            n_estimators=300,
            max_depth=5,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            verbosity=0
        )
        model.fit(X, y, verbose=False)
        return model

    def _save_model(self):
        """Save trained model to disk."""
        models_dir = _BASE_DIR / "models"
        models_dir.mkdir(parents=True, exist_ok=True)
        with open(models_dir / "xgb_delay_risk.pkl", 'wb') as f:
            pickle.dump(self.model, f)

    def predict_risk(self, carriers: List[Dict]) -> List[Dict]:
        """Predict delay risk for carriers with SHAP explanations."""
        if not carriers:
            return []
        
        # Build feature matrix
        X = np.array([
            [c.get(f, 0.5) for f in self.FEATURE_COLS]
            for c in carriers
        ])
        
        # Predict
        risks = self.model.predict(X).clip(0, 100)
        
        # SHAP values if explainer available
        try:
            shap_values = self.explainer.shap_values(X)
        except Exception as e:
            print(f"SHAP calculation failed: {e}")
            shap_values = np.zeros_like(X)
        
        results = []
        for i, carrier in enumerate(carriers):
            shap_dict = {}
            if self.explainer:
                for j, feat in enumerate(self.FEATURE_COLS):
                    shap_dict[self.FEATURE_DISPLAY[feat]] = float(shap_values[i][j])
            
            results.append({
                **carrier,
                'delay_risk': float(risks[i]),
                'shap_values': shap_dict,
                'base_value': float(self.explainer.expected_value) if self.explainer else 0.0,
            })
        
        return results

    def ahp_weights(self, priorities: Dict[str, float]) -> np.ndarray:
        """Convert business priorities → AHP weights for each feature."""
        criteria_map = {
            'cost': [0, 0, 0, 1, 0, 0, 1, 0],
            'reliability': [1, 1, 0, 0, 0, 1, 0, 1],
            'speed': [0, 0, 0, 0, 1, 0, 0, 0],
            'quality': [0, 0, 1, 0, 0, 0, 0, 0],
        }
        
        weights = np.zeros(len(self.FEATURE_COLS))
        for criterion, weight in priorities.items():
            if criterion in criteria_map:
                mask = np.array(criteria_map[criterion], dtype=float)
                if mask.sum() > 0:
                    weights += weight * mask / mask.sum()
        
        total = weights.sum()
        if total > 0:
            weights = weights / total
        else:
            weights = np.ones(len(self.FEATURE_COLS)) / len(self.FEATURE_COLS)
        
        return weights

    def topsis_rank(self, carriers_with_risk: List[Dict], 
                    priorities: Dict[str, float]) -> List[Dict]:
        """Rank carriers using TOPSIS with weighted criteria."""
        if not carriers_with_risk:
            return []
        
        weights = self.ahp_weights(priorities)
        
        # Features where lower = better
        lower_is_better = {
            'damage_rate', 'capacity_utilization',
            'price_per_kg', 'avg_transit_days',
            'claim_resolution_days', 'delay_risk'
        }
        
        # Build decision matrix
        matrix = []
        for c in carriers_with_risk:
            row = []
            for feat in self.FEATURE_COLS:
                val = c.get(feat, 0.5)
                row.append(-val if feat in lower_is_better else val)
            row.append(-c.get('delay_risk', 50))
            matrix.append(row)
        
        matrix = np.array(matrix, dtype=float)
        
        # Normalize
        norms = np.sqrt((matrix ** 2).sum(axis=0))
        norms[norms == 0] = 1
        normalized = matrix / norms
        
        # Extend weights for risk column
        w = np.append(weights, 0.15)
        weighted = normalized * w
        
        # Ideal solutions
        ideal_best = weighted.max(axis=0)
        ideal_worst = weighted.min(axis=0)
        
        # Distances
        d_best = np.sqrt(((weighted - ideal_best) ** 2).sum(axis=1))
        d_worst = np.sqrt(((weighted - ideal_worst) ** 2).sum(axis=1))
        
        # TOPSIS scores
        scores = d_worst / (d_best + d_worst + 1e-10)
        
        # Attach scores
        for i, carrier in enumerate(carriers_with_risk):
            carrier['topsis_score'] = float(scores[i])
            carrier['score_pct'] = round(float(scores[i]) * 100, 1)
        
        # Rank
        ranked = sorted(
            carriers_with_risk,
            key=lambda x: x['topsis_score'],
            reverse=True
        )
        
        for rank, carrier in enumerate(ranked, 1):
            carrier['rank'] = rank
        
        return ranked
