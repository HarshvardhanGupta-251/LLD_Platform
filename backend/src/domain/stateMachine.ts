export type AttemptStatus = 'InProgress' | 'Submitted';
export type EvaluationStatus = 'Queued' | 'Evaluating' | 'Completed' | 'Failed';

export const ATTEMPT_TRANSITIONS: Record<AttemptStatus, AttemptStatus[]> = {
  InProgress: ['Submitted'],
  Submitted: [],
};

export const EVALUATION_TRANSITIONS: Record<EvaluationStatus, EvaluationStatus[]> = {
  Queued: ['Evaluating'],
  Evaluating: ['Completed', 'Failed'],
  Completed: [],
  Failed: ['Evaluating'],
};

/**
 * Single guarded function to validate state transitions.
 * Prevents arbitrary string writes for domain statuses.
 */
export function canTransition(
  entity: 'Attempt' | 'Evaluation',
  fromState: string,
  toState: string
): boolean {
  if (fromState === toState) return true;

  if (entity === 'Attempt') {
    const validNext = ATTEMPT_TRANSITIONS[fromState as AttemptStatus];
    return validNext ? validNext.includes(toState as AttemptStatus) : false;
  }

  if (entity === 'Evaluation') {
    const validNext = EVALUATION_TRANSITIONS[fromState as EvaluationStatus];
    return validNext ? validNext.includes(toState as EvaluationStatus) : false;
  }

  return false;
}

export function validateTransition(
  entity: 'Attempt' | 'Evaluation',
  fromState: string,
  toState: string
): void {
  if (!canTransition(entity, fromState, toState)) {
    throw new Error(`Invalid ${entity} state transition from '${fromState}' to '${toState}'`);
  }
}
