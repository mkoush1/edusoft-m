import express from 'express';
import { authenticateToken } from '../../middleware/auth.js';
import PresentationSubmission from '../../models/PresentationSubmission.js';
import cloudinary from '../../config/cloudinary.js';

const router = express.Router();

// Get presentation videos
router.get('/videos', authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        console.log('Fetching videos for user ID:', userId);

        // Get all presentation submissions for the user with populated user information
        const submissions = await PresentationSubmission.find({ userId })
            .populate({
                path: 'userId',
                select: 'name email',
                model: 'User'
            })
            .sort({ submittedAt: -1 });

        console.log('Found submissions:', submissions.length);
        console.log('First submission user data:', submissions[0]?.userId);

        if (!submissions || submissions.length === 0) {
            return res.json([]);
        }

        // Format the response to include user information
        const formattedSubmissions = submissions.map(submission => {
            console.log('Processing submission:', submission._id);
            console.log('User data:', submission.userId);

            const username = submission.userId?.name || 'Unknown User';
            console.log('Extracted username:', username);

            return {
                ...submission.toObject(),
                username: username
            };
        });

        console.log('Formatted submissions:', formattedSubmissions);
        res.json(formattedSubmissions);
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({ message: 'Error fetching videos', error: error.message });
    }
});

// Get presentation recommendations
router.get('/recommendations', authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;

        // Get the user's latest presentation submission
        const submission = await PresentationSubmission.findOne({ userId })
            .sort({ createdAt: -1 });

        if (!submission) {
            return res.status(404).json({ message: 'No presentation submission found' });
        }

        // TODO: Implement actual AI analysis of the video
        // For now, return detailed recommendations with course suggestions
        const recommendations = {
            overallScore: 75,
            strengths: [
                'Clear and confident voice',
                'Good eye contact with the camera',
                'Well-structured responses',
                'Professional appearance',
                'Good use of pauses'
            ],
            improvements: [
                'Could use more hand gestures',
                'Consider varying tone and pace',
                'Add more specific examples',
                'Work on reducing filler words',
                'Practice maintaining consistent energy'
            ],
            recommendations: [
                {
                    title: 'Public Speaking Mastery',
                    description: 'Learn advanced techniques for engaging presentations, including body language, voice modulation, and audience interaction.',
                    link: 'https://www.coursera.org/learn/public-speaking'
                },
                {
                    title: 'Presentation Design Principles',
                    description: 'Master the art of creating visually appealing and effective presentation slides that support your message.',
                    link: 'https://www.udemy.com/course/presentation-design/'
                },
                {
                    title: 'Storytelling for Presentations',
                    description: 'Learn how to craft compelling narratives that make your presentations more memorable and impactful.',
                    link: 'https://www.linkedin.com/learning/storytelling-for-presentations'
                },
                {
                    title: 'Confidence Building for Speakers',
                    description: 'Develop the confidence and presence needed to deliver powerful presentations in any setting.',
                    link: 'https://www.skillshare.com/classes/Confidence-Building-for-Public-Speaking'
                }
            ]
        };

        res.json(recommendations);
    } catch (error) {
        console.error('Error getting recommendations:', error);
        res.status(500).json({ message: 'Error getting recommendations', error: error.message });
    }
});

// Delete presentation video
router.delete('/videos/:videoId', authenticateToken, async (req, res) => {
    try {
        const { videoId } = req.params;
        const userId = req.userId;

        // Find the submission
        const submission = await PresentationSubmission.findOne({
            _id: videoId,
            userId: userId
        });

        if (!submission) {
            return res.status(404).json({ message: 'Video not found' });
        }

        // Extract public_id from Cloudinary URL
        const videoUrl = submission.videoPath;
        const publicId = videoUrl.split('/').slice(-2).join('/').split('.')[0];
        console.log('Deleting video with public_id:', publicId);

        // Delete from Cloudinary
        try {
            await cloudinary.uploader.destroy(publicId, {
                resource_type: 'video'
            });
            console.log('Successfully deleted from Cloudinary');
        } catch (cloudinaryError) {
            console.error('Error deleting from Cloudinary:', cloudinaryError);
            // Continue with MongoDB deletion even if Cloudinary deletion fails
        }

        // Delete from MongoDB
        await PresentationSubmission.findByIdAndDelete(videoId);
        console.log('Successfully deleted from MongoDB');

        res.json({ message: 'Video deleted successfully' });
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({ message: 'Error deleting video', error: error.message });
    }
});

// Check if user has completed presentation assessment
router.get('/check-completion', authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;

        // Count the number of submissions for this user
        const submissionCount = await PresentationSubmission.countDocuments({ userId });

        res.json({
            completed: submissionCount >= 3,
            submissionCount
        });
    } catch (error) {
        console.error('Error checking completion:', error);
        res.status(500).json({ message: 'Error checking completion status', error: error.message });
    }
});

export default router;
