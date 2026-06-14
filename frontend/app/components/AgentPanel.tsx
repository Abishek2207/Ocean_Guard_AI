'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Waves, Radio, Navigation, Send, Activity, Anchor, MessageSquare } from 'lucide-react';

interface Props {
  analysis: any;
  allDetections?: any[];
}

const AGENTS = [
  {
    id: 'narrator',
    icon: <Search className="w-4 h-4" />,
    label: 'Analyst',
    role: 'Evidence Narrator',
    color: '#6366f1',
    placeholder: 'Review complete.',
  },
  {
    id: 'chat',
    icon: <Waves className="w-4 h-4" />,
    label: 'Intelligence',
    role: 'Ask OceanGuard',
    color: '#00d4c8',
    placeholder: 'Ask about this detection...',
  },
  {
    id: 'briefing',
    icon: <Radio className="w-4 h-4" />,
    label: 'Ops Officer',
    role: 'Daily Briefing',
    color: '#f59e0b',
    placeholder: 'Briefing ready.',
  },
  {
    id: 'patrol',
    icon: <Navigation className="w-4 h-4" />,
    label: 'Planner',
    role: 'Patrol Priority',
    color: '#ef4444',
    placeholder: 'Targets ranked.',
  },
];

const slideIn = {
  hidden: { opacity: 0, x: 12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
  exit: { opacity: 0, x: -12, transition: { duration: 0.2 } },
};

export default function AgentPanel({ analysis, allDetections = [] }: Props) {
  const [activeTab, setActiveTab] = useState<'narrator' | 'chat' | 'briefing' | 'patrol'>('narrator');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'agent'; text: string }[]>([
    { role: 'agent', text: 'OceanGuard Intelligence online. Ask me about the selected detection — SAR confidence, AIS status, MPA proximity, or risk reasoning.' },
  ]);

  const activeAgent = AGENTS.find(a => a.id === activeTab)!;

  if (!analysis) {
    return (
      <div className="glass-strong rounded-2xl h-full flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
          style={{ background: 'rgba(0,212,200,0.06)', border: '1px solid rgba(0,212,200,0.12)' }}>
          <MessageSquare className="w-7 h-7 text-teal opacity-40" />
        </div>
        <p className="font-bold text-ocean-text text-base mb-1">Agent Operations Center</p>
        <p className="text-sm text-ocean-muted">Load a detection to activate your intelligence crew.</p>
      </div>
    );
  }

  const handleChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newHistory = [...chatHistory, { role: 'user' as const, text: chatInput }];
    setChatHistory(newHistory);
    setChatInput('');
    setTimeout(() => {
      const input = chatInput.toLowerCase();
      let reply = 'I can only reference the evidence card for this detection. ';
      if (input.includes('risk')) reply = analysis.risk_reasoning;
      else if (input.includes('mpa') || input.includes('protected')) reply = analysis.mpa_geospatial;
      else if (input.includes('ais') || input.includes('dark')) reply = analysis.ais_intelligence;
      else if (input.includes('confidence') || input.includes('sar')) reply = analysis.detection_analyst;
      else reply += 'Try asking about: SAR confidence, AIS mismatch, MPA proximity, or risk level.';
      setChatHistory([...newHistory, { role: 'agent', text: reply }]);
    }, 500);
  };

  const highRiskCount = allDetections.filter(d => ['Critical', 'High'].includes(d.evidence_card?.risk_level)).length;

  return (
    <div className="glass-strong rounded-2xl flex flex-col h-full overflow-hidden">

      {/* Agent Tabs */}
      <div className="flex gap-px p-1 m-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)' }}>
        {AGENTS.map(agent => (
          <button
            key={agent.id}
            onClick={() => setActiveTab(agent.id as any)}
            className="flex-1 flex flex-col items-center gap-0.5 py-2.5 px-1 rounded-lg text-center transition-all duration-300 relative"
            style={{
              background: activeTab === agent.id ? agent.color + '15' : 'transparent',
              border: activeTab === agent.id ? `1px solid ${agent.color}30` : '1px solid transparent',
            }}
          >
            <span style={{ color: activeTab === agent.id ? agent.color : '#4a7a96' }}>{agent.icon}</span>
            <span className="text-[9px] font-bold uppercase tracking-wider leading-none"
              style={{ color: activeTab === agent.id ? agent.color : '#4a7a96' }}>
              {agent.label}
            </span>
          </button>
        ))}
      </div>

      {/* Active Agent Header */}
      <div className="px-4 pb-3 flex items-center gap-3 shrink-0">
        <div className="w-1 h-6 rounded-full" style={{ background: activeAgent.color }} />
        <div>
          <div className="text-[9px] font-mono uppercase tracking-widest" style={{ color: activeAgent.color }}>
            {activeAgent.role}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: activeAgent.color }} />
          <span className="text-[9px] font-mono text-ocean-muted">ACTIVE</span>
        </div>
      </div>

      <div className="w-full h-px" style={{ background: `${activeAgent.color}20` }} />

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={slideIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 overflow-y-auto p-4 flex flex-col gap-3"
          >
            {/* NARRATOR */}
            {activeTab === 'narrator' && (
              <>
                {[
                  { title: 'Detection Analyst', text: analysis.detection_analyst, color: '#6366f1' },
                  { title: 'AIS Intelligence', text: analysis.ais_intelligence, color: '#00d4c8' },
                  { title: 'MPA Geospatial', text: analysis.mpa_geospatial, color: '#10b981' },
                  { title: 'Risk Reasoning', text: analysis.risk_reasoning, color: '#f59e0b' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                    className="rounded-xl p-4"
                    style={{ background: 'rgba(6,22,38,0.7)', border: `1px solid ${item.color}15` }}
                  >
                    <div className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: item.color }}>
                      {item.title}
                    </div>
                    <p className="text-xs text-ocean-text leading-relaxed">{item.text}</p>
                  </motion.div>
                ))}
              </>
            )}

            {/* CHAT */}
            {activeTab === 'chat' && (
              <div className="flex flex-col h-full min-h-[200px]">
                <div className="flex-1 space-y-3 mb-3">
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[88%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'text-white rounded-br-sm'
                          : 'text-ocean-text rounded-bl-sm'
                      }`}
                        style={msg.role === 'user'
                          ? { background: '#00d4c8', color: '#000a12' }
                          : { background: 'rgba(6,22,38,0.8)', border: '1px solid rgba(0,212,200,0.1)' }
                        }>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleChat} className="relative mt-auto shrink-0">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Ask about this detection..."
                    className="w-full py-2.5 pl-4 pr-10 text-xs rounded-xl text-ocean-text placeholder-ocean-muted focus:outline-none focus:ring-1"
                    style={{ background: 'rgba(2,13,26,0.9)', border: '1px solid rgba(0,212,200,0.15)' }}
                  />
                  <button type="submit" disabled={!chatInput.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-30 transition-colors"
                    style={{ background: 'rgba(0,212,200,0.15)', color: '#00d4c8' }}>
                    <Send className="w-3 h-3" />
                  </button>
                </form>
              </div>
            )}

            {/* BRIEFING */}
            {activeTab === 'briefing' && (
              <div className="space-y-4">
                <div className="rounded-xl p-5" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Situation Report</span>
                  </div>
                  <p className="text-xs text-ocean-text leading-relaxed">
                    OceanGuard has processed <span className="text-white font-bold">{allDetections.length}</span> SAR detections.{' '}
                    <span className="text-red-400 font-bold">{highRiskCount} high-priority events</span> require immediate analyst review.
                  </p>
                </div>
                <div className="rounded-xl p-4" style={{ background: 'rgba(6,22,38,0.7)', border: '1px solid rgba(0,212,200,0.08)' }}>
                  <div className="text-[10px] font-mono text-ocean-muted uppercase tracking-wider mb-2">Human Reviewer Recommendation</div>
                  <p className="text-xs text-ocean-text leading-relaxed">{analysis.human_reviewer}</p>
                </div>
              </div>
            )}

            {/* PATROL */}
            {activeTab === 'patrol' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <Anchor className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest">Priority Ranking</span>
                </div>
                {allDetections
                  .slice()
                  .sort((a, b) => b.evidence_card.risk_score - a.evidence_card.risk_score)
                  .slice(0, 5)
                  .map((d, i) => (
                    <div key={d.evidence_card.detection_id}
                      className="flex items-center justify-between rounded-xl px-4 py-3"
                      style={{
                        background: i === 0 ? 'rgba(239,68,68,0.08)' : 'rgba(6,22,38,0.6)',
                        border: `1px solid ${i === 0 ? 'rgba(239,68,68,0.25)' : 'rgba(0,212,200,0.06)'}`,
                      }}>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-ocean-muted font-mono">#{i + 1}</span>
                        <span className="text-xs font-mono text-ocean-text truncate max-w-[100px]">
                          {d.evidence_card.detection_id.split('-').pop()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-ocean-muted">{d.evidence_card.risk_level}</span>
                        <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                          d.evidence_card.risk_level === 'Critical' ? 'text-red-400 bg-red-400/10' :
                          d.evidence_card.risk_level === 'High' ? 'text-orange-400 bg-orange-400/10' :
                          'text-ocean-muted bg-ocean-subtle/20'
                        }`}>{d.evidence_card.risk_score}</span>
                      </div>
                    </div>
                  ))}
                {allDetections.length > 5 && (
                  <p className="text-center text-[10px] text-ocean-muted pt-1">+{allDetections.length - 5} more detections</p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
