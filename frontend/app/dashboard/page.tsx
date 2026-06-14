'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Waves, Activity, ShieldCheck, Download, CheckCircle2,
  Radar, AlertOctagon, MapPin, ListTodo, Map as MapIcon,
  ChevronRight, Zap, Eye
} from 'lucide-react';
import MapDashboard from '../components/MapDashboard';
import SARPreview from '../components/SARPreview';
import EvidenceCard from '../components/EvidenceCard';
import AgentPanel from '../components/AgentPanel';
import Link from 'next/link';
import axios from 'axios';

const stagger = { visible: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } } };

export default function MissionControl() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'live' | 'offline'>('checking');
  const [detections, setDetections] = useState<any[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [downloading, setDownloading] = useState(false);
  const [mapToggles, setMapToggles] = useState({ showAIS: true, showHeatmap: false, showFishing: false });
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    axios.get(`${API_URL}/health`)
      .then(() => setApiStatus('live'))
      .catch(() => setApiStatus('offline'));
  }, []);

  const handleInference = (data: any[]) => {
    setDetections(data);
    setSelectedIdx(0);
  };

  const handleJudgeDemo = () => {
    // Auto-select critical card after demo loads
    setTimeout(() => {
      setDetections(prev => {
        const critIdx = prev.findIndex(d => d.evidence_card?.risk_level === 'Critical');
        if (critIdx >= 0) setSelectedIdx(critIdx);
        return prev;
      });
    }, 200);
  };

  const handleDownload = async () => {
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
    } catch { alert('Failed to export report.'); }
    finally { setDownloading(false); }
  };

  const currentDet = detections[selectedIdx];
  const totalDetections = detections.length;
  const aisMismatches = detections.filter(d => d.evidence_card?.ais_status === 'no_match').length;
  const highRisk = detections.filter(d => ['Critical', 'High'].includes(d.evidence_card?.risk_level)).length;
  const mpasMonitored = new Set(detections.map(d => d.evidence_card?.mpa_name)).size;
  const dataSource = detections[0]?.evidence_card?.ais_source_status || 'AWAITING';

  const kpis = [
    { label: 'Detections', value: totalDetections, icon: <Radar className="w-4 h-4" />, color: '#6366f1' },
    { label: 'AIS Dark', value: aisMismatches, icon: <Eye className="w-4 h-4" />, color: '#00d4c8' },
    { label: 'High Risk', value: highRisk, icon: <AlertOctagon className="w-4 h-4" />, color: '#ef4444' },
    { label: 'MPAs', value: mpasMonitored, icon: <MapPin className="w-4 h-4" />, color: '#10b981' },
    { label: 'Review', value: totalDetections, icon: <ListTodo className="w-4 h-4" />, color: '#f59e0b' },
  ];

  return (
    <main className="flex flex-col h-screen overflow-hidden bg-abyss text-ocean-text" style={{ fontFamily: 'var(--font-body)' }}>

      {/* ── Responsible AI Banner ── */}
      <div className="shrink-0 px-6 py-1.5 flex items-center justify-center gap-2 text-[10px] text-ocean-muted border-b"
        style={{ background: 'rgba(0,10,18,0.95)', borderColor: 'rgba(0,212,200,0.08)' }}>
        <ShieldCheck className="w-3 h-3 text-teal shrink-0" />
        Responsible AI: Flags possible dark-fishing risk for human review only. Does not prove illegal fishing or automate enforcement.
      </div>

      {/* ── Mission Header ── */}
      <header className="shrink-0 px-6 py-3 flex items-center justify-between border-b"
        style={{ background: 'rgba(2,13,26,0.95)', borderColor: 'rgba(0,212,200,0.08)', backdropFilter: 'blur(20px)' }}>

        {/* Wordmark */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center glow-teal"
            style={{ background: 'rgba(0,212,200,0.1)', border: '1px solid rgba(0,212,200,0.2)' }}>
            <Waves className="w-4 h-4 text-teal" />
          </div>
          <div>
            <div className="text-sm font-black text-white tracking-tight leading-none">OceanGuard</div>
            <div className="text-[9px] font-mono tracking-widest text-ocean-muted uppercase leading-none mt-0.5">Conservation Intelligence</div>
          </div>
        </Link>

        {/* KPI Pills */}
        <motion.div initial="hidden" animate="visible" variants={stagger}
          className="hidden lg:flex items-center gap-2">
          {kpis.map((kpi, i) => (
            <motion.div key={i} variants={fadeUp}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
              style={{ background: `${kpi.color}0d`, border: `1px solid ${kpi.color}20` }}>
              <span style={{ color: kpi.color }}>{kpi.icon}</span>
              <span className="text-ocean-muted text-[10px]">{kpi.label}</span>
              <span className="font-black text-white font-mono">{totalDetections > 0 ? kpi.value : '—'}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Status + Actions */}
        <div className="flex items-center gap-3">
          {/* Data status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(6,22,38,0.8)', border: '1px solid rgba(0,212,200,0.1)' }}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              apiStatus === 'offline' ? 'bg-red-400' :
              apiStatus === 'checking' ? 'bg-amber-400 animate-pulse' : 'bg-teal animate-pulse'
            }`} />
            <span className="text-[10px] font-mono text-ocean-muted">
              {apiStatus === 'offline' ? 'Backend Offline' :
               apiStatus === 'checking' ? 'Connecting…' :
               dataSource === 'CACHED_HISTORICAL' ? 'Cached Demo Ready' : 'Backend Connected'}
            </span>
          </div>

          {/* Judge Demo */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={async () => {
              try {
                const res = await axios.get(`${API_URL}/api/demo/run`);
                const data = res.data.results || [];
                setDetections(data);
                const critIdx = data.findIndex((d: any) => d.evidence_card?.risk_level === 'Critical');
                setSelectedIdx(critIdx >= 0 ? critIdx : 0);
              } catch { alert('Backend offline. Start the API server first.'); }
            }}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all"
            style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }}>
            <Zap className="w-3.5 h-3.5" />
            Judge Demo
          </motion.button>

          {/* Export */}
          {currentDet && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
              style={{ background: 'rgba(0,212,200,0.08)', color: '#00d4c8', border: '1px solid rgba(0,212,200,0.2)' }}>
              <Download className="w-3.5 h-3.5" />
              {downloading ? 'Exporting…' : 'Export'}
            </motion.button>
          )}
        </div>
      </header>

      {/* ── Offline Overlay ── */}
      <AnimatePresence>
        {apiStatus === 'offline' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: 'rgba(0,10,18,0.85)', backdropFilter: 'blur(20px)' }}>
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="glass-strong rounded-3xl p-10 max-w-md w-full text-center"
              style={{ border: '1px solid rgba(239,68,68,0.2)', boxShadow: '0 0 80px rgba(239,68,68,0.08)' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <Activity className="w-7 h-7 text-red-400" />
              </div>
              <h2 className="text-xl font-black text-white mb-2">Backend Offline</h2>
              <p className="text-ocean-muted text-sm mb-8 leading-relaxed">
                OceanGuard requires the FastAPI backend to process satellite imagery and intelligence feeds.
              </p>
              <div className="rounded-xl p-4 mb-6 text-left" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,212,200,0.1)' }}>
                <p className="text-[10px] font-mono text-ocean-muted uppercase tracking-wider mb-3">Start the backend:</p>
                {['cd backend', 'venv\\Scripts\\activate', 'uvicorn app.main:app --reload'].map((cmd, i) => (
                  <code key={i} className="block text-xs text-teal font-mono mb-1">{cmd}</code>
                ))}
              </div>
              <button onClick={() => window.location.reload()}
                className="w-full py-3 rounded-xl text-sm font-bold transition-all"
                style={{ background: 'rgba(0,212,200,0.1)', color: '#00d4c8', border: '1px solid rgba(0,212,200,0.2)' }}>
                Retry Connection
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Canvas ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* LEFT PANEL */}
        <AnimatePresence>
          {leftPanelOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' as const }}
              className="shrink-0 flex flex-col border-r overflow-hidden"
              style={{ borderColor: 'rgba(0,212,200,0.08)', background: 'rgba(2,13,26,0.9)' }}>
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                <SARPreview onInferenceComplete={handleInference} onJudgeDemo={handleJudgeDemo} />

                {/* Detection Timeline */}
                {detections.length > 0 && (
                  <div className="glass-strong rounded-2xl p-4">
                    <div className="text-[10px] font-mono text-ocean-muted uppercase tracking-widest mb-4">Pipeline Status</div>
                    <div className="relative border-l ml-2 space-y-3" style={{ borderColor: 'rgba(0,212,200,0.15)' }}>
                      {[
                        'SAR upload received',
                        'YOLO inference complete',
                        'AIS match verified',
                        'MPA overlay calculated',
                        'Risk score generated',
                        'Evidence card created',
                        { label: 'Human review required', pending: true },
                      ].map((step, i) => {
                        const isPending = typeof step === 'object' && step.pending;
                        const label = typeof step === 'string' ? step : step.label;
                        return (
                          <div key={i} className="relative pl-5">
                            <div className={`absolute w-2.5 h-2.5 rounded-full -left-[5px] top-0.5 border-2 ${
                              isPending
                                ? 'bg-amber-400 border-abyss animate-pulse'
                                : 'bg-teal border-abyss'
                            }`} />
                            <p className={`text-[10px] ${isPending ? 'text-amber-400 font-bold' : 'text-ocean-muted'}`}>{label}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Panel toggle left */}
        <button onClick={() => setLeftPanelOpen(!leftPanelOpen)}
          className="shrink-0 w-5 flex items-center justify-center transition-colors hover:bg-teal/5"
          style={{ background: 'rgba(2,13,26,0.8)', borderRight: '1px solid rgba(0,212,200,0.08)' }}>
          <ChevronRight className={`w-3 h-3 text-ocean-muted transition-transform ${leftPanelOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* CENTER: Map */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Map controls */}
          <div className="shrink-0 px-3 py-2 flex items-center gap-2 border-b"
            style={{ borderColor: 'rgba(0,212,200,0.08)', background: 'rgba(2,13,26,0.8)' }}>
            <MapIcon className="w-3.5 h-3.5 text-teal" />
            <span className="text-[10px] font-mono text-ocean-muted uppercase tracking-widest">Geospatial Monitor</span>
            <div className="ml-auto flex gap-2">
              {[
                { key: 'showAIS', label: 'AIS' },
                { key: 'showHeatmap', label: 'Heatmap' },
              ].map(t => (
                <button key={t.key}
                  onClick={() => setMapToggles(p => ({ ...p, [t.key]: !p[t.key as keyof typeof p] }))}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all"
                  style={{
                    background: mapToggles[t.key as keyof typeof mapToggles] ? 'rgba(0,212,200,0.12)' : 'rgba(6,22,38,0.8)',
                    color: mapToggles[t.key as keyof typeof mapToggles] ? '#00d4c8' : '#4a7a96',
                    border: `1px solid ${mapToggles[t.key as keyof typeof mapToggles] ? 'rgba(0,212,200,0.3)' : 'rgba(0,212,200,0.08)'}`,
                  }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 relative">
            <MapDashboard detections={detections} toggles={mapToggles} />
          </div>
        </div>

        {/* Panel toggle right */}
        <button onClick={() => setRightPanelOpen(!rightPanelOpen)}
          className="shrink-0 w-5 flex items-center justify-center transition-colors hover:bg-teal/5"
          style={{ background: 'rgba(2,13,26,0.8)', borderLeft: '1px solid rgba(0,212,200,0.08)' }}>
          <ChevronRight className={`w-3 h-3 text-ocean-muted transition-transform ${rightPanelOpen ? '' : 'rotate-180'}`} />
        </button>

        {/* RIGHT PANEL: Evidence + Agents */}
        <AnimatePresence>
          {rightPanelOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' as const }}
              className="shrink-0 flex flex-col border-l overflow-hidden"
              style={{ borderColor: 'rgba(0,212,200,0.08)', background: 'rgba(2,13,26,0.9)' }}>

              {/* Evidence selector tabs */}
              {detections.length > 0 && (
                <div className="shrink-0 flex gap-1.5 p-3 border-b overflow-x-auto"
                  style={{ borderColor: 'rgba(0,212,200,0.08)' }}>
                  {detections.map((det, idx) => {
                    const lvl = det.evidence_card?.risk_level;
                    const color = lvl === 'Critical' ? '#ef4444' : lvl === 'High' ? '#f97316' : lvl === 'Medium' ? '#f59e0b' : '#10b981';
                    return (
                      <button key={det.evidence_card.detection_id}
                        onClick={() => setSelectedIdx(idx)}
                        className="shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold whitespace-nowrap transition-all"
                        style={{
                          background: idx === selectedIdx ? `${color}18` : 'rgba(6,22,38,0.6)',
                          color: idx === selectedIdx ? color : '#4a7a96',
                          border: `1px solid ${idx === selectedIdx ? color + '40' : 'rgba(0,212,200,0.08)'}`,
                        }}>
                        {det.evidence_card.detection_id.split('-').pop()}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Evidence + Agent Split */}
              <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 min-h-0">
                {detections.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                      style={{ background: 'rgba(0,212,200,0.05)', border: '1px solid rgba(0,212,200,0.1)' }}>
                      <CheckCircle2 className="w-6 h-6 text-teal opacity-30" />
                    </div>
                    <p className="text-sm font-bold text-ocean-text mb-1">No Evidence Loaded</p>
                    <p className="text-xs text-ocean-muted">Run vessel detection or load cached historical demo.</p>
                  </div>
                ) : (
                  <>
                    <AnimatePresence mode="wait">
                      <EvidenceCard
                        key={currentDet?.evidence_card?.detection_id}
                        evidence={currentDet?.evidence_card}
                        detection={currentDet?.detection}
                      />
                    </AnimatePresence>
                    <div className="h-80 shrink-0">
                      <AgentPanel analysis={currentDet?.agents_analysis} allDetections={detections} />
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom: Source Disclosure ── */}
      <div className="shrink-0 px-6 py-2 flex items-center justify-between border-t gap-4"
        style={{ borderColor: 'rgba(0,212,200,0.06)', background: 'rgba(0,5,10,0.95)' }}>
        <div className="flex items-center gap-4 text-[9px] font-mono text-ocean-muted">
          <span className="text-teal font-bold">Data Sources:</span>
          {['xView3-SAR', 'Global Fishing Watch', 'Protected Planet / WDPA', 'OpenStreetMap'].map((s, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="opacity-30">·</span>}
              <span>{s}</span>
            </React.Fragment>
          ))}
          <span className="opacity-30">·</span>
          <span className="text-amber-400">Cached Historical Demo (fallback)</span>
        </div>
        <Link href="/demo-checklist"
          className="text-[9px] font-mono text-ocean-muted hover:text-teal transition-colors">
          System Status →
        </Link>
      </div>
    </main>
  );
}
