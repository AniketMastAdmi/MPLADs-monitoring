export type DataMode = 'all' | 'official' | 'demo';

export type UserRole = 
  | 'PUBLIC / CITIZEN'
  | 'DISTRICT OFFICER'
  | 'STATE ADMIN / NODAL OFFICER'
  | 'MINISTRY / SUPER ADMIN';

export interface MP {
  id: number;
  original_name: string;
  normalized_name: string;
  state: string;
  constituency?: string;
  elected_nominated: string;
  allocation_amount: number;
  allocation_source: string;
  allocation_period?: string;
  match_confidence: number;
}

export interface MPPortfolio {
  mp: MP;
  portfolio: {
    total_projects: number;
    sanctioned_value: number;
    total_expenditure: number;
    remaining_allocation: number;
    utilization_percentage: number;
    completed_works: number;
    delayed_works: number;
    high_risk_works: number;
    portfolio_risk_score: number;
    projects: ProjectCard[];
  };
}

export interface RiskAssessment {
  risk_score: number;
  risk_level: 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
  anomaly_score: number;
  delay_score: number;
  cost_overrun_score: number;
  duplicate_score: number;
  payment_anomaly_score: number;
  progress_mismatch_score: number;
  public_concern_score: number;
  confidence: number;
  explanation: string[];
  recommended_actions: string[];
  similar_project_id?: string;
  similar_project_name?: string;
  similarity_percentage?: number;
  similarity_distance_km?: number;
  similarity_cost_pct?: number;
  similarity_time_gap_months?: number;
  similarity_risk_level?: string;
  peer_median_cost?: number;
  peer_avg_cost?: number;
  peer_p90_cost?: number;
  peer_deviation_pct?: number;
  peer_anomaly_level?: string;
  priority_score?: number;
  priority_breakdown?: Record<string, any>;
  early_warning_level?: string;
  early_warning_signals?: string[];
  disclaimer?: string;
}

export interface PaymentRecord {
  payment_id: string;
  payment_date: string;
  amount: number;
  vendor_reference?: string;
  payment_stage: string;
}

export interface ProgressUpdateRecord {
  update_id: number;
  date: string;
  physical_progress: number;
  financial_progress: number;
  remarks?: string;
}

export interface RiskHistoryPoint {
  recorded_at: string;
  risk_score: number;
  financial_progress: number;
  physical_progress: number;
  expenditure: number;
  risk_level: string;
  trigger_event?: string;
}

export interface InvestigationEvidence {
  id: number;
  investigation_id: string;
  project_id: string;
  evidence_type: string;
  file_name: string;
  file_url: string;
  file_hash?: string;
  expected_latitude?: number;
  expected_longitude?: number;
  observed_latitude?: number;
  observed_longitude?: number;
  distance_difference_meters?: number;
  gps_timestamp?: string;
  uploaded_by: string;
  uploaded_by_role: string;
  uploaded_at: string;
  notes?: string;
  visual_assessment?: string;
  visual_mismatch_flag?: boolean;
}

export interface Investigation {
  investigation_id: string;
  project_id: string;
  work_name?: string;
  state?: string;
  district?: string;
  risk_level: string;
  risk_score: number;
  priority_score: number;
  reason_for_flag: string;
  assigned_officer?: string;
  assigned_officer_role?: string;
  assigned_by?: string;
  created_date: string;
  due_date?: string;
  resolution_date?: string;
  current_status: string; // New, Assigned, Under Verification, Field Inspection, Evidence Review, Action Required, Resolved, Closed, False Positive
  officer_notes?: string;
  findings?: string;
  corrective_action?: string;
  closure_reason?: string;
  is_demo: boolean;
  evidences: InvestigationEvidence[];
}

export interface ProjectCard {
  project_id: string;
  work_name: string;
  mp_name?: string;
  state: string;
  district: string;
  constituency?: string;
  work_type: string;
  work_category?: string;
  sdg_goal?: string;
  sanctioned_amount: number;
  expenditure: number;
  physical_progress: number;
  financial_progress: number;
  status: string;
  expected_completion?: string;
  risk_score: number;
  risk_level: string;
  priority_score?: number;
  source?: string;
  is_demo: boolean;
}

export interface ProjectDetail extends ProjectCard {
  mp_id?: number;
  mp_original_name?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  estimated_cost: number;
  revised_cost: number;
  sanction_date?: string;
  start_date?: string;
  completion_date?: string;
  implementing_agency: string;
  source: string;
  source_name?: string;
  source_url?: string;
  source_record_id?: string;
  imported_at?: string;
  retrieved_at?: string;
  last_updated_at?: string;
  data_version?: string;
  ingestion_batch_id?: string;
  feedback_count?: number;
  risk?: RiskAssessment;
  payments: PaymentRecord[];
  progress_updates: ProgressUpdateRecord[];
  risk_history: RiskHistoryPoint[];
  investigations: Investigation[];
  evidences: InvestigationEvidence[];
}

export interface PriorityQueueItem {
  project_id: string;
  work_name: string;
  state: string;
  district: string;
  sanctioned_amount: number;
  expenditure: number;
  risk_score: number;
  risk_level: string;
  priority_rank_score: number;
  work_category?: string;
  primary_flags: string[];
  public_reports_count: number;
  is_demo?: boolean;
}

export interface NationalAnalytics {
  total_allocated: number;
  total_sanctioned: number;
  total_expenditure: number;
  overall_utilization: number;
  total_works: number;
  completed_works: number;
  in_progress_works: number;
  delayed_works: number;
  high_risk_works: number;
  critical_investigations: number;
  overdue_investigations: number;
  public_reports_count: number;
  data_quality_score: number;
  last_data_update: string;
  high_risk_states: { state: string; count: number; rate: number }[];
  work_type_distribution: { type: string; count: number }[];
  risk_level_distribution: { level: string; count: number; color: string }[];
  source_transparency: {
    source_datasets: string;
    ingestion_method: string;
    health_score: number;
  };
}

export interface StateAnalyticsItem {
  state: string;
  mp_count: number;
  total_allocated: number;
  total_sanctioned: number;
  total_expenditure: number;
  utilization_percentage: number;
  total_projects: number;
  completed_projects: number;
  delayed_projects: number;
  high_risk_projects: number;
  avg_cost_deviation: number;
  public_feedback_count: number;
  investigation_closure_rate: number;
}

export interface DataHealthFreshness {
  source_name: string;
  source_url: string;
  last_synchronization: string;
  data_coverage_period: string;
  total_records: number;
  validated_records: number;
  rejected_records: number;
  duplicate_records: number;
  incomplete_records: number;
  manual_review_records: number;
  quality_score: number;
  batch_id: string;
  status: string;
  provenance_details: Record<string, any>;
}

export interface ProvenanceDetail {
  project_id: string;
  work_name: string;
  source: string;
  source_name: string;
  source_url: string;
  source_record_id: string;
  data_mode: string;
  imported_at: string;
  retrieved_at: string;
  last_updated_at: string;
  data_version: string;
  ingestion_batch_id: string;
  implementing_agency: string;
  is_demo: boolean;
  audit_trace: {
    immutable_record_hash: string;
    disclaimer: string;
  };
}

export interface ModelEvaluationMetrics {
  is_synthetic_evaluation: boolean;
  evaluation_dataset_name: string;
  evaluated_records_count: number;
  known_anomalies_count: number;
  correctly_detected_count: number;
  precision: number;
  recall: number;
  f1_score: number;
  false_positive_rate: number;
  disclaimer: string;
}

export interface SDGAnalytics {
  sdg_distribution: {
    sdg_goal: string;
    project_count: number;
    sanctioned_amount: number;
    expenditure: number;
    utilization_pct: number;
  }[];
  total_sanctioned_mapped: number;
}

export interface AuditLogItem {
  id: number;
  actor: string;
  role: string;
  action: string;
  record_id?: string;
  investigation_id?: string;
  old_value?: string;
  new_value?: string;
  details?: string;
  timestamp: string;
}

export interface PublicConcernCluster {
  total_complaints: number;
  concern_level: string;
  top_issues: { issue: string; count: number; percentage: number }[];
  status_breakdown: Record<string, number>;
  anti_spam_safeguards?: string;
}

export interface FeedbackSubmission {
  feedback_id: string;
  project_id: string;
  project_name?: string;
  issue_category: string;
  description: string;
  status: string;
  priority: string;
  ai_category?: string;
  created_at: string;
}

export interface NLQueryResponse {
  query: string;
  interpreted_intent: string;
  direct_answer: string;
  data_summary: Record<string, any>;
  results: any[];
  confidence: number;
  data_source: string;
  records_analyzed_count: number;
  filters_applied: string;
  time_period: string;
  aggregation_method: string;
  calculation_notes: string;
}
