import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../src/services/prisma';
import { createAttempt } from '../src/services/attemptService';
import { createSubmission } from '../src/services/submissionService';

describe('Idempotent Submit Integration Test', () => {
  let problemId: string;
  let attemptId: string;

  beforeAll(async () => {
    // Create seed problem
    const problem = await prisma.problem.create({
      data: {
        title: 'Test Problem for Idempotency',
        description: 'Test problem description for unit test.',
        constraints: 'None',
        difficulty: 'Easy',
        tags: JSON.stringify(['Test']),
      },
    });
    problemId = problem.id;

    const attempt = await createAttempt(problemId, 'learner-test');
    attemptId = attempt.id;
  });

  afterAll(async () => {
    await prisma.problem.deleteMany({ where: { title: 'Test Problem for Idempotency' } });
    await prisma.$disconnect();
  });

  it('should return existing submission and produce exactly 1 evaluation row on duplicate idempotencyKey', async () => {
    const idempotencyKey = `key-${Date.now()}-${Math.random()}`;
    const solutionContent = 'class TestParkingLot { public allocateSpot() { return new Spot(); } }';

    // First submission request
    const res1 = await createSubmission({
      attemptId,
      content: solutionContent,
      idempotencyKey,
      evaluatorType: 'RuleBased',
    });

    expect(res1.isDuplicate).toBe(false);
    expect(res1.submission.idempotencyKey).toBe(idempotencyKey);

    // Duplicate submission request with SAME idempotencyKey
    const res2 = await createSubmission({
      attemptId,
      content: solutionContent,
      idempotencyKey,
      evaluatorType: 'RuleBased',
    });

    expect(res2.isDuplicate).toBe(true);
    expect(res2.submission.id).toBe(res1.submission.id);
    expect(res2.evaluation?.id).toBe(res1.evaluation?.id);

    // Verify DB count: exactly 1 Submission with this key
    const submissionCount = await prisma.submission.count({
      where: { idempotencyKey },
    });
    expect(submissionCount).toBe(1);

    // Verify DB count: exactly 1 Evaluation linked to this submission
    const evaluationCount = await prisma.evaluation.count({
      where: { submissionId: res1.submission.id },
    });
    expect(evaluationCount).toBe(1);
  });
});
