import { prisma } from './prisma';

export async function getAllProblems() {
  const problems = await prisma.problem.findMany({
    orderBy: { createdAt: 'asc' },
  });
  return problems.map((p) => ({
    ...p,
    tags: p.tags ? JSON.parse(p.tags) : [],
  }));
}

export async function getProblemById(id: string) {
  const problem = await prisma.problem.findUnique({
    where: { id },
  });
  if (!problem) return null;
  return {
    ...problem,
    tags: problem.tags ? JSON.parse(problem.tags) : [],
  };
}
