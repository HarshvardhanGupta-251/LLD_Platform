import { Criterion } from '../domain/rubric';

export interface SubmissionData {
  id: string;
  attemptId: string;
  format: string;
  content: string;
  submittedAt: Date;
  problemTitle?: string;
  problemDescription?: string;
}

export interface CriterionScoreData {
  criterion: Criterion;
  score: number; // 1-5
  evidence: string;
  concern: string | null;
  suggestion: string;
  confidence: number; // 0.0 - 1.0
}

export interface EvaluationResultData {
  overallSummary: string;
  strengths: string[];
  improvementAreas: string[];
  criterionScores: CriterionScoreData[];
}

export interface Evaluator {
  evaluate(submission: SubmissionData, problemContext?: { title: string; description: string; constraints: string }): Promise<EvaluationResultData>;
}
