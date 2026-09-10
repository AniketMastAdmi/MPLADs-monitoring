import type {
  ProjectCard, ProjectDetail, MP, MPPortfolio,
  NationalAnalytics, StateAnalyticsItem, PriorityQueueItem,
  FeedbackSubmission, NLQueryResponse, Investigation,
  InvestigationEvidence, DataHealthFreshness, ProvenanceDetail,
  ModelEvaluationMetrics, SDGAnalytics, AuditLogItem,
  PublicConcernCluster, DataMode, UserRole
} from '../types';

const API_BASE = '/api';

// Current active role & token for RBAC
let currentActiveRole: UserRole = 'PUBLIC / CITIZEN';
let currentAuthToken: string | null = null;

export function setAuthToken(token: string | null) {
  currentAuthToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('mplads_auth_token', token);
    } else {
      localStorage.removeItem('mplads_auth_token');
    }
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('mplads_auth_token');
    if (saved) return saved;
  }
  return currentAuthToken;
}

export function setActiveRole(role: UserRole) {
  currentActiveRole = role;
  if (typeof window !== 'undefined') {
    localStorage.setItem('mplads_active_role', role);
  }
}

export function getActiveRole(): UserRole {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('mplads_active_role') as UserRole;
    if (saved) return saved;
  }
  return currentActiveRole;
}

export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'X-User-Role': getActiveRole()
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Authentication API
export async function loginUser(credentials: { username: string; password: string }): Promise<{
  access_token: string;
  token_type: string;
  user: {
    id: number;
    username: string;
    full_name: string;
    role: UserRole;
    designation?: string;
    state?: string;
    district?: string;
  };
}> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Authentication failed');
  }
  const data = await res.json();
  setAuthToken(data.access_token);
  setActiveRole(data.user.role as UserRole);
  return data;
}

export async function fetchCurrentProfile(): Promise<any> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch user profile');
  return res.json();
}


// 1. Projects
export async function fetchProjects(params: Record<string, string | number | boolean> = {}): Promise<{
  total: number;
  page: number;
  limit: number;
  pages: number;
  data_mode: string;
  projects: ProjectCard[];
}> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '' && v !== 'all') {
      query.append(k, String(v));
    }
  });
  const res = await fetch(`${API_BASE}/projects?${query.toString()}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error(`Failed to fetch projects: ${res.statusText}`);
  return res.json();
}

export async function fetchProjectDetail(projectId: string): Promise<ProjectDetail> {
  const res = await fetch(`${API_BASE}/projects/${encodeURIComponent(projectId)}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error(`Project not found: ${projectId}`);
  return res.json();
}

export async function fetchProjectProvenance(projectId: string): Promise<ProvenanceDetail> {
  const res = await fetch(`${API_BASE}/projects/${encodeURIComponent(projectId)}/provenance`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error(`Provenance not found for ${projectId}`);
  return res.json();
}

export async function fetchProjectGrievanceCluster(projectId: string): Promise<PublicConcernCluster> {
  const res = await fetch(`${API_BASE}/projects/${encodeURIComponent(projectId)}/grievance-cluster`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error(`Failed to load grievance cluster for ${projectId}`);
  return res.json();
}

// 2. Data Health & Freshness (Phase 1)
export async function fetchDataHealth(): Promise<DataHealthFreshness> {
  const res = await fetch(`${API_BASE}/data/health`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch data health metrics');
  return res.json();
}

export async function fetchDataQualityReport(): Promise<any> {
  const res = await fetch(`${API_BASE}/data/health`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch data quality report');
  return res.json();
}

export async function fetchMapProjects(params: {
  data_mode?: string;
  state?: string;
  risk_level?: string;
} = {}): Promise<{
  mapped_projects: any[];
  summary: {
    mapped_count: number;
    location_missing_count: number;
    simulated_location_count: number;
    total_candidates: number;
    data_mode: string;
  };
}> {
  const query = new URLSearchParams();
  if (params.data_mode && params.data_mode !== 'all') query.append('data_mode', params.data_mode);
  if (params.state && params.state !== 'all') query.append('state', params.state);
  if (params.risk_level && params.risk_level !== 'all') query.append('risk_level', params.risk_level);

  const res = await fetch(`${API_BASE}/map/projects?${query.toString()}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch map projects');
  return res.json();
}

// CSV Ingestion Workflows (Preview & Commit)
export async function previewCsvImport(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/admin/import/preview`, {
    method: 'POST',
    headers: {
      'X-User-Role': getActiveRole(),
      ...(getAuthToken() ? { 'Authorization': `Bearer ${getAuthToken()}` } : {})
    },
    body: formData
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to generate CSV preview');
  }
  return res.json();
}

export async function commitCsvImport(tempBatchId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/import/commit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ temp_batch_id: tempBatchId })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to commit CSV import');
  }
  return res.json();
}


// 3. Human-in-the-Loop Investigations (Phase 5 & 6)
export async function fetchInvestigations(params: Record<string, string | number> = {}): Promise<{
  total: number;
  page: number;
  limit: number;
  investigations: Investigation[];
}> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '' && v !== 'all') {
      query.append(k, String(v));
    }
  });
  const res = await fetch(`${API_BASE}/investigations?${query.toString()}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch investigations');
  return res.json();
}

export async function fetchInvestigationSummary(): Promise<{
  total_investigations: number;
  pending_investigations: number;
  overdue_investigations: number;
  high_risk_investigations: number;
  recently_resolved_count: number;
  false_positive_count: number;
  average_resolution_days: number;
}> {
  const res = await fetch(`${API_BASE}/investigations/summary`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch investigation summary');
  return res.json();
}

export async function createInvestigation(payload: {
  project_id: string;
  reason_for_flag: string;
  assigned_officer?: string;
  assigned_officer_role?: string;
  due_date?: string;
  officer_notes?: string;
}): Promise<Investigation> {
  const res = await fetch(`${API_BASE}/investigations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to create investigation');
  }
  return res.json();
}

export async function updateInvestigation(
  investigationId: string,
  payload: {
    assigned_officer?: string;
    current_status?: string;
    officer_notes?: string;
    findings?: string;
    corrective_action?: string;
    closure_reason?: string;
  }
): Promise<Investigation> {
  const res = await fetch(`${API_BASE}/investigations/${encodeURIComponent(investigationId)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update investigation');
  }
  return res.json();
}

export async function uploadInvestigationEvidence(
  investigationId: string,
  formData: FormData
): Promise<InvestigationEvidence> {
  const res = await fetch(`${API_BASE}/investigations/${encodeURIComponent(investigationId)}/evidence`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to upload field evidence');
  }
  return res.json();
}

// 4. Audit Trail (Phase 9)
export async function fetchAuditLogs(params: Record<string, string | number> = {}): Promise<{
  total: number;
  page: number;
  limit: number;
  logs: AuditLogItem[];
}> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '' && v !== 'all') {
      query.append(k, String(v));
    }
  });
  const res = await fetch(`${API_BASE}/audit/logs?${query.toString()}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return res.json();
}

// 5. Model Evaluation (Phase 13)
export async function fetchModelEvaluation(): Promise<ModelEvaluationMetrics> {
  const res = await fetch(`${API_BASE}/analytics/model-evaluation`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch model evaluation');
  return res.json();
}

// 6. SDG & Benchmarking (Phase 16 & 17)
export async function fetchSDGAnalytics(dataMode: DataMode = 'all'): Promise<SDGAnalytics> {
  const res = await fetch(`${API_BASE}/analytics/sdg?data_mode=${dataMode}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch SDG analytics');
  return res.json();
}

export async function fetchBenchmarks(dataMode: DataMode = 'all'): Promise<{
  data_mode: string;
  states: any[];
}> {
  const res = await fetch(`${API_BASE}/analytics/benchmarks?data_mode=${dataMode}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch state benchmarks');
  return res.json();
}

// 7. National & State Analytics (Phase 15)
export async function fetchNationalAnalytics(dataMode: DataMode = 'all'): Promise<NationalAnalytics> {
  const res = await fetch(`${API_BASE}/analytics/national?data_mode=${dataMode}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch national analytics');
  return res.json();
}

export async function fetchStatesAnalytics(): Promise<StateAnalyticsItem[]> {
  const res = await fetch(`${API_BASE}/analytics/states`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch state analytics');
  return res.json();
}

// 8. Priority Review Queue (Phase 12)
export async function fetchPriorityQueue(dataMode: DataMode = 'all', limit = 20): Promise<PriorityQueueItem[]> {
  const res = await fetch(`${API_BASE}/queue?data_mode=${dataMode}&limit=${limit}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch authority priority queue');
  return res.json();
}

// 9. MPs
export async function fetchMPs(params: Record<string, string | number> = {}): Promise<{
  total: number;
  page: number;
  limit: number;
  pages: number;
  mps: MP[];
}> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '' && v !== 'all') {
      query.append(k, String(v));
    }
  });
  const res = await fetch(`${API_BASE}/mps?${query.toString()}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch MPs');
  return res.json();
}

export async function fetchMPPortfolio(mpId: number): Promise<MPPortfolio> {
  const res = await fetch(`${API_BASE}/mps/${mpId}/portfolio`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error(`Failed to load MP portfolio for ID ${mpId}`);
  return res.json();
}

// 10. Grievance / Feedback
export async function submitCitizenFeedback(payload: {
  project_id: string;
  issue_category: string;
  description: string;
  location?: string;
  attachment_url?: string;
  anonymous?: boolean;
}): Promise<FeedbackSubmission & { message?: string }> {
  const res = await fetch(`${API_BASE}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to submit feedback');
  const data = await res.json();
  return {
    ...data,
    message: "Grievance submitted successfully. Tracking ID assigned."
  };
}

export async function fetchFeedbackStatus(feedbackId: string): Promise<FeedbackSubmission> {
  const res = await fetch(`${API_BASE}/feedback/${encodeURIComponent(feedbackId)}`);
  if (!res.ok) throw new Error('Feedback tracking record not found');
  return res.json();
}

// 11. Traceable Natural Language Query (Phase 18)
export async function queryNaturalLanguage(query: string): Promise<NLQueryResponse> {
  const res = await fetch(`${API_BASE}/nl/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error('Natural language query failed');
  return res.json();
}

// 12. Admin & Demo Management
export async function resetDemoDataset(): Promise<{ status: string; message: string }> {
  const res = await fetch(`${API_BASE}/admin/reset-demo`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to reset demo dataset');
  return res.json();
}
