import { Request, Response } from 'express';
import * as problemService from '../services/problemService';

export async function listProblems(req: Request, res: Response) {
  try {
    const problems = await problemService.getAllProblems();
    res.json({ success: true, data: problems });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getProblem(req: Request, res: Response) {
  try {
    const problem = await problemService.getProblemById(req.params.id);
    if (!problem) {
      return res.status(404).json({ success: false, error: 'Problem not found' });
    }
    res.json({ success: true, data: problem });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
