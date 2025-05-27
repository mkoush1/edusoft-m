// writingAssessmentRoutes.js
import express from 'express';
import writingAssessmentController from '../controllers/writingAssessmentController.js';
import communicationController from '../controllers/communicationController.js';
import { authenticateToken } from '../src/middleware/auth.js';

const router = express.Router();

/**
 * @route POST /api/writing-assessment/evaluate
 * @desc Evaluate a writing submission using AI
 * @access Public
 */
router.post('/evaluate', writingAssessmentController.evaluateWriting);

/**
 * @route POST /api/writing-assessment/submit-communication
 * @desc Submit communication assessment results to database
 * @access Private (requires authentication)
 */
router.post('/submit-communication', authenticateToken, communicationController.submitCommunicationAssessment);

export default router; 