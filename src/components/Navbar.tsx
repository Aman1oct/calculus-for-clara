import React from 'react';
import { Sparkles, Sun, Moon, Search, BookmarkCheck, Layers, BookOpen } from 'lucide-react';

interface NavbarProps {
  currentTab: 'curriculum' | 'sandboxes' | 'vault' | 'board';
  setCurrentTab: (tab: 'curriculum' | 'sandboxes' | 'vault' | 'board') => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onOpenSearch: () => void;
  masteredCount: number;
  totalTopics: number;
  pinnedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  isDarkMode,
  toggleDarkMode,
  onOpenSearch,
  masteredCount,
  totalTopics,
  pinnedCount,
}) => {
  const percentage = Math.round((masteredCount / Math.max(1, totalTopics)) * 100);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 dark:border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div
          onClick={() => setCurrentTab('curriculum')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform">
            <span className="text-white font-black font-serif text-xl tracking-tighter">∫dx</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-black text-lg text-slate-900 dark:text-white tracking-tight">
                Calculus for Clara
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Intuitive Edition
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              From First Principles to Intuitive Mastery
            </p>
          </div>
        </div>

        {/* Center Nav Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800">
          <button
            onClick={() => setCurrentTab('curriculum')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'curriculum'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Curriculum
          </button>

          <button
            onClick={() => setCurrentTab('sandboxes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'sandboxes'
                ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Visual Sandboxes
          </button>

          <button
            onClick={() => setCurrentTab('vault')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'vault'
                ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Formula Vault
          </button>

          <button
            onClick={() => setCurrentTab('board')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer relative ${
              currentTab === 'board'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            Study Board
            {pinnedCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center font-bold">
                {pinnedCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2.5">
          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs border border-slate-200/60 dark:border-slate-700/60 transition-colors cursor-pointer"
            title="Search formulas and concepts (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search Vault</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-400">
              ⌘K
            </kbd>
          </button>

          {/* Progress Tracker Pill */}
          <div
            onClick={() => setCurrentTab('board')}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs cursor-pointer hover:border-emerald-500/40 transition-colors"
          >
            <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {masteredCount}/{totalTopics}
            </span>
          </div>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition-colors cursor-pointer"
            title={isDarkMode ? 'Switch to Warm Ivory Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around px-2 py-1.5 border-t border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs">
        <button
          onClick={() => setCurrentTab('curriculum')}
          className={`py-1 px-2 font-medium cursor-pointer ${
            currentTab === 'curriculum' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500'
          }`}
        >
          Curriculum
        </button>
        <button
          onClick={() => setCurrentTab('sandboxes')}
          className={`py-1 px-2 font-medium cursor-pointer ${
            currentTab === 'sandboxes' ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-500'
          }`}
        >
          Sandboxes
        </button>
        <button
          onClick={() => setCurrentTab('vault')}
          className={`py-1 px-2 font-medium cursor-pointer ${
            currentTab === 'vault' ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-500'
          }`}
        >
          Formulas
        </button>
        <button
          onClick={() => setCurrentTab('board')}
          className={`py-1 px-2 font-medium cursor-pointer flex items-center gap-1 ${
            currentTab === 'board' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500'
          }`}
        >
          Study Board {pinnedCount > 0 && `(${pinnedCount})`}
        </button>
      </div>
    </header>
  );
};
