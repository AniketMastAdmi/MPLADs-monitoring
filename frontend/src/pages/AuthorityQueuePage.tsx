import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, AlertTriangle, ArrowRight, Eye, 
  FileCheck, Users, TrendingUp, Filter, RefreshCw
} from 'lucide-react';
import { PriorityQueueItem } from '../types';
import { fetchPriorityQueue } from '../services/api';

interface AuthorityQueuePageProps {
  onSelectProject: (projectId: string) => void;
}

export const AuthorityQueuePage: React.FC<AuthorityQueuePageProps> = ({ onSelectProject }) => {
  const [queue, setQueue] = useState<PriorityQueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const data = await fetchPriorityQueue();
      setQueue(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
              District Magistrate & MoSPI Queue
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-xs text-gray-500">Live Algorithmic Priority</span>
          </div>
          <h1 className="text-2xl font-bold text-gov-navy mt-1">Authority Priority Review Queue</h1>
          <p className="text-xs text-gray-600">
            Answers: <strong className="text-gov-charcoal">“Where should authorities look first?”</strong> Ranked by <span className="font-mono font-semibold">Risk × Financial Exposure × Public Concern × Urgency</span>.
          </p>
        </div>

        <button
          onClick={loadQueue}
          className="px-3 py-2 border border-gray-300 rounded text-xs font-semibold hover:bg-gray-50 flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-gray-600" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Priority Logic Card */}
      <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-4 text-xs text-amber-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0" />
          <span>
            <strong>Prioritization Metric:</strong> Projects are continuously ranked by composite AI anomaly probability, scaled financial exposure, citizen grievance clusters, and execution delay status.
          </span>
        </div>
        <div className="text-[11px] text-amber-800 whitespace-nowrap font-medium">
          Showing Top {queue.length} Flagged Works
        </div>
      </div>

      {/* Queue List Table */}
      {loading ? (
        <div className="py-20 text-center text-xs text-gray-500">
          Calculating priority ranking across all active works...
        </div>
      ) : queue.length === 0 ? (
        <div className="gov-card p-12 text-center text-xs text-gray-500">
          No urgent irregularities flagged in the current queue.
        </div>
      ) : (
        <div className="gov-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4">Priority Rank</th>
                  <th className="py-3 px-4">Project & Location</th>
                  <th className="py-3 px-4">Financial Exposure</th>
                  <th className="py-3 px-4">AI Risk Score</th>
                  <th className="py-3 px-4">Primary Flagged Signals</th>
                  <th className="py-3 px-4 text-center">Public Reports</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {queue.map((item, idx) => {
                  const isCritical = item.risk_level === 'CRITICAL';
                  const isHigh = item.risk_level === 'HIGH';

                  return (
                    <tr 
                      key={item.project_id}
                      className={`hover:bg-gray-50 transition-colors ${idx === 0 ? 'bg-rose-50/40' : ''}`}
                    >
                      {/* Priority Rank */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                            idx === 0 ? 'bg-rose-700 text-white' :
                            idx < 3 ? 'bg-gov-navy text-white' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {idx + 1}
                          </span>
                          <span className="text-[10px] font-mono text-gray-400">
                            Score: {item.priority_rank_score.toFixed(0)}
                          </span>
                        </div>
                      </td>

                      {/* Project Name & Location */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-bold text-gov-navy hover:text-gov-blue cursor-pointer" onClick={() => onSelectProject(item.project_id)}>
                          {item.work_name}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {item.district}, {item.state} • <span className="font-mono">{item.project_id}</span>
                        </div>
                      </td>

                      {/* Financial Exposure */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-gov-navy">
                          ₹{(item.expenditure / 100000).toFixed(2)} Lakh
                        </div>
                        <div className="text-[10px] text-gray-400">
                          Sanction: ₹{(item.sanctioned_amount / 100000).toFixed(2)}L
                        </div>
                      </td>

                      {/* AI Risk Score */}
                      <td className="py-3 px-4">
                        <div className={`font-black text-sm ${
                          isCritical ? 'text-rose-800' : isHigh ? 'text-orange-700' : 'text-amber-700'
                        }`}>
                          {item.risk_score.toFixed(0)} / 100
                        </div>
                        <span className={
                          isCritical ? 'gov-badge-crit' :
                          isHigh ? 'gov-badge-high' : 'gov-badge-elev'
                        }>
                          {item.risk_level}
                        </span>
                      </td>

                      {/* Primary Alert Signals */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {item.primary_flags.map((flag, fIdx) => (
                            <span 
                              key={fIdx}
                              className="bg-gray-100 border border-gray-300 text-gray-700 text-[10px] px-1.5 py-0.5 rounded font-medium"
                            >
                              {flag}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Public Reports */}
                      <td className="py-3 px-4 text-center">
                        {item.public_reports_count > 0 ? (
                          <span className="bg-rose-100 text-rose-800 border border-rose-200 px-2 py-0.5 rounded font-bold text-xs">
                            {item.public_reports_count} Reports
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">0</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onSelectProject(item.project_id)}
                          className="px-3 py-1.5 bg-gov-navy hover:bg-gov-navyLight text-white rounded text-xs font-semibold flex items-center space-x-1 ml-auto"
                        >
                          <span>Inspect Dossier</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
