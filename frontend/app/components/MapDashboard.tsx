'use client';

import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface Props {
  detections: any[];
  toggles: {
    showAIS: boolean;
    showHeatmap: boolean;
    showFishing: boolean;
  };
}

export default function MapDashboard({ detections, toggles }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize MapLibre
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [0, 0],
      zoom: 2,
      attributionControl: false
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      if (!map.current) return;
      
      // MPA Layer
      map.current.addSource('mpas', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: { name: 'Demo MPA' },
              geometry: {
                type: 'Polygon',
                coordinates: [[
                  [-10, -10], [10, -10], [10, 10], [-10, 10], [-10, -10]
                ]]
              }
            }
          ]
        }
      });

      map.current.addLayer({
        id: 'mpas-fill',
        type: 'fill',
        source: 'mpas',
        paint: {
          'fill-color': '#0284c7',
          'fill-opacity': 0.2
        }
      });

      map.current.addLayer({
        id: 'mpas-line',
        type: 'line',
        source: 'mpas',
        paint: {
          'line-color': '#38bdf8',
          'line-width': 2,
          'line-dasharray': [2, 2]
        }
      });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update markers and toggles
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (detections && detections.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      
      detections.forEach(det => {
        if (det.detection.longitude !== undefined && det.detection.latitude !== undefined) {
          const lng = det.detection.longitude;
          const lat = det.detection.latitude;
          
          let color = '#38bdf8'; 
          if (det.risk.level === 'Critical') color = '#ef4444';
          else if (det.risk.level === 'High') color = '#f97316';
          else if (det.risk.level === 'Medium') color = '#eab308';
          else if (det.risk.level === 'Low') color = '#22c55e';

          const marker = new maplibregl.Marker({ color })
            .setLngLat([lng, lat])
            .addTo(map.current!);
          
          markersRef.current.push(marker);
          bounds.extend([lng, lat]);
        }
      });

      if (!bounds.isEmpty()) {
        map.current.fitBounds(bounds, { padding: 50, maxZoom: 8 });
      }
    }
  }, [detections, toggles]);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-slate-800 relative shadow-inner">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Map Legend Overlay */}
      <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs text-slate-300 z-10 shadow-lg">
        <h4 className="font-bold text-white mb-2 uppercase tracking-wider text-[10px]">Active Layers</h4>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyan-600/30 border border-cyan-400 rounded-sm"></div>
            <span>MPA Boundaries (WDPA)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span>Critical Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            <span>High Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <span>Medium Risk</span>
          </div>
        </div>
      </div>
      
      {/* Toggles Status overlay */}
      {(toggles.showAIS || toggles.showHeatmap || toggles.showFishing) && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-cyan-950/80 backdrop-blur border border-cyan-500/30 px-4 py-2 rounded-full text-xs font-mono text-cyan-400 z-10 flex gap-4 shadow-lg">
          {toggles.showAIS && <span>[AIS: ON]</span>}
          {toggles.showHeatmap && <span>[HEATMAP: ON]</span>}
          {toggles.showFishing && <span>[EFFORT: ON]</span>}
        </div>
      )}
    </div>
  );
}
