import json
from datetime import datetime, timedelta
from typing import List
from sqlalchemy.orm import Session
from backend.models.models import (
    Project, Payment, ProgressUpdate, RiskAssessment, Feedback, MP,
    Investigation, InvestigationEvidence, RiskHistory, AuditLog
)
from backend.ml.risk_engine import risk_engine

def map_sdg_and_category(work_type: str) -> tuple[str, str]:
    w = work_type.lower()
    if "water" in w or "jal" in w or "borewell" in w:
        return "SDG 6: Clean Water & Sanitation", "Drinking Water"
    elif "school" in w or "education" in w or "library" in w or "classroom" in w:
        return "SDG 4: Quality Education", "Education"
    elif "health" in w or "dispensary" in w or "clinic" in w or "hospital" in w:
        return "SDG 3: Good Health & Well-Being", "Healthcare"
    elif "solar" in w or "energy" in w or "lighting" in w:
        return "SDG 7: Affordable & Clean Energy", "Renewable Energy"
    elif "road" in w or "bridge" in w or "culvert" in w or "drainage" in w:
        return "SDG 9: Industry, Innovation & Infrastructure", "Connectivity"
    elif "sanitation" in w or "toilet" in w or "waste" in w:
        return "SDG 6: Clean Water & Sanitation", "Sanitation"
    else:
        return "SDG 11: Sustainable Cities & Communities", "Community Infrastructure"


def generate_demo_dataset(db: Session):
    """
    Generates realistic, production-grade demonstration project records linked to normalized MPs.
    Strictly labeled 'Demonstration Dataset', is_demo=True.
    Includes:
    - Provenance metadata
    - The Flagship Golden Demo project (Critical Risk 91/100, Varanasi)
    - 6-Point Risk History Trend (April 22 -> Sept 91)
    - Full 9-Stage Human-in-the-Loop Investigation Workflow Cases
    - Geo-tagged Field Verification evidence with GPS discrepancy & photos
    - Public Concern Clusters with anti-spam safeguards
    - Peer-group cost benchmarking metrics
    """
    # Clean existing simulation data
    db.query(InvestigationEvidence).delete()
    db.query(Investigation).delete()
    db.query(RiskHistory).delete()
    db.query(Feedback).delete()
    db.query(RiskAssessment).delete()
    db.query(ProgressUpdate).delete()
    db.query(Payment).delete()
    db.query(Project).delete()
    db.commit()

    # Query real MPs for realistic linkages
    mps = db.query(MP).all()
    if not mps:
        print("Warning: No MPs in database. Generating fallback linkage.")
        return

    def find_mp(state_name: str, const_name: str = None):
        for mp in mps:
            if state_name.lower() in mp.state.lower():
                if const_name and mp.constituency and const_name.lower() in mp.constituency.lower():
                    return mp
                if not const_name:
                    return mp
        return mps[0]

    # ==========================================
    # 1. FLAGSHIP GOLDEN DEMO PROJECT (Varanasi)
    # ==========================================
    golden_mp = find_mp("Uttar Pradesh", "Varanasi") or mps[0]
    golden_sdg, golden_cat = map_sdg_and_category("Community Infrastructure")
    
    golden_proj = Project(
        project_id="MPLAD-UP-2023-GOLDEN-01",
        work_name="Community Facility Development — Demonstration District",
        mp_id=golden_mp.id,
        state=golden_mp.state,
        constituency=golden_mp.constituency or "Varanasi",
        district="Varanasi",
        location="Ward 14, Sevapuri Block",
        latitude=25.3176,
        longitude=82.9739,
        work_type="Community Infrastructure",
        work_category=golden_cat,
        sdg_goal=golden_sdg,
        sanctioned_amount=1850000.0, # ₹18.5 lakh
        estimated_cost=1850000.0,
        revised_cost=2480000.0,     # ₹24.8 lakh (+34% overrun)
        expenditure=2480000.0,
        financial_progress=89.0,    # 89% financial
        physical_progress=51.0,     # 51% physical (38% mismatch!)
        sanction_date="2023-06-12",
        start_date="2023-07-20",
        expected_completion="2024-04-30", # Overdue by 128 days
        completion_date=None,
        implementing_agency="District Rural Development Agency (DRDA)",
        status="Delayed",
        source="Demonstration Dataset",
        source_name="Demonstration Simulation Store (SIH Problem Statement Demo)",
        source_url="https://mplads.gov.in",
        source_record_id="DEMO-REC-UP-VAR-001",
        data_version="v2026.1-Demo",
        ingestion_batch_id="BATCH-DEMO-SIM-01",
        is_demo=True
    )
    db.add(golden_proj)
    db.flush()

    # Golden Project Payments (showing payment concentration anomaly)
    payments_data = [
        ("PAY-GLD-001", "2023-08-01", 370000.0, "M/s Purvanchal Buildcon", "Mobilization Advance (20%)"),
        ("PAY-GLD-002", "2023-11-15", 740000.0, "M/s Purvanchal Buildcon", "Milestone 1 - Foundation & Plinth (40%)"),
        ("PAY-GLD-003", "2024-03-10", 1370000.0, "M/s Purvanchal Buildcon", "Milestone 2 - Structural Superstructure (Concentrated Final Claim)")
    ]
    for pid, pdate, pamt, pven, pstage in payments_data:
        db.add(Payment(
            payment_id=pid,
            project_id=golden_proj.project_id,
            payment_date=pdate,
            amount=pamt,
            vendor_reference=pven,
            payment_stage=pstage
        ))

    # Golden Project Progress updates
    prog_updates = [
        ("2023-09-15", 25.0, 20.0, "Site excavation and foundation concrete laid."),
        ("2023-12-01", 42.0, 60.0, "Plinth beams completed; brickwork commenced."),
        ("2024-03-20", 51.0, 89.0, "Roof slab casting partially completed. Stoppage due to material disputes.")
    ]
    for udate, uphs, ufin, urem in prog_updates:
        db.add(ProgressUpdate(
            project_id=golden_proj.project_id,
            date=udate,
            physical_progress=uphs,
            financial_progress=ufin,
            remarks=urem
        ))

    # Golden Project Risk Assessment (Score 91 - CRITICAL)
    golden_explanations = [
        "Financial progress (89.0%) is significantly ahead of physical progress (51.0%) by 38.0 percentage points.",
        "Expenditure (₹24.8 Lakh) substantially exceeds the sanctioned amount (₹18.5 Lakh) resulting in a +34.05% cost overrun.",
        "Project is 128 days past its expected completion timeline (30 April 2024).",
        "Payment concentration anomaly detected: 55.2% of total funds released in single tranche without corresponding milestone verification.",
        "Potential similar duplicate work identified nearby within 1.8km: 'Construction of Multipurpose Community Centre' (92% semantic match)."
    ]
    golden_actions = [
        "Verify expenditure records and contractor measurement books (MB).",
        "Review technical sanction and justification for revised cost estimate.",
        "Verify physical milestone progress through field inspection.",
        "Inspect vendor payment vouchers and bank realization timestamps.",
        "Conduct geospatial field verification to ensure non-duplication with nearby community assets."
    ]
    golden_priority_breakdown = {
        "risk_component": 91.0,
        "financial_exposure": "High",
        "financial_exposure_score": 80.0,
        "public_impact": "High",
        "public_impact_score": 75.0,
        "urgency": "High",
        "urgency_score": 85.0,
        "public_concern_score": 78.0,
        "explanation": "Ranked #1 Priority: Critical composite risk (91/100), 38% progress divergence, and 128 days calendar delay on essential civic facility."
    }
    golden_early_warning = [
        "Disbursement velocity significantly exceeds civil completion rate (gap: 38.0%).",
        "Overdue by 128 days with physical completion stalled at 51%.",
        "Recommended Action: Freeze next milestone tranche pending physical joint verification."
    ]

    db.add(RiskAssessment(
        project_id=golden_proj.project_id,
        risk_score=91.0,
        risk_level="CRITICAL",
        anomaly_score=88.5,
        delay_score=90.0,
        cost_overrun_score=85.0,
        duplicate_score=92.0,
        payment_anomaly_score=84.0,
        progress_mismatch_score=95.0,
        public_concern_score=78.0,
        peer_median_cost=1850000.0,
        peer_avg_cost=1920000.0,
        peer_p90_cost=2200000.0,
        peer_deviation_pct=34.1,
        peer_anomaly_level="High",
        priority_score=88.5,
        priority_breakdown=json.dumps(golden_priority_breakdown),
        early_warning_level="Critical",
        early_warning_signals=json.dumps(golden_early_warning),
        confidence=0.91,
        explanation=json.dumps(golden_explanations),
        recommended_actions=json.dumps(golden_actions),
        similar_project_id="MPLAD-UP-2023-SIM-02",
        similar_project_name="Construction of Multipurpose Community Centre — Sevapuri",
        similarity_percentage=92.0,
        similarity_distance_km=1.8,
        similarity_cost_pct=87.3,
        similarity_time_gap_months=4.0,
        similarity_risk_level="HIGH"
    ))

    # Phase 10: 6-Point Risk History Trend for Golden Demo Project
    # "April: 22 -> May: 31 -> June: 47 -> July: 68 -> August: 84 -> September: 91"
    risk_history_points = [
        ("2024-04-15", 22.0, 20.0, 25.0, 370000.0, "LOW", "Baseline Sanction Audit"),
        ("2024-05-20", 31.0, 35.0, 32.0, 650000.0, "MODERATE", "Periodic Milestone Scan"),
        ("2024-06-30", 47.0, 55.0, 40.0, 1020000.0, "MODERATE", "Tranche Release Review"),
        ("2024-07-25", 68.0, 75.0, 46.0, 1480000.0, "ELEVATED", "Progress Divergence Warning (+29%)"),
        ("2024-08-20", 84.0, 82.0, 49.0, 1850000.0, "HIGH", "Calendar Overdue Trigger (>90 days)"),
        ("2024-09-08", 91.0, 89.0, 51.0, 2480000.0, "CRITICAL", "Citizen Grievance Spike & Duplicate Nearby Flag")
    ]
    for rdate, rscore, rfin, rphy, rexp, rlvl, revt in risk_history_points:
        db.add(RiskHistory(
            project_id=golden_proj.project_id,
            recorded_at=rdate,
            risk_score=rscore,
            financial_progress=rfin,
            physical_progress=rphy,
            expenditure=rexp,
            risk_level=rlvl,
            trigger_event=revt
        ))

    # Phase 5: Investigation Case for Golden Demo
    golden_inv = Investigation(
        investigation_id="INV-UP-2024-001",
        project_id=golden_proj.project_id,
        risk_level="CRITICAL",
        risk_score=91.0,
        priority_score=88.5,
        reason_for_flag="Financial progress (89%) significantly exceeds physical progress (51%) by 38%, accompanied by 34% cost overrun and semantic duplicate within 1.8km.",
        assigned_officer="Er. Rajesh Kumar",
        assigned_officer_role="District Nodal Officer (Varanasi)",
        assigned_by="District Magistrate / Collector",
        created_date=datetime.utcnow() - timedelta(days=14),
        due_date="2026-09-30",
        current_status="Under Verification",
        officer_notes="Notice served to M/s Purvanchal Buildcon. Joint inspection team constituted with DRDA Executive Engineer.",
        findings="Substructure partially completed. Foundation beam crack observed in Block B. Physical progress verified at 51.0% vs billed claim of 89.0%.",
        corrective_action="Recovery notice issued for ₹6,30,000 unverified advance. Third-party structural integrity audit ordered.",
        is_demo=True
    )
    db.add(golden_inv)
    db.flush()

    # Phase 6 & Phase 14: Geo-tagged Field Verification Evidence
    db.add(InvestigationEvidence(
        investigation_id=golden_inv.investigation_id,
        project_id=golden_proj.project_id,
        evidence_type="Site Photograph",
        file_name="varanasi_community_hall_foundation.jpg",
        file_url="https://images.unsplash.com/photo-1541888946425-d0fbb186156a?auto=format&fit=crop&w=800&q=80",
        file_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        expected_latitude=25.3176,
        expected_longitude=82.9739,
        observed_latitude=25.3182,
        observed_longitude=82.9744,
        distance_difference_meters=82.5,
        gps_timestamp=datetime.utcnow() - timedelta(days=3),
        uploaded_by="Er. Rajesh Kumar",
        uploaded_by_role="District Nodal Officer",
        uploaded_at=datetime.utcnow() - timedelta(days=3),
        notes="On-ground site inspection photograph taken with handheld GPS camera. Plinth beam exposed, roof incomplete.",
        visual_assessment="Superstructure Incomplete (51% progress observed)",
        visual_mismatch_flag=True
    ))

    db.add(InvestigationEvidence(
        investigation_id=golden_inv.investigation_id,
        project_id=golden_proj.project_id,
        evidence_type="Measurement Sheet",
        file_name="MB_Record_Sevapuri_Ward14.pdf",
        file_url="/evidence/mb_sevapuri_ward14.pdf",
        file_hash="a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
        uploaded_by="Shri S. K. Verma",
        uploaded_by_role="Assistant Engineer, DRDA",
        uploaded_at=datetime.utcnow() - timedelta(days=5),
        notes="Official Measurement Book entries for Milestone 1 & 2 cross-checked against billing records.",
        visual_assessment="Indeterminate (Documentary Audit)",
        visual_mismatch_flag=False
    ))

    # Phase 11: Golden Project Citizen Feedback (Public Concern Cluster)
    feedbacks_data = [
        ("MPL-FB-2026-000101", "Incomplete Work", "Work has been abandoned since March 2024. Only pillars have been erected; no laborers visible on site for 5 months.", "High", "Under Review"),
        ("MPL-FB-2026-000102", "Delay", "Scheduled completion date was April 2024. Construction is completely stalled while public funds appear to be exhausted.", "Urgent", "Action Initiated"),
        ("MPL-FB-2026-000103", "Poor Construction Quality", "Exposed iron rebar rusting in monsoon rains. Foundation concrete showing visible cracks.", "Normal", "Under Review"),
        ("MPL-FB-2026-000104", "Duplicate Project Allegation", "A similar Panchayat Bhavan building was constructed merely 2 kilometers away in 2022. Why was a second community hall sanctioned?", "High", "Under Review")
    ]
    for fid, fcat, fdesc, fpri, fstat in feedbacks_data:
        db.add(Feedback(
            feedback_id=fid,
            project_id=golden_proj.project_id,
            issue_category=fcat,
            description=fdesc,
            location="Ward 14, Sevapuri Block, Varanasi",
            attachment_url=None,
            anonymous=False,
            status=fstat,
            priority=fpri,
            ai_category=fcat,
            reporter_ip_hash="d8578edf8458ce06fbc5bb76a58c5ca4"
        ))

    # Audit Logs for Golden Project Lifecycle (Phase 9 & 21)
    audit_events = [
        ("System AI Risk Engine", "MINISTRY / SUPER ADMIN", "AI_FLAGGED_CRITICAL", golden_proj.project_id, "INV-UP-2024-001", "Composite risk score reached 91/100 (CRITICAL). Automated triage alert issued."),
        ("District Collector Office", "STATE ADMIN / NODAL OFFICER", "INVESTIGATION_ASSIGNED", golden_proj.project_id, "INV-UP-2024-001", "Assigned investigation to Er. Rajesh Kumar (District Nodal Officer)."),
        ("Er. Rajesh Kumar", "DISTRICT OFFICER", "EVIDENCE_UPLOAD", golden_proj.project_id, "INV-UP-2024-001", "Uploaded geotagged site inspection photo and Measurement Book audit."),
        ("Er. Rajesh Kumar", "DISTRICT OFFICER", "FINDING_RECORDED", golden_proj.project_id, "INV-UP-2024-001", "Recorded finding: 51% actual progress vs 89% billed expenditure. Notice served.")
    ]
    for a_actor, a_role, a_act, a_rec, a_inv, a_det in audit_events:
        db.add(AuditLog(
            actor=a_actor,
            role=a_role,
            action=a_act,
            record_id=a_rec,
            investigation_id=a_inv,
            details=a_det,
            timestamp=datetime.utcnow() - timedelta(days=2)
        ))

    # ========================================================
    # 2. NEARBY SIMILAR WORK (Demonstrating Multi-Signal Duplicates)
    # ========================================================
    nearby_proj = Project(
        project_id="MPLAD-UP-2023-SIM-02",
        work_name="Construction of Multipurpose Community Centre — Sevapuri",
        mp_id=golden_mp.id,
        state=golden_mp.state,
        constituency=golden_mp.constituency or "Varanasi",
        district="Varanasi",
        location="Village Chhatarwar, Sevapuri Block",
        latitude=25.3240,
        longitude=82.9860,
        work_type="Community Infrastructure",
        work_category="Community Infrastructure",
        sdg_goal="SDG 11: Sustainable Cities & Communities",
        sanctioned_amount=2120000.0,
        estimated_cost=2120000.0,
        revised_cost=2120000.0,
        expenditure=1800000.0,
        financial_progress=84.9,
        physical_progress=85.0,
        sanction_date="2023-02-10",
        start_date="2023-03-01",
        expected_completion="2024-01-15",
        completion_date="2024-01-20",
        implementing_agency="Public Works Department (PWD)",
        status="Completed",
        source="Demonstration Dataset",
        source_name="Demonstration Simulation Store (SIH Problem Statement Demo)",
        source_url="https://mplads.gov.in",
        source_record_id="DEMO-REC-UP-VAR-002",
        data_version="v2026.1-Demo",
        ingestion_batch_id="BATCH-DEMO-SIM-01",
        is_demo=True
    )
    db.add(nearby_proj)
    db.flush()

    db.add(RiskAssessment(
        project_id=nearby_proj.project_id,
        risk_score=24.0,
        risk_level="LOW",
        anomaly_score=15.0,
        delay_score=5.0,
        cost_overrun_score=0.0,
        duplicate_score=45.0,
        payment_anomaly_score=10.0,
        progress_mismatch_score=0.0,
        public_concern_score=5.0,
        peer_median_cost=1850000.0,
        peer_avg_cost=1920000.0,
        peer_p90_cost=2200000.0,
        peer_deviation_pct=14.6,
        peer_anomaly_level="Normal",
        priority_score=35.0,
        priority_breakdown=json.dumps({"explanation": "Completed work with verified civil milestones."}),
        early_warning_level="Informational",
        early_warning_signals=json.dumps(["Asset completed and handed over."]),
        confidence=0.92,
        explanation=json.dumps(["Project completed within budget and verified by PWD inspection."]),
        recommended_actions=json.dumps(["Standard asset tagging in GIS inventory."]),
        similar_project_id=golden_proj.project_id,
        similar_project_name=golden_proj.work_name,
        similarity_percentage=92.0,
        similarity_distance_km=1.8,
        similarity_cost_pct=87.3,
        similarity_time_gap_months=4.0,
        similarity_risk_level="HIGH"
    ))

    # ========================================================
    # 3. DIVERSE DEMO PROJECTS ACROSS INDIA (SDGs, Categories, States)
    # ========================================================
    demo_scenarios = [
        ("Drinking Water Installation (RO Plant)", "Gujarat", "Ahmedabad", 1200000.0, 1680000.0, 1680000.0, 100.0, 45.0, "Delayed", True, "Cost Escalation & Stalled Filter Installation"),
        ("Construction of Secondary School Science Lab", "Maharashtra", "Pune", 2500000.0, 2500000.0, 2450000.0, 98.0, 98.0, "Completed", False, "Normal Compliant Project"),
        ("Primary Health Sub-Centre Renovation", "Bihar", "Patna", 1500000.0, 1500000.0, 1200000.0, 80.0, 35.0, "In Progress", True, "Progress Divergence & Delay"),
        ("Rural Connectivity Road & Paver Block Work", "Rajasthan", "Jaipur", 3500000.0, 3500000.0, 3100000.0, 88.5, 90.0, "Completed", False, "Normal Compliant Road"),
        ("High-Mast Solar Lighting Array", "Tamil Nadu", "Chennai", 850000.0, 850000.0, 800000.0, 94.1, 95.0, "Completed", False, "Normal Renewable Energy Work"),
        ("Sanitation Complex & Bio-Toilet Block", "Madhya Pradesh", "Bhopal", 1100000.0, 1450000.0, 1450000.0, 100.0, 50.0, "Delayed", True, "Cost Overrun & Delay Anomaly"),
        ("Panchayat Community Hall Construction", "West Bengal", "Kolkata", 1800000.0, 1800000.0, 1350000.0, 75.0, 75.0, "In Progress", False, "Standard Progress"),
        ("Anganwadi Centre Building Construction", "Karnataka", "Bengaluru", 1400000.0, 1400000.0, 1400000.0, 100.0, 100.0, "Completed", False, "Completed Asset"),
        ("Veterinary Dispensary Facility Extension", "Punjab", "Ludhiana", 950000.0, 950000.0, 850000.0, 89.4, 40.0, "Delayed", True, "Progress Mismatch (89% vs 40%)"),
        ("Public Library Digital Centre", "Kerala", "Thiruvananthapuram", 1600000.0, 1600000.0, 1500000.0, 93.7, 95.0, "Completed", False, "Exemplary Completion"),
        ("Drainage & Flood Mitigation Culvert", "Assam", "Guwahati", 2200000.0, 2200000.0, 1980000.0, 90.0, 48.0, "Delayed", True, "Monsoon Washout & Progress Lag"),
        ("Open Gymnasium & Sports Equipment Installation", "Delhi", "New Delhi", 750000.0, 750000.0, 750000.0, 100.0, 100.0, "Completed", False, "Completed Urban Fitness Work")
    ]

    for idx, (wname, st_name, dist_name, sanc, rev, exp, fin_p, phy_p, stat, is_high, note) in enumerate(demo_scenarios, start=3):
        mp_obj = find_mp(st_name, dist_name) or mps[idx % len(mps)]
        sdg_label, cat_label = map_sdg_and_category(wname)
        
        pid = f"MPLAD-{st_name[:2].upper()}-2023-{idx:03d}"
        proj = Project(
            project_id=pid,
            work_name=f"{wname} — {dist_name}",
            mp_id=mp_obj.id,
            state=st_name,
            constituency=dist_name,
            district=dist_name,
            location=f"Sector {idx}, {dist_name} Municipal Division",
            latitude=22.0 + (idx * 0.7) % 6.0,
            longitude=75.0 + (idx * 0.9) % 12.0,
            work_type=wname.split("(")[0].strip(),
            work_category=cat_label,
            sdg_goal=sdg_label,
            sanctioned_amount=sanc,
            estimated_cost=sanc,
            revised_cost=rev,
            expenditure=exp,
            financial_progress=fin_p,
            physical_progress=phy_p,
            sanction_date="2023-05-15",
            start_date="2023-06-20",
            expected_completion="2024-03-31",
            completion_date="2024-04-10" if stat == "Completed" else None,
            implementing_agency="District Rural Development Agency (DRDA)" if idx % 2 == 0 else "Public Works Department",
            status=stat,
            source="Demonstration Dataset",
            source_name="Demonstration Simulation Store (SIH Problem Statement Demo)",
            source_url="https://mplads.gov.in",
            source_record_id=f"DEMO-REC-{idx:03d}",
            data_version="v2026.1-Demo",
            ingestion_batch_id="BATCH-DEMO-SIM-01",
            is_demo=True
        )
        db.add(proj)
        db.flush()

        # Payments
        db.add(Payment(
            payment_id=f"PAY-{idx:03d}-01",
            project_id=proj.project_id,
            payment_date="2023-07-10",
            amount=round(exp * 0.5, 2),
            vendor_reference=f"M/s {st_name} Infrastructure Ltd",
            payment_stage="Milestone 1 Disbursement"
        ))
        if exp > exp * 0.5:
            db.add(Payment(
                payment_id=f"PAY-{idx:03d}-02",
                project_id=proj.project_id,
                payment_date="2023-11-20",
                amount=round(exp * 0.5, 2),
                vendor_reference=f"M/s {st_name} Infrastructure Ltd",
                payment_stage="Milestone 2 Disbursement"
            ))

        # Progress update
        db.add(ProgressUpdate(
            project_id=proj.project_id,
            date="2023-12-15",
            physical_progress=phy_p,
            financial_progress=fin_p,
            remarks=note
        ))

        # Risk Assessment
        if is_high:
            r_score = round(72.0 + (idx % 12), 1)
            r_lvl = "CRITICAL" if r_score >= 85 else "HIGH"
            gap = fin_p - phy_p
            r_exp = [
                f"Financial disbursement ({fin_p:.1f}%) significantly exceeds physical progress ({phy_p:.1f}%) by {gap:.1f}%.",
                f"Cost revised by +{((rev - sanc)/sanc)*100:.1f}% over original sanctioned allocation."
            ]
            r_act = ["Issue notice to DRDA nodal engineer.", "Conduct spot field inspection."]
            ew_lvl = "High"
            ew_sigs = [f"Milestone mismatch gap of {gap:.1f}% requires technical review."]
        else:
            r_score = round(15.0 + (idx % 15), 1)
            r_lvl = "LOW"
            r_exp = ["Work proceeding within approved technical and financial milestones."]
            r_act = ["Maintain standard post-completion asset register."]
            ew_lvl = "Informational"
            ew_sigs = ["Progress metrics align with standard operating timeline."]

        db.add(RiskAssessment(
            project_id=proj.project_id,
            risk_score=r_score,
            risk_level=r_lvl,
            anomaly_score=r_score * 0.9,
            delay_score=70.0 if stat == "Delayed" else 10.0,
            cost_overrun_score=40.0 if rev > sanc else 0.0,
            duplicate_score=10.0,
            payment_anomaly_score=65.0 if is_high else 10.0,
            progress_mismatch_score=max(0.0, fin_p - phy_p),
            public_concern_score=40.0 if is_high else 5.0,
            peer_median_cost=sanc,
            peer_avg_cost=sanc * 1.05,
            peer_p90_cost=sanc * 1.25,
            peer_deviation_pct=round(((exp - sanc)/sanc)*100, 1) if exp > sanc else 0.0,
            peer_anomaly_level="High" if is_high else "Normal",
            priority_score=round(r_score * 0.85, 1),
            priority_breakdown=json.dumps({"risk": r_score, "explanation": note}),
            early_warning_level=ew_lvl,
            early_warning_signals=json.dumps(ew_sigs),
            confidence=0.88,
            explanation=json.dumps(r_exp),
            recommended_actions=json.dumps(r_act)
        ))

        # Seed sample investigations for high-risk projects
        if is_high and idx in (3, 5, 8, 13):
            statuses = {3: "Field Inspection", 5: "Action Required", 8: "Resolved", 13: "False Positive"}
            inv_st = statuses.get(idx, "New")
            inv_id = f"INV-{st_name[:2].upper()}-2024-{idx:03d}"
            db.add(Investigation(
                investigation_id=inv_id,
                project_id=proj.project_id,
                risk_level=r_lvl,
                risk_score=r_score,
                priority_score=round(r_score * 0.85, 1),
                reason_for_flag=note,
                assigned_officer=f"Shri A. K. Sharma (DO-{dist_name})",
                assigned_officer_role="District Nodal Officer",
                assigned_by="State Nodal Officer",
                created_date=datetime.utcnow() - timedelta(days=20),
                due_date="2026-10-15",
                current_status=inv_st,
                officer_notes=f"Field verification team dispatched to {dist_name}.",
                findings="Inspection report filed. Physical progress verification confirmed discrepancy." if inv_st in ("Action Required", "Resolved") else None,
                corrective_action="Revised milestone schedule mandated and penalty clause invoked." if inv_st == "Resolved" else None,
                closure_reason="Resolved with contractor compliance" if inv_st == "Resolved" else ("Verified legitimate variation due to terrain" if inv_st == "False Positive" else None),
                resolution_date=datetime.utcnow() - timedelta(days=2) if inv_st in ("Resolved", "False Positive") else None,
                is_demo=True
            ))

    db.commit()

    # Re-evaluate all projects through Risk Engine for peer metrics and duplicate signals
    risk_engine.evaluate_all_projects(db)
    print("Demonstration projects and investigation workflow generated successfully.")
