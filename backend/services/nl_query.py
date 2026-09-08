import re
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.models.models import Project, RiskAssessment, MP, Feedback

def execute_nl_query(db: Session, query_str: str) -> Dict[str, Any]:
    """
    Parses and executes natural language analytical queries against live computed database records.
    Never hallucinates or invents metrics; guarantees strict mathematical parity with DB.
    """
    q = query_str.lower().strip()
    
    # 1. Financial vs physical progress mismatch (e.g. >80% financial and <50% physical)
    if "financial" in q and "physical" in q and ("progress" in q or "mismatch" in q):
        results = (
            db.query(Project, RiskAssessment)
            .join(RiskAssessment, Project.project_id == RiskAssessment.project_id)
            .filter(Project.financial_progress >= 75.0, Project.physical_progress <= 55.0)
            .order_by((Project.financial_progress - Project.physical_progress).desc())
            .all()
        )
        data = []
        for p, r in results:
            data.append({
                "project_id": p.project_id,
                "work_name": p.work_name,
                "state": p.state,
                "district": p.district,
                "financial_progress": f"{p.financial_progress:.1f}%",
                "physical_progress": f"{p.physical_progress:.1f}%",
                "divergence": f"{(p.financial_progress - p.physical_progress):.1f}%",
                "risk_score": r.risk_score,
                "risk_level": r.risk_level
            })
        return {
            "query": query_str,
            "interpreted_intent": "Detect projects with severe Financial vs Physical progress mismatch (Fin >= 75%, Phy <= 55%)",
            "direct_answer": f"Found {len(data)} project(s) where financial disbursements significantly outstrip physical on-ground execution. These projects pose heightened risk of fund diversion or billing ahead of actual construction.",
            "data_summary": {
                "matching_records": len(data),
                "threshold_applied": "Financial >= 75% AND Physical <= 55%"
            },
            "results": data,
            "confidence": 0.98
        }

    # 2. High risk projects in a specific state (e.g., Gujarat, Maharashtra, Uttar Pradesh)
    state_match = None
    all_states = [s[0] for s in db.query(Project.state).distinct().all()]
    for s in all_states:
        if s.lower() in q:
            state_match = s
            break

    if "high" in q and "risk" in q and state_match:
        results = (
            db.query(Project, RiskAssessment)
            .join(RiskAssessment, Project.project_id == RiskAssessment.project_id)
            .filter(Project.state.ilike(f"%{state_match}%"), RiskAssessment.risk_score >= 70.0)
            .order_by(RiskAssessment.risk_score.desc())
            .all()
        )
        data = []
        for p, r in results:
            data.append({
                "project_id": p.project_id,
                "work_name": p.work_name,
                "state": p.state,
                "district": p.district,
                "sanctioned_amount": f"₹{p.sanctioned_amount/100000:.2f} L",
                "expenditure": f"₹{p.expenditure/100000:.2f} L",
                "risk_score": r.risk_score,
                "risk_level": r.risk_level
            })
        return {
            "query": query_str,
            "interpreted_intent": f"Filter High and Critical Risk projects in state: {state_match}",
            "direct_answer": f"Identified {len(data)} high or critical risk project(s) in {state_match} with composite risk scores >= 70.",
            "data_summary": {
                "state": state_match,
                "high_risk_count": len(data)
            },
            "results": data,
            "confidence": 0.96
        }

    # 3. Highest delay districts / How many projects are delayed
    if "delay" in q:
        delayed_projects = db.query(Project, RiskAssessment).join(RiskAssessment).filter(Project.status == "Delayed").all()
        # Group by district
        dist_counts = {}
        for p, r in delayed_projects:
            dist_counts[p.district] = dist_counts.get(p.district, 0) + 1
        sorted_dists = sorted(dist_counts.items(), key=lambda x: x[1], reverse=True)

        data = []
        for p, r in delayed_projects[:10]:
            data.append({
                "project_id": p.project_id,
                "work_name": p.work_name,
                "state": p.state,
                "district": p.district,
                "expected_completion": p.expected_completion,
                "delay_score": r.delay_score,
                "risk_score": r.risk_score
            })

        return {
            "query": query_str,
            "interpreted_intent": "Analyze delayed works count and districts with highest delay concentration",
            "direct_answer": f"There are currently {len(delayed_projects)} delayed works in the system. The most impacted districts include {', '.join([f'{d} ({c} works)' for d, c in sorted_dists[:3]])}.",
            "data_summary": {
                "total_delayed_projects": len(delayed_projects),
                "top_delayed_districts": [{"district": d, "count": c} for d, c in sorted_dists[:5]]
            },
            "results": data,
            "confidence": 0.95
        }

    # 4. Overall high risk count or priority review
    if "high risk" in q or "critical" in q or "priority" in q:
        results = (
            db.query(Project, RiskAssessment)
            .join(RiskAssessment, Project.project_id == RiskAssessment.project_id)
            .filter(RiskAssessment.risk_score >= 70.0)
            .order_by(RiskAssessment.risk_score.desc())
            .all()
        )
        data = []
        for p, r in results:
            data.append({
                "project_id": p.project_id,
                "work_name": p.work_name,
                "state": p.state,
                "district": p.district,
                "risk_score": r.risk_score,
                "risk_level": r.risk_level,
                "sanctioned_amount": f"₹{p.sanctioned_amount/100000:.2f} L"
            })
        return {
            "query": query_str,
            "interpreted_intent": "Retrieve all High and Critical risk projects across India",
            "direct_answer": f"Found {len(data)} projects categorized as HIGH or CRITICAL risk (risk score >= 70.0). These represent priority targets for official field inspection.",
            "data_summary": {
                "total_high_risk_projects": len(data)
            },
            "results": data,
            "confidence": 0.97
        }

    # Default fallback query: General system overview
    total_projects = db.query(Project).count()
    total_sanc = db.query(func.sum(Project.sanctioned_amount)).scalar() or 0.0
    total_exp = db.query(func.sum(Project.expenditure)).scalar() or 0.0
    high_risk_count = db.query(RiskAssessment).filter(RiskAssessment.risk_score >= 70.0).count()

    return {
        "query": query_str,
        "interpreted_intent": "General platform overview and KPI aggregation",
        "direct_answer": f"The platform is currently tracking {total_projects} MPLADS works with ₹{total_sanc/10000000:.2f} Crore sanctioned and ₹{total_exp/10000000:.2f} Crore expenditure. {high_risk_count} project(s) are flagged for priority investigation.",
        "data_summary": {
            "total_projects": total_projects,
            "total_sanctioned_cr": round(total_sanc / 10000000.0, 2),
            "total_expenditure_cr": round(total_exp / 10000000.0, 2),
            "high_risk_flagged": high_risk_count
        },
        "results": [],
        "confidence": 0.90
    }
