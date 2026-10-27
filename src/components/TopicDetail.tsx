import React, { useState } from 'react';
import type { Topic, Module } from '../types/curriculum';
import { MathView } from './MathView';
import { DerivativeExplorer } from './sandboxes/DerivativeExplorer';
import { RiemannSumIntegrator } from './sandboxes/RiemannSumIntegrator';
import { TaylorSeriesVisualizer } from './sandboxes/TaylorSeriesVisualizer';
import { OptimizationSandbox } from './sandboxes/OptimizationSandbox';
import confetti from 'canvas-confetti';
import {
  Lightbulb,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  HelpCircle,
  BookOpen,
  Award,
  Code2,
} from 'lucide-react';

interface TopicDetailProps {
  topic: Topic;
  module: Module;
  isMastered: boolean;
  onToggleMastered: (topicId: string) => void;
  onNavigateNext: () => void;
  onNavigatePrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  onJumpToSandboxes: () => void;
}

export const TopicDetail: React.FC<TopicDetailProps> = ({
  topic,
  module,
  isMastered,
  onToggleMastered,
  onNavigateNext,
  onNavigatePrev,
  hasNext,
  hasPrev,
  onJumpToSandboxes,
}) => {
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [showWorkedSteps, setShowWorkedSteps] = useState<boolean>(true);

  // Trigger celebratory confetti when topic is completed
  const handleMasterClick = () => {
    if (!isMastered) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4F46E5', '#10B981', '#F59E0B', '#E11D48'],
      });
    }
    onToggleMastered(topic.id);
  };

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      {/* 1. TOPIC HEADER & METADATA */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200/80 dark:border-slate-800 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Module {module.number}: {module.title}
            </span>
          </div>

          {/* Mark Mastered Button */}
          <button
            onClick={handleMasterClick}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
              isMastered
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600'
            }`}
          >
            <CheckCircle className={`w-4 h-4 ${isMastered ? 'text-white' : 'text-slate-400'}`} />
            {isMastered ? 'Mastered by Clara! 🎉' : 'Mark as Mastered'}
          </button>
        </div>

        <h1 className="text-2xl sm:text-4xl font-serif font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          {topic.title}
        </h1>
        <p className="text-base text-slate-500 dark:text-slate-400 mt-2 font-sans font-medium">
          {topic.subtitle}
        </p>

        {/* 2. EXPLAIN LIKE I'M 5 CALLOUT (REQUIRED CRITICAL PEDAGOGICAL HOOK) */}
        <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border-2 border-amber-500/30 dark:border-amber-500/20 relative">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-500/30">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">
                In Plain English (Explain Like I'm 5)
              </div>
              <p className="text-base sm:text-lg font-medium text-slate-900 dark:text-amber-100 mt-1 leading-relaxed">
                "{topic.eli5}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. INTUITIVE ANALOGY & DEEP DIVE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Analogy Card */}
        <div className="glass-panel rounded-2xl p-6 shadow-md border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
              <Sparkles className="w-4 h-4" />
              The Intuitive Real-World Analogy
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              {topic.analogy}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-400 flex items-center gap-1.5">
            <span>Visual thinking anchor for Clara</span>
          </div>
        </div>

        {/* Formal Notation Card */}
        <div className="glass-panel rounded-2xl p-6 shadow-md border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              <Code2 className="w-4 h-4" />
              Textbook-Grade Mathematical Notation
            </div>
            <div className="my-2">
              <MathView math={topic.formalNotation} block className="text-base sm:text-lg py-3" />
            </div>
            {topic.formulaNote && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-mono">
                {topic.formulaNote}
              </p>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-400">
            Formally defined with standard mathematical rigor
          </div>
        </div>
      </div>

      {/* 4. CONCEPT DEEP DIVE */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-md border border-slate-200/70 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-500" />
          The Core Concept Deconstructed
        </h3>
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          {topic.conceptDeepDive}
        </p>
      </div>

      {/* 5. INTERACTIVE VISUAL SANDBOX (If present on this topic) */}
      {topic.interactiveWidgetType && topic.interactiveWidgetType !== 'none' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-500" />
              Interactive Visualization
            </h3>
            <button
              onClick={onJumpToSandboxes}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Open Fullscreen Sandbox View →
            </button>
          </div>

          {topic.interactiveWidgetType === 'derivative' && <DerivativeExplorer />}
          {topic.interactiveWidgetType === 'riemann' && <RiemannSumIntegrator />}
          {topic.interactiveWidgetType === 'taylor' && <TaylorSeriesVisualizer />}
          {topic.interactiveWidgetType === 'optimization' && <OptimizationSandbox />}
        </div>
      )}

      {/* 6. STEP-BY-STEP WORKED EXAMPLE */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-md border border-slate-200/70 dark:border-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Step-by-Step Mastery
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {topic.workedExample.title}
            </h3>
          </div>

          <button
            onClick={() => setShowWorkedSteps(!showWorkedSteps)}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 cursor-pointer font-medium"
          >
            {showWorkedSteps ? 'Collapse Steps' : 'Expand Steps'}
          </button>
        </div>

        {/* Problem Statement */}
        <div className="my-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
          <span className="text-xs font-bold uppercase text-slate-400 block mb-1">Problem to Solve:</span>
          <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">
            <MathView math={topic.workedExample.problem} />
          </div>
        </div>

        {/* Worked Steps Accordion */}
        {showWorkedSteps && (
          <div className="space-y-3 mt-4">
            {topic.workedExample.steps.map((step, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 rounded-xl bg-white/70 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800 hover:border-indigo-400/50 transition-colors"
              >
                {/* Step number & Key Rule */}
                <div className="md:col-span-3 flex md:flex-col justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Step {idx + 1}
                    </span>
                  </div>
                  {step.keyRule && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40 mt-1">
                      {step.keyRule}
                    </span>
                  )}
                </div>

                {/* Math Expression */}
                <div className="md:col-span-4 flex items-center overflow-x-auto py-1">
                  <MathView math={step.math} />
                </div>

                {/* Plain-English Explanation */}
                <div className="md:col-span-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex items-center">
                  <p className="leading-relaxed">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Why: </span>
                    {step.explanation}
                  </p>
                </div>
              </div>
            ))}

            {/* Final Answer Banner */}
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  Final Verified Answer:
                </span>
                <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  <MathView math={topic.workedExample.finalAnswer} />
                </div>
              </div>
              <p className="text-xs text-emerald-800 dark:text-emerald-200 max-w-md">
                {topic.workedExample.summary}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 7. CLARA'S AHA! MOMENT CALLOUT */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 text-slate-800 dark:text-slate-200">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
          <Award className="w-4 h-4" />
          Clara's Aha! Moment & Exam Secret
        </div>
        <p className="text-sm leading-relaxed mt-1">
          💡 {topic.claraTip}
        </p>
      </div>

      {/* 8. CHECK YOUR UNDERSTANDING MINI-QUIZ */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-md border border-slate-200/70 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
          <HelpCircle className="w-4 h-4" />
          Check Your Understanding
        </div>
        <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-4">
          {topic.quiz.question}
        </h4>

        {/* Options */}
        <div className="space-y-2.5">
          {topic.quiz.options.map((opt, idx) => {
            const isSelected = selectedQuizOption === idx;
            const isCorrect = idx === topic.quiz.correctIndex;
            let btnStyle =
              'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400';

            if (selectedQuizOption !== null) {
              if (isCorrect) {
                btnStyle = 'bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-semibold';
              } else if (isSelected && !isCorrect) {
                btnStyle = 'bg-rose-500/15 border-rose-500 text-rose-800 dark:text-rose-200';
              } else {
                btnStyle = 'opacity-40 border-slate-200 dark:border-slate-800';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => setSelectedQuizOption(idx)}
                className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-start gap-3 cursor-pointer ${btnStyle}`}
              >
                <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1">{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Instant Feedback Explanation */}
        {selectedQuizOption !== null && (
          <div
            className={`mt-4 p-4 rounded-xl text-xs sm:text-sm leading-relaxed ${
              selectedQuizOption === topic.quiz.correctIndex
                ? 'bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 border border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-900 dark:text-amber-200 border border-amber-500/30'
            }`}
          >
            <strong>
              {selectedQuizOption === topic.quiz.correctIndex
                ? '🎯 Brilliant, Clara! Correct Answer.'
                : '💡 Almost! Here is why:'}
            </strong>{' '}
            {topic.quiz.explanation}
          </div>
        )}
      </div>

      {/* 9. BOTTOM NAVIGATION PAGINATION */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200/80 dark:border-slate-800">
        <button
          onClick={onNavigatePrev}
          disabled={!hasPrev}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
            hasPrev
              ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              : 'opacity-30 border-transparent cursor-not-allowed text-slate-400'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous Topic
        </button>

        <button
          onClick={onNavigateNext}
          disabled={!hasNext}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
            hasNext
              ? 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20'
              : 'opacity-30 border-transparent cursor-not-allowed text-slate-400'
          }`}
        >
          Next Topic
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
