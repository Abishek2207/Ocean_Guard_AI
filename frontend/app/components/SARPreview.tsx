'use client';

import React, { useState } from 'react';
import { UploadCloud, Image as ImageIcon, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface Props {
  onInferenceComplete: (data: any) => void;
}

export default function SARPreview({ onInferenceComplete }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRunInference = async () => {
    setLoading(true);
    setError(null);
    try {
      // In a real app we'd upload an image. Here we just trigger the endpoint
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await axios.post(`${API_URL}/api/sar/infer`);
      onInferenceComplete(res.data.results);
    } catch (err) {
      console.error(err);
      setError('Failed to run inference. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-ocean-900 border border-ocean-700 rounded-xl p-4 flex flex-col h-full shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-ocean-accent flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          SAR Image Ingestion
        </h2>
      </div>

      <div className="flex-1 border-2 border-dashed border-ocean-700 rounded-lg flex flex-col items-center justify-center p-6 bg-ocean-950/50 mb-4 transition-colors hover:border-ocean-accent/50 group">
        <UploadCloud className="w-12 h-12 text-ocean-700 group-hover:text-ocean-accent transition-colors mb-3" />
        <p className="text-sm text-slate-400 text-center">
          Upload SAR Image Tile<br/>
          (Sentinel-1 / xView3 / SARFish)
        </p>
      </div>

      {error && (
        <div className="bg-red-950/50 border border-red-900/50 text-red-400 p-3 rounded-lg text-sm mb-4 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <button
          onClick={handleRunInference}
          disabled={loading}
          className="w-full bg-ocean-highlight hover:bg-ocean-accent text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            'Run Vessel Detector'
          )}
        </button>

        <button
          onClick={async () => {
            setLoading(true);
            setError(null);
            try {
              const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
              const res = await axios.get(`${API_URL}/api/demo/run`);
              onInferenceComplete(res.data.results);
            } catch (err) {
              console.error(err);
              setError('Failed to load demo scenario.');
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          className="w-full bg-slate-800 hover:bg-slate-700 text-cyan-400 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Load Cached Historical Demo
        </button>
        <p className="text-[10px] text-slate-500 text-center leading-tight mt-1">
          This demo uses cached historical-style data shaped to the real OceanGuard pipeline schema. Live API mode is used when tokens are configured.
        </p>
      </div>
    </div>
  );
}
