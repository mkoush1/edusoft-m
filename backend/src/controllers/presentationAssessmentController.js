import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import User from '../models/User.js';

// Create a model for presentation assessments
const PresentationAssessmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  deadline: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'submitted', 'evaluated'],
    default: 'pending'
  },
  videoPath: String,
  presentationPath: String,
  feedback: String,
  score: Number,
  evaluatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  evaluatedAt: Date
}, { timestamps: true });

// Create the model if it doesn't exist
let PresentationAssessment;
try {
  PresentationAssessment = mongoose.model('PresentationAssessment');
} catch (e) {
  PresentationAssessment = mongoose.model('PresentationAssessment', PresentationAssessmentSchema);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Start a new assessment with 24-hour deadline
export const startAssessment = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if user already has an active assessment
    const existingAssessment = await PresentationAssessment.findOne({
      userId,
      status: 'pending'
    });

    if (existingAssessment) {
      return res.status(200).json({
        submissionId: existingAssessment._id,
        deadline: existingAssessment.deadline
      });
    }

    // Create a deadline 24 hours from now
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + 24);

    // Create a new assessment
    const assessment = new PresentationAssessment({
      userId,
      deadline,
      status: 'pending'
    });

    await assessment.save();

    res.status(201).json({
      submissionId: assessment._id,
      deadline: assessment.deadline
    });
  } catch (error) {
    console.error('Error starting assessment:', error);
    res.status(500).json({ error: 'Failed to start assessment' });
  }
};

// Check if user has an active assessment
export const getActiveAssessment = async (req, res) => {
  try {
    const userId = req.user._id;

    const activeAssessment = await PresentationAssessment.findOne({
      userId,
      status: 'pending'
    });

    if (!activeAssessment) {
      return res.status(200).json({ activeAssessment: null });
    }

    res.status(200).json({
      activeAssessment: {
        _id: activeAssessment._id,
        startTime: activeAssessment.startTime,
        deadline: activeAssessment.deadline
      }
    });
  } catch (error) {
    console.error('Error getting active assessment:', error);
    res.status(500).json({ error: 'Failed to get active assessment' });
  }
};

import cloudinary from '../config/cloudinary.js';
import PresentationUpload from '../models/PresentationUpload.js';

// Submit assessment files
export const submitAssessment = async (req, res) => {
  try {
    console.log('Starting file submission process');
    
    // Check if files exist in the request
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: 'No files were uploaded' });
    }
    
    console.log('Request files:', Object.keys(req.files));
    
    const { submissionId } = req.params;
    const userId = req.user._id;

    console.log(`Processing submission ID: ${submissionId} for user: ${userId}`);

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
    if (assessment.status !== 'pending') {
      console.log(`Assessment already submitted with status: ${assessment.status}`);
      return res.status(400).json({ error: 'Assessment already submitted' });
    }

    // Check for required files
    if (!req.files.video) {
      console.log('Video file is missing');
      return res.status(400).json({ error: 'Video file is required' });
    }
    
    if (!req.files.presentation) {
      console.log('Presentation file is missing');
      return res.status(400).json({ error: 'Presentation file is required' });
    }

    const videoFile = req.files.video;
    const presentationFile = req.files.presentation;
    
    console.log(`Video file: ${videoFile.name}, size: ${videoFile.size}`);
    console.log(`Presentation file: ${presentationFile.name}, size: ${presentationFile.size}`);

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

    console.log(`Presentation file type: ${presentationType}`);

    try {
      console.log('Starting Cloudinary upload process');
      console.log('Video file temp path:', videoFile.tempFilePath);
      console.log('Presentation file temp path:', presentationFile.tempFilePath);
      
      // Check if cloudinary is properly configured
      console.log('Cloudinary config:', {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Not set',
        api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set',
        api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set'
      });
      
      // Upload video to Cloudinary
      console.log('Uploading video to Cloudinary...');
      let videoUploadResult;
      try {
        videoUploadResult = await cloudinary.uploader.upload(videoFile.tempFilePath, {
          resource_type: 'video',
          folder: `edusoft/presentations/${submissionId}`,
          public_id: `video_${Date.now()}`,
          overwrite: true
        });
        console.log('Video uploaded successfully to Cloudinary:', videoUploadResult.secure_url);
      } catch (videoError) {
        console.error('Error uploading video to Cloudinary:', videoError);
        throw new Error(`Video upload failed: ${videoError.message}`);
      }

      // Upload presentation to Cloudinary
      console.log('Uploading presentation to Cloudinary...');
      let presentationUploadResult;
      try {
        presentationUploadResult = await cloudinary.uploader.upload(presentationFile.tempFilePath, {
          resource_type: 'raw',
          folder: `edusoft/presentations/${submissionId}`,
          public_id: `presentation_${Date.now()}${path.extname(presentationFile.name)}`,
          overwrite: true
        });
        console.log('Presentation uploaded successfully to Cloudinary:', presentationUploadResult.secure_url);
      } catch (presentationError) {
        console.error('Error uploading presentation to Cloudinary:', presentationError);
        throw new Error(`Presentation upload failed: ${presentationError.message}`);
      }

      // Create a new presentation upload record
      const presentationUpload = new PresentationUpload({
        userId,
        assessmentId: submissionId,
        videoUrl: videoUploadResult.secure_url,
        videoPublicId: videoUploadResult.public_id,
        presentationUrl: presentationUploadResult.secure_url,
        presentationPublicId: presentationUploadResult.public_id,
        presentationType,
        status: 'processed',
        metadata: {
          videoFormat: videoUploadResult.format || 'unknown',
          videoSize: videoUploadResult.bytes || 0,
          videoDuration: videoUploadResult.duration || 0,
          presentationSize: presentationUploadResult.bytes || 0
        }
      });
      
      await presentationUpload.save();
      console.log('Presentation upload record saved to database');
      
      // Update assessment status
      assessment.status = 'submitted';
      assessment.videoPath = videoUploadResult.secure_url;
      assessment.presentationPath = presentationUploadResult.secure_url;
      
      await assessment.save();
      console.log('Assessment updated successfully');

      // Return success response
      return res.status(200).json({
        success: true,
        message: 'Assessment submitted successfully',
        videoUrl: videoUploadResult.secure_url,
        presentationUrl: presentationUploadResult.secure_url
      });
    } catch (uploadError) {
      console.error('Error during file upload:', uploadError);
      return res.status(500).json({ error: `File upload failed: ${uploadError.message}` });
    }
  } catch (error) {
    console.error('Error submitting assessment:', error);
    
    // Clean up temp files if they exist
    if (req.files) {
      if (req.files.video && req.files.video.tempFilePath && fs.existsSync(req.files.video.tempFilePath)) {
        try {
          fs.unlinkSync(req.files.video.tempFilePath);
        } catch (e) {
          console.error('Error cleaning up video temp file:', e);
        }
      }
      
      if (req.files.presentation && req.files.presentation.tempFilePath && fs.existsSync(req.files.presentation.tempFilePath)) {
        try {
          fs.unlinkSync(req.files.presentation.tempFilePath);
        } catch (e) {
          console.error('Error cleaning up presentation temp file:', e);
        }
      }
    }
    
    return res.status(500).json({ error: `Failed to submit assessment: ${error.message}` });
  }
};

// Get assessment details for admin
export const getAssessmentDetails = async (req, res) => {
  try {
    const { submissionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      return res.status(400).json({ error: 'Invalid submission ID' });
    }

    // Find the assessment with user details
    const assessment = await PresentationAssessment.findById(submissionId)
      .populate('userId', 'name email')
      .populate('evaluatedBy', 'name email');

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // Check if user is admin or the assessment owner
    if (!req.user.isAdmin && assessment.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.status(200).json({
      assessment: {
        _id: assessment._id,
        user: assessment.userId,
        startTime: assessment.startTime,
        deadline: assessment.deadline,
        status: assessment.status,
        videoPath: assessment.videoPath,
        presentationPath: assessment.presentationPath,
        feedback: assessment.feedback,
        score: assessment.score,
        evaluatedBy: assessment.evaluatedBy,
        evaluatedAt: assessment.evaluatedAt,
        createdAt: assessment.createdAt,
        updatedAt: assessment.updatedAt
      }
    });
  } catch (error) {
    console.error('Error getting assessment details:', error);
    res.status(500).json({ error: 'Failed to get assessment details' });
  }
};

// List all assessments for admin
export const listAssessments = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get query parameters
    const { status, page = 1, limit = 10 } = req.query;

    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Find assessments with user details
    const assessments = await PresentationAssessment.find(query)
      .populate('userId', 'name email')
      .populate('evaluatedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await PresentationAssessment.countDocuments(query);

    res.status(200).json({
      assessments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error listing assessments:', error);
    res.status(500).json({ error: 'Failed to list assessments' });
  }
};

// Evaluate assessment (admin only)
export const evaluateAssessment = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { feedback, score } = req.body;

    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      return res.status(400).json({ error: 'Invalid submission ID' });
    }

    // Validate score
    if (score < 0 || score > 100) {
      return res.status(400).json({ error: 'Score must be between 0 and 100' });
    }

    // Find the assessment
    const assessment = await PresentationAssessment.findById(submissionId);

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // Check if assessment is submitted
    if (assessment.status !== 'submitted') {
      return res.status(400).json({ error: 'Assessment is not submitted yet' });
    }

    // Update assessment
    assessment.feedback = feedback;
    assessment.score = score;
    assessment.evaluatedBy = req.user._id;
    assessment.evaluatedAt = new Date();
    assessment.status = 'evaluated';

    await assessment.save();

    res.status(200).json({
      success: true,
      message: 'Assessment evaluated successfully'
    });
  } catch (error) {
    console.error('Error evaluating assessment:', error);
    res.status(500).json({ error: 'Failed to evaluate assessment' });
  }
};

// Get user's assessments
export const getUserAssessments = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find user's assessments
    const assessments = await PresentationAssessment.find({ userId })
      .sort({ createdAt: -1 });

    res.status(200).json({ assessments });
  } catch (error) {
    console.error('Error getting user assessments:', error);
    res.status(500).json({ error: 'Failed to get user assessments' });
  }
};

// Serve assessment files
export const serveFile = async (req, res) => {
  try {
    const { submissionId, fileType } = req.params;

    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      return res.status(400).json({ error: 'Invalid submission ID' });
    }

    // Find the assessment
    const assessment = await PresentationAssessment.findById(submissionId);

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // Check if user is admin or the assessment owner
    if (!req.user.isAdmin && assessment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Determine which file to serve
    let filePath;
    if (fileType === 'video') {
      filePath = assessment.videoPath;
    } else if (fileType === 'presentation') {
      filePath = assessment.presentationPath;
    } else {
      return res.status(400).json({ error: 'Invalid file type' });
    }

    if (!filePath) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Serve the file
    const absolutePath = path.join(process.cwd(), filePath.replace(/^\//, ''));
    res.sendFile(absolutePath);
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({ error: 'Failed to serve file' });
  }
};
