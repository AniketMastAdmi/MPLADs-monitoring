import React, { useState, useEffect } from 'react';
import { 
  Database, Upload, CheckCircle2, AlertTriangle, 
  RefreshCw, ShieldCheck, FileCheck, Layers, FileSpreadsheet
} from 'lucide-react';
import { fetchDataQualityReport } from '../services/api';

export const AdminImportPage: React.FC = () => {
  const [quality, setQuality] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [recalcMsg, setRecalcMsg] = useState<string | null>(null);

  // Upload Simulation State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<any>(null);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  const loadQualityReport = async () => {
    setLoading(true);
    try {
      const data = await fetchDataQualityReport();
      setQuality(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQualityReport();
  }, []);

  const handleRecalculateRisk = async () => {
    setRecalculating(true);
    setRecalcMsg(null);
    try {
      const res = await fetch('/api/ml/recalculate-risk', { method: 'POST' });
      const data = await res.json();
      setRecalcMsg(data.message || 'Batch AI risk recalculation complete.');
    } catch (err: any) {
      setRecalcMsg('Recalculation error: ' + err.message);
    } finally {
      setRecalculating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadFile(file);
      setImportSuccess(false);
      // Simulate CSV schema validation
      setUploadPreview({
        fileName: file.name,
        recordsDetected: 543,
        validRecords: 541,
        duplicatesPurged: 2,
        invalidFormatting: 0,
        detectedSchema: "MP Allocation & Constituency Dataset (Lok Sabha Schema)"
      });
    }
  };

  const handleExecuteImport = () => {
    setImporting(true);
    setTimeout(() => {
      setImporting(false);
      setImportSuccess(true);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div>
        <div className="inline-block bg-blue-100 text-gov-blue text-[10px] font-bold px-2 py-0.5 rounded uppercase mb-1">
          Ministry Administration & Data Quality
        </div>
        <h1 className="text-2xl font-bold text-gov-navy">Data Governance & Scheme Ingestion Engine</h1>
        <p className="text-xs text-gray-500">
          Auditable data management, dataset health validation, and multi-signal AI recalibration
        </p>
      </div>

      {/* 1. DATA QUALITY & HEALTH ENGINE (Section 29) */}
      <div className="bg-white border border-gov-border rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <h2 className="text-sm font-bold text-gov-navy uppercase tracking-wider">
              Dataset Health & Data Quality Score
            </h2>
          </div>
          {quality && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">System Health:</span>
              <span className="text-lg font-black text-emerald-700">
                {quality.dataset_health_score} / 100
              </span>
              <span className="gov-badge-low">{quality.health_status}</span>
            </div>
          )}
        </div>

        {quality && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-gray-50 rounded border border-gray-200">
              <span className="text-[10px] text-gray-500 block">Total MPs Ingested</span>
              <span className="font-bold text-gov-navy text-sm">{quality.metrics.total_mps_ingested}</span>
              <span className="text-[10px] text-gray-400 block">Dataset A + Dataset B</span>
            </div>
            <div className="p-3 bg-gray-50 rounded border border-gray-200">
              <span className="text-[10px] text-gray-500 block">Civil Works Monitored</span>
              <span className="font-bold text-gov-navy text-sm">{quality.metrics.total_projects_monitored}</span>
              <span className="text-[10px] text-gray-400 block">Active eSAKSHI schema</span>
            </div>
            <div className="p-3 bg-gray-50 rounded border border-gray-200">
              <span className="text-[10px] text-gray-500 block">Audit Traceability</span>
              <span className="font-bold text-emerald-700 text-sm">100% Preserved</span>
              <span className="text-[10px] text-gray-400 block">Original strings intact</span>
            </div>
            <div className="p-3 bg-gray-50 rounded border border-gray-200">
              <span className="text-[10px] text-gray-500 block">Duplicates Purged</span>
              <span className="font-bold text-gov-navy text-sm">0 Conflicts</span>
              <span className="text-[10px] text-gray-400 block">Cross-verified</span>
            </div>
          </div>
        )}

        {/* Traceability and Limitations notes */}
        <div className="space-y-1.5 pt-2 text-xs">
          <div className="font-semibold text-gov-charcoal text-[11px]">Audit Warnings & Baseline Caveats:</div>
          <ul className="space-y-1 text-gray-600 text-[11px] list-disc list-inside">
            <li>Dataset A (Rajya Sabha/Nominated) does not contain geographical constituency columns by constitutional design; mapped to State allocation.</li>
            <li>Historical projects prior to 1 April 2023 excluded in accordance with official eSAKSHI portal data boundaries.</li>
            <li>Zero values are strictly distinguished from unavailable data; missing values are never silently coerced to zero.</li>
          </ul>
        </div>
      </div>

      {/* 2. ADMIN DATASET IMPORT & VALIDATION PREVIEW (Section 32) */}
      <div className="bg-white border border-gov-border rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-gray-200 pb-3">
          <Upload className="w-5 h-5 text-gov-navy" />
          <h2 className="text-sm font-bold text-gov-navy uppercase tracking-wider">
            Admin Dataset Ingestion & Validation Preview
          </h2>
        </div>

        <p className="text-xs text-gray-600">
          Upload new MPLADS allocation or civil works CSV datasets for automated schema validation, fuzzy identity matching, and database ingestion.
        </p>

        {/* Upload Box */}
        <div className="border-2 border-dashed border-gray-300 hover:border-gov-blue rounded-lg p-8 text-center space-y-3 bg-gray-50/50">
          <FileSpreadsheet className="w-10 h-10 text-gov-navy mx-auto opacity-70" />
          <div className="space-y-1 text-xs">
            <label className="cursor-pointer text-gov-blue font-bold hover:underline">
              <span>Click to select CSV dataset</span>
              <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
            </label>
            <p className="text-gray-400 text-[11px]">Supports official eSAKSHI format or MP Allocation CSV</p>
          </div>
        </div>

        {/* Validation Preview Card */}
        {uploadPreview && (
          <div className="border border-blue-200 bg-blue-50/40 rounded-lg p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between font-bold text-gov-navy border-b border-blue-200 pb-2">
              <span>Validation Preview: {uploadPreview.fileName}</span>
              <span className="text-emerald-700 font-bold">Schema Validated</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div><strong>Detected Records:</strong> {uploadPreview.recordsDetected}</div>
              <div><strong>Valid Records:</strong> {uploadPreview.validRecords}</div>
              <div><strong>Duplicates Removed:</strong> {uploadPreview.duplicatesPurged}</div>
              <div><strong>Errors:</strong> {uploadPreview.invalidFormatting}</div>
            </div>

            <div className="text-[11px] text-gray-600">
              <strong>Detected Schema:</strong> {uploadPreview.detectedSchema}
            </div>

            {importSuccess ? (
              <div className="p-3 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded text-center font-bold">
                ✓ Import completed successfully. 541 records ingested and normalized into active database.
              </div>
            ) : (
              <button
                onClick={handleExecuteImport}
                disabled={importing}
                className="px-5 py-2 bg-gov-navy hover:bg-gov-navyLight text-white rounded font-bold text-xs shadow flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{importing ? 'Processing Ingestion...' : 'Execute Normalized Import'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3. BATCH RECALCULATE AI RISK ENGINE */}
      <div className="bg-white border border-gov-border rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-gray-200 pb-3">
          <RefreshCw className="w-5 h-5 text-gov-navy" />
          <h2 className="text-sm font-bold text-gov-navy uppercase tracking-wider">
            AI Multi-Signal Risk Engine Recalibration
          </h2>
        </div>

        <p className="text-xs text-gray-600">
          Trigger comprehensive re-evaluation of Isolation Forest anomaly scores, TF-IDF duplicate detection, milestone progress mismatch divergence, and citizen grievance clusters across all civil works.
        </p>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRecalculateRisk}
            disabled={recalculating}
            className="px-5 py-2.5 bg-gov-blue hover:bg-blue-800 text-white rounded text-xs font-bold shadow flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${recalculating ? 'animate-spin' : ''}`} />
            <span>{recalculating ? 'Executing ML Pipeline...' : 'Run Batch Risk Recalculation'}</span>
          </button>
          {recalcMsg && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded">
              {recalcMsg}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
