import json
from datetime import datetime, timedelta
from typing import List
from sqlalchemy.orm import Session
from backend.models.models import Project, Payment, ProgressUpdate, RiskAssessment, Feedback, MP

def generate_demo_dataset(db: Session):
    """
    Generates realistic demonstration project records linked to normalized MPs.
    Includes:
    - Normal projects
    - Cost anomaly projects
    - Delay anomaly projects
    - Progress mismatch projects (Financial >> Physical)
    - Semantic duplicate / similar projects
    - Payment anomaly projects
    - The Flagship Golden Demo project (Critical Risk 91/100)
    All strictly labeled 'Demonstration Dataset', is_demo=True.
    """
    # Clean existing projects
    db.query(Feedback).delete()
    db.query(RiskAssessment).delete()
    db.query(ProgressUpdate).delete()
    db.query(Payment).delete()
    db.query(Project).delete()
    db.commit()

    # Query real MPs from database for realistic linkages
    mps = db.query(MP).all()
    if not mps:
        print("Warning: No MPs in database. Generating fallback linkage.")
        return

    # Helper to find MP by state or constituency
    def find_mp(state_name: str, const_name: str = None):
        for mp in mps:
            if state_name.lower() in mp.state.lower():
                if const_name and mp.constituency and const_name.lower() in mp.constituency.lower():
                    return mp
                if not const_name:
                    return mp
        return mps[0]

    # --- 1. GOLDEN DEMO PROJECT ---
    golden_mp = find_mp("Uttar Pradesh", "Varanasi") or mps[0]
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
        is_demo=True
    )
    db.add(golden_proj)
    db.flush()

    # Golden Project Payments (showing payment concentration anomaly: 80% released at 51% physical)
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
        confidence=0.91,
        explanation=json.dumps(golden_explanations),
        recommended_actions=json.dumps(golden_actions),
        similar_project_id="MPLAD-UP-2023-SIM-02",
        similar_project_name="Construction of Multipurpose Community Centre — Sevapuri",
        similarity_percentage=92.0
    ))

    # Golden Project Citizen Feedback (Public Concern Cluster)
    feedbacks = [
        ("MPL-FB-2026-008241", "Work incomplete", "The community hall was left half-built 4 months ago. No workers have been seen on site, yet board shows 89% funds spent.", "Sevapuri Ward 14", "Urgent", "progress concern"),
        ("MPL-FB-2026-008242", "Poor quality", "Plaster on newly constructed pillar is peeling off and water leakage visible near slab joints.", "Sevapuri Ward 14", "High", "poor quality"),
        ("MPL-FB-2026-008243", "Potential duplicate work", "Another multipurpose community centre was already sanctioned 1.5 km away in 2022 by zilla parishad.", "Sevapuri Ward 14", "High", "duplicate concern")
    ]
    for fid, fcat, fdesc, floc, fpri, faicat in feedbacks:
        db.add(Feedback(
            feedback_id=fid,
            project_id=golden_proj.project_id,
            issue_category=fcat,
            description=fdesc,
            location=floc,
            anonymous=False,
            status="Under Review",
            priority=fpri,
            ai_category=faicat
        ))

    # --- 2. THE NEARBY SIMILAR / DUPLICATE WORK ---
    sim_proj = Project(
        project_id="MPLAD-UP-2023-SIM-02",
        work_name="Construction of Multipurpose Community Centre — Sevapuri",
        mp_id=golden_mp.id,
        state=golden_mp.state,
        constituency=golden_mp.constituency or "Varanasi",
        district="Varanasi",
        location="Sevapuri Rural Centre",
        latitude=25.3210,
        longitude=82.9610,
        work_type="Community Infrastructure",
        sanctioned_amount=1900000.0,
        estimated_cost=1900000.0,
        revised_cost=1900000.0,
        expenditure=1820000.0,
        financial_progress=95.0,
        physical_progress=92.0,
        sanction_date="2022-11-10",
        start_date="2023-01-05",
        expected_completion="2023-12-31",
        completion_date="2024-01-15",
        implementing_agency="Public Works Department (PWD)",
        status="Completed",
        source="Demonstration Dataset",
        is_demo=True
    )
    db.add(sim_proj)
    db.flush()
    db.add(RiskAssessment(
        project_id=sim_proj.project_id,
        risk_score=42.0,
        risk_level="MODERATE",
        anomaly_score=30.0,
        delay_score=25.0,
        cost_overrun_score=10.0,
        duplicate_score=92.0,
        payment_anomaly_score=20.0,
        progress_mismatch_score=15.0,
        public_concern_score=10.0,
        confidence=0.88,
        explanation=json.dumps(["High semantic and geographic overlap with nearby project MPLAD-UP-2023-GOLDEN-01 (92% text similarity, 1.8km distance)."]),
        recommended_actions=json.dumps(["Verify asset register to ensure facility demarcation."]),
        similar_project_id=golden_proj.project_id,
        similar_project_name=golden_proj.work_name,
        similarity_percentage=92.0
    ))

    # --- 3. MORE DIVERSE REALISTIC PROJECTS ACROSS STATES ---
    sample_definitions = [
        # Maharashtra
        {
            "id": "MPLAD-MH-2023-001",
            "name": "Installation of High-Mast Solar LED Lights at Public Junctions",
            "state": "Maharashtra", "const": "PUNE", "dist": "Pune", "loc": "Haveli & Khed Talukas",
            "lat": 18.5204, "lng": 73.8567, "type": "Renewable Energy",
            "sanc": 2500000.0, "rev": 2500000.0, "exp": 2450000.0, "fin": 98.0, "phy": 100.0,
            "status": "Completed", "risk": 18.0, "level": "LOW",
            "reasons": ["Project completed within sanctioned budget and schedule."],
            "actions": ["Routine post-completion physical asset geotagging verification."]
        },
        {
            "id": "MPLAD-MH-2023-002",
            "name": "Construction of Additional Classrooms in Zilla Parishad High School",
            "state": "Maharashtra", "const": "NAGPUR", "dist": "Nagpur", "loc": "Saoner Rural Block",
            "lat": 21.1458, "lng": 79.0882, "type": "Education",
            "sanc": 3500000.0, "rev": 4600000.0, "exp": 4200000.0, "fin": 91.3, "phy": 48.0,
            "status": "In Progress", "risk": 78.0, "level": "HIGH",
            "reasons": [
                "Financial progress (91.3%) substantially outpaces physical execution (48.0%).",
                "Cost escalation of +31.4% recorded against original sanction.",
                "Project is running 85 days behind target milestone."
            ],
            "actions": [
                "Issue audit notice to Executive Engineer regarding milestone discrepancy.",
                "Halt interim disbursement pending joint site verification."
            ]
        },
        # Gujarat
        {
            "id": "MPLAD-GJ-2023-003",
            "name": "Rural Piped Drinking Water Supply Network & RO Purification Plant",
            "state": "Gujarat", "const": "GANDHINAGAR", "dist": "Gandhinagar", "loc": "Kalol Sector 4",
            "lat": 23.2156, "lng": 72.6369, "type": "Drinking Water",
            "sanc": 4200000.0, "rev": 4200000.0, "exp": 3800000.0, "fin": 90.5, "phy": 92.0,
            "status": "In Progress", "risk": 22.0, "level": "LOW",
            "reasons": ["Financial expenditure correlates closely with verified physical pipeline installation."],
            "actions": ["Proceed with scheduled final phase commissioning."]
        },
        {
            "id": "MPLAD-GJ-2023-004",
            "name": "Widening and Bituminous Paving of Approach Link Road",
            "state": "Gujarat", "const": "SURAT", "dist": "Surat", "loc": "Olpad Industrial Corridor",
            "lat": 21.1702, "lng": 72.8311, "type": "Roads & Bridges",
            "sanc": 5000000.0, "rev": 6400000.0, "exp": 5800000.0, "fin": 90.6, "phy": 55.0,
            "status": "Delayed", "risk": 74.0, "level": "HIGH",
            "reasons": [
                "Cost deviation of +28.0% over original sanctioned amount.",
                "Physical progress lag of 35.6% relative to financial releases.",
                "Multiple citizen reports received regarding sub-base quality."
            ],
            "actions": [
                "Core sample testing of road thickness and bitumen mix.",
                "Scrutiny of variation approval records."
            ]
        },
        # Bihar
        {
            "id": "MPLAD-BR-2023-005",
            "name": "Construction of Primary Health Centre Diagnostic Sub-Centre",
            "state": "Bihar", "const": "PATNA SAHIB", "dist": "Patna", "loc": "Phulwari Sharif",
            "lat": 25.5941, "lng": 85.1376, "type": "Health & Sanitation",
            "sanc": 3000000.0, "rev": 4100000.0, "exp": 3850000.0, "fin": 93.9, "phy": 52.0,
            "status": "Delayed", "risk": 84.0, "level": "HIGH",
            "reasons": [
                "Severe physical vs financial divergence (41.9% gap).",
                "Project delayed by 142 days beyond sanctioned completion.",
                "Unusual payment concentration in final quarter without roof casting."
            ],
            "actions": [
                "Immediate on-site technical inspection by District Engineer.",
                "Cross-check bills with biometric labor logs."
            ]
        },
        {
            "id": "MPLAD-BR-2023-006",
            "name": "Installation of Deep Tube Wells with Hand Pumps in Flood-Prone Wards",
            "state": "Bihar", "const": "PURNEA", "dist": "Purnea", "loc": "Kasba Block",
            "lat": 25.7771, "lng": 87.4753, "type": "Drinking Water",
            "sanc": 1500000.0, "rev": 1500000.0, "exp": 1420000.0, "fin": 94.6, "phy": 95.0,
            "status": "Completed", "risk": 15.0, "level": "LOW",
            "reasons": ["Works verified with GPS coordinates matching water quality certification."],
            "actions": ["Archival to scheme completion register."]
        },
        # Tamil Nadu
        {
            "id": "MPLAD-TN-2023-007",
            "name": "Upgradation of Anganwadi Centres with Modern Sanitation & Nutrition Facilities",
            "state": "Tamil Nadu", "const": "CHENNAI CENTRAL", "dist": "Chennai", "loc": "Zone 8 Anna Nagar",
            "lat": 13.0827, "lng": 80.2707, "type": "Health & Sanitation",
            "sanc": 2800000.0, "rev": 2800000.0, "exp": 2750000.0, "fin": 98.2, "phy": 100.0,
            "status": "Completed", "risk": 12.0, "level": "LOW",
            "reasons": ["Timely completion within approved limits."],
            "actions": ["Routine post-audit."]
        },
        {
            "id": "MPLAD-TN-2023-008",
            "name": "Construction of Fish Landing Shed and Cold Storage Buffer",
            "state": "Tamil Nadu", "const": "RAMANATHAPURAM", "dist": "Ramanathapuram", "loc": "Rameswaram Coast",
            "lat": 9.2876, "lng": 79.3129, "type": "Community Infrastructure",
            "sanc": 4800000.0, "rev": 5900000.0, "exp": 5400000.0, "fin": 91.5, "phy": 60.0,
            "status": "Delayed", "risk": 72.0, "level": "HIGH",
            "reasons": [
                "Financial release outstripping physical progress by 31.5%.",
                "Delay of 98 days due to coastal regulatory clarification disputes."
            ],
            "actions": [
                "Verify equipment procurement invoice versus warehouse stock.",
                "Review revised estimate sanction."
            ]
        },
        # West Bengal
        {
            "id": "MPLAD-WB-2023-009",
            "name": "Construction of Multipurpose Cyclone Shelter & Community Storage",
            "state": "West Bengal", "const": "DIAMOND HARBOUR", "dist": "South 24 Parganas", "loc": "Kakdwip Coastal Belt",
            "lat": 21.8764, "lng": 88.1882, "type": "Community Infrastructure",
            "sanc": 5500000.0, "rev": 6900000.0, "exp": 6500000.0, "fin": 94.2, "phy": 58.0,
            "status": "Delayed", "risk": 82.0, "level": "HIGH",
            "reasons": [
                "Financial expenditure (94.2%) is severely mismatched with physical completion (58.0%).",
                "Cost overrun of +25.4% over initial sanction."
            ],
            "actions": [
                "Direct inspection by State Nodal Officer.",
                "Reconcile contractor measurement sheets."
            ]
        },
        # Rajasthan
        {
            "id": "MPLAD-RJ-2023-010",
            "name": "Creation of Water Harvesting Structures (Check Dams & Anicuts)",
            "state": "Rajasthan", "const": "JAIPUR", "dist": "Jaipur", "loc": "Jamwa Ramgarh",
            "lat": 26.9124, "lng": 75.7873, "type": "Irrigation & Water Conservation",
            "sanc": 3800000.0, "rev": 3800000.0, "exp": 3720000.0, "fin": 97.8, "phy": 98.0,
            "status": "Completed", "risk": 16.0, "level": "LOW",
            "reasons": ["Work executed within budget with high water table recharge impact."],
            "actions": ["Routine monitoring."]
        },
        # Kerala
        {
            "id": "MPLAD-KL-2023-011",
            "name": "Establishment of Advanced Computer Lab & Smart Classrooms in Govt Vocational HSS",
            "state": "Kerala", "const": "THIRUVANANTHAPURAM", "dist": "Thiruvananthapuram", "loc": "Nedumangad",
            "lat": 8.5241, "lng": 76.9366, "type": "Education",
            "sanc": 2200000.0, "rev": 2200000.0, "exp": 2180000.0, "fin": 99.1, "phy": 100.0,
            "status": "Completed", "risk": 14.0, "level": "LOW",
            "reasons": ["Complete asset delivery verified with school principal sign-off."],
            "actions": ["Post-completion audit."]
        },
        # Karnataka
        {
            "id": "MPLAD-KA-2023-012",
            "name": "Construction of Veterinary Dispensary and Cattle Artificial Insemination Centre",
            "state": "Karnataka", "const": "BANGALORE RURAL", "dist": "Bengaluru Rural", "loc": "Doddaballapur",
            "lat": 13.2929, "lng": 77.5431, "type": "Animal Husbandry",
            "sanc": 2100000.0, "rev": 2550000.0, "exp": 2300000.0, "fin": 90.2, "phy": 59.0,
            "status": "In Progress", "risk": 64.0, "level": "ELEVATED",
            "reasons": [
                "Financial releases outpace physical construction by 31.2%.",
                "Delay in civil superstructure casting."
            ],
            "actions": ["Inspection of structural framework by DRDA Assistant Executive Engineer."]
        },
        # Odisha
        {
            "id": "MPLAD-OD-2023-013",
            "name": "Rural Electrification & Transformer Installation in Tribal Hamlets",
            "state": "Odisha", "const": "SAMBALPUR", "dist": "Sambalpur", "loc": "Kuchinda Block",
            "lat": 21.4669, "lng": 83.9812, "type": "Power & Energy",
            "sanc": 3100000.0, "rev": 3100000.0, "exp": 2980000.0, "fin": 96.1, "phy": 98.0,
            "status": "Completed", "risk": 19.0, "level": "LOW",
            "reasons": ["Grid energization certified by DISCOM."],
            "actions": ["Routine filing."]
        }
    ]

    for item in sample_definitions:
        mp = find_mp(item["state"], item["const"]) or mps[0]
        proj = Project(
            project_id=item["id"],
            work_name=item["name"],
            mp_id=mp.id,
            state=item["state"],
            constituency=item["const"],
            district=item["dist"],
            location=item["loc"],
            latitude=item["lat"],
            longitude=item["lng"],
            work_type=item["type"],
            sanctioned_amount=item["sanc"],
            estimated_cost=item["sanc"],
            revised_cost=item["rev"],
            expenditure=item["exp"],
            financial_progress=item["fin"],
            physical_progress=item["phy"],
            sanction_date="2023-05-10",
            start_date="2023-06-15",
            expected_completion="2024-03-31" if item["status"] != "Completed" else "2023-12-15",
            completion_date="2023-12-20" if item["status"] == "Completed" else None,
            implementing_agency="District Rural Development Agency (DRDA)" if "Rural" in item["name"] else "Public Works Department (PWD)",
            status=item["status"],
            source="Demonstration Dataset",
            is_demo=True
        )
        db.add(proj)
        db.flush()

        # Payments
        p1 = item["exp"] * 0.4
        p2 = item["exp"] * 0.6
        db.add(Payment(
            payment_id=f"PAY-{item['id']}-1",
            project_id=proj.project_id,
            payment_date="2023-07-01",
            amount=p1,
            vendor_reference="Registered District Contractor",
            payment_stage="Initial Milestone"
        ))
        db.add(Payment(
            payment_id=f"PAY-{item['id']}-2",
            project_id=proj.project_id,
            payment_date="2023-11-20",
            amount=p2,
            vendor_reference="Registered District Contractor",
            payment_stage="Interim Milestone"
        ))

        # Progress update
        db.add(ProgressUpdate(
            project_id=proj.project_id,
            date="2023-10-15",
            physical_progress=item["phy"] * 0.6,
            financial_progress=item["fin"] * 0.7,
            remarks="Periodic inspection recorded."
        ))

        # Risk Assessment
        db.add(RiskAssessment(
            project_id=proj.project_id,
            risk_score=item["risk"],
            risk_level=item["level"],
            anomaly_score=item["risk"] * 0.9,
            delay_score=item["risk"] * 0.95 if item["status"] == "Delayed" else 10.0,
            cost_overrun_score=((item["rev"] - item["sanc"]) / item["sanc"] * 100.0) if item["rev"] > item["sanc"] else 5.0,
            duplicate_score=15.0,
            payment_anomaly_score=item["risk"] * 0.85 if item["risk"] > 50 else 10.0,
            progress_mismatch_score=max(0.0, item["fin"] - item["phy"]),
            public_concern_score=60.0 if item["risk"] > 70 else 10.0,
            confidence=0.88,
            explanation=json.dumps(item["reasons"]),
            recommended_actions=json.dumps(item["actions"])
        ))

    # Add 25 more diverse projects automatically linked across states for high information density
    work_types = [
        "Drinking Water", "Education", "Health & Sanitation", "Roads & Bridges",
        "Community Infrastructure", "Irrigation & Water Conservation", "Sports Facilities"
    ]
    for i in range(14, 45):
        mp_idx = i % len(mps)
        curr_mp = mps[mp_idx]
        wtype = work_types[i % len(work_types)]
        status_choice = "Completed" if i % 3 == 0 else ("Delayed" if i % 4 == 0 else "In Progress")
        sanc = round(1500000.0 + (i * 125000.0), -4)
        is_high_risk = (i % 7 == 0)
        
        if is_high_risk:
            rev = sanc * 1.32
            exp = rev * 0.92
            fin_prog = 92.0
            phy_prog = 46.0
            risk_score = 86.0
            risk_lvl = "CRITICAL"
            reasons = [
                "Financial progress (92%) outpaces physical work (46%) by 46 percentage points.",
                f"Expenditure of ₹{exp/100000:.2f}L exceeds initial sanction by 32%.",
                "Unusual milestone payment pattern detected."
            ]
            actions = [
                "Immediate freeze on unspent project funds.",
                "Mandatory physical inspection by District Collectorate audit team."
            ]
        else:
            rev = sanc
            exp = sanc * 0.85 if status_choice == "Completed" else sanc * 0.55
            fin_prog = 95.0 if status_choice == "Completed" else 58.0
            phy_prog = 96.0 if status_choice == "Completed" else 55.0
            risk_score = 18.0 if status_choice == "Completed" else 35.0
            risk_lvl = "LOW" if risk_score < 30 else "MODERATE"
            reasons = ["Project expenditure tracking within acceptable variance of physical completion."]
            actions = ["Routine monitoring and milestone compliance."]

        p = Project(
            project_id=f"MPLAD-{curr_mp.state[:2].upper()}-2023-{i:03d}",
            work_name=f"Development of {wtype} Scheme — Sector {i}",
            mp_id=curr_mp.id,
            state=curr_mp.state,
            constituency=curr_mp.constituency or f"Constituency {i}",
            district=curr_mp.constituency or "Central District",
            location=f"Block {i % 12 + 1}, Rural Circle",
            latitude=20.5937 + ((i % 10) - 5) * 0.8,
            longitude=78.9629 + ((i % 8) - 4) * 0.9,
            work_type=wtype,
            sanctioned_amount=sanc,
            estimated_cost=sanc,
            revised_cost=rev,
            expenditure=exp,
            financial_progress=fin_prog,
            physical_progress=phy_prog,
            sanction_date="2023-04-18",
            start_date="2023-05-20",
            expected_completion="2024-02-28",
            completion_date="2024-03-01" if status_choice == "Completed" else None,
            implementing_agency="District Rural Development Agency (DRDA)",
            status=status_choice,
            source="Demonstration Dataset",
            is_demo=True
        )
        db.add(p)
        db.flush()

        db.add(RiskAssessment(
            project_id=p.project_id,
            risk_score=risk_score,
            risk_level=risk_lvl,
            anomaly_score=risk_score * 0.9,
            delay_score=75.0 if status_choice == "Delayed" else 15.0,
            cost_overrun_score=32.0 if is_high_risk else 0.0,
            duplicate_score=10.0,
            payment_anomaly_score=80.0 if is_high_risk else 12.0,
            progress_mismatch_score=max(0.0, fin_prog - phy_prog),
            public_concern_score=55.0 if is_high_risk else 5.0,
            confidence=0.89,
            explanation=json.dumps(reasons),
            recommended_actions=json.dumps(actions)
        ))

    db.commit()
    print("Demonstration projects generated successfully.")
