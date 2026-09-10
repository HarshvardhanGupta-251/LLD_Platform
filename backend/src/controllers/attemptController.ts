import { Request, Response } from 'express';
import * as attemptService from '../services/attemptService';
import * as submissionService from '../services/submissionService';
import * as evaluationService from '../services/evaluationService';

export async function createAttempt(req: Request, res: Response) {
  try {
    const { problemId, learnerId } = req.body;
    if (!problemId) {
      return res.status(400).json({ success: false, error: 'problemId is required' });
    }
    const attempt = await attemptService.createAttempt(problemId, learnerId);
    res.status(201).json({ success: true, data: attempt });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function getAttempt(req: Request, res: Response) {
  try {
    const attempt = await attemptService.getAttempt(req.params.id);
    if (!attempt) {
      return res.status(404).json({ success: false, error: 'Attempt not found' });
    }
    res.json({ success: true, data: attempt });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function submitSolution(req: Request, res: Response) {
  try {
    const attemptId = req.params.id;
    const { format = 'Text', content, idempotencyKey, evaluatorType } = req.body;

    const result = await submissionService.createSubmission({
      attemptId,
      format,
      content,
      idempotencyKey,
      evaluatorType,
    });

    res.status(result.isDuplicate ? 200 : 201).json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function getEvaluationStatus(req: Request, res: Response) {
  try {
    const attemptId = req.params.id;
    const statusData = await evaluationService.getEvaluationStatus(attemptId);
    if (!statusData) {
      return res.status(404).json({ success: false, error: 'No evaluation found for attempt' });
    }
    res.json({ success: true, data: statusData });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
