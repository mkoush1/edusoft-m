import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { authenticateToken } from '../middleware/auth.js';
import { fileUploadMiddleware } from '../middleware/fileUploadMiddleware.js';
import {
  startAssessment,
  getActiveAssessment,
  submitAssessment,
  getAssessmentDetails,
  listAssessments,
  evaluateAssessment,
  getUserAssessments,
  serveFile
} from '../controllers/presentationAssessmentController.js';
import PresentationAssessment from '../models/PresentationAssessment.js';
import PresentationUpload from '../models/PresentationUpload.js';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();

// Using fileUploadMiddleware imported from middleware/fileUploadMiddleware.js

// Start a new assessment with 24-hour deadline
router.post('/start', authenticateToken, startAssessment);

// Check if user has an active assessment
router.get('/active', authenticateToken, getActiveAssessment);

// Initialize the upload process
router.post('/init/:submissionId', authenticateToken, async (req, res) => {
  try {
    const { submissionId } = req.params;
    const userId = req.user._id;

    console.log(`Initializing upload for submission ID: ${submissionId}, user ID: ${userId}`);

    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      return res.status(400).json({ error: 'Invalid submission ID' });
    }

    // Find the assessment
    const assessment = await PresentationAssessment.findById(submissionId);

    if (!assessment) {
      console.log(`Assessment not found with ID: ${submissionId}`);
      return res.status(404).json({ error: 'Assessment not found' });
    }

    console.log(`Found assessment: ${assessment._id}, status: ${assessment.status}`);

    // Check if this assessment belongs to the user
    if (assessment.userId.toString() !== userId.toString()) {
      console.log(`Unauthorized: Assessment belongs to ${assessment.userId}, not ${userId}`);
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check if assessment is already submitted
    if (assessment.status === 'submitted') {
      console.log(`Assessment already submitted with status: ${assessment.status}`);
      return res.status(400).json({ error: 'Assessment already submitted' });
    }

    // Mark as initializing
    assessment.status = 'initializing';
    await assessment.save();

    console.log(`Assessment status updated to initializing`);

    return res.status(200).json({
      success: true,
      message: 'Upload process initialized'
    });
  } catch (error) {
    console.error('Error initializing upload:', error);
    return res.status(500).json({ error: `Failed to initialize upload: ${error.message}` });
  }
});

// Upload video file
router.post('/upload/:submissionId/video', authenticateToken, fileUploadMiddleware, async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    const { submissionId } = req.params;
    const userId = req.user._id;
    const videoFile = req.files.file;

    // Upload to Cloudinary
    const videoUploadResult = await cloudinary.uploader.upload(videoFile.tempFilePath, {
      resource_type: 'video',
      folder: `edusoft/presentations/${submissionId}`,
      public_id: `video_${Date.now()}`,
      overwrite: true
    });

    // Update the assessment with video URL
    const assessment = await PresentationAssessment.findById(submissionId);
    assessment.videoPath = videoUploadResult.secure_url;
    await assessment.save();

    return res.status(200).json({
      success: true,
      message: 'Video uploaded successfully',
      videoUrl: videoUploadResult.secure_url
    });
  } catch (error) {
    console.error('Error uploading video:', error);
    return res.status(500).json({ error: `Failed to upload video: ${error.message}` });
  }
});

// Upload presentation file
router.post('/upload/:submissionId/presentation', authenticateToken, fileUploadMiddleware, async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'No presentation file uploaded' });
    }

    const { submissionId } = req.params;
    const userId = req.user._id;
    const presentationFile = req.files.file;

    // Determine presentation file type
    const presentationExtension = path.extname(presentationFile.name).toLowerCase();
    let presentationType = '';
    
    if (presentationExtension === '.pdf') {
      presentationType = 'pdf';
    } else if (presentationExtension === '.pptx') {
      presentationType = 'pptx';
    } else if (presentationExtension === '.ppt') {
      presentationType = 'ppt';
    } else {
      return res.status(400).json({ error: 'Presentation file must be PDF, PPT, or PPTX format' });
    }

    // Upload to Cloudinary
    const presentationUploadResult = await cloudinary.uploader.upload(presentationFile.tempFilePath, {
      resource_type: 'raw',
      folder: `edusoft/presentations/${submissionId}`,
      public_id: `presentation_${Date.now()}${presentationExtension}`,
      overwrite: true
    });

    // Update the assessment with presentation URL
    const assessment = await PresentationAssessment.findById(submissionId);
    assessment.presentationPath = presentationUploadResult.secure_url;
    await assessment.save();

    return res.status(200).json({
      success: true,
      message: 'Presentation uploaded successfully',
      presentationUrl: presentationUploadResult.secure_url,
      presentationType
    });
  } catch (error) {
    console.error('Error uploading presentation:', error);
    return res.status(500).json({ error: `Failed to upload presentation: ${error.message}` });
  }
});

// Complete the submission process
router.post('/complete/:submissionId', authenticateToken, async (req, res) => {
  try {
    const { submissionId } = req.params;
    const userId = req.user._id;

    // Find the assessment
    const assessment = await PresentationAssessment.findById(submissionId);

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // Check if this assessment belongs to the user
    if (assessment.userId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check if both files have been uploaded
    if (!assessment.videoPath || !assessment.presentationPath) {
      return res.status(400).json({ error: 'Both video and presentation files must be uploaded first' });
    }

    // Create a new presentation upload record
    const presentationUpload = new PresentationUpload({
      userId,
      assessmentId: submissionId,
      videoUrl: assessment.videoPath,
      videoPublicId: assessment.videoPath.split('/').pop().split('.')[0],
      presentationUrl: assessment.presentationPath,
      presentationPublicId: assessment.presentationPath.split('/').pop().split('.')[0],
      presentationType: path.extname(assessment.presentationPath).substring(1) || 'unknown',
      status: 'processed',
      metadata: {
        videoFormat: path.extname(assessment.videoPath).substring(1) || 'mp4',
        videoSize: 0,
        videoDuration: 0,
        presentationSize: 0
      }
    });
    
    await presentationUpload.save();
    
    // Mark assessment as submitted
    assessment.status = 'submitted';
    await assessment.save();

    return res.status(200).json({
      success: true,
      message: 'Assessment submitted successfully',
      videoUrl: assessment.videoPath,
      presentationUrl: assessment.presentationPath
    });
  } catch (error) {
    console.error('Error completing submission:', error);
    return res.status(500).json({ error: `Failed to complete submission: ${error.message}` });
  }
});

// Legacy submit endpoint (keeping for backward compatibility)
router.post('/submit/:submissionId', authenticateToken, fileUploadMiddleware, submitAssessment);

// Get assessment details
router.get('/details/:submissionId', authenticateToken, getAssessmentDetails);

// List all assessments (admin only)
router.get('/list', authenticateToken, listAssessments);

// Evaluate assessment (admin only)
router.post('/evaluate/:submissionId', authenticateToken, evaluateAssessment);

// Get user's assessments
router.get('/user', authenticateToken, getUserAssessments);

// Serve assessment files
router.get('/file/:submissionId/:fileType', authenticateToken, serveFile);

// Test Cloudinary connection
router.get('/test-cloudinary', async (req, res) => {
  try {
    console.log('Testing Cloudinary connection...');
    console.log('Cloudinary config:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set',
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set'
    });
    
    // Test Cloudinary API
    const result = await cloudinary.api.ping();
    return res.status(200).json({
      success: true,
      message: 'Cloudinary connection successful',
      result
    });
  } catch (error) {
    console.error('Cloudinary test failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Cloudinary connection failed',
      error: error.message
    });
  }
});

export default router;
