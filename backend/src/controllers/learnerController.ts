import { Request, Response } from 'express';
import * as attemptService from '../services/attemptService';

export async function getLearnerAttempts(req: Request, res: Response) {
  try {
    const learnerId = req.params.id || 'learner-default';
    const attempts = await attemptService.getLearnerAttempts(learnerId);
    res.json({ success: true, data: attempts });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function clearLearnerHistory(req: Request, res: Response) {
  try {
    const learnerId = req.params.id || 'learner-default';
    const result = await attemptService.clearLearnerAttempts(learnerId);
    res.json({ success: true, message: 'Practice history cleared successfully.', data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

