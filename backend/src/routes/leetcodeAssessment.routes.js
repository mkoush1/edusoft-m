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
import leetcodeService from '../services/leetcodeService.js';
import LeetCodeAssessment from '../../models/LeetCodeAssessment.js';

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
      { method: 'GET', path: '/user/:userId', description: 'Get user assessments' },
      { method: 'GET', path: '/debug/leetscan/:username', description: 'Debug LeetScan API for a user' },
      { method: 'GET', path: '/debug/problem/:username/:problemId', description: 'Debug problem verification' }
    ]
  });
});

// Debug route to test LeetScan API directly
leetcodeAssessmentRoutes.get('/debug/leetscan/:username', async (req, res) => {
  try {
    const { username } = req.params;
    console.log(`Debug: Testing LeetScan API for username: ${username}`);
    
    const userData = await leetcodeService.getUserDataFromLeetScan(username);
    
    res.status(200).json({
      success: true,
      message: `LeetScan API data for ${username}`,
      userData
    });
  } catch (error) {
    console.error('Debug: Error fetching LeetScan data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch LeetScan data',
      error: error.message
    });
  }
});

// Debug route to test problem verification
leetcodeAssessmentRoutes.get('/debug/problem/:username/:problemId', async (req, res) => {
  try {
    const { username, problemId } = req.params;
    console.log(`Debug: Testing problem verification for ${username} and problem ${problemId}`);
    
    const isSolved = await leetcodeService.hasSolvedProblem(username, problemId);
    
    res.status(200).json({
      success: true,
      message: `Problem verification result for ${username} and problem ${problemId}`,
      isSolved,
      problemId
    });
  } catch (error) {
    console.error('Debug: Error verifying problem:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify problem',
      error: error.message
    });
  }
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

// One-time fix endpoint to recalculate LeetCode assessment scores for a user
leetcodeAssessmentRoutes.post('/fix-scores/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const assessments = await LeetCodeAssessment.find({ userId, status: 'completed' });
    let updated = 0;

    for (const assessment of assessments) {
      const totalProblems = assessment.assignedProblems.length;
      const completedProblems = assessment.assignedProblems.filter(p => p.completed).length;
      const percentageScore = Math.round((completedProblems / totalProblems) * 100);
      if (assessment.score !== percentageScore) {
        assessment.score = percentageScore;
        await assessment.save();
        updated++;
      }
    }

    res.json({ success: true, updated, message: `Updated ${updated} assessments.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default leetcodeAssessmentRoutes;
