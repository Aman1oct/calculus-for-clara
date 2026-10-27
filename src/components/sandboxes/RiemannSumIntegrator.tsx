import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MathView } from '../MathView';
import { BarChart3, RotateCcw, CheckCircle2 } from 'lucide-react';

interface FunctionDef {
  id: string;
  name: string;
  latex: string;
  f: (x: number) => number;
  antiDeriv: (x: number) => number;
  antiDerivLatex: string;
  defaultDomain: [number, number];
  yRange: [number, number];
}

const FUNCTIONS: FunctionDef[] = [
  {
    id: 'parabola',
    name: 'Parabola: f(x) = x²',
    latex: 'f(x) = x^2',
    f: (x) => x * x,
    antiDeriv: (x) => (x * x * x) / 3,
    antiDerivLatex: 'F(x) = \\frac{1}{3}x^3',
    defaultDomain: [0, 3],
    yRange: [-0.5, 10],
  },
  {
    id: 'arch',
    name: 'Inverted Arch: f(x) = 4 - x²',
    latex: 'f(x) = 4 - x^2',
    f: (x) => Math.max(0, 4 - x * x),
    antiDeriv: (x) => 4 * x - (x * x * x) / 3,
    antiDerivLatex: 'F(x) = 4x - \\frac{1}{3}x^3',
    defaultDomain: [0, 2],
    yRange: [-0.5, 5],
  },
  {
    id: 'sine_offset',
    name: 'Rolling Wave: f(x) = sin(x) + 1.5',
    latex: 'f(x) = \\sin(x) + 1.5',
    f: (x) => Math.sin(x) + 1.5,
    antiDeriv: (x) => -Math.cos(x) + 1.5 * x,
    antiDerivLatex: 'F(x) = -\\cos(x) + 1.5x',
    defaultDomain: [0, Math.PI * 1.5],
    yRange: [-0.5, 3.5],
  },
  {
    id: 'sqrt',
    name: 'Square Root: f(x) = √(x + 0.2)',
    latex: 'f(x) = \\sqrt{x + 0.2}',
    f: (x) => Math.sqrt(Math.max(0, x + 0.2)),
    antiDeriv: (x) => (2 / 3) * Math.pow(Math.max(0, x + 0.2), 1.5),
    antiDerivLatex: 'F(x) = \\frac{2}{3}(x+0.2)^{3/2}',
    defaultDomain: [0, 4],
    yRange: [-0.5, 3],
  },
];

type RiemannMethod = 'left' | 'right' | 'midpoint' | 'trapezoid';

export const RiemannSumIntegrator: React.FC = () => {
  const [selectedFuncId, setSelectedFuncId] = useState<string>('parabola');
  const [nRects, setNRects] = useState<number>(8);
  const [method, setMethod] = useState<RiemannMethod>('midpoint');
  const [a, setA] = useState<number>(0);
  const [b, setB] = useState<number>(3);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const currentFunc = FUNCTIONS.find((f) => f.id === selectedFuncId) || FUNCTIONS[0];

  // Exact integral using Fundamental Theorem of Calculus
  const exactArea = useMemo(() => {
    return currentFunc.antiDeriv(b) - currentFunc.antiDeriv(a);
  }, [currentFunc, a, b]);

  // Riemann calculation
  const { approxArea, rectangles } = useMemo(() => {
    const dx = (b - a) / nRects;
    let sum = 0;
    const rectList: { x: number; width: number; height: number; y1?: number; y2?: number }[] = [];

    for (let i = 0; i < nRects; i++) {
      const xLeft = a + i * dx;
      const xRight = xLeft + dx;

      if (method === 'left') {
        const h = currentFunc.f(xLeft);
        sum += h * dx;
        rectList.push({ x: xLeft, width: dx, height: h });
      } else if (method === 'right') {
        const h = currentFunc.f(xRight);
        sum += h * dx;
        rectList.push({ x: xLeft, width: dx, height: h });
      } else if (method === 'midpoint') {
        const xMid = (xLeft + xRight) / 2;
        const h = currentFunc.f(xMid);
        sum += h * dx;
        rectList.push({ x: xLeft, width: dx, height: h });
      } else if (method === 'trapezoid') {
        const yL = currentFunc.f(xLeft);
        const yR = currentFunc.f(xRight);
        const hAvg = (yL + yR) / 2;
        sum += hAvg * dx;
        rectList.push({ x: xLeft, width: dx, height: hAvg, y1: yL, y2: yR });
      }
    }

    return { approxArea: sum, rectangles: rectList };
  }, [currentFunc, a, b, nRects, method]);

  const error = Math.abs(approxArea - exactArea);
  const percentAccuracy = Math.max(0, 100 - (error / Math.max(0.001, Math.abs(exactArea))) * 100);

  // Coordinate mapper
  const getCanvasCoords = useCallback(
    (x: number, y: number, width: number, height: number) => {
      const xMin = Math.min(a, 0) - 0.5;
      const xMax = Math.max(b, 3.5) + 0.5;
      const [yMin, yMax] = currentFunc.yRange;
      const padding = 40;

      const px = padding + ((x - xMin) / (xMax - xMin)) * (width - 2 * padding);
      const py = height - padding - ((y - yMin) / (yMax - yMin)) * (height - 2 * padding);
      return { px, py };
    },
    [a, b, currentFunc]
  );

  // Render canvas
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

    const xMin = Math.min(a, 0) - 0.5;
    const xMax = Math.max(b, 3.5) + 0.5;

    // Grid
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
    ctx.lineWidth = 1;

    for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x++) {
      const { px } = getCanvasCoords(x, 0, width, height);
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, height);
      ctx.stroke();

      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      const { py: zeroY } = getCanvasCoords(0, 0, width, height);
      ctx.fillText(x.toString(), px, Math.min(zeroY + 14, height - 10));
    }

    // Axes
    const origin = getCanvasCoords(0, 0, width, height);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(0, origin.py);
    ctx.lineTo(width, origin.py);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(origin.px, 0);
    ctx.lineTo(origin.px, height);
    ctx.stroke();

    // Draw Riemann Rectangles or Trapezoids
    rectangles.forEach((r) => {
      const ptBottomLeft = getCanvasCoords(r.x, 0, width, height);
      const ptBottomRight = getCanvasCoords(r.x + r.width, 0, width, height);

      if (method === 'trapezoid' && r.y1 !== undefined && r.y2 !== undefined) {
        const ptTopLeft = getCanvasCoords(r.x, r.y1, width, height);
        const ptTopRight = getCanvasCoords(r.x + r.width, r.y2, width, height);

        ctx.fillStyle = 'rgba(99, 102, 241, 0.28)'; // Translucent Indigo
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.8)';
        ctx.lineWidth = nRects > 50 ? 0.5 : 1.2;

        ctx.beginPath();
        ctx.moveTo(ptBottomLeft.px, ptBottomLeft.py);
        ctx.lineTo(ptTopLeft.px, ptTopLeft.py);
        ctx.lineTo(ptTopRight.px, ptTopRight.py);
        ctx.lineTo(ptBottomRight.px, ptBottomRight.py);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        const ptTopLeft = getCanvasCoords(r.x, r.height, width, height);
        const rectW = ptBottomRight.px - ptBottomLeft.px;
        const rectH = ptBottomLeft.py - ptTopLeft.py;

        ctx.fillStyle = 'rgba(99, 102, 241, 0.28)';
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.8)';
        ctx.lineWidth = nRects > 50 ? 0.5 : 1.2;

        ctx.fillRect(ptTopLeft.px, ptTopLeft.py, rectW, rectH);
        ctx.strokeRect(ptTopLeft.px, ptTopLeft.py, rectW, rectH);
      }
    });

    // Draw Exact Function Curve (Gold/Amber)
    ctx.strokeStyle = '#D97706';
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

    // Mark bounds a and b
    const ptA = getCanvasCoords(a, 0, width, height);
    const ptB = getCanvasCoords(b, 0, width, height);

    ctx.fillStyle = '#10B981'; // Emerald
    ctx.beginPath();
    ctx.arc(ptA.px, ptA.py, 5, 0, Math.PI * 2);
    ctx.arc(ptB.px, ptB.py, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`a = ${a.toFixed(1)}`, ptA.px, ptA.py + 16);
    ctx.fillText(`b = ${b.toFixed(1)}`, ptB.px, ptB.py + 16);
  }, [currentFunc, a, b, nRects, method, rectangles, getCanvasCoords]);

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-xl border border-slate-200/60 dark:border-slate-800 transition-all">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <BarChart3 className="w-3.5 h-3.5" />
            Interactive Visual Sandbox 2
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            The Riemann Sum Integrator
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Crank the slider from <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">n = 2</span> to <span className="font-mono font-semibold text-emerald-500">n = 100</span> to watch bulky rectangular stairs blend seamlessly into the exact calculus area under the curve!
          </p>
        </div>

        {/* Function selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Curve:</label>
          <select
            value={selectedFuncId}
            onChange={(e) => {
              setSelectedFuncId(e.target.value);
              const found = FUNCTIONS.find((f) => f.id === e.target.value);
              if (found) {
                setA(found.defaultDomain[0]);
                setB(found.defaultDomain[1]);
              }
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Canvas Area (2 Columns) */}
        <div className="lg:col-span-2 flex flex-col items-center">
          <div className="relative w-full h-[380px] bg-white/70 dark:bg-slate-950/60 rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-inner">
            <canvas ref={canvasRef} className="w-full h-full block" />

            {/* Overlaid stats */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2 text-xs bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                True Curve <MathView math="f(x)" />
              </span>
              <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded bg-indigo-500/40 border border-indigo-600 inline-block" />
                {nRects} {method === 'trapezoid' ? 'Trapezoids' : 'Rectangles'}
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {percentAccuracy.toFixed(2)}% Accurate
              </span>
            </div>
          </div>

          {/* Quick intuition note */}
          <div className="w-full mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-300 flex items-center justify-between">
            <span>
              💡 <strong>Clara's Superpower:</strong> As <MathView math="n \to \infty" />, the width <MathView math="\Delta x = \frac{b - a}{n} \to 0" />, and the discrete sum <MathView math="\sum f(x_i)\Delta x" /> morphs into the continuous integral <MathView math="\int_a^b f(x)\,dx" />!
            </span>
            <button
              onClick={() => {
                setNRects(8);
                setMethod('midpoint');
                const found = FUNCTIONS.find((f) => f.id === selectedFuncId);
                if (found) {
                  setA(found.defaultDomain[0]);
                  setB(found.defaultDomain[1]);
                }
              }}
              className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 ml-2"
              title="Reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Controls & Math Readout (1 Column) */}
        <div className="flex flex-col justify-between gap-4 bg-slate-50/70 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">
              Partition & Method
            </h4>

            {/* Slider: Number of Rectangles n */}
            <div className="mb-4">
              <div className="flex justify-between items-center text-sm font-medium mb-1">
                <span className="text-slate-700 dark:text-slate-300">Number of Rectangles (n):</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold text-base">
                  n = {nRects}
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="100"
                step="1"
                value={nRects}
                onChange={(e) => setNRects(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>n = 2 (Rough)</span>
                <span>n = 50 (Very Close)</span>
                <span>n = 100 (Seamless)</span>
              </div>
            </div>

            {/* Method selection */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                Approximation Method:
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'left', label: 'Left Sum' },
                  { id: 'right', label: 'Right Sum' },
                  { id: 'midpoint', label: 'Midpoint' },
                  { id: 'trapezoid', label: 'Trapezoidal' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id as RiemannMethod)}
                    className={`py-1.5 px-2.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer text-center ${
                      method === m.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Integration bounds sliders */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs text-slate-500 block mb-1">Lower limit (a):</label>
                <input
                  type="number"
                  step="0.5"
                  value={a}
                  onChange={(e) => setA(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1 text-xs rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Upper limit (b):</label>
                <input
                  type="number"
                  step="0.5"
                  value={b}
                  onChange={(e) => setB(parseFloat(e.target.value) || 1)}
                  className="w-full px-2.5 py-1 text-xs rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Real-time Math Output Card */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            {/* Exact vs Approx Area */}
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40">
              <div className="flex justify-between items-center text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                <span>Exact Integral <MathView math="\int_a^b f(x)\,dx" />:</span>
                <span className="font-mono font-bold text-sm text-emerald-700 dark:text-emerald-300">
                  {exactArea.toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-indigo-700 dark:text-indigo-300 font-medium mt-1">
                <span>Riemann Sum ({nRects} pieces):</span>
                <span className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400">
                  {approxArea.toFixed(4)}
                </span>
              </div>
            </div>

            {/* Error & Accuracy Gauge */}
            <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <div className="flex justify-between items-center mb-1 text-slate-700 dark:text-slate-300">
                <span>Absolute Difference:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  {error.toFixed(5)}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden mt-2">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${percentAccuracy}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                <span>Error shrinks as 1/n²</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {percentAccuracy.toFixed(1)}% Match
                </span>
              </div>
            </div>

            {/* Antiderivative Formula */}
            <div className="text-center text-xs text-slate-500">
              Antiderivative used: <MathView math={currentFunc.antiDerivLatex} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
