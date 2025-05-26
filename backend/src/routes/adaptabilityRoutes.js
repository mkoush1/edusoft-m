import express from 'express';
import { 
  getAdaptabilityQuestions, 
  getQuestionsBySection, 
  calculateScore 
} from '../controllers/adaptabilityController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all questions
router.get('/questions', protect, getAdaptabilityQuestions);

// Get questions by section
router.get('/questions/:section', protect, getQuestionsBySection);

// Calculate score
router.post('/calculate-score', protect, calculateScore);

export default router; 