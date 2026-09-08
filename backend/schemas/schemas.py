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
    sanctioned_amount: float
    expenditure: float
    physical_progress: float
    financial_progress: float
    status: str
    expected_completion: Optional[str] = None
    risk_score: float
    risk_level: str
    is_demo: bool

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
    is_demo: bool
    risk: Optional[RiskAssessmentSchema] = None
    payments: List[PaymentSchema] = []
    progress_updates: List[ProgressUpdateSchema] = []

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
    priority_rank_score: float # Risk * Financial Exposure * Public Concern * Urgency
    primary_flags: List[str]
    public_reports_count: int

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
    public_reports_count: int
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

class NaturalLanguageQueryRequest(BaseModel):
    query: str

class NaturalLanguageQueryResponse(BaseModel):
    query: str
    interpreted_intent: str
    direct_answer: str
    data_summary: Dict[str, Any]
    results: List[Dict[str, Any]]
    confidence: float
