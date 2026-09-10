import React, { useEffect, useState, useRef } from 'react';
import { Problem, Attempt, Submission, Evaluation } from '../types';
import { api } from '../services/api';
import { SolutionEditor } from '../components/SolutionEditor';
import { EvaluationView } from '../components/EvaluationView';
import { RetryDiffView } from '../components/RetryDiffView';
import {
  ArrowLeft,
  BookOpen,
  Sparkles,
  FileCode,
  Tag,
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

  useEffect(() => {
    async function initAttempt() {
      try {
        setLoadingAttempt(true);
        const newAttempt = await api.createAttempt(problem.id, 'learner-default');
        setAttempt(newAttempt);
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
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [problem.id]);

  const startStatusPolling = (attemptId: string, submissionId: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      try {
        const statusData = await api.getEvaluationStatus(attemptId);
        if (!statusData) return;
        if (statusData.status === 'Completed' || statusData.status === 'Failed') {
          if (pollingRef.current) clearInterval(pollingRef.current);
          pollingRef.current = null;
          const fullEval = await api.getSubmissionEvaluation(submissionId);
          setEvaluation(fullEval);
          setIsSubmitting(false);
          setActiveTab('evaluation');
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
        console.error('Polling error:', err);
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
      console.error('Retry failed:', err);
    }
  };

  const previousSubmission =
    attempt?.submissions && attempt.submissions.length > 1
      ? attempt.submissions[1]
      : undefined;

  const difficultyColor =
    problem.difficulty === 'Hard'
      ? 'text-rose-400 border-rose-500/30 bg-rose-500/10'
      : problem.difficulty === 'Medium'
      ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
      : 'text-sky-400 border-sky-500/30 bg-sky-500/10';

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-5">

        {/* ── Top Header Bar ── */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white">{problem.title}</h1>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${difficultyColor}`}>
                  {problem.difficulty}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Attempt ID: {attempt?.id || '...'}
              </p>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/[0.08]">
            {([
              { id: 'editor', label: 'Solution Workspace', icon: <FileCode className="w-3.5 h-3.5" /> },
              { id: 'evaluation', label: 'AI Feedback View', icon: <Sparkles className="w-3.5 h-3.5" />, disabled: !evaluation },
              ...(previousSubmission ? [{ id: 'diff', label: 'Retry Diff & Delta', icon: <RotateCcw className="w-3.5 h-3.5" /> }] : []),
            ] as any[]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                disabled={tab.disabled}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Main Split Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

          {/* Left: Problem panel */}
          <div className="lg:col-span-5 rounded-2xl border border-white/[0.07] bg-white/[0.03] overflow-hidden max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="px-5 pt-4 pb-3 border-b border-white/[0.05] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Problem Requirements &amp; Description
              </h2>
            </div>

            <div className="px-5 py-4 space-y-5">
              {/* Description */}
              <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans bg-black/20 p-4 rounded-xl border border-white/[0.05]">
                {problem.description}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {problem.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/5 text-slate-400 border border-white/8 text-[11px]"
                  >
                    <Tag className="w-2.5 h-2.5" />
                    {tag}
                  </span>
                ))}
              </div>

              {/* Constraints */}
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Constraints &amp; Scale
                </p>
                <div className="p-3 bg-black/20 rounded-xl border border-white/[0.05] text-xs text-slate-300 font-mono leading-relaxed">
                  {problem.constraints}
                </div>
              </div>

              {/* 8-Criterion guide */}
              <div>
                <div className="flex items-center gap-1.5 mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    8-Criterion Evaluation Rubric Reference
                  </p>
                </div>
                <div className="space-y-1.5">
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
                    <div key={idx} className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px]">
                      <div className="font-semibold text-indigo-300 mb-0.5">{item.name}</div>
                      <div className="text-slate-500">{item.anchor}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Editor / Results */}
          <div className="lg:col-span-7 space-y-5">
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
    </div>
  );
};
