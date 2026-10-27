import React, { useState } from 'react';
import type { Module } from '../types/curriculum';
import { CheckCircle, Circle, ChevronDown, ChevronRight, Compass, Maximize2, TrendingUp, BarChart3, Layers } from 'lucide-react';

interface SidebarProps {
  modules: Module[];
  selectedTopicId: string;
  onSelectTopic: (topicId: string) => void;
  masteredTopics: Set<string>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const MODULE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  Compass: Compass,
  Maximize2: Maximize2,
  TrendingUp: TrendingUp,
  BarChart3: BarChart3,
  Layers: Layers,
};

export const Sidebar: React.FC<SidebarProps> = ({
  modules,
  selectedTopicId,
  onSelectTopic,
  masteredTopics,
  searchQuery,
  setSearchQuery,
}) => {
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({});

  const toggleModule = (modId: string) => {
    setCollapsedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  return (
    <aside className="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] overflow-y-auto pr-1">
      <div className="glass-panel rounded-2xl p-4 shadow-lg border border-slate-200/70 dark:border-slate-800">
        {/* Sidebar Header & Filter */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Curriculum Roadmap
            </span>
            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full">
              5 Modules
            </span>
          </div>

          <input
            type="text"
            placeholder="Filter topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Modules Accordion */}
        <div className="space-y-3">
          {modules.map((mod) => {
            const Icon = MODULE_ICONS[mod.iconName] || Compass;
            const isCollapsed = collapsedModules[mod.id] && !searchQuery;
            const matchingTopics = mod.topics.filter(
              (t) =>
                t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.eli5.toLowerCase().includes(searchQuery.toLowerCase())
            );

            if (searchQuery && matchingTopics.length === 0) return null;

            const modMasteredCount = mod.topics.filter((t) => masteredTopics.has(t.id)).length;
            const modTotal = mod.topics.length;
            const modPercentage = Math.round((modMasteredCount / modTotal) * 100);

            return (
              <div
                key={mod.id}
                className="rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 overflow-hidden transition-all"
              >
                {/* Module Bar */}
                <button
                  onClick={() => toggleModule(mod.id)}
                  className="w-full px-3 py-2.5 flex items-center justify-between text-left hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-500 to-rose-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {mod.title}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                        <span>
                          {modMasteredCount}/{modTotal} Mastered
                        </span>
                        {modPercentage === 100 && (
                          <span className="text-emerald-500 font-semibold">✓ Done</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-slate-400 ml-2">
                    {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </div>
                </button>

                {/* Topics in Module */}
                {!isCollapsed && (
                  <div className="p-1 space-y-0.5 border-t border-slate-100 dark:border-slate-800/60">
                    {(searchQuery ? matchingTopics : mod.topics).map((topic) => {
                      const isSelected = topic.id === selectedTopicId;
                      const isMastered = masteredTopics.has(topic.id);

                      return (
                        <button
                          key={topic.id}
                          onClick={() => onSelectTopic(topic.id)}
                          className={`w-full px-3 py-2 rounded-lg text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          <span className="mt-0.5 flex-shrink-0">
                            {isMastered ? (
                              <CheckCircle className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-emerald-500'}`} />
                            ) : (
                              <Circle className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-200' : 'text-slate-300 dark:text-slate-600'}`} />
                            )}
                          </span>

                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-medium leading-snug line-clamp-1">
                              {topic.title}
                            </div>
                            <div className={`text-[10px] line-clamp-1 mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                              {topic.subtitle}
                            </div>
                          </div>

                          {topic.interactiveWidgetType && topic.interactiveWidgetType !== 'none' && (
                            <span
                              className={`text-[9px] px-1 py-0.5 rounded font-mono font-bold flex-shrink-0 ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                              }`}
                              title="Includes Interactive Sandbox"
                            >
                              Sandbox
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
