import { prisma } from './prisma';
import { processEvaluation } from './evaluationService';
import { validateTransition } from '../domain/stateMachine';

export interface CreateSubmissionInput {
  attemptId: string;
  format?: string;
  content: string;
  idempotencyKey?: string;
  evaluatorType?: 'RuleBased' | 'AI' | 'Hybrid';
}

export async function createSubmission(input: CreateSubmissionInput) {
  const { attemptId, format = 'Text', content, idempotencyKey, evaluatorType = 'AI' } = input;

  if (!content || content.trim().length === 0) {
    throw new Error('Submission content cannot be empty.');
  }

  // 1. Idempotency Check: if idempotencyKey is provided, check if already processed
  if (idempotencyKey && idempotencyKey.trim().length > 0) {
    const existingSubmission = await prisma.submission.findUnique({
      where: { idempotencyKey },
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
    });

    if (existingSubmission) {
      return {
        submission: existingSubmission,
        evaluation: existingSubmission.evaluation,
        isDuplicate: true,
      };
    }
  }

  // 2. Validate Attempt exists and transition status
  const attempt = await prisma.attempt.findUnique({ where: { id: attemptId } });
  if (!attempt) {
    throw new Error(`Attempt ${attemptId} not found.`);
  }

  if (attempt.status === 'InProgress') {
    validateTransition('Attempt', attempt.status, 'Submitted');
    await prisma.attempt.update({
      where: { id: attemptId },
      data: { status: 'Submitted' },
    });
  }

  // 3. Create NEW Submission row (IMMUTABLE - insert only)
  const submission = await prisma.submission.create({
    data: {
      attemptId,
      format,
      content,
      idempotencyKey: idempotencyKey && idempotencyKey.trim().length > 0 ? idempotencyKey : null,
    },
  });

  // 4. Create Evaluation row in Queued status
  const evaluation = await prisma.evaluation.create({
    data: {
      submissionId: submission.id,
      status: 'Queued',
      evaluatorType,
    },
  });

  // 5. Trigger Async Background Evaluation (fire-and-forget, non-blocking)
  setImmediate(() => {
    processEvaluation(evaluation.id).catch((err) => {
      console.error(`Background evaluation process error for ${evaluation.id}:`, err);
    });
  });

  return {
    submission,
    evaluation,
    isDuplicate: false,
  };
}

export async function getSubmissionById(id: string) {
  return await prisma.submission.findUnique({
    where: { id },
    include: {
      attempt: {
        include: { problem: true },
      },
      evaluation: {
        include: {
          result: {
            include: { criterionScores: true },
          },
        },
      },
    },
  });
}
