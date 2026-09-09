import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Sparkles, Send, ArrowRight, Building, 
  CheckCircle2, Clock, ShieldAlert, IndianRupee, PieChart,
  Award, Globe, Layers, Check, Info
} from 'lucide-react';
import { NationalAnalytics, StateAnalyticsItem, NLQueryResponse, SDGAnalytics, DataMode } from '../types';
import { 
  fetchNationalAnalytics, fetchStatesAnalytics, queryNaturalLanguage, 
  fetchSDGAnalytics, fetchBenchmarks 
} from '../services/api';

interface AnalyticsPageProps {
  onSelectProject: (projectId: string) => void;
  onNavigateExplore: (searchParam: string) => void;
  dataMode?: DataMode;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  onSelectProject,
  onNavigateExplore,
  dataMode = 'all'
}) => {
  const [national, setNational] = useState<NationalAnalytics | null>(null);
  const [states, setStates] = useState<StateAnalyticsItem[]>([]);
  const [sdgData, setSdgData] = useState<SDGAnalytics | null>(null);
  const [benchmarks, setBenchmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Natural Language Assistant State (Phase 18)
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
        const [nat, st, sdg, bm] = await Promise.all([
          fetchNationalAnalytics(dataMode),
          fetchStatesAnalytics(),
          fetchSDGAnalytics(dataMode),
          fetchBenchmarks(dataMode)
        ]);
        setNational(nat);
        setStates(st);
        setSdgData(sdg);
        setBenchmarks(bm.states || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [dataMode]);

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
        <h1 className="text-2xl font-bold text-gov-navy">National Analytics & SDG Development Impact</h1>
        <p className="text-xs text-gray-500">
          Executive monitoring intelligence, state benchmarking, SDG allocations, and traceable natural language queries
        </p>
      </div>

      {/* 1. TRACEABLE NATURAL LANGUAGE ANALYTICS ASSISTANT (Phase 18) */}
      <div className="bg-white border-2 border-blue-200 rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-gray-200 pb-3">
          <div className="p-1.5 bg-blue-50 text-gov-blue rounded">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gov-navy uppercase tracking-wider">
              Natural Language Analytics Assistant (Traceable & Evidence-Backed)
            </h2>
            <p className="text-[11px] text-gray-500">
              Query live computed database metrics in plain English. No AI hallucination — backed by strict database queries and verifiable provenance.
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

        {/* Assistant Response Box with Provenance Trace (Phase 18) */}
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

            {/* Traceability Details (Phase 18) */}
            <div className="bg-white/80 border border-blue-200 rounded p-3 text-[11px] space-y-1 text-gray-600 font-mono">
              <div className="flex items-center space-x-1 font-bold text-gov-blue uppercase text-[10px]">
                <Info className="w-3.5 h-3.5" />
                <span>Query Provenance & Calculation Methodology:</span>
              </div>
              <p>• Data Source: <strong>{nlResponse.data_source}</strong></p>
              <p>• Records Analyzed: <strong>{nlResponse.records_analyzed_count}</strong> project records</p>
              <p>• Filters Applied: <code>{nlResponse.filters_applied}</code></p>
              <p>• Aggregation / Method: <code>{nlResponse.aggregation_method}</code></p>
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

      {/* 2. SDG / DEVELOPMENT IMPACT CATEGORIZATION (Phase 17) */}
      <div className="bg-white border border-gov-border rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h2 className="text-sm font-bold text-gov-navy uppercase tracking-wider flex items-center space-x-2">
              <Globe className="w-4 h-4 text-gov-blue" />
              <span>Sustainable Development Goals (SDG) Investment Distribution</span>
            </h2>
            <p className="text-[11px] text-gray-500">
              Categorization of MPLADS infrastructure expenditure mapped to United Nations Sustainable Development Goals
            </p>
          </div>
          <span className="text-xs font-semibold text-gray-500">
            Total Mapped: {sdgData ? `₹${(sdgData.total_sanctioned_mapped / 100000).toFixed(1)} Lakh` : '100%'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sdgData?.sdg_distribution.map((sdg, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4 space-y-2 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-gov-navy line-clamp-1">{sdg.sdg_goal}</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                  {sdg.project_count} Works
                </span>
              </div>
              <div className="text-xs text-gray-600 space-y-0.5">
                <div className="flex justify-between">
                  <span>Sanctioned:</span>
                  <span className="font-bold">₹{(sdg.sanctioned_amount / 100000).toFixed(1)} Lakh</span>
                </div>
                <div className="flex justify-between">
                  <span>Expenditure:</span>
                  <span className="font-bold">₹{(sdg.expenditure / 100000).toFixed(1)} Lakh</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold pt-1 border-t border-gray-200">
                  <span>Utilization Rate:</span>
                  <span>{sdg.utilization_pct}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. STATE & DISTRICT COMPARATIVE BENCHMARKING (Phase 16) */}
      <div className="bg-white border border-gov-border rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h2 className="text-sm font-bold text-gov-navy uppercase tracking-wider flex items-center space-x-2">
              <Layers className="w-4 h-4 text-gov-blue" />
              <span>State & District Comparative Performance Benchmarks</span>
            </h2>
            <p className="text-[11px] text-gray-500">
              Cross-regional benchmarking across utilization rates, project delay percentages, high-risk rate, and investigation closures
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">State</th>
                <th className="py-3 px-4">Tracked Works</th>
                <th className="py-3 px-4">Sanctioned Total</th>
                <th className="py-3 px-4">Utilization Rate</th>
                <th className="py-3 px-4">Delay Rate</th>
                <th className="py-3 px-4">High-Risk Rate</th>
                <th className="py-3 px-4">Investigation Closure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {benchmarks.map((bm, i) => (
                <tr key={i} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-4 font-bold text-gov-navy">{bm.state}</td>
                  <td className="py-3 px-4">{bm.total_projects}</td>
                  <td className="py-3 px-4 font-mono">₹{(bm.total_sanctioned / 100000).toFixed(1)}L</td>
                  <td className="py-3 px-4 font-bold text-emerald-700">{bm.utilization_rate}%</td>
                  <td className="py-3 px-4 font-semibold text-amber-700">{bm.delay_rate}%</td>
                  <td className="py-3 px-4 font-bold text-red-700">{bm.high_risk_rate}%</td>
                  <td className="py-3 px-4 text-gray-600 font-medium">{bm.investigation_closure_rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
