import { prisma } from './prisma';

export async function createAttempt(problemId: string, learnerId: string = 'learner-default') {
  const problem = await prisma.problem.findUnique({ where: { id: problemId } });
  if (!problem) {
    throw new Error(`Problem with ID ${problemId} not found.`);
  }

  const attempt = await prisma.attempt.create({
    data: {
      problemId,
      learnerId,
      status: 'InProgress',
    },
    include: {
      problem: true,
    },
  });

  return attempt;
}

export async function getAttempt(id: string) {
  const attempt = await prisma.attempt.findUnique({
    where: { id },
    include: {
      problem: true,
      submissions: {
        orderBy: { submittedAt: 'desc' },
        include: {
          evaluation: {
            include: {
              result: {
                include: {
                  criterionScores: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!attempt) return null;

  return {
    ...attempt,
    problem: {
      ...attempt.problem,
      tags: attempt.problem.tags ? JSON.parse(attempt.problem.tags) : [],
    },
  };
}

export async function getLearnerAttempts(learnerId: string) {
  const attempts = await prisma.attempt.findMany({
    where: { learnerId },
    orderBy: { startedAt: 'desc' },
    include: {
      problem: true,
      submissions: {
        orderBy: { submittedAt: 'asc' },
        include: {
          evaluation: {
            include: {
              result: {
                include: {
                  criterionScores: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return attempts.map((attempt) => ({
    ...attempt,
    problem: {
      ...attempt.problem,
      tags: attempt.problem.tags ? JSON.parse(attempt.problem.tags) : [],
    },
  }));
}

export async function clearLearnerAttempts(learnerId: string = 'learner-default') {
  const attempts = await prisma.attempt.findMany({
    where: { learnerId },
    select: { id: true },
  });

  const attemptIds = attempts.map((a) => a.id);
  if (attemptIds.length === 0) {
    return { count: 0 };
  }

  return await prisma.$transaction(async (tx) => {
    const submissions = await tx.submission.findMany({
      where: { attemptId: { in: attemptIds } },
      select: { id: true },
    });
    const subIds = submissions.map((s) => s.id);

    if (subIds.length > 0) {
      const evaluations = await tx.evaluation.findMany({
        where: { submissionId: { in: subIds } },
        select: { id: true },
      });
      const evalIds = evaluations.map((e) => e.id);

      if (evalIds.length > 0) {
        const results = await tx.evaluationResult.findMany({
          where: { evaluationId: { in: evalIds } },
          select: { id: true },
        });
        const resultIds = results.map((r) => r.id);

        if (resultIds.length > 0) {
          await tx.criterionScore.deleteMany({
            where: { evaluationResultId: { in: resultIds } },
          });
          await tx.evaluationResult.deleteMany({
            where: { id: { in: resultIds } },
          });
        }

        await tx.evaluation.deleteMany({
          where: { id: { in: evalIds } },
        });
      }

      await tx.submission.deleteMany({
        where: { id: { in: subIds } },
      });
    }

    const deleteResult = await tx.attempt.deleteMany({
      where: { id: { in: attemptIds } },
    });

    return deleteResult;
  });
}

