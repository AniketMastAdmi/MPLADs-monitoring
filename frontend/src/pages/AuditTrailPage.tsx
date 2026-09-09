import React, { useState, useEffect } from 'react';
import { History, Search, Filter, Shield, Calendar, User, ArrowRight, RefreshCw } from 'lucide-react';
import { AuditLogItem } from '../types';
import { fetchAuditLogs } from '../services/api';

export const AuditTrailPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actorFilter, setActorFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [projectIdFilter, setProjectIdFilter] = useState('');

  const loadLogs = async (targetPage = 1) => {
    setLoading(true);
    try {
      const res = await fetchAuditLogs({
        page: targetPage,
        limit: 25,
        actor: actorFilter,
        role: roleFilter,
        action: actionFilter,
        project_id: projectIdFilter
      });
      setLogs(res.logs);
      setTotal(res.total);
      setPage(res.page);
    } catch (err) {
      console.error("Failed to load audit logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs(1);
  }, [roleFilter, actionFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadLogs(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <History className="w-6 h-6 text-gov-navy" />
          <h1 className="text-2xl font-bold text-gov-navy">Government Audit Trail & Compliance Log</h1>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Immutable event ledger tracking data ingestion, risk recalculation, officer assignments, evidence uploads, and lifecycle state changes
        </p>
      </div>

      {/* Filter Toolbar */}
      <form onSubmit={handleSearch} className="bg-white border border-gov-border rounded-lg p-4 shadow-sm space-y-3 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Filter by Actor</label>
            <input
              type="text"
              value={actorFilter}
              onChange={(e) => setActorFilter(e.target.value)}
              placeholder="e.g. Er. Rajesh Kumar, System"
              className="w-full p-2 border rounded text-xs focus:border-gov-blue focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Filter by Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full p-2 border rounded text-xs font-medium"
            >
              <option value="all">All Roles</option>
              <option value="PUBLIC / CITIZEN">PUBLIC / CITIZEN</option>
              <option value="DISTRICT OFFICER">DISTRICT OFFICER</option>
              <option value="STATE ADMIN / NODAL OFFICER">STATE ADMIN / NODAL OFFICER</option>
              <option value="MINISTRY / SUPER ADMIN">MINISTRY / SUPER ADMIN</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Action Type</label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full p-2 border rounded text-xs font-medium"
            >
              <option value="all">All Actions</option>
              <option value="DATA_IMPORT">Data Import</option>
              <option value="AI_FLAGGED_CRITICAL">AI Flagged Critical</option>
              <option value="INVESTIGATION_CREATED">Investigation Created</option>
              <option value="INVESTIGATION_ASSIGNED">Investigation Assigned</option>
              <option value="EVIDENCE_UPLOADED">Evidence Uploaded</option>
              <option value="FINDING_RECORDED">Finding Recorded</option>
              <option value="INVESTIGATION_UPDATED">Investigation Updated</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Project / Case ID</label>
            <input
              type="text"
              value={projectIdFilter}
              onChange={(e) => setProjectIdFilter(e.target.value)}
              placeholder="e.g. MPLAD-UP-2023-GOLDEN-01"
              className="w-full p-2 border rounded text-xs focus:border-gov-blue focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="px-4 py-1.5 bg-gov-navy text-white rounded text-xs font-semibold hover:bg-gov-navyLight transition"
          >
            Filter Audit Logs
          </button>
        </div>
      </form>

      {/* Logs Table */}
      <div className="bg-white border border-gov-border rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Actor & Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Record / Case</th>
                <th className="py-3 px-4">Value Transition</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    No audit records matching the specified filters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition">
                    <td className="py-3.5 px-4 font-mono text-gray-600 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gov-navy">{log.actor}</div>
                      <div className="text-[10px] text-gov-blue font-semibold">{log.role}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-800 border border-gray-300">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-700">
                      {log.record_id || log.investigation_id || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs text-[11px] text-gray-600">
                      {log.old_value && <div><strong>Old:</strong> {log.old_value}</div>}
                      {log.new_value && <div><strong>New:</strong> {log.new_value}</div>}
                      {!log.old_value && !log.new_value && <span className="text-gray-400">—</span>}
                    </td>
                    <td className="py-3.5 px-4 text-gray-700 max-w-sm">
                      {log.details || '—'}
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
