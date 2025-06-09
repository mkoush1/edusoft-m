import express from 'express';
import { getUserProgress } from '../controllers/progressController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user's comprehensive progress data
router.get('/:userId', authenticateToken, getUserProgress);

export default router; 