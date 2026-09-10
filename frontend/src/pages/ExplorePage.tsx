import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, 
  AlertCircle, Building, CheckCircle2, Clock, ShieldAlert, X
} from 'lucide-react';
import { ProjectCard, DataMode } from '../types';
import { fetchProjects } from '../services/api';

interface ExplorePageProps {
  initialSearch?: string;
  onSelectProject: (projectId: string) => void;
  dataMode?: DataMode;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({ 
  initialSearch = '', 
  onSelectProject,
  dataMode = 'all'
}) => {
  const [projects, setProjects] = useState<ProjectCard[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);


  // Filter States
  const [search, setSearch] = useState(initialSearch);
  const [stateFilter, setStateFilter] = useState('all');
  const [workTypeFilter, setWorkTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');

  const statesList = [
    "Uttar Pradesh", "Maharashtra", "Bihar", "Tamil Nadu", "Gujarat",
    "West Bengal", "Kerala", "Rajasthan", "Karnataka", "Odisha", "Madhya Pradesh"
  ];

  const workTypesList = [
    "Community Infrastructure", "Drinking Water", "Education",
    "Health & Sanitation", "Roads & Bridges", "Renewable Energy", "Irrigation & Water Conservation"
  ];

  const loadProjects = async (targetPage = 1) => {
    setLoading(true);
    try {
      const res = await fetchProjects({
        search,
        state: stateFilter,
        work_type: workTypeFilter,
        status: statusFilter,
        risk_level: riskFilter,
        data_mode: dataMode,
        page: targetPage,
        limit: 12
      });
      setProjects(res.projects);
      setTotal(res.total);
      setPage(res.page);
      setPages(res.pages);
    } catch (err) {
      console.error("Failed to load projects", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects(1);
  }, [stateFilter, workTypeFilter, statusFilter, riskFilter, dataMode]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadProjects(1);
  };

  const clearFilters = () => {
    setSearch('');
    setStateFilter('all');
    setWorkTypeFilter('all');
    setStatusFilter('all');
    setRiskFilter('all');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gov-navy">Explore MPLADS Works</h1>
        <p className="text-xs text-gray-500">
          Public directory of civil development works recommended by Hon'ble Members of Parliament
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-gov-border rounded-lg p-4 shadow-sm space-y-3">
        {/* Search row */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by project name, district, MP, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs py-2.5 pl-9 pr-4 border border-gray-300 rounded focus:border-gov-blue focus:outline-none"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-gov-navy text-white rounded text-xs font-semibold hover:bg-gov-navyLight transition"
          >
            Search
          </button>
          {(search || stateFilter !== 'all' || workTypeFilter !== 'all' || statusFilter !== 'all' || riskFilter !== 'all') && (
            <button
              type="button"
              onClick={clearFilters}
              className="px-3 py-2 border border-gray-300 rounded text-xs text-gray-600 hover:bg-gray-100 flex items-center space-x-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </form>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {/* State */}
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">State</label>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full border border-gray-300 rounded p-1.5 focus:border-gov-blue focus:outline-none bg-white"
            >
              <option value="all">All States & UTs</option>
              {statesList.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Work Type */}
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Sector / Type</label>
            <select
              value={workTypeFilter}
              onChange={(e) => setWorkTypeFilter(e.target.value)}
              className="w-full border border-gray-300 rounded p-1.5 focus:border-gov-blue focus:outline-none bg-white"
            >
              <option value="all">All Sectors</option>
              {workTypesList.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded p-1.5 focus:border-gov-blue focus:outline-none bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Delayed">Delayed</option>
            </select>
          </div>

          {/* Risk Level */}
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">AI Risk Rating</label>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full border border-gray-300 rounded p-1.5 focus:border-gov-blue focus:outline-none bg-white"
            >
              <option value="all">All Risk Tiers</option>
              <option value="CRITICAL">Critical Risk (85-100)</option>
              <option value="HIGH">High Risk (70-84)</option>
              <option value="ELEVATED">Elevated (50-69)</option>
              <option value="MODERATE">Moderate (30-49)</option>
              <option value="LOW">Low Risk (0-29)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-gray-600">
        <div>
          Showing <span className="font-bold text-gov-navy">{projects.length}</span> of{' '}
          <span className="font-bold text-gov-navy">{total}</span> works
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-gray-500">Sorted by:</span>
          <span className="font-semibold text-gov-navy">Risk Priority & Sanction Value</span>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-gray-500">
          Loading monitored works...
        </div>
      ) : projects.length === 0 ? (
        <div className="gov-card p-12 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto" />
          <h3 className="font-bold text-gov-navy text-sm">
            {dataMode === 'official' ? 'Project-Level Official Data Not Available' : 'No Projects Match Your Criteria'}
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
            {dataMode === 'official' 
              ? 'Only official MP allocation registries are currently loaded. To view official project monitoring records, upload an authorized civil works CSV in Admin Ingestion, or switch to Demo Mode to inspect simulated demonstration works.'
              : 'Try adjusting your filters or search keywords.'}
          </p>
          <div className="pt-2 flex justify-center gap-2">
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gov-navy text-white text-xs font-semibold rounded hover:bg-gov-navyLight"
            >
              Reset Filters
            </button>
          </div>
        </div>
      ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((proj) => {
            const isCritical = proj.risk_level === 'CRITICAL';
            const isHigh = proj.risk_level === 'HIGH';
            const isElevated = proj.risk_level === 'ELEVATED';

            return (
              <div
                key={proj.project_id}
                onClick={() => onSelectProject(proj.project_id)}
                className="gov-card p-4 flex flex-col justify-between cursor-pointer group"
              >
                <div className="space-y-3">
                  {/* Top Bar: Location & Risk Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                      {proj.state} • {proj.district}
                    </span>
                    <span className={
                      isCritical ? 'gov-badge-crit' :
                      isHigh ? 'gov-badge-high' :
                      isElevated ? 'gov-badge-elev' : 'gov-badge-low'
                    }>
                      {proj.risk_score.toFixed(0)} • {proj.risk_level}
                    </span>
                  </div>

                  {/* Project Work Name */}
                  <h3 className="text-sm font-bold text-gov-navy group-hover:text-gov-blue line-clamp-2 transition-colors">
                    {proj.work_name}
                  </h3>

                  {/* MP & Sector */}
                  <div className="text-xs text-gray-600 space-y-0.5">
                    <div><span className="text-gray-400">MP:</span> {proj.mp_name || 'General Allocation'}</div>
                    <div><span className="text-gray-400">Sector:</span> {proj.work_type}</div>
                  </div>

                  {/* Physical vs Financial Progress Visualizer */}
                  <div className="pt-2 border-t border-gray-100 space-y-1.5">
                    <div className="flex justify-between text-[11px] text-gray-500">
                      <span>Physical: <strong className="text-gov-charcoal">{proj.physical_progress}%</strong></span>
                      <span>Financial: <strong className="text-gov-charcoal">{proj.financial_progress}%</strong></span>
                    </div>
                    {/* Multi-tier progress bar */}
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden relative">
                      {/* Financial (gray-blue) */}
                      <div
                        className="bg-blue-300 h-full absolute left-0 top-0 opacity-60"
                        style={{ width: `${Math.min(proj.financial_progress, 100)}%` }}
                      ></div>
                      {/* Physical (green) */}
                      <div
                        className="bg-gov-green h-full absolute left-0 top-0"
                        style={{ width: `${Math.min(proj.physical_progress, 100)}%` }}
                      ></div>
                    </div>
                    {/* Progress gap warning if divergent */}
                    {proj.financial_progress - proj.physical_progress > 20 && (
                      <div className="text-[10px] text-rose-700 font-semibold flex items-center space-x-1 pt-0.5">
                        <AlertCircle className="w-3 h-3" />
                        <span>Financial ahead by {(proj.financial_progress - proj.physical_progress).toFixed(0)}%</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer: Financials & Action */}
                <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Sanctioned</span>
                    <span className="font-bold text-gov-navy">
                      ₹{(proj.sanctioned_amount / 100000).toFixed(1)} Lakh
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block">Status</span>
                    <span className={`font-semibold text-xs ${
                      proj.status === 'Completed' ? 'text-emerald-700' :
                      proj.status === 'Delayed' ? 'text-amber-700' : 'text-blue-700'
                    }`}>
                      {proj.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {pages > 1 && (
        <div className="flex items-center justify-center space-x-3 pt-4 text-xs">
          <button
            onClick={() => loadProjects(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1.5 border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50 flex items-center space-x-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
          <span className="text-gray-600">
            Page <strong className="text-gov-navy">{page}</strong> of <strong>{pages}</strong>
          </span>
          <button
            onClick={() => loadProjects(page + 1)}
            disabled={page >= pages}
            className="px-3 py-1.5 border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50 flex items-center space-x-1"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
