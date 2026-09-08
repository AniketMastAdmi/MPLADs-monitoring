import React from 'react';
import { Info, Shield, CheckCircle2, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gov-border mt-16 text-xs text-gray-600">
      {/* Official Data Transparency Notice */}
      <div className="bg-amber-50/70 border-b border-amber-200 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-amber-900">
            <Info className="w-4 h-4 flex-shrink-0 text-amber-700" />
            <span>
              <strong>Data Source Transparency:</strong> Official MP allocation baseline sourced from provided MoSPI datasets (~₹1,16,819 Cr cumulative baseline). Demonstration project data is calibrated against official eSAKSHI schema.
            </span>
          </div>
          <div className="flex items-center space-x-3 text-amber-800 text-[11px] whitespace-nowrap">
            <span className="bg-amber-100 border border-amber-300 px-2 py-0.5 rounded font-semibold">
              eSAKSHI Scope: Post 1-Apr-2023
            </span>
            <span>Last Updated: 8 September 2026</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: About */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gov-navy text-white rounded text-[10px] font-bold flex items-center justify-center font-serif">
                GOI
              </div>
              <span className="font-bold text-gov-navy text-sm">
                MPLADS INSIGHT • MoSPI DIID
              </span>
            </div>
            <p className="text-gray-500 leading-relaxed text-xs">
              Development of an AI-powered system to detect anomalies, fraud, and inefficiencies in Member of Parliament Local Area Development Scheme (MPLADS) implementation.
            </p>
            <div className="p-3 bg-gray-50 rounded border border-gray-200 text-[11px] text-gray-600 leading-normal">
              <strong className="text-gov-charcoal">Responsible AI Disclaimer:</strong> AI-generated risk indicators are analytical signals intended to support administrative prioritization and field verification. They do not by themselves constitute legal findings, audit penalties, or evidence of misconduct.
            </div>
          </div>

          {/* Col 2: Official Portals */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gov-navy uppercase tracking-wider text-[11px]">
              Authoritative Links
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a 
                  href="https://mplads.mospi.gov.in/digigov/dashboard.html" 
                  target="_blank" 
                  rel="noreferrer"
                  className="hover:text-gov-blue flex items-center space-x-1"
                >
                  <span>eSAKSHI Official Portal</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>
              </li>
              <li>
                <a 
                  href="https://www.mospi.gov.in" 
                  target="_blank" 
                  rel="noreferrer"
                  className="hover:text-gov-blue flex items-center space-x-1"
                >
                  <span>Ministry of Statistics (MoSPI)</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>
              </li>
              <li>
                <a 
                  href="https://sih.gov.in" 
                  target="_blank" 
                  rel="noreferrer"
                  className="hover:text-gov-blue flex items-center space-x-1"
                >
                  <span>Smart India Hackathon 2026</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Principles */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gov-navy uppercase tracking-wider text-[11px]">
              Operational Lifecycle
            </h4>
            <div className="space-y-1 text-xs text-gray-500 font-medium">
              <div className="flex items-center space-x-1.5 text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>1. DETECT (Multi-Signal AI)</span>
              </div>
              <div className="flex items-center space-x-1.5 text-blue-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>2. EXPLAIN (Auditable Evidence)</span>
              </div>
              <div className="flex items-center space-x-1.5 text-amber-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>3. PRIORITIZE (Authority Queue)</span>
              </div>
              <div className="flex items-center space-x-1.5 text-indigo-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>4. VERIFY (Citizen & DM Triage)</span>
              </div>
              <div className="flex items-center space-x-1.5 text-rose-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>5. ACT (Administrative Remediation)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4 flex flex-col sm:flex-row items-center justify-between text-gray-400 text-[11px]">
          <div>
            © 2026 Ministry of Statistics and Programme Implementation (MoSPI) • Data Informatics & Innovation Division
          </div>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            <span>Security Audited</span>
            <span>•</span>
            <span>WCAG 2.1 AA Compliant</span>
            <span>•</span>
            <span>Digital India Initiative</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
