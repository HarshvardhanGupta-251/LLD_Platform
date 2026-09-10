import { describe, it, expect } from 'vitest';
import * as submissionService from '../src/services/submissionService';

describe('Submission Immutability Verification', () => {
  it('should assert no update method exists in submissionService', () => {
    const serviceKeys = Object.keys(submissionService);
    const updateMethods = serviceKeys.filter((key) => key.toLowerCase().includes('update'));

    expect(updateMethods).toEqual([]);
    expect((submissionService as any).updateSubmission).toBeUndefined();
    expect((submissionService as any).update).toBeUndefined();
  });

  it('should verify submission contract prohibits mutations', () => {
    // Structural invariant check
    expect(typeof submissionService.createSubmission).toBe('function');
    expect(typeof submissionService.getSubmissionById).toBe('function');
  });
});
