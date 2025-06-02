import cloudinary from '../config/cloudinary.js';
import PresentationSubmission from '../models/PresentationSubmission.js';
import User from '../models/User.js';
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

export const submitPresentation = async (req, res) => {
    let videoResult = null;
    let presentationResult = null;
    
    try {
        // Check if user has already submitted an assessment
        const existingSubmission = await PresentationSubmission.findOne({ userId: req.user._id });
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
        const userId = req.user._id;
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

            // Upload presentation file to Google Drive
            console.log('Uploading presentation to Google Drive...');
            presentationResult = await uploadToDrive(presentationFile, process.env.GOOGLE_DRIVE_FOLDER_ID);
            console.log('Presentation uploaded to Google Drive:', presentationResult.webViewLink);

            // Get user details to include username
            const user = await User.findById(userId).select('username').lean();
            
            // Create submission record
            const submission = new PresentationSubmission({
                userId,
                username: user?.username,
                questionId,
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
                status: 'pending_review',
                submittedAt: new Date()
            });

            await submission.save();
            console.log('Submission saved to database');

            return res.status(200).json({
                success: true,
                message: 'Files uploaded successfully',
                data: {
                    submissionId: submission._id,
                    videoUrl: videoResult.secure_url,
                    presentationFile: {
                        id: presentationResult.fileId,
                        name: presentationFile.name,
                        downloadLink: presentationResult.downloadLink,
                        webViewLink: presentationResult.webViewLink,
                        size: presentationFile.size
                    },
                    title: submission.title
                }
            });
        } catch (uploadError) {
            console.error('Error during file uploads:', uploadError);
            
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
            
            throw uploadError;
        }
    } catch (error) {
        console.error('Error in submitPresentation:', error);
        
        let errorMessage = 'Error uploading files';
        if (error.code === 'LIMIT_FILE_SIZE') {
            errorMessage = 'File size is too large. Maximum size is 100MB per file.';
        } else if (error.message.includes('File type not supported')) {
            errorMessage = 'Unsupported file type. Please upload MP4, WebM, or MOV for videos, and PDF, PPT, or PPTX for presentations.';
        }
        
        res.status(500).json({
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
