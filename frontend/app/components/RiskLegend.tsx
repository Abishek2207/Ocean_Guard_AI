'use client';

import React from 'react';

export default function RiskLegend() {
  const levels = [
    { name: 'Critical', desc: '76-100', color: 'bg-red-500' },
    { name: 'High', desc: '56-75', color: 'bg-orange-500' },
    { name: 'Medium', desc: '31-55', color: 'bg-yellow-500' },
    { name: 'Low', desc: '0-30', color: 'bg-green-500' }
  ];

  return (
    <div className="flex gap-4">
      {levels.map((lvl) => (
        <div key={lvl.name} className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${lvl.color}`}></div>
          <div className="text-xs">
            <span className="font-semibold text-slate-300">{lvl.name}</span>
            <span className="text-slate-500 ml-1">({lvl.desc})</span>
          </div>
        </div>
      ))}
    </div>
  );
}
