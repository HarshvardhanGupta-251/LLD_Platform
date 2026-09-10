import { Request, Response } from 'express';
import * as evaluationService from '../services/evaluationService';

export async function getSubmissionEvaluation(req: Request, res: Response) {
  try {
    const submissionId = req.params.id;
    const evaluation = await evaluationService.getSubmissionEvaluation(submissionId);
    if (!evaluation) {
      return res.status(404).json({ success: false, error: 'Evaluation result not found or pending' });
    }
    res.json({ success: true, data: evaluation });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function retryEvaluation(req: Request, res: Response) {
  try {
    const evaluationId = req.params.id;
    const result = await evaluationService.retryEvaluation(evaluationId);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}
