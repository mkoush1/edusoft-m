import cloudinary from '../config/cloudinary.js';
import PresentationSubmission from '../models/PresentationSubmission.js';
import PresentationQuestion from '../models/PresentationQuestion.js';
import User from '../models/User.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
        
        // Get all video submissions with user data populated
        const submissions = await PresentationSubmission.find()
            .sort({ submittedAt: -1 }); // Most recent first
        
        console.log(`Found ${submissions.length} video submissions`);
        
        // Get all user IDs from submissions
        const userIds = [...new Set(submissions.map(sub => sub.userId))];
        console.log(`Found ${userIds.length} unique users`);
        
        // Fetch all users in one query
        const users = await User.find({ _id: { $in: userIds } });
        console.log(`Fetched ${users.length} users`);
        
        // Create a map of userId to username for quick lookup
        const userMap = {};
        users.forEach(user => {
            userMap[user._id.toString()] = user.name || 'Unknown User';
        });
        
        // Format the response with username information
        const videos = submissions.map(submission => {
            const userId = submission.userId.toString();
            return {
                _id: submission._id,
                userId: submission.userId,
                username: userMap[userId] || 'Unknown User',
                questionId: submission.questionId,
                videoPath: submission.videoPath,
                submittedAt: submission.submittedAt,
                score: submission.score || null,
                feedback: submission.feedback || '',
                reviewedAt: submission.reviewedAt || null
            };
        });
        
        res.status(200).json(videos);
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

export const submitPresentation = async (req, res) => {
    try {
        if (!req.files || !req.files.video) {
            return res.status(400).json({
                success: false,
                message: 'No video file uploaded'
            });
        }

        const { questionId, userId } = req.body;
        const videoFile = req.files.video;

        console.log('Received file:', req.files);
        console.log('Received body:', req.body);

        // Determine which question folder to use based on questionId
        let folderPath;
        if (questionId == 1) {
            folderPath = 'presentation-assessment/Question 1';
        } else if (questionId == 2) {
            folderPath = 'presentation-assessment/Question 2';
        } else if (questionId == 3) {
            folderPath = 'presentation-assessment/Question 3';
        } else {
            folderPath = 'presentation-assessment'; // Default fallback
        }
        
        console.log(`Uploading to Cloudinary folder: ${folderPath}`);
        
        const result = await cloudinary.uploader.upload(videoFile.tempFilePath, {
            resource_type: 'video',
            folder: folderPath,
            allowed_formats: ['mp4', 'webm'],
            transformation: [
                { quality: 'auto' },
                { fetch_format: 'auto' }
            ]
        });

        // Create submission record
        const submission = new PresentationSubmission({
            userId,
            questionId,
            videoPath: result.secure_url,
            cloudinaryId: result.public_id
        });

        await submission.save();

        res.status(200).json({
            success: true,
            message: 'Video uploaded successfully',
            data: {
                submissionId: submission._id,
                videoUrl: result.secure_url
            }
        });
    } catch (error) {
        console.error('Error in submitPresentation:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading video',
            error: error.message,
            stack: error.stack
        });
    }
}; 