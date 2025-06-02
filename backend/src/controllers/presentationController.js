import mongoose from 'mongoose';
import cloudinary from '../config/cloudinary.js';
import PresentationSubmission from '../models/PresentationSubmission.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { createCanvas } from 'canvas';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper function to create a placeholder slide
async function createPlaceholderSlide(outputDir, slideNumber = 1) {
    try {
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const fileName = `slide-${slideNumber}.png`;
        const placeholderImage = path.join(outputDir, fileName);
        
        // Create a canvas with the placeholder
        const canvas = createCanvas(1280, 720);
        const ctx = canvas.getContext('2d');
        
        // Background
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, 1280, 720);
        
        // Border
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 10;
        ctx.strokeRect(5, 5, 1270, 710);
        
        // Text
        ctx.fillStyle = '#666';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`Slide ${slideNumber} Placeholder`, 1280/2, 720/2);
        
        // Save the image
        const out = fs.createWriteStream(placeholderImage);
        const stream = canvas.createPNGStream();
        stream.pipe(out);
        
        return new Promise((resolve, reject) => {
            out.on('finish', () => resolve({
                slideNumber,
                path: placeholderImage,
                text: `Slide ${slideNumber} content would appear here in production`
            }));
            out.on('error', reject);
        });
    } catch (error) {
        console.error('Error creating placeholder slide:', error);
        throw new Error('Failed to create placeholder slide: ' + error.message);
    }
}

// In a production environment, you would implement functions here to convert
// PDF and PowerPoint files to images using a service like Cloudinary or a dedicated library

// Upload presentation file and convert to slides
export const uploadPresentation = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { questionId, title, description } = req.body;
        const userId = req.user._id;
        
        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        // Create a submission record
        const submission = new PresentationSubmission({
            userId,
            questionId: parseInt(questionId),
            title,
            description,
            status: 'draft',
            presentationFile: {
                url: `/uploads/${req.file.filename}`,
                format: path.extname(req.file.originalname).substring(1).toLowerCase(),
                pageCount: 0 // Will be updated after processing
            }
        });

        try {
            // Create a temporary directory for this submission
            const tempDir = path.join(process.cwd(), 'temp', submission._id.toString());
            
            // Create a placeholder slide instead of processing the actual file
            const slide = await createPlaceholderSlide(tempDir, 1);
            
            // Clean up the uploaded file since we're not using it
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            
            // Update the submission with the placeholder slide
            submission.presentationFile.pageCount = 1;
            submission.slides = [{
                slideNumber: 1,
                imageUrl: `/api/presentations/${submission._id}/slides/1`,
                thumbnailUrl: `/api/presentations/${submission._id}/slides/1/thumbnail`,
                notes: 'This is a placeholder slide. In production, your actual slides would appear here.'
            }];
            
            // Save the submission
            await submission.save();
            
            // Cleanup temp files
            if (fs.existsSync(tempDir)) {
                fs.rmSync(tempDir, { recursive: true, force: true });
            }
            
            res.status(201).json({
                message: 'Presentation uploaded successfully',
                submissionId: submission._id,
                slides: submission.slides
            });
            
        } catch (error) {
            console.error('Error processing presentation:', error);
            // Clean up the uploaded file if there was an error
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            throw error;
        }
        
    } catch (error) {
        console.error('Error uploading presentation:', error);
        res.status(500).json({ 
            error: 'Failed to process presentation',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Start presentation recording
export const startPresentation = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const submission = await PresentationSubmission.findById(submissionId);
        
        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }
        
        if (submission.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        // Update submission status and start time
        submission.status = 'in_progress';
        submission.startedAt = new Date();
        await submission.save();
        
        // Generate a unique token for the recording session
        const recordingToken = uuidv4();
        
        res.json({
            message: 'Presentation recording started',
            submissionId: submission._id,
            recordingToken,
            slides: submission.slides
        });
        
    } catch (error) {
        console.error('Error starting presentation:', error);
        res.status(500).json({ error: 'Failed to start presentation' });
    }
};

// Complete presentation recording
export const completePresentation = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { recordingData } = req.body;
        
        const submission = await PresentationSubmission.findById(submissionId);
        
        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }
        
        if (submission.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        // Upload screen recording to Cloudinary
        const screenResult = await cloudinary.uploader.upload(recordingData.screenRecording, {
            resource_type: 'video',
            folder: `presentations/${submission._id}/recordings`,
            public_id: 'screen_recording',
            overwrite: true
        });
        
        // Upload webcam recording if available
        let webcamResult;
        if (recordingData.webcamRecording) {
            webcamResult = await cloudinary.uploader.upload(recordingData.webcamRecording, {
                resource_type: 'video',
                folder: `presentations/${submission._id}/recordings`,
                public_id: 'webcam_recording',
                overwrite: true
            });
        }
        
        // Combine recordings if both are available
        let combinedResult;
        if (screenResult && webcamResult) {
            // This is a simplified example - in a real app, you'd use a video processing service
            // to combine the videos with Picture-in-Picture effect
            combinedResult = {
                secure_url: screenResult.secure_url, // Replace with actual combined URL
                duration: Math.max(screenResult.duration, webcamResult?.duration || 0)
            };
        }
        
        // Update submission with recording data
        submission.screenRecording = {
            url: screenResult.secure_url,
            duration: screenResult.duration,
            size: screenResult.bytes
        };
        
        if (webcamResult) {
            submission.webcamRecording = {
                url: webcamResult.secure_url,
                duration: webcamResult.duration
            };
        }
        
        if (combinedResult) {
            submission.combinedRecording = {
                url: combinedResult.secure_url,
                duration: combinedResult.duration
            };
        }
        
        submission.slideTimings = recordingData.slideTimings || [];
        submission.status = 'submitted';
        submission.submittedAt = new Date();
        
        await submission.save();
        
        res.json({
            message: 'Presentation submitted successfully',
            submissionId: submission._id,
            recording: {
                screen: submission.screenRecording,
                webcam: submission.webcamRecording,
                combined: submission.combinedRecording
            }
        });
        
    } catch (error) {
        console.error('Error completing presentation:', error);
        res.status(500).json({ error: 'Failed to complete presentation' });
    }
};

// Get presentation submission
export const getSubmission = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const submission = await PresentationSubmission.findById(submissionId)
            .populate('userId', 'name email')
            .populate('reviewedBy', 'name');
            
        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }
        
        // Only allow the owner or an admin to view the submission
        if (submission.userId._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        res.json(submission);
        
    } catch (error) {
        console.error('Error fetching submission:', error);
        res.status(500).json({ error: 'Failed to fetch submission' });
    }
};

// List user's presentation submissions
export const listSubmissions = async (req, res) => {
    try {
        const { status, limit = 10, page = 1 } = req.query;
        const query = { userId: req.user._id };
        
        if (status) {
            query.status = status;
        }
        
        const submissions = await PresentationSubmission.find(query)
            .sort({ submittedAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
            
        const total = await PresentationSubmission.countDocuments(query);
        
        res.json({
            data: submissions,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
        
    } catch (error) {
        console.error('Error listing submissions:', error);
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
};

// Get slide image
export const getSlideImage = async (req, res) => {
    try {
        const { submissionId, slideNumber } = req.params;
        
        const submission = await PresentationSubmission.findById(submissionId);
        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }
        
        // In a real app, you'd check if the user has permission to view this slide
        if (submission.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        // Serve the slide placeholder image
        res.sendFile(path.join(process.cwd(), 'public/placeholder-slide.png'));
        
    } catch (error) {
        console.error('Error getting slide image:', error);
        res.status(500).json({ error: 'Failed to get slide image' });
    }
};

// Get slide thumbnail
export const getSlideThumbnail = async (req, res) => {
    try {
        const { submissionId, slideNumber } = req.params;
        
        const submission = await PresentationSubmission.findById(submissionId);
        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }
        
        // In a real app, you'd check if the user has permission to view this thumbnail
        if (submission.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        // Serve the thumbnail placeholder image
        res.sendFile(path.join(process.cwd(), 'public/placeholder-thumbnail.png'));
        
    } catch (error) {
        console.error('Error getting slide thumbnail:', error);
        res.status(500).json({ error: 'Failed to get slide thumbnail' });
    }
};

// Get recording
export const getRecording = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const submission = await PresentationSubmission.findById(submissionId);
        
        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }
        
        // Check if user has permission to view this submission
        if (submission.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        // In a real app, you'd serve the actual recording file
        // For now, we'll return the recording URL if it exists
        if (submission.combinedRecording?.url) {
            return res.redirect(submission.combinedRecording.url);
        } else if (submission.screenRecording?.url) {
            return res.redirect(submission.screenRecording.url);
        } else {
            return res.status(404).json({ error: 'Recording not found' });
        }
        
    } catch (error) {
        console.error('Error getting recording:', error);
        res.status(500).json({ error: 'Failed to get recording' });
    }
};
