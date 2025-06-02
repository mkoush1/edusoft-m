import express from 'express';
import { 
  getQuestions, 
  checkCompletion, 
  getVideos, 
  deleteVideo, 
  evaluateVideo, 
  getUserSubmissions, 
  getPresentationRecommendations 
} from '../controllers/presentationAssessment.controller.js';
import { submitPresentation } from '../controllers/submitPresentation.fixed.js';
import { authenticateToken } from '../middleware/auth.js';
import fileUpload from 'express-fileupload';

const router = express.Router();

// Middleware for file uploads
router.use(fileUpload({
    useTempFiles: true,
    tempFileDir: './tmp/', // Using relative path
    createParentPath: true,
    abortOnLimit: true,
    limits: { 
        fileSize: 500 * 1024 * 1024, // 500MB limit
        files: 2 // Allow up to 2 files (video + presentation)
    },
    limitHandler: (req, res, next) => {
        res.status(413).json({
            success: false,
            message: 'File size too large. Maximum size is 500MB per file.'
        });
    }
}));

// Get presentation questions
router.get('/questions', authenticateToken, getQuestions);

// Check if user has completed the presentation assessment
router.get('/check-completion', authenticateToken, checkCompletion);

// Get all presentation videos
router.get('/videos', authenticateToken, getVideos);

// Delete a presentation video
router.delete('/videos/:id', authenticateToken, deleteVideo);

// Evaluate a presentation video
router.post('/evaluate/:id', authenticateToken, evaluateVideo);

// Get user's presentation submissions with evaluations
router.get('/user-submissions', authenticateToken, getUserSubmissions);

// Submit a presentation recording (using fixed version with improved error handling and cleanup)
router.post('/submit', authenticateToken, submitPresentation);

// Get presentation recommendations
router.get('/recommendations', authenticateToken, getPresentationRecommendations);

export default router;
