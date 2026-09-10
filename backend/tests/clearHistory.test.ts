import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../src/services/prisma';
import { createAttempt, getLearnerAttempts, clearLearnerAttempts } from '../src/services/attemptService';
import { createSubmission } from '../src/services/submissionService';

describe('Clear Learner Practice History Test', () => {
  let problemId: string;
  const learnerId = 'learner-clear-history-test';

  beforeAll(async () => {
    const problem = await prisma.problem.create({
      data: {
        title: 'Problem for Clear History Test',
        description: 'Test problem description.',
        constraints: 'None',
        difficulty: 'Easy',
        tags: JSON.stringify(['Test']),
      },
    });
    problemId = problem.id;

    // Create 2 attempts with submissions
    const attempt1 = await createAttempt(problemId, learnerId);
    await createSubmission({
      attemptId: attempt1.id,
      content: 'class Solution1 { public run() { return true; } }',
      evaluatorType: 'RuleBased',
    });

    const attempt2 = await createAttempt(problemId, learnerId);
    await createSubmission({
      attemptId: attempt2.id,
      content: 'class Solution2 { public run() { return true; } }',
      evaluatorType: 'RuleBased',
    });
  });

  afterAll(async () => {
    await clearLearnerAttempts(learnerId);
    await prisma.problem.deleteMany({ where: { title: 'Problem for Clear History Test' } });
    await prisma.$disconnect();
  });

  it('should verify attempts exist for learner, then delete all history cleanly', async () => {
    // Initial state: 2 attempts
    const beforeAttempts = await getLearnerAttempts(learnerId);
    expect(beforeAttempts.length).toBe(2);

    // Call clearLearnerAttempts
    const result = await clearLearnerAttempts(learnerId);
    expect(result.count).toBe(2);

    // After state: 0 attempts
    const afterAttempts = await getLearnerAttempts(learnerId);
    expect(afterAttempts.length).toBe(0);

    // Calling again when empty should safely return count 0
    const emptyResult = await clearLearnerAttempts(learnerId);
    expect(emptyResult.count).toBe(0);
  });
});
