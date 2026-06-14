'use client';

import React, { useState, useEffect } from 'react';
import { Waves, Activity, Database, AlertTriangle, ShieldCheck, Download, Info, CheckCircle2 } from 'lucide-react';
import MapDashboard from './components/MapDashboard';
import SARPreview from './components/SARPreview';
import EvidenceCard from './components/EvidenceCard';
import AgentPanel from './components/AgentPanel';
import RiskLegend from './components/RiskLegend';
import axios from 'axios';

export default function Home() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'live' | 'cached' | 'offline'>('checking');
  const [detections, setDetections] = useState<any[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [filterLevel, setFilterLevel] = useState<string>('All');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    // Check backend health
    axios.get('http://localhost:8000/health')
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
      const res = await axios.post('http://localhost:8000/api/report/export', {
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

  const filteredDetections = detections.filter(d => 
    filterLevel === 'All' || d.evidence_card.risk_level === filterLevel
  );

  const currentDet = filteredDetections[selectedIdx];

  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden bg-ocean-950">
      {/* Responsible AI Banner */}
      <div className="bg-ocean-900 border-b border-ocean-800 px-6 py-1.5 flex justify-center items-center text-xs text-slate-400 gap-2 shrink-0">
        <ShieldCheck className="w-4 h-4 text-green-400" />
        <span><strong>Responsible AI Notice:</strong> This system assists human analysts by flagging possible dark fishing risk. It does not provide legal proof of illegal fishing. Human review is strictly required.</span>
      </div>

      {/* Header */}
      <header className="h-16 border-b border-ocean-800 bg-ocean-900/50 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-ocean-800 rounded-lg flex items-center justify-center border border-ocean-700">
            <Waves className="w-6 h-6 text-ocean-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">OceanGuard AI</h1>
            <p className="text-xs text-ocean-accent/80 font-mono tracking-wider">PRODUCTION DEMO</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <RiskLegend />
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-ocean-950 border border-ocean-800">
            {apiStatus === 'checking' && <Activity className="w-4 h-4 text-slate-400 animate-pulse" />}
            {apiStatus === 'live' && <CheckCircle2 className="w-4 h-4 text-green-400" />}
            {apiStatus === 'cached' && <Database className="w-4 h-4 text-yellow-400" />}
            {apiStatus === 'offline' && <AlertTriangle className="w-4 h-4 text-red-400" />}
            
            <span className="text-xs font-medium text-slate-300">
              {apiStatus === 'checking' && 'Checking API...'}
              {apiStatus === 'live' && 'Backend Connected'}
              {apiStatus === 'cached' && 'Cached Fallback Active'}
              {apiStatus === 'offline' && 'Backend Offline'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-4 grid grid-cols-12 gap-4 h-[calc(100vh-6rem)]">
        
        {/* Left Column: SAR & Map */}
        <div className="col-span-12 lg:col-span-7 xl:col-span-8 flex flex-col gap-4 min-h-0">
          <div className="h-1/3 min-h-[250px] flex gap-4">
            <div className="flex-1">
              <SARPreview onInferenceComplete={handleInference} />
            </div>
            {/* How it works panel */}
            <div className="hidden xl:flex w-64 bg-ocean-900 border border-ocean-700 rounded-xl p-4 flex-col text-sm">
              <h3 className="font-bold flex items-center gap-2 mb-3 text-ocean-accent"><Info className="w-4 h-4" /> How it works</h3>
              <ol className="list-decimal list-inside space-y-2 text-slate-300">
                <li><span className="text-white">SAR Detection</span>: YOLOv8 scans image for vessels.</li>
                <li><span className="text-white">AIS Match</span>: Cross-references Global Fishing Watch.</li>
                <li><span className="text-white">MPA Overlay</span>: Checks Protected Planet boundaries.</li>
                <li><span className="text-white">Risk Score</span>: Computes risk based on mismatches & proximity.</li>
                <li><span className="text-white">Human Review</span>: AI Agents explain evidence.</li>
              </ol>
            </div>
          </div>
          <div className="flex-1 relative rounded-xl overflow-hidden min-h-[300px]">
            <MapDashboard detections={filteredDetections} />
          </div>
        </div>

        {/* Right Column: Evidence & Agents */}
        <div className="col-span-12 lg:col-span-5 xl:col-span-4 flex flex-col gap-4 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
          {detections.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-ocean-900/30 rounded-xl border border-ocean-800 border-dashed p-8 text-center">
              <Database className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No active detections</p>
              <p className="text-sm text-slate-400">Upload a SAR image to begin multi-agent analysis.</p>
            </div>
          ) : (
            <>
              {/* Filters & Actions */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {['All', 'Critical', 'High', 'Medium', 'Low'].map(level => (
                    <button
                      key={level}
                      onClick={() => { setFilterLevel(level); setSelectedIdx(0); }}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors border ${
                        filterLevel === level 
                          ? 'bg-ocean-700 text-white border-ocean-500' 
                          : 'bg-ocean-950 text-slate-400 border-ocean-800 hover:bg-ocean-800'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                {currentDet && (
                  <button 
                    onClick={handleDownloadReport}
                    disabled={downloading}
                    className="flex items-center gap-1.5 text-xs font-medium bg-ocean-highlight/20 text-ocean-accent hover:bg-ocean-highlight/40 px-3 py-1.5 rounded border border-ocean-accent/30 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {downloading ? 'Exporting...' : 'Export Report'}
                  </button>
                )}
              </div>

              {/* Detection Selector */}
              {filteredDetections.length > 0 ? (
                <>
                  <div className="flex gap-2 overflow-x-auto pb-1 shrink-0">
                    {filteredDetections.map((det, idx) => (
                      <button
                        key={det.evidence_card.detection_id}
                        onClick={() => setSelectedIdx(idx)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors border ${
                          idx === selectedIdx 
                            ? 'bg-ocean-800 text-white border-ocean-500 shadow-inner' 
                            : 'bg-ocean-950 text-slate-400 border-ocean-800 hover:bg-ocean-800'
                        }`}
                      >
                        {det.evidence_card.detection_id.split('-').pop()}
                      </button>
                    ))}
                  </div>

                  <div className="shrink-0">
                    <EvidenceCard 
                      evidence={currentDet?.evidence_card} 
                      detection={currentDet?.detection} 
                    />
                  </div>
                  
                  <div className="flex-1 min-h-0">
                    <AgentPanel analysis={currentDet?.agents_analysis} />
                  </div>
                </>
              ) : (
                <div className="p-4 text-center text-slate-500">No detections match this filter.</div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
