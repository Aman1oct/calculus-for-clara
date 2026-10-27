import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  math: string;
  block?: boolean;
  className?: string;
}

export const MathView: React.FC<MathViewProps> = ({ math, block = false, className = '' }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
        strict: false,
      });
    } catch (err) {
      console.error('KaTeX rendering error for:', math, err);
      return `<span class="text-rose-500 font-mono">${math}</span>`;
    }
  }, [math, block]);

  if (block) {
    return (
      <div
        className={`math-display my-2 overflow-x-auto py-2 px-3 rounded-lg bg-slate-900/5 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 text-center ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={`inline-block mx-0.5 align-middle ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
