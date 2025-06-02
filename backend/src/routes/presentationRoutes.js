import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { authenticateToken } from '../middleware/auth.js';
import {
    uploadPresentation,
    startPresentation,
    completePresentation,
    getSubmission,
    listSubmissions,
    getSlideImage,
    getSlideThumbnail,
    getRecording
} from '../controllers/presentationController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const presentationDir = path.join(uploadsDir, 'presentations');
        if (!fs.existsSync(presentationDir)) {
            fs.mkdirSync(presentationDir, { recursive: true });
        }
        cb(null, presentationDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['.pdf', '.ppt', '.pptx'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF, PPT, and PPTX files are allowed'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    }
});

// Create router
const router = express.Router();

// Routes
// Upload presentation file
router.post('/upload', 
    authenticateToken,
    upload.single('presentationFile'),
    uploadPresentation
);

// Start presentation recording
router.post('/:submissionId/start', 
    authenticateToken,
    startPresentation
);

// Complete presentation recording
router.post('/:submissionId/complete', 
    authenticateToken,
    express.json({ limit: '100mb' }),
    completePresentation
);

// Get slide image
router.get('/:submissionId/slides/:slideNumber', 
    authenticateToken,
    getSlideImage
);

// Get slide thumbnail
router.get('/:submissionId/slides/:slideNumber/thumbnail', 
    authenticateToken,
    getSlideThumbnail
);

// Get recording
router.get('/:submissionId/recording', 
    authenticateToken,
    getRecording
);

// Get submission details
router.get('/:submissionId', 
    authenticateToken,
    getSubmission
);

// List user's submissions
router.get('/', 
    authenticateToken,
    listSubmissions
);

// Serve uploaded files (this should be after all other routes)
router.use('/uploads', express.static(uploadsDir));

export default router;
