'use client';

import React, { useState, useEffect } from 'react';
import { Waves, Activity, Database, AlertTriangle, ShieldCheck, Download, CheckCircle2, Radar, Target, MapPin, AlertOctagon, ListTodo, Map as MapIcon } from 'lucide-react';
import MapDashboard from '../components/MapDashboard';
import SARPreview from '../components/SARPreview';
import EvidenceCard from '../components/EvidenceCard';
import AgentPanel from '../components/AgentPanel';
import axios from 'axios';

export default function MissionControl() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'live' | 'cached' | 'offline'>('checking');
  const [detections, setDetections] = useState<any[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [downloading, setDownloading] = useState(false);
  const [mapToggles, setMapToggles] = useState({ showAIS: true, showHeatmap: false, showFishing: false });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    axios.get(`${API_URL}/health`)
      .then(() => setApiStatus('live')) 
      .catch(() => setApiStatus('offline'));
  }, []);

  const handleInference = (data: any) => {
    setDetections(data.results || []);
    setSelectedIdx(0);
  };

  const handleDownloadReport = async () => {
    if (!currentDet) return;
    setDownloading(true);
    try {
      const res = await axios.post(`${API_URL}/api/report/export`, {
        evidence_card: currentDet.evidence_card,
        agents_analysis: currentDet.agents_analysis
      });
      
      const blob = new Blob([res.data.report_markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `OceanGuard_Evidence_${currentDet.evidence_card.detection_id}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to generate report.');
    } finally {
      setDownloading(false);
    }
  };

  const currentDet = detections[selectedIdx];

  // KPIs
  const totalDetections = detections.length;
  const aisMismatches = detections.filter(d => d.evidence_card.ais_status === 'no_match').length;
  const highRisk = detections.filter(d => ['Critical', 'High'].includes(d.evidence_card.risk_level)).length;
  const mpasMonitored = new Set(detections.map(d => d.evidence_card.mpa_name)).size;
  const dataSourceStatus = detections.length > 0 ? detections[0].evidence_card.ais_source_status : apiStatus;

  return (
    <main className="flex flex-col min-h-screen bg-slate-950 text-slate-300 font-sans">
      {/* 1. Top Responsible AI Banner */}
      <div className="bg-yellow-950/40 border-b border-yellow-900/50 px-6 py-2 flex justify-center items-center text-xs text-yellow-500/90 gap-2 shrink-0">
        <ShieldCheck className="w-4 h-4" />
        <span className="font-medium tracking-wide uppercase">Responsible AI Notice: This system flags possible dark-fishing risk for human review. It does not prove illegal fishing or automate enforcement.</span>
      </div>

      {/* 2. Mission Header */}
      <header className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-cyan-950/50 rounded-xl flex items-center justify-center border border-cyan-800/50 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            <Waves className="w-7 h-7 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">OceanGuard AI</h1>
            <p className="text-xs text-cyan-500 font-mono tracking-widest uppercase">SDG 14 Conservation Intelligence Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Region</span>
            <span className="text-sm text-slate-300 font-mono">Global Monitor</span>
          </div>
          
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Data Status</span>
              <span className={`text-sm font-mono font-bold ${
                apiStatus === 'offline' ? 'text-red-400' : 
                dataSourceStatus === 'CACHED_HISTORICAL' ? 'text-yellow-400' : 'text-green-400'
              }`}>
                {apiStatus === 'offline' ? 'Backend Offline' : 
                 dataSourceStatus === 'CACHED_HISTORICAL' ? 'Cached Historical Demo Ready' : 
                 'Backend Connected'}
              </span>
            </div>
            {apiStatus === 'checking' && <Activity className="w-5 h-5 text-slate-400 animate-pulse" />}
            {(apiStatus === 'live' || apiStatus === 'cached') && <CheckCircle2 className="w-5 h-5 text-green-400" />}
            {apiStatus === 'offline' && <AlertTriangle className="w-5 h-5 text-red-400" />}
          </div>
          
          {/* Judge Demo Mode Button */}
          <button 
            onClick={async () => {
              try {
                const res = await axios.get(`${API_URL}/api/demo/run`);
                const data = res.data.results || [];
                setDetections(data);
                // Open critical evidence card
                const criticalIdx = data.findIndex((d: any) => d.evidence_card.risk_level === 'Critical');
                setSelectedIdx(criticalIdx >= 0 ? criticalIdx : 0);
              } catch (e) {
                console.error(e);
              }
            }}
            className="px-4 py-1.5 rounded-lg bg-cyan-900/30 border border-cyan-500/50 text-cyan-400 text-sm font-bold hover:bg-cyan-900/60 transition-colors uppercase tracking-wider"
          >
            Judge Demo Mode
          </button>
        </div>
      </header>

      {/* Offline State Overlay */}
      {apiStatus === 'offline' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-6">
          <div className="bg-slate-900 border border-red-500/30 p-8 rounded-2xl max-w-lg w-full text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent pointer-events-none"></div>
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6 opacity-80" />
            <h2 className="text-2xl font-bold text-white mb-2">Backend Connection Offline</h2>
            <p className="text-slate-400 mb-6 text-sm">
              OceanGuard AI requires the FastAPI backend to be running to process satellite imagery and connect to intelligence APIs.
            </p>
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-left mb-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">How to start the backend:</p>
              <code className="text-xs text-cyan-400 font-mono block">cd backend</code>
              <code className="text-xs text-cyan-400 font-mono block">source venv/bin/activate</code>
              <code className="text-xs text-cyan-400 font-mono block">uvicorn app.main:app --reload</code>
            </div>
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-colors">
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* 3. Executive KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-6 shrink-0 bg-slate-900/20">
        {[
          { label: "Total Detections", value: totalDetections, icon: <Radar className="text-blue-400" /> },
          { label: "AIS Mismatches", value: aisMismatches, icon: <Activity className="text-purple-400" /> },
          { label: "High-Risk Events", value: highRisk, icon: <AlertOctagon className="text-red-400" /> },
          { label: "MPAs Monitored", value: mpasMonitored, icon: <MapPin className="text-emerald-400" /> },
          { label: "Pending Reviews", value: totalDetections, icon: <ListTodo className="text-orange-400" /> }
        ].map((kpi, i) => (
          <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center gap-4 shadow-sm relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-slate-800 rounded-full opacity-20 pointer-events-none"></div>
            <div className="w-10 h-10 rounded-lg bg-slate-950 flex items-center justify-center shrink-0 border border-slate-800">
              {kpi.icon}
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</p>
              <p className="text-2xl font-black text-white font-mono">{totalDetections > 0 ? kpi.value : "--"}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Source Disclosure and Pitch Sections */}
      <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Data Sources</h3>
          <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
            <li><strong>xView3-SAR / SARFish:</strong> SAR vessel detection training source</li>
            <li><strong>Global Fishing Watch:</strong> AIS/fishing intelligence</li>
            <li><strong>Protected Planet / WDPA:</strong> MPA boundaries</li>
            <li><strong>OpenStreetMap:</strong> Base map</li>
            <li><strong>Cached historical demo data:</strong> Fallback for reliable judging</li>
          </ul>
        </div>
        <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-500/20 rounded-xl p-4">
          <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">Why OceanGuard AI is different</h3>
          <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
            <li>Not only vessel detection</li>
            <li>Combines SAR + AIS + MPA + risk scoring</li>
            <li>Explainable evidence cards</li>
            <li>Human-in-the-loop responsible AI</li>
            <li>Agentic intelligence layer for conservation officers</li>
          </ul>
        </div>
      </div>

      {/* 4. Main Layout (3-Column Grid) */}
      <div className="flex-1 px-6 pb-6 grid grid-cols-12 gap-6 min-h-0">
        
        {/* LEFT COLUMN: SAR Ingestion */}
        <div className="col-span-12 xl:col-span-3 flex flex-col gap-6 min-h-0">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col shadow-sm h-1/2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-500" />
              SAR Image Ingestion
            </h3>
            <div className="flex-1 relative">
              <SARPreview onInferenceComplete={handleInference} />
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col shadow-sm h-1/2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-500" />
              Detection Timeline
            </h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
              {detections.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center mt-8">Awaiting ingestion...</p>
              ) : (
                <div className="relative border-l border-slate-800 ml-3 space-y-4 pb-4">
                  {[
                    { step: 'Upload received', done: true },
                    { step: 'YOLO inference completed', done: true },
                    { step: 'AIS match checked', done: true },
                    { step: 'MPA overlay calculated', done: true },
                    { step: 'Risk score generated', done: true },
                    { step: 'Evidence card generated', done: true },
                    { step: 'Human review required', done: false, pending: true }
                  ].map((s, i) => (
                    <div key={i} className="relative pl-6">
                      <div className={`absolute w-3 h-3 rounded-full -left-[6.5px] top-1 border-2 border-slate-900 ${
                        s.done ? 'bg-cyan-500' : s.pending ? 'bg-orange-500 animate-pulse' : 'bg-slate-700'
                      }`}></div>
                      <p className={`text-xs ${s.done ? 'text-slate-300' : s.pending ? 'text-orange-400 font-bold' : 'text-slate-600'}`}>{s.step}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Map & Operations */}
        <div className="col-span-12 xl:col-span-6 flex flex-col gap-6 min-h-0">
          <div className="flex-1 relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-sm flex flex-col">
            <div className="bg-slate-950 p-2 border-b border-slate-800 flex justify-between items-center shrink-0">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <MapIcon className="w-4 h-4 text-cyan-500" />
                Geospatial Monitor
              </h3>
              <div className="flex gap-2">
                <button onClick={() => setMapToggles(p => ({...p, showAIS: !p.showAIS}))} className={`px-2 py-1 rounded text-[10px] font-bold border ${mapToggles.showAIS ? 'bg-cyan-900/50 text-cyan-400 border-cyan-500/30' : 'bg-slate-900 text-slate-500 border-slate-700'}`}>AIS Layer</button>
                <button onClick={() => setMapToggles(p => ({...p, showHeatmap: !p.showHeatmap}))} className={`px-2 py-1 rounded text-[10px] font-bold border ${mapToggles.showHeatmap ? 'bg-cyan-900/50 text-cyan-400 border-cyan-500/30' : 'bg-slate-900 text-slate-500 border-slate-700'}`}>Risk Heatmap</button>
              </div>
            </div>
            <div className="flex-1 relative min-h-[300px]">
              <MapDashboard detections={detections} toggles={mapToggles} />
            </div>
          </div>
          
          <div className="h-64 shrink-0 relative">
            <AgentPanel analysis={currentDet?.agents_analysis} allDetections={detections} />
          </div>
        </div>

        {/* RIGHT COLUMN: Evidence Card */}
        <div className="col-span-12 xl:col-span-3 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-500" />
              Evidence Investigation
            </h3>
            {currentDet && (
              <button 
                onClick={handleDownloadReport}
                disabled={downloading}
                className="flex items-center gap-1.5 text-[10px] font-bold bg-cyan-950 text-cyan-400 hover:bg-cyan-900 px-2 py-1 rounded border border-cyan-800 transition-colors uppercase tracking-wider"
              >
                <Download className="w-3 h-3" />
                {downloading ? 'Exporting...' : 'Export Report'}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            {detections.length === 0 ? (
              <div className="bg-slate-900/30 border border-slate-800 border-dashed rounded-xl h-full flex flex-col items-center justify-center text-slate-600">
                <AlertTriangle className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm font-medium">No Evidence Selected</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex gap-2 overflow-x-auto pb-2 shrink-0 custom-scrollbar">
                  {detections.map((det, idx) => (
                    <button
                      key={det.evidence_card.detection_id}
                      onClick={() => setSelectedIdx(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-colors border ${
                        idx === selectedIdx 
                          ? 'bg-cyan-900/30 text-white border-cyan-500 shadow-inner' 
                          : 'bg-slate-900 text-slate-500 border-slate-800 hover:bg-slate-800 hover:text-slate-300'
                      }`}
                    >
                      {det.evidence_card.detection_id.split('-').pop()}
                    </button>
                  ))}
                </div>
                
                <EvidenceCard 
                  evidence={currentDet?.evidence_card} 
                  detection={currentDet?.detection} 
                />
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
