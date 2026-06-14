'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText, ShieldAlert, Navigation, Map as MapIcon, Cpu,
  Database, AlertCircle, CheckCircle2, Fingerprint
} from 'lucide-react';

interface Props {
  evidence: any;
  detection: any;
}

const fadeIn = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' as const } }
};

const RISK_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; stripe: string }> = {
  Critical: { label: 'CRITICAL', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.3)', stripe: '#ef4444' },
  High: { label: 'HIGH', color: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.25)', stripe: '#f97316' },
  Medium: { label: 'MEDIUM', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', stripe: '#f59e0b' },
  Low: { label: 'LOW', color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', stripe: '#10b981' },
};

export default function EvidenceCard({ evidence, detection }: Props) {
  if (!evidence || !detection) return null;

  const risk = RISK_CONFIG[evidence.risk_level] || RISK_CONFIG.Low;

  const sourceIcon = (status: string) => {
    if (status === 'LIVE_API') return <CheckCircle2 className="w-3 h-3 text-emerald-400" />;
    if (status === 'CACHED_HISTORICAL') return <Database className="w-3 h-3 text-amber-400" />;
    return <AlertCircle className="w-3 h-3 text-red-400" />;
  };

  const confidencePct = Math.round((evidence.sar_model_confidence || 0) * 10) / 10;
  const circumference = 2 * Math.PI * 18;
  const dashOffset = circumference * (1 - confidencePct / 100);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      key={evidence.detection_id}
      className="relative rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: risk.bg,
        border: `1px solid ${risk.border}`,
        boxShadow: `0 0 60px ${risk.color}10, 0 4px 24px rgba(0,0,0,0.4)`,
      }}
    >
      {/* Classification stripe */}
      <div className="h-1.5 w-full" style={{
        background: `repeating-linear-gradient(90deg, ${risk.color}cc 0px, ${risk.color}cc 16px, ${risk.color}40 16px, ${risk.color}40 24px)`,
      }} />

      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b" style={{ borderColor: risk.border }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Fingerprint className="w-3.5 h-3.5 shrink-0" style={{ color: risk.color }} />
              <span className="text-[10px] font-mono tracking-widest text-ocean-muted uppercase">Evidence Record</span>
            </div>
            <p className="text-[11px] font-mono text-ocean-muted truncate opacity-60" title={evidence.detection_id}>
              {evidence.detection_id}
            </p>
          </div>
          <div className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-black tracking-widest"
            style={{ backgroundColor: risk.color + '20', color: risk.color, border: `1px solid ${risk.border}` }}>
            {risk.label}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col gap-4 flex-1">

        {/* Confidence Ring + Model */}
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 shrink-0">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(0,212,200,0.1)" strokeWidth="3" />
              <circle cx="22" cy="22" r="18" fill="none"
                stroke={risk.color} strokeWidth="3"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-black text-white">{confidencePct}%</span>
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-mono text-ocean-muted uppercase tracking-wider mb-0.5 flex items-center gap-1">
              <Cpu className="w-3 h-3" /> SAR Model
            </div>
            <div className="text-sm font-bold text-white truncate">{evidence.sar_model_name}</div>
            <div className="text-[10px] text-ocean-muted">Risk Score: <span style={{ color: risk.color }} className="font-black">{evidence.risk_score}</span></div>
          </div>
        </div>

        {/* AIS + MPA Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* AIS */}
          <div className="rounded-xl p-3 flex flex-col gap-1.5"
            style={{ background: 'rgba(6,22,38,0.6)', border: '1px solid rgba(0,212,200,0.08)' }}>
            <div className="flex items-center gap-1.5 text-[10px] text-ocean-muted font-mono uppercase tracking-wider">
              <Navigation className="w-3 h-3 text-indigo-400" /> AIS Status
            </div>
            <div className={`text-sm font-bold ${evidence.ais_status === 'no_match' ? 'text-red-400' : 'text-emerald-400'}`}>
              {evidence.ais_status === 'no_match' ? 'Dark Vessel' : evidence.ais_status}
            </div>
            <div className="flex items-center gap-1 text-[9px] text-ocean-muted font-mono">
              {sourceIcon(evidence.ais_source_status)}
              <span className="truncate">{evidence.ais_source_status?.replace(/_/g, ' ')}</span>
            </div>
          </div>

          {/* MPA */}
          <div className="rounded-xl p-3 flex flex-col gap-1.5"
            style={{ background: 'rgba(6,22,38,0.6)', border: '1px solid rgba(0,212,200,0.08)' }}>
            <div className="flex items-center gap-1.5 text-[10px] text-ocean-muted font-mono uppercase tracking-wider">
              <MapIcon className="w-3 h-3 text-emerald-400" /> MPA Overlap
            </div>
            <div className={`text-sm font-bold ${
              evidence.mpa_status === 'inside' ? 'text-red-400' :
              evidence.mpa_status === 'near_buffer' ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {evidence.mpa_status === 'inside' ? 'Inside MPA' :
               evidence.mpa_status === 'near_buffer' ? `Buffer ${evidence.distance_to_mpa_km}km` : 'Outside'}
            </div>
            <div className="flex items-center gap-1 text-[9px] text-ocean-muted font-mono">
              {sourceIcon(evidence.mpa_source_status)}
              <span className="truncate">{evidence.mpa_source_status?.replace(/_/g, ' ')}</span>
            </div>
          </div>
        </div>

        {/* Flag Reason */}
        <div className="rounded-xl p-4 flex flex-col gap-2"
          style={{ background: 'rgba(2,13,26,0.7)', border: `1px solid ${risk.border}` }}>
          <div className="text-[10px] font-mono text-ocean-muted uppercase tracking-wider">
            <FileText className="w-3 h-3 inline mr-1" />Intelligence Assessment
          </div>
          <p className="text-xs text-ocean-text leading-relaxed">{evidence.why_flagged}</p>
        </div>

        {/* Review Required */}
        <div className="rounded-xl p-3 flex items-start gap-3 mt-auto"
          style={{
            background: evidence.human_review_required ? 'rgba(239,68,68,0.06)' : 'rgba(16,185,129,0.06)',
            border: `1px solid ${evidence.human_review_required ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
          }}>
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5"
            style={{ color: evidence.human_review_required ? '#ef4444' : '#10b981' }} />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-0.5"
              style={{ color: evidence.human_review_required ? '#ef4444' : '#10b981' }}>
              {evidence.human_review_required ? 'Human Review Required' : 'Routine Monitoring'}
            </p>
            <p className="text-[10px] text-ocean-muted leading-relaxed">{evidence.legal_safety_note}</p>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
