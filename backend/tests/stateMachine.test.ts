import { describe, it, expect } from 'vitest';
import { canTransition, validateTransition } from '../src/domain/stateMachine';

describe('State Machine Domain Logic', () => {
  describe('Attempt Status Transitions', () => {
    it('should allow valid transition from InProgress to Submitted', () => {
      expect(canTransition('Attempt', 'InProgress', 'Submitted')).toBe(true);
      expect(() => validateTransition('Attempt', 'InProgress', 'Submitted')).not.toThrow();
    });

    it('should disallow invalid transition from Submitted back to InProgress', () => {
      expect(canTransition('Attempt', 'Submitted', 'InProgress')).toBe(false);
      expect(() => validateTransition('Attempt', 'Submitted', 'InProgress')).toThrow(
        "Invalid Attempt state transition from 'Submitted' to 'InProgress'"
      );
    });

    it('should disallow transition from unknown attempt status', () => {
      expect(canTransition('Attempt', 'InvalidStatus', 'Submitted')).toBe(false);
    });
  });

  describe('Evaluation Status Transitions', () => {
    it('should allow valid transition sequence: Queued -> Evaluating -> Completed', () => {
      expect(canTransition('Evaluation', 'Queued', 'Evaluating')).toBe(true);
      expect(canTransition('Evaluation', 'Evaluating', 'Completed')).toBe(true);
    });

    it('should allow valid transition sequence: Queued -> Evaluating -> Failed -> Evaluating', () => {
      expect(canTransition('Evaluation', 'Queued', 'Evaluating')).toBe(true);
      expect(canTransition('Evaluation', 'Evaluating', 'Failed')).toBe(true);
      expect(canTransition('Evaluation', 'Failed', 'Evaluating')).toBe(true); // Retry transition
    });

    it('should disallow invalid transition directly from Queued to Completed', () => {
      expect(canTransition('Evaluation', 'Queued', 'Completed')).toBe(false);
      expect(() => validateTransition('Evaluation', 'Queued', 'Completed')).toThrow(
        "Invalid Evaluation state transition from 'Queued' to 'Completed'"
      );
    });

    it('should disallow transition from Completed to Evaluating', () => {
      expect(canTransition('Evaluation', 'Completed', 'Evaluating')).toBe(false);
    });
  });
});
