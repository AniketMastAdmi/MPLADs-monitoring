import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, IndianRupee, CheckCircle2, 
  Clock, AlertTriangle, ArrowRight, X, ChevronLeft, ChevronRight, Building
} from 'lucide-react';
import { MP, MPPortfolio } from '../types';
import { fetchMPs, fetchMPPortfolio } from '../services/api';

interface MpDirectoryPageProps {
  onSelectProject: (projectId: string) => void;
}

export const MpDirectoryPage: React.FC<MpDirectoryPageProps> = ({ onSelectProject }) => {
  const [mps, setMps] = useState<MP[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Selected MP for Portfolio Drawer
  const [selectedMpId, setSelectedMpId] = useState<number | null>(null);
  const [portfolio, setPortfolio] = useState<MPPortfolio | null>(null);
  const [portfolioLoading, setPortfolioLoading] = useState(false);

  const loadMps = async (targetPage = 1) => {
    setLoading(true);
    try {
      const res = await fetchMPs({
        search,
        state: stateFilter,
        elected_nominated: categoryFilter,
        page: targetPage,
        limit: 15
      });
      setMps(res.mps);
      setTotal(res.total);
      setPage(res.page);
      setPages(res.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMps(1);
  }, [stateFilter, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadMps(1);
  };

  const openMpPortfolio = async (mpId: number) => {
    setSelectedMpId(mpId);
    setPortfolioLoading(true);
    try {
      const data = await fetchMPPortfolio(mpId);
      setPortfolio(data);
    } catch (err) {
      console.error(err);
    } finally {
      setPortfolioLoading(false);
    }
  };

  const formatLakhOrCr = (amt: number) => {
    if (amt >= 10000000) {
      return `₹${(amt / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amt / 100000).toFixed(2)} Lakh`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gov-navy">Hon'ble Members of Parliament Directory</h1>
        <p className="text-xs text-gray-500">
          Financial allocation baselines normalized across Rajya Sabha, Lok Sabha, and Nominated MPs
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-gov-border rounded-lg p-4 shadow-sm space-y-3 text-xs">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by MP name, constituency, state..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs py-2 pl-9 pr-4 border border-gray-300 rounded focus:border-gov-blue focus:outline-none"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-gov-navy text-white rounded font-semibold hover:bg-gov-navyLight"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full border border-gray-300 rounded p-1.5 focus:border-gov-blue focus:outline-none bg-white"
            >
              <option value="all">All Categories</option>
              <option value="Elected MP">Elected MPs</option>
              <option value="Nominated MP">Nominated MPs</option>
            </select>
          </div>
        </div>
      </div>

      {/* MP Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-gray-500">
          Loading MP records...
        </div>
      ) : mps.length === 0 ? (
        <div className="gov-card p-12 text-center text-xs text-gray-500">
          No MPs found matching the search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mps.map((mp) => (
            <div
              key={mp.id}
              onClick={() => openMpPortfolio(mp.id)}
              className="gov-card p-4 flex flex-col justify-between cursor-pointer hover:border-gov-blue group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase text-gray-500">
                    {mp.state} {mp.constituency ? `• ${mp.constituency}` : ''}
                  </span>
                  <span className="bg-blue-50 text-gov-blue border border-blue-200 text-[10px] font-bold px-1.5 py-0.5 rounded">
                    {mp.elected_nominated}
                  </span>
                </div>

                <h3 className="font-bold text-gov-navy text-sm group-hover:text-gov-blue transition-colors">
                  {mp.normalized_name}
                </h3>

                <div className="text-[11px] text-gray-400 truncate" title={mp.original_name}>
                  Original: {mp.original_name}
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-500">Allocated Limit</span>
                  <span className="font-bold text-gov-navy">
                    {formatLakhOrCr(mp.allocation_amount)}
                  </span>
                </div>
              </div>

              <div className="pt-3 mt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gov-blue font-semibold">
                <span>View MP Portfolio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center space-x-3 pt-4 text-xs">
          <button
            onClick={() => loadMps(page - 1)}
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
            onClick={() => loadMps(page + 1)}
            disabled={page >= pages}
            className="px-3 py-1.5 border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50 flex items-center space-x-1"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MP Portfolio Modal / Drawer */}
      {selectedMpId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-xl border border-gray-300">
            <div className="flex items-start justify-between border-b border-gray-200 pb-3">
              <div>
                <span className="text-[10px] font-bold text-gov-blue uppercase">
                  MP Portfolio Summary
                </span>
                <h2 className="text-lg font-bold text-gov-navy">
                  {portfolio?.mp.normalized_name}
                </h2>
                <div className="text-xs text-gray-500">
                  {portfolio?.mp.state} {portfolio?.mp.constituency ? `• ${portfolio?.mp.constituency}` : ''}
                </div>
              </div>
              <button
                onClick={() => setSelectedMpId(null)}
                className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {portfolioLoading || !portfolio ? (
              <div className="py-12 text-center text-xs text-gray-500">
                Loading portfolio ledger...
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Metrics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
                    <span className="text-[10px] text-gray-500 block">Total Allocation</span>
                    <span className="font-bold text-gov-navy text-sm">
                      {formatLakhOrCr(portfolio.mp.allocation_amount)}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
                    <span className="text-[10px] text-gray-500 block">Total Expenditure</span>
                    <span className="font-bold text-gov-navy text-sm">
                      {formatLakhOrCr(portfolio.portfolio.total_expenditure)}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
                    <span className="text-[10px] text-gray-500 block">Utilization Rate</span>
                    <span className="font-bold text-emerald-700 text-sm">
                      {portfolio.portfolio.utilization_percentage}%
                    </span>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
                    <span className="text-[10px] text-gray-500 block">Portfolio Risk</span>
                    <span className={`font-bold text-sm ${
                      portfolio.portfolio.portfolio_risk_score > 70 ? 'text-rose-700' : 'text-gov-navy'
                    }`}>
                      {portfolio.portfolio.portfolio_risk_score.toFixed(0)} / 100
                    </span>
                  </div>
                </div>

                {/* Linked Works */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-gov-navy text-xs uppercase tracking-wider">
                      Linked Works ({portfolio.portfolio.projects.length})
                    </h3>
                    <div className="text-[11px] text-gray-500">
                      {portfolio.portfolio.completed_works} Completed • {portfolio.portfolio.delayed_works} Delayed
                    </div>
                  </div>

                  {portfolio.portfolio.projects.length === 0 ? (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded text-center text-gray-400 text-xs">
                      No works linked in demonstration dataset. Works are assigned during local district recommendation cycles.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {portfolio.portfolio.projects.map((p) => (
                        <div
                          key={p.project_id}
                          onClick={() => {
                            setSelectedMpId(null);
                            onSelectProject(p.project_id);
                          }}
                          className="p-2.5 bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded flex justify-between items-center cursor-pointer transition-colors"
                        >
                          <div className="max-w-md">
                            <div className="font-semibold text-gov-navy hover:underline">
                              {p.work_name}
                            </div>
                            <div className="text-[10px] text-gray-500">
                              {p.work_type} • Sanctioned: ₹{(p.sanctioned_amount / 100000).toFixed(1)}L
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            p.risk_level === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                            p.risk_level === 'HIGH' ? 'bg-orange-100 text-orange-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {p.risk_level}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
