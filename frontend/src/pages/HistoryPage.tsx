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
  Trash2,
} from 'lucide-react';

interface HistoryPageProps {
  onSelectAttempt: (attempt: Attempt) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onSelectAttempt }) => {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);

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

  const handleResetHistory = async () => {
    try {
      setIsResetting(true);
      await api.clearLearnerAttempts('learner-default');
      setAttempts([]);
      setShowConfirm(false);
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to clear practice history');
      setShowConfirm(false);
    } finally {
      setIsResetting(false);
    }
  };

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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

          {/* Reset History Action */}
          {!loading && attempts.length > 0 && (
            <div className="shrink-0">
              {!showConfirm ? (
                <button
                  onClick={() => setShowConfirm(true)}
                  disabled={isResetting}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 text-xs font-semibold transition-all shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Reset History
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-rose-950/60 border border-rose-500/40 p-1.5 pl-3 rounded-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
                  <span className="text-xs text-rose-200 font-medium">Clear all {attempts.length} attempts?</span>
                  <button
                    onClick={handleResetHistory}
                    disabled={isResetting}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
                  >
                    {isResetting ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Clearing...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3 h-3" />
                        Yes, Clear
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    disabled={isResetting}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-all"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Success Toast/Banner ── */}
        {resetSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs text-emerald-300 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Practice history has been reset successfully.</span>
            </div>
            <button
              onClick={() => setResetSuccess(false)}
              className="text-emerald-400/70 hover:text-emerald-300 font-bold px-1"
            >
              &times;
            </button>
          </div>
        )}


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
