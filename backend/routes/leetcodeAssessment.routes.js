import express from 'express';
import {
  startLeetCodeAssessment,
  verifyLeetCodeAccount,
  checkLeetCodeProgress,
  getLeetCodeAssessment,
  getUserLeetCodeAssessments
} from '../controllers/leetcodeAssessment.controller.js';

const leetcodeAssessmentRoutes = express.Router();

// Start a new LeetCode assessment
leetcodeAssessmentRoutes.post('/start', startLeetCodeAssessment);

// Verify LeetCode account ownership
leetcodeAssessmentRoutes.post('/verify/:assessmentId', verifyLeetCodeAccount);

// Check progress on assigned problems
leetcodeAssessmentRoutes.get('/progress/:assessmentId', checkLeetCodeProgress);

// Get assessment details
leetcodeAssessmentRoutes.get('/:assessmentId', getLeetCodeAssessment);

// Get all assessments for a user
leetcodeAssessmentRoutes.get('/user/:userId', getUserLeetCodeAssessments);

export default leetcodeAssessmentRoutes;
