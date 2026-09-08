import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Sparkles, Send, ArrowRight, Building, 
  CheckCircle2, Clock, ShieldAlert, IndianRupee, PieChart
} from 'lucide-react';
import { NationalAnalytics, StateAnalyticsItem, NLQueryResponse } from '../types';
import { fetchNationalAnalytics, fetchStatesAnalytics, queryNaturalLanguage } from '../services/api';

interface AnalyticsPageProps {
  onSelectProject: (projectId: string) => void;
  onNavigateExplore: (searchParam: string) => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  onSelectProject,
  onNavigateExplore
}) => {
  const [national, setNational] = useState<NationalAnalytics | null>(null);
  const [states, setStates] = useState<StateAnalyticsItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Natural Language Assistant State
  const [nlInput, setNlInput] = useState('');
  const [nlLoading, setNlLoading] = useState(false);
  const [nlResponse, setNlResponse] = useState<NLQueryResponse | null>(null);

  const sampleQueries = [
    "Which projects have more than 80% financial progress but less than 50% physical progress?",
    "Show high-risk projects in Gujarat.",
    "Which districts have the highest delays?",
    "Show all critical risk projects across India."
  ];

  useEffect(() => {
    async function load() {
      try {
        const [nat, st] = await Promise.all([
          fetchNationalAnalytics(),
          fetchStatesAnalytics()
        ]);
        setNational(nat);
        setStates(st);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleNlSubmit = async (queryText: string) => {
    if (!queryText.trim()) return;
    setNlLoading(true);
    try {
      const res = await queryNaturalLanguage(queryText.trim());
      setNlResponse(res);
    } catch (err) {
      console.error(err);
    } finally {
      setNlLoading(false);
    }
  };

  const formatCr = (val: number) => {
    return `₹${(val / 10000000).toLocaleString('en-IN', { maximumFractionDigits: 1 })} Cr`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gov-navy">National & State MPLADS Analytics</h1>
        <p className="text-xs text-gray-500">
          Executive monitoring intelligence, state drill-downs, and natural language analytical queries
        </p>
      </div>

      {/* 1. NATURAL LANGUAGE ANALYTICS ASSISTANT (Section 28) */}
      <div className="bg-white border-2 border-blue-200 rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-gray-200 pb-3">
          <div className="p-1.5 bg-blue-50 text-gov-blue rounded">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gov-navy uppercase tracking-wider">
              Natural Language Analytics Assistant
            </h2>
            <p className="text-[11px] text-gray-500">
              Query live computed database metrics in plain English. No AI hallucination — backed by strict database queries.
            </p>
          </div>
        </div>

        {/* Input Bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleNlSubmit(nlInput);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder="e.g. Which projects have >80% financial progress but <50% physical progress?..."
            value={nlInput}
            onChange={(e) => setNlInput(e.target.value)}
            className="flex-1 text-xs border border-gray-300 rounded p-2.5 focus:border-gov-blue focus:outline-none"
          />
          <button
            type="submit"
            disabled={nlLoading}
            className="px-5 py-2.5 bg-gov-navy text-white rounded text-xs font-semibold hover:bg-gov-navyLight flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{nlLoading ? 'Querying...' : 'Ask AI'}</span>
          </button>
        </form>

        {/* Suggested Queries Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-gray-600">
          <span className="font-semibold text-gray-500">Quick queries:</span>
          {sampleQueries.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setNlInput(q);
                handleNlSubmit(q);
              }}
              className="bg-gray-100 hover:bg-blue-50 hover:text-gov-blue border border-gray-300 px-2.5 py-1 rounded text-left transition-colors"
            >
              "{q}"
            </button>
          ))}
        </div>

        {/* Assistant Response Box */}
        {nlResponse && (
          <div className="mt-4 bg-blue-50/50 border border-blue-200 rounded p-4 space-y-3 text-xs">
            <div className="flex justify-between items-start text-gov-navy">
              <div>
                <span className="text-[10px] font-bold text-gov-blue uppercase">Interpreted Intent:</span>
                <div className="font-semibold text-gray-800">{nlResponse.interpreted_intent}</div>
              </div>
              <span className="text-[10px] font-mono bg-white border border-blue-200 px-2 py-0.5 rounded text-gray-600">
                Confidence: {(nlResponse.confidence * 100).toFixed(0)}%
              </span>
            </div>

            <div className="p-3 bg-white border border-blue-100 rounded text-gov-charcoal leading-relaxed font-medium">
              {nlResponse.direct_answer}
            </div>

            {/* Results table if present */}
            {nlResponse.results.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <div className="font-bold text-[11px] text-gov-navy uppercase tracking-wider">
                  Matching Database Records ({nlResponse.results.length}):
                </div>
                <div className="max-h-56 overflow-y-auto divide-y divide-gray-200 bg-white border border-gray-200 rounded">
                  {nlResponse.results.map((r, rIdx) => (
                    <div key={rIdx} className="p-2.5 hover:bg-gray-50 flex justify-between items-center text-xs">
                      <div>
                        <div 
                          className="font-bold text-gov-navy hover:underline cursor-pointer"
                          onClick={() => onSelectProject(r.project_id)}
                        >
                          {r.work_name}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {r.district}, {r.state} • {r.financial_progress ? `Fin: ${r.financial_progress} | Phy: ${r.physical_progress} (Diff: ${r.divergence})` : r.sanctioned_amount}
                        </div>
                      </div>
                      <button
                        onClick={() => onSelectProject(r.project_id)}
                        className="text-gov-blue font-semibold hover:underline text-xs flex items-center space-x-0.5"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. NATIONAL KPI SUMMARY & SECTORS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sectoral Breakdown */}
        <div className="gov-card p-5 space-y-4">
          <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wider">
            Sectoral Work Distribution
          </h3>
          <div className="space-y-2.5 text-xs">
            {national?.work_type_distribution.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-gray-700">
                  <span>{item.work_type}</span>
                  <span className="font-bold text-gov-navy">{item.count} works</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gov-blue h-full"
                    style={{ width: `${Math.min((item.count / 15) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="gov-card p-5 space-y-4">
          <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wider">
            Risk Tier Distribution
          </h3>
          <div className="space-y-2 text-xs">
            {national?.risk_level_distribution.map((item, idx) => {
              const color = item.level === 'CRITICAL' ? 'text-rose-700 font-bold' :
                item.level === 'HIGH' ? 'text-orange-700 font-bold' :
                item.level === 'ELEVATED' ? 'text-amber-700' : 'text-emerald-700';
              return (
                <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-100">
                  <span className="font-semibold text-gray-700">{item.level}</span>
                  <span className={color}>{item.count} projects</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* High Risk States */}
        <div className="gov-card p-5 space-y-4">
          <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wider">
            States with Elevated Monitoring Needs
          </h3>
          <div className="space-y-2 text-xs">
            {national?.high_risk_states.map((st, idx) => (
              <div 
                key={idx} 
                className="flex justify-between items-center p-2 bg-gray-50 hover:bg-gray-100 rounded border border-gray-100 cursor-pointer"
                onClick={() => onNavigateExplore(st.state)}
              >
                <div>
                  <div className="font-bold text-gov-navy">{st.state}</div>
                  <div className="text-[10px] text-gray-500">{st.total_works} works monitored</div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-rose-700 block">Avg Risk: {st.avg_risk}</span>
                  <span className="text-[10px] text-gov-blue hover:underline">View Works →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. STATE DRILL-DOWN TABLE (Section 26) */}
      <div className="gov-card p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-gov-navy uppercase tracking-wider">
            State-by-State Monitoring Summary
          </h3>
          <p className="text-xs text-gray-500">
            Drill-down: India → State → Constituency → Works
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold text-[10px] uppercase">
                <th className="py-2.5 px-3">State / UT</th>
                <th className="py-2.5 px-3">Hon'ble MPs</th>
                <th className="py-2.5 px-3">Allocated Limit</th>
                <th className="py-2.5 px-3">Sanctioned</th>
                <th className="py-2.5 px-3">Expenditure</th>
                <th className="py-2.5 px-3">Utilization</th>
                <th className="py-2.5 px-3">Works</th>
                <th className="py-2.5 px-3">High Risk</th>
                <th className="py-2.5 px-3 text-right">Drill-down</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {states.map((st) => (
                <tr key={st.state} className="hover:bg-gray-50">
                  <td className="py-2.5 px-3 font-bold text-gov-navy">{st.state}</td>
                  <td className="py-2.5 px-3 text-gray-600">{st.mp_count} MPs</td>
                  <td className="py-2.5 px-3 font-medium text-gov-charcoal">{formatCr(st.total_allocated)}</td>
                  <td className="py-2.5 px-3 text-gray-600">₹{(st.total_sanctioned / 100000).toFixed(1)}L</td>
                  <td className="py-2.5 px-3 font-bold text-gov-navy">₹{(st.total_expenditure / 100000).toFixed(1)}L</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-700">{st.utilization_percentage}%</td>
                  <td className="py-2.5 px-3 text-gray-600">{st.total_projects}</td>
                  <td className="py-2.5 px-3">
                    {st.high_risk_projects > 0 ? (
                      <span className="text-rose-700 font-bold bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded text-[10px]">
                        {st.high_risk_projects} Flagged
                      </span>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onNavigateExplore(st.state)}
                      className="text-gov-blue hover:underline font-semibold text-xs"
                    >
                      Filter Works →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
