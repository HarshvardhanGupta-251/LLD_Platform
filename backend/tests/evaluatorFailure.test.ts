import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { prisma } from '../src/services/prisma';
import { createAttempt } from '../src/services/attemptService';
import { createSubmission } from '../src/services/submissionService';
import { processEvaluation, retryEvaluation } from '../src/services/evaluationService';
import { AIEvaluator } from '../src/evaluators/AIEvaluator';

describe('Evaluator Failure & Recovery Path', () => {
  let problemId: string;
  let attemptId: string;

  beforeAll(async () => {
    const problem = await prisma.problem.create({
      data: {
        title: 'Test Problem for Failure Path',
        description: 'Test description for failure recovery unit test.',
        constraints: 'None',
        difficulty: 'Easy',
        tags: JSON.stringify(['Test']),
      },
    });
    problemId = problem.id;

    const attempt = await createAttempt(problemId, 'learner-test-fail');
    attemptId = attempt.id;
  });

  afterAll(async () => {
    await prisma.problem.deleteMany({ where: { title: 'Test Problem for Failure Path' } });
    await prisma.$disconnect();
  });

  it('should transition Evaluation to Failed status when evaluator throws an error', async () => {
    // Mock AIEvaluator.evaluate to throw error
    const evaluateSpy = vi.spyOn(AIEvaluator.prototype, 'evaluate').mockRejectedValueOnce(
      new Error('Simulated LLM API Timeout Error')
    );

    const { submission, evaluation } = await createSubmission({
      attemptId,
      content: 'class ErrorTestSolution { public execute() {} }',
      evaluatorType: 'AI',
    });

    // Execute evaluation synchronously for test assertion
    await processEvaluation(evaluation.id);

    // Fetch updated evaluation from DB
    const updatedEval = await prisma.evaluation.findUnique({
      where: { id: evaluation.id },
    });

    expect(updatedEval?.status).toBe('Failed');
    expect(updatedEval?.errorMessage).toContain('Simulated LLM API Timeout Error');

    evaluateSpy.mockRestore();
  });

  it('should allow retrying a Failed evaluation on the SAME submission', async () => {
    // Create a failed evaluation entry directly
    const submission = await prisma.submission.create({
      data: {
        attemptId,
        content: 'class RetryTestSolution { public run() {} }',
      },
    });

    const failedEval = await prisma.evaluation.create({
      data: {
        submissionId: submission.id,
        status: 'Failed',
        evaluatorType: 'RuleBased',
        errorMessage: 'Prior failure',
      },
    });

    // Retry evaluation
    const result = await retryEvaluation(failedEval.id);
    expect(result.evaluationId).toBe(failedEval.id);

    // Process evaluation successfully
    await processEvaluation(failedEval.id);

    const completedEval = await prisma.evaluation.findUnique({
      where: { id: failedEval.id },
    });

    expect(completedEval?.status).toBe('Completed');
    expect(completedEval?.errorMessage).toBeNull();
  });
});

