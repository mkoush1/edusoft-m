import express from 'express';
import { submitPresentation, getQuestions, checkCompletion, getVideos, deleteVideo, evaluateVideo, getUserSubmissions } from '../controllers/presentationAssessment.controller.js';
import { authenticateToken as auth } from '../middleware/auth.js';

const router = express.Router();

// Get presentation questions
router.get('/questions', auth, getQuestions);

// Check if user has completed the presentation assessment
router.get('/check-completion', auth, checkCompletion);

// Get all presentation videos
router.get('/videos', auth, getVideos);

// Delete a presentation video
router.delete('/videos/:id', auth, deleteVideo);

// Evaluate a presentation video
router.post('/evaluate/:id', auth, evaluateVideo);

// Get user's presentation submissions with evaluations
router.get('/user-submissions', auth, getUserSubmissions);

// Submit a presentation recording
router.post('/submit', submitPresentation);

export default router; 