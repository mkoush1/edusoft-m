import express from 'express';
import readingAssessmentController from '../controllers/readingAssessmentController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Submit a reading assessment
router.post('/submit', readingAssessmentController.submitAssessment);

// Check if a user can take a specific reading assessment
router.get('/availability', readingAssessmentController.checkAvailability);

// Get reading assessment data (this would be handled by frontend local data for now)
router.get('/data', (req, res) => {
  const { level, language } = req.query;
  
  console.log(`Received request for reading assessment data: level=${level}, language=${language}`);
  
  // Return a proper response with data structure
  res.status(200).json({
    success: true,
    message: 'Reading assessment data retrieved successfully',
    data: {
      level: level || 'a1',
      language: language || 'english',
      title: `${level?.toUpperCase() || 'A1'} Reading Assessment`,
      // The actual data will be handled by the frontend's local data
      // This is just a signal to the frontend that the API call was successful
      dataAvailable: true
    }
  });
});

// Get reading assessment history for the current user
router.get('/history', readingAssessmentController.getAssessmentHistory);

// Get reading assessment statistics for the current user
router.get('/statistics', readingAssessmentController.getStatistics);

// Fix export for ESM
const readingAssessmentRoutes = router;
export default readingAssessmentRoutes; 