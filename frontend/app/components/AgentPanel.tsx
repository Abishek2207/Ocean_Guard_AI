'use client';

import React from 'react';
import { Bot, Radar, Radio, MapPin, Scale, UserCheck } from 'lucide-react';

interface Props {
  analysis: any;
}

export default function AgentPanel({ analysis }: Props) {
  if (!analysis) return null;

  const agents = [
    {
      id: 'detection',
      name: 'Detection Analyst',
      icon: <Radar className="w-4 h-4" />,
      text: analysis.detection_analyst,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10'
    },
    {
      id: 'ais',
      name: 'AIS Intelligence',
      icon: <Radio className="w-4 h-4" />,
      text: analysis.ais_intelligence,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10'
    },
    {
      id: 'mpa',
      name: 'MPA Geospatial',
      icon: <MapPin className="w-4 h-4" />,
      text: analysis.mpa_geospatial,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10'
    },
    {
      id: 'risk',
      name: 'Risk Reasoning',
      icon: <Scale className="w-4 h-4" />,
      text: analysis.risk_reasoning,
      color: 'text-orange-400',
      bg: 'bg-orange-400/10'
    },
    {
      id: 'human',
      name: 'Human Reviewer',
      icon: <UserCheck className="w-4 h-4" />,
      text: analysis.human_reviewer,
      color: 'text-slate-300',
      bg: 'bg-slate-700'
    }
  ];

  return (
    <div className="bg-ocean-900 border border-ocean-700 rounded-xl flex flex-col h-full shadow-lg overflow-hidden">
      <div className="p-4 border-b border-ocean-800 bg-ocean-950/50 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-ocean-accent flex items-center gap-2">
          <Bot className="w-5 h-5" />
          Multi-Agent Analysis
        </h2>
        <div className="text-xs font-mono text-ocean-accent/60 bg-ocean-accent/10 px-2 py-1 rounded">
          SOURCE-BACKED
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {agents.map((agent) => (
          <div key={agent.id} className="flex gap-3">
            <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${agent.bg} ${agent.color}`}>
              {agent.icon}
            </div>
            <div className="bg-ocean-950/50 border border-ocean-800 rounded-lg p-3 flex-1 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
              <h3 className={`text-xs font-bold uppercase mb-1 ${agent.color}`}>
                {agent.name}
              </h3>
              {agent.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
