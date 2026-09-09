from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field

class MPBase(BaseModel):
    id: int
    original_name: str
    normalized_name: str
    state: str
    constituency: Optional[str] = None
    elected_nominated: str
    allocation_amount: float
    allocation_source: str
    allocation_period: Optional[str] = None
    source_record_id: Optional[str] = None
    match_confidence: float

    class Config:
        from_attributes = True

class MPPortfolioSummary(BaseModel):
    mp: MPBase
    total_projects: int
    sanctioned_value: float
    total_expenditure: float
    utilization_percentage: float
    completed_works: int
    delayed_works: int
    high_risk_works: int
    portfolio_risk_score: float
    public_feedback_count: int

class PaymentSchema(BaseModel):
    payment_id: str
    payment_date: str
    amount: float
    vendor_reference: Optional[str] = None
    payment_stage: str

    class Config:
        from_attributes = True

class ProgressUpdateSchema(BaseModel):
    update_id: int
    date: str
    physical_progress: float
    financial_progress: float
    remarks: Optional[str] = None

    class Config:
        from_attributes = True

class RiskAssessmentSchema(BaseModel):
    risk_score: float
    risk_level: str
    anomaly_score: float
    delay_score: float
    cost_overrun_score: float
    duplicate_score: float
    payment_anomaly_score: float
    progress_mismatch_score: float
    public_concern_score: float
    confidence: float
    explanation: List[str]
    recommended_actions: List[str]
    similar_project_id: Optional[str] = None
    similar_project_name: Optional[str] = None
    similarity_percentage: Optional[float] = None
    similarity_distance_km: Optional[float] = None
    similarity_cost_pct: Optional[float] = None
    similarity_time_gap_months: Optional[float] = None
    similarity_risk_level: Optional[str] = "LOW"
    peer_median_cost: Optional[float] = 0.0
    peer_avg_cost: Optional[float] = 0.0
    peer_p90_cost: Optional[float] = 0.0
    peer_deviation_pct: Optional[float] = 0.0
    peer_anomaly_level: Optional[str] = "Normal"
    priority_score: Optional[float] = 0.0
    priority_breakdown: Optional[Dict[str, Any]] = {}
    early_warning_level: Optional[str] = "Informational"
    early_warning_signals: Optional[List[str]] = []

    class Config:
        from_attributes = True

class ProjectCardSchema(BaseModel):
    project_id: str
    work_name: str
    mp_name: Optional[str] = None
    state: str
    district: str
    constituency: Optional[str] = None
    work_type: str
    work_category: Optional[str] = "Infrastructure"
    sdg_goal: Optional[str] = "SDG 11: Sustainable Cities & Communities"
    sanctioned_amount: float
    expenditure: float
    physical_progress: float
    financial_progress: float
    status: str
    expected_completion: Optional[str] = None
    risk_score: float
    risk_level: str
    priority_score: Optional[float] = 0.0
    source: Optional[str] = "Demonstration Dataset"
    is_demo: bool

class InvestigationEvidenceSchema(BaseModel):
    id: int
    investigation_id: str
    project_id: str
    evidence_type: str
    file_name: str
    file_url: str
    file_hash: Optional[str] = None
    expected_latitude: Optional[float] = None
    expected_longitude: Optional[float] = None
    observed_latitude: Optional[float] = None
    observed_longitude: Optional[float] = None
    distance_difference_meters: Optional[float] = None
    gps_timestamp: Optional[Any] = None
    uploaded_by: str
    uploaded_by_role: str
    uploaded_at: Any
    notes: Optional[str] = None
    visual_assessment: Optional[str] = None
    visual_mismatch_flag: Optional[bool] = False

    class Config:
        from_attributes = True

class InvestigationResponseSchema(BaseModel):
    investigation_id: str
    project_id: str
    work_name: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    risk_level: str
    risk_score: float
    priority_score: float
    reason_for_flag: str
    assigned_officer: Optional[str] = None
    assigned_officer_role: Optional[str] = None
    assigned_by: Optional[str] = None
    created_date: Any
    due_date: Optional[str] = None
    resolution_date: Optional[Any] = None
    current_status: str
    officer_notes: Optional[str] = None
    findings: Optional[str] = None
    corrective_action: Optional[str] = None
    closure_reason: Optional[str] = None
    is_demo: bool
    evidences: List[InvestigationEvidenceSchema] = []

    class Config:
        from_attributes = True

class InvestigationCreateSchema(BaseModel):
    project_id: str
    reason_for_flag: str
    assigned_officer: Optional[str] = None
    assigned_officer_role: Optional[str] = "District Nodal Officer"
    due_date: Optional[str] = None
    officer_notes: Optional[str] = None

class InvestigationUpdateSchema(BaseModel):
    assigned_officer: Optional[str] = None
    current_status: Optional[str] = None
    officer_notes: Optional[str] = None
    findings: Optional[str] = None
    corrective_action: Optional[str] = None
    closure_reason: Optional[str] = None

class RiskHistoryPointSchema(BaseModel):
    recorded_at: str
    risk_score: float
    financial_progress: float
    physical_progress: float
    expenditure: float
    risk_level: str
    trigger_event: Optional[str] = None

    class Config:
        from_attributes = True

class ProjectDetailSchema(BaseModel):
    project_id: str
    work_name: str
    mp_id: Optional[int] = None
    mp_name: Optional[str] = None
    state: str
    constituency: Optional[str] = None
    district: str
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    work_type: str
    work_category: Optional[str] = "Infrastructure"
    sdg_goal: Optional[str] = "SDG 11: Sustainable Cities & Communities"
    sanctioned_amount: float
    estimated_cost: float
    revised_cost: float
    expenditure: float
    financial_progress: float
    physical_progress: float
    sanction_date: Optional[str] = None
    start_date: Optional[str] = None
    expected_completion: Optional[str] = None
    completion_date: Optional[str] = None
    implementing_agency: str
    status: str
    source: str
    source_name: Optional[str] = None
    source_url: Optional[str] = None
    source_record_id: Optional[str] = None
    imported_at: Optional[Any] = None
    retrieved_at: Optional[Any] = None
    last_updated_at: Optional[Any] = None
    data_version: Optional[str] = "v2026.1"
    ingestion_batch_id: Optional[str] = None
    is_demo: bool
    risk: Optional[RiskAssessmentSchema] = None
    payments: List[PaymentSchema] = []
    progress_updates: List[ProgressUpdateSchema] = []
    risk_history: List[RiskHistoryPointSchema] = []
    investigations: List[InvestigationResponseSchema] = []
    evidences: List[InvestigationEvidenceSchema] = []

class FeedbackCreate(BaseModel):
    project_id: str
    issue_category: str
    description: str
    location: Optional[str] = None
    attachment_url: Optional[str] = None
    anonymous: bool = False

class FeedbackResponse(BaseModel):
    feedback_id: str
    project_id: str
    issue_category: str
    description: str
    location: Optional[str] = None
    attachment_url: Optional[str] = None
    anonymous: bool
    status: str
    priority: str
    ai_category: Optional[str] = None
    created_at: Any

    class Config:
        from_attributes = True

class PriorityQueueItem(BaseModel):
    project_id: str
    work_name: str
    state: str
    district: str
    sanctioned_amount: float
    expenditure: float
    risk_score: float
    risk_level: str
    priority_rank_score: float
    work_category: Optional[str] = "Infrastructure"
    primary_flags: List[str]
    public_reports_count: int
    is_demo: bool = True

class NationalAnalytics(BaseModel):
    total_allocated: float
    total_sanctioned: float
    total_expenditure: float
    overall_utilization: float
    total_works: int
    completed_works: int
    in_progress_works: int
    delayed_works: int
    high_risk_works: int
    critical_investigations: int
    overdue_investigations: int
    public_reports_count: int
    data_quality_score: float
    last_data_update: str
    high_risk_states: List[Dict[str, Any]]
    work_type_distribution: List[Dict[str, Any]]
    risk_level_distribution: List[Dict[str, Any]]
    source_transparency: Dict[str, Any]

class StateAnalytics(BaseModel):
    state: str
    mp_count: int
    total_allocated: float
    total_sanctioned: float
    total_expenditure: float
    utilization_percentage: float
    total_projects: int
    completed_projects: int
    delayed_projects: int
    high_risk_projects: int
    avg_cost_deviation: float
    public_feedback_count: int
    investigation_closure_rate: float = 85.0

class DataHealthFreshnessSchema(BaseModel):
    source_name: str
    source_url: str
    last_synchronization: str
    data_coverage_period: str
    total_records: int
    validated_records: int
    rejected_records: int
    duplicate_records: int
    incomplete_records: int
    manual_review_records: int
    quality_score: float
    batch_id: str
    status: str
    provenance_details: Dict[str, Any]

class ModelEvaluationMetricsSchema(BaseModel):
    is_synthetic_evaluation: bool
    evaluation_dataset_name: str
    evaluated_records_count: int
    known_anomalies_count: int
    correctly_detected_count: int
    precision: float
    recall: float
    f1_score: float
    false_positive_rate: float
    disclaimer: str

class SDGAnalyticsSchema(BaseModel):
    sdg_distribution: List[Dict[str, Any]]
    total_sanctioned_mapped: float

class NaturalLanguageQueryRequest(BaseModel):
    query: str

class NaturalLanguageQueryResponse(BaseModel):
    query: str
    interpreted_intent: str
    direct_answer: str
    data_summary: Dict[str, Any]
    results: List[Dict[str, Any]]
    confidence: float
    data_source: str = "Official Ingested MoSPI Database"
    records_analyzed_count: int = 0
    filters_applied: str = "None"
    time_period: str = "2023 - 2026"
    aggregation_method: str = "SQL Sum / Average / Percentile"
    calculation_notes: str = "Calculated strictly against persistent database records with zero hallucination."
