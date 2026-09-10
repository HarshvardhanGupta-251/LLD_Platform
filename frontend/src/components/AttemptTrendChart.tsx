import React from 'react';
import { Attempt, Criterion } from '../types';
import { TrendingUp, AlertCircle, Award } from 'lucide-react';
import { CRITERION_TITLES } from './CriterionBadge';

interface AttemptTrendChartProps {
  attempts: Attempt[];
}

export const AttemptTrendChart: React.FC<AttemptTrendChartProps> = ({ attempts }) => {
  const evaluatedAttempts = attempts
    .filter((a) => a.submissions && a.submissions.some((s) => s.evaluation?.result))
    .slice()
    .reverse();

  if (evaluatedAttempts.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-8 text-center space-y-2">
        <TrendingUp className="w-8 h-8 text-slate-600 mx-auto" />
        <h3 className="text-sm font-semibold text-slate-300">No Historical Evaluations Yet</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Complete at least one practice attempt to unlock score progression analytics and recurring
          weakness tracking.
        </p>
      </div>
    );
  }

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

  // Criterion averages
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

  const weakest = criterionAverages[0];
  const strongest = criterionAverages[criterionAverages.length - 1];

  const barColor = (avg: number) => {
    if (avg >= 4) return '#22c55e'; // green
    if (avg >= 3) return '#f59e0b'; // amber
    return '#f43f5e'; // rose
  };

  // SVG chart helpers
  const W = 500;
  const H = 130;
  const PAD_L = 42;
  const PAD_R = 16;
  const PAD_T = 18;
  const PAD_B = 30;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;
  const n = attemptSummaries.length;

  const xOf = (i: number) =>
    n === 1 ? PAD_L + chartW / 2 : PAD_L + (i / (n - 1)) * chartW;
  const yOf = (score: number) =>
    PAD_T + chartH - ((score - 1) / 4) * chartH;

  const polylinePoints = attemptSummaries
    .map((att, i) => `${xOf(i)},${yOf(att.avgScore)}`)
    .join(' ');

  // Area fill
  const areaPath =
    n > 1
      ? `M${xOf(0)},${yOf(attemptSummaries[0].avgScore)} ` +
        attemptSummaries.slice(1).map((att, i) => `L${xOf(i + 1)},${yOf(att.avgScore)}`).join(' ') +
        ` L${xOf(n - 1)},${PAD_T + chartH} L${xOf(0)},${PAD_T + chartH} Z`
      : '';

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] overflow-hidden">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-4 pb-4 border-b border-white/[0.05]">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">
              Attempt Progression &amp; Trend Analytics
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Track average rubric performance across {attemptSummaries.length} practice attempts
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {weakest && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px]">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <div>
                <span className="text-slate-500 block text-[10px]">Recurring Weakness</span>
                <span className="text-rose-300 font-semibold">
                  {weakest.title} ({weakest.avg}/5)
                </span>
              </div>
            </div>
          )}
          {strongest && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px]">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <div>
                <span className="text-slate-500 block text-[10px]">Top Strength</span>
                <span className="text-emerald-300 font-semibold">
                  {strongest.title} ({strongest.avg}/5)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 py-4 space-y-5">
        {/* ── Score Line Chart ── */}
        <div>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">
            Overall Score Progress (1.0 to 5.0)
          </p>
          <div className="rounded-xl bg-black/30 border border-white/[0.05] px-2 pt-2 pb-1">
            <svg
              className="w-full overflow-visible"
              viewBox={`0 0 ${W} ${H}`}
              preserveAspectRatio="none"
              style={{ height: 160 }}
            >
              {/* Grid lines */}
              {[1, 2, 3, 4, 5].map((v) => (
                <g key={v}>
                  <line
                    x1={PAD_L}
                    y1={yOf(v)}
                    x2={W - PAD_R}
                    y2={yOf(v)}
                    stroke="rgba(255,255,255,0.05)"
                    strokeDasharray="3 4"
                  />
                  <text
                    x={PAD_L - 6}
                    y={yOf(v) + 4}
                    fill="#475569"
                    fontSize="9"
                    textAnchor="end"
                  >
                    {v}.0
                  </text>
                </g>
              ))}

              {/* Area fill */}
              {areaPath && (
                <path
                  d={areaPath}
                  fill="url(#areaGrad)"
                  opacity={0.35}
                />
              )}

              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Polyline */}
              {n > 1 && (
                <polyline
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  points={polylinePoints}
                />
              )}

              {/* Data points */}
              {attemptSummaries.map((att, i) => {
                const cx = xOf(i);
                const cy = yOf(att.avgScore);
                return (
                  <g key={att.attemptId}>
                    <circle cx={cx} cy={cy} r="5" fill="#4f46e5" stroke="#fff" strokeWidth="1.5" />
                    <text
                      x={cx}
                      y={cy - 10}
                      fill="#e2e8f0"
                      fontSize="9"
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {att.avgScore}
                    </text>
                    <text
                      x={cx}
                      y={PAD_T + chartH + 16}
                      fill="#64748b"
                      fontSize="9"
                      textAnchor="middle"
                    >
                      Attempt #{att.attemptNumber}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* ── Criterion Bars ── */}
        <div>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">
            Criterion Mastery Averages
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {criterionAverages.map((ca) => (
              <div
                key={ca.criterion}
                className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-3 py-2.5 space-y-1.5"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 font-medium truncate">{ca.title}</span>
                  <span className="font-mono font-bold text-indigo-400 shrink-0 ml-2">
                    {ca.avg} / 5
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(ca.avg / 5) * 100}%`,
                      backgroundColor: barColor(ca.avg),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
