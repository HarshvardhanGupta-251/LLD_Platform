import React, { useEffect, useState, useRef } from 'react';
import { Problem, Attempt, Submission, Evaluation } from '../types';
import { api } from '../services/api';
import { SolutionEditor } from '../components/SolutionEditor';
import { EvaluationView } from '../components/EvaluationView';
import { RetryDiffView } from '../components/RetryDiffView';
import { CRITERION_TITLES } from '../components/CriterionBadge';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Clock,
  Sparkles,
  History,
  FileCode,
  Tag,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';

interface ProblemDetailPageProps {
  problem: Problem;
  onBack: () => void;
}

export const ProblemDetailPage: React.FC<ProblemDetailPageProps> = ({ problem, onBack }) => {
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [activeSubmission, setActiveSubmission] = useState<Submission | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loadingAttempt, setLoadingAttempt] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'editor' | 'evaluation' | 'diff'>('editor');

  const pollingRef = useRef<any>(null);

  // Initialize or fetch attempt
  useEffect(() => {
    async function initAttempt() {
      try {
        setLoadingAttempt(true);
        const newAttempt = await api.createAttempt(problem.id, 'learner-default');
        setAttempt(newAttempt);

        // Fetch full attempt details if existing submissions exist
        const fullAttempt = await api.getAttempt(newAttempt.id);
        setAttempt(fullAttempt);

        if (fullAttempt?.submissions && fullAttempt.submissions.length > 0) {
          const latest = fullAttempt.submissions[0];
          setActiveSubmission(latest);
          if (latest.evaluation) {
            setEvaluation(latest.evaluation);
            if (latest.evaluation.status === 'Completed' || latest.evaluation.status === 'Failed') {
              setActiveTab('evaluation');
            }
          }
        }
      } catch (err: any) {
        console.error('Error starting attempt:', err);
      } finally {
        setLoadingAttempt(false);
      }
    }

    initAttempt();

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [problem.id]);

  // Polling hook for Evaluation status
  const startStatusPolling = (attemptId: string, submissionId: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const statusData = await api.getEvaluationStatus(attemptId);
        if (!statusData) return;

        if (statusData.status === 'Completed' || statusData.status === 'Failed') {
          if (pollingRef.current) clearInterval(pollingRef.current);
          pollingRef.current = null;

          // Fetch complete evaluation result
          const fullEval = await api.getSubmissionEvaluation(submissionId);
          setEvaluation(fullEval);
          setIsSubmitting(false);
          setActiveTab('evaluation');

          // Refresh attempt details
          const updatedAttempt = await api.getAttempt(attemptId);
          setAttempt(updatedAttempt);
        } else {
          setEvaluation((prev) =>
            prev
              ? { ...prev, status: statusData.status }
              : ({
                  id: statusData.evaluationId,
                  submissionId,
                  status: statusData.status,
                  evaluatorType: statusData.evaluatorType as any,
                  createdAt: new Date().toISOString(),
                } as Evaluation)
          );
        }
      } catch (err) {
        console.error('Polling evaluation status error:', err);
      }
    }, 2000);
  };

  const handleSubmitSolution = async (
    content: string,
    idempotencyKey: string,
    evaluatorType: 'AI' | 'RuleBased' | 'Hybrid'
  ) => {
    if (!attempt) return;
    setIsSubmitting(true);

    try {
      const res = await api.submitSolution(attempt.id, content, idempotencyKey, evaluatorType);

      setActiveSubmission(res.submission);
      setEvaluation(res.evaluation);

      // Start polling status endpoint asynchronously
      startStatusPolling(attempt.id, res.submission.id);
    } catch (err: any) {
      setIsSubmitting(false);
      throw err;
    }
  };

  const handleRetryEvaluation = async (evalId: string) => {
    try {
      await api.retryEvaluation(evalId);
      if (attempt && activeSubmission) {
        setEvaluation((prev) => (prev ? { ...prev, status: 'Evaluating' } : null));
        startStatusPolling(attempt.id, activeSubmission.id);
      }
    } catch (err: any) {
      console.error('Retry evaluation failed:', err);
    }
  };

  const previousSubmission =
    attempt?.submissions && attempt.submissions.length > 1
      ? attempt.submissions[1]
      : undefined;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">{problem.title}</h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800">
                {problem.difficulty}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">Attempt ID: {attempt?.id || '...'}</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'editor'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Solution Workspace
          </button>

          <button
            onClick={() => setActiveTab('evaluation')}
            disabled={!evaluation}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'evaluation'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 disabled:opacity-40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            AI Feedback View
          </button>

          {previousSubmission && (
            <button
              onClick={() => setActiveTab('diff')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'diff'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retry Diff & Delta
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Problem Description & Requirements (5 cols) */}
        <div className="lg:col-span-5 glass-card rounded-xl p-6 border border-slate-800 space-y-6 max-h-[85vh] overflow-y-auto">
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              Problem Requirements & Description
            </h2>
            <div className="whitespace-pre-wrap text-xs text-slate-300 leading-relaxed font-sans bg-slate-950 p-4 rounded-xl border border-slate-800/80">
              {problem.description}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Constraints & Scale</h3>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 font-mono">
              {problem.constraints}
            </div>
          </div>

          {/* 8-Criterion Evaluation Rubric Anchors Guide */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              8-Criterion Evaluation Rubric Reference
            </h3>

            <div className="space-y-2">
              {[
                { name: 'Requirement Understanding', anchor: 'Score 5: Explicit bounds, edge cases, and scale constraints.' },
                { name: 'Responsibility Assignment (SRP)', anchor: 'Score 5: Single clear role per entity, bounded context.' },
                { name: 'Coupling & Cohesion', anchor: 'Score 5: Interface injection, high cohesion within domain models.' },
                { name: 'Encapsulation', anchor: 'Score 5: Hidden internal state mutated via rich domain methods.' },
                { name: 'Abstraction & Patterns', anchor: 'Score 5: Judicious design pattern (Strategy/State/Factory) usage.' },
                { name: 'Extensibility (Open/Closed)', anchor: 'Score 5: Adding new features without editing core engine code.' },
                { name: 'Edge Case & Concurrency', anchor: 'Score 5: Explicit thread-safety locks and error degradation.' },
                { name: 'Explanation Quality', anchor: 'Score 5: Detailed design rationales and trade-off choices.' },
              ].map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60 text-[11px] space-y-0.5">
                  <div className="font-semibold text-indigo-300">{item.name}</div>
                  <div className="text-slate-400">{item.anchor}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Editor / Evaluation Results (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {activeTab === 'editor' && (
            <SolutionEditor
              problemTitle={problem.title}
              problemDescription={problem.description}
              onSubmitSolution={handleSubmitSolution}
              isSubmitting={isSubmitting}
            />
          )}

          {activeTab === 'evaluation' && evaluation && activeSubmission && (
            <EvaluationView
              evaluation={evaluation}
              submissionContent={activeSubmission.content}
              onRetryEvaluation={handleRetryEvaluation}
            />
          )}

          {activeTab === 'diff' && activeSubmission && previousSubmission && (
            <RetryDiffView
              currentSubmission={activeSubmission}
              previousSubmission={previousSubmission}
            />
          )}
        </div>
      </div>
    </div>
  );
};
