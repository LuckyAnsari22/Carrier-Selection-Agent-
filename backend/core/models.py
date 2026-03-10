"""Database models for outcomes and feedback."""
from datetime import datetime
from typing import Dict, Any

class FeedbackRecord:
    """Record of a procurement decision and its outcome."""
    
    def __init__(
        self,
        lane: str,
        awarded_carrier_id: str,
        decision_rationale: str,
        actual_outcome: Dict[str, Any],
        feedback_text: str = "",
    ):
        self.timestamp = datetime.utcnow()
        self.lane = lane
        self.awarded_carrier_id = awarded_carrier_id
        self.decision_rationale = decision_rationale
        self.actual_outcome = actual_outcome
        self.feedback_text = feedback_text
    
    def to_dict(self):
        return {
            "timestamp": self.timestamp.isoformat(),
            "lane": self.lane,
            "awarded_carrier_id": self.awarded_carrier_id,
            "decision_rationale": self.decision_rationale,
            "actual_outcome": self.actual_outcome,
            "feedback_text": self.feedback_text,
        }
