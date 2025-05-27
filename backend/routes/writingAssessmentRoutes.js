// writingAssessmentRoutes.js
import express from 'express';
import writingAssessmentController from '../controllers/writingAssessmentController.js';
import { authMiddleware } from '../src/middleware/authMiddleware.js';

const router = express.Router();

// POST /api/writing-assessment/evaluate - Evaluate a writing submission
router.post('/evaluate', writingAssessmentController.evaluateWriting);

// POST /api/writing-assessment/submit-communication - Submit a writing assessment to the database
router.post('/submit-communication', authMiddleware, writingAssessmentController.submitWritingAssessment);

// GET /api/writing-assessment/user/:userId - Get a user's writing assessment history
router.get('/user/:userId', authMiddleware, writingAssessmentController.getUserWritingAssessments);

// GET /api/writing-assessment/user - Get the current user's writing assessment history
router.get('/user', authMiddleware, writingAssessmentController.getUserWritingAssessments);

// GET /api/writing-assessment/check - Check if a user can take a writing assessment
router.get('/check', authMiddleware, writingAssessmentController.checkWritingAssessmentAvailability);

// GET /api/writing-assessment/:assessmentId - Get a specific writing assessment
router.get('/:assessmentId', authMiddleware, writingAssessmentController.getWritingAssessmentById);

export default router; 