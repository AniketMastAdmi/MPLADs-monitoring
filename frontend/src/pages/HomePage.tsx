import React, { useState, useEffect } from 'react';
import { 
  Search, ShieldAlert, ArrowRight, CheckCircle2, 
  AlertTriangle, Clock, TrendingUp, IndianRupee, 
  Building, Users, FileWarning, Eye, Sparkles, ExternalLink,
  Shield, Activity, Database, Award
} from 'lucide-react';
import { NationalAnalytics, ProjectCard, PriorityQueueItem, DataHealthFreshness, DataMode } from '../types';
import { fetchNationalAnalytics, fetchProjects, fetchPriorityQueue, fetchDataHealth } from '../services/api';

interface HomePageProps {
  onNavigate: (tab: string, filterParam?: string) => void;
  onSelectProject: (projectId: string) => void;
  dataMode?: DataMode;
}

export const HomePage: React.FC<HomePageProps> = ({ 
  onNavigate, 
  onSelectProject,
  dataMode = 'all'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [analytics, setAnalytics] = useState<NationalAnalytics | null>(null);
  const [featuredWorks, setFeaturedWorks] = useState<ProjectCard[]>([]);
  const [priorityCases, setPriorityCases] = useState<PriorityQueueItem[]>([]);
  const [dataHealth, setDataHealth] = useState<DataHealthFreshness | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [natData, projData, queueData, healthData] = await Promise.all([
          fetchNationalAnalytics(dataMode),
          fetchProjects({ data_mode: dataMode, limit: 4 }),
          fetchPriorityQueue(dataMode, 3),
          fetchDataHealth()
        ]);
        setAnalytics(natData);
        setFeaturedWorks(projData.projects);
        setPriorityCases(queueData);
        setDataHealth(healthData);
      } catch (err) {
        console.error("Home data load error", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [dataMode]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onNavigate('explore', searchTerm.trim());
    } else {
      onNavigate('explore');
    }
  };

  const formatCr = (amt: number) => {
    const cr = amt / 10000000;
    return `₹${cr.toLocaleString('en-IN', { maximumFractionDigits: 1 })} Cr`;
  };

  return (
    <div className="space-y-10 pb-12">
      {/* 1. CITIZEN-FIRST HERO SECTION */}
      <section className="bg-gradient-to-b from-white to-gray-50 border-b border-gov-border pt-10 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 text-gov-blue px-3 py-1 rounded-full text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-gov-blue"></span>
            <span>MoSPI Data Informatics & Innovation Division (DIID) • Smart India Hackathon</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-gov-navy tracking-tight leading-tight">
            Track Development. Understand Spending. <br className="hidden sm:inline" />
            <span className="text-gov-blue">Raise Your Voice.</span>
          </h1>

          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Explore MPLADS scheme works, understand expenditure and progress, investigate anomalous patterns, and submit geotagged public concerns.
          </p>

          {/* Quick Action CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('explore')}
              className="w-full sm:w-auto px-5 py-2.5 bg-gov-navy text-white font-semibold rounded text-xs sm:text-sm hover:bg-gov-navyLight transition shadow flex items-center justify-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>Explore Works</span>
            </button>
            <button
              onClick={() => onNavigate('investigations')}
              className="w-full sm:w-auto px-5 py-2.5 bg-gov-blue text-white font-semibold rounded text-xs sm:text-sm hover:bg-blue-800 transition shadow flex items-center justify-center space-x-2"
            >
              <Shield className="w-4 h-4" />
              <span>Investigation Workflow</span>
            </button>
            <button
              onClick={() => onNavigate('queue')}
              className="w-full sm:w-auto px-5 py-2.5 bg-amber-50 text-amber-900 border border-amber-300 font-semibold rounded text-xs sm:text-sm hover:bg-amber-100 transition shadow-sm flex items-center justify-center space-x-2"
            >
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              <span>Priority Queue</span>
            </button>
            <button
              onClick={() => onNavigate('report')}
              className="w-full sm:w-auto px-5 py-2.5 bg-white text-gov-navy border border-gray-300 font-semibold rounded text-xs sm:text-sm hover:bg-gray-50 transition shadow-sm flex items-center justify-center space-x-2"
            >
              <FileWarning className="w-4 h-4 text-amber-600" />
              <span>Report Issue</span>
            </button>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="pt-2 max-w-2xl mx-auto">
            <div className="relative flex items-center shadow-sm">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by MP name, constituency, district, or project keyword (e.g. Varanasi, Community Hall)..."
                className="w-full pl-10 pr-24 py-3 border-2 border-gov-border rounded-lg text-xs sm:text-sm focus:outline-none focus:border-gov-blue bg-white text-gov-charcoal"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3" />
              <button
                type="submit"
                className="absolute right-1.5 px-4 py-1.5 bg-gov-blue text-white text-xs font-semibold rounded hover:bg-blue-800 transition"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 2. DATA HEALTH & FRESHNESS BANNER (Phase 1) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-gov-border rounded-lg p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-gov-navy uppercase tracking-wider">
                  Data Freshness & Provenance Engine
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded border border-emerald-200">
                  Health: {dataHealth?.quality_score ?? 98.5} / 100
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Source: {dataHealth?.source_name ?? 'MoSPI e-SAKSHI & Official Datasets'} • Last Synced: {dataHealth?.last_synchronization ?? 'Active'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate('admin')}
              className="text-xs font-semibold text-gov-blue hover:underline flex items-center space-x-1"
            >
              <span>View Data Health & Logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. EARLY WARNING ENGINE BANNER (Phase 10) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-lg p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Early Warning Advisory
                </span>
                <span className="bg-red-100 text-red-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                  Critical Trigger
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-0.5">
                Financial progress significantly outstrips physical completion in Varanasi District (Gap: 38.0%). Recommended Action: Freeze next tranche pending joint physical inspection.
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectProject("MPLAD-UP-2023-GOLDEN-01")}
            className="text-xs font-bold text-amber-900 hover:text-amber-700 underline shrink-0"
          >
            Inspect Case MPLAD-UP-2023-GOLDEN-01 →
          </button>
        </div>
      </div>

      {/* 4. HIGH-VALUE KEY PERFORMANCE METRICS (Phase 15) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Card 1: Total Allocated */}
          <div className="bg-white border border-gov-border rounded-lg p-4 shadow-sm space-y-1">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Total MP Baseline
            </span>
            <div className="text-xl sm:text-2xl font-bold text-gov-navy">
              {analytics ? formatCr(analytics.total_allocated) : '₹1,16,819 Cr'}
            </div>
            <p className="text-[11px] text-gray-500">774 Normalized MPs</p>
          </div>

          {/* Card 2: Total Expenditure & Utilization */}
          <div className="bg-white border border-gov-border rounded-lg p-4 shadow-sm space-y-1">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Expenditure & Utilization
            </span>
            <div className="text-xl sm:text-2xl font-bold text-emerald-700">
              {analytics ? `${analytics.overall_utilization}%` : '83.2%'}
            </div>
            <p className="text-[11px] text-gray-500">
              Disbursed: {analytics ? formatCr(analytics.total_expenditure) : '₹2.12 Cr'}
            </p>
          </div>

          {/* Card 3: High-Risk Works */}
          <div className="bg-white border border-gov-border rounded-lg p-4 shadow-sm space-y-1">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Monitoring Risk Cases
            </span>
            <div className="text-xl sm:text-2xl font-bold text-red-700">
              {analytics ? analytics.high_risk_works : 5}
            </div>
            <p className="text-[11px] text-gray-500">Risk Score ≥ 70 / 100</p>
          </div>

          {/* Card 4: Active Investigations */}
          <div className="bg-white border border-gov-border rounded-lg p-4 shadow-sm space-y-1">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Active Investigations
            </span>
            <div className="text-xl sm:text-2xl font-bold text-gov-blue">
              {analytics ? analytics.critical_investigations : 2}
            </div>
            <p className="text-[11px] text-gray-500">
              Overdue: {analytics ? analytics.overdue_investigations : 1} case(s)
            </p>
          </div>
        </div>
      </div>

      {/* 5. AUTHORITY PRIORITY CASES (Phase 12) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gov-navy">Top Authority Priority Queue Cases</h2>
            <p className="text-xs text-gray-500">
              Ranked via Explainable Priority: 0.35×Risk + 0.25×Exposure + 0.15×PublicImpact + 0.15×Urgency + 0.10×Concern
            </p>
          </div>
          <button
            onClick={() => onNavigate('queue')}
            className="text-xs font-semibold text-gov-blue hover:underline flex items-center space-x-1"
          >
            <span>View Full Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {priorityCases.map((item, idx) => (
            <div 
              key={item.project_id}
              className="bg-white border-2 border-gray-200 hover:border-gov-blue rounded-lg p-4 shadow-sm space-y-3 cursor-pointer transition"
              onClick={() => onSelectProject(item.project_id)}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                  Priority Rank #{idx + 1}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  item.risk_level === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  Score: {item.priority_rank_score} / 100
                </span>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gov-navy line-clamp-1">{item.work_name}</h3>
                <p className="text-[11px] text-gray-500">{item.district}, {item.state}</p>
              </div>

              <div className="flex flex-wrap gap-1">
                {item.primary_flags.slice(0, 2).map((fl, i) => (
                  <span key={i} className="text-[10px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded border border-red-200">
                    {fl}
                  </span>
                ))}
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                <span className="text-gray-500">Sanctioned: ₹{(item.sanctioned_amount / 100000).toFixed(1)}L</span>
                <span className="font-semibold text-gov-blue flex items-center space-x-1">
                  <span>Inspect Evidence</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. FLAGSHIP GOLDEN DEMO CASE SHOWCASE (Phase 2 & 20) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 to-gov-navy text-white rounded-xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center space-x-2 bg-amber-500/20 border border-amber-400 text-amber-300 px-3 py-1 rounded-full text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Flagship SIH Demonstration Case Study</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Community Facility Development — Demonstration District
            </h2>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Demonstrates our complete <strong>DETECT → EXPLAIN → PRIORITIZE → VERIFY → ACT → LEARN</strong> lifecycle:
              Flags a 38% progress divergence (89% funds spent vs 51% physical work), 128 days calendar delay, payment concentration, nearby semantic duplicate, and historical risk progression from 22 to 91 points.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="bg-white/10 p-2.5 rounded border border-white/10">
                <span className="text-gray-400 block text-[10px]">Sanction vs Spend</span>
                <span className="font-bold text-white">₹18.5L → ₹24.8L (+34%)</span>
              </div>
              <div className="bg-white/10 p-2.5 rounded border border-white/10">
                <span className="text-gray-400 block text-[10px]">Progress Gap</span>
                <span className="font-bold text-amber-300">89% Fin vs 51% Phy</span>
              </div>
              <div className="bg-white/10 p-2.5 rounded border border-white/10">
                <span className="text-gray-400 block text-[10px]">Risk Score</span>
                <span className="font-bold text-red-400">91 / 100 (CRITICAL)</span>
              </div>
              <div className="bg-white/10 p-2.5 rounded border border-white/10">
                <span className="text-gray-400 block text-[10px]">Field Verification</span>
                <span className="font-bold text-emerald-300">GPS & Photo Logged</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onSelectProject('MPLAD-UP-2023-GOLDEN-01')}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded text-xs transition shadow flex items-center space-x-2"
              >
                <span>Open Evidence Dossier (MPLAD-UP-2023-GOLDEN-01)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
