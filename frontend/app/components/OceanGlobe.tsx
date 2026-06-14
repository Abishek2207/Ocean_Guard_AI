'use client';
import React, { useEffect, useRef } from 'react';

export default function OceanGlobe({ size = 480 }: { size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const rotationRef = useRef(0);
  const vessels = useRef<Array<{ lat: number; lon: number; risk: string; phase: number }>>([
    { lat: -0.8, lon: -91.2, risk: 'critical', phase: 0 },
    { lat: -1.2, lon: -90.5, risk: 'high', phase: 1.2 },
    { lat: 2.1, lon: -88.3, risk: 'medium', phase: 2.4 },
    { lat: -3.4, lon: -92.1, risk: 'low', phase: 0.8 },
    { lat: 1.5, lon: -85.6, risk: 'high', phase: 1.8 },
    { lat: -2.1, lon: -94.2, risk: 'medium', phase: 3.1 },
    { lat: 4.2, lon: -87.1, risk: 'low', phase: 2.0 },
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cx = size / 2;
    const cy = size / 2;
    const R = size * 0.38;

    const projectSphere = (lat: number, lon: number, rotation: number) => {
      const phi = (lat * Math.PI) / 180;
      const lambda = ((lon + rotation) * Math.PI) / 180;
      const x = R * Math.cos(phi) * Math.cos(lambda);
      const y = R * Math.sin(phi);
      const z = R * Math.cos(phi) * Math.sin(lambda);
      return { x: cx + x, y: cy - y, z, visible: z > -R * 0.2 };
    };

    const riskColors: Record<string, string> = {
      critical: '#ef4444',
      high: '#f97316',
      medium: '#f59e0b',
      low: '#10b981',
    };

    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);

      // Outer glow
      const outerGlow = ctx.createRadialGradient(cx, cy, R * 0.8, cx, cy, R * 1.4);
      outerGlow.addColorStop(0, 'rgba(0,212,200,0.06)');
      outerGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = outerGlow;
      ctx.fillRect(0, 0, size, size);

      // Ocean sphere
      const oceanGrad = ctx.createRadialGradient(cx - R * 0.2, cy - R * 0.2, 0, cx, cy, R);
      oceanGrad.addColorStop(0, '#003857');
      oceanGrad.addColorStop(0.5, '#001f3f');
      oceanGrad.addColorStop(1, '#000d1f');
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = oceanGrad;
      ctx.fill();

      // Latitude lines
      ctx.save();
      for (let lat = -60; lat <= 60; lat += 30) {
        const phi = (lat * Math.PI) / 180;
        const ry = R * Math.sin(phi);
        const rx = R * Math.cos(phi);
        ctx.beginPath();
        ctx.ellipse(cx, cy - ry, rx, rx * 0.15, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0,212,200,0.08)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Longitude lines
      for (let lon = 0; lon < 180; lon += 30) {
        const lambda = ((lon + rotationRef.current) * Math.PI) / 180;
        const x1 = cx + R * Math.cos(lambda);
        const y1 = cy;
        const x2 = cx - R * Math.cos(lambda);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.bezierCurveTo(
          cx + R * Math.cos(lambda) * 0.3, cy - R,
          cx - R * Math.cos(lambda) * 0.3, cy - R,
          x2, y2 || y1
        );
        ctx.strokeStyle = 'rgba(0,212,200,0.05)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
      ctx.restore();

      // MPA region (Galapagos area highlight)
      const mpaPos = projectSphere(-1, -91, rotationRef.current);
      if (mpaPos.visible) {
        const mpaGrad = ctx.createRadialGradient(mpaPos.x, mpaPos.y, 0, mpaPos.x, mpaPos.y, 30);
        mpaGrad.addColorStop(0, 'rgba(16,185,129,0.15)');
        mpaGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = mpaGrad;
        ctx.beginPath();
        ctx.ellipse(mpaPos.x, mpaPos.y, 30, 20, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(mpaPos.x, mpaPos.y, 30, 20, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(16,185,129,0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Vessel dots
      vessels.current.forEach((v) => {
        const pos = projectSphere(v.lat, v.lon, rotationRef.current);
        if (!pos.visible) return;
        const color = riskColors[v.risk];
        const pulse = Math.sin(t * 2 + v.phase) * 0.5 + 0.5;

        // Pulse ring
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 4 + pulse * 6, 0, Math.PI * 2);
        ctx.strokeStyle = color + '40';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Core dot
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });

      // Globe highlight
      const highlight = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.35, 0, cx - R * 0.35, cy - R * 0.35, R * 0.6);
      highlight.addColorStop(0, 'rgba(255,255,255,0.05)');
      highlight.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = highlight;
      ctx.fill();

      // Globe border
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,212,200,0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      rotationRef.current = (rotationRef.current + 0.06) % 360;
      t += 0.016;
      animRef.current = requestAnimationFrame(draw);
    };

    // fix reference issue
    const y2 = cy;

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="wave-float"
      style={{ filter: 'drop-shadow(0 0 60px rgba(0,212,200,0.15))' }}
    />
  );
}
