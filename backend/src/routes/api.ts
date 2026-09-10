import { Router } from 'express';
import * as problemController from '../controllers/problemController';
import * as attemptController from '../controllers/attemptController';
import * as evaluationController from '../controllers/evaluationController';
import * as learnerController from '../controllers/learnerController';

const router = Router();

// Problems
router.get('/problems', problemController.listProblems);
router.get('/problems/:id', problemController.getProblem);

// Attempts & Submissions
router.post('/attempts', attemptController.createAttempt);
router.get('/attempts/:id', attemptController.getAttempt);
router.post('/attempts/:id/submissions', attemptController.submitSolution);
router.get('/attempts/:id/evaluation-status', attemptController.getEvaluationStatus);

// Submissions & Evaluations
router.get('/submissions/:id/evaluation', evaluationController.getSubmissionEvaluation);
router.post('/evaluations/:id/retry', evaluationController.retryEvaluation);

// Learners
router.get('/learners/:id/attempts', learnerController.getLearnerAttempts);
router.delete('/learners/:id/attempts', learnerController.clearLearnerHistory);

export default router;
