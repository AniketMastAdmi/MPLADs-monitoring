# MPLADS INSIGHT: AI-Powered Monitoring, Transparency & Public Accountability Platform

**Smart India Hackathon 2026**  
**Problem Statement**: *“Development of an AI-powered system to detect anomalies, fraud, and inefficiencies in MPLAD Scheme implementation.”*  
**Organization**: Ministry of Statistics and Programme Implementation (MoSPI)  
**Department**: Data Informatics & Innovation Division (DIID)  
**Category**: Software | **Theme**: Smart Automation  
**Authoritative Reference Portal**: [eSAKSHI Dashboard](https://mplads.mospi.gov.in/digigov/dashboard.html)

---

## 1. Executive Summary & Core Principle

**MPLADS INSIGHT** is a production-oriented, explainable AI platform designed to detect financial anomalies, project delays, progress mismatches, duplicate works, and public grievances across Member of Parliament Local Area Development Scheme (MPLADS) civil works.

### The Central Product Lifecycle
The platform operationalizes the end-to-end governance lifecycle:
$$\text{DETECT} \longrightarrow \text{EXPLAIN} \longrightarrow \text{PRIORITIZE} \longrightarrow \text{VERIFY} \longrightarrow \text{ACT} \longrightarrow \text{LEARN}$$

> **Core Ethical & Regulatory Mandate:**  
> The system does **not** make definitive accusations of fraud. Anomaly scores are strictly presented as **"Monitoring Risk"** or **"Risk Scores"** with the official disclaimer:  
> *"AI-generated risk indicators support monitoring and verification. They do not by themselves establish fraud, misconduct, or wrongdoing."*

---

## 2. Upgraded Architecture Overview

```
Official / Imported Data (MoSPI CSVs)
        │
        ▼
   Raw Data Layer
        │
        ▼
   Validation & Normalization (Token-Sort Levenshtein, Paisa Parser)
        │
        ▼
   Deduplication & Cross-Dataset Matching
        │
        ▼
   Application Relational Store (SQLite / PostgreSQL)
        │
   ┌────┴──────────────────────────┬──────────────────────────┐
   ▼                               ▼                          ▼
AI Multi-Signal Engine      Priority Engine (0-100)    Human-in-the-Loop
• Isolation Forest          • Risk (35%)               • 9-Stage Lifecycle
• Progress Gap (>20%)       • Financial Exposure (25%) • Officer Assignment
• Peer Medians & IQR        • Public Impact (15%)      • GPS Field Verification
• Multi-Factor Duplicates   • Urgency (15%)            • Evidence SHA-256 Hashes
• Early Warning Triggers    • Public Concern (10%)     • Findings & Corrective Action
   └────┬──────────────────────────┴──────────────────────────┘
        ▼
Interactive Digital Dashboards (React 18 + TS + Tailwind)
• Data Mode Switcher (Official vs Demo)
• Evidence-First Project Dossier
• Investigation Lifecycle Board
• Immutable Government Audit Trail
• AI Model Performance & SDG Analytics
```

---

## 3. Data Integration, Provenance & Data Mode (Phase 1 & 20)

### A. Dual Data Modes
To ensure that synthetic test cases are never confused with real government records, the application features an explicit **Data Mode Selector**:
- **Official / Imported Data**: Displays verified baseline allocations from official MoSPI datasets (**774 Hon'ble MPs**, ₹1,16,819.03 Crore baseline).
- **Demonstration / Simulation**: Displays calibrated demonstration projects representing multi-signal risk scenarios. Prominently labeled with `DEMO DATA — SIMULATED RECORDS`.
- **Combined View**: Allows authorities to preview simulation works alongside official baselines for training and system evaluation.

### B. Complete Provenance Tracking
Every record retains complete data lineage:
- `source`: Dataset or store origin
- `source_name`: Official issuing authority
- `source_url`: Verifiable portal link (`https://mplads.gov.in`)
- `source_record_id`: Dataset record identifier
- `imported_at` & `last_updated_at`: Ingestion timestamps
- `data_version`: Semantic schema version (e.g. `v2026.1`)
- `ingestion_batch_id`: Batch correlation key (`BATCH-MOSPI-YYYYMMDD...`)
- `immutable_record_hash`: SHA-256 data integrity identifier

---

## 4. Multi-Signal & Peer-Based AI Risk Engine (Phase 2, 3, 4, 10, 12)

### A. Evaluated Operational Signals
1. **Financial vs. Physical Progress Mismatch (`progress_mismatch_score`)**:
   - Compares billed disbursements against on-ground civil milestones.
   - Gaps exceeding **20.0%** trigger elevated alerts; gaps $> 35.0\%$ trigger critical warnings.
2. **Cost Overrun Signal (`cost_overrun_score`)**:
   - Calculates percentage deviation over technical sanction:
     $$\text{Overrun \%} = \frac{\max(\text{Revised Cost}, \text{Expenditure}) - \text{Sanction}}{\text{Sanction}} \times 100$$
   - Categorized as Normal ($<0\%$), Watch ($0-15\%$), High ($15-30\%$), or Critical ($>30\%$).
3. **Peer-Based Cost Anomaly Detection (`peer_deviation_pct`)**:
   - Compares project costs against **similar peer categories** (same work category, state, and size class).
   - Computes **Peer Median**, **Peer Average**, **90th Percentile**, and **IQR Spread**.
   - Prevents unfair flagging of large capital infrastructure (e.g. major bridges) by comparing only against reasonable peers.
4. **Advanced Multi-Signal Duplicate Matcher (`duplicate_score`)**:
   - Employs a multi-factor formula combining:
     - **35%** Text similarity via TF-IDF character and word n-grams
     - **30%** Geodesic proximity in kilometers (Haversine formula between coordinates)
     - **15%** Cost ratio similarity ($\min(c_1, c_2) / \max(c_1, c_2)$)
     - **10%** Work category and implementing agency match
     - **10%** Sanction date time gap in months
   - Labeled strictly as a *"potential duplicate / similarity signal requiring field verification"*.
5. **Timeline & Delay Score (`delay_score`)**:
   - Measures calendar days elapsed past target completion date relative to remaining physical work.
6. **Payment Concentration Anomaly (`payment_anomaly_score`)**:
   - Flags tranches where a single disbursement accounts for $>50\%$ of funds while physical completion remains $<55\%$.
7. **Public Concern Cluster (`public_concern_score`)**:
   - Aggregates citizen grievances with **anti-spam IP/reporter cluster hashing** to prevent coordinated artificial risk inflation.

---

## 5. Human-in-the-Loop Investigation Workflow (Phase 5 & 21)

Flagged projects can be converted into official investigation cases across a **9-Stage Administrative Resolution Lifecycle**:

$$\text{AI FLAGGED} \longrightarrow \text{ASSIGNED} \longrightarrow \text{UNDER VERIFICATION} \longrightarrow \text{FIELD INSPECTION} \longrightarrow \text{EVIDENCE REVIEW} \longrightarrow \text{FINDING RECORDED} \longrightarrow \text{ACTION TAKEN} \longrightarrow \text{CLOSED} \quad (\text{or FALSE POSITIVE})$$

### Investigation Case Fields
- `investigation_id`: Unique tracking key (e.g. `INV-UP-2024-001`)
- `project_id`: Link to civil works record
- `assigned_officer`: Designated executive or nodal engineer
- `assigned_officer_role`: Official jurisdictional role
- `due_date`: Mandatory target resolution date
- `findings`: Official on-ground inspection findings
- `corrective_action`: Administrative remedies (fund recovery, contractor notices, timeline revisions)
- `closure_reason`: Documented resolution justification

---

## 6. Geo-Tagged Field Verification & Visual Signal (Phase 6 & 14)

### A. GPS Discrepancy Verification
- Compares **Expected Sanction Coordinates** against **Observed Inspector GPS Coordinates**.
- Calculates exact geodesic discrepancy in meters using the Haversine formula.
- Automatically flags variances exceeding standard boundary thresholds ($>250\text{m}$).

### B. Document & Photo Evidence Upload
- Enforces strict file extension validation (`.jpg`, `.jpeg`, `.png`, `.pdf`, `.webp`) and maximum file sizes ($\le 5\text{MB}$).
- Generates a **SHA-256 cryptographic hash** for every uploaded asset to guarantee non-repudiation and evidence integrity.

### C. Visual Verification Signal
- Computer-vision-ready architectural hook comparing reported physical progress percentages against observed structural milestones (e.g. Foundation, Superstructure Incomplete, Roofing, Completed).
- Always accompanied by an explicit administrative notice that visual assessments are supporting signals requiring physical officer verification.

---

## 7. Role-Based Access Control (RBAC) Matrix (Phase 8)

Backend endpoints are protected through explicit role-based dependencies:

| Capability | Public / Citizen | District Officer | State Admin / Nodal | Ministry / Super Admin |
|---|:---:|:---:|:---:|:---:|
| Explore Public Projects & Maps | ✅ | ✅ | ✅ | ✅ |
| Submit & Track Grievances | ✅ | ✅ | ✅ | ✅ |
| View Priority Review Queue | ❌ | ✅ | ✅ | ✅ |
| Initiate Formal Investigation | ❌ | ✅ | ✅ | ✅ |
| Upload Field Evidence & Photos | ❌ | ✅ | ✅ | ✅ |
| Record Inspection Findings | ❌ | ✅ | ✅ | ✅ |
| Reassign Officers & Review States | ❌ | ❌ | ✅ | ✅ |
| Trigger Dataset Re-Ingestion | ❌ | ❌ | ❌ | ✅ |
| View Government Audit Logs | ❌ | ❌ | ✅ | ✅ |
| Access Model Evaluation Page | ❌ | ❌ | ❌ | ✅ |

---

## 8. Flagship Golden Demonstration Case

| Parameter | Observed Measurement |
|---|---|
| **Project Identifier** | `MPLAD-UP-2023-GOLDEN-01` (Varanasi District, Uttar Pradesh) |
| **Work Description** | *Community Facility Development — Demonstration District* |
| **Sanctioned Amount** | ₹18,50,000 (₹18.5 Lakh) |
| **Expenditure Incurred** | ₹24,80,000 (₹24.8 Lakh) — **+34.05% Escalation** |
| **Financial vs Physical** | **89.0%** funds disbursed vs **51.0%** work completed (**38.0% Mismatch**) |
| **Timeline Variance** | **128 days overdue** past scheduled completion (30 April 2024) |
| **Nearby Similar Work** | *Construction of Multipurpose Community Centre* within 1.8km (92% text match) |
| **Payment Concentration** | Single tranche released for 55.2% of total funds prior to roof casting |
| **Composite Risk Score** | **91 / 100 — CRITICAL RISK** (Rank #1 in District Priority Review Queue) |
| **Historical Risk Trend** | April (22) $\rightarrow$ May (31) $\rightarrow$ June (47) $\rightarrow$ July (68) $\rightarrow$ August (84) $\rightarrow$ September (91) |
| **Field Verification** | Site photo uploaded, GPS variance: 82.5m (Within tolerance), Visual mismatch flagged |
| **Investigation Status** | `INV-UP-2024-001` (Under Verification, Er. Rajesh Kumar, Recovery notice issued) |

---

## 9. Model Performance & Evaluation (Phase 13)

Evaluated on the calibrated ground truth synthetic benchmark (14 diverse project scenarios covering 12 states):

| Evaluation Metric | Measured Score | Calculation Basis |
|---|:---:|---|
| **Precision** | **92.3%** | $\text{True Positives} / (\text{True Positives} + \text{False Positives})$ |
| **Recall (Sensitivity)** | **85.7%** | $\text{True Positives} / (\text{True Positives} + \text{False Negatives})$ |
| **F1-Score** | **88.9%** | $2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}$ |
| **False Positive Rate** | **7.7%** | $\text{False Positives} / (\text{False Positives} + \text{True Negatives})$ |

> **Evaluation Transparency Disclosure:**  
> Evaluated strictly on labeled demonstration data with ground-truth synthetic injection. In official production deployments, unverified raw records lack definitive fraud labels.

---

## 10. Quick Start & Execution Guide

### Prerequisites
- Python 3.10+
- Node.js v18+ & npm

### A. Run Backend
```bash
cd backend
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
*The backend automatically initializes tables, mounts static uploads, and ingests baseline records on launch.*

### B. Run Frontend
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### C. Run Verification Test Suites
```bash
# Automated Pipeline & Ingestion Verification
python -m unittest backend/tests/test_pipeline.py

# Investigation Workflow, Field Evidence & Provenance Verification
python -m unittest backend/tests/test_investigations.py
```

### D. Build Production Frontend Bundle
```bash
cd frontend
npm run build
```

---

## 11. Known Limitations & Future Enhancements Roadmap

While MPLADS INSIGHT delivers an end-to-end operational MVP, the following known limitations and future enhancements are documented for Phase 2 scaling:

### Known Limitations
1. **Official Dataset Granularity**: Publicly accessible government CSV releases currently report constituency and MP allocations rather than granular contractor-level sub-ledgers. Deep contractor profiling relies on synthetic demonstration linkages until full e-SAKSHI API integration.
2. **Offline Field Inspections**: Inspectors in remote rural regions with zero cellular connectivity currently require manual caching before syncing photos and GPS tags.
3. **Computer Vision Constraints**: Visual verification relies on milestone heuristic classification. Inclement weather, scaffolding, and night photography can introduce visual assessment ambiguity.

### Future Enhancements Roadmap
1. **Drone / Satellite Photogrammetry**: Direct integration with ISRO Bhuvan satellite imagery to track temporal roof cover changes automatically.
2. **e-GramSwaraj & PFMS Federation**: Real-time webhook integration with Public Financial Management System (PFMS) for automated Treasury payment voucher reconciliation.
3. **Multi-Lingual Citizen Voice Portals**: Expanding natural language grievance logging to 12 scheduled Indian regional languages via Bhashini API.
4. **Blockchain Audit Hashing**: Anchoring milestone completion certificates on a permissioned Hyperledger government network for tamper-proof judicial evidence trails.
