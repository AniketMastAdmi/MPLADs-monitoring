import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Building, Calendar, CheckCircle2, Clock, 
  AlertTriangle, ShieldAlert, FileText, IndianRupee, 
  MapPin, HelpCircle, ChevronRight, User, ExternalLink, AlertCircle
} from 'lucide-react';
import { ProjectDetail } from '../types';
import { fetchProjectDetail } from '../services/api';

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

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchProjectDetail(projectId);
        setProject(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load project details');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs text-gray-500">
        Loading project audit dossier...
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Button & Top Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-gray-600 hover:text-gov-navy"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Works Explorer</span>
        </button>

        <div className="flex items-center space-x-2">
          {project.is_demo && (
            <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-bold px-2 py-0.5 rounded">
              Demonstration Dataset
            </span>
          )}
          <button
            onClick={() => onReportIssue(project.project_id)}
            className="px-3 py-1.5 bg-rose-50 text-rose-800 border border-rose-300 rounded text-xs font-bold hover:bg-rose-100 flex items-center space-x-1"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Report Concern on this Work</span>
          </button>
        </div>
      </div>

      {/* 1. PROJECT HERO TITLE & META */}
      <div className="bg-white border border-gov-border rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2 max-w-4xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="bg-gray-100 text-gov-navy px-2 py-0.5 rounded">
                ID: {project.project_id}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">{project.state}</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">{project.district}</span>
              {project.constituency && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">{project.constituency}</span>
                </>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-gov-navy leading-snug">
              {project.work_name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 pt-1">
              <div className="flex items-center space-x-1.5">
                <User className="w-4 h-4 text-gray-400" />
                <span><strong>Recommended by:</strong> {project.mp_name || 'General MP Allocation'}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Building className="w-4 h-4 text-gray-400" />
                <span><strong>Agency:</strong> {project.implementing_agency}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{project.location || 'Local District Coordinates'}</span>
              </div>
            </div>
          </div>

          {/* Quick Risk Badge */}
          {project.risk && (
            <div className="flex-shrink-0 bg-gray-50 border border-gray-200 rounded p-4 text-center min-w-[140px]">
              <div className="text-[11px] font-semibold text-gray-500 uppercase">Composite Risk</div>
              <div className={`text-3xl font-black ${
                isCritical ? 'text-rose-800' : isHighRisk ? 'text-orange-700' : 'text-emerald-700'
              }`}>
                {project.risk.risk_score.toFixed(0)} <span className="text-xs font-semibold text-gray-400">/ 100</span>
              </div>
              <span className={
                isCritical ? 'gov-badge-crit mt-1 inline-block' :
                isHighRisk ? 'gov-badge-high mt-1 inline-block' : 'gov-badge-low mt-1 inline-block'
              }>
                {project.risk.risk_level}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. PROJECT TIMELINE LIFECYCLE (Recommended -> Sanctioned -> Started -> Payments -> Progress -> Completed) */}
      <div className="bg-white border border-gov-border rounded-lg p-6 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wider">
          MPLADS Project Execution Timeline
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2">
          {/* Step 1: Recommended */}
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
            <div className="font-bold text-[11px] text-gov-navy">1. Recommended</div>
            <div className="text-[10px] text-gray-500">By Hon'ble MP</div>
          </div>

          {/* Step 2: Sanctioned */}
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
            <div className="font-bold text-[11px] text-gov-navy">2. Sanctioned</div>
            <div className="text-[10px] text-gray-500">{project.sanction_date || 'Approved'}</div>
          </div>

          {/* Step 3: Work Started */}
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
            <div className="font-bold text-[11px] text-gov-navy">3. Work Started</div>
            <div className="text-[10px] text-gray-500">{project.start_date || 'Executed'}</div>
          </div>

          {/* Step 4: Payments */}
          <div className={`p-2.5 border rounded text-center ${
            project.payments.length > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'
          }`}>
            <IndianRupee className="w-4 h-4 text-gov-blue mx-auto mb-1" />
            <div className="font-bold text-[11px] text-gov-navy">4. Payments</div>
            <div className="text-[10px] text-gray-500">{project.payments.length} Tranches</div>
          </div>

          {/* Step 5: Physical Progress */}
          <div className={`p-2.5 border rounded text-center ${
            project.physical_progress >= 50 ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'
          }`}>
            <Clock className="w-4 h-4 text-blue-600 mx-auto mb-1" />
            <div className="font-bold text-[11px] text-gov-navy">5. Progress</div>
            <div className="text-[10px] text-gray-600">{project.physical_progress}% Physical</div>
          </div>

          {/* Step 6: Completed */}
          <div className={`p-2.5 border rounded text-center ${
            project.status === 'Completed' ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200 opacity-60'
          }`}>
            <CheckCircle2 className={`w-4 h-4 mx-auto mb-1 ${project.status === 'Completed' ? 'text-emerald-600' : 'text-gray-400'}`} />
            <div className="font-bold text-[11px] text-gov-navy">6. Completion</div>
            <div className="text-[10px] text-gray-500">{project.completion_date || 'Pending Target'}</div>
          </div>
        </div>
      </div>

      {/* 3. EXPLAINABLE AI RISK ASSESSMENT (The Central SIH Differentiator) */}
      {project.risk && (
        <div className={`border-2 rounded-lg p-6 space-y-5 shadow-sm ${
          isCritical ? 'bg-rose-50/70 border-rose-300' :
          isHighRisk ? 'bg-amber-50/70 border-amber-300' : 'bg-blue-50/40 border-blue-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
            <div className="flex items-center space-x-2">
              <ShieldAlert className={`w-5 h-5 ${isCritical ? 'text-rose-700' : isHighRisk ? 'text-amber-700' : 'text-blue-700'}`} />
              <h2 className="text-base font-bold text-gov-navy">
                Explainable AI Risk Dossier — Why is this project flagged?
              </h2>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="font-semibold text-gray-500">Model Confidence:</span>
              <span className="font-bold text-gov-navy">{(project.risk.confidence * 100).toFixed(0)}%</span>
            </div>
          </div>

          {/* Multi-Signal Breakdown Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {/* Signal 1: Progress Mismatch */}
            <div className="bg-white p-3 rounded border border-gray-200 space-y-1">
              <span className="text-[10px] font-bold text-gray-400 block uppercase">Progress Divergence</span>
              <div className="font-bold text-gov-navy text-sm">
                {progressGap > 0 ? `+${progressGap.toFixed(1)}% Gap` : 'Aligned'}
              </div>
              <div className="text-[11px] text-gray-500">
                Fin: {project.financial_progress}% vs Phy: {project.physical_progress}%
              </div>
            </div>

            {/* Signal 2: Cost Overrun */}
            <div className="bg-white p-3 rounded border border-gray-200 space-y-1">
              <span className="text-[10px] font-bold text-gray-400 block uppercase">Cost Escalation</span>
              <div className={`font-bold text-sm ${costDeviation > 15 ? 'text-rose-700' : 'text-gov-navy'}`}>
                {costDeviation > 0 ? `+${costDeviation.toFixed(1)}%` : '0.0%'}
              </div>
              <div className="text-[11px] text-gray-500">
                ₹{(project.expenditure/100000).toFixed(1)}L / ₹{(project.sanctioned_amount/100000).toFixed(1)}L
              </div>
            </div>

            {/* Signal 3: Delay Days */}
            <div className="bg-white p-3 rounded border border-gray-200 space-y-1">
              <span className="text-[10px] font-bold text-gray-400 block uppercase">Timeline Deviation</span>
              <div className={`font-bold text-sm ${project.status === 'Delayed' ? 'text-amber-700' : 'text-gov-navy'}`}>
                {project.status === 'Delayed' ? 'Overdue Schedule' : 'On Schedule'}
              </div>
              <div className="text-[11px] text-gray-500">
                Target: {project.expected_completion || 'N/A'}
              </div>
            </div>

            {/* Signal 4: Similar Work Nearby */}
            <div className="bg-white p-3 rounded border border-gray-200 space-y-1">
              <span className="text-[10px] font-bold text-gray-400 block uppercase">Similar Asset Nearby</span>
              <div className={`font-bold text-sm ${project.risk.duplicate_score > 70 ? 'text-amber-700' : 'text-gov-navy'}`}>
                {project.risk.duplicate_score > 70 ? 'Flagged (>70%)' : 'None Detected'}
              </div>
              <div className="text-[11px] text-gray-500">
                {project.risk.similar_project_name ? 'Potential Overlap' : 'Unique Site'}
              </div>
            </div>
          </div>

          {/* Structured Transparent Explanations */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wider">
              Analytical Evidence & Findings:
            </h3>
            <ul className="space-y-1.5 text-xs text-gray-700">
              {project.risk.explanation.map((reason, idx) => (
                <li key={idx} className="flex items-start space-x-2 bg-white/80 p-2 rounded border border-gray-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 flex-shrink-0"></span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Similar Project Cross-Link if Detected */}
          {project.risk.similar_project_id && (
            <div className="bg-amber-50 border border-amber-300 rounded p-3 text-xs text-amber-900 flex items-center justify-between">
              <div>
                <strong>Potential Similar Work Detected Nearby:</strong>{' '}
                <span>{project.risk.similar_project_name}</span> ({project.risk.similarity_percentage}% text/distance similarity)
              </div>
              <button
                onClick={() => onSelectProject(project.risk.similar_project_id!)}
                className="px-3 py-1 bg-amber-200 hover:bg-amber-300 font-bold rounded text-[11px] text-amber-950 flex items-center space-x-1"
              >
                <span>Inspect Asset</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Recommended Review Action Checklist for Authorities */}
          <div className="space-y-2 pt-1">
            <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wider">
              Recommended Administrative Review Checklist:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {project.risk.recommended_actions.map((act, idx) => (
                <div key={idx} className="flex items-start space-x-2 bg-white p-2.5 rounded border border-gray-200">
                  <CheckCircle2 className="w-4 h-4 text-gov-blue flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{act}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Official Responsible AI Disclaimer */}
          <div className="text-[11px] text-gray-500 italic border-t border-gray-200 pt-3">
            <strong>Government Disclaimer:</strong> "AI-generated risk indicators are analytical signals intended to support monitoring and verification. They do not by themselves establish fraud, misconduct or non-compliance."
          </div>
        </div>
      )}

      {/* 4. FINANCIAL LEDGER & VENDOR PAYMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Summary */}
        <div className="bg-white border border-gov-border rounded-lg p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wider">
            Financial Ledger (Strict Separation)
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Sanctioned Amount</span>
              <span className="font-bold text-gov-navy">₹{project.sanctioned_amount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Estimated Initial Cost</span>
              <span className="font-semibold text-gray-700">₹{project.estimated_cost.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Revised Cost (if any)</span>
              <span className={`font-semibold ${costDeviation > 0 ? 'text-rose-700 font-bold' : 'text-gray-700'}`}>
                ₹{project.revised_cost.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Actual Expenditure</span>
              <span className="font-bold text-gov-navy">₹{project.expenditure.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Remaining Balance</span>
              <span className="font-semibold text-emerald-700">
                ₹{Math.max(0, project.sanctioned_amount - project.expenditure).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-500">Scheme Utilization</span>
              <span className="font-extrabold text-gov-blue">
                {((project.expenditure / Math.max(project.sanctioned_amount, 1.0)) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Payment Disbursement Table */}
        <div className="lg:col-span-2 bg-white border border-gov-border rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wider">
              Disbursed Vendor Payments ({project.payments.length})
            </h3>
            <span className="text-[11px] text-gray-500">Represented in Scheme Expenditure</span>
          </div>

          {project.payments.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">
              No milestone payments recorded yet for this project.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 text-[10px] uppercase">
                    <th className="py-2">Payment ID</th>
                    <th className="py-2">Date</th>
                    <th className="py-2">Stage</th>
                    <th className="py-2">Vendor Reference</th>
                    <th className="py-2 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {project.payments.map((pay) => (
                    <tr key={pay.payment_id} className="hover:bg-gray-50">
                      <td className="py-2 font-mono text-[11px] text-gray-600">{pay.payment_id}</td>
                      <td className="py-2 text-gray-500">{pay.payment_date}</td>
                      <td className="py-2 font-medium text-gov-navy">{pay.payment_stage}</td>
                      <td className="py-2 text-gray-500">{pay.vendor_reference || 'Public Vendor'}</td>
                      <td className="py-2 text-right font-bold text-gov-navy">
                        ₹{pay.amount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 5. PROGRESS UPDATES LOG */}
      {project.progress_updates.length > 0 && (
        <div className="bg-white border border-gov-border rounded-lg p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wider">
            Official Inspection & Progress Log
          </h3>
          <div className="space-y-2 text-xs">
            {project.progress_updates.map((u) => (
              <div key={u.update_id} className="p-3 bg-gray-50 rounded border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-gov-navy">{u.date}:</span>{' '}
                  <span className="text-gray-700">{u.remarks || 'Periodic inspection logged.'}</span>
                </div>
                <div className="flex items-center space-x-3 text-[11px] text-gray-500">
                  <span>Physical: <strong>{u.physical_progress}%</strong></span>
                  <span>Financial: <strong>{u.financial_progress}%</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
