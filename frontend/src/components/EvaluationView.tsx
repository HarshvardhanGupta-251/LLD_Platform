import React, { useState } from 'react';
import { Evaluation } from '../types';
import { CriterionBadge, CRITERION_TITLES } from './CriterionBadge';
import { ConfidenceBadge } from './ConfidenceBadge';
import { EvidenceHighlighter } from './EvidenceHighlighter';
import {
  RefreshCw,
  Sparkles,
  Award,
  AlertTriangle,
  Lightbulb,
  FileText,
  RotateCcw,
  AlertOctagon,
} from 'lucide-react';

interface EvaluationViewProps {
  evaluation: Evaluation;
  submissionContent: string;
  onRetryEvaluation?: (evaluationId: string) => Promise<void>;
  onNewAttempt?: () => void;
}

export const EvaluationView: React.FC<EvaluationViewProps> = ({
  evaluation,
  submissionContent,
  onRetryEvaluation,
  onNewAttempt,
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [activeTab, setActiveTab] = useState<'rubric' | 'evidence'>('rubric');

  const { status, evaluatorType, errorMessage, result } = evaluation;

  const handleRetry = async () => {
    if (!onRetryEvaluation) return;
    setIsRetrying(true);
    try { await onRetryEvaluation(evaluation.id); }
    finally { setIsRetrying(false); }
  };

  // Loading state
  if (status === 'Queued' || status === 'Evaluating') {
    return (
      <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-10 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto">
          <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">
            Evaluation in Progress ({evaluatorType} Mode)
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Status: <span className="font-mono text-indigo-400 font-semibold">{status}</span> — evaluating against all 8 LLD criteria...
          </p>
        </div>
      </div>
    );
  }

  // Failed state
  if (status === 'Failed') {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-rose-200">Evaluation Job Failed</h3>
            <p className="text-xs text-rose-400/80">{errorMessage || 'An error occurred during evaluation.'}</p>
          </div>
        </div>
        <button
          onClick={handleRetry}
          disabled={isRetrying}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-all disabled:opacity-50"
        >
          <RotateCcw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
          Retry Evaluation
        </button>
      </div>
    );
  }

  if (!result) return <div className="text-xs text-slate-500">Evaluation result pending...</div>;

  const { overallSummary, strengths, improvementAreas, criterionScores } = result;
  const avgScore = (criterionScores.reduce((s, cs) => s + cs.score, 0) / (criterionScores.length || 1)).toFixed(1);

  return (
    <div className="space-y-4">

      {/* ── Score Summary Banner ── */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] overflow-hidden">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 pt-4 pb-3 border-b border-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Evaluation Results</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  {evaluatorType} Evaluator
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Multi-Criterion Rubric Feedback &amp; Evidence Breakdown</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-xl border border-white/[0.07] font-mono">
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Avg Score</span>
              <span className="text-xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-300 bg-clip-text text-transparent">
                {avgScore} <span className="text-slate-600 text-sm font-normal">/ 5.0</span>
              </span>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Summary */}
          <div className="p-4 bg-black/20 rounded-xl border border-white/[0.05] text-xs text-slate-300 leading-relaxed">
            <strong className="text-indigo-300 block mb-1">Overall Architectural Summary:</strong>
            {overallSummary}
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Award className="w-4 h-4" />
                Key Architectural Strengths
              </div>
              <ul className="space-y-1 text-emerald-200/80 list-disc list-inside leading-relaxed">
                {strengths.map((st, i) => <li key={i}>{st}</li>)}
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <Lightbulb className="w-4 h-4" />
                Targeted Improvement Areas
              </div>
              <ul className="space-y-1 text-amber-200/80 list-disc list-inside leading-relaxed">
                {improvementAreas.map((imp, i) => <li key={i}>{imp}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/[0.08] w-fit">
        {[
          { id: 'rubric', label: 'Criterion Scores (8 Dimensions)', icon: <Sparkles className="w-3.5 h-3.5" /> },
          { id: 'evidence', label: 'Evidence Highlighting', icon: <FileText className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Rubric grid ── */}
      {activeTab === 'rubric' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {criterionScores.map((cs) => (
            <div
              key={cs.id || cs.criterion}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.03] overflow-hidden flex flex-col"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-3 pb-2.5 border-b border-white/[0.05]">
                <CriterionBadge criterion={cs.criterion} score={cs.score} />
                <ConfidenceBadge confidence={cs.confidence} />
              </div>
              <div className="px-4 py-3 space-y-2.5 flex-1">
                {/* Evidence */}
                <div className="p-3 bg-black/20 rounded-xl border border-white/[0.05] text-xs font-mono text-slate-300 leading-relaxed">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-sans block mb-1">
                    Cited Evidence:
                  </span>
                  &quot;{cs.evidence}&quot;
                </div>

                {/* Concern */}
                {cs.concern && (
                  <div className="p-2.5 bg-rose-500/5 border border-rose-500/20 rounded-xl text-xs text-rose-300 flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold block text-[11px]">Concern:</strong>
                      {cs.concern}
                    </div>
                  </div>
                )}

                {/* Suggestion */}
                <div className="p-2.5 bg-indigo-500/5 border border-indigo-500/20 rounded-xl text-xs text-indigo-200 flex items-start gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold block text-[11px] text-indigo-300">Suggestion:</strong>
                    {cs.suggestion}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Evidence tab ── */}
      {activeTab === 'evidence' && (
        <EvidenceHighlighter submissionText={submissionContent} criterionScores={criterionScores} />
      )}
    </div>
  );
};
