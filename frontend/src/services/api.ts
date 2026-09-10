import { Problem, Attempt, Submission, Evaluation } from '../types';

const ENV_URL = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
const API_BASE = ENV_URL
  ? (ENV_URL.endsWith('/api') ? ENV_URL : `${ENV_URL.replace(/\/$/, '')}/api`)
  : '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || `HTTP error ${res.status}`);
  }
  return json.data;
}

export const api = {
  // Problems
  getProblems: () => fetchJson<Problem[]>('/problems'),
  getProblem: (id: string) => fetchJson<Problem>(`/problems/${id}`),

  // Attempts
  createAttempt: (problemId: string, learnerId: string = 'learner-default') =>
    fetchJson<Attempt>('/attempts', {
      method: 'POST',
      body: JSON.stringify({ problemId, learnerId }),
    }),
  getAttempt: (id: string) => fetchJson<Attempt>(`/attempts/${id}`),

  // Submissions
  submitSolution: (
    attemptId: string,
    content: string,
    idempotencyKey?: string,
    evaluatorType: 'RuleBased' | 'AI' | 'Hybrid' = 'AI'
  ) =>
    fetchJson<{ submission: Submission; evaluation: Evaluation; isDuplicate: boolean }>(
      `/attempts/${attemptId}/submissions`,
      {
        method: 'POST',
        body: JSON.stringify({
          format: 'Text',
          content,
          idempotencyKey,
          evaluatorType,
        }),
      }
    ),

  // Evaluations
  getEvaluationStatus: (attemptId: string) =>
    fetchJson<{
      submissionId: string;
      evaluationId: string;
      status: 'Queued' | 'Evaluating' | 'Completed' | 'Failed';
      evaluatorType: string;
      errorMessage?: string;
    }>(`/attempts/${attemptId}/evaluation-status`),

  getSubmissionEvaluation: (submissionId: string) =>
    fetchJson<Evaluation>(`/submissions/${submissionId}/evaluation`),

  retryEvaluation: (evaluationId: string) =>
    fetchJson<{ message: string; evaluationId: string }>(`/evaluations/${evaluationId}/retry`, {
      method: 'POST',
    }),

  // Learner History
  getLearnerAttempts: (learnerId: string = 'learner-default') =>
    fetchJson<Attempt[]>(`/learners/${learnerId}/attempts`),

  clearLearnerAttempts: (learnerId: string = 'learner-default') =>
    fetchJson<{ count: number }>(`/learners/${learnerId}/attempts`, {
      method: 'DELETE',
    }),
};

