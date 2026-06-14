'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, Satellite, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface Props {
  onInferenceComplete: (data: any) => void;
  onJudgeDemo?: () => void;
}

export default function SARPreview({ onInferenceComplete, onJudgeDemo }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const handleRunInference = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/api/sar/infer`);
      onInferenceComplete(res.data.results || []);
    } catch {
      setError('Failed to connect to backend. Ensure the API is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDemo = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/api/demo/run`);
      onInferenceComplete(res.data.results || []);
      onJudgeDemo?.();
    } catch {
      setError('Failed to load demo scenarios.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-strong rounded-2xl p-5 flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(0,212,200,0.08)', border: '1px solid rgba(0,212,200,0.15)' }}>
          <Satellite className="w-4 h-4 text-teal" />
        </div>
        <div>
          <div className="text-[10px] font-mono text-ocean-muted uppercase tracking-widest">SAR Ingestion</div>
          <div className="text-xs font-bold text-ocean-text">Image Analysis</div>
        </div>
      </div>

      {/* Drop Zone */}
      <motion.div
        onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        animate={{ borderColor: isDragOver ? '#00d4c8' : 'rgba(0,212,200,0.1)' }}
        className="flex-1 rounded-xl flex flex-col items-center justify-center gap-3 p-6 text-center cursor-pointer transition-colors min-h-[100px]"
        style={{ background: 'rgba(2,13,26,0.6)', border: '1px dashed rgba(0,212,200,0.15)' }}
      >
        <UploadCloud className="w-8 h-8 text-ocean-muted opacity-50" />
        <div>
          <p className="text-xs text-ocean-muted">Sentinel-1 / xView3 / SARFish</p>
          <p className="text-[10px] text-ocean-muted opacity-50 mt-0.5">GeoTIFF · HDF5 · PNG</p>
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl text-xs"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-col gap-2">
        <button
          onClick={handleRunInference}
          disabled={loading}
          className="w-full py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all disabled:opacity-40"
          style={{ background: 'rgba(0,212,200,0.1)', color: '#00d4c8', border: '1px solid rgba(0,212,200,0.2)' }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-teal/20 border-t-teal rounded-full animate-spin" />
              Processing…
            </span>
          ) : 'Run Vessel Detector'}
        </button>

        <button
          onClick={handleLoadDemo}
          disabled={loading}
          className="w-full py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all disabled:opacity-40"
          style={{ background: 'rgba(99,102,241,0.08)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          Load Cached Historical Demo
        </button>

        <p className="text-[10px] text-ocean-muted text-center leading-relaxed opacity-70">
          Demo uses cached historical-style data shaped to the real OceanGuard pipeline schema.
        </p>
      </div>
    </div>
  );
}
