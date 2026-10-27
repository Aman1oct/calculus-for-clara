import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MathView } from '../MathView';
import { Play, Pause, RotateCcw, TrendingUp } from 'lucide-react';

interface FunctionDef {
  id: string;
  name: string;
  latex: string;
  derivLatex: string;
  f: (x: number) => number;
  df: (x: number) => number;
  defaultX: number;
  domain: [number, number];
  yRange: [number, number];
}

const FUNCTIONS: FunctionDef[] = [
  {
    id: 'parabola',
    name: 'Quadratic: f(x) = x²',
    latex: 'f(x) = x^2',
    derivLatex: "f'(x) = 2x",
    f: (x) => x * x,
    df: (x) => 2 * x,
    defaultX: 1,
    domain: [-3.5, 3.5],
    yRange: [-1, 10],
  },
  {
    id: 'cubic',
    name: 'Cubic Rollercoaster: f(x) = x³ - 3x',
    latex: 'f(x) = x^3 - 3x',
    derivLatex: "f'(x) = 3x^2 - 3",
    f: (x) => x * x * x - 3 * x,
    df: (x) => 3 * x * x - 3,
    defaultX: 0.5,
    domain: [-3, 3],
    yRange: [-6, 6],
  },
  {
    id: 'sine',
    name: 'Wave: f(x) = 2 sin(x)',
    latex: 'f(x) = 2\\sin(x)',
    derivLatex: "f'(x) = 2\\cos(x)",
    f: (x) => 2 * Math.sin(x),
    df: (x) => 2 * Math.cos(x),
    defaultX: 0,
    domain: [-4, 4],
    yRange: [-3.5, 3.5],
  },
  {
    id: 'rational',
    name: 'Bell Curve: f(x) = 4 / (1 + x²)',
    latex: 'f(x) = \\frac{4}{1 + x^2}',
    derivLatex: "f'(x) = \\frac{-8x}{(1 + x^2)^2}",
    f: (x) => 4 / (1 + x * x),
    df: (x) => (-8 * x) / Math.pow(1 + x * x, 2),
    defaultX: 1,
    domain: [-3.5, 3.5],
    yRange: [-1, 5],
  },
];

export const DerivativeExplorer: React.FC = () => {
  const [selectedFuncId, setSelectedFuncId] = useState<string>('parabola');
  const [xVal, setXVal] = useState<number>(1.0);
  const [showSecant, setShowSecant] = useState<boolean>(true);
  const [deltaX, setDeltaX] = useState<number>(1.2);
  const [showDerivGraph, setShowDerivGraph] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const currentFunc = FUNCTIONS.find((f) => f.id === selectedFuncId) || FUNCTIONS[0];

  // Auto-play animation
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let direction = 1;
    const step = () => {
      setXVal((prev) => {
        let next = prev + direction * 0.02;
        if (next > currentFunc.domain[1] - 0.5) {
          direction = -1;
          next = currentFunc.domain[1] - 0.5;
        } else if (next < currentFunc.domain[0] + 0.5) {
          direction = 1;
          next = currentFunc.domain[0] + 0.5;
        }
        return next;
      });
      animFrameRef.current = requestAnimationFrame(step);
    };

    animFrameRef.current = requestAnimationFrame(step);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, currentFunc]);

  // Coordinate transformations
  const getCanvasCoords = useCallback(
    (x: number, y: number, width: number, height: number) => {
      const [xMin, xMax] = currentFunc.domain;
      const [yMin, yMax] = currentFunc.yRange;
      const padding = 40;

      const px = padding + ((x - xMin) / (xMax - xMin)) * (width - 2 * padding);
      const py = height - padding - ((y - yMin) / (yMax - yMin)) * (height - 2 * padding);
      return { px, py };
    },
    [currentFunc]
  );

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = rect.width;
    const height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.clearRect(0, 0, width, height);

    const [xMin, xMax] = currentFunc.domain;
    const [yMin, yMax] = currentFunc.yRange;

    // Grid Lines
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
    ctx.lineWidth = 1;

    for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x++) {
      const { px } = getCanvasCoords(x, 0, width, height);
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, height);
      ctx.stroke();

      // Tick numbers
      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      const { py: zeroY } = getCanvasCoords(0, 0, width, height);
      const clampedY = Math.min(Math.max(zeroY + 14, 15), height - 10);
      ctx.fillText(x.toString(), px, clampedY);
    }

    for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y++) {
      const { py } = getCanvasCoords(0, y, width, height);
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(width, py);
      ctx.stroke();

      if (y !== 0) {
        ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'right';
        const { px: zeroX } = getCanvasCoords(0, 0, width, height);
        const clampedX = Math.min(Math.max(zeroX - 6, 25), width - 10);
        ctx.fillText(y.toString(), clampedX, py + 3);
      }
    }

    // Axes
    const origin = getCanvasCoords(0, 0, width, height);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.lineWidth = 1.5;

    // X-Axis
    ctx.beginPath();
    ctx.moveTo(0, origin.py);
    ctx.lineTo(width, origin.py);
    ctx.stroke();

    // Y-Axis
    ctx.beginPath();
    ctx.moveTo(origin.px, 0);
    ctx.lineTo(origin.px, height);
    ctx.stroke();

    // Draw Derivative Curve (Dashed) if enabled
    if (showDerivGraph) {
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      let started = false;
      const steps = 200;
      for (let i = 0; i <= steps; i++) {
        const x = xMin + (i / steps) * (xMax - xMin);
        const y = currentFunc.df(x);
        const { px, py } = getCanvasCoords(x, y, width, height);
        if (!started) {
          ctx.moveTo(px, py);
          started = true;
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw Main Function f(x)
    ctx.strokeStyle = '#4F46E5'; // Indigo
    ctx.lineWidth = 3;
    ctx.beginPath();
    let started = false;
    const steps = 300;
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin);
      const y = currentFunc.f(x);
      const { px, py } = getCanvasCoords(x, y, width, height);
      if (!started) {
        ctx.moveTo(px, py);
        started = true;
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();

    const y0 = currentFunc.f(xVal);
    const slope = currentFunc.df(xVal);
    const pt0 = getCanvasCoords(xVal, y0, width, height);

    // Draw Secant Line if enabled
    if (showSecant && Math.abs(deltaX) > 0.001) {
      const x1 = xVal + deltaX;
      const y1 = currentFunc.f(x1);
      const pt1 = getCanvasCoords(x1, y1, width, height);
      const secantSlope = (y1 - y0) / deltaX;

      // Draw Secant line across screen
      const secantXMin = xMin;
      const secantXMax = xMax;
      const secantYMin = y0 + secantSlope * (secantXMin - xVal);
      const secantYMax = y0 + secantSlope * (secantXMax - xVal);
      const sPtMin = getCanvasCoords(secantXMin, secantYMin, width, height);
      const sPtMax = getCanvasCoords(secantXMax, secantYMax, width, height);

      ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)'; // Amber/Gold
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(sPtMin.px, sPtMin.py);
      ctx.lineTo(sPtMax.px, sPtMax.py);
      ctx.stroke();
      ctx.setLineDash([]);

      // Secant slope triangle (Rise and Run)
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.fillStyle = 'rgba(245, 158, 11, 0.1)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(pt0.px, pt0.py);
      ctx.lineTo(pt1.px, pt0.py); // Run
      ctx.lineTo(pt1.px, pt1.py); // Rise
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Delta X label
      ctx.fillStyle = '#D97706';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Δx = ${deltaX.toFixed(2)}`, (pt0.px + pt1.px) / 2, pt0.py + (pt1.py > pt0.py ? -8 : 16));

      // Delta Y label
      ctx.textAlign = deltaX >= 0 ? 'left' : 'right';
      ctx.fillText(`Δy = ${(y1 - y0).toFixed(2)}`, pt1.px + (deltaX >= 0 ? 8 : -8), (pt0.py + pt1.py) / 2);

      // Point (x + Δx, f(x + Δx))
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(pt1.px, pt1.py, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Draw Tangent Line (Rose / Crimson)
    const tXMin = xMin;
    const tXMax = xMax;
    const tYMin = y0 + slope * (tXMin - xVal);
    const tYMax = y0 + slope * (tXMax - xVal);
    const tPtMin = getCanvasCoords(tXMin, tYMin, width, height);
    const tPtMax = getCanvasCoords(tXMax, tYMax, width, height);

    ctx.strokeStyle = '#E11D48'; // Rose
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(tPtMin.px, tPtMin.py);
    ctx.lineTo(tPtMax.px, tPtMax.py);
    ctx.stroke();

    // Tangent Point (x0, f(x0))
    ctx.fillStyle = '#E11D48';
    ctx.beginPath();
    ctx.arc(pt0.px, pt0.py, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Glow effect around the point
    ctx.fillStyle = 'rgba(225, 29, 72, 0.25)';
    ctx.beginPath();
    ctx.arc(pt0.px, pt0.py, 14, 0, Math.PI * 2);
    ctx.fill();

    // Current point label
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'left';
  }, [currentFunc, xVal, deltaX, showSecant, showDerivGraph, getCanvasCoords]);

  const yVal = currentFunc.f(xVal);
  const slope = currentFunc.df(xVal);
  const secantSlope =
    showSecant && Math.abs(deltaX) > 0.0001
      ? (currentFunc.f(xVal + deltaX) - yVal) / deltaX
      : slope;

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-xl border border-slate-200/60 dark:border-slate-800 transition-all">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Interactive Visual Sandbox 1
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            The Derivative Explorer & Tangent Transformer
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Slide the point along the curve to see the tangent line tilt in real-time, or shrink <span className="font-mono font-semibold text-amber-500">Δx</span> to watch the secant line snap into the true instantaneous derivative!
          </p>
        </div>

        {/* Function Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Curve:</label>
          <select
            value={selectedFuncId}
            onChange={(e) => {
              setSelectedFuncId(e.target.value);
              const found = FUNCTIONS.find((f) => f.id === e.target.value);
              if (found) setXVal(found.defaultX);
            }}
            className="text-sm px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
          >
            {FUNCTIONS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Canvas Area (2 Columns) */}
        <div className="lg:col-span-2 flex flex-col items-center">
          <div className="relative w-full h-[380px] bg-white/70 dark:bg-slate-950/60 rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-inner">
            <canvas ref={canvasRef} className="w-full h-full block" />

            {/* Quick legend overlaid */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2 text-xs bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
                f(x) Curve
              </span>
              <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
                Tangent Line (m = {slope.toFixed(2)})
              </span>
              {showSecant && (
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  Secant Line
                </span>
              )}
              {showDerivGraph && (
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="w-2.5 h-1 border-t-2 border-dashed border-emerald-500 inline-block" />
                  f'(x) Derivative
                </span>
              )}
            </div>
          </div>

          {/* Canvas Controls */}
          <div className="w-full flex items-center justify-between mt-3 text-xs text-slate-500">
            <span>Clara's Tip: When the curve reaches a peak or valley, the tangent line goes completely flat (<MathView math="m = 0" />)!</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors font-medium cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isPlaying ? 'Pause Sweep' : 'Auto Sweep'}
              </button>
              <button
                onClick={() => {
                  setXVal(currentFunc.defaultX);
                  setDeltaX(1.2);
                  setIsPlaying(false);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                title="Reset Position"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Math & Controls Dashboard (1 Column) */}
        <div className="flex flex-col justify-between gap-4 bg-slate-50/70 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">
              Interactive Controls
            </h4>

            {/* Slider 1: Point x0 */}
            <div className="mb-4">
              <div className="flex justify-between items-center text-sm font-medium mb-1">
                <span className="text-slate-700 dark:text-slate-300">Point Position:</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                  x = {xVal.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={currentFunc.domain[0] + 0.2}
                max={currentFunc.domain[1] - 0.2}
                step="0.05"
                value={xVal}
                onChange={(e) => {
                  setXVal(parseFloat(e.target.value));
                  setIsPlaying(false);
                }}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Secant Toggle & Slider */}
            <div className="p-3 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showSecant}
                    onChange={(e) => setShowSecant(e.target.checked)}
                    className="accent-amber-500 rounded cursor-pointer"
                  />
                  Show Secant Approximation
                </label>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono font-bold">
                  Δx = {deltaX.toFixed(2)}
                </span>
              </div>

              {showSecant && (
                <>
                  <input
                    type="range"
                    min="0.01"
                    max="2.5"
                    step="0.02"
                    value={deltaX}
                    onChange={(e) => setDeltaX(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>Δx → 0 (Instantaneous)</span>
                    <span>Δx = 2.5 (Average)</span>
                  </div>
                </>
              )}
            </div>

            {/* Toggle Derivative Curve */}
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showDerivGraph}
                onChange={(e) => setShowDerivGraph(e.target.checked)}
                className="accent-emerald-500 rounded cursor-pointer"
              />
              Show Derivative Curve <MathView math="f'(x)" />
            </label>
          </div>

          {/* Real-time Math Output Card */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            {/* Live Point & Slope readout */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-800/40">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Current Point</div>
                <div className="font-mono text-sm font-bold text-indigo-700 dark:text-indigo-300">
                  ({xVal.toFixed(2)}, {yVal.toFixed(2)})
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200/50 dark:border-rose-800/40">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Instantaneous Slope</div>
                <div className="font-mono text-sm font-bold text-rose-600 dark:text-rose-400">
                  m = {slope.toFixed(3)}
                </div>
              </div>
            </div>

            {/* Secant vs Tangent comparison */}
            {showSecant && (
              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-xs">
                <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                  <span>Secant Average Slope:</span>
                  <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
                    {secantSlope.toFixed(3)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-500 mt-1">
                  <span>True Tangent Slope:</span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                    {slope.toFixed(3)}
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                  {Math.abs(deltaX) < 0.1
                    ? '🎯 Bingo! As Δx approaches zero, the average speed becomes the exact instantaneous speed!'
                    : `Difference: ${Math.abs(secantSlope - slope).toFixed(3)} (drag Δx left to shrink)`}
                </div>
              </div>
            )}

            {/* Tangent Line Equation */}
            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-slate-500 block mb-1">Tangent Line Formula at x = {xVal.toFixed(2)}:</span>
              <div className="text-center font-mono text-slate-800 dark:text-slate-200 font-semibold">
                y = {slope.toFixed(2)}x {yVal - slope * xVal >= 0 ? '+' : '-'} {Math.abs(yVal - slope * xVal).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
