import { prisma } from './prisma';
import { validateTransition } from '../domain/stateMachine';
import { EvaluatorFactory } from '../evaluators/EvaluatorFactory';

export async function processEvaluation(evaluationId: string): Promise<void> {
  const evaluation = await prisma.evaluation.findUnique({
    where: { id: evaluationId },
    include: {
      submission: {
        include: {
          attempt: {
            include: {
              problem: true,
            },
          },
        },
      },
    },
  });

  if (!evaluation) {
    throw new Error(`Evaluation ${evaluationId} not found.`);
  }

  // Guarded state transition: Queued | Failed -> Evaluating
  validateTransition('Evaluation', evaluation.status, 'Evaluating');

  await prisma.evaluation.update({
    where: { id: evaluationId },
    data: {
      status: 'Evaluating',
      errorMessage: null,
    },
  });

  try {
    const evaluator = EvaluatorFactory.getEvaluator(evaluation.evaluatorType);
    const resultData = await evaluator.evaluate(
      {
        id: evaluation.submission.id,
        attemptId: evaluation.submission.attemptId,
        format: evaluation.submission.format,
        content: evaluation.submission.content,
        submittedAt: evaluation.submission.submittedAt,
      },
      {
        title: evaluation.submission.attempt.problem.title,
        description: evaluation.submission.attempt.problem.description,
        constraints: evaluation.submission.attempt.problem.constraints,
      }
    );

    // Persist Evaluation Result and Criterion Scores (clearing old result if retry)
    const existingResult = await prisma.evaluationResult.findUnique({
      where: { evaluationId: evaluation.id },
      select: { id: true },
    });
    if (existingResult) {
      await prisma.criterionScore.deleteMany({
        where: { evaluationResultId: existingResult.id },
      });
      await prisma.evaluationResult.delete({
        where: { id: existingResult.id },
      });
    }

    const createdResult = await prisma.evaluationResult.create({

      data: {
        evaluationId: evaluation.id,
        overallSummary: resultData.overallSummary,
        strengths: JSON.stringify(resultData.strengths),
        improvementAreas: JSON.stringify(resultData.improvementAreas),
        criterionScores: {
          create: resultData.criterionScores.map((cs) => ({
            criterion: cs.criterion,
            score: cs.score,
            evidence: cs.evidence,
            concern: cs.concern,
            suggestion: cs.suggestion,
            confidence: cs.confidence,
          })),
        },
      },
    });

    // Guarded state transition: Evaluating -> Completed
    validateTransition('Evaluation', 'Evaluating', 'Completed');

    await prisma.evaluation.update({
      where: { id: evaluationId },
      data: {
        status: 'Completed',
        completedAt: new Date(),
      },
    });
  } catch (error: any) {
    const errMessage = error?.message || 'Unknown evaluation failure';
    console.error(`Evaluation ${evaluationId} failed:`, errMessage);

    // Guarded state transition: Evaluating -> Failed
    try {
      validateTransition('Evaluation', 'Evaluating', 'Failed');
      await prisma.evaluation.update({
        where: { id: evaluationId },
        data: {
          status: 'Failed',
          errorMessage: errMessage,
        },
      });
    } catch (transErr) {
      console.error(`Failed to transition evaluation ${evaluationId} to Failed:`, transErr);
    }
  }
}

export async function getEvaluationStatus(attemptId: string) {
  const latestSubmission = await prisma.submission.findFirst({
    where: { attemptId },
    orderBy: { submittedAt: 'desc' },
    include: {
      evaluation: true,
    },
  });

  if (!latestSubmission || !latestSubmission.evaluation) {
    return null;
  }

  return {
    submissionId: latestSubmission.id,
    evaluationId: latestSubmission.evaluation.id,
    status: latestSubmission.evaluation.status,
    evaluatorType: latestSubmission.evaluation.evaluatorType,
    errorMessage: latestSubmission.evaluation.errorMessage,
    createdAt: latestSubmission.evaluation.createdAt,
    completedAt: latestSubmission.evaluation.completedAt,
  };
}

export async function getSubmissionEvaluation(submissionId: string) {
  const evaluation = await prisma.evaluation.findUnique({
    where: { submissionId },
    include: {
      result: {
        include: {
          criterionScores: true,
        },
      },
      submission: {
        include: {
          attempt: {
            include: {
              problem: true,
            },
          },
        },
      },
    },
  });

  if (!evaluation || !evaluation.result) {
    return null;
  }

  return {
    ...evaluation,
    result: {
      ...evaluation.result,
      strengths: JSON.parse(evaluation.result.strengths),
      improvementAreas: JSON.parse(evaluation.result.improvementAreas),
    },
  };
}

export async function retryEvaluation(evaluationId: string) {
  const evaluation = await prisma.evaluation.findUnique({
    where: { id: evaluationId },
  });

  if (!evaluation) {
    throw new Error(`Evaluation ${evaluationId} not found.`);
  }

  if (evaluation.status !== 'Failed') {
    throw new Error(`Only Failed evaluations can be retried. Current status: ${evaluation.status}`);
  }

  // Delete old evaluation result if exists
  await prisma.evaluationResult.deleteMany({
    where: { evaluationId },
  });

  // Transition Failed -> Evaluating
  validateTransition('Evaluation', 'Failed', 'Evaluating');

  // Trigger evaluation execution
  setImmediate(() => {
    processEvaluation(evaluationId).catch((err) =>
      console.error(`Retry execution error for ${evaluationId}:`, err)
    );
  });

  return { message: 'Evaluation retry initiated', evaluationId };
}
