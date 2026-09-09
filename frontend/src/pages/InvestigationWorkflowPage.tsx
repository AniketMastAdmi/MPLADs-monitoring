import React, { useState, useEffect } from 'react';
import { 
  Shield, CheckCircle2, Clock, AlertTriangle, Search, 
  Filter, ArrowRight, User, FileText, ChevronRight,
  Plus, Check, Eye
} from 'lucide-react';
import { Investigation, UserRole, DataMode } from '../types';
import { fetchInvestigations, fetchInvestigationSummary, getActiveRole } from '../services/api';

interface InvestigationWorkflowPageProps {
  onSelectProject: (projectId: string) => void;
  dataMode?: DataMode;
}

const STAGES = [
  "AI FLAGGED",
  "ASSIGNED",
  "UNDER VERIFICATION",
  "FIELD INSPECTION",
  "EVIDENCE REVIEW",
  "FINDING RECORDED",
  "ACTION TAKEN",
  "CLOSED"
];

export const InvestigationWorkflowPage: React.FC<InvestigationWorkflowPageProps> = ({
  onSelectProject,
  dataMode = 'all'
}) => {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [activeRole, setActiveRole] = useState<UserRole>('PUBLIC / CITIZEN');

  useEffect(() => {
    setActiveRole(getActiveRole());
    loadData();
  }, [dataMode, statusFilter, riskFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [listRes, sumRes] = await Promise.all([
        fetchInvestigations({
          status: statusFilter,
          risk_level: riskFilter,
          data_mode: dataMode
        }),
        fetchInvestigationSummary()
      ]);
      setInvestigations(listRes.investigations);
      setSummary(sumRes);
    } catch (err) {
      console.error("Failed to load investigations", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvs = investigations.filter(inv => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      inv.investigation_id.toLowerCase().includes(term) ||
      inv.project_id.toLowerCase().includes(term) ||
      (inv.work_name && inv.work_name.toLowerCase().includes(term)) ||
      (inv.assigned_officer && inv.assigned_officer.toLowerCase().includes(term)) ||
      (inv.district && inv.district.toLowerCase().includes(term))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div>
        <div className="flex items-center space-x-2">
          <Shield className="w-6 h-6 text-gov-navy" />
          <h1 className="text-2xl font-bold text-gov-navy">Human-in-the-Loop Investigation Workflow</h1>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Structured governance lifecycle from automated AI anomaly detection to field verification, officer findings, and corrective action
        </p>
      </div>

      {/* 1. 9-STAGE LIFECYCLE PROGRESSION BANNER (Phase 5) */}
      <div className="bg-white border border-gov-border rounded-lg p-4 shadow-sm overflow-x-auto">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-3">
          Official Administrative Verification Lifecycle
        </span>
        <div className="flex items-center space-x-1 min-w-[760px]">
          {STAGES.map((stage, idx) => (
            <React.Fragment key={idx}>
              <div className="flex-1 text-center py-2 px-1 rounded bg-gray-50 border border-gray-200">
                <span className="text-[9px] font-bold text-gray-400 block">Step 0{idx + 1}</span>
                <span className="text-[10px] font-bold text-gov-navy">{stage}</span>
              </div>
              {idx < STAGES.length - 1 && (
                <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 2. SUMMARY METRIC TILES (Phase 5) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-gov-border p-3.5 rounded-lg shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase">Pending Cases</span>
          <div className="text-xl font-bold text-gov-navy">{summary?.pending_investigations ?? 3}</div>
          <span className="text-[10px] text-gray-400">Under Review</span>
        </div>
        <div className="bg-white border border-gov-border p-3.5 rounded-lg shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-red-700 uppercase">Overdue Cases</span>
          <div className="text-xl font-bold text-red-700">{summary?.overdue_investigations ?? 1}</div>
          <span className="text-[10px] text-red-500">Past Target Date</span>
        </div>
        <div className="bg-white border border-gov-border p-3.5 rounded-lg shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-amber-700 uppercase">Critical / High Risk</span>
          <div className="text-xl font-bold text-amber-700">{summary?.high_risk_investigations ?? 2}</div>
          <span className="text-[10px] text-amber-600">Risk Score ≥ 70</span>
        </div>
        <div className="bg-white border border-gov-border p-3.5 rounded-lg shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-emerald-700 uppercase">Resolved</span>
          <div className="text-xl font-bold text-emerald-700">{summary?.recently_resolved_count ?? 1}</div>
          <span className="text-[10px] text-emerald-600">Corrective Actions</span>
        </div>
        <div className="bg-white border border-gov-border p-3.5 rounded-lg shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-blue-700 uppercase">False Positives</span>
          <div className="text-xl font-bold text-blue-700">{summary?.false_positive_count ?? 1}</div>
          <span className="text-[10px] text-blue-500">Cleared by Inspection</span>
        </div>
        <div className="bg-white border border-gov-border p-3.5 rounded-lg shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-gray-700 uppercase">Avg Resolution</span>
          <div className="text-xl font-bold text-gov-navy">{summary?.average_resolution_days ?? 18.4} d</div>
          <span className="text-[10px] text-gray-400">Target: &lt; 30 Days</span>
        </div>
      </div>

      {/* 3. FILTER BAR */}
      <div className="bg-white border border-gov-border rounded-lg p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between text-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Investigation ID, Project Name, Officer, or District..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded focus:border-gov-blue focus:outline-none text-xs"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="New">New</option>
            <option value="Assigned">Assigned</option>
            <option value="Under Verification">Under Verification</option>
            <option value="Field Inspection">Field Inspection</option>
            <option value="Evidence Review">Evidence Review</option>
            <option value="Action Required">Action Required</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
            <option value="False Positive">False Positive</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700 focus:outline-none"
          >
            <option value="all">All Risk Tiers</option>
            <option value="CRITICAL">Critical Risk</option>
            <option value="HIGH">High Risk</option>
            <option value="ELEVATED">Elevated</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* 4. INVESTIGATIONS TABLE */}
      <div className="bg-white border border-gov-border rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Investigation ID</th>
                <th className="py-3 px-4">Project & Location</th>
                <th className="py-3 px-4">Risk & Priority</th>
                <th className="py-3 px-4">Assigned Officer</th>
                <th className="py-3 px-4">Lifecycle Status</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    Loading investigations registry...
                  </td>
                </tr>
              ) : filteredInvs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    No investigations matching the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredInvs.map((inv) => (
                  <tr key={inv.investigation_id} className="hover:bg-gray-50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-gov-navy">
                      {inv.investigation_id}
                      {inv.is_demo && (
                        <span className="block text-[9px] font-bold text-amber-700">DEMO SIMULATION</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-gov-navy truncate">{inv.work_name || inv.project_id}</div>
                      <div className="text-[11px] text-gray-500">{inv.district}, {inv.state}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                        inv.risk_level === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        Score: {inv.risk_score}
                      </span>
                      <span className="block text-[10px] text-gray-500 mt-0.5">
                        Priority: {inv.priority_score}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-800">{inv.assigned_officer || 'Unassigned'}</div>
                      <div className="text-[10px] text-gray-400">{inv.assigned_officer_role}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        inv.current_status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inv.current_status === 'False Positive'
                          ? 'bg-gray-100 text-gray-700'
                          : inv.current_status === 'Action Required'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {inv.current_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 font-mono">
                      {inv.due_date || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onSelectProject(inv.project_id)}
                        className="px-3 py-1 bg-gov-navy text-white rounded text-[11px] font-semibold hover:bg-gov-navyLight transition inline-flex items-center space-x-1"
                      >
                        <span>Evidence Dossier</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
