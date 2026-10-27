import React from 'react';
import { FORMULAS_DATA } from '../data/formulasData';
import { CURRICULUM_DATA } from '../data/curriculumData';
import { MathView } from './MathView';
import { Pin, BookmarkCheck, Award, Trash2, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StudyBoardProps {
  pinnedFormulaIds: Set<string>;
  onTogglePin: (formulaId: string) => void;
  masteredTopicIds: Set<string>;
  onSelectTopic: (topicId: string) => void;
}

export const StudyBoard: React.FC<StudyBoardProps> = ({
  pinnedFormulaIds,
  onTogglePin,
  masteredTopicIds,
  onSelectTopic,
}) => {
  const pinnedFormulas = FORMULAS_DATA.filter((f) => pinnedFormulaIds.has(f.id));

  // Gather all topics
  const allTopics = CURRICULUM_DATA.flatMap((m) => m.topics);
  const totalTopics = allTopics.length;
  const masteredCount = masteredTopicIds.size;
  const progressPercent = Math.round((masteredCount / totalTopics) * 100);

  const triggerCertificateConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#F59E0B', '#10B981', '#6366F1', '#EC4899'],
    });
  };

  return (
    <div className="space-y-8 pb-16 animate-fadeIn max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200/80 dark:border-slate-800 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-2">
              <BookmarkCheck className="w-3.5 h-3.5" />
              Clara's Personal Study Board
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 dark:text-white">
              Your Personalized Calculus Command Center
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Quickly review your pinned formulas, track topic mastery, and celebrate your mathematical milestones.
            </p>
          </div>

          {/* Overall Score Dial */}
          <div className="flex items-center gap-4 bg-white/80 dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-center">
              <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                {progressPercent}%
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Mastery Level</div>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="text-center">
              <div className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                {masteredCount}/{totalTopics}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Topics Done</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
          <div
            className="bg-gradient-to-r from-indigo-500 via-rose-500 to-emerald-500 h-full rounded-full transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* PINNED FORMULAS SECTION */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Pin className="w-4 h-4 text-emerald-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Pinned Formulas ({pinnedFormulas.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Pin any formula from the Vault with the pin icon
          </span>
        </div>

        {pinnedFormulas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pinnedFormulas.map((f) => (
              <div
                key={f.id}
                className="glass-panel p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {f.name}
                    </span>
                    <button
                      onClick={() => onTogglePin(f.id)}
                      className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                      title="Unpin"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="my-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 overflow-x-auto text-center">
                    <MathView math={f.latex} block />
                  </div>

                  <p className="text-xs text-amber-800 dark:text-amber-300 bg-amber-500/10 p-2 rounded border border-amber-500/20 font-medium">
                    💡 {f.eli5}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/30 dark:bg-slate-900/30">
            <Pin className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              No formulas pinned yet!
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Visit the Formula Vault and click the Pin icon on any rule you want to memorize.
            </p>
          </div>
        )}
      </div>

      {/* CLARA'S MASTERY CERTIFICATE BADGE */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-xl border-2 border-amber-500/40 dark:border-amber-500/30 bg-gradient-to-tr from-amber-500/5 via-rose-500/5 to-indigo-500/5 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/30 flex-shrink-0">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Official Certification
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-black text-slate-900 dark:text-white">
                Clara's Intuitive Calculus Certificate of Mastery
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Issued for conquering foundations, limits, differential tangent lines, integral accumulation, and multivariable gradients!
              </p>
            </div>
          </div>

          <button
            onClick={triggerCertificateConfetti}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-white text-xs font-bold shadow-lg shadow-rose-500/20 hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer flex-shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            Celebrate Clara! 🎉
          </button>
        </div>
      </div>

      {/* TOPIC MASTERY BREAKDOWN */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          Mastered Curriculum Topics ({masteredCount}/{totalTopics})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {allTopics.map((topic) => {
            const isDone = masteredTopicIds.has(topic.id);
            return (
              <div
                key={topic.id}
                onClick={() => onSelectTopic(topic.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  isDone
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-slate-800 dark:text-slate-100'
                    : 'bg-white/40 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-500 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">{topic.title}</div>
                  <div className="text-[10px] text-slate-400 truncate">{topic.subtitle}</div>
                </div>

                <div className="flex-shrink-0">
                  {isDone ? (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                      Done ✓
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      To Do
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
