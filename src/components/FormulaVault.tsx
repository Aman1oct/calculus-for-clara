import React, { useState, useMemo } from 'react';
import { FORMULAS_DATA } from '../data/formulasData';
import type { Formula } from '../types/curriculum';
import { MathView } from './MathView';
import { Search, Pin, Copy, Check, Bookmark, Sparkles, BookOpen } from 'lucide-react';

interface FormulaVaultProps {
  pinnedFormulaIds: Set<string>;
  onTogglePin: (formulaId: string) => void;
}

const CATEGORIES = ['All', 'Limits', 'Derivatives', 'Integrals', 'Series', 'Trigonometry', 'Multivariable'] as const;

export const FormulaVault: React.FC<FormulaVaultProps> = ({ pinnedFormulaIds, onTogglePin }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter formulas
  const filteredFormulas = useMemo(() => {
    return FORMULAS_DATA.filter((formula) => {
      const matchesCategory = selectedCategory === 'All' || formula.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        formula.name.toLowerCase().includes(q) ||
        formula.eli5.toLowerCase().includes(q) ||
        formula.whenToUse.toLowerCase().includes(q) ||
        formula.latex.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const handleCopy = (formula: Formula) => {
    navigator.clipboard.writeText(formula.latex);
    setCopiedId(formula.id);
    setTimeout(() => {
      setCopiedId((cur) => (cur === formula.id ? null : cur));
    }, 2000);
  };

  return (
    <div className="space-y-6 pb-16 animate-fadeIn max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200/80 dark:border-slate-800 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Master Formula Vault
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 dark:text-white">
              Every Essential Calculus Formula
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Search, filter, pin to Clara's study board, or copy textbook-grade LaTeX straight to your clipboard with intuitive "When to use" breakdowns.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Bookmark className="w-4 h-4 text-emerald-500" />
            <span>{pinnedFormulaIds.size} Pinned to Board</span>
          </div>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, rule, or concept (e.g. 'Chain Rule', 'Substitution', 'e^x')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Quick Clear if search active */}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-3 py-2 text-xs rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Formulas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredFormulas.map((formula) => {
          const isPinned = pinnedFormulaIds.has(formula.id);
          const isCopied = copiedId === formula.id;

          return (
            <div
              key={formula.id}
              className="glass-panel rounded-2xl p-6 shadow-md border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between hover:border-amber-500/40 transition-all group"
            >
              <div>
                {/* Header: Name, Category, Action buttons */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      {formula.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                      {formula.name}
                    </h3>
                  </div>

                  {/* Actions: Pin & Copy */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onTogglePin(formula.id)}
                      className={`p-2 rounded-lg border transition-all cursor-pointer ${
                        isPinned
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                      title={isPinned ? 'Unpin from Study Board' : 'Pin to Clara’s Study Board'}
                    >
                      <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      onClick={() => handleCopy(formula)}
                      className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                      title="Copy LaTeX formula"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* KaTeX Formula Display */}
                <div className="my-3 py-3 px-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 overflow-x-auto text-center">
                  <MathView math={formula.latex} block />
                </div>

                {/* ELI5 Plain English sentence */}
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-950 dark:text-amber-200 mb-3">
                  <span className="font-bold">ELI5: </span>
                  {formula.eli5}
                </div>

                {/* When to use */}
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">When to use: </span>
                  {formula.whenToUse}
                </div>
              </div>

              {/* Example calculation */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">Worked Mini-Example:</span>
                <div className="font-mono text-slate-700 dark:text-slate-300 overflow-x-auto">
                  <MathView math={formula.example} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredFormulas.length === 0 && (
        <div className="text-center py-16 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
          <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
            No formulas match "{searchQuery}" in category "{selectedCategory}"
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
