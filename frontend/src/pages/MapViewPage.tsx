import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Filter, AlertTriangle, CheckCircle2, ArrowRight, ShieldAlert, Info, Map as MapIcon } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchMapProjects } from '../services/api';
import { DataMode } from '../types';

interface MapViewPageProps {
  onSelectProject: (projectId: string) => void;
  dataMode?: DataMode;
}

export const MapViewPage: React.FC<MapViewPageProps> = ({ onSelectProject, dataMode = 'all' }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [projects, setProjects] = useState<any[]>([]);
  const [summary, setSummary] = useState<{
    mapped_count: number;
    location_missing_count: number;
    simulated_location_count: number;
    total_candidates: number;
  }>({
    mapped_count: 0,
    location_missing_count: 0,
    simulated_location_count: 0,
    total_candidates: 0
  });

  const [selectedState, setSelectedState] = useState('all');
  const [selectedRisk, setSelectedRisk] = useState('all');
  const [loading, setLoading] = useState(true);

  // Fix default leaflet marker icon issue
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await fetchMapProjects({
        data_mode: dataMode,
        state: selectedState !== 'all' ? selectedState : undefined,
        risk_level: selectedRisk !== 'all' ? selectedRisk : undefined
      });
      setProjects(data.mapped_projects || []);
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (err) {
      console.error("Failed to load map projects", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [dataMode, selectedState, selectedRisk]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current).setView([22.5937, 78.9629], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors | MoSPI DIID'
    }).addTo(map);

    const layer = L.layerGroup().addTo(map);
    markersLayerRef.current = layer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers based on mapped projects
  useEffect(() => {
    if (!markersLayerRef.current || !mapInstanceRef.current) return;

    markersLayerRef.current.clearLayers();

    projects.forEach((p) => {
      const isCritical = p.risk_level === 'CRITICAL';
      const isHigh = p.risk_level === 'HIGH';
      const isElevated = p.risk_level === 'ELEVATED';

      const color = isCritical ? '#991b1b' : isHigh ? '#ea580c' : isElevated ? '#d97706' : '#166534';

      const markerHtml = `
        <div style="
          background-color: ${color};
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 4px rgba(0,0,0,0.4);
        "></div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-map-pin',
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      const marker = L.marker([p.latitude, p.longitude], { icon: customIcon });

      const locationBadge = p.is_demo
        ? `<div style="display:inline-block; background-color:#fef3c7; color:#92400e; border:1px solid #fde68a; padding:2px 4px; border-radius:3px; font-size:9px; font-weight:bold; margin-bottom:4px;">
            Simulated Location — Demonstration Data
           </div>`
        : `<div style="display:inline-block; background-color:#ecfdf5; color:#065f46; border:1px solid #a7f3d0; padding:2px 4px; border-radius:3px; font-size:9px; font-weight:bold; margin-bottom:4px;">
            Actual Stored Coordinates
           </div>`;

      const popupContent = `
        <div style="font-family: sans-serif; font-size: 11px; max-width: 230px;">
          ${locationBadge}
          <div style="font-weight: bold; color: #0f2942; margin-bottom: 4px; line-height: 1.3;">
            ${p.work_name}
          </div>
          <div style="color: #64748b; margin-bottom: 4px;">
            ${p.district}, ${p.state}
          </div>
          <div style="margin-bottom: 6px;">
            <strong>Sanctioned:</strong> ₹${(p.sanctioned_amount / 100000).toFixed(1)} Lakh<br/>
            <strong>Physical Progress:</strong> ${p.physical_progress}%<br/>
            <strong>Coordinates:</strong> ${p.latitude.toFixed(4)}, ${p.longitude.toFixed(4)}<br/>
            <strong>AI Risk Score:</strong> <span style="color: ${color}; font-weight: bold;">${p.risk_score.toFixed(0)} (${p.risk_level})</span>
          </div>
          <button 
            id="btn-inspect-${p.project_id}"
            style="
              background: #0f2942;
              color: white;
              border: none;
              padding: 4px 8px;
              border-radius: 3px;
              cursor: pointer;
              font-size: 10px;
              font-weight: bold;
              width: 100%;
            "
          >
            Inspect Project Dossier →
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-inspect-${p.project_id}`);
        if (btn) {
          btn.onclick = () => onSelectProject(p.project_id);
        }
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [projects, onSelectProject]);

  const states = Array.from(new Set(projects.map((p) => p.state))).sort();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gov-navy">Public Map Explorer</h1>
          <p className="text-xs text-gray-500">
            Geographic visualization of MPLADS civil assets driven strictly by verified stored coordinates
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-3 bg-white border border-gov-border rounded px-3 py-1.5 text-[11px] shadow-sm">
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#166534]"></span>
            <span>Low (0-29)</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d97706]"></span>
            <span>Elevated (50-69)</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ea580c]"></span>
            <span>High (70-84)</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#991b1b]"></span>
            <span>Critical (85-100)</span>
          </div>
        </div>
      </div>

      {/* Real Map Coordinate Summary Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-white border border-gov-border rounded-lg p-3 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-gray-500 text-[10px] uppercase font-bold block">Mapped Projects</span>
            <span className="text-xl font-black text-gov-navy">{summary.mapped_count}</span>
          </div>
          <span className="bg-emerald-50 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded border border-emerald-200">
            Valid Coordinates
          </span>
        </div>

        <div className="bg-white border border-gov-border rounded-lg p-3 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-gray-500 text-[10px] uppercase font-bold block">Location Missing</span>
            <span className="text-xl font-black text-gray-700">{summary.location_missing_count}</span>
          </div>
          <span className="bg-gray-100 text-gray-600 text-[11px] font-semibold px-2 py-0.5 rounded border border-gray-300">
            Location Not Available
          </span>
        </div>

        <div className="bg-white border border-gov-border rounded-lg p-3 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-gray-500 text-[10px] uppercase font-bold block">Simulated Locations</span>
            <span className="text-xl font-black text-amber-700">{summary.simulated_location_count}</span>
          </div>
          <span className="bg-amber-50 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded border border-amber-200">
            Demonstration Data
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-gov-border rounded-lg p-3 shadow-sm flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="font-semibold text-gray-700">Filter By:</span>
        </div>

        <div>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="border border-gray-300 rounded p-1.5 focus:outline-none focus:border-gov-blue text-xs bg-white"
          >
            <option value="all">All States</option>
            {states.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="border border-gray-300 rounded p-1.5 focus:outline-none focus:border-gov-blue text-xs bg-white"
          >
            <option value="all">All Risk Tiers</option>
            <option value="CRITICAL">Critical Risk Only</option>
            <option value="HIGH">High Risk</option>
            <option value="ELEVATED">Elevated</option>
            <option value="LOW">Low Risk</option>
          </select>
        </div>

        <div className="ml-auto text-[11px] text-gray-500">
          Showing {projects.length} geocoded projects (no synthetic coordinates)
        </div>
      </div>

      {/* Map Display Container */}
      <div className="gov-card overflow-hidden h-[540px] relative">
        <div ref={mapContainerRef} className="w-full h-full"></div>
        {loading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-xs text-gray-600 z-20">
            Loading verified geographic coordinates from database...
          </div>
        )}
      </div>
    </div>
  );
};

