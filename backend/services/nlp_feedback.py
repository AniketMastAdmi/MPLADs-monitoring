import re
import random
from datetime import datetime
from typing import Tuple
from sqlalchemy.orm import Session
from backend.models.models import Feedback, Project, RiskAssessment

CATEGORY_KEYWORDS = {
    "delay": ["delay", "late", "stalled", "stopped", "months", "years", "slow", "abandoned", "not started", "overdue"],
    "poor quality": ["quality", "crack", "peeling", "leakage", "substandard", "poor", "broken", "cement", "collapsed", "bad material"],
    "location issue": ["location", "wrong place", "gps", "not visible", "missing", "nowhere", "fake site", "untraceable"],
    "duplicate concern": ["duplicate", "already built", "twice", "another project", "existing", "repeated", "similar hall", "double bill"],
    "progress concern": ["progress", "incomplete", "half built", "only 40%", "board shows", "mismatch", "claim", "fake progress"],
    "expenditure concern": ["money", "funds", "crore", "lakh", "embezzlement", "bills", "paid", "contractor taken money", "expensive"]
}

def classify_feedback_nlp(text: str, user_category: str) -> Tuple[str, str]:
    """
    NLP keyword & sentiment heuristic triaging for citizen feedback.
    Returns: (ai_category, suggested_priority)
    """
    clean = text.lower()
    scores = {cat: 0 for cat in CATEGORY_KEYWORDS}

    for cat, keywords in CATEGORY_KEYWORDS.items():
        for kw in keywords:
            if re.search(r"\b" + re.escape(kw) + r"\b", clean):
                scores[cat] += 1

    best_cat = max(scores, key=scores.get)
    if scores[best_cat] == 0:
        # Fall back to user selected category mapping
        mapped = {
            "Work not started": "delay",
            "Work incomplete": "progress concern",
            "Poor quality": "poor quality",
            "Incorrect location": "location issue",
            "Potential duplicate work": "duplicate concern",
            "Incorrect progress": "progress concern",
            "Asset not visible": "location issue"
        }
        best_cat = mapped.get(user_category, "other")

    # Priority determination
    priority = "Normal"
    if any(w in clean for w in ["urgent", "danger", "hazard", "embezzlement", "fake", "collapse", "severe", "fraud"]):
        priority = "Urgent"
    elif any(w in clean for w in ["months ago", "abandoned", "twice", "zero work", "scam"]):
        priority = "High"

    return best_cat, priority

def submit_citizen_feedback(
    db: Session,
    project_id: str,
    issue_category: str,
    description: str,
    location: str = None,
    attachment_url: str = None,
    anonymous: bool = False
) -> Feedback:
    """
    Processes citizen feedback submission:
    - Generates standardized tracking ID: MPL-FB-2026-XXXXXX
    - Executes NLP triaging & priority rating
    - Updates project public concern score if feedback clusters exist
    """
    rand_num = random.randint(100000, 999999)
    feedback_id = f"MPL-FB-2026-{rand_num}"

    ai_cat, priority = classify_feedback_nlp(description, issue_category)

    fb = Feedback(
        feedback_id=feedback_id,
        project_id=project_id,
        issue_category=issue_category,
        description=description,
        location=location,
        attachment_url=attachment_url,
        anonymous=anonymous,
        status="Submitted",
        priority=priority,
        ai_category=ai_cat,
        created_at=datetime.utcnow()
    )
    db.add(fb)
    db.commit()

    # Check for cluster signal: Count total feedbacks for this project
    total_fb = db.query(Feedback).filter(Feedback.project_id == project_id).count()
    if total_fb >= 3:
        # Elevate risk assessment public concern score
        risk = db.query(RiskAssessment).filter(RiskAssessment.project_id == project_id).first()
        if risk:
            risk.public_concern_score = min(100.0, total_fb * 20.0)
            if risk.risk_score < 75.0 and total_fb >= 5:
                risk.risk_score = min(95.0, risk.risk_score + 15.0)
                risk.risk_level = "HIGH" if risk.risk_score < 85 else "CRITICAL"
            db.commit()

    return fb
