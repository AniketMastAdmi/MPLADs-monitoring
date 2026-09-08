# MPLADS INSIGHT: AI-Powered Monitoring, Transparency & Public Accountability Platform

**Smart India Hackathon 2026**  
**Problem Statement**: *“Development of an AI-powered system to detect anomalies, fraud, and inefficiencies in MPLAD Scheme implementation.”*  
**Organization**: Ministry of Statistics and Programme Implementation (MoSPI)  
**Department**: Data Informatics & Innovation Division (DIID)  
**Category**: Software | **Theme**: Smart Automation  
**Authoritative Reference Portal**: [eSAKSHI Dashboard](https://mplads.mospi.gov.in/digigov/dashboard.html)

---

## 1. Executive Summary

**MPLADS INSIGHT** is an early-warning, explainable AI platform designed to detect financial anomalies, project delays, progress mismatches, similar work duplication, and public grievances across Member of Parliament Local Area Development Scheme (MPLADS) civil works.

It operationalizes the core oversight lifecycle:
$$\text{DETECT} \longrightarrow \text{EXPLAIN} \longrightarrow \text{PRIORITIZE} \longrightarrow \text{VERIFY} \longrightarrow \text{ACT}$$

Unlike conventional dashboards, the system unifies:
1. **MP Allocation Baselines**: 774 normalized Hon'ble MPs (~₹1,16,819 Crore baseline).
2. **Civil Works Ledger**: Strict financial separation ($\text{Allocation} \neq \text{Sanction} \neq \text{Expenditure}$).
3. **Multi-Signal AI Risk Engine**: Isolation Forest, progress mismatch detection, delay prediction, and TF-IDF duplicate identification.
4. **Citizen Grievance & Whistleblower Portal**: Automated tracking ID generation (`MPL-FB-2026-XXXXXX`) and NLP cluster triage.
5. **Authority Priority Review Queue**: Ranking targets by $\text{Risk} \times \text{Financial Exposure} \times \text{Public Concern} \times \text{Urgency}$ to answer *"Where should authorities look first?"*

---

## 2. Platform Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MPLADS INSIGHT FRONTEND                         │
│       React 18 + TypeScript + Tailwind CSS (Government Design System)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Reverse Proxy / REST JSON
┌───────────────────────────────────▼────────────────────────────────────┐
│                         FASTAPI BACKEND CORE                           │
│        • Role-Based Access Control       • Audit Logging Trail         │
│        • Natural Language Analytics      • Priority Review Queue       │
└─────────┬─────────────────────────┬──────────────────────────┬─────────┘
          │                         │                          │
┌─────────▼──────────────┐ ┌────────▼────────────────┐ ┌───────▼─────────┐
│  AI Risk & ML Engine   │ │ Relational Data Store   │ │  Data Ingestion │
│ • Isolation Forest     │ │ • SQLite / PostgreSQL   │ │ • MP Normalizer │
│ • Progress Mismatch    │ │ • MPs, Projects, Ledger │ │ • Deduplicator  │
│ • TF-IDF Semantic DUP  │ │ • Citizen Grievances    │ │ • Health Engine │
│ • Delay & Cost Overrun │ │ • Auditable Risk Scores │ │ • eSAKSHI Sync  │
└────────────────────────┘ └─────────────────────────┘ └─────────────────┘
```

---

## 3. The Flagship Golden Demonstration Case

| Dimension | Observed Data & Findings |
|---|---|
| **Project Name** | **Community Facility Development — Demonstration District** |
| **Project ID** | `MPLAD-UP-2023-GOLDEN-01` (Varanasi District, Uttar Pradesh) |
| **Sanctioned Amount** | ₹18,50,000 (₹18.5 Lakh) |
| **Actual Expenditure** | ₹24,80,000 (₹24.8 Lakh) — **+34.05% Cost Escalation** |
| **Financial Progress** | **89.0%** funds disbursed |
| **Physical Progress** | **51.0%** civil execution completed |
| **Progress Divergence** | **+38.0% Mismatch** (Financial heavily outstripping physical work) |
| **Schedule Status** | **Delayed by 128 days** beyond target completion date |
| **Payment Anomaly** | 55.2% single milestone disbursement without verified superstructure |
| **Nearby Duplicate** | 92% semantic overlap with *“Construction of Multipurpose Community Centre”* within 1.8km |
| **AI Risk Score** | **91 / 100 — CRITICAL RISK** |
| **Recommended Action** | Scrutinize MB measurements, freeze unspent balances, and initiate joint DM field inspection |

---

## 4. Quick Start & Execution Guide

### Prerequisites
- Python 3.10+
- Node.js v18+ & npm

### A. Run Backend
```bash
cd backend
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
*The backend automatically initializes tables, normalizes both CSV datasets, and runs the AI risk pipeline on first launch.*

### B. Run Frontend
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### C. Run Automated Tests
```bash
python -m unittest backend/tests/test_pipeline.py
```

---

## 5. Official Data Transparency & Boundaries

In accordance with official guidelines from the **eSAKSHI dashboard**:
- Works recommended online on/after 1 April 2023 (under the revised fund-flow process) form the active reporting scope.
- Pre-April 2023 historical data gaps are transparently disclosed and not fabricated.
- Synthetic demonstration records are strictly labelled `Demonstration Dataset` and never misrepresented as certified government audits.
- **Responsible AI Disclaimer**:
  > *“AI-generated risk indicators are analytical signals intended to support monitoring and verification. They do not by themselves establish fraud, misconduct or non-compliance.”*

---

## 6. License & Hackathon Attribution

Developed for the **Smart India Hackathon 2026** under the auspices of MoSPI / DIID.  
Complies with WCAG 2.1 AA digital accessibility and National Digital Service guidelines.
