import { useState, useEffect, useMemo } from 'react';
import { CURRICULUM_DATA } from './data/curriculumData';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { TopicDetail } from './components/TopicDetail';
import { FormulaVault } from './components/FormulaVault';
import { StudyBoard } from './components/StudyBoard';
import { SandboxesView } from './components/SandboxesView';
import { SearchModal } from './components/SearchModal';

export function App() {
  // Navigation tabs
  const [currentTab, setCurrentTab] = useState<'curriculum' | 'sandboxes' | 'vault' | 'board'>('curriculum');
  const [selectedTopicId, setSelectedTopicId] = useState<string>(CURRICULUM_DATA[0].topics[0].id);
  const [sidebarSearch, setSidebarSearch] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Theme state: dark vs warm ivory light mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('clara_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('clara_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('clara_theme', 'light');
    }
  }, [isDarkMode]);

  // Mastered topics state (persisted)
  const [masteredTopics, setMasteredTopics] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('clara_mastered_topics');
      return saved ? new Set(JSON.parse(saved)) : new Set(['topic-1-1']);
    } catch {
      return new Set(['topic-1-1']);
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('clara_mastered_topics', JSON.stringify(Array.from(masteredTopics)));
    } catch (e) {
      console.error(e);
    }
  }, [masteredTopics]);

  const toggleMastered = (topicId: string) => {
    setMasteredTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }
      return next;
    });
  };

  // Pinned formulas state (persisted)
  const [pinnedFormulas, setPinnedFormulas] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('clara_pinned_formulas');
      return saved ? new Set(JSON.parse(saved)) : new Set(['lim-def', 'deriv-chain', 'ftc-2']);
    } catch {
      return new Set(['lim-def', 'deriv-chain', 'ftc-2']);
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('clara_pinned_formulas', JSON.stringify(Array.from(pinnedFormulas)));
    } catch (e) {
      console.error(e);
    }
  }, [pinnedFormulas]);

  const togglePin = (formulaId: string) => {
    setPinnedFormulas((prev) => {
      const next = new Set(prev);
      if (next.has(formulaId)) {
        next.delete(formulaId);
      } else {
        next.add(formulaId);
      }
      return next;
    });
  };

  // Flat list of all topics for pagination
  const allTopicsWithModule = useMemo(() => {
    return CURRICULUM_DATA.flatMap((mod) =>
      mod.topics.map((t) => ({ topic: t, module: mod }))
    );
  }, []);

  const currentTopicIndex = allTopicsWithModule.findIndex((item) => item.topic.id === selectedTopicId);
  const currentItem = allTopicsWithModule[currentTopicIndex >= 0 ? currentTopicIndex : 0];

  const handleNextTopic = () => {
    if (currentTopicIndex < allTopicsWithModule.length - 1) {
      const nextTopicId = allTopicsWithModule[currentTopicIndex + 1].topic.id;
      setSelectedTopicId(nextTopicId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevTopic = () => {
    if (currentTopicIndex > 0) {
      const prevTopicId = allTopicsWithModule[currentTopicIndex - 1].topic.id;
      setSelectedTopicId(prevTopicId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Global hotkey Ctrl+K / Cmd+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-slate-800 dark:text-slate-100 transition-colors">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        onOpenSearch={() => setIsSearchOpen(true)}
        masteredCount={masteredTopics.size}
        totalTopics={allTopicsWithModule.length}
        pinnedCount={pinnedFormulas.size}
      />

      {/* Main App Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {currentTab === 'curriculum' && (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Sticky Sidebar Navigation */}
            <Sidebar
              modules={CURRICULUM_DATA}
              selectedTopicId={selectedTopicId}
              onSelectTopic={(topicId) => {
                setSelectedTopicId(topicId);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              masteredTopics={masteredTopics}
              searchQuery={sidebarSearch}
              setSearchQuery={setSidebarSearch}
            />

            {/* Main Topic Reader & Exercises */}
            <div className="flex-1 w-full min-w-0">
              <TopicDetail
                topic={currentItem.topic}
                module={currentItem.module}
                isMastered={masteredTopics.has(currentItem.topic.id)}
                onToggleMastered={toggleMastered}
                onNavigateNext={handleNextTopic}
                onNavigatePrev={handlePrevTopic}
                hasNext={currentTopicIndex < allTopicsWithModule.length - 1}
                hasPrev={currentTopicIndex > 0}
                onJumpToSandboxes={() => setCurrentTab('sandboxes')}
              />
            </div>
          </div>
        )}

        {currentTab === 'sandboxes' && <SandboxesView />}

        {currentTab === 'vault' && (
          <FormulaVault
            pinnedFormulaIds={pinnedFormulas}
            onTogglePin={togglePin}
          />
        )}

        {currentTab === 'board' && (
          <StudyBoard
            pinnedFormulaIds={pinnedFormulas}
            onTogglePin={togglePin}
            masteredTopicIds={masteredTopics}
            onSelectTopic={(topicId) => {
              setSelectedTopicId(topicId);
              setCurrentTab('curriculum');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* Global Search Dialog Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTopic={(topicId) => {
          setSelectedTopicId(topicId);
          setCurrentTab('curriculum');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateToVault={() => setCurrentTab('vault')}
        onNavigateToSandboxes={() => setCurrentTab('sandboxes')}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800/80 py-8 bg-white/40 dark:bg-slate-950/40 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-serif font-bold text-slate-700 dark:text-slate-300">
            <span className="w-5 h-5 rounded-md bg-amber-500 text-white flex items-center justify-center text-[10px] font-black">
              ∫
            </span>
            Calculus Made Easy for Clara
          </div>
          <div>
            Built with mathematical precision, KaTeX textbook rendering, and interactive visual intuition.
          </div>
          <div className="text-[11px] text-slate-400">
            Ready for instant deployment on Vercel
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
