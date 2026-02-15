
import React, { useEffect, useRef } from 'react';
import { MapPin, AlertTriangle, ShieldCheck, TrendingDown, Users, Info } from 'lucide-react';
import { Hotspot, AnalysisResult, RiskLevel } from '../types';

declare const L: any; // Leaflet global

interface HotspotMapProps {
  hotspots: Hotspot[];
  history: AnalysisResult[];
}

const HotspotMap: React.FC<HotspotMapProps> = ({ hotspots, history }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map if it doesn't exist
    if (!mapInstanceRef.current) {
      // Default center (San Francisco or first historical point if available)
      const center = history.find(h => h.location)?.location 
        ? [history.find(h => h.location)!.location!.latitude, history.find(h => h.location)!.location!.longitude] 
        : [37.7749, -122.4194];

      mapInstanceRef.current = L.map(mapContainerRef.current).setView(center, 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);

      markersLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }

    // Clear existing markers
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
    }

    // Add historical data points
    history.forEach((h, index) => {
      if (h.location) {
        const color = h.riskLevel === RiskLevel.SAFE ? '#10b981' : h.riskLevel === RiskLevel.CAUTION ? '#f59e0b' : '#ef4444';
        
        const circle = L.circleMarker([h.location.latitude, h.location.longitude], {
          radius: 8,
          fillColor: color,
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        });

        circle.bindPopup(`
          <div class="p-1">
            <h4 class="font-bold text-slate-800 m-0">${h.riskLevel}</h4>
            <p class="text-xs text-slate-500 mb-2">${new Date(h.timestamp).toLocaleDateString()}</p>
            <div class="text-xs font-bold text-blue-600">Score: ${h.score}/100</div>
          </div>
        `);

        markersLayerRef.current.addLayer(circle);
      }
    });

    // Add aggregate regional hotspots (simulated from static data or high-density risk areas)
    hotspots.forEach(hotspot => {
      // For this demo, we translate our 0-100 coordinates to actual lat/lng relative to center
      // In a real app, these would be real GPS coords from a database
      const center = mapInstanceRef.current.getCenter();
      const lat = center.lat + (hotspot.lat - 50) / 100;
      const lng = center.lng + (hotspot.lng - 50) / 100;

      const hotspotColor = hotspot.avgScore < 50 ? '#ef4444' : '#f59e0b';
      
      const zone = L.circle([lat, lng], {
        color: hotspotColor,
        fillColor: hotspotColor,
        fillOpacity: 0.2,
        radius: 1000 // meters
      });

      zone.bindPopup(`
        <div class="p-1">
          <h4 class="font-bold text-slate-800 m-0">${hotspot.region}</h4>
          <p class="text-xs text-slate-500 m-0">Avg Quality: ${hotspot.avgScore}%</p>
          <p class="text-xs font-bold text-rose-600 m-0">Issue: ${hotspot.dominantIssue}</p>
        </div>
      `);

      markersLayerRef.current.addLayer(zone);
    });

    return () => {
      // Cleanup if necessary
    };
  }, [history, hotspots]);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">High Risk Areas</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-rose-600">
              {hotspots.filter(h => h.avgScore < 50).length}
            </span>
            <AlertTriangle size={18} className="text-rose-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Local Reports</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-blue-600">
              {history.length}
            </span>
            <Users size={18} className="text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Safe Zones</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-emerald-600">
              {hotspots.filter(h => h.avgScore >= 80).length}
            </span>
            <ShieldCheck size={18} className="text-emerald-500" />
          </div>
        </div>
      </div>

      <div className="relative aspect-[16/10] w-full bg-slate-200 rounded-3xl border-4 border-white shadow-xl overflow-hidden z-0">
        <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '300px' }}></div>
        
        {/* Overlays for better context */}
        <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-md p-3 rounded-xl border border-white/50 shadow-lg pointer-events-none">
          <div className="flex items-center gap-2 mb-2">
            <Info size={14} className="text-blue-500" />
            <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Live Water Map</span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium leading-tight">Showing localized test data<br/>and detected regional hotspots.</p>
        </div>

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-md p-3 rounded-xl border border-white/50 shadow-sm space-y-2 pointer-events-none">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200"></div>
            <span className="text-[10px] font-bold text-slate-600 uppercase">Safe Sample</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 ring-2 ring-amber-200"></div>
            <span className="text-[10px] font-bold text-slate-600 uppercase">Caution Area</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-rose-200"></div>
            <span className="text-[10px] font-bold text-slate-600 uppercase">Contamination Alert</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <TrendingDown className="text-rose-500" size={18} />
          Seasonal Infrastructure Alerts
        </h3>
        <div className="grid gap-3">
          <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <MapPin className="text-rose-500" size={16} />
              </div>
              <div>
                <span className="text-sm font-bold text-rose-900 block">Aquifer A Contamination</span>
                <span className="text-[10px] text-rose-600 font-medium uppercase">Infrastructure Failure • High TDS</span>
              </div>
            </div>
            <span className="text-[10px] font-black bg-rose-500 text-white px-3 py-1 rounded-full uppercase shadow-sm">Urgent</span>
          </div>
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <MapPin className="text-amber-500" size={16} />
              </div>
              <div>
                <span className="text-sm font-bold text-amber-900 block">East River Junction</span>
                <span className="text-[10px] text-amber-600 font-medium uppercase">Turbidity Warning • Seasonal Runoff</span>
              </div>
            </div>
            <span className="text-[10px] font-black bg-amber-500 text-white px-3 py-1 rounded-full uppercase shadow-sm">Monitoring</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotspotMap;
