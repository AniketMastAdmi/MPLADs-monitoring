import React, { useState } from 'react';
import { 
  Building2, ShieldAlert, MapPin, Search, BarChart3, 
  FileText, Database, UserCheck, Menu, X, AlertTriangle 
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  userRole: string;
  onRoleChange: (role: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  userRole,
  onRoleChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Building2 },
    { id: 'explore', label: 'Explore Works', icon: Search },
    { id: 'queue', label: 'Priority Review Queue', icon: ShieldAlert, badge: 'AI' },
    { id: 'map', label: 'Public Map', icon: MapPin },
    { id: 'mps', label: 'MP Directory', icon: UserCheck },
    { id: 'analytics', label: 'National Analytics', icon: BarChart3 },
    { id: 'report', label: 'Report an Issue', icon: FileText },
    { id: 'admin', label: 'Data Quality & Admin', icon: Database },
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Logo & Emblem Branding */}
          <div 
            onClick={() => onTabChange('home')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            {/* Ashoka Pillar Lion Capital Emblem Representation */}
            <div className="w-11 h-11 bg-gov-navy text-white rounded flex items-center justify-center font-serif font-bold text-lg shadow-sm border border-gov-navyLight group-hover:bg-gov-navyLight transition-colors">
              <span className="tracking-tighter">सत्यमेव</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Government of India • MoSPI / DIID
                </span>
                <span className="bg-blue-100 text-gov-blue text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-200">
                  SIH 2026
                </span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-gov-navy flex items-center space-x-2">
                <span>MPLADS INSIGHT</span>
                <span className="text-xs font-medium text-gray-500 border-l border-gray-300 pl-2">
                  Public Accountability & AI Risk Portal
                </span>
              </h1>
            </div>
          </div>

          {/* Role Switcher & Controls */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center bg-gray-50 border border-gray-300 rounded px-2.5 py-1 text-xs">
              <span className="text-gray-500 mr-2 font-medium">Active Role:</span>
              <select
                value={userRole}
                onChange={(e) => onRoleChange(e.target.value)}
                className="bg-transparent font-semibold text-gov-navy focus:outline-none cursor-pointer"
              >
                <option value="Citizen">Citizen (Public Access)</option>
                <option value="Honble MP">Hon'ble Member of Parliament</option>
                <option value="District Authority">District Authority (DDO / DM)</option>
                <option value="State Nodal Officer">State Nodal Authority</option>
                <option value="Ministry Admin">Ministry / DIID Admin</option>
              </select>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gov-navy hover:bg-gray-100 rounded focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Primary Navigation Bar (Desktop) */}
      <nav className="hidden md:block bg-gov-navy text-white text-sm font-medium border-t border-gov-navyDark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between overflow-x-auto">
          <div className="flex space-x-1 py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded transition-all text-xs font-semibold whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-gov-navy shadow-inner'
                      : 'text-gray-200 hover:bg-gov-navyLight hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="bg-amber-400 text-gov-navy text-[9px] font-extrabold px-1 py-0.2 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* eSAKSHI Synchronization Status */}
          <div className="text-[11px] text-gray-300 flex items-center space-x-2 pr-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>eSAKSHI Baseline Active</span>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gov-navy text-white px-4 py-3 border-t border-gov-navyDark space-y-2">
          <div className="pb-2 border-b border-gov-navyLight flex items-center justify-between text-xs">
            <span className="text-gray-300">Viewing as:</span>
            <select
              value={userRole}
              onChange={(e) => onRoleChange(e.target.value)}
              className="bg-gov-navyDark text-white px-2 py-1 rounded text-xs"
            >
              <option value="Citizen">Citizen (Public)</option>
              <option value="Honble MP">Hon'ble MP</option>
              <option value="District Authority">District Authority</option>
              <option value="Ministry Admin">Ministry Admin</option>
            </select>
          </div>
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
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded text-sm font-medium ${
                  isActive ? 'bg-white text-gov-navy' : 'text-gray-200 hover:bg-gov-navyLight'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
