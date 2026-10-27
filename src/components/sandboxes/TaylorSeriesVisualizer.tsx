import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MathView } from '../MathView';
import { Layers } from 'lucide-react';

interface SeriesDef {
  id: string;
  name: string;
  latex: string;
  trueFunc: (x: number) => number;
  // returns evaluated polynomial of degree n at x
  evalSeries: (x: number, n: number) => number;
  getFormulaLatex: (n: number) => string;
  defaultN: number;
  maxN: number;
  domain: [number, number];
  yRange: [number, number];
}

const factorial = (k: number): number => {
  if (k <= 1) return 1;
  let res = 1;
  for (let i = 2; i <= k; i++) res *= i;
  return res;
};

const SERIES_LIST: SeriesDef[] = [
  {
    id: 'sin',
    name: 'Sine Wave: sin(x)',
    latex: '\\sin(x) = \\sum_{k=0}^{\\infty} \\frac{(-1)^k}{(2k+1)!} x^{2k+1}',
    trueFunc: (x) => Math.sin(x),
    evalSeries: (x, n) => {
      let sum = 0;
      for (let k = 0; 2 * k + 1 <= n; k++) {
        const sign = k % 2 === 0 ? 1 : -1;
        const power = 2 * k + 1;
        sum += (sign * Math.pow(x, power)) / factorial(power);
      }
      return sum;
    },
    getFormulaLatex: (n) => {
      if (n === 0) return 'P_0(x) = 0';
      const terms: string[] = [];
      for (let k = 0; 2 * k + 1 <= n; k++) {
        const sign = k % 2 === 0 ? '+' : '-';
        const p = 2 * k + 1;
        const term = p === 1 ? 'x' : `\\frac{x^{${p}}}{${factorial(p)}}`;
        if (k === 0) {
          terms.push(term);
        } else {
          terms.push(`${sign} ${term}`);
        }
      }
      return `P_{${n}}(x) = ` + (terms.join(' ') || '0');
    },
    defaultN: 3,
    maxN: 11,
    domain: [-6.5, 6.5],
    yRange: [-3, 3],
  },
  {
    id: 'cos',
    name: 'Cosine Wave: cos(x)',
    latex: '\\cos(x) = \\sum_{k=0}^{\\infty} \\frac{(-1)^k}{(2k)!} x^{2k}',
    trueFunc: (x) => Math.cos(x),
    evalSeries: (x, n) => {
      let sum = 0;
      for (let k = 0; 2 * k <= n; k++) {
        const sign = k % 2 === 0 ? 1 : -1;
        const power = 2 * k;
        sum += (sign * Math.pow(x, power)) / factorial(power);
      }
      return sum;
    },
    getFormulaLatex: (n) => {
      const terms: string[] = [];
      for (let k = 0; 2 * k <= n; k++) {
        const sign = k % 2 === 0 ? '+' : '-';
        const p = 2 * k;
        const term = p === 0 ? '1' : `\\frac{x^{${p}}}{${factorial(p)}}`;
        if (k === 0) {
          terms.push(term);
        } else {
          terms.push(`${sign} ${term}`);
        }
      }
      return `P_{${n}}(x) = ` + terms.join(' ');
    },
    defaultN: 4,
    maxN: 10,
    domain: [-6.5, 6.5],
    yRange: [-3, 3],
  },
  {
    id: 'exp',
    name: 'Exponential: eˣ',
    latex: 'e^x = \\sum_{k=0}^{\\infty} \\frac{x^k}{k!}',
    trueFunc: (x) => Math.exp(x),
    evalSeries: (x, n) => {
      let sum = 0;
      for (let k = 0; k <= n; k++) {
        sum += Math.pow(x, k) / factorial(k);
      }
      return sum;
    },
    getFormulaLatex: (n) => {
      const terms: string[] = [];
      for (let k = 0; k <= n; k++) {
        let term = '';
        if (k === 0) term = '1';
        else if (k === 1) term = 'x';
        else term = `\\frac{x^{${k}}}{${factorial(k)}}`;
        terms.push(term);
      }
      return `P_{${n}}(x) = ` + terms.join(' + ');
    },
    defaultN: 3,
    maxN: 9,
    domain: [-4, 3],
    yRange: [-1, 10],
  },
];

export const TaylorSeriesVisualizer: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>('sin');
  const [orderN, setOrderN] = useState<number>(3);
  const [testPoint, setTestPoint] = useState<number>(2.0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentSeries = SERIES_LIST.find((s) => s.id === selectedId) || SERIES_LIST[0];

  const polynomialLatex = useMemo(() => {
    return currentSeries.getFormulaLatex(orderN);
  }, [currentSeries, orderN]);

  const trueValAtTest = currentSeries.trueFunc(testPoint);
  const approxValAtTest = currentSeries.evalSeries(testPoint, orderN);
  const testError = Math.abs(approxValAtTest - trueValAtTest);

  const getCanvasCoords = useCallback(
    (x: number, y: number, width: number, height: number) => {
      const [xMin, xMax] = currentSeries.domain;
      const [yMin, yMax] = currentSeries.yRange;
      const padding = 40;

      const px = padding + ((x - xMin) / (xMax - xMin)) * (width - 2 * padding);
      const py = height - padding - ((y - yMin) / (yMax - yMin)) * (height - 2 * padding);
      return { px, py };
    },
    [currentSeries]
  );

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

    const [xMin, xMax] = currentSeries.domain;
    const [yMin, yMax] = currentSeries.yRange;

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

    // 1. Draw True Function Curve f(x) (Slate / Muted Blue)
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.beginPath();
    let started = false;
    const steps = 300;
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin);
      const y = currentSeries.trueFunc(x);
      const { px, py } = getCanvasCoords(x, y, width, height);
      if (!started) {
        ctx.moveTo(px, py);
        started = true;
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();

    // 2. Draw Taylor Polynomial P_n(x) (Glowing Violet/Indigo)
    ctx.strokeStyle = '#7C3AED'; // Violet
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    started = false;
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin);
      const y = currentSeries.evalSeries(x, orderN);
      if (isNaN(y) || y > yMax + 5 || y < yMin - 5) {
        started = false;
        continue;
      }
      const { px, py } = getCanvasCoords(x, y, width, height);
      if (!started) {
        ctx.moveTo(px, py);
        started = true;
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();

    // 3. Mark center of expansion x = 0 (Maclaurin point)
    const ptCenter = getCanvasCoords(0, currentSeries.trueFunc(0), width, height);
    ctx.fillStyle = '#10B981'; // Emerald
    ctx.beginPath();
    ctx.arc(ptCenter.px, ptCenter.py, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 4. Mark Test Point
    const ptTrue = getCanvasCoords(testPoint, trueValAtTest, width, height);
    const ptApprox = getCanvasCoords(testPoint, approxValAtTest, width, height);

    // Connector line between true and approx
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(ptTrue.px, ptTrue.py);
    ctx.lineTo(ptApprox.px, ptApprox.py);
    ctx.stroke();
    ctx.setLineDash([]);

    // True point marker
    ctx.fillStyle = '#0284C7';
    ctx.beginPath();
    ctx.arc(ptTrue.px, ptTrue.py, 5, 0, Math.PI * 2);
    ctx.fill();

    // Approx point marker
    ctx.fillStyle = '#7C3AED';
    ctx.beginPath();
    ctx.arc(ptApprox.px, ptApprox.py, 5, 0, Math.PI * 2);
    ctx.fill();
  }, [currentSeries, orderN, testPoint, trueValAtTest, approxValAtTest, getCanvasCoords]);

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-xl border border-slate-200/60 dark:border-slate-800 transition-all">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Layers className="w-3.5 h-3.5" />
            Interactive Visual Sandbox 3
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            The Taylor & Maclaurin Series Approximator
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Watch how higher-degree polynomials twist and flex to hug any smooth transcendental function closer and closer to infinity!
          </p>
        </div>

        {/* Function selection */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Target:</label>
          <select
            value={selectedId}
            onChange={(e) => {
              setSelectedId(e.target.value);
              const found = SERIES_LIST.find((s) => s.id === e.target.value);
              if (found) setOrderN(found.defaultN);
            }}
            className="text-sm px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-violet-500 outline-none cursor-pointer"
          >
            {SERIES_LIST.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
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
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" />
                True Function
              </span>
              <span className="flex items-center gap-1.5 text-violet-600 dark:text-violet-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-600 inline-block" />
                Degree {orderN} Polynomial P_{orderN}(x)
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Expansion Center (x=0)
              </span>
            </div>
          </div>

          {/* KaTeX formula display */}
          <div className="w-full mt-3 p-3 rounded-lg bg-violet-50/60 dark:bg-violet-950/30 border border-violet-200/60 dark:border-violet-800/40">
            <div className="text-xs font-semibold text-violet-800 dark:text-violet-300 mb-1">
              Current Approximating Polynomial Formula:
            </div>
            <div className="overflow-x-auto text-sm text-center">
              <MathView math={polynomialLatex} block />
            </div>
          </div>
        </div>

        {/* Controls & Inspection (1 Column) */}
        <div className="flex flex-col justify-between gap-4 bg-slate-50/70 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">
              Polynomial Order & Test
            </h4>

            {/* Degree Slider */}
            <div className="mb-5">
              <div className="flex justify-between items-center text-sm font-medium mb-1">
                <span className="text-slate-700 dark:text-slate-300">Polynomial Degree (n):</span>
                <span className="font-mono text-violet-600 dark:text-violet-400 font-bold text-base">
                  n = {orderN}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={currentSeries.maxN}
                step="1"
                value={orderN}
                onChange={(e) => setOrderN(parseInt(e.target.value, 10))}
                className="w-full accent-violet-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>n = 0 (Constant)</span>
                <span>n = {Math.floor(currentSeries.maxN / 2)}</span>
                <span>n = {currentSeries.maxN} (High Precision)</span>
              </div>
            </div>

            {/* Test Point Slider */}
            <div className="mb-4">
              <div className="flex justify-between items-center text-sm font-medium mb-1">
                <span className="text-slate-700 dark:text-slate-300">Probe Point x:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">
                  x = {testPoint.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="-4"
                max="4"
                step="0.1"
                value={testPoint}
                onChange={(e) => setTestPoint(parseFloat(e.target.value))}
                className="w-full accent-slate-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Test Point Comparison Readout */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">True value f({testPoint.toFixed(1)}):</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {trueValAtTest.toFixed(5)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-violet-600 dark:text-violet-400 font-medium">
                  Taylor Approx P_{orderN}({testPoint.toFixed(1)}):
                </span>
                <span className="font-mono font-bold text-violet-600 dark:text-violet-400">
                  {approxValAtTest.toFixed(5)}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-100 dark:border-slate-700/60 font-semibold">
                <span className="text-rose-500">Approximation Error:</span>
                <span className="font-mono text-rose-500">
                  {testError < 0.00001 ? '< 0.00001 (Identical!)' : testError.toFixed(5)}
                </span>
              </div>
            </div>

            {/* Clara's pedagogical intuition */}
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-300">
              ✨ <strong>Clara's Insight:</strong> Computers cannot calculate <MathView math="\sin(x)" /> natively—silicon only knows addition and multiplication! By using Taylor series, computers calculate sines, cosines, and square roots using simple polynomials!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
