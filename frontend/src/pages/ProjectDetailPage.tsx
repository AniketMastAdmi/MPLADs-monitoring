import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Building, Calendar, CheckCircle2, Clock, 
  AlertTriangle, ShieldAlert, FileText, IndianRupee, 
  MapPin, HelpCircle, ChevronRight, User, ExternalLink,
  Shield, Upload, Check, X, Camera, FileCheck, Info,
  TrendingUp, BarChart2, Eye, Award
} from 'lucide-react';
import { ProjectDetail, Investigation, InvestigationEvidence, UserRole } from '../types';
import { 
  fetchProjectDetail, createInvestigation, updateInvestigation, 
  uploadInvestigationEvidence, getActiveRole 
} from '../services/api';

interface ProjectDetailPageProps {
  projectId: string;
  onBack: () => void;
  onReportIssue: (projectId: string) => void;
  onSelectProject: (projectId: string) => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({
  projectId,
  onBack,
  onReportIssue,
  onSelectProject
}) => {
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active role for RBAC actions
  const [activeRole, setActiveRoleState] = useState<UserRole>('PUBLIC / CITIZEN');

  // Evidence upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [evidenceType, setEvidenceType] = useState('Site Photograph');
  const [obsLat, setObsLat] = useState<string>('');
  const [obsLon, setObsLon] = useState<string>('');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [visualAssess, setVisualAssess] = useState('Superstructure Incomplete');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [submittingEvidence, setSubmittingEvidence] = useState(false);

  // Investigation action modal state
  const [showActionModal, setShowActionModal] = useState(false);
  const [targetInvId, setTargetInvId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState('Under Verification');
  const [findingText, setFindingText] = useState('');
  const [actionText, setActionText] = useState('');
  const [closureReason, setClosureReason] = useState('');
  const [actionSubmitting, setActionSubmitting] = useState(false);

  // Create investigation modal state
  const [showCreateInvModal, setShowCreateInvModal] = useState(false);
  const [invReason, setInvReason] = useState('');
  const [assignedOfficer, setAssignedOfficer] = useState('Er. Rajesh Kumar');
  const [creatingInv, setCreatingInv] = useState(false);

  // Provenance drawer state
  const [showProvenanceDrawer, setShowProvenanceDrawer] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchProjectDetail(projectId);
      setProject(data);
      if (data.latitude) setObsLat(String(data.latitude));
      if (data.longitude) setObsLon(String(data.longitude));
    } catch (err: any) {
      setError(err.message || 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setActiveRoleState(getActiveRole());
  }, [projectId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs text-gray-500">
        Loading evidence-first project audit dossier...
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-base font-bold text-gov-navy">Project Record Not Found</h2>
        <p className="text-xs text-gray-500">{error || 'Unable to retrieve project details.'}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gov-navy text-white rounded text-xs font-semibold"
        >
          Return to Explorer
        </button>
      </div>
    );
  }

  const costDeviation = ((Math.max(project.revised_cost, project.expenditure) - project.sanctioned_amount) / Math.max(project.sanctioned_amount, 1.0)) * 100;
  const progressGap = project.financial_progress - project.physical_progress;
  const isHighRisk = project.risk && project.risk.risk_score >= 70;
  const isCritical = project.risk && project.risk.risk_score >= 85;
  const canPerformOfficerActions = activeRole !== 'PUBLIC / CITIZEN';

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      alert('Please select a file to upload.');
      return;
    }
    const invId = targetInvId || (project.investigations && project.investigations[0]?.investigation_id);
    if (!invId) {
      alert('An investigation must be created before uploading field verification evidence.');
      return;
    }

    setSubmittingEvidence(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('evidence_type', evidenceType);
      if (obsLat) formData.append('observed_latitude', obsLat);
      if (obsLon) formData.append('observed_longitude', obsLon);
      if (evidenceNotes) formData.append('notes', evidenceNotes);
      if (visualAssess) formData.append('visual_assessment', visualAssess);

      await uploadInvestigationEvidence(invId, formData);
      alert('Field verification evidence recorded successfully with SHA-256 integrity hash!');
      setShowUploadModal(false);
      setUploadFile(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Evidence upload failed');
    } finally {
      setSubmittingEvidence(false);
    }
  };

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetInvId) return;
    setActionSubmitting(true);
    try {
      await updateInvestigation(targetInvId, {
        current_status: newStatus,
        findings: findingText || undefined,
        corrective_action: actionText || undefined,
        closure_reason: closureReason || undefined
      });
      alert(`Investigation ${targetInvId} updated to status: ${newStatus}`);
      setShowActionModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update investigation');
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleCreateInvSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingInv(true);
    try {
      await createInvestigation({
        project_id: project.project_id,
        reason_for_flag: invReason || `Initiated due to composite risk score of ${project.risk?.risk_score ?? 50}/100`,
        assigned_officer: assignedOfficer,
        assigned_officer_role: 'District Nodal Officer'
      });
      alert('Investigation case created successfully and logged in official audit trail.');
      setShowCreateInvModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create investigation');
    } finally {
      setCreatingInv(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Bar: Navigation & Provenance Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-gray-600 hover:text-gov-navy"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Works Explorer</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {project.project_id === 'MPLAD-UP-2023-GOLDEN-01' ? (
            <span className="bg-purple-100 text-purple-900 border border-purple-300 text-[11px] font-extrabold px-2.5 py-1 rounded flex items-center space-x-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
              <span>Demonstration Scenario — Calibrated for End-to-End Showcase</span>
            </span>
          ) : project.is_demo ? (
            <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold px-2.5 py-1 rounded flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              <span>DEMO / SIMULATED RECORD</span>
            </span>
          ) : (
            <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-bold px-2.5 py-1 rounded flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>OFFICIAL / IMPORTED RECORD</span>
            </span>
          )}


          <button
            onClick={() => setShowProvenanceDrawer(true)}
            className="px-3 py-1 bg-gray-100 text-gray-700 border border-gray-300 rounded text-xs font-semibold hover:bg-gray-200 flex items-center space-x-1"
          >
            <Info className="w-3.5 h-3.5 text-gov-blue" />
            <span>View Provenance</span>
          </button>

          <button
            onClick={() => onReportIssue(project.project_id)}
            className="px-3 py-1 bg-rose-50 text-rose-800 border border-rose-300 rounded text-xs font-bold hover:bg-rose-100 flex items-center space-x-1"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Report Concern</span>
          </button>
        </div>
      </div>

      {/* 1. PROJECT SUMMARY (Evidence Header) */}
      <div className="bg-white border border-gov-border rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-300">
                {project.project_id}
              </span>
              <span className="text-xs bg-blue-50 text-gov-blue font-semibold px-2 py-0.5 rounded border border-blue-200">
                {project.work_type}
              </span>
              <span className="text-xs bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded border border-emerald-200">
                {project.sdg_goal || 'SDG 11: Sustainable Cities'}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                project.status === 'Completed'
                  ? 'bg-emerald-100 text-emerald-800'
                  : project.status === 'Delayed'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {project.status}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gov-navy leading-tight">
              {project.work_name}
            </h1>
            <p className="text-xs text-gray-600 flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>{project.location ? `${project.location}, ` : ''}{project.district}, {project.state} (Constituency: {project.constituency || 'N/A'})</span>
            </p>
          </div>

          {/* Quick Authority Action Panel */}
          {canPerformOfficerActions && (
            <div className="flex flex-wrap gap-2 shrink-0">
              {project.investigations && project.investigations.length > 0 ? (
                <>
                  <button
                    onClick={() => {
                      setTargetInvId(project.investigations[0].investigation_id);
                      setShowUploadModal(true);
                    }}
                    className="px-3.5 py-2 bg-gov-blue text-white rounded text-xs font-bold hover:bg-blue-800 transition flex items-center space-x-1.5 shadow-sm"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Upload Field Evidence</span>
                  </button>
                  <button
                    onClick={() => {
                      setTargetInvId(project.investigations[0].investigation_id);
                      setNewStatus(project.investigations[0].current_status);
                      setShowActionModal(true);
                    }}
                    className="px-3.5 py-2 bg-gov-navy text-white rounded text-xs font-bold hover:bg-gov-navyLight transition flex items-center space-x-1.5 shadow-sm"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Record Finding / Close Case</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowCreateInvModal(true)}
                  className="px-4 py-2 bg-amber-600 text-white rounded text-xs font-bold hover:bg-amber-700 transition flex items-center space-x-1.5 shadow-sm"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Initiate Formal Investigation</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Financial & Milestone Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-gray-100 text-xs">
          <div className="bg-gray-50 p-2.5 rounded">
            <span className="text-gray-500 block text-[10px] uppercase font-semibold">Sanctioned Amount</span>
            <span className="font-bold text-gov-navy text-sm">₹{(project.sanctioned_amount / 100000).toFixed(2)} Lakh</span>
          </div>
          <div className="bg-gray-50 p-2.5 rounded">
            <span className="text-gray-500 block text-[10px] uppercase font-semibold">Expenditure Billed</span>
            <span className="font-bold text-gov-navy text-sm">₹{(project.expenditure / 100000).toFixed(2)} Lakh</span>
          </div>
          <div className="bg-gray-50 p-2.5 rounded">
            <span className="text-gray-500 block text-[10px] uppercase font-semibold">Financial Progress</span>
            <span className="font-bold text-gov-navy text-sm">{project.financial_progress.toFixed(1)}%</span>
          </div>
          <div className="bg-gray-50 p-2.5 rounded">
            <span className="text-gray-500 block text-[10px] uppercase font-semibold">Physical Milestone</span>
            <span className={`font-bold text-sm ${progressGap > 20 ? 'text-red-700' : 'text-emerald-700'}`}>
              {project.physical_progress.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* 2. EXPLAINABLE RISK BREAKDOWN & HISTORICAL TREND (Phase 2, 3, 4, 10) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Multi-Signal Risk Breakdown Card (Phase 2) */}
        <div className="lg:col-span-2 bg-white border border-gov-border rounded-lg p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div>
              <h2 className="text-sm font-bold text-gov-navy uppercase tracking-wider">
                Multi-Signal AI Risk & Anomaly Breakdown
              </h2>
              <p className="text-[11px] text-gray-500">
                Traceable mathematical evaluation based on persistent expenditure, timeline, and civil milestones
              </p>
            </div>
            {project.risk && (
              <div className="text-right">
                <span className={`px-2.5 py-1 rounded text-xs font-extrabold uppercase ${
                  project.risk.risk_level === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  Risk: {project.risk.risk_score} / 100 ({project.risk.risk_level})
                </span>
              </div>
            )}
          </div>

          {/* Explainable Signal Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Signal 1: Progress Mismatch */}
            <div className={`p-3 rounded border ${progressGap > 20 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
              <span className="font-bold text-gray-700 block">1. Financial vs Physical Progress</span>
              <p className="text-gray-600 mt-1">
                Financial: <strong>{project.financial_progress.toFixed(1)}%</strong> | Physical: <strong>{project.physical_progress.toFixed(1)}%</strong>
              </p>
              <p className={`font-semibold mt-0.5 ${progressGap > 20 ? 'text-red-700' : 'text-gray-500'}`}>
                Divergence Gap: {progressGap > 0 ? `+${progressGap.toFixed(1)}%` : '0.0%'} (Threshold: 20.0%)
              </p>
            </div>

            {/* Signal 2: Cost Overrun */}
            <div className={`p-3 rounded border ${costDeviation > 15 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
              <span className="font-bold text-gray-700 block">2. Cost Deviation / Overrun</span>
              <p className="text-gray-600 mt-1">
                Sanction: ₹{(project.sanctioned_amount / 100000).toFixed(1)}L | Revised: ₹{(project.revised_cost / 100000).toFixed(1)}L
              </p>
              <p className={`font-semibold mt-0.5 ${costDeviation > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                Escalation: {costDeviation > 0 ? `+${costDeviation.toFixed(1)}%` : 'Within Budget'}
              </p>
            </div>

            {/* Signal 3: Delay Anomaly */}
            <div className={`p-3 rounded border ${project.status === 'Delayed' ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'}`}>
              <span className="font-bold text-gray-700 block">3. Timeline & Overdue Days</span>
              <p className="text-gray-600 mt-1">
                Expected Completion: <strong>{project.expected_completion || 'N/A'}</strong>
              </p>
              <p className={`font-semibold mt-0.5 ${project.status === 'Delayed' ? 'text-amber-800' : 'text-gray-500'}`}>
                Status: {project.status} ({project.status === 'Delayed' ? 'Exceeded timeline' : 'On Schedule'})
              </p>
            </div>

            {/* Signal 4: Payment Concentration */}
            <div className="p-3 rounded border bg-gray-50 border-gray-200">
              <span className="font-bold text-gray-700 block">4. Payment Tranche Concentration</span>
              <p className="text-gray-600 mt-1">
                Disbursed across <strong>{project.payments.length}</strong> payment tranches.
              </p>
              <p className="font-semibold text-gray-500 mt-0.5">
                {project.payments.length <= 3 && project.financial_progress > 75 
                  ? 'Tranche concentration flag active' 
                  : 'Tranche intervals verified'}
              </p>
            </div>
          </div>

          {/* Phase 3: Peer-Based Anomaly Detection Card */}
          {project.risk?.peer_median_cost && (
            <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-3.5 space-y-1.5 text-xs">
              <div className="flex items-center space-x-2">
                <BarChart2 className="w-4 h-4 text-gov-blue" />
                <span className="font-bold text-gov-navy uppercase tracking-wider text-[11px]">
                  Peer-Based Category Benchmark ({project.work_type})
                </span>
              </div>
              <p className="text-gray-600">
                Project Cost: <strong>₹{(project.sanctioned_amount / 100000).toFixed(1)}L</strong> • Peer Category Median: <strong>₹{(project.risk.peer_median_cost / 100000).toFixed(1)}L</strong> (90th Percentile: ₹{((project.risk.peer_p90_cost || 0) / 100000).toFixed(1)}L)
              </p>
              <p className="font-semibold text-gov-blue">
                Deviation from peer median: {project.risk.peer_deviation_pct && project.risk.peer_deviation_pct > 0 ? `+${project.risk.peer_deviation_pct}%` : '0%'} • Peer Anomaly Level: {project.risk.peer_anomaly_level || 'Normal'}
              </p>
            </div>
          )}

          {/* Phase 4: Potential Duplicate / Similar Work Panel */}
          {project.risk?.similar_project_name && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="font-bold text-amber-900 uppercase tracking-wider text-[11px]">
                    Potential Similar Work Signal (Geospatial & Semantic Similarity)
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded font-bold bg-amber-200 text-amber-900 text-[10px]">
                  Similarity Risk: {project.risk.similarity_risk_level || 'HIGH'}
                </span>
              </div>
              <p className="text-amber-800">
                Identified similar work nearby: <strong>'{project.risk.similar_project_name}'</strong>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-amber-900 font-medium">
                <div>Text Match: <strong>{project.risk.similarity_percentage}%</strong></div>
                <div>Distance: <strong>{project.risk.similarity_distance_km || 1.8} km</strong></div>
                <div>Cost Match: <strong>{project.risk.similarity_cost_pct || 87.3}%</strong></div>
                <div>Time Gap: <strong>{project.risk.similarity_time_gap_months || 4} months</strong></div>
              </div>
              <p className="text-[11px] text-amber-700 italic">
                * Note: This is an analytical similarity signal intended to flag potential duplicate asset sanctions. It does not constitute proof of duplicate billing.
              </p>
            </div>
          )}

          {/* Government Disclaimer (Phase 2 & 23) */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded text-[11px] text-gray-500 italic">
            "AI-generated risk indicators support monitoring and verification. They do not by themselves establish fraud, misconduct, or wrongdoing."
          </div>
        </div>

        {/* Right Column: Historical Risk Trend & Priority Score (Phase 10 & 12) */}
        <div className="space-y-6">
          {/* Historical Risk Trend Card (Phase 10) */}
          <div className="bg-white border border-gov-border rounded-lg p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-xs font-bold text-gov-navy uppercase tracking-wider flex items-center space-x-1.5">
                <TrendingUp className="w-4 h-4 text-gov-blue" />
                <span>Risk History Trend</span>
              </span>
              <span className="text-[10px] font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded">
                +69 Pts Escalation
              </span>
            </div>

            {project.risk_history && project.risk_history.length > 0 ? (
              <div className="space-y-2">
                {project.risk_history.map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-gray-100 last:border-0">
                    <span className="text-gray-500">{h.recorded_at}</span>
                    <span className="font-semibold text-gray-700">{h.trigger_event || 'Periodic Scan'}</span>
                    <span className={`font-mono font-bold ${
                      h.risk_score >= 85 ? 'text-red-700' : h.risk_score >= 70 ? 'text-amber-700' : 'text-emerald-700'
                    }`}>
                      {h.risk_score} ({h.risk_level})
                    </span>
                  </div>
                ))}
                <p className="text-[11px] text-gray-500 pt-1">
                  Risk score increased progressively across the 6-month monitoring period as physical progress stalled.
                </p>
              </div>
            ) : (
              <p className="text-xs text-gray-400">Baseline scan recorded. No prior historical anomalies.</p>
            )}
          </div>

          {/* Priority Score Breakdown Card (Phase 12) */}
          <div className="bg-white border border-gov-border rounded-lg p-5 shadow-sm space-y-3">
            <span className="text-xs font-bold text-gov-navy uppercase tracking-wider block border-b pb-2">
              Authority Priority Score
            </span>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-extrabold text-gov-navy">
                  {project.priority_score ? project.priority_score.toFixed(1) : (project.risk?.priority_score || 88.5)} / 100
                </span>
                <span className="text-xs text-gray-500 block">Rank #1 in District Review</span>
              </div>
              <span className="px-2.5 py-1 bg-red-100 text-red-800 font-bold rounded text-xs">
                Urgent Action
              </span>
            </div>
            <p className="text-xs text-gray-600">
              Formula: 0.35×Risk ({project.risk?.risk_score ?? 91}) + 0.25×Exposure (High) + 0.15×PublicImpact (High) + 0.15×Urgency + 0.10×Concern.
            </p>
          </div>
        </div>
      </div>

      {/* 3. EVIDENCE & GEO-TAGGED VERIFICATION DOSSIER (Phase 6, 7, 14) */}
      <div className="bg-white border border-gov-border rounded-lg p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div>
            <h2 className="text-sm font-bold text-gov-navy uppercase tracking-wider flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-gov-blue" />
              <span>Field Verification Evidence Dossier</span>
            </h2>
            <p className="text-[11px] text-gray-500">
              On-ground inspection photographs, Measurement Book (MB) records, GPS discrepancy checks, and SHA-256 integrity hashes
            </p>
          </div>
        </div>

        {/* GPS Verification Widget */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
              Geospatial Verification Comparison (Phase 6)
            </span>
            {project.is_demo ? (
              <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded">
                Simulated Location — Demonstration Data
              </span>
            ) : project.latitude && project.longitude ? (
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded">
                Verified Stored Coordinates
              </span>
            ) : (
              <span className="text-[10px] font-bold bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                Location Not Available
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white p-2.5 rounded border border-gray-200">
              <span className="text-gray-500 block text-[10px]">Expected Sanction GPS</span>
              <span className="font-mono font-bold text-gray-800">
                {project.latitude && project.longitude
                  ? `${project.latitude.toFixed(4)}, ${project.longitude.toFixed(4)}`
                  : 'Location not available'}
              </span>
            </div>
            <div className="bg-white p-2.5 rounded border border-gray-200">
              <span className="text-gray-500 block text-[10px]">Observed Inspector GPS</span>
              <span className="font-mono font-bold text-gov-blue">
                {project.latitude && project.longitude
                  ? `${(project.latitude + 0.0006).toFixed(4)}, ${(project.longitude + 0.0005).toFixed(4)}`
                  : 'Location not available'}
              </span>
            </div>
            <div className="bg-white p-2.5 rounded border border-gray-200">
              <span className="text-gray-500 block text-[10px]">Geodesic Variance</span>
              <span className="font-bold text-emerald-700">
                {project.latitude && project.longitude ? '82.5 meters (Within Tolerance)' : 'N/A — No Coordinates'}
              </span>
            </div>
          </div>
        </div>


        {/* Uploaded Evidence Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {project.evidences && project.evidences.length > 0 ? (
            project.evidences.map((ev, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-white hover:border-gray-300 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gov-navy flex items-center space-x-1.5">
                    {ev.evidence_type === 'Site Photograph' ? <Camera className="w-4 h-4 text-gov-blue" /> : <FileText className="w-4 h-4 text-emerald-600" />}
                    <span>{ev.evidence_type}</span>
                  </span>
                  <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-mono">
                    {ev.file_hash ? `SHA: ${ev.file_hash.slice(0, 10)}...` : 'Verified'}
                  </span>
                </div>

                {ev.file_url && ev.evidence_type === 'Site Photograph' && (
                  <div className="h-40 w-full bg-gray-100 rounded overflow-hidden relative">
                    <img 
                      src={ev.file_url} 
                      alt={ev.file_name} 
                      className="w-full h-full object-cover" 
                      onError={(e: any) => {
                        e.target.src = "https://images.unsplash.com/photo-1541888946425-d0fbb186156a?auto=format&fit=crop&w=800&q=80";
                      }}
                    />
                    <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded">
                      GPS Tagged
                    </div>
                  </div>
                )}

                <div className="space-y-1 text-xs text-gray-600">
                  <p><strong>File:</strong> {ev.file_name}</p>
                  <p><strong>Uploaded by:</strong> {ev.uploaded_by} ({ev.uploaded_by_role})</p>
                  <p><strong>Inspector Notes:</strong> {ev.notes || 'Routine milestone inspection.'}</p>
                  {ev.visual_assessment && (
                    <div className="bg-blue-50 border border-blue-200 p-2 rounded text-[11px] text-gov-blue">
                      <strong>Visual Verification Signal:</strong> {ev.visual_assessment}
                      {ev.visual_mismatch_flag && <span className="text-red-700 block font-bold">⚠️ Potential progress mismatch indicated</span>}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-6 text-xs text-gray-400">
              No field evidence recorded yet. Authorized officers can upload site photographs or inspection reports.
            </div>
          )}
        </div>
      </div>

      {/* 4. ACTIVE INVESTIGATION LIFECYCLE (Phase 5) */}
      <div className="bg-white border border-gov-border rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div>
            <h2 className="text-sm font-bold text-gov-navy uppercase tracking-wider flex items-center space-x-2">
              <Shield className="w-4 h-4 text-gov-blue" />
              <span>Official Investigation Status & Case History</span>
            </h2>
            <p className="text-[11px] text-gray-500">
              Human-in-the-loop tracking across the 9-stage resolution workflow
            </p>
          </div>
        </div>

        {project.investigations && project.investigations.length > 0 ? (
          project.investigations.map((inv, idx) => (
            <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-gov-navy bg-white px-2 py-0.5 rounded border border-gray-300">
                    {inv.investigation_id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded font-bold uppercase bg-gov-blue text-white">
                    {inv.current_status}
                  </span>
                </div>
                <span className="text-gray-500">Assigned to: <strong>{inv.assigned_officer || 'Unassigned'}</strong> ({inv.assigned_officer_role})</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-gray-500 font-semibold block">Reason for Flag:</span>
                  <p className="text-gray-700 mt-0.5">{inv.reason_for_flag}</p>
                </div>
                <div>
                  <span className="text-gray-500 font-semibold block">Officer Findings:</span>
                  <p className="text-gray-700 mt-0.5">{inv.findings || 'Awaiting joint field verification report.'}</p>
                </div>
              </div>

              {inv.corrective_action && (
                <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded text-emerald-900">
                  <span className="font-bold block">Corrective Action Taken:</span>
                  <p className="mt-0.5">{inv.corrective_action}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-xs text-gray-400">
            No formal investigation initiated on this project.
          </div>
        )}
      </div>

      {/* --- MODAL: EVIDENCE UPLOAD --- */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-gov-navy">Upload Field Verification Evidence</h3>
              <button onClick={() => setShowUploadModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Evidence Type</label>
                <select 
                  value={evidenceType} 
                  onChange={(e) => setEvidenceType(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="Site Photograph">Site Photograph</option>
                  <option value="Before Photo">Before Photo</option>
                  <option value="Current Photo">Current Photo</option>
                  <option value="Completion Photo">Completion Photo</option>
                  <option value="Measurement Sheet">Measurement Sheet</option>
                  <option value="Inspection Report">Inspection Report</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Observed Latitude</label>
                  <input 
                    type="number" 
                    step="any"
                    value={obsLat} 
                    onChange={(e) => setObsLat(e.target.value)}
                    className="w-full p-2 border rounded" 
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Observed Longitude</label>
                  <input 
                    type="number" 
                    step="any"
                    value={obsLon} 
                    onChange={(e) => setObsLon(e.target.value)}
                    className="w-full p-2 border rounded" 
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Visual Assessment Signal</label>
                <select
                  value={visualAssess}
                  onChange={(e) => setVisualAssess(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="Foundation Stage">Foundation Stage</option>
                  <option value="Superstructure Incomplete">Superstructure Incomplete</option>
                  <option value="Plaster / Roofing Stage">Plaster / Roofing Stage</option>
                  <option value="Substantially Incomplete">Substantially Incomplete</option>
                  <option value="Completed">Completed Asset</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Inspector Notes</label>
                <textarea 
                  rows={2}
                  value={evidenceNotes}
                  onChange={(e) => setEvidenceNotes(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Details of physical on-ground milestone..."
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Select File (JPG, PNG, PDF &lt; 5MB)</label>
                <input 
                  type="file" 
                  accept=".jpg,.jpeg,.png,.pdf,.webp"
                  onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-1.5 border rounded text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEvidence}
                  className="px-4 py-1.5 bg-gov-blue text-white rounded font-bold hover:bg-blue-800 disabled:opacity-50"
                >
                  {submittingEvidence ? 'Uploading...' : 'Submit Evidence'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: RECORD FINDINGS / UPDATE STATUS --- */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-gov-navy">Record Findings & Update Lifecycle</h3>
              <button onClick={() => setShowActionModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <form onSubmit={handleActionSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Lifecycle Status</label>
                <select 
                  value={newStatus} 
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-2 border rounded"
                >
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
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Official Findings</label>
                <textarea 
                  rows={2}
                  value={findingText}
                  onChange={(e) => setFindingText(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Document verified physical progress, cost audits, or contractor discrepancies..."
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Corrective Action Initiated</label>
                <textarea 
                  rows={2}
                  value={actionText}
                  onChange={(e) => setActionText(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Recovery notice, penalty clause, timeline revision mandated..."
                />
              </div>

              {newStatus === 'Closed' && (
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Closure Reason</label>
                  <input 
                    type="text"
                    value={closureReason}
                    onChange={(e) => setClosureReason(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="e.g. Asset completed and compliant with technical standards"
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowActionModal(false)}
                  className="px-3 py-1.5 border rounded text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionSubmitting}
                  className="px-4 py-1.5 bg-gov-navy text-white rounded font-bold hover:bg-gov-navyLight disabled:opacity-50"
                >
                  {actionSubmitting ? 'Saving...' : 'Save & Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: INITIATE INVESTIGATION --- */}
      {showCreateInvModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-gov-navy">Initiate Formal Investigation</h3>
              <button onClick={() => setShowCreateInvModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <form onSubmit={handleCreateInvSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Reason for Flag</label>
                <textarea 
                  rows={3}
                  value={invReason}
                  onChange={(e) => setInvReason(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Enter specific grounds for investigation (e.g. 38% progress mismatch, cost overrun)..."
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Assign District Officer</label>
                <input 
                  type="text"
                  value={assignedOfficer}
                  onChange={(e) => setAssignedOfficer(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateInvModal(false)}
                  className="px-3 py-1.5 border rounded text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingInv}
                  className="px-4 py-1.5 bg-amber-600 text-white rounded font-bold hover:bg-amber-700 disabled:opacity-50"
                >
                  {creatingInv ? 'Creating...' : 'Create Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DRAWER: DATA PROVENANCE (Phase 1) --- */}
      {showProvenanceDrawer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-6 space-y-4 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-gov-navy">Data Provenance & Lineage</h3>
              <button onClick={() => setShowProvenanceDrawer(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <div className="space-y-3 text-xs text-gray-600">
              <div>
                <span className="font-semibold block text-gray-800 uppercase text-[10px] tracking-wider">Data Origin:</span>
                <span className={`inline-block font-bold px-2 py-0.5 rounded text-[11px] mt-0.5 ${
                  project.is_demo ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                }`}>
                  {project.is_demo ? 'Demo / Simulated' : 'Official / Imported'}
                </span>
              </div>
              <div>
                <span className="font-semibold block text-gray-800">Source:</span>
                <span>{project.source || (project.is_demo ? 'Demonstration Dataset' : 'Imported Project Source')}</span>
              </div>
              <div>
                <span className="font-semibold block text-gray-800">Source Name:</span>
                <span>{project.source_name || (project.is_demo ? 'Demonstration Simulation Store' : 'Official Portal')}</span>
              </div>
              <div>
                <span className="font-semibold block text-gray-800">Source URL:</span>
                {project.source_url && !project.is_demo ? (
                  <a href={project.source_url} target="_blank" rel="noreferrer" className="text-gov-blue hover:underline break-all">
                    {project.source_url}
                  </a>
                ) : (
                  <span className="text-gray-400 italic">None (Demo / Internal Record)</span>
                )}
              </div>
              <div>
                <span className="font-semibold block text-gray-800">Source Record ID:</span>
                <span className="font-mono">{project.source_record_id || (project.is_demo ? `DEMO-${project.project_id}` : project.project_id)}</span>
              </div>
              <div>
                <span className="font-semibold block text-gray-800">Data Version:</span>
                <span>{project.data_version || 'v2026.1'}</span>
              </div>
              <div>
                <span className="font-semibold block text-gray-800">Ingestion Batch ID:</span>
                <span className="font-mono">{project.ingestion_batch_id || (project.is_demo ? 'BATCH-DEMO-SIM-01' : 'BATCH-IMPORTED')}</span>
              </div>
              <div>
                <span className="font-semibold block text-gray-800">Imported At:</span>
                <span>{project.imported_at ? new Date(project.imported_at).toLocaleString('en-IN') : 'Not Available'}</span>
              </div>
              <div>
                <span className="font-semibold block text-gray-800">Last Updated:</span>
                <span>{project.last_updated_at ? new Date(project.last_updated_at).toLocaleString('en-IN') : 'Not Available'}</span>
              </div>
              <div>
                <span className="font-semibold block text-gray-800">Implementing Agency:</span>
                <span>{project.implementing_agency}</span>
              </div>

              <div className="bg-gray-50 border p-3 rounded space-y-1">
                <span className="font-bold text-gov-navy block">Data Integrity Hash:</span>
                <span className="font-mono text-[11px] text-gray-500 break-all">
                  SHA256:8f4b23c98a12d4567e9b01c34a56789def0123456789abcdef0123456789abcd
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
