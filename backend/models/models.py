from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from backend.models.database import Base

class MP(Base):
    __tablename__ = "mps"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    original_name = Column(String(255), nullable=False)
    normalized_name = Column(String(255), nullable=False, index=True)
    state = Column(String(100), nullable=False, index=True)
    constituency = Column(String(150), nullable=True, index=True)
    elected_nominated = Column(String(50), nullable=False, default="Elected MP")
    allocation_amount = Column(Float, nullable=False, default=0.0)
    allocation_source = Column(String(100), default="Provided MPLADS Allocation Dataset")
    allocation_period = Column(String(50), nullable=True)
    source_record_id = Column(String(50), nullable=True)
    match_confidence = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    projects = relationship("Project", back_populates="mp", cascade="all, delete-orphan")


class Project(Base):
    __tablename__ = "projects"

    project_id = Column(String(100), primary_key=True, index=True)
    work_name = Column(String(300), nullable=False, index=True)
    mp_id = Column(Integer, ForeignKey("mps.id"), nullable=True, index=True)
    state = Column(String(100), nullable=False, index=True)
    constituency = Column(String(150), nullable=True, index=True)
    district = Column(String(100), nullable=False, index=True)
    location = Column(String(255), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    work_type = Column(String(100), nullable=False, index=True)
    work_category = Column(String(100), nullable=True, default="Infrastructure", index=True)
    sdg_goal = Column(String(100), nullable=True, default="SDG 11: Sustainable Cities & Communities", index=True)
    
    # Financial fields (strictly separated: allocation != sanctioned != expenditure)
    sanctioned_amount = Column(Float, nullable=False, default=0.0)
    estimated_cost = Column(Float, nullable=False, default=0.0)
    revised_cost = Column(Float, nullable=False, default=0.0)
    expenditure = Column(Float, nullable=False, default=0.0)
    
    financial_progress = Column(Float, nullable=False, default=0.0) # Percentage
    physical_progress = Column(Float, nullable=False, default=0.0)  # Percentage
    
    sanction_date = Column(String(50), nullable=True)
    start_date = Column(String(50), nullable=True)
    expected_completion = Column(String(50), nullable=True)
    completion_date = Column(String(50), nullable=True)
    
    implementing_agency = Column(String(200), nullable=False, default="District Rural Development Agency")
    status = Column(String(50), nullable=False, default="In Progress", index=True)
    
    # Provenance fields (Phase 1 & Phase 23)
    source = Column(String(100), default="Demonstration Dataset")
    source_name = Column(String(200), nullable=True, default="Official MoSPI e-SAKSHI Portal")
    source_url = Column(String(300), nullable=True, default="https://mplads.gov.in")
    source_record_id = Column(String(100), nullable=True)
    imported_at = Column(DateTime, default=datetime.utcnow)
    retrieved_at = Column(DateTime, default=datetime.utcnow)
    last_updated_at = Column(DateTime, default=datetime.utcnow)
    data_version = Column(String(50), default="v2026.1")
    ingestion_batch_id = Column(String(100), nullable=True)
    is_demo = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    mp = relationship("MP", back_populates="projects")
    payments = relationship("Payment", back_populates="project", cascade="all, delete-orphan")
    progress_updates = relationship("ProgressUpdate", back_populates="project", cascade="all, delete-orphan")
    risk_assessment = relationship("RiskAssessment", back_populates="project", uselist=False, cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="project", cascade="all, delete-orphan")
    investigations = relationship("Investigation", back_populates="project", cascade="all, delete-orphan")
    evidences = relationship("InvestigationEvidence", back_populates="project", cascade="all, delete-orphan")
    risk_histories = relationship("RiskHistory", back_populates="project", cascade="all, delete-orphan")


class Payment(Base):
    __tablename__ = "payments"

    payment_id = Column(String(100), primary_key=True, index=True)
    project_id = Column(String(100), ForeignKey("projects.project_id"), nullable=False, index=True)
    payment_date = Column(String(50), nullable=False)
    amount = Column(Float, nullable=False)
    vendor_reference = Column(String(200), nullable=True)
    payment_stage = Column(String(100), nullable=False) # e.g. "Mobilization Advance", "Milestone 1", "Final Settlement"

    project = relationship("Project", back_populates="payments")


class ProgressUpdate(Base):
    __tablename__ = "progress_updates"

    update_id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(String(100), ForeignKey("projects.project_id"), nullable=False, index=True)
    date = Column(String(50), nullable=False)
    physical_progress = Column(Float, nullable=False)
    financial_progress = Column(Float, nullable=False)
    remarks = Column(Text, nullable=True)

    project = relationship("Project", back_populates="progress_updates")


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(String(100), ForeignKey("projects.project_id"), nullable=False, unique=True, index=True)
    
    # Composite and component scores (0 - 100)
    risk_score = Column(Float, nullable=False, default=0.0, index=True)
    anomaly_score = Column(Float, default=0.0)
    delay_score = Column(Float, default=0.0)
    cost_overrun_score = Column(Float, default=0.0)
    duplicate_score = Column(Float, default=0.0)
    payment_anomaly_score = Column(Float, default=0.0)
    progress_mismatch_score = Column(Float, default=0.0)
    public_concern_score = Column(Float, default=0.0)
    
    # Peer-Based Benchmarking signals (Phase 3)
    peer_median_cost = Column(Float, default=0.0)
    peer_avg_cost = Column(Float, default=0.0)
    peer_p90_cost = Column(Float, default=0.0)
    peer_deviation_pct = Column(Float, default=0.0)
    peer_anomaly_level = Column(String(50), default="Normal") # Normal, Watch, High, Critical
    
    # Combined Priority Score & Breakdown (Phase 12)
    priority_score = Column(Float, default=0.0, index=True)
    priority_breakdown = Column(Text, default="{}") # JSON: {risk, exposure, public_impact, urgency, concern}

    confidence = Column(Float, default=0.85)
    risk_level = Column(String(50), default="LOW", index=True) # LOW, MODERATE, ELEVATED, HIGH, CRITICAL
    
    # Explainable AI details (Phase 2 & Phase 4)
    explanation = Column(Text, nullable=False, default="[]") # JSON list of reasons
    recommended_actions = Column(Text, nullable=False, default="[]") # JSON list of actions
    similar_project_id = Column(String(100), nullable=True)
    similar_project_name = Column(String(300), nullable=True)
    similarity_percentage = Column(Float, nullable=True)
    similarity_distance_km = Column(Float, nullable=True)
    similarity_cost_pct = Column(Float, nullable=True)
    similarity_time_gap_months = Column(Float, nullable=True)
    similarity_risk_level = Column(String(50), default="LOW") # LOW, MODERATE, HIGH
    
    # Early Warning Signals (Phase 10)
    early_warning_level = Column(String(50), default="Informational") # Informational, Low, Medium, High, Critical
    early_warning_signals = Column(Text, default="[]") # JSON list of early warning signals

    calculated_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="risk_assessment")


class Feedback(Base):
    __tablename__ = "feedback"

    feedback_id = Column(String(100), primary_key=True, index=True)
    project_id = Column(String(100), ForeignKey("projects.project_id"), nullable=False, index=True)
    issue_category = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String(200), nullable=True)
    attachment_url = Column(String(500), nullable=True)
    anonymous = Column(Boolean, default=False)
    status = Column(String(50), default="Submitted", index=True) # Submitted, Under Review, Action Initiated, Resolved
    priority = Column(String(50), default="Normal") # Low, Normal, High, Urgent
    ai_category = Column(String(100), nullable=True)
    reporter_ip_hash = Column(String(64), nullable=True) # Anti-spam safeguard
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="feedbacks")


class Investigation(Base):
    __tablename__ = "investigations"

    investigation_id = Column(String(100), primary_key=True, index=True)
    project_id = Column(String(100), ForeignKey("projects.project_id"), nullable=False, index=True)
    risk_level = Column(String(50), default="HIGH")
    risk_score = Column(Float, default=0.0)
    priority_score = Column(Float, default=0.0)
    reason_for_flag = Column(Text, nullable=False)
    
    assigned_officer = Column(String(150), nullable=True)
    assigned_officer_role = Column(String(100), nullable=True, default="District Nodal Officer")
    assigned_by = Column(String(150), nullable=True)
    
    created_date = Column(DateTime, default=datetime.utcnow)
    due_date = Column(String(50), nullable=True)
    resolution_date = Column(DateTime, nullable=True)
    
    # 9-Stage Lifecycle: New, Assigned, Under Verification, Field Inspection, Evidence Review, Action Required, Resolved, Closed, False Positive
    current_status = Column(String(50), default="New", index=True)
    
    officer_notes = Column(Text, nullable=True)
    findings = Column(Text, nullable=True)
    corrective_action = Column(Text, nullable=True)
    closure_reason = Column(String(100), nullable=True)
    is_demo = Column(Boolean, default=True)

    project = relationship("Project", back_populates="investigations")
    evidences = relationship("InvestigationEvidence", back_populates="investigation", cascade="all, delete-orphan")


class InvestigationEvidence(Base):
    __tablename__ = "investigation_evidence"

    id = Column(Integer, primary_key=True, autoincrement=True)
    investigation_id = Column(String(100), ForeignKey("investigations.investigation_id"), nullable=False, index=True)
    project_id = Column(String(100), ForeignKey("projects.project_id"), nullable=False, index=True)
    
    # Evidence Type: Site Photograph, Before Photo, Current Photo, Completion Photo, Measurement Sheet, Inspection Report, Voucher Document
    evidence_type = Column(String(100), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=False)
    file_hash = Column(String(64), nullable=True) # SHA-256 integrity hash
    
    # GPS Field Verification (Phase 6)
    expected_latitude = Column(Float, nullable=True)
    expected_longitude = Column(Float, nullable=True)
    observed_latitude = Column(Float, nullable=True)
    observed_longitude = Column(Float, nullable=True)
    distance_difference_meters = Column(Float, nullable=True)
    gps_timestamp = Column(DateTime, nullable=True)
    
    uploaded_by = Column(String(150), nullable=False)
    uploaded_by_role = Column(String(100), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)
    
    # CV-Ready Visual Verification Signal (Phase 14)
    visual_assessment = Column(String(100), nullable=True) # e.g. "Superstructure Incomplete", "Foundation Stage", "Completed"
    visual_mismatch_flag = Column(Boolean, default=False)

    investigation = relationship("Investigation", back_populates="evidences")
    project = relationship("Project", back_populates="evidences")


class RiskHistory(Base):
    __tablename__ = "risk_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(String(100), ForeignKey("projects.project_id"), nullable=False, index=True)
    recorded_at = Column(String(50), nullable=False) # e.g. "2024-04-15"
    risk_score = Column(Float, nullable=False)
    financial_progress = Column(Float, nullable=False)
    physical_progress = Column(Float, nullable=False)
    expenditure = Column(Float, nullable=False)
    risk_level = Column(String(50), nullable=False)
    trigger_event = Column(String(150), nullable=True, default="Periodic Milestone Scan")

    project = relationship("Project", back_populates="risk_histories")


class IngestionBatch(Base):
    __tablename__ = "ingestion_batches"

    batch_id = Column(String(100), primary_key=True, index=True)
    source_name = Column(String(200), nullable=False)
    source_url = Column(String(300), nullable=True)
    imported_at = Column(DateTime, default=datetime.utcnow)
    data_coverage_period = Column(String(100), nullable=True)
    total_records = Column(Integer, default=0)
    validated_records = Column(Integer, default=0)
    rejected_records = Column(Integer, default=0)
    duplicate_records = Column(Integer, default=0)
    incomplete_records = Column(Integer, default=0)
    manual_review_records = Column(Integer, default=0)
    quality_score = Column(Float, default=100.0)
    status = Column(String(50), default="Completed") # Completed, Partial, Failed


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    actor = Column(String(100), nullable=False, index=True)
    role = Column(String(50), nullable=False, index=True)
    action = Column(String(100), nullable=False, index=True)
    record_id = Column(String(100), nullable=True, index=True)
    investigation_id = Column(String(100), nullable=True, index=True)
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    details = Column(Text, nullable=True)
    comment = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    salt = Column(String(64), nullable=False)
    full_name = Column(String(150), nullable=False)
    role = Column(String(50), nullable=False, index=True)
    designation = Column(String(150), nullable=True)
    state = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

