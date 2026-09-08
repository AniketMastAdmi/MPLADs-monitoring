import type {
  ProjectCard, ProjectDetail, MP, MPPortfolio,
  NationalAnalytics, StateAnalyticsItem, PriorityQueueItem,
  FeedbackSubmission, NLQueryResponse
} from '../types';

const API_BASE = '/api';

export async function fetchProjects(params: Record<string, string | number> = {}): Promise<{
  total: number;
  page: number;
  limit: number;
  pages: number;
  projects: ProjectCard[];
}> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '' && v !== 'all') {
      query.append(k, String(v));
    }
  });
  const res = await fetch(`${API_BASE}/projects?${query.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch projects: ${res.statusText}`);
  return res.json();
}

export async function fetchProjectDetail(projectId: string): Promise<ProjectDetail> {
  const res = await fetch(`${API_BASE}/projects/${encodeURIComponent(projectId)}`);
  if (!res.ok) throw new Error(`Project not found: ${projectId}`);
  return res.json();
}

export async function fetchMapProjects(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/map/projects`);
  if (!res.ok) throw new Error('Failed to fetch map projects');
  return res.json();
}

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
  const res = await fetch(`${API_BASE}/mps?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch MPs');
  return res.json();
}

export async function fetchMPPortfolio(mpId: number): Promise<MPPortfolio> {
  const res = await fetch(`${API_BASE}/mps/${mpId}/portfolio`);
  if (!res.ok) throw new Error(`Failed to load MP portfolio for ID ${mpId}`);
  return res.json();
}

export async function fetchPriorityQueue(): Promise<PriorityQueueItem[]> {
  const res = await fetch(`${API_BASE}/risk/queue`);
  if (!res.ok) throw new Error('Failed to fetch authority priority queue');
  return res.json();
}

export async function fetchNationalAnalytics(): Promise<NationalAnalytics> {
  const res = await fetch(`${API_BASE}/analytics/national`);
  if (!res.ok) throw new Error('Failed to fetch national analytics');
  return res.json();
}

export async function fetchStatesAnalytics(): Promise<StateAnalyticsItem[]> {
  const res = await fetch(`${API_BASE}/analytics/states`);
  if (!res.ok) throw new Error('Failed to fetch state analytics');
  return res.json();
}

export async function submitCitizenFeedback(payload: {
  project_id: string;
  issue_category: string;
  description: string;
  location?: string;
  attachment_url?: string;
  anonymous?: boolean;
}): Promise<{ success: boolean; feedback_id: string; message: string }> {
  const res = await fetch(`${API_BASE}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to submit feedback');
  return res.json();
}

export async function fetchFeedbackStatus(feedbackId: string): Promise<FeedbackSubmission> {
  const res = await fetch(`${API_BASE}/feedback/${encodeURIComponent(feedbackId)}`);
  if (!res.ok) throw new Error('Feedback tracking record not found');
  return res.json();
}

export async function queryNaturalLanguage(query: string): Promise<NLQueryResponse> {
  const res = await fetch(`${API_BASE}/analytics/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error('Natural language query failed');
  return res.json();
}

export async function fetchDataQualityReport(): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/quality`);
  if (!res.ok) throw new Error('Failed to fetch data quality health report');
  return res.json();
}
