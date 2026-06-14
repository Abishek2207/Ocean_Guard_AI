'use client';

import React from 'react';
import { FileText, ShieldAlert, Navigation, Map as MapIcon, Cpu, Database, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  evidence: any;
  detection: any;
}

export default function EvidenceCard({ evidence, detection }: Props) {
  if (!evidence || !detection) return null;

  const getRiskColor = (level: string) => {
    switch(level) {
      case 'Critical': return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'High': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      case 'Medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
      case 'Low': return 'text-green-500 bg-green-500/10 border-green-500/30';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  const getSourceIcon = (status: string) => {
    switch(status) {
      case 'LIVE_API': return <CheckCircle2 className="w-3 h-3 text-green-400 inline mr-1" />;
      case 'CACHED_HISTORICAL': return <Database className="w-3 h-3 text-yellow-400 inline mr-1" />;
      case 'TOKEN_MISSING':
      case 'MODEL_MISSING':
      case 'API_ERROR': return <AlertCircle className="w-3 h-3 text-red-400 inline mr-1" />;
      default: return null;
    }
  };

  const riskClass = getRiskColor(evidence.risk_level);

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-4 flex flex-col shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl -mr-10 -mt-10 opacity-20 pointer-events-none ${riskClass.split(' ')[0].replace('text-', 'bg-')}`}></div>
      
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div>
          <h2 className="text-sm font-bold flex items-center gap-2 text-white uppercase tracking-wider">
            <FileText className="w-4 h-4 text-cyan-400" />
            Evidence Record
          </h2>
          <p className="text-[10px] text-slate-500 font-mono mt-1">ID: {evidence.detection_id}</p>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-bold border ${riskClass}`}>
          {evidence.risk_score} - {evidence.risk_level}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 relative z-10">
        <div className="bg-slate-950/80 rounded-lg p-2.5 border border-slate-800 col-span-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider">
            <Cpu className="w-3.5 h-3.5 text-cyan-500" /> Model
          </div>
          <div className="text-right">
            <div className="text-xs font-mono text-white">{evidence.sar_model_name}</div>
            <div className="text-[10px] text-slate-500">Conf: <span className="text-cyan-400">{evidence.sar_model_confidence}%</span></div>
          </div>
        </div>
        
        <div className="bg-slate-950/80 rounded-lg p-2.5 border border-slate-800">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
            <Navigation className="w-3.5 h-3.5 text-purple-400" /> AIS Status
          </div>
          <div className="text-xs font-bold capitalize mb-1 text-white">
            {evidence.ais_status === 'no_match' ? <span className="text-red-400">Dark Vessel</span> : evidence.ais_status}
          </div>
          <div className="text-[9px] text-slate-500 font-mono" title={evidence.ais_source_status}>
            {getSourceIcon(evidence.ais_source_status)}
            {evidence.ais_source_status.replace('_', ' ')}
          </div>
        </div>

        <div className="bg-slate-950/80 rounded-lg p-2.5 border border-slate-800">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
            <MapIcon className="w-3.5 h-3.5 text-emerald-400" /> MPA Status
          </div>
          <div className="text-xs font-bold mb-1 text-white">
            {evidence.mpa_status === 'inside' ? (
              <span className="text-red-400">Inside MPA</span>
            ) : evidence.mpa_status === 'near_buffer' ? (
              <span className="text-orange-400">Buffer ({evidence.distance_to_mpa_km}km)</span>
            ) : (
              <span className="text-emerald-400">Outside</span>
            )}
          </div>
          <div className="text-[9px] text-slate-500 font-mono truncate" title={evidence.mpa_source_status}>
            {getSourceIcon(evidence.mpa_source_status)}
            {evidence.mpa_source_status.replace('_', ' ')}
          </div>
        </div>
      </div>

      <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3 mb-3 relative z-10 shadow-inner">
        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Flag Reason</h4>
        <p className="text-xs text-slate-300 leading-relaxed">{evidence.why_flagged}</p>
      </div>

      <div className="mt-auto relative z-10">
        <div className="flex items-start gap-2 text-xs bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
          <ShieldAlert className="w-4 h-4 shrink-0 text-orange-500 mt-0.5" />
          <div>
            <p className="font-bold text-white uppercase tracking-wider text-[10px]">{evidence.human_review_required ? "Human Review Required" : "Routine"}</p>
            <p className="text-[10px] mt-0.5 text-slate-400 leading-relaxed">{evidence.legal_safety_note}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
