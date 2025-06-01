import cloudinary from '../config/cloudinary.js';
import { GridFSBucket, ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import PresentationSubmission from '../models/PresentationSubmission.js';
import User from '../models/User.js';
import { calculateAverageScore } from '../utils/scoreUtils.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';
import { uploadFile as uploadToDrive, deleteFile as deleteFromDrive } from '../services/googleDriveService.js';

// Helper function to clean up temp files
const cleanupTempFiles = (files) => {
    if (!files) return;
    
    Object.values(files).forEach(file => {
        if (file.tempFilePath && fs.existsSync(file.tempFilePath)) {
            try {
                fs.unlinkSync(file.tempFilePath);
            } catch (error) {
                console.error('Error cleaning up temp file:', error);
            }
        }
    });
};

export const getQuestions = async (req, res) => {
    try {
        const userId = req.user._id;
        console.log('Fetching presentation questions for user:', userId);

        // Get all presentation questions
        const questions = await PresentationQuestion.find().sort({ questionNumber: 1 });
        
        if (!questions || questions.length === 0) {
            // If no questions found, create default ones
            const defaultQuestions = [
                {
                    questionNumber: 1,
                    question: 'Introduce yourself and explain why effective presentation skills are important in your field.',
                    description: 'Focus on your name, background, and provide 2-3 specific reasons why presentation skills matter in your professional context.',
                    preparationTime: 20, // 20 seconds
                    recordingTime: 60 // 1 minute
                },
                {
                    questionNumber: 2,
                    question: 'Describe a time when you had to present complex information to a non-technical audience. How did you make it understandable?',
                    description: 'Explain your approach to simplifying technical concepts, using analogies, visual aids, or other communication techniques.',
                    preparationTime: 20,
                    recordingTime: 60
                },
                {
                    questionNumber: 3,
                    question: 'How do you prepare for an important presentation? Walk us through your process.',
                    description: 'Outline your preparation steps, from research to practice, and how you adapt your content to different audiences.',
                    preparationTime: 20,
                    recordingTime: 60
                }
            ];
            
            await PresentationQuestion.insertMany(defaultQuestions);
            console.log('Created default presentation questions');
            
            // Return the newly created questions
            return res.status(200).json(defaultQuestions);
        }
        
        // Format questions as an object with question number as key
        const formattedQuestions = {};
        questions.forEach(q => {
            formattedQuestions[q.questionNumber] = {
                id: q._id,
                question: q.question,
                description: q.description,
                preparationTime: q.preparationTime,
                recordingTime: q.recordingTime
            };
        });
        
        res.status(200).json(formattedQuestions);
    } catch (error) {
        console.error('Error fetching presentation questions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch presentation questions',
            error: error.message
        });
    }
};

export const checkCompletion = async (req, res) => {
    try {
        const userId = req.user._id;
        console.log('Checking presentation completion for user:', userId);
        
        // Get all questions
        const questions = await PresentationQuestion.find();
        const questionCount = questions.length;
        
        // Check if user has submitted all questions
        const submissions = await PresentationSubmission.find({ userId });
        const uniqueQuestionIds = new Set(submissions.map(s => s.questionId));
        
        const isCompleted = uniqueQuestionIds.size >= questionCount;
        
        res.status(200).json({
            success: true,
            completed: isCompleted,
            submittedCount: uniqueQuestionIds.size,
            totalQuestions: questionCount
        });
    } catch (error) {
        console.error('Error checking presentation completion:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check presentation completion status',
            error: error.message
        });
    }
};

export const getVideos = async (req, res) => {
    try {
        console.log('Fetching presentation videos');
        
        // First, get all users to ensure we can access them
        const allUsers = await User.find({}).select('_id username').lean();
        console.log('All users in database:', JSON.stringify(allUsers, null, 2));
        
        // Create a map of user IDs to usernames
        const userMap = allUsers.reduce((map, user) => {
            map[user._id.toString()] = user.username;
            return map;
        }, {});
        
        console.log('User map:', userMap);
        
        // Get all submissions
        const submissions = await PresentationSubmission.find()
            .sort({ submittedAt: -1 })
            .lean();
            
        console.log(`Found ${submissions.length} submissions`);
        
        // Enrich submissions with usernames
        const result = submissions.map(submission => {
            const userId = submission.userId?.toString();
            const username = userId ? (userMap[userId] || 'Unknown User') : 'Unknown User';
            
            return {
                ...submission,
                username: username,
                status: submission.score ? 'evaluated' : 'pending'
            };
        });
        
        console.log('Final result with usernames:', JSON.stringify(result, null, 2));
        
        // Check if current user has already submitted
        const userSubmission = await PresentationSubmission.findOne({ userId: req.user._id });
        const hasSubmitted = !!userSubmission;
        
        // Format the enriched submissions
        const enrichedSubmissions = result.map(submission => ({
            ...submission,
            username: submission.username || 'Unknown User',
            submittedAt: submission.submittedAt || submission.createdAt
        }));
        
        // Format the response with correct video and presentation file paths
        const videos = enrichedSubmissions.map(submission => ({
            _id: submission._id,
            userId: submission.userId,
            username: submission.username || null, // Will be null if not found
            questionId: submission.questionId,
            videoUrl: submission.screenRecording?.url || null,
            thumbnailUrl: submission.screenRecording?.thumbnailUrl || null,
            presentationFile: submission.presentationFile ? {
                fileId: submission.presentationFile.fileId,
                name: submission.presentationFile.name,
                downloadLink: submission.presentationFile.downloadLink,
                webViewLink: submission.presentationFile.webViewLink
            } : null,
            cloudinaryId: submission.cloudinaryId,
            submittedAt: submission.submittedAt || submission.createdAt,
            score: submission.score || null,
            feedback: submission.feedback || '',
            criteriaScores: submission.criteriaScores || null,
            reviewedAt: submission.reviewedAt || null,
            status: submission.score ? 'evaluated' : 'pending',
            createdAt: submission.createdAt || submission.submittedAt || new Date()
        }));
        
        console.log('Sending response with videos:', JSON.stringify(videos, null, 2));
        
        res.status(200).json({
            success: true,
            videos,
            hasSubmitted,
            currentUserId: req.user._id.toString()
        });
    } catch (error) {
        console.error('Error fetching presentation videos:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch presentation videos',
            error: error.message
        });
    }
};

export const deleteVideo = async (req, res) => {
    try {
        const videoId = req.params.id;
        console.log(`Deleting presentation video with ID: ${videoId}`);
        
        // Find the submission to get the Cloudinary ID
        const submission = await PresentationSubmission.findById(videoId);
        
        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Video submission not found'
            });
        }
        
        // Delete from Cloudinary if cloudinaryId exists
        if (submission.cloudinaryId) {
            try {
                await cloudinary.uploader.destroy(submission.cloudinaryId, { resource_type: 'video' });
                console.log(`Deleted video from Cloudinary: ${submission.cloudinaryId}`);
            } catch (cloudinaryError) {
                console.error('Error deleting from Cloudinary:', cloudinaryError);
                // Continue with database deletion even if Cloudinary deletion fails
            }
        }
        
        // Delete from database
        await PresentationSubmission.findByIdAndDelete(videoId);
        
        res.status(200).json({
            success: true,
            message: 'Video deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting presentation video:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete presentation video',
            error: error.message
        });
    }
};

export const getUserSubmissions = async (req, res) => {
    try {
        const userId = req.user._id;
        console.log(`Fetching presentation submissions for user: ${userId}`);
        
        // Find all submissions for this user
        const submissions = await PresentationSubmission.find({ userId })
            .sort({ questionId: 1 }); // Sort by question number
        
        if (!submissions || submissions.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No submissions found for this user',
                data: {
                    submissions: [],
                    hasEvaluation: false,
                    averageScore: null
                }
            });
        }
        
        // Check if any submissions have been evaluated
        const evaluatedSubmissions = submissions.filter(sub => sub.score !== undefined && sub.score !== null);
        const hasEvaluation = evaluatedSubmissions.length > 0;
        
        // Calculate average score if there are evaluated submissions
        let averageScore = null;
        if (hasEvaluation && evaluatedSubmissions.length > 0) {
            const totalScore = evaluatedSubmissions.reduce((sum, sub) => sum + sub.score, 0);
            averageScore = Math.round((totalScore / evaluatedSubmissions.length) * 10) / 10; // Round to 1 decimal place
        }
        
        // Format the response
        const formattedSubmissions = submissions.map(sub => ({
            questionId: sub.questionId,
            videoPath: sub.videoPath,
            submittedAt: sub.submittedAt,
            score: sub.score,
            feedback: sub.feedback,
            criteriaScores: sub.criteriaScores || {
                contentClarity: 0,
                engagement: 0,
                impact: 0
            },
            reviewedAt: sub.reviewedAt
        }));
        
        res.status(200).json({
            success: true,
            data: {
                submissions: formattedSubmissions,
                hasEvaluation,
                averageScore
            }
        });
    } catch (error) {
        console.error('Error fetching user presentation submissions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch presentation submissions',
            error: error.message
        });
    }
};

export const evaluateVideo = async (req, res) => {
    try {
        const videoId = req.params.id;
        const { score, feedback, criteriaScores } = req.body;
        const reviewerId = req.user._id;
        
        console.log(`Evaluating presentation video with ID: ${videoId}`);
        console.log(`Score: ${score}, Feedback: ${feedback}`);
        console.log('Criteria Scores:', criteriaScores);
        
        // Validate input
        if (score === undefined || score < 0 || score > 10) {
            return res.status(400).json({
                success: false,
                message: 'Score must be between 0 and 10'
            });
        }
        
        // Validate criteria scores if provided
        if (criteriaScores) {
            const { contentClarity, engagement, impact } = criteriaScores;
            if (
                contentClarity < 0 || contentClarity > 10 ||
                engagement < 0 || engagement > 10 ||
                impact < 0 || impact > 10
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Criteria scores must be between 0 and 10'
                });
            }
        }
        
        // Find the submission
        const submission = await PresentationSubmission.findById(videoId);
        
        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Video submission not found'
            });
        }
        
        // Update the submission with evaluation data
        submission.reviewedBy = reviewerId;
        submission.score = score;
        submission.feedback = feedback;
        submission.reviewedAt = new Date();
        
        // Add criteria scores if provided
        if (criteriaScores) {
            submission.criteriaScores = criteriaScores;
        }
        
        await submission.save();
        
        // Get the user who submitted the video
        const user = await User.findById(submission.userId);
        
        if (user) {
            // Update the user's presentation assessment score in completedAssessments
            const presentationAssessment = user.completedAssessments.find(
                a => a.assessmentType === 'presentation'
            );
            
            if (presentationAssessment) {
                presentationAssessment.score = score;
                await user.save();
                console.log(`Updated user's presentation assessment score to ${score}`);
            } else {
                // If no existing assessment, add a new one
                user.completedAssessments.push({
                    assessmentType: 'presentation',
                    completedAt: new Date(),
                    score: score
                });
                
                // Update total assessments completed if needed
                if (!user.completedAssessments.some(a => a.assessmentType === 'presentation')) {
                    user.totalAssessmentsCompleted += 1;
                }
                
                await user.save();
                console.log(`Added presentation assessment to user's completed assessments`);
            }
        }
        
        res.status(200).json({
            success: true,
            message: 'Video evaluated successfully',
            data: {
                submissionId: submission._id,
                score,
                feedback,
                reviewedAt: submission.reviewedAt
            }
        });
    } catch (error) {
        console.error('Error evaluating presentation video:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to evaluate presentation video',
            error: error.message
        });
    }
};

export const getPresentationRecommendations = async (req, res) => {
    try {
        // Get user's latest presentation submission with evaluation
        const submission = await PresentationSubmission.findOne({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .populate('evaluation');

        if (!submission || !submission.evaluation) {
            return res.status(404).json({
                success: false,
                message: 'No presentation assessment found'
            });
        }

        // Calculate skill score based on evaluation
        const evaluation = submission.evaluation;
        const score = Math.round(
            (evaluation.content + evaluation.delivery + evaluation.visuals + evaluation.timeManagement) / 4
        );

        // Define course recommendations based on score
        const recommendations = [
            {
                title: 'Advanced Presentation Skills',
                description: 'Master the art of impactful presentations',
                link: 'https://example.com/course1',
                level: 'Advanced'
            },
            {
                title: 'Presentation Design Fundamentals',
                description: 'Learn to create visually appealing presentations',
                link: 'https://example.com/course2',
                level: 'Intermediate'
            },
            {
                title: 'Public Speaking Mastery',
                description: 'Improve your delivery and confidence',
                link: 'https://example.com/course3',
                level: 'Beginner'
            }
        ];

        res.status(200).json({
            success: true,
            score,
            recommendations
        });
    } catch (error) {
        console.error('Error getting presentation recommendations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get presentation recommendations',
            error: error.message
        });
    }
};

export const submitPresentation = async (req, res) => {
    let videoResult = null;
    let presentationResult = null;
    
    console.log('=== PRESENTATION SUBMISSION START ===');
    console.log('Request received:', { 
        body: req.body,
        files: req.files ? Object.keys(req.files) : 'No files',
        userId: req.userId,
        contentType: req.headers['content-type']
    });
    
    // Log more details about the request
    console.log('Request headers:', req.headers);
    console.log('User ID from token:', req.userId);
    console.log('Request files details:', req.files ? 
        Object.keys(req.files).reduce((acc, key) => {
            acc[key] = {
                name: req.files[key].name,
                size: req.files[key].size,
                mimetype: req.files[key].mimetype,
                tempFilePath: req.files[key].tempFilePath ? 'exists' : 'missing'
            };
            return acc;
        }, {}) : 'No files');
    
    try {
        // Check if user has already submitted an assessment
        const existingSubmission = await PresentationSubmission.findOne({ userId: req.userId });
        if (existingSubmission) {
            return res.status(400).json({
                success: false,
                message: 'You have already submitted the presentation assessment',
                redirectTo: '/presentation-recommendations'
            });
        }

        // Validate file uploads
        if (!req.files || !req.files.video) {
            return res.status(400).json({
                success: false,
                message: 'No video file uploaded'
            });
        }

        const { questionId } = req.body;
        const userId = req.userId;
        const videoFile = req.files.video;
        const presentationFile = req.files.presentation;

        if (!presentationFile) {
            return res.status(400).json({
                success: false,
                message: 'No presentation file uploaded'
            });
        }

        console.log('Received files:', {
            video: videoFile.name,
            presentation: presentationFile.name,
            videoSize: videoFile.size,
            presentationSize: presentationFile.size
        });

        // Validate file sizes
        const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
        if (videoFile.size > MAX_FILE_SIZE) {
            return res.status(400).json({
                success: false,
                message: 'Video file is too large. Maximum size is 100MB.'
            });
        }

        if (presentationFile.size > MAX_FILE_SIZE) {
            return res.status(400).json({
                success: false,
                message: 'Presentation file is too large. Maximum size is 100MB.'
            });
        }

        // Upload video to Cloudinary
        const folderPath = `presentation-assessment/Question ${questionId || 'General'}`;
        console.log(`Uploading video to Cloudinary folder: ${folderPath}`);
        
        let videoResult;
        try {
            // Upload video to Cloudinary
            videoResult = await cloudinary.uploader.upload(videoFile.tempFilePath, {
                resource_type: 'video',
                folder: folderPath,
                allowed_formats: ['mp4', 'webm', 'mov'],
                transformation: [
                    { quality: 'auto' },
                    { fetch_format: 'auto' }
                ]
            });
            console.log('Video uploaded to Cloudinary:', videoResult.secure_url);
        } catch (error) {
            console.error('Error uploading video to Cloudinary:', error);
            return res.status(500).json({
                success: false,
                message: 'Error uploading video to Cloudinary',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
                ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
            });
        }

        // Upload presentation file to Google Drive
        let presentationResult;
        try {
            console.log('Uploading presentation to Google Drive...');
            presentationResult = await uploadToDrive(presentationFile, process.env.GOOGLE_DRIVE_FOLDER_ID);
            console.log('Presentation uploaded to Google Drive:', presentationResult.webViewLink);
        } catch (error) {
            console.error('Error uploading presentation to Google Drive:', error);
            try {
                await cloudinary.uploader.destroy(videoResult.public_id);
                console.log('Cleaned up video file from Cloudinary');
            } catch (e) {
                console.error('Error cleaning up video file:', e);
            }
            return res.status(500).json({
                success: false,
                message: 'Error uploading presentation to Google Drive',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
                ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
            });
        }

        // Get user details to include name as username
        const user = await User.findById(userId).select('name email').lean();
        
        // Check if user exists
        if (!user) {
            console.error('User not found:', { userId });
            return res.status(400).json({
                success: false,
                message: 'User not found. Please log in again.'
            });
        }
        
        // Use name or email as username if available, or a default value
        const username = user.name || user.email || `User-${userId.toString().slice(-6)}`;
        console.log('User found:', { userId, username });
        
        // Create submission record
        const submission = new PresentationSubmission({
            userId,
            username: username, // Using the derived username
            questionId: parseInt(questionId) || 1, // Ensure questionId is a number
            title: `Presentation for Question ${questionId}`,
            screenRecording: {
                url: videoResult.secure_url,
                thumbnailUrl: videoResult.secure_url.replace('/upload/', '/upload/c_thumb,w_200,g_face/'),
                duration: 60, // Default duration in seconds
                size: videoFile.size
            },
            presentationFile: {
                fileId: presentationResult.fileId,
                name: presentationFile.name,
                downloadLink: presentationResult.downloadLink,
                webViewLink: presentationResult.webViewLink,
                size: presentationFile.size,
                mimeType: presentationFile.mimetype,
                uploadedAt: new Date()
            },
            cloudinaryId: videoResult.public_id,
            status: 'submitted', // Changed to a valid enum value from the schema
            submittedAt: new Date()
        });

        try {
            await submission.save();
            console.log('Submission saved to database');
        } catch (error) {
            console.error('Error saving submission:', error);
            throw error; // Propagate the error to the outer catch block
        }
        
        // If we reach here, everything was successful
        return res.status(201).json({
            success: true,
            message: 'Presentation submitted successfully',
            submissionId: submission._id,
            videoUrl: videoResult.secure_url,
            presentationUrl: presentationResult.webViewLink
        });
        
    } catch (error) {
        console.error('Error in submitPresentation:', error);
        console.error('Error details:', {
            name: error.name,
            code: error.code,
            message: error.message,
            stack: error.stack
        });
        
        // Log request state at time of error
        console.error('Request state at error:', {
            filesExist: !!req.files,
            fileKeys: req.files ? Object.keys(req.files) : [],
            videoExists: req.files?.video ? true : false,
            presentationExists: req.files?.presentation ? true : false,
            bodyKeys: Object.keys(req.body || {}),
            userId: req.userId
        });
        
        // Clean up any uploaded files if there was an error
        if (videoResult?.public_id) {
            try {
                await cloudinary.uploader.destroy(videoResult.public_id);
                console.log('Cleaned up video file from Cloudinary');
            } catch (e) {
                console.error('Error cleaning up video file:', e);
            }
        }
        
        if (presentationResult?.fileId) {
            try {
                await deleteFromDrive(presentationResult.fileId);
                console.log('Cleaned up presentation file from Google Drive');
            } catch (e) {
                console.error('Error cleaning up presentation file:', e);
            }
        }
        
        let errorMessage = 'Error uploading files';
        if (error.code === 'LIMIT_FILE_SIZE') {
            errorMessage = 'File size is too large. Maximum size is 100MB per file.';
        } else if (error.message && error.message.includes('File type not supported')) {
            errorMessage = 'Unsupported file type. Please upload MP4, WebM, or MOV for videos, and PDF, PPT, or PPTX for presentations.';
        } else if (error.message && error.message.includes('Unexpected end of form')) {
            errorMessage = 'Upload was interrupted. Please try again with a stable connection.';
        } else if (!req.files || !req.files.video || !req.files.presentation) {
            errorMessage = 'Missing required files. Please upload both video and presentation files.';
        }
        
        console.log('Sending error response:', errorMessage);
        
        return res.status(500).json({
            success: false,
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        });
    } finally {
        // Clean up temp files in all cases (success or error)
        if (req.files) {
            cleanupTempFiles(req.files);
        }
    }
}; 

/**
 * Evaluate a presentation submission with detailed criteria scores
 * @route PUT /api/assessments/presentation/evaluate/:id
 * @access Admin/Supervisor
 */
export const evaluateSubmission = async (req, res) => {
    try {
        const { id } = req.params;
        const { contentClarity, engagementDelivery, impactEffectiveness, feedback } = req.body;
        
        // Validate input data
        if (!contentClarity || !engagementDelivery || !impactEffectiveness) {
            return res.status(400).json({
                success: false,
                message: 'All three criteria scores are required'
            });
        }
        
        // Find the submission
        const submission = await PresentationSubmission.findById(id);
        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }
        
        // Create criteria scores object
        const criteriaScores = {
            contentClarity: parseFloat(contentClarity),
            engagementDelivery: parseFloat(engagementDelivery),
            impactEffectiveness: parseFloat(impactEffectiveness)
        };
        
        // Calculate overall score as average of the three criteria
        const overallScore = calculateAverageScore(criteriaScores);
        
        // Update the submission
        submission.criteriaScores = criteriaScores;
        submission.score = overallScore;
        submission.feedback = feedback || '';
        submission.status = 'evaluated';
        submission.reviewedAt = new Date();
        submission.reviewedBy = req.userId;
        
        await submission.save();
        
        return res.status(200).json({
            success: true,
            message: 'Submission evaluated successfully',
            data: {
                id: submission._id,
                score: overallScore,
                criteriaScores,
                feedback: submission.feedback,
                reviewedAt: submission.reviewedAt
            }
        });
    } catch (error) {
        console.error('Error evaluating submission:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to evaluate submission',
            error: error.message
        });
    }
};