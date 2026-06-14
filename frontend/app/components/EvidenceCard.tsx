'use client';

import React from 'react';
import { FileText, ShieldAlert, Navigation, Map as MapIcon, Crosshair, Cpu, Database, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  evidence: any;
  detection: any;
}

export default function EvidenceCard({ evidence, detection }: Props) {
  if (!evidence || !detection) return null;

  const getRiskColor = (level: string) => {
    switch(level) {
      case 'Critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'High': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'Medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'Low': return 'text-green-500 bg-green-500/10 border-green-500/20';
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
    <div className="bg-ocean-900 border border-ocean-700 rounded-xl p-4 flex flex-col shadow-lg overflow-hidden relative">
      <div className={`absolute top-0 left-0 w-1 h-full ${riskClass.split(' ')[0].replace('text-', 'bg-')}`}></div>
      
      <div className="flex items-start justify-between mb-4 pl-2">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <FileText className="w-5 h-5 text-ocean-accent" />
            Evidence Card
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">ID: {evidence.detection_id}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-bold border ${riskClass}`}>
          {evidence.risk_score} - {evidence.risk_level} Risk
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 pl-2">
        <div className="bg-ocean-950 rounded-lg p-3 border border-ocean-800 col-span-2">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <div className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" /> SAR Model</div>
            <div className="font-mono text-[10px]">{evidence.sar_model_name}</div>
          </div>
          <div className="text-sm font-medium">Confidence: {evidence.sar_model_confidence}%</div>
        </div>
        
        <div className="bg-ocean-950 rounded-lg p-3 border border-ocean-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Navigation className="w-3.5 h-3.5" /> AIS Match
          </div>
          <div className="text-sm font-medium capitalize mb-1">
            {evidence.ais_status === 'no_match' ? <span className="text-red-400">No Match (Dark)</span> : evidence.ais_status}
          </div>
          <div className="text-[10px] text-slate-500 font-mono" title={evidence.ais_source_status}>
            {getSourceIcon(evidence.ais_source_status)}
            {evidence.ais_source_status.replace('_', ' ')}
          </div>
        </div>

        <div className="bg-ocean-950 rounded-lg p-3 border border-ocean-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <MapIcon className="w-3.5 h-3.5" /> MPA Overlap
          </div>
          <div className="text-sm font-medium mb-1">
            {evidence.mpa_status === 'inside' ? (
              <span className="text-red-400 font-bold">Inside MPA</span>
            ) : evidence.mpa_status === 'near_buffer' ? (
              <span className="text-orange-400 font-bold">Near Buffer ({evidence.distance_to_mpa_km}km)</span>
            ) : (
              <span className="text-green-400">Outside ({evidence.distance_to_mpa_km}km)</span>
            )}
          </div>
          <div className="text-[10px] text-slate-500 font-mono truncate" title={evidence.mpa_source_status}>
            {getSourceIcon(evidence.mpa_source_status)}
            {evidence.mpa_source_status.replace('_', ' ')}
          </div>
        </div>
      </div>

      <div className="bg-orange-950/20 border border-orange-900/30 rounded-lg p-3 mb-3 pl-3 ml-2">
        <h4 className="text-xs font-semibold text-orange-400 uppercase mb-1">Flag Reason</h4>
        <p className="text-sm text-slate-300">{evidence.why_flagged}</p>
      </div>

      <div className="mt-auto pl-2">
        <div className="flex items-start gap-2 text-xs text-slate-500 bg-ocean-950/50 p-2 rounded border border-ocean-800">
          <ShieldAlert className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-400">{evidence.human_review_required ? "HUMAN REVIEW REQUIRED" : "ROUTINE"}</p>
            <p className="italic mt-0.5 text-orange-400/80">{evidence.legal_safety_note}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
