import React, { useState, useEffect, useRef } from 'react';
import { CURRICULUM_DATA } from '../data/curriculumData';
import { FORMULAS_DATA } from '../data/formulasData';
import { MathView } from './MathView';
import { Search, X, BookOpen, Layers, Sparkles, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTopic: (topicId: string) => void;
  onNavigateToVault: () => void;
  onNavigateToSandboxes: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTopic,
  onNavigateToVault,
  onNavigateToSandboxes,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Global keydown for Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Search in curriculum topics
  const matchingTopics = q
    ? CURRICULUM_DATA.flatMap((m) =>
        m.topics.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.subtitle.toLowerCase().includes(q) ||
            t.eli5.toLowerCase().includes(q) ||
            t.conceptDeepDive.toLowerCase().includes(q)
        )
      )
    : [];

  // Search in formulas
  const matchingFormulas = q
    ? FORMULAS_DATA.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.eli5.toLowerCase().includes(q) ||
          f.whenToUse.toLowerCase().includes(q) ||
          f.latex.toLowerCase().includes(q)
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="glass-panel w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80">
          <Search className="w-5 h-5 text-indigo-500" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search topics, formulas, or rules (e.g. 'Chain Rule', 'Riemann', 'L\'Hopital')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="overflow-y-auto p-4 space-y-4 flex-1">
          {!query && (
            <div className="p-6 text-center text-slate-400 text-xs space-y-3">
              <p className="font-semibold text-slate-600 dark:text-slate-300">
                Type anything to instantly search across Clara's calculus library
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    onNavigateToSandboxes();
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold border border-rose-500/20 hover:bg-rose-500/20 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Explore Visual Sandboxes
                </button>
              </div>
              <div className="flex flex-wrap justify-center gap-2 pt-1">
                {['Derivative Explorer', 'Riemann Sums', 'Taylor Series', 'Chain Rule', 'Optimization'].map(
                  (suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setQuery(suggestion)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                    >
                      {suggestion}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* Topics Match */}
          {matchingTopics.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Curriculum Lessons ({matchingTopics.length})
              </div>
              <div className="space-y-1.5">
                {matchingTopics.map((topic) => (
                  <div
                    key={topic.id}
                    onClick={() => {
                      onSelectTopic(topic.id);
                      onClose();
                    }}
                    className="p-3 rounded-xl bg-white/70 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200/60 dark:border-slate-700/60 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {topic.title}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{topic.eli5}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formulas Match */}
          {matchingFormulas.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Formula Vault ({matchingFormulas.length})
              </div>
              <div className="space-y-1.5">
                {matchingFormulas.map((formula) => (
                  <div
                    key={formula.id}
                    onClick={() => {
                      onNavigateToVault();
                      onClose();
                    }}
                    className="p-3 rounded-xl bg-white/70 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-slate-200/60 dark:border-slate-700/60 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {formula.name}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{formula.eli5}</div>
                    </div>
                    <div className="flex-shrink-0 text-xs">
                      <MathView math={formula.latex} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {query && matchingTopics.length === 0 && matchingFormulas.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              No results found for "{query}". Try checking your spelling or searching for broader terms like "limits" or "derivatives".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
