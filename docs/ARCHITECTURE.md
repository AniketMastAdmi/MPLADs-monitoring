# Technical Architecture & ML Risk Engine Specification

**Platform**: MPLADS INSIGHT  
**Audience**: Technical Evaluators & System Architects (MoSPI / DIID)

---

## 1. Data Normalization & Ingestion Engine

### A. Input Datasets
1. **Dataset A** (`Allocated Limit for Honble MPs (1)(1).csv`):
   - 231 Hon'ble MPs representing Rajya Sabha & Nominated members.
   - Cumulative Baseline: **₹33,63,84,82,301.82**.
   - Characteristics: Names contain bracketed election cycles e.g. `(2026-32) (2026-2032)`, honorifics (`Dr.`, `Prof.`, `Shri`), and tenure dates.
2. **Dataset B** (`Allocated Limit for Honble MPs.csv`):
   - 543 Hon'ble MPs representing Lok Sabha members with constituency mappings.
   - Cumulative Baseline: **₹83,18,05,53,325.71**.
   - Total Combined Allocation Baseline: **₹1,16,819.03 Crore**.

### B. Normalization Pipeline
- **Regex Extraction**: Strips tenure parentheticals, honorific titles, and electoral aliases while retaining `original_name` for audit logs.
- **Constituency Normalization**: Maps general Rajya Sabha allocations to state quotas while mapping Lok Sabha members to specific parliamentary constituencies.
- **Deduplication & Similarity**: Token-sort Jaccard similarity and cross-dataset key resolution with explicit `match_confidence` tracking.

---

## 2. Modular Multi-Signal AI Risk Engine

The composite risk score ($R \in [0, 100]$) is computed as a weighted sum of seven analytical signals:

$$R = \sum_{i=1}^{7} w_i \cdot S_i$$

Where weights $w_i$ are calibrated as follows:

| Signal ($S_i$) | Weight ($w_i$) | Mathematical / ML Formulation |
|---|---|---|
| **Progress Mismatch** | $0.25$ | Detects $\Delta = \text{Financial\%} - \text{Physical\%}$. $\Delta > 20\%$ triggers elevated risk; $\Delta > 35\%$ triggers critical score. |
| **Cost Overrun** | $0.20$ | $\text{Dev\%} = \frac{\max(\text{Revised}, \text{Exp}) - \text{Sanction}}{\text{Sanction}} \times 100$. Categories: Normal, Watch, High, Critical. |
| **Project Delay** | $0.15$ | Measures days overdue relative to expected completion date and physical progress rate. |
| **Financial Anomaly** | $0.15$ | `IsolationForest(contamination=0.15)` across multi-dimensional feature space (sanction, expenditure, utilization, progress delta). |
| **Payment Anomaly** | $0.10$ | Detects single-tranche concentration ($>50\%$ funds in single payment with low physical milestone) or premature bulk disbursement. |
| **Work Duplication** | $0.10$ | TF-IDF char/word n-gram vectorizer + cosine similarity $+ \text{Geographic Proximity} + \text{Cost Ratio}$. |
| **Public Concern** | $0.05$ | Citizen grievance count and urgency escalation from NLP triaged reports. |

### Categorical Risk Tiers
- **0 – 29**: LOW
- **30 – 49**: MODERATE
- **50 – 69**: ELEVATED
- **70 – 84**: HIGH
- **85 – 100**: CRITICAL

---

## 3. Authority Priority Review Queue Formulation

The investigation queue answers: *“Where should authorities look first?”*

$$\text{Priority Score} = R \times \left(1 + \frac{\text{Expenditure}}{50,00,000}\right) \times (1 + 0.25 \times N_{\text{feedback}}) \times U$$

Where:
- $R$: Composite AI Risk Score ($0 - 100$).
- Financial Exposure factor scales logarithmically with disbursed capital.
- $N_{\text{feedback}}$: Number of validated citizen grievance submissions.
- $U$: Urgency multiplier ($1.3$ for overdue works, $1.0$ otherwise).

---

## 4. Explainable AI & Zero Hallucination Design

1. **Structured Outputs**:
   - **Observed Data**: Exact factual database metrics (e.g., ₹24.8L spent vs ₹18.5L sanctioned).
   - **AI Analytical Signal**: Algorithmic classification without speculative bias.
   - **Recommended Action**: Administrative checklist for field verification (MB review, geotagged photos, vendor voucher verification).
2. **Conversational Analytics**:
   - Natural language queries map to deterministic SQL / SQLAlchemy aggregation queries.
   - Zero hallucination guarantee: The LLM does not generate numbers; it formats computed query results.
