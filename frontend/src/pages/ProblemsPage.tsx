import React, { useEffect, useState } from 'react';
import { Problem } from '../types';
import { api } from '../services/api';
import { ArrowRight, Tag, RefreshCw } from 'lucide-react';

interface ProblemsPageProps {
  onSelectProblem: (problem: Problem) => void;
}

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

  const getDifficultyBadge = (diff: string) => {
    if (diff === 'Hard') return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    if (diff === 'Medium') return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  };

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
      <section id="problems-grid" className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-20">
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
                Problem Catalog
                <span className="ml-2 text-slate-600">({problems.length})</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {problems.map((problem) => (
                <div
                  key={problem.id}
                  className="group rounded-2xl p-6 bg-white/[0.04] border border-white/[0.07] hover:border-white/20 hover:bg-white/[0.07] transition-all duration-200 flex flex-col justify-between gap-4 backdrop-blur-sm cursor-pointer"
                  onClick={() => onSelectProblem(problem)}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-bold text-white group-hover:text-slate-100 leading-snug">
                        {problem.title}
                      </h3>
                      <span
                        className={`shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getDifficultyBadge(problem.difficulty)}`}
                      >
                        {problem.difficulty}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {problem.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {problem.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white/5 text-slate-400 border border-white/8 text-[11px]"
                        >
                          <Tag className="w-2.5 h-2.5 text-slate-500" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-[11px] text-slate-600 font-mono">8-Criterion AI Rubric</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onSelectProblem(problem); }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all group-hover:gap-2"
                    >
                      Practice
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
};
