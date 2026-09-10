import React, { useEffect, useState } from 'react';
import { Problem } from '../types';
import { api } from '../services/api';
import { ArrowRight, Tag, RefreshCw } from 'lucide-react';
import PixelCard from '../components/PixelCard';

interface ProblemsPageProps {
  onSelectProblem: (problem: Problem) => void;
}

// Pick a PixelCard variant per difficulty
const variantForDifficulty = (diff: string): 'blue' | 'yellow' | 'pink' | 'default' => {
  if (diff === 'Hard') return 'pink';
  if (diff === 'Medium') return 'yellow';
  return 'blue';
};

const difficultyLabel = (diff: string) => {
  if (diff === 'Hard') return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  if (diff === 'Medium') return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
  return 'text-sky-400 border-sky-500/40 bg-sky-500/10';
};

export const ProblemsPage: React.FC<ProblemsPageProps> = ({ onSelectProblem }) => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getProblems()
      .then((data) => {
        setProblems(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch problems');
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* ─── Hero ─── */}
      <section className="flex flex-col items-center justify-center text-center px-4 pt-40 pb-20 gap-7">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
          <span className="text-[11px] font-bold uppercase tracking-widest text-white bg-white/15 px-2 py-0.5 rounded-full">
            NEW
          </span>
          <span className="text-sm text-slate-300 font-medium">AI-Powered LLD Practice</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.1] max-w-2xl">
          Master Low-Level System Design
        </h1>

        {/* Sub text */}
        <p className="text-slate-400 text-base max-w-lg leading-relaxed">
          Submit solutions, get structured 8-criterion AI feedback, and track your score improvement over time.
        </p>

        {/* CTAs */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <button
            onClick={() => document.getElementById('problems-grid')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-6 py-3 rounded-xl bg-white text-[#0d0d14] font-semibold text-sm hover:bg-slate-100 transition-colors shadow-lg shadow-black/30"
          >
            Get started
          </button>
          <button
            onClick={() => document.getElementById('problems-grid')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-6 py-3 rounded-xl bg-white/10 text-white font-semibold text-sm hover:bg-white/15 transition-colors border border-white/10 backdrop-blur-sm"
          >
            Learn more
          </button>
        </div>
      </section>

      {/* ─── Problems Grid ─── */}
      <section id="problems-grid" className="w-full px-4 sm:px-6 lg:px-8 pb-24">
        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
            <p className="text-sm font-medium">Loading problems...</p>
          </div>
        )}

        {error && (
          <div className="p-6 bg-rose-950/40 border border-rose-500/40 rounded-xl text-rose-300 max-w-xl mx-auto my-12 text-center space-y-2">
            <p className="font-semibold text-sm">Failed to load problems</p>
            <p className="text-xs text-rose-400">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-8 text-center">
              Problem Catalog &mdash; {problems.length} challenges
            </p>

            {/* Single-row horizontal strip — all cards in one line */}
            <div className="flex flex-nowrap justify-center gap-5 overflow-x-auto pb-2"
              style={{ scrollbarWidth: 'none' }}>
              {problems.map((problem) => (
                <PixelCard
                  key={problem.id}
                  variant={variantForDifficulty(problem.difficulty)}
                  className="cursor-pointer shrink-0"
                  style={{
                    width: `min(260px, calc((100vw - 5rem) / ${Math.max(problems.length, 1)}))`,
                    height: 'auto',
                    aspectRatio: '4/5',
                  }}
                >
                  {/* Content — must be position: absolute per PixelCard spec */}
                  <div className="absolute inset-0 flex flex-col justify-between p-6 z-10">
                    {/* Top section */}
                    <div className="space-y-3">
                      {/* Difficulty badge */}
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${difficultyLabel(problem.difficulty)}`}
                      >
                        {problem.difficulty}
                      </span>

                      {/* Title */}
                      <h3 className="text-lg font-bold text-white leading-snug">
                        {problem.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-slate-400 line-clamp-4 leading-relaxed">
                        {problem.description}
                      </p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {problem.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/8 text-[10px]"
                        >
                          <Tag className="w-2.5 h-2.5 shrink-0" />
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="pt-3 border-t border-white/[0.07] flex items-center justify-between">
                      <span className="text-[10px] text-slate-600 font-mono">8-Criterion AI Rubric</span>
                      <button
                        onClick={() => onSelectProblem(problem)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all"
                      >
                        Practice
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </PixelCard>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
};
