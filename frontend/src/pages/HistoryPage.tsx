import React, { useEffect, useState } from 'react';
import { Attempt } from '../types';
import { api } from '../services/api';
import { AttemptTrendChart } from '../components/AttemptTrendChart';
import { CriterionBadge } from '../components/CriterionBadge';
import { History, Calendar, RefreshCw, ChevronRight, FileText, Sparkles } from 'lucide-react';

interface HistoryPageProps {
  onSelectAttempt: (attempt: Attempt) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onSelectAttempt }) => {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getLearnerAttempts('learner-default')
      .then((data) => {
        setAttempts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load attempt history');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
        <p className="text-sm font-medium">Fetching attempt history & analytics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-400" />
            Learner Practice History & Analytics
          </h1>
          <p className="text-xs text-slate-400">
            Review past submissions, track rubric score trends, and inspect recurring weaknesses.
          </p>
        </div>
      </div>

      {/* Attempt Score Trend Chart (Stretch Feature 3!) */}
      <AttemptTrendChart attempts={attempts} />

      {/* Attempt History List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-200 uppercase tracking-wider">
          All Practice Sessions ({attempts.length})
        </h2>

        {attempts.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center text-slate-400 text-xs">
            No practice attempts recorded yet. Start practicing problems from the Problems Catalog!
          </div>
        ) : (
          <div className="space-y-4">
            {attempts.map((att) => {
              const latestSub = att.submissions && att.submissions.length > 0 ? att.submissions[0] : null;
              const evalResult = latestSub?.evaluation?.result;
              const criterionScores = evalResult?.criterionScores || [];
              const avgScore = criterionScores.length
                ? (criterionScores.reduce((sum, cs) => sum + cs.score, 0) / criterionScores.length).toFixed(1)
                : null;

              return (
                <div
                  key={att.id}
                  className="glass-card rounded-xl p-5 border border-slate-800 hover:border-indigo-500/40 transition-all space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{att.problem?.title || 'LLD Practice Problem'}</h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-800">
                          {att.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                          {new Date(att.startedAt).toLocaleString()}
                        </span>
                        <span>• {att.submissions?.length || 0} Submission(s)</span>
                      </div>
                    </div>

                    {/* Score Badge */}
                    {avgScore && (
                      <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-right font-mono">
                        <span className="text-[10px] text-slate-500 uppercase block">Rubric Avg</span>
                        <span className="text-lg font-bold text-indigo-400">{avgScore} / 5.0</span>
                      </div>
                    )}
                  </div>

                  {/* Summary & Criterion Badges */}
                  {evalResult && (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800 leading-relaxed">
                        {evalResult.overallSummary}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {criterionScores.map((cs) => (
                          <CriterionBadge key={cs.id || cs.criterion} criterion={cs.criterion} score={cs.score} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
