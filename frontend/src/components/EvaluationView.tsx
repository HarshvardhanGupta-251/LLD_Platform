import React, { useState } from 'react';
import { Evaluation } from '../types';
import { CriterionBadge, CRITERION_TITLES } from './CriterionBadge';
import { ConfidenceBadge } from './ConfidenceBadge';
import { EvidenceHighlighter } from './EvidenceHighlighter';
import {
  CheckCircle2,
  AlertOctagon,
  RefreshCw,
  Sparkles,
  Award,
  AlertTriangle,
  Lightbulb,
  FileText,
  RotateCcw,
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
    try {
      await onRetryEvaluation(evaluation.id);
    } finally {
      setIsRetrying(false);
    }
  };

  // Status: Queued or Evaluating
  if (status === 'Queued' || status === 'Evaluating') {
    return (
      <div className="glass-card rounded-xl p-8 border border-indigo-500/30 text-center space-y-4 animate-pulse">
        <div className="w-12 h-12 rounded-full bg-indigo-950 border border-indigo-500/50 flex items-center justify-center mx-auto text-indigo-400">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-100">
            Async Evaluation in Progress ({evaluatorType} Mode)
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Status: <span className="font-mono text-indigo-400 font-semibold">{status}</span>.
            Evaluating your solution against all 8 low-level system design criteria...
          </p>
        </div>
      </div>
    );
  }

  // Status: Failed
  if (status === 'Failed') {
    return (
      <div className="glass-card rounded-xl p-6 border border-rose-500/40 bg-rose-950/20 space-y-4">
        <div className="flex items-center gap-3">
          <AlertOctagon className="w-6 h-6 text-rose-400 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-rose-200">Evaluation Job Failed</h3>
            <p className="text-xs text-rose-300/80">{errorMessage || 'An error occurred during evaluation processing.'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-all disabled:opacity-50"
          >
            <RotateCcw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>Retry Evaluation on SAME Submission</span>
          </button>
        </div>
      </div>
    );
  }

  if (!result) {
    return <div className="text-xs text-slate-400">Evaluation result pending...</div>;
  }

  const { overallSummary, strengths, improvementAreas, criterionScores } = result;

  const avgScore = (
    criterionScores.reduce((sum, cs) => sum + cs.score, 0) / (criterionScores.length || 1)
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Top Banner: Overall Score Summary */}
      <div className="glass-card rounded-xl p-6 border border-slate-800 space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full filter blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[1px]">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Evaluation Results</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800">
                  {evaluatorType} Evaluator
                </span>
              </div>
              <p className="text-xs text-slate-400">Multi-Criterion Rubric Feedback & Evidence Breakdown</p>
            </div>
          </div>

          {/* Average Rating Score */}
          <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">Average Rubric Score</span>
              <span className="text-xl font-bold font-mono bg-gradient-to-r from-indigo-400 to-purple-300 bg-clip-text text-transparent">
                {avgScore} / 5.0
              </span>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800/80 text-xs text-slate-200 leading-relaxed">
          <strong className="text-indigo-300 block mb-1 font-sans">Overall Architectural Summary:</strong>
          {overallSummary}
        </div>

        {/* Strengths & Improvement Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Strengths */}
          <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <Award className="w-4 h-4" />
              <span>Key Architectural Strengths</span>
            </div>
            <ul className="space-y-1 text-emerald-200/90 list-disc list-inside">
              {strengths.map((st, i) => (
                <li key={i}>{st}</li>
              ))}
            </ul>
          </div>

          {/* Improvement Areas */}
          <div className="p-4 bg-amber-950/20 border border-amber-500/20 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <Lightbulb className="w-4 h-4" />
              <span>Targeted Improvement Areas</span>
            </div>
            <ul className="space-y-1 text-amber-200/90 list-disc list-inside">
              {improvementAreas.map((imp, i) => (
                <li key={i}>{imp}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Tabs: Rubric Score Grid vs Evidence Inspector */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('rubric')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'rubric'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Criterion Scores & Suggestions (8 Dimensions)
        </button>

        <button
          onClick={() => setActiveTab('evidence')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'evidence'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Submission Evidence Highlighting
        </button>
      </div>

      {/* Tab Content 1: 8 Criterion Scores */}
      {activeTab === 'rubric' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {criterionScores.map((cs) => {
            const title = CRITERION_TITLES[cs.criterion] || cs.criterion;

            return (
              <div
                key={cs.id || cs.criterion}
                className="glass-card rounded-xl p-5 border border-slate-800 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                    <CriterionBadge criterion={cs.criterion} score={cs.score} />
                    <ConfidenceBadge confidence={cs.confidence} />
                  </div>

                  {/* Evidence Text Span */}
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 text-xs font-mono text-slate-300 leading-relaxed">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-sans block mb-1 font-semibold">
                      Cited Submission Evidence:
                    </span>
                    &quot;{cs.evidence}&quot;
                  </div>

                  {/* Concern if score < 4 */}
                  {cs.concern && (
                    <div className="p-2.5 bg-rose-950/30 border border-rose-500/30 rounded-lg text-xs text-rose-300 flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold block text-[11px]">Concern:</strong>
                        {cs.concern}
                      </div>
                    </div>
                  )}

                  {/* Actionable Suggestion */}
                  <div className="p-2.5 bg-indigo-950/30 border border-indigo-500/30 rounded-lg text-xs text-indigo-200 flex items-start gap-2">
                    <Lightbulb className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold block text-[11px] text-indigo-300">Suggestion for Improvement:</strong>
                      {cs.suggestion}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab Content 2: Interactive Evidence Highlighter */}
      {activeTab === 'evidence' && (
        <EvidenceHighlighter submissionText={submissionContent} criterionScores={criterionScores} />
      )}
    </div>
  );
};
