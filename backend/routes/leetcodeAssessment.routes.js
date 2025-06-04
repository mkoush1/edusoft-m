import express from 'express';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest.js'; // Validation middleware
import {
  startLeetCodeAssessment,
  verifyLeetCodeAccount,
  checkLeetCodeProgress,
  checkProblemStatus,
  getLeetCodeAssessment,
  getUserLeetCodeAssessments
} from '../controllers/leetcodeAssessment.controller.js';

const leetcodeAssessmentRoutes = express.Router();

// Debug route to test API connectivity
leetcodeAssessmentRoutes.get('/debug', (req, res) => {
  res.status(200).json({
    message: 'LeetCode assessment API is working',
    routes: [
      { method: 'POST', path: '/start', description: 'Start a new assessment' },
      { method: 'POST', path: '/verify/:assessmentId', description: 'Verify LeetCode account' },
      { method: 'GET', path: '/progress/:assessmentId', description: 'Check assessment progress' },
      { method: 'GET', path: '/:assessmentId/problems/:problemId/check', description: 'Check problem status' },
      { method: 'GET', path: '/:assessmentId', description: 'Get assessment details' },
      { method: 'GET', path: '/user/:userId', description: 'Get user assessments' }
    ]
  });
});

// Validation middleware
const startAssessmentValidation = [
  body('userId').isMongoId().withMessage('Valid user ID is required'),
  body('leetCodeUsername')
    .isLength({ min: 1, max: 15 })
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Valid LeetCode username is required')
];

const assessmentIdValidation = [
  param('assessmentId').isMongoId().withMessage('Valid assessment ID is required')
];

const problemIdValidation = [
  param('problemId').notEmpty().withMessage('Problem ID is required')
];

const userIdValidation = [
  param('userId').isMongoId().withMessage('Valid user ID is required')
];

const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['not_started', 'in_progress', 'completed']).withMessage('Invalid status')
];

// Routes with validation
// Define the most specific routes first to avoid conflicts

// Fixed routes (not using params in the base path)
leetcodeAssessmentRoutes.post('/start', 
  startAssessmentValidation, 
  validateRequest, 
  startLeetCodeAssessment
);

leetcodeAssessmentRoutes.get('/user/:userId', 
  userIdValidation, 
  paginationValidation, 
  validateRequest, 
  getUserLeetCodeAssessments
);

// Routes with assessmentId parameter
leetcodeAssessmentRoutes.post('/verify/:assessmentId', 
  assessmentIdValidation, 
  validateRequest, 
  verifyLeetCodeAccount
);

leetcodeAssessmentRoutes.get('/progress/:assessmentId', 
  assessmentIdValidation, 
  validateRequest, 
  checkLeetCodeProgress
);

// Most specific route with both assessmentId and problemId
leetcodeAssessmentRoutes.get('/:assessmentId/problems/:problemId/check',
  [...assessmentIdValidation, ...problemIdValidation],
  validateRequest,
  checkProblemStatus
);

// General assessmentId route (must come after more specific routes)
leetcodeAssessmentRoutes.get('/:assessmentId', 
  assessmentIdValidation, 
  validateRequest, 
  getLeetCodeAssessment
);

export default leetcodeAssessmentRoutes;