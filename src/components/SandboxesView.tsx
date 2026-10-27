import React, { useState } from 'react';
import { DerivativeExplorer } from './sandboxes/DerivativeExplorer';
import { RiemannSumIntegrator } from './sandboxes/RiemannSumIntegrator';
import { TaylorSeriesVisualizer } from './sandboxes/TaylorSeriesVisualizer';
import { OptimizationSandbox } from './sandboxes/OptimizationSandbox';
import { TrendingUp, BarChart3, Layers, Box, Sparkles } from 'lucide-react';

export const SandboxesView: React.FC = () => {
  const [activeSandbox, setActiveSandbox] = useState<'derivative' | 'riemann' | 'taylor' | 'optimization'>('derivative');

  return (
    <div className="space-y-6 pb-16 animate-fadeIn max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200/80 dark:border-slate-800 relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Interactive Visual Laboratory
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 dark:text-white">
          Intuitive Visual Sandboxes for Clara
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          Don't just read formulas—touch the math. Drag sliders to watch secants snap into tangents, rectangles blend into exact areas, and polynomials wrap around transcendental curves.
        </p>

        {/* Sandbox Switcher Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-6">
          <button
            onClick={() => setActiveSandbox('derivative')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
              activeSandbox === 'derivative'
                ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20'
                : 'bg-white/60 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white'
            }`}
          >
            <TrendingUp className="w-4 h-4 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold leading-tight">Derivative Explorer</div>
              <div className={`text-[10px] ${activeSandbox === 'derivative' ? 'text-rose-100' : 'text-slate-400'}`}>
                Tangent & Secant
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveSandbox('riemann')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
              activeSandbox === 'riemann'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                : 'bg-white/60 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white'
            }`}
          >
            <BarChart3 className="w-4 h-4 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold leading-tight">Riemann Integrator</div>
              <div className={`text-[10px] ${activeSandbox === 'riemann' ? 'text-indigo-100' : 'text-slate-400'}`}>
                Rectangles to Area
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveSandbox('taylor')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
              activeSandbox === 'taylor'
                ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-600/20'
                : 'bg-white/60 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white'
            }`}
          >
            <Layers className="w-4 h-4 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold leading-tight">Taylor Approximator</div>
              <div className={`text-[10px] ${activeSandbox === 'taylor' ? 'text-violet-100' : 'text-slate-400'}`}>
                Curve Hugging
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveSandbox('optimization')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
              activeSandbox === 'optimization'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                : 'bg-white/60 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white'
            }`}
          >
            <Box className="w-4 h-4 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold leading-tight">Box Maximizer</div>
              <div className={`text-[10px] ${activeSandbox === 'optimization' ? 'text-emerald-100' : 'text-slate-400'}`}>
                Real-world Extrema
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Render Selected Sandbox */}
      <div>
        {activeSandbox === 'derivative' && <DerivativeExplorer />}
        {activeSandbox === 'riemann' && <RiemannSumIntegrator />}
        {activeSandbox === 'taylor' && <TaylorSeriesVisualizer />}
        {activeSandbox === 'optimization' && <OptimizationSandbox />}
      </div>
    </div>
  );
};
