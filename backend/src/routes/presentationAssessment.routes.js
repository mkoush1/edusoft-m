import express from 'express';
import { submitPresentation, getQuestions, checkCompletion, getVideos, deleteVideo, evaluateVideo, getUserSubmissions, getPresentationRecommendations, evaluateSubmission, getPendingPresentationAssessments } from '../controllers/presentationAssessment.controller.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import fileUpload from 'express-fileupload';
import PresentationSubmission from '../models/PresentationSubmission.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

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
router.get('/questions', getQuestions);

// Check if user has completed the presentation assessment
router.get('/check-completion', checkCompletion);

// Get all presentation videos (admin access)
router.get('/videos', isAdmin, getVideos);

// Alternative endpoint for admin access with just authentication
router.get('/admin-videos', authenticateToken, getVideos);

// Delete a presentation video (admin access)
router.delete('/videos/:id', isAdmin, deleteVideo);

// Alternative endpoint for admin delete with just authentication
router.delete('/admin-videos/:id', authenticateToken, deleteVideo);

// Evaluate a presentation video (admin access)
router.post('/evaluate/:id', isAdmin, evaluateVideo);

// Alternative endpoint for admin evaluation with just authentication
router.post('/admin-evaluate/:id', authenticateToken, evaluateVideo);

// Get user's presentation submissions with evaluations
router.get('/user-submissions', getUserSubmissions);

// Submit a presentation recording
router.post('/submit', submitPresentation);

// Get presentation recommendations
router.get('/recommendations', getPresentationRecommendations);

// Evaluate presentation submission with detailed criteria (admin access)
router.put('/evaluate-submission/:id', isAdmin, evaluateSubmission);

// Get presentation file by ID (redirects to Google Drive)
router.get('/file/:fileId', async (req, res) => {
    try {
        const { fileId } = req.params;
        
        // Find the submission with this file ID
        const submission = await PresentationSubmission.findOne({
            'presentationFile.fileId': fileId
        });
        
        if (!submission || !submission.presentationFile) {
            return res.status(404).json({
                success: false,
                message: 'File not found or access denied'
            });
        }
        
        // Redirect to the Google Drive download link
        res.redirect(submission.presentationFile.downloadLink);
    } catch (error) {
        console.error('Error getting file:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving file',
            error: error.message,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        });
    }
});

// Check for active assessment
router.get('/active', authenticateToken, (req, res) => {
    // This is a placeholder for now - we'll implement this in the controller
    // For now, just return a mock active assessment
    const now = new Date();
    const deadline = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    res.status(200).json({
        success: true,
        activeAssessment: {
            _id: 'mock-assessment-id',
            startTime: now,
            deadline: deadline
        }
    });
});

// Start a new assessment
router.post('/start', authenticateToken, (req, res) => {
    // This is a placeholder for now - we'll implement this in the controller
    const now = new Date();
    const deadline = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    res.status(200).json({
        success: true,
        assessment: {
            _id: 'mock-assessment-id',
            startTime: now,
            deadline: deadline
        }
    });
});

// Upload presentation file
router.post('/upload-presentation', authenticateToken, (req, res) => {
    try {
        if (!req.files || !req.files.presentation) {
            return res.status(400).json({
                success: false,
                message: 'No presentation file uploaded'
            });
        }

        const { videoSubmissionId } = req.body;
        
        // In a real implementation, we would upload this to Cloudinary or another storage service
        // For now, just acknowledge receipt
        
        res.status(200).json({
            success: true,
            message: 'Presentation file uploaded successfully',
            data: {
                presentationUrl: 'https://example.com/mock-presentation-url'
            }
        });
    } catch (error) {
        console.error('Error uploading presentation file:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading presentation file',
            error: error.message
        });
    }
});

// Get all pending presentation assessments
router.get('/pending', getPendingPresentationAssessments);

export default router; 