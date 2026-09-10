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
