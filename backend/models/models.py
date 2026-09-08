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
    source = Column(String(100), default="Demonstration Dataset")
    is_demo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    mp = relationship("MP", back_populates="projects")
    payments = relationship("Payment", back_populates="project", cascade="all, delete-orphan")
    progress_updates = relationship("ProgressUpdate", back_populates="project", cascade="all, delete-orphan")
    risk_assessment = relationship("RiskAssessment", back_populates="project", uselist=False, cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="project", cascade="all, delete-orphan")


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
    
    confidence = Column(Float, default=0.85)
    risk_level = Column(String(50), default="LOW", index=True) # LOW, MODERATE, ELEVATED, HIGH, CRITICAL
    
    # Explainable AI details
    explanation = Column(Text, nullable=False, default="[]") # JSON list of reasons
    recommended_actions = Column(Text, nullable=False, default="[]") # JSON list of actions
    similar_project_id = Column(String(100), nullable=True)
    similar_project_name = Column(String(300), nullable=True)
    similarity_percentage = Column(Float, nullable=True)
    
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
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="feedbacks")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    actor = Column(String(100), nullable=False)
    role = Column(String(50), nullable=False)
    action = Column(String(100), nullable=False)
    record_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
