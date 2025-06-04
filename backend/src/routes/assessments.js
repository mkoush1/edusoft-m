import express from 'express';
import Assessment from '../models/assessment.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get assessment results
router.get('/results/:category', authenticateToken, async (req, res) => {
  try {
    const { category } = req.params;
    const userId = req.userId;

    // For now, return mock results
    // In a real application, you would fetch this from a database
    let results = {
      scores: {
        vision: 4.2,
        ethics: 3.8,
        communication: 4.5,
        teamManagement: 3.5,
        decisionMaking: 4.0,
        adaptability: 3.9
      },
      overallScore: 80,
      recommendations: [
        {
          area: 'Team Management',
          suggestion: 'Work on delegation skills and empowering team members to take ownership of their tasks.'
        },
        {
          area: 'Decision Making',
          suggestion: 'Practice making decisions with incomplete information and learn to balance analysis with action.'
        },
        {
          area: 'Communication',
          suggestion: 'Continue developing your active listening skills and adapt your communication style to different audiences.'
        }
      ],
      nextSteps: [
        'Take a course on effective delegation',
        'Practice decision-making in ambiguous situations',
        'Seek feedback from team members on your leadership style',
        'Find a mentor who excels in areas where you want to improve',
        'Read books on leadership communication strategies',
        'Join a leadership community or network'
      ]
    };

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Error getting assessment results:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting assessment results',
      error: error.message
    });
  }
});

// Get all assessments (public)
router.get('/', async (req, res) => {
  try {
    const assessments = await Assessment.find({ isActive: true })
      .select('-__v -createdAt -updatedAt')
      .sort({ title: 1 });
    
    res.json(assessments);
  } catch (error) {
    console.error('Error fetching assessments:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching assessments',
      error: error.message 
    });
  }
});

// Get assessment by ID (public)
router.get('/:id', async (req, res) => {
  try {
    console.log('GET /api/assessments/:id called with id:', req.params.id);
    const assessment = await Assessment.findById(req.params.id)
      .select('-__v -createdAt -updatedAt');
    
    if (!assessment) {
      console.log('Assessment not found for id:', req.params.id);
      return res.status(404).json({ 
        success: false, 
        message: 'Assessment not found' 
      });
    }
    
    if (!assessment.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'This assessment is not currently available' 
      });
    }
    
    res.json(assessment);
  } catch (error) {
    console.error('Error fetching assessment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching assessment',
      error: error.message 
    });
  }
});

// Get assessment status for a specific user
router.get('/status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get all assessments
    const assessments = await Assessment.find({ isActive: true });
    
    // Get user's completed assessments (you'll need to implement this based on your data model)
    // For now, we'll return an empty array
    const userCompletedAssessments = [];
    
    // Map assessments to include completion status
    const assessmentsWithStatus = assessments.map(assessment => ({
      _id: assessment._id,
      title: assessment.title,
      description: assessment.description,
      category: assessment.category,
      duration: assessment.duration,
      isCompleted: userCompletedAssessments.some(
        completed => completed.assessmentType === assessment.category
      ),
      completedAt: userCompletedAssessments.find(
        completed => completed.assessmentType === assessment.category
      )?.completedAt || null,
      score: userCompletedAssessments.find(
        completed => completed.assessmentType === assessment.category
      )?.score || null
    }));
    
    res.json({
      success: true,
      data: {
        assessments: assessmentsWithStatus,
        completedAssessments: userCompletedAssessments
      }
    });
  } catch (error) {
    console.error('Error getting assessment status:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting assessment status',
      error: error.message
    });
  }
});

// Get assessment results
router.get('/results/:category', authenticateToken, async (req, res) => {
  try {
    const { category } = req.params;
    const userId = req.userId;

    // For now, return mock results
    // In a real application, you would fetch this from a database
    let results = {
      scores: {
        vision: 4.2,
        ethics: 3.8,
        communication: 4.5,
        teamManagement: 3.5,
        decisionMaking: 4.0,
        adaptability: 3.9
      },
      overallScore: 80,
      recommendations: [
        {
          area: 'Team Management',
          suggestion: 'Work on delegation skills and empowering team members to take ownership of their tasks.'
        },
        {
          area: 'Decision Making',
          suggestion: 'Practice making decisions with incomplete information and learn to balance analysis with action.'
        },
        {
          area: 'Communication',
          suggestion: 'Continue developing your active listening skills and adapt your communication style to different audiences.'
        }
      ],
      nextSteps: [
        'Take a course on effective delegation',
        'Practice decision-making in ambiguous situations',
        'Seek feedback from team members on your leadership style',
        'Find a mentor who excels in areas where you want to improve',
        'Read books on leadership communication strategies',
        'Join a leadership community or network'
      ]
    };

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Error getting assessment results:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting assessment results',
      error: error.message
    });
  }
});

// Submit an assessment
router.post('/submit/:category', authenticateToken, async (req, res) => {
  try {
    const { category } = req.params;
    const userId = req.userId;
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid answers format'
      });
    }

    // Find the assessment by category
    const assessment = await Assessment.findOne({ category, isActive: true });
    
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found or not available'
      });
    }

    // Calculate score (average of all answer scores)
    const totalScore = answers.reduce((sum, answer) => sum + answer.score, 0);
    const averageScore = (totalScore / answers.length) * 20; // Scale to 0-100

    // TODO: Save the submission to the database
    // For now, just return the score

    res.json({
      success: true,
      data: {
        score: averageScore,
        category,
        completedAt: new Date(),
        answers
      }
    });

  } catch (error) {
    console.error('Error submitting assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting assessment',
      error: error.message
    });
  }
});

// Start a new assessment by category
router.post('/start/:category', authenticateToken, async (req, res) => {
  try {
    const { category } = req.params;
    const userId = req.userId;

    // Find the assessment by category
    const assessment = await Assessment.findOne({ category, isActive: true });
    
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found or not available'
      });
    }

    // Check if user has already completed this assessment
    // TODO: Implement this check based on your data model
    // const existingSubmission = await AssessmentSubmission.findOne({
    //   userId,
    //   assessmentId: assessment._id
    // });
    // 
    // if (existingSubmission) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'You have already completed this assessment'
    //   });
    // }


    // Return the assessment with questions
    res.json({
      success: true,
      data: {
        questions: assessment.questions || [],
        duration: assessment.duration || 45, // Default to 45 minutes if not set
        title: assessment.title,
        description: assessment.description
      }
    });

  } catch (error) {
    console.error('Error starting assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting assessment',
      error: error.message
    });
  }
});

// Get assessment by category (public)
router.get('/category/:category', async (req, res) => {
  try {
    const assessment = await Assessment.findOne({ 
      category: req.params.category,
      isActive: true 
    }).select('-__v -createdAt -updatedAt');
    
    if (!assessment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Assessment not found or not available' 
      });
    }
    
    res.json(assessment);
  } catch (error) {
    console.error('Error fetching assessment by category:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching assessment',
      error: error.message 
    });
  }
});

// Admin routes

// Create a new assessment (admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title, description, category, duration, image } = req.body;
    
    const newAssessment = new Assessment({
      title,
      description,
      category,
      duration: duration || 30,
      image: image || '/eduSoft_logo.png'
    });
    
    const savedAssessment = await newAssessment.save();
    
    res.status(201).json({
      success: true,
      message: 'Assessment created successfully',
      data: savedAssessment
    });
  } catch (error) {
    console.error('Error creating assessment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating assessment',
      error: error.message 
    });
  }
});

// Update an assessment (admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    console.log('PUT /api/assessments/:id called with id:', req.params.id);
    const { title, description, duration, isActive, image, category } = req.body;
    
    // Build update object dynamically to avoid overwriting fields with undefined
    const updateFields = { updatedAt: Date.now() };
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (duration !== undefined) updateFields.duration = duration;
    if (isActive !== undefined) updateFields.isActive = isActive;
    if (image !== undefined) updateFields.image = image;
    if (category !== undefined) updateFields.category = category;

    const updatedAssessment = await Assessment.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );
    
    if (!updatedAssessment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Assessment not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Assessment updated successfully',
      data: updatedAssessment
    });
  } catch (error) {
    console.error('Error updating assessment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating assessment',
      error: error.message 
    });
  }
});

// Delete an assessment (admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const deletedAssessment = await Assessment.findByIdAndDelete(req.params.id);
    
    if (!deletedAssessment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Assessment not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Assessment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting assessment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting assessment',
      error: error.message 
    });
  }
});

export default router;