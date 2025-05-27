import express from 'express';
import speakingQuestionController from '../controllers/speakingQuestionController.js';

const router = express.Router();

// GET /api/speaking-questions/:language/:level - Get all questions for a language and level
router.get('/:language/:level', speakingQuestionController.getQuestions);

// GET /api/speaking-questions/:language/:level/:taskId - Get a specific question
router.get('/:language/:level/:taskId', speakingQuestionController.getQuestion);

// POST /api/speaking-questions - Create a new question
router.post('/', speakingQuestionController.createQuestion);

// PUT /api/speaking-questions/:id - Update a question
router.put('/:id', speakingQuestionController.updateQuestion);

// DELETE /api/speaking-questions/:id - Delete a question (set inactive)
router.delete('/:id', speakingQuestionController.deleteQuestion);

// POST /api/speaking-questions/seed - Seed initial questions if none exist
router.post('/seed', speakingQuestionController.seedQuestions);

export default router; 