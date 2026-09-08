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

export interface ProjectCard {
  project_id: string;
  work_name: string;
  mp_name?: string;
  state: string;
  district: string;
  constituency?: string;
  work_type: string;
  sanctioned_amount: number;
  expenditure: number;
  physical_progress: number;
  financial_progress: number;
  status: string;
  expected_completion?: string;
  risk_score: number;
  risk_level: string;
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
  feedback_count: number;
  risk?: RiskAssessment;
  payments: PaymentRecord[];
  progress_updates: ProgressUpdateRecord[];
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
  primary_flags: string[];
  public_reports_count: number;
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
  public_reports_count: number;
  high_risk_states: { state: string; total_works: number; avg_risk: number }[];
  work_type_distribution: { work_type: string; count: number; expenditure: number }[];
  risk_level_distribution: { level: string; count: number }[];
  source_transparency: {
    primary_source: string;
    mp_allocation_datasets: string;
    coverage_date: string;
    project_records_type: string;
    last_updated: string;
    disclaimer: string;
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
}
