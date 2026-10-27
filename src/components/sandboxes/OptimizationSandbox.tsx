import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MathView } from '../MathView';
import { Box, Sparkles } from 'lucide-react';

export const OptimizationSandbox: React.FC = () => {
  const [sheetW, setSheetW] = useState<number>(10);
  const [sheetL, setSheetL] = useState<number>(16);
  const [cutX, setCutX] = useState<number>(1.5);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Maximum allowed cut
  const maxCut = Math.min(sheetW, sheetL) / 2;

  // Calculus derivation of optimal cut:
  // V(x) = x * (sheetW - 2x) * (sheetL - 2x)
  // V(x) = 4x^3 - 2(W + L)x^2 + W*L*x
  // V'(x) = 12x^2 - 4(W + L)x + W*L = 0
  const optimalCut = useMemo(() => {
    const a = 12;
    const b = -4 * (sheetW + sheetL);
    const c = sheetW * sheetL;
    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) return 1;
    // We want the smaller root (the larger root is beyond W/2)
    const root1 = (-b - Math.sqrt(discriminant)) / (2 * a);
    return Math.min(root1, maxCut * 0.95);
  }, [sheetW, sheetL, maxCut]);

  const currentVolume = useMemo(() => {
    if (cutX <= 0 || cutX >= maxCut) return 0;
    return cutX * (sheetW - 2 * cutX) * (sheetL - 2 * cutX);
  }, [cutX, sheetW, sheetL, maxCut]);

  const optimalVolume = useMemo(() => {
    return optimalCut * (sheetW - 2 * optimalCut) * (sheetL - 2 * optimalCut);
  }, [optimalCut, sheetW, sheetL]);

  // Derivative dV/dx at current cut
  const currentDeriv = useMemo(() => {
    return 12 * cutX * cutX - 4 * (sheetW + sheetL) * cutX + sheetW * sheetL;
  }, [cutX, sheetW, sheetL]);

  // Draw 2D cut diagram & Volume curve on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = rect.width;
    const height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    // Left half: 2D Sheet diagram
    // Right half: Volume curve graph
    const halfW = width / 2;

    // --- LEFT HALF: 2D SHEET CUTOUT ---
    const sheetPadding = 30;
    const maxDrawDim = Math.min(halfW - 2 * sheetPadding, height - 2 * sheetPadding);
    const scale = maxDrawDim / Math.max(sheetW, sheetL);

    const drawW = sheetW * scale;
    const drawL = sheetL * scale;
    const sheetX0 = (halfW - drawL) / 2;
    const sheetY0 = (height - drawW) / 2;

    // Draw main sheet
    ctx.fillStyle = 'rgba(245, 158, 11, 0.15)'; // Warm amber
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 2;
    ctx.fillRect(sheetX0, sheetY0, drawL, drawW);
    ctx.strokeRect(sheetX0, sheetY0, drawL, drawW);

    // Draw corner cutouts in red/dashed
    const cutDraw = cutX * scale;
    ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);

    const corners = [
      [sheetX0, sheetY0],
      [sheetX0 + drawL - cutDraw, sheetY0],
      [sheetX0, sheetY0 + drawW - cutDraw],
      [sheetX0 + drawL - cutDraw, sheetY0 + drawW - cutDraw],
    ];

    corners.forEach(([cx, cy]) => {
      ctx.fillRect(cx, cy, cutDraw, cutDraw);
      ctx.strokeRect(cx, cy, cutDraw, cutDraw);
    });

    ctx.setLineDash([]);

    // Fold lines (dashed green)
    ctx.strokeStyle = '#10B981';
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(sheetX0 + cutDraw, sheetY0 + cutDraw, drawL - 2 * cutDraw, drawW - 2 * cutDraw);
    ctx.setLineDash([]);

    // Labels for 2D diagram
    ctx.fillStyle = '#64748B';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Sheet: ${sheetL} × ${sheetW}`, halfW / 2, sheetY0 - 10);
    ctx.fillText(`Cut corners: x = ${cutX.toFixed(2)}`, halfW / 2, sheetY0 + drawW + 18);

    // --- RIGHT HALF: VOLUME CURVE GRAPH ---
    const graphPadX = 35;
    const graphPadY = 40;
    const graphX0 = halfW + graphPadX;
    const graphY0 = height - graphPadY;
    const graphW = halfW - 2 * graphPadX;
    const graphH = height - 2 * graphPadY;

    // Axes
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(graphX0, graphY0);
    ctx.lineTo(graphX0 + graphW, graphY0);
    ctx.moveTo(graphX0, graphY0);
    ctx.lineTo(graphX0, graphY0 - graphH);
    ctx.stroke();

    // Volume Curve V(x)
    const maxY = optimalVolume * 1.25;
    ctx.strokeStyle = '#6366F1'; // Indigo
    ctx.lineWidth = 3;
    ctx.beginPath();

    const steps = 150;
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * maxCut;
      const v = x * (sheetW - 2 * x) * (sheetL - 2 * x);
      const px = graphX0 + (x / maxCut) * graphW;
      const py = graphY0 - (Math.max(0, v) / maxY) * graphH;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Mark Optimal Point
    const optPx = graphX0 + (optimalCut / maxCut) * graphW;
    const optPy = graphY0 - (optimalVolume / maxY) * graphH;

    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(optPx, optPy, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Peak (dV/dx = 0)`, optPx, optPy - 10);

    // Current Cut Point
    const curPx = graphX0 + (cutX / maxCut) * graphW;
    const curPy = graphY0 - (currentVolume / maxY) * graphH;

    ctx.fillStyle = '#E11D48'; // Rose
    ctx.beginPath();
    ctx.arc(curPx, curPy, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#64748B';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Volume V(x)', graphX0 + 60, graphY0 - graphH + 12);
    ctx.textAlign = 'center';
    ctx.fillText(`Cut Size x (0 to ${(maxCut).toFixed(1)})`, graphX0 + graphW / 2, graphY0 + 24);
  }, [sheetW, sheetL, cutX, maxCut, optimalCut, optimalVolume, currentVolume]);

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-xl border border-slate-200/60 dark:border-slate-800 transition-all">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Box className="w-3.5 h-3.5" />
            Interactive Visual Sandbox 4
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Clara's Real-World Box Optimization Problem
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Cut squares of size <span className="font-mono font-semibold text-rose-500">x</span> from four corners of cardboard and fold into a box. Where does volume hit the absolute maximum?
          </p>
        </div>

        <button
          onClick={() => setCutX(optimalCut)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Snap to Calculus Peak (x = {optimalCut.toFixed(2)})
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Canvas Area (2 Columns) */}
        <div className="lg:col-span-2 flex flex-col items-center">
          <div className="relative w-full h-[360px] bg-white/70 dark:bg-slate-950/60 rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-inner">
            <canvas ref={canvasRef} className="w-full h-full block" />

            <div className="absolute top-3 left-3 text-xs bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-sm flex gap-3">
              <span className="text-amber-600 dark:text-amber-400 font-medium">Left: Flat Cardboard Cutout</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-medium">Right: Calculus Volume Curve V(x)</span>
            </div>
          </div>

          {/* Math formulation display */}
          <div className="w-full mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
              <span>
                <strong>Volume Equation:</strong> <MathView math="V(x) = x(W - 2x)(L - 2x)" />
              </span>
              <span>
                <strong>Derivative:</strong> <MathView math="\frac{dV}{dx} = 12x^2 - 4(W+L)x + WL" />
              </span>
            </div>
          </div>
        </div>

        {/* Controls & Real-Time Stats (1 Column) */}
        <div className="flex flex-col justify-between gap-4 bg-slate-50/70 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">
              Dimensions & Cut Size
            </h4>

            {/* Slider: Cut x */}
            <div className="mb-4">
              <div className="flex justify-between items-center text-sm font-medium mb-1">
                <span className="text-slate-700 dark:text-slate-300">Corner Cut Size (x):</span>
                <span className="font-mono text-rose-600 dark:text-rose-400 font-bold text-base">
                  x = {cutX.toFixed(2)} cm
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max={(maxCut - 0.05).toFixed(2)}
                step="0.05"
                value={cutX}
                onChange={(e) => setCutX(parseFloat(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>

            {/* Sheet Dimensions */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs text-slate-500 block mb-1">Sheet Width (W):</label>
                <input
                  type="number"
                  min="4"
                  max="30"
                  value={sheetW}
                  onChange={(e) => {
                    const w = Math.max(4, parseFloat(e.target.value) || 10);
                    setSheetW(w);
                    if (cutX >= w / 2) setCutX(w / 4);
                  }}
                  className="w-full px-2.5 py-1 text-xs rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Sheet Length (L):</label>
                <input
                  type="number"
                  min="4"
                  max="30"
                  value={sheetL}
                  onChange={(e) => {
                    const l = Math.max(4, parseFloat(e.target.value) || 16);
                    setSheetL(l);
                  }}
                  className="w-full px-2.5 py-1 text-xs rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Real-time Math Output Card */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            {/* Box resulting dimensions */}
            <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-slate-500 font-medium block mb-1">Resulting Box 3D Dimensions:</span>
              <div className="grid grid-cols-3 gap-1 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                <div className="bg-slate-100 dark:bg-slate-700/50 p-1.5 rounded">
                  H: {cutX.toFixed(2)}
                </div>
                <div className="bg-slate-100 dark:bg-slate-700/50 p-1.5 rounded">
                  W: {(sheetW - 2 * cutX).toFixed(2)}
                </div>
                <div className="bg-slate-100 dark:bg-slate-700/50 p-1.5 rounded">
                  L: {(sheetL - 2 * cutX).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Current Volume vs Optimal Volume */}
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 text-xs">
              <div className="flex justify-between items-center text-emerald-800 dark:text-emerald-300 mb-1">
                <span>Current Volume:</span>
                <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                  {currentVolume.toFixed(2)} cm³
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-500 mb-2">
                <span>Maximum Possible Volume:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {optimalVolume.toFixed(2)} cm³
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-emerald-200/50 dark:border-emerald-800/30 font-semibold">
                <span>Slope <MathView math="\frac{dV}{dx}" />:</span>
                <span className={`font-mono ${Math.abs(currentDeriv) < 2 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                  {currentDeriv.toFixed(2)} {Math.abs(currentDeriv) < 2 ? '(Peak Reached! 🎉)' : ''}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              💡 By setting <MathView math="V'(x) = 0" />, Clara found the exact cut of <strong>{optimalCut.toFixed(2)} cm</strong> that guarantees the greatest volume possible without any guessing!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
