const express = require('express');
const router = express.Router();
const multer = require('multer');
const { MongoClient, GridFSBucket } = require('mongodb');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only video files
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only video files are allowed!'), false);
        }
    }
});

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edusoft';
let gfs;

// Initialize GridFS when MongoDB connection is ready
const initializeGridFS = () => {
    try {
        gfs = new GridFSBucket(mongoose.connection.db, {
            bucketName: 'presentationVideos'
        });
        console.log('GridFS initialized successfully');
    } catch (error) {
        console.error('Error initializing GridFS:', error);
    }
};

// Check if MongoDB is connected and initialize GridFS
if (mongoose.connection.readyState === 1) {
    initializeGridFS();
} else {
    mongoose.connection.once('open', initializeGridFS);
}

// Submit presentation video
router.post('/submit', auth, upload.single('video'), async (req, res) => {
    try {
        console.log('Received upload request');
        console.log('Request body:', req.body);
        console.log('File info:', req.file ? {
            size: req.file.size,
            mimetype: req.file.mimetype,
            originalname: req.file.originalname
        } : 'No file');

        if (!req.file) {
            console.error('No file received in request');
            return res.status(400).json({
                success: false,
                message: 'No video file provided',
                details: 'The request did not contain a video file'
            });
        }

        const { questionId, userId } = req.body;
        if (!questionId || !userId) {
            console.error('Missing required fields:', { questionId, userId });
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                details: `Missing: ${!questionId ? 'questionId ' : ''}${!userId ? 'userId' : ''}`
            });
        }

        // Verify GridFS is initialized
        if (!gfs) {
            console.error('GridFS not initialized');
            return res.status(500).json({
                success: false,
                message: 'Server configuration error',
                details: 'GridFS storage not properly initialized'
            });
        }

        // Create a unique filename
        const filename = `${userId}_${questionId}_${Date.now()}.webm`;

        console.log('Starting GridFS upload for file:', filename);

        // Create a write stream to GridFS
        const writeStream = gfs.openUploadStream(filename, {
            metadata: {
                userId,
                questionId,
                timestamp: new Date(),
                contentType: 'video/webm'
            }
        });

        // Write the buffer to GridFS
        writeStream.write(req.file.buffer);
        writeStream.end();

        writeStream.on('finish', async (file) => {
            try {
                console.log('GridFS upload complete, file ID:', file._id);

                // Store the file reference in your assessments collection
                const assessment = await mongoose.model('Assessment').create({
                    userId,
                    questionId,
                    videoId: file._id,
                    filename,
                    status: 'completed',
                    submittedAt: new Date()
                });

                console.log('Assessment record created:', assessment._id);

                res.json({
                    success: true,
                    message: 'Video uploaded successfully',
                    fileId: file._id,
                    assessmentId: assessment._id
                });
            } catch (error) {
                console.error('Error saving assessment:', error);
                // Try to delete the uploaded file if assessment creation fails
                try {
                    await gfs.delete(file._id);
                    console.log('Deleted orphaned file from GridFS');
                } catch (deleteError) {
                    console.error('Error deleting orphaned file:', deleteError);
                }
                res.status(500).json({
                    success: false,
                    message: 'Error saving assessment record',
                    details: error.message
                });
            }
        });

        writeStream.on('error', (error) => {
            console.error('Error uploading to GridFS:', error);
            res.status(500).json({
                success: false,
                message: 'Error uploading video',
                details: error.message
            });
        });

    } catch (error) {
        console.error('Error in video submission:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during video submission',
            details: error.message
        });
    }
});

// Get video stream
router.get('/video/:id', auth, async (req, res) => {
    try {
        const fileId = new mongoose.Types.ObjectId(req.params.id);

        const file = await gfs.find({ _id: fileId }).toArray();
        if (!file || file.length === 0) {
            return res.status(404).json({ success: false, message: 'Video not found' });
        }

        // Set appropriate headers
        res.set('Content-Type', file[0].metadata.contentType);
        res.set('Content-Disposition', `inline; filename="${file[0].filename}"`);

        // Create read stream and pipe to response
        const readStream = gfs.openDownloadStream(fileId);
        readStream.pipe(res);

        readStream.on('error', (error) => {
            console.error('Error streaming video:', error);
            res.status(500).json({ success: false, message: 'Error streaming video' });
        });

    } catch (error) {
        console.error('Error retrieving video:', error);
        res.status(500).json({ success: false, message: 'Error retrieving video' });
    }
});

module.exports = router; 