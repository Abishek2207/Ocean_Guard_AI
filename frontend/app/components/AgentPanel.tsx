'use client';

import React, { useState } from 'react';
import { Bot, Radar, MessageSquare, FileText, Crosshair, Send, Anchor, Activity } from 'lucide-react';

interface Props {
  analysis: any;
  allDetections?: any[];
}

export default function AgentPanel({ analysis, allDetections = [] }: Props) {
  const [activeTab, setActiveTab] = useState<'narrator' | 'chat' | 'briefing' | 'patrol'>('narrator');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'agent', text: string}[]>([
    { role: 'agent', text: 'Hello, OceanGuard Assistant here. I can answer questions about the currently selected detection based on the evidence card. How can I help?' }
  ]);

  if (!analysis) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-xl h-full flex flex-col items-center justify-center p-8 text-center text-slate-500 shadow-2xl relative overflow-hidden">
        <Bot className="w-12 h-12 mb-4 opacity-30 text-cyan-500" />
        <p className="font-semibold text-lg text-slate-400">Agent Operations Center</p>
        <p className="text-sm">Awaiting detection data to activate AI analysis modules.</p>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 via-transparent to-transparent pointer-events-none"></div>
      </div>
    );
  }

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newHistory = [...chatHistory, { role: 'user' as const, text: chatInput }];
    setChatHistory(newHistory);
    setChatInput('');

    // Historical demo response based on selected analysis
    setTimeout(() => {
      let reply = "I only have context on the current detection. ";
      const input = chatInput.toLowerCase();
      
      if (input.includes('risk')) reply = `The risk reasoning is: ${analysis.risk_reasoning}`;
      else if (input.includes('mpa') || input.includes('protected')) reply = `Regarding MPA overlap: ${analysis.mpa_geospatial}`;
      else if (input.includes('ais') || input.includes('dark')) reply = `AIS Intelligence reports: ${analysis.ais_intelligence}`;
      else if (input.includes('confidence') || input.includes('sar')) reply = `The detection analyst states: ${analysis.detection_analyst}`;
      else reply += "Please ask about SAR confidence, AIS mismatch, MPA proximity, or Risk level.";

      setChatHistory([...newHistory, { role: 'agent', text: reply }]);
    }, 600);
  };

  const highRiskCount = allDetections.filter(d => ['Critical', 'High'].includes(d.evidence_card.risk_level)).length;
  
  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-cyan-500/20 rounded-xl flex flex-col h-full shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/80 flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
            <Bot className="w-4 h-4 text-cyan-400" />
            Operations Center
          </h2>
          <div className="text-[10px] font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20">
            SOURCE-BACKED
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
          {[
            { id: 'narrator', icon: <Radar className="w-3.5 h-3.5" />, label: 'Narrator' },
            { id: 'chat', icon: <MessageSquare className="w-3.5 h-3.5" />, label: 'Ask AI' },
            { id: 'briefing', icon: <FileText className="w-3.5 h-3.5" />, label: 'Briefing' },
            { id: 'patrol', icon: <Crosshair className="w-3.5 h-3.5" />, label: 'Patrol' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeTab === tab.id 
                  ? 'bg-cyan-500/20 text-cyan-300 shadow-[inset_0_0_10px_rgba(34,211,238,0.2)]' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gradient-to-b from-slate-900 to-slate-950">
        
        {activeTab === 'narrator' && (
          <div className="space-y-4">
            {[
              { title: 'Detection Analyst', text: analysis.detection_analyst, color: 'text-blue-400' },
              { title: 'AIS Intelligence', text: analysis.ais_intelligence, color: 'text-purple-400' },
              { title: 'MPA Geospatial', text: analysis.mpa_geospatial, color: 'text-emerald-400' },
              { title: 'Risk Reasoning', text: analysis.risk_reasoning, color: 'text-orange-400' }
            ].map((item, i) => (
              <div key={i} className="bg-slate-950/50 border border-slate-800/50 rounded-lg p-3 text-sm text-slate-300 leading-relaxed shadow-inner">
                <h3 className={`text-[10px] font-bold uppercase mb-1 ${item.color} tracking-wider`}>{item.title}</h3>
                <p className="text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-2 custom-scrollbar">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-cyan-600 text-white rounded-br-sm' 
                      : 'bg-slate-800 text-slate-200 rounded-bl-sm border border-slate-700'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleChatSubmit} className="relative mt-auto">
              <input 
                type="text" 
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Ask about this detection..."
                className="w-full bg-slate-950 border border-slate-700 rounded-full py-2.5 pl-4 pr-10 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
              <button type="submit" disabled={!chatInput.trim()} className="absolute right-2 top-1/2 transform -translate-y-1/2 w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center disabled:opacity-50 hover:bg-cyan-500/40 transition-colors">
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {activeTab === 'briefing' && (
          <div className="space-y-4">
            <div className="bg-slate-800/50 border border-cyan-500/30 p-4 rounded-xl">
              <h3 className="text-cyan-400 font-bold flex items-center gap-2 mb-2"><Activity className="w-4 h-4"/> Situation Report</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                OceanGuard AI has processed {allDetections.length} total SAR detections in the current mission. 
                There are currently <strong className="text-white">{highRiskCount} high or critical risk events</strong> that require immediate analyst review.
              </p>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Current Focus</h4>
              <p className="text-sm text-slate-400">
                {analysis.human_reviewer}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'patrol' && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-300 mb-2 px-1 flex items-center gap-2"><Anchor className="w-4 h-4 text-orange-400"/> Priority Ranking</h3>
            {allDetections
              .slice()
              .sort((a, b) => b.evidence_card.risk_score - a.evidence_card.risk_score)
              .slice(0, 5)
              .map((d, i) => (
                <div key={d.evidence_card.detection_id} className={`p-3 rounded-lg border ${
                  i === 0 ? 'bg-orange-500/10 border-orange-500/30' : 'bg-slate-950 border-slate-800'
                } flex items-center justify-between`}>
                  <div>
                    <div className="text-xs font-mono text-slate-400">#{i+1} Priority</div>
                    <div className="text-sm font-bold text-slate-200">ID: {d.evidence_card.detection_id.split('-').pop()}</div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-bold ${
                    d.evidence_card.risk_level === 'Critical' ? 'bg-red-500/20 text-red-400' :
                    d.evidence_card.risk_level === 'High' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {d.evidence_card.risk_score}
                  </div>
                </div>
              ))}
              {allDetections.length > 5 && (
                <div className="text-center text-xs text-slate-500 pt-2">+ {allDetections.length - 5} more detections</div>
              )}
          </div>
        )}

      </div>
    </div>
  );
}
