import React, { useState, useEffect } from 'react';
import { 
  FileText, Camera, MapPin, Send, CheckCircle2, 
  Search, AlertCircle, Clock, ShieldCheck, UserX, Eye
} from 'lucide-react';
import { submitCitizenFeedback, fetchFeedbackStatus, fetchProjects } from '../services/api';
import { FeedbackSubmission } from '../types';

interface ReportIssuePageProps {
  initialProjectId?: string;
  onSelectProject: (projectId: string) => void;
}

export const ReportIssuePage: React.FC<ReportIssuePageProps> = ({
  initialProjectId = '',
  onSelectProject
}) => {
  // Submission Form State
  const [projectId, setProjectId] = useState(initialProjectId);
  const [issueCategory, setIssueCategory] = useState('Work incomplete');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<{ id: string; msg: string } | null>(null);

  // Available Projects for Autocomplete
  const [projectList, setProjectList] = useState<{ id: string; name: string }[]>([]);

  // Tracking Search State
  const [trackId, setTrackId] = useState('MPL-FB-2026-008241'); // Pre-populate with Golden Demo feedback
  const [trackedRecord, setTrackedRecord] = useState<FeedbackSubmission | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);

  const categories = [
    "Work not started",
    "Work incomplete",
    "Poor quality",
    "Incorrect location",
    "Potential duplicate work",
    "Incorrect progress",
    "Asset not visible",
    "Other"
  ];

  useEffect(() => {
    async function loadQuickProjects() {
      try {
        const res = await fetchProjects({ limit: 20 });
        setProjectList(res.projects.map((p) => ({ id: p.project_id, name: p.work_name })));
      } catch (err) {
        console.error(err);
      }
    }
    loadQuickProjects();
  }, []);

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId.trim() || !description.trim()) {
      alert("Please specify the Project ID and describe your concern.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitCitizenFeedback({
        project_id: projectId.trim(),
        issue_category: issueCategory,
        description: description.trim(),
        location: location.trim() || undefined,
        attachment_url: photoName ? `https://mplads.gov.in/evidence/${photoName}` : undefined,
        anonymous: anonymous
      });
      setSubmissionSuccess({ id: res.feedback_id, msg: res.message });
      // Reset form
      setDescription('');
      setLocation('');
      setPhotoName(null);
    } catch (err: any) {
      alert(err.message || "Failed to submit grievance");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackId.trim()) return;

    setTrackingLoading(true);
    setTrackError(null);
    setTrackedRecord(null);

    try {
      const rec = await fetchFeedbackStatus(trackId.trim());
      setTrackedRecord(rec);
    } catch (err: any) {
      setTrackError("No registered feedback found with ID " + trackId);
    } finally {
      setTrackingLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gov-navy">Citizen Grievance & Public Feedback Portal</h1>
        <p className="text-xs text-gray-500">
          Empowering citizens to report incomplete works, substandard materials, or discrepancies directly to authorities
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Report Submission Form */}
        <div className="lg:col-span-7 bg-white border border-gov-border rounded-lg p-6 shadow-sm space-y-5">
          <div className="flex items-center space-x-2 border-b border-gray-200 pb-3">
            <FileText className="w-5 h-5 text-gov-navy" />
            <h2 className="text-sm font-bold text-gov-navy uppercase tracking-wider">
              File a Public Report on an MPLADS Asset
            </h2>
          </div>

          {submissionSuccess ? (
            <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-6 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-gov-navy text-base">Grievance Registered Successfully</h3>
              <p className="text-xs text-gray-600">
                Your report has been received and prioritized by the AI Triaging Engine for district review.
              </p>
              <div className="inline-block bg-white border border-emerald-300 rounded px-4 py-2 text-sm font-mono font-bold text-gov-navy">
                Tracking ID: {submissionSuccess.id}
              </div>
              <p className="text-[11px] text-gray-500">
                Save this Tracking ID to monitor the progress of administrative investigation.
              </p>
              <button
                onClick={() => setSubmissionSuccess(null)}
                className="mt-2 px-4 py-2 bg-gov-navy text-white text-xs font-semibold rounded"
              >
                Submit Another Report
              </button>
            </div>
          ) : (
            <form onSubmit={handleReportSubmit} className="space-y-4 text-xs">
              {/* Target Project */}
              <div>
                <label className="block font-semibold text-gov-charcoal mb-1">
                  Target MPLADS Project <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. MPLAD-UP-2023-GOLDEN-01 or choose from dropdown"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 focus:border-gov-blue focus:outline-none"
                  required
                />
                {projectList.length > 0 && (
                  <div className="mt-1 flex items-center space-x-1 text-[11px] text-gray-500">
                    <span>Quick select:</span>
                    <button
                      type="button"
                      onClick={() => setProjectId("MPLAD-UP-2023-GOLDEN-01")}
                      className="text-gov-blue underline font-semibold"
                    >
                      Golden Demo Community Hall
                    </button>
                  </div>
                )}
              </div>

              {/* Issue Category */}
              <div>
                <label className="block font-semibold text-gov-charcoal mb-1">
                  Issue Category <span className="text-rose-600">*</span>
                </label>
                <select
                  value={issueCategory}
                  onChange={(e) => setIssueCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 focus:border-gov-blue focus:outline-none bg-white"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-gov-charcoal mb-1">
                  Description of On-Ground Issue <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe what you observed (e.g., work abandoned for months, cracks in construction, site location does not match records)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 focus:border-gov-blue focus:outline-none"
                  required
                ></textarea>
              </div>

              {/* Location */}
              <div>
                <label className="block font-semibold text-gov-charcoal mb-1">
                  Specific Landmark / Village / Ward Location
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. Near Panchayat Bhawan, Ward 4"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full border border-gray-300 rounded p-2 pl-8 focus:border-gov-blue focus:outline-none"
                  />
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              {/* Photo Upload simulation */}
              <div>
                <label className="block font-semibold text-gov-charcoal mb-1">
                  Upload Site Photograph (Optional Verification Evidence)
                </label>
                <div className="flex items-center space-x-3">
                  <label className="cursor-pointer border border-dashed border-gray-300 hover:border-gov-blue rounded px-4 py-2 flex items-center space-x-2 text-gray-600 hover:text-gov-blue">
                    <Camera className="w-4 h-4" />
                    <span>{photoName || 'Choose image / take photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setPhotoName(e.target.files[0].name);
                        }
                      }}
                    />
                  </label>
                  {photoName && (
                    <button
                      type="button"
                      onClick={() => setPhotoName(null)}
                      className="text-[11px] text-rose-600 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Anonymous Checkbox */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  className="rounded border-gray-300 text-gov-blue focus:ring-0"
                />
                <label htmlFor="anonymous" className="text-gray-700 cursor-pointer select-none">
                  Submit anonymously (Protects citizen identity under whistleblower norms)
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-gov-navy text-white font-bold rounded text-xs hover:bg-gov-navyLight transition flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Submitting & Triaging...' : 'Submit Citizen Report'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Column: Track Existing Grievance */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-gov-border rounded-lg p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-gray-200 pb-3">
              <Search className="w-5 h-5 text-gov-navy" />
              <h2 className="text-sm font-bold text-gov-navy uppercase tracking-wider">
                Track Existing Report
              </h2>
            </div>

            <form onSubmit={handleTrackSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gov-charcoal mb-1">
                  Enter Feedback Tracking ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. MPL-FB-2026-008241"
                    value={trackId}
                    onChange={(e) => setTrackId(e.target.value)}
                    className="flex-1 font-mono uppercase text-xs border border-gray-300 rounded p-2 focus:border-gov-blue focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={trackingLoading}
                    className="px-4 py-2 bg-gov-blue text-white font-semibold rounded hover:bg-blue-800"
                  >
                    Track
                  </button>
                </div>
              </div>
            </form>

            {trackError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded text-xs">
                {trackError}
              </div>
            )}

            {trackedRecord && (
              <div className="border border-gray-200 rounded p-4 space-y-3 bg-gray-50 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-mono font-bold text-gov-navy text-sm">
                      {trackedRecord.feedback_id}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      Filed: {trackedRecord.created_at}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                    trackedRecord.status === 'Under Review' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                    trackedRecord.status === 'Resolved' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                    'bg-blue-100 text-blue-900 border border-blue-300'
                  }`}>
                    {trackedRecord.status}
                  </span>
                </div>

                <div className="space-y-1 text-gray-700">
                  <div><strong>Category:</strong> {trackedRecord.issue_category}</div>
                  {trackedRecord.ai_category && (
                    <div><strong>AI NLP Triage:</strong> <span className="capitalize font-semibold text-gov-blue">{trackedRecord.ai_category}</span></div>
                  )}
                  <div><strong>Priority:</strong> <span className="font-bold text-rose-700">{trackedRecord.priority}</span></div>
                  <div className="pt-1 text-gray-600 italic">"{trackedRecord.description}"</div>
                </div>

                {/* Status Progression Bar: Submitted -> Under Review -> Action Initiated -> Resolved */}
                <div className="pt-3 border-t border-gray-200">
                  <div className="text-[10px] font-semibold text-gray-500 mb-2 uppercase">Status Progression</div>
                  <div className="grid grid-cols-4 gap-1 text-[9px] font-bold text-center">
                    <div className="bg-emerald-600 text-white py-1 rounded">1. Submitted</div>
                    <div className="bg-amber-500 text-white py-1 rounded">2. Under Review</div>
                    <div className="bg-gray-200 text-gray-500 py-1 rounded">3. Action Initiated</div>
                    <div className="bg-gray-200 text-gray-500 py-1 rounded">4. Resolved</div>
                  </div>
                </div>

                {trackedRecord.project_id && (
                  <button
                    onClick={() => onSelectProject(trackedRecord.project_id)}
                    className="w-full text-center text-gov-blue hover:underline font-semibold text-xs pt-1 block"
                  >
                    View Flagged Project Asset →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Citizen Rights & Whistleblower Card */}
          <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-5 text-xs text-blue-950 space-y-2">
            <div className="font-bold flex items-center space-x-1.5 text-gov-navy">
              <ShieldCheck className="w-4 h-4 text-gov-blue" />
              <span>Public Accountability Commitment</span>
            </div>
            <p className="text-gray-600 leading-relaxed text-[11px]">
              Every verified report is logged into the official District Priority Review Queue. Multi-citizen complaint clusters automatically escalate the project's Public Concern Score to mandate district field scrutiny.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
