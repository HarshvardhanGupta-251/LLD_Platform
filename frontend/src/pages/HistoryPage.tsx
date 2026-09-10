import React, { useEffect, useState } from 'react';
import { Attempt } from '../types';
import { api } from '../services/api';
import { AttemptTrendChart } from '../components/AttemptTrendChart';
import { CriterionBadge } from '../components/CriterionBadge';
import {
  TrendingUp,
  Calendar,
  RefreshCw,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';

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

  const statusStyle = (status: string) => {
    if (status === 'Submitted')
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  };

  const statusIcon = (status: string) =>
    status === 'Submitted' ? (
      <CheckCircle2 className="w-3 h-3" />
    ) : (
      <Clock className="w-3 h-3" />
    );

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── Page Header ── */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold text-white">
              Learner Practice History &amp; Analytics
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Review past submissions, track rubric score trends, and inspect recurring weaknesses.
          </p>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-slate-500">
            <RefreshCw className="w-7 h-7 animate-spin" />
            <p className="text-sm">Fetching attempt history &amp; analytics...</p>
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-rose-300">Failed to load history</p>
              <p className="text-xs text-rose-400/80">{error}</p>
            </div>
          </div>
        )}

        {/* ── Analytics Chart ── */}
        {!loading && !error && <AttemptTrendChart attempts={attempts} />}

        {/* ── Sessions List ── */}
        {!loading && !error && (
          <div className="space-y-3">
            {/* Section heading */}
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              All Practice Sessions ({attempts.length})
            </p>

            {attempts.length === 0 ? (
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-10 text-center space-y-2">
                <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm text-slate-400">No practice attempts yet.</p>
                <p className="text-xs text-slate-600">
                  Start a problem from the catalog to see your history here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {attempts.map((att) => {
                  const latestSub =
                    att.submissions && att.submissions.length > 0
                      ? att.submissions[0]
                      : null;
                  const evalResult = latestSub?.evaluation?.result;
                  const criterionScores = evalResult?.criterionScores || [];
                  const avgScore = criterionScores.length
                    ? (
                        criterionScores.reduce((s, cs) => s + cs.score, 0) /
                        criterionScores.length
                      ).toFixed(1)
                    : null;

                  return (
                    <div
                      key={att.id}
                      onClick={() => onSelectAttempt(att)}
                      className="group rounded-2xl border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] hover:border-indigo-500/30 transition-all duration-200 overflow-hidden cursor-pointer"
                    >
                      {/* Card header */}
                      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-4 pb-3 border-b border-white/[0.05]">
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold text-white truncate">
                              {att.problem?.title || 'LLD Practice Problem'}
                            </h3>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusStyle(att.status)}`}
                            >
                              {statusIcon(att.status)}
                              {att.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(att.startedAt).toLocaleString()}
                            </span>
                            <span>
                              &bull; {att.submissions?.length || 0} Submission(s)
                            </span>
                          </div>
                        </div>

                        {/* Score pill */}
                        {avgScore && (
                          <div className="shrink-0 text-right font-mono rounded-xl px-3.5 py-2 bg-white/5 border border-white/10">
                            <span className="text-[10px] text-slate-500 block uppercase tracking-wider">
                              Rubric Avg
                            </span>
                            <span className="text-base font-extrabold text-indigo-400">
                              {avgScore}
                              <span className="text-slate-600 text-xs font-normal">
                                {' '}/ 5.0
                              </span>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Summary + badges */}
                      {evalResult && (
                        <div className="px-5 py-3 space-y-3">
                          <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                            {evalResult.overallSummary}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {criterionScores.map((cs) => (
                              <CriterionBadge
                                key={cs.id || cs.criterion}
                                criterion={cs.criterion}
                                score={cs.score}
                              />
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
        )}
      </div>
    </div>
  );
};
