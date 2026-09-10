import React from 'react';
import { Attempt, Criterion } from '../types';
import { TrendingUp, AlertCircle, Award } from 'lucide-react';
import { CRITERION_TITLES } from './CriterionBadge';

interface AttemptTrendChartProps {
  attempts: Attempt[];
}

export const AttemptTrendChart: React.FC<AttemptTrendChartProps> = ({ attempts }) => {
  // Filter attempts that have a completed evaluation
  const evaluatedAttempts = attempts
    .filter((a) => a.submissions && a.submissions.some((s) => s.evaluation?.result))
    .slice()
    .reverse(); // Chronological order

  if (evaluatedAttempts.length === 0) {
    return (
      <div className="glass-card rounded-xl p-6 border border-slate-800 text-center space-y-2">
        <TrendingUp className="w-8 h-8 text-slate-600 mx-auto" />
        <h3 className="text-sm font-semibold text-slate-300">No Historical Evaluations Yet</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Complete at least one practice attempt to unlock score progression analytics and recurring weakness tracking.
        </p>
      </div>
    );
  }

  // Calculate scores per attempt
  const attemptSummaries = evaluatedAttempts.map((attempt, index) => {
    const latestSub = attempt.submissions?.find((s) => s.evaluation?.result);
    const criterionScores = latestSub?.evaluation?.result?.criterionScores || [];
    const avgScore =
      criterionScores.length > 0
        ? criterionScores.reduce((sum, cs) => sum + cs.score, 0) / criterionScores.length
        : 0;

    return {
      attemptNumber: index + 1,
      attemptId: attempt.id,
      problemTitle: attempt.problem?.title || 'LLD Practice',
      date: new Date(attempt.startedAt).toLocaleDateString(),
      avgScore: parseFloat(avgScore.toFixed(1)),
      criterionScores,
    };
  });

  // Calculate overall criterion averages across all attempts to identify recurring weakness
  const criterionTotals: Record<string, { total: number; count: number }> = {};

  attemptSummaries.forEach((att) => {
    att.criterionScores.forEach((cs) => {
      if (!criterionTotals[cs.criterion]) {
        criterionTotals[cs.criterion] = { total: 0, count: 0 };
      }
      criterionTotals[cs.criterion].total += cs.score;
      criterionTotals[cs.criterion].count += 1;
    });
  });

  const criterionAverages = Object.entries(criterionTotals).map(([crit, val]) => ({
    criterion: crit as Criterion,
    title: CRITERION_TITLES[crit] || crit,
    avg: parseFloat((val.total / val.count).toFixed(1)),
  }));

  criterionAverages.sort((a, b) => a.avg - b.avg);
  const weakestCriterion = criterionAverages[0];
  const strongestCriterion = criterionAverages[criterionAverages.length - 1];

  return (
    <div className="glass-card rounded-xl p-6 border border-slate-800 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-slate-100">Attempt Progression & Trend Analytics</h3>
          </div>
          <p className="text-xs text-slate-400">
            Track average rubric performance across {attemptSummaries.length} practice attempts
          </p>
        </div>

        {/* Highlight Badges */}
        <div className="flex items-center gap-3">
          {weakestCriterion && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-950/60 border border-rose-500/30 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <div>
                <span className="text-slate-400 block text-[10px]">Recurring Weakness</span>
                <span className="text-rose-300 font-semibold">{weakestCriterion.title} ({weakestCriterion.avg}/5)</span>
              </div>
            </div>
          )}

          {strongestCriterion && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-xs">
              <Award className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-slate-400 block text-[10px]">Top Strength</span>
                <span className="text-emerald-300 font-semibold">{strongestCriterion.title} ({strongestCriterion.avg}/5)</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SVG Score Progression Line Chart */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Score Progress (1.0 to 5.0)</h4>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative">
          <svg className="w-full h-44 overflow-visible" viewBox="0 0 500 150">
            {/* Grid lines */}
            <line x1="40" y1="20" x2="480" y2="20" stroke="#1e293b" strokeDasharray="3 3" />
            <text x="25" y="24" fill="#64748b" fontSize="10">5.0</text>

            <line x1="40" y1="65" x2="480" y2="65" stroke="#1e293b" strokeDasharray="3 3" />
            <text x="25" y="69" fill="#64748b" fontSize="10">3.0</text>

            <line x1="40" y1="110" x2="480" y2="110" stroke="#1e293b" strokeDasharray="3 3" />
            <text x="25" y="114" fill="#64748b" fontSize="10">1.0</text>

            {/* Line connecting points */}
            {attemptSummaries.length > 1 && (
              <polyline
                fill="none"
                stroke="#6366f1"
                strokeWidth="3"
                points={attemptSummaries
                  .map((att, idx) => {
                    const x = 40 + (idx / (attemptSummaries.length - 1 || 1)) * 440;
                    const y = 110 - ((att.avgScore - 1) / 4) * 90;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />
            )}

            {/* Plot points */}
            {attemptSummaries.map((att, idx) => {
              const x = attemptSummaries.length === 1 ? 260 : 40 + (idx / (attemptSummaries.length - 1)) * 440;
              const y = 110 - ((att.avgScore - 1) / 4) * 90;

              return (
                <g key={att.attemptId}>
                  <circle cx={x} cy={y} r="6" fill="#4f46e5" stroke="#ffffff" strokeWidth="2" />
                  <text x={x} y={y - 12} fill="#e2e8f0" fontSize="11" fontWeight="bold" textAnchor="middle">
                    {att.avgScore}
                  </text>
                  <text x={x} y="132" fill="#94a3b8" fontSize="10" textAnchor="middle">
                    Attempt #{att.attemptNumber}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Per-Criterion Breakdown Bars */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Criterion Mastery Averages</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {criterionAverages.map((ca) => (
            <div key={ca.criterion} className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-slate-200">{ca.title}</span>
                <span className="font-mono font-bold text-indigo-400">{ca.avg} / 5</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    ca.avg >= 4 ? 'bg-emerald-500' : ca.avg >= 3 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${(ca.avg / 5) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
