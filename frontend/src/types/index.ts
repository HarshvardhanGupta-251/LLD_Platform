export type Criterion =
  | 'RequirementUnderstanding'
  | 'ResponsibilityAssignment'
  | 'CouplingCohesion'
  | 'Encapsulation'
  | 'AbstractionUsage'
  | 'Extensibility'
  | 'EdgeCaseHandling'
  | 'ExplanationQuality';

export interface Problem {
  id: string;
  title: string;
  description: string;
  constraints: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  createdAt: string;
}

export interface Attempt {
  id: string;
  problemId: string;
  learnerId: string;
  status: 'InProgress' | 'Submitted';
  startedAt: string;
  completedAt?: string;
  problem?: Problem;
  submissions?: Submission[];
}

export interface Submission {
  id: string;
  attemptId: string;
  format: 'Text';
  content: string;
  idempotencyKey?: string;
  submittedAt: string;
  evaluation?: Evaluation;
}

export interface Evaluation {
  id: string;
  submissionId: string;
  status: 'Queued' | 'Evaluating' | 'Completed' | 'Failed';
  evaluatorType: 'RuleBased' | 'AI' | 'Hybrid';
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
  result?: EvaluationResult;
}

export interface EvaluationResult {
  id: string;
  evaluationId: string;
  overallSummary: string;
  strengths: string[];
  improvementAreas: string[];
  criterionScores: CriterionScore[];
}

export interface CriterionScore {
  id: string;
  evaluationResultId: string;
  criterion: Criterion;
  score: number; // 1-5
  evidence: string;
  concern?: string | null;
  suggestion: string;
  confidence: number; // 0.0 - 1.0
}
