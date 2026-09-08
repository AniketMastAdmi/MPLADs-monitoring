import React, { useState, useEffect } from 'react';
import { 
  Search, ShieldAlert, ArrowRight, CheckCircle2, 
  AlertTriangle, Clock, TrendingUp, IndianRupee, 
  Building, Users, FileWarning, Eye, Sparkles, ExternalLink
} from 'lucide-react';
import { NationalAnalytics, ProjectCard } from '../types';
import { fetchNationalAnalytics, fetchProjects } from '../services/api';

interface HomePageProps {
  onNavigate: (tab: string, filterParam?: string) => void;
  onSelectProject: (projectId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectProject }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [analytics, setAnalytics] = useState<NationalAnalytics | null>(null);
  const [featuredWorks, setFeaturedWorks] = useState<ProjectCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [natData, projData] = await Promise.all([
          fetchNationalAnalytics(),
          fetchProjects({ limit: 4 })
        ]);
        setAnalytics(natData);
        setFeaturedWorks(projData.projects);
      } catch (err) {
        console.error("Home data load error", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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
            <span>MoSPI Data Informatics & Innovation Division (DIID)</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-gov-navy tracking-tight leading-tight">
            Track Development. Understand Spending. <br className="hidden sm:inline" />
            <span className="text-gov-blue">Raise Your Voice.</span>
          </h1>

          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Explore MPLADS works, understand expenditure and progress, and report concerns through an AI-assisted public monitoring platform.
          </p>

          {/* Quick Action CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('explore')}
              className="w-full sm:w-auto px-6 py-3 bg-gov-navy text-white font-semibold rounded text-sm hover:bg-gov-navyLight transition shadow flex items-center justify-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>Explore Works</span>
            </button>
            <button
              onClick={() => onNavigate('report')}
              className="w-full sm:w-auto px-6 py-3 bg-white text-gov-navy border border-gray-300 font-semibold rounded text-sm hover:bg-gray-50 transition shadow-sm flex items-center justify-center space-x-2"
            >
              <FileWarning className="w-4 h-4 text-amber-600" />
              <span>Report an Issue</span>
            </button>
            <button
              onClick={() => onNavigate('queue')}
              className="w-full sm:w-auto px-6 py-3 bg-amber-50 text-amber-900 border border-amber-300 font-semibold rounded text-sm hover:bg-amber-100 transition shadow-sm flex items-center justify-center space-x-2"
            >
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              <span>Authority Review Queue</span>
            </button>
          </div>

          {/* Universal Sticky Search Bar */}
          <form onSubmit={handleSearchSubmit} className="pt-4 max-w-2xl mx-auto">
            <div className="relative flex items-center shadow-sm">
              <input
                type="text"
                placeholder="Search by project, MP, district, constituency, state or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-3.5 pl-11 pr-28 text-sm bg-white border-2 border-gray-300 rounded focus:border-gov-blue focus:outline-none placeholder-gray-400"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3.5" />
              <button
                type="submit"
                className="absolute right-2 px-4 py-2 bg-gov-blue text-white rounded text-xs font-semibold hover:bg-blue-800 transition"
              >
                Search
              </button>
            </div>
            <div className="flex items-center justify-center space-x-2 text-[11px] text-gray-500 mt-2">
              <span className="font-medium">Try searching:</span>
              <button type="button" onClick={() => onNavigate('explore', 'Varanasi')} className="underline hover:text-gov-blue">Varanasi</button>
              <span>•</span>
              <button type="button" onClick={() => onNavigate('explore', 'Community Facility')} className="underline hover:text-gov-blue">Community Facility</button>
              <span>•</span>
              <button type="button" onClick={() => onNavigate('explore', 'Drinking Water')} className="underline hover:text-gov-blue">Drinking Water</button>
              <span>•</span>
              <button type="button" onClick={() => onNavigate('explore', 'Maharashtra')} className="underline hover:text-gov-blue">Maharashtra</button>
            </div>
          </form>
        </div>
      </section>

      {/* 2. PUBLIC HIGH-LEVEL KPIS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gov-navy">National MPLADS Metrics</h2>
            <p className="text-xs text-gray-500">
              Aggregated across provided MP allocation datasets (~774 MPs) & eSAKSHI verified works
            </p>
          </div>
          <span className="text-[11px] bg-gray-100 text-gray-700 px-2.5 py-1 rounded border border-gray-300 font-medium">
            Status: Baseline Active
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Allocated */}
          <div className="gov-card p-4">
            <div className="flex items-center justify-between text-xs text-gray-500 font-medium mb-1">
              <span>Total Allocated</span>
              <Building className="w-4 h-4 text-gov-blue" />
            </div>
            <div className="text-xl font-extrabold text-gov-navy">
              {analytics ? formatCr(analytics.total_allocated) : '₹1,16,819 Cr'}
            </div>
            <div className="text-[11px] text-gray-500 mt-1">
              774 Hon'ble MPs baseline
            </div>
          </div>

          {/* Total Sanctioned */}
          <div className="gov-card p-4">
            <div className="flex items-center justify-between text-xs text-gray-500 font-medium mb-1">
              <span>Total Sanctioned</span>
              <IndianRupee className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-extrabold text-gov-navy">
              {analytics ? `₹${(analytics.total_sanctioned/10000000).toFixed(2)} Cr` : '₹14.28 Cr'}
            </div>
            <div className="text-[11px] text-emerald-700 font-medium mt-1">
              Approved scheme projects
            </div>
          </div>

          {/* Actual Expenditure */}
          <div className="gov-card p-4">
            <div className="flex items-center justify-between text-xs text-gray-500 font-medium mb-1">
              <span>Total Expenditure</span>
              <TrendingUp className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-xl font-extrabold text-gov-navy">
              {analytics ? `₹${(analytics.total_expenditure/10000000).toFixed(2)} Cr` : '₹12.65 Cr'}
            </div>
            <div className="text-[11px] text-gray-500 mt-1">
              Verified vendor disbursements
            </div>
          </div>

          {/* Monitored Works */}
          <div className="gov-card p-4">
            <div className="flex items-center justify-between text-xs text-gray-500 font-medium mb-1">
              <span>Active Works</span>
              <CheckCircle2 className="w-4 h-4 text-gov-green" />
            </div>
            <div className="text-xl font-extrabold text-gov-navy">
              {analytics ? analytics.total_works : '46'}
            </div>
            <div className="flex items-center space-x-2 text-[11px] mt-1 text-gray-500">
              <span className="text-emerald-700 font-semibold">{analytics?.completed_works || 16} Done</span>
              <span>•</span>
              <span className="text-amber-700 font-semibold">{analytics?.delayed_works || 9} Late</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. GOLDEN DEMO CASE STUDY SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-rose-50 border-2 border-rose-300 rounded-lg p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="bg-rose-600 text-white font-bold text-xs px-2.5 py-0.5 rounded tracking-wide uppercase">
                  Flagship Golden Demonstration Case
                </span>
                <span className="bg-white text-rose-800 border border-rose-300 text-xs px-2 py-0.5 rounded font-semibold">
                  Multi-Signal Irregularity
                </span>
              </div>
              <h3 className="text-xl font-bold text-gov-navy">
                Community Facility Development — Demonstration District
              </h3>
              <p className="text-xs text-gray-700 max-w-3xl leading-relaxed">
                Demonstrating the full multi-signal early-warning pipeline: financial progress (89%) outstrips physical completion (51%), expenditure (₹24.8 Lakh) exceeds sanction (₹18.5 Lakh) by +34%, delay exceeds 128 days, and a nearby similar work was detected.
              </p>
            </div>

            <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3">
              <div className="text-right">
                <div className="text-xs font-semibold text-gray-600 uppercase">AI Risk Score</div>
                <div className="text-3xl font-black text-rose-800">91 <span className="text-sm font-bold text-gray-500">/ 100</span></div>
                <span className="gov-badge-crit">CRITICAL RISK</span>
              </div>
              <button
                onClick={() => onSelectProject('MPLAD-UP-2023-GOLDEN-01')}
                className="px-5 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded transition flex items-center space-x-1.5 shadow"
              >
                <span>Inspect Full AI Case</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURED / RECENT MONITORED PROJECTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gov-navy">Monitored MPLADS Projects</h2>
            <p className="text-xs text-gray-500">Live civil works across states with AI risk monitoring</p>
          </div>
          <button
            onClick={() => onNavigate('explore')}
            className="text-xs font-semibold text-gov-blue hover:underline flex items-center space-x-1"
          >
            <span>View All Works</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredWorks.map((proj) => {
            const isCritical = proj.risk_level === 'CRITICAL';
            const isHigh = proj.risk_level === 'HIGH';
            return (
              <div 
                key={proj.project_id} 
                className="gov-card p-4 flex flex-col justify-between cursor-pointer"
                onClick={() => onSelectProject(proj.project_id)}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                      {proj.state} • {proj.district}
                    </span>
                    <span className={
                      isCritical ? 'gov-badge-crit' : 
                      isHigh ? 'gov-badge-high' : 
                      proj.risk_level === 'ELEVATED' ? 'gov-badge-elev' : 'gov-badge-low'
                    }>
                      {proj.risk_score.toFixed(0)} • {proj.risk_level}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-gov-navy line-clamp-2 hover:text-gov-blue transition-colors">
                    {proj.work_name}
                  </h4>

                  <div className="text-xs text-gray-600">
                    <span className="font-semibold">MP:</span> {proj.mp_name || 'General Allocation'}
                  </div>

                  {/* Progress Comparison */}
                  <div className="pt-2 border-t border-gray-100 space-y-1.5 text-xs">
                    <div className="flex justify-between text-gray-500 text-[11px]">
                      <span>Physical: {proj.physical_progress}%</span>
                      <span>Financial: {proj.financial_progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden flex">
                      <div 
                        className="bg-gov-green h-full" 
                        style={{ width: `${Math.min(proj.physical_progress, 100)}%` }}
                        title={`Physical: ${proj.physical_progress}%`}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Sanctioned</span>
                    <span className="font-bold text-gov-navy">₹{(proj.sanctioned_amount / 100000).toFixed(1)} L</span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProject(proj.project_id);
                    }}
                    className="text-gov-blue font-semibold hover:underline text-xs flex items-center space-x-1"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. HOW MPLADS INSIGHT WORKS (DETECT -> EXPLAIN -> PRIORITIZE -> VERIFY -> ACT) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-gov-border rounded-lg p-6">
          <div className="text-center max-w-2xl mx-auto mb-6">
            <h3 className="text-base font-bold text-gov-navy uppercase tracking-wider">
              Core Operating Principle
            </h3>
            <div className="text-xl font-extrabold text-gov-charcoal mt-1">
              DETECT → EXPLAIN → PRIORITIZE → VERIFY → ACT
            </div>
            <p className="text-xs text-gray-500 mt-1">
              End-to-end evidence pipeline turning raw civil works data into actionable public accountability
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs">
            <div className="p-3 bg-gray-50 rounded border border-gray-200 space-y-1">
              <div className="font-bold text-gov-navy flex items-center space-x-1">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-gov-blue font-bold flex items-center justify-center text-[11px]">1</span>
                <span>DETECT</span>
              </div>
              <p className="text-gray-600 text-[11px]">
                Multi-signal algorithms identify progress divergence, cost overruns, delays, and payment spikes.
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded border border-gray-200 space-y-1">
              <div className="font-bold text-gov-navy flex items-center space-x-1">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-gov-blue font-bold flex items-center justify-center text-[11px]">2</span>
                <span>EXPLAIN</span>
              </div>
              <p className="text-gray-600 text-[11px]">
                Transparent reasons state what was observed without calling projects "fraudulent" blindly.
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded border border-gray-200 space-y-1">
              <div className="font-bold text-gov-navy flex items-center space-x-1">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-gov-blue font-bold flex items-center justify-center text-[11px]">3</span>
                <span>PRIORITIZE</span>
              </div>
              <p className="text-gray-600 text-[11px]">
                Priority Review Queue ranks cases by Risk × Financial Exposure × Citizen Urgency.
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded border border-gray-200 space-y-1">
              <div className="font-bold text-gov-navy flex items-center space-x-1">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-gov-blue font-bold flex items-center justify-center text-[11px]">4</span>
                <span>VERIFY</span>
              </div>
              <p className="text-gray-600 text-[11px]">
                Citizen photo reports and District Magistrate inspections verify milestone reality on the ground.
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded border border-gray-200 space-y-1">
              <div className="font-bold text-gov-navy flex items-center space-x-1">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-gov-blue font-bold flex items-center justify-center text-[11px]">5</span>
                <span>ACT</span>
              </div>
              <p className="text-gray-600 text-[11px]">
                Administrative remedies: payment freezes, technical audits, and scheme compliance notices.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
