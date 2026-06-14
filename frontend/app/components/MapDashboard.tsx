'use client';

import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface Props {
  detections: any[];
}

export default function MapDashboard({ detections }: Props) {
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
      // Add fake MPA layer for demo purposes
      if (!map.current) return;
      
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

  // Update markers when detections change
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
          
          // Determine color based on risk
          let color = '#38bdf8'; // default
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
  }, [detections]);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-ocean-700 relative">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute top-4 left-4 bg-ocean-950/80 backdrop-blur border border-ocean-700 p-2 rounded text-xs text-slate-300 z-10 pointer-events-none">
        Map layer: Carto Dark Matter (OSM)<br/>
        MPA layer: Simulated via backend
      </div>
    </div>
  );
}
