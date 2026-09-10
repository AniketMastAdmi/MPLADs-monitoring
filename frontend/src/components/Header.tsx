import React, { useState } from 'react';
import { 
  Building2, ShieldAlert, MapPin, Search, BarChart3, 
  FileText, Database, UserCheck, Menu, X, Shield,
  Activity, Award, History, ToggleLeft, ToggleRight
} from 'lucide-react';
import { DataMode, UserRole } from '../types';

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  dataMode: DataMode;
  onDataModeChange: (mode: DataMode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  userRole,
  onRoleChange,
  dataMode,
  onDataModeChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Building2 },
    { id: 'explore', label: 'Explore Works', icon: Search },
    { id: 'queue', label: 'Priority Review Queue', icon: ShieldAlert, badge: 'AI' },
    { id: 'investigations', label: 'Investigations', icon: Shield, badge: 'Workflow' },
    { id: 'map', label: 'Public Map', icon: MapPin },
    { id: 'mps', label: 'MP Directory', icon: UserCheck },
    { id: 'analytics', label: 'Analytics & SDG', icon: BarChart3 },
    { id: 'model-eval', label: 'AI Evaluation', icon: Award },
    { id: 'audit', label: 'Audit Trail', icon: History },
    { id: 'report', label: 'Report Issue', icon: FileText },
    { id: 'admin', label: 'Data Health & Import', icon: Database },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gov-border shadow-sm">
      {/* Tricolor Ribbon */}
      <div className="h-1.5 w-full flex">
        <div className="h-full w-1/3 bg-[#FF9933]"></div>
        <div className="h-full w-1/3 bg-[#FFFFFF] border-y border-gray-200"></div>
        <div className="h-full w-1/3 bg-[#138808]"></div>
      </div>

      {/* Main Government Portal Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between">
          {/* Logo & Emblem Branding */}
          <div 
            onClick={() => onTabChange('home')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-gov-navy text-white rounded flex items-center justify-center font-serif font-bold text-sm shadow-sm border border-gov-navyLight group-hover:bg-gov-navyLight transition-colors">
              <span className="tracking-tighter">सत्यमेव</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  Government of India • MoSPI / DIID
                </span>
                <span className="bg-blue-100 text-gov-blue text-[9px] font-bold px-1.5 py-0.2 rounded border border-blue-200">
                  SIH 2026
                </span>
              </div>
              <h1 className="text-lg font-bold tracking-tight text-gov-navy flex items-center space-x-2 leading-tight">
                <span>MPLADS INSIGHT</span>
                <span className="hidden sm:inline-block text-[11px] font-medium text-gray-500 border-l border-gray-300 pl-2">
                  Public Accountability & AI Monitoring
                </span>
              </h1>
            </div>
          </div>

          {/* Center-Right Controls: DATA MODE SELECTOR (Phase 1) & RBAC ROLE SWITCHER (Phase 8) */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* DATA MODE SELECTOR */}
            <div className="flex items-center bg-gray-100 p-1 rounded-md border border-gray-300 text-xs">
              <span className="text-[11px] font-bold text-gray-600 px-2 uppercase tracking-wider">
                Data Mode:
              </span>
              <button
                type="button"
                onClick={() => onDataModeChange('official')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  dataMode === 'official'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${dataMode === 'official' ? 'bg-white' : 'bg-gray-400'}`}></span>
                <span>Official / Imported Data</span>
              </button>
              <button
                type="button"
                onClick={() => onDataModeChange('demo')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  dataMode === 'demo'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${dataMode === 'demo' ? 'bg-white' : 'bg-gray-400'}`}></span>
                <span>Demonstration / Simulation</span>
              </button>
              <button
                type="button"
                onClick={() => onDataModeChange('all')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                  dataMode === 'all'
                    ? 'bg-gray-800 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                All
              </button>
            </div>

            {/* RBAC PERSONA SELECTOR */}
            <div className="flex items-center bg-blue-50 border border-blue-200 rounded px-2.5 py-1 text-xs">
              <span className="text-gov-blue mr-1.5 font-bold">Role:</span>
              <select
                value={userRole}
                onChange={async (e) => {
                  const newRole = e.target.value as UserRole;
                  onRoleChange(newRole);
                  // Automatically authenticate with corresponding demo backend credentials to obtain JWT token
                  try {
                    const roleCredentials: Record<string, { u: string; p: string }> = {
                      'PUBLIC / CITIZEN': { u: 'citizen', p: 'citizen123' },
                      'DISTRICT OFFICER': { u: 'officer', p: 'officer123' },
                      'STATE ADMIN / NODAL OFFICER': { u: 'state_admin', p: 'admin123' },
                      'MINISTRY / SUPER ADMIN': { u: 'ministry_admin', p: 'super123' }
                    };
                    const creds = roleCredentials[newRole];
                    if (creds) {
                      const { loginUser } = await import('../services/api');
                      await loginUser({ username: creds.u, password: creds.p });
                    }
                  } catch (err) {
                    console.error('Role token sync error', err);
                  }
                }}
                className="bg-transparent font-semibold text-gov-navy focus:outline-none cursor-pointer text-xs"
              >
                <option value="PUBLIC / CITIZEN">PUBLIC / CITIZEN</option>
                <option value="DISTRICT OFFICER">DISTRICT OFFICER</option>
                <option value="STATE ADMIN / NODAL OFFICER">STATE ADMIN / NODAL OFFICER</option>
                <option value="MINISTRY / SUPER ADMIN">MINISTRY / SUPER ADMIN</option>
              </select>
            </div>
          </div>


          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gov-navy hover:bg-gray-100 rounded focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Global Prominent Data Mode Notice Banner (Phase 1 & Phase 20) */}
        <div className="mt-2 flex items-center justify-between px-3 py-1 text-[11px] font-medium rounded border">
          {dataMode === 'demo' ? (
            <div className="flex items-center space-x-2 text-amber-900 bg-amber-50 border-amber-200 w-full p-1 rounded">
              <span className="px-1.5 py-0.2 font-bold bg-amber-600 text-white rounded text-[10px]">
                DEMO DATA — SIMULATED RECORDS
              </span>
              <span>
                Displaying calibrated SIH demonstration works with simulated multi-signal risk scenarios. These records are synthetic and strictly separated from official audit databases.
              </span>
            </div>
          ) : dataMode === 'official' ? (
            <div className="flex items-center space-x-2 text-emerald-900 bg-emerald-50 border-emerald-200 w-full p-1 rounded">
              <span className="px-1.5 py-0.2 font-bold bg-emerald-700 text-white rounded text-[10px]">
                OFFICIAL / IMPORTED DATA
              </span>
              <span>
                Displaying official MP Allocation Data ingested from MoSPI registries. If project-level official monitoring data has not been imported via CSV, project dossiers note "Project-level official data not available".
              </span>
            </div>

          ) : (
            <div className="flex items-center space-x-2 text-blue-900 bg-blue-50 border-blue-200 w-full p-1 rounded">
              <span className="px-1.5 py-0.2 font-bold bg-gov-blue text-white rounded text-[10px]">
                COMBINED VIEW
              </span>
              <span>
                Displaying both official imported parliamentary baselines and simulation demonstration cases.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Navigation Bar */}
      <nav className="hidden lg:block bg-gov-navy text-white border-t border-gov-navyLight">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1 overflow-x-auto py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-gov-blue text-white shadow-sm font-semibold'
                      : 'text-gray-200 hover:bg-gov-navyLight hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="bg-amber-500 text-slate-900 text-[9px] font-bold px-1.5 py-0.2 rounded-full ml-1">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 px-4 pt-3 pb-6 space-y-3 shadow-lg">
          {/* Mobile Data Mode Selector */}
          <div className="bg-gray-50 p-2.5 rounded border border-gray-200 space-y-1.5">
            <span className="text-[11px] font-bold text-gray-700 uppercase">Data Mode</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => onDataModeChange('official')}
                className={`py-1.5 px-2 rounded font-medium text-center ${
                  dataMode === 'official' ? 'bg-emerald-700 text-white' : 'bg-white border text-gray-700'
                }`}
              >
                Official Data
              </button>
              <button
                type="button"
                onClick={() => onDataModeChange('demo')}
                className={`py-1.5 px-2 rounded font-medium text-center ${
                  dataMode === 'demo' ? 'bg-amber-600 text-white' : 'bg-white border text-gray-700'
                }`}
              >
                Demo Simulation
              </button>
            </div>
          </div>

          {/* Mobile Role Switcher */}
          <div className="bg-blue-50 p-2.5 rounded border border-blue-200 space-y-1">
            <span className="text-[11px] font-bold text-gov-blue uppercase">Select Role Persona</span>
            <select
              value={userRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="w-full text-xs p-1.5 bg-white border rounded font-semibold text-gov-navy"
            >
              <option value="PUBLIC / CITIZEN">PUBLIC / CITIZEN</option>
              <option value="DISTRICT OFFICER">DISTRICT OFFICER</option>
              <option value="STATE ADMIN / NODAL OFFICER">STATE ADMIN / NODAL OFFICER</option>
              <option value="MINISTRY / SUPER ADMIN">MINISTRY / SUPER ADMIN</option>
            </select>
          </div>

          {/* Mobile Nav Links */}
          <div className="grid grid-cols-2 gap-1.5 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-2 px-3 py-2.5 rounded text-xs text-left ${
                    isActive
                      ? 'bg-gov-navy text-white font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4 text-gov-blue" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
