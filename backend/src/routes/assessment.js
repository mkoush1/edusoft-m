import express from 'express';
import auth from '../middleware/auth.js';
import Assessment from '../models/Assessment.js';
import AssessmentResult from '../models/AssessmentResult.js';
import TestQuestion from '../models/TestQuestion.js';
import User from '../models/User.js';

const router = express.Router();

// Helper function to calculate score
const calculateScore = (question, answer) => {
  // Add your scoring logic here
  return 0; // Placeholder
};

// Get user's assessment status
router.get('/status/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Get all available assessments
    const availableAssessments = await Assessment.find();
    
    // Get user's completed assessments
    const user = await User.findById(userId);
    const completedAssessmentTypes = user.completedAssessments.map(a => a.assessmentType);
    
    // Filter out completed assessments that are not eligible for retake
    const remainingAssessments = availableAssessments.filter(assessment => {
      const completedAssessment = user.completedAssessments.find(
        a => a.assessmentType === assessment.type
      );
      
      if (!completedAssessment) return true;
      
      // Check if a week has passed since completion
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      return completedAssessment.completedAt < oneWeekAgo;
    });

    res.json({
      success: true,
      data: {
        availableAssessments: remainingAssessments,
        completedAssessments: user.completedAssessments,
        totalAvailable: remainingAssessments.length,
        totalCompleted: user.totalAssessmentsCompleted,
        progress: user.progress
      }
    });
  } catch (error) {
    console.error('Error getting assessment status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get assessment status'
    });
  }
});

// Submit assessment
router.post('/submit', auth, async (req, res) => {
  try {
    const { assessmentType, answers } = req.body;
    const userId = req.user._id;

    // Check if user has already completed this assessment
    const user = await User.findById(userId);
    const existingAssessment = user.completedAssessments.find(
      a => a.assessmentType === assessmentType
    );

    if (existingAssessment) {
      // Check if a week has passed since last completion
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      if (existingAssessment.completedAt > oneWeekAgo) {
        return res.status(400).json({
          success: false,
          error: 'You can only retake this assessment after one week'
        });
      }
    }

    // Calculate scores
    const sectionScores = {};
    let totalScore = 0;
    let maxTotalScore = 0;

    for (const [section, sectionAnswers] of Object.entries(answers)) {
      const questions = await TestQuestion.find({ 
        assessmentType,
        section 
      }).sort('questionNumber');

      let sectionScore = 0;
      let maxSectionScore = 0;

      questions.forEach((question, index) => {
        const answer = sectionAnswers[index];
        const score = calculateScore(question, answer);
        sectionScore += score;
        maxSectionScore += question.maxScore;
      });

      sectionScores[section] = {
        score: sectionScore,
        maxScore: maxSectionScore,
        percentage: (sectionScore / maxSectionScore) * 100
      };

      totalScore += sectionScore;
      maxTotalScore += maxSectionScore;
    }

    const percentage = (totalScore / maxTotalScore) * 100;

    // Save assessment result
    const assessmentResult = new AssessmentResult({
      userId,
      assessmentType,
      answers,
      sectionScores,
      totalScore,
      maxTotalScore,
      percentage,
      completedAt: new Date()
    });

    await assessmentResult.save();

    // Update user's completed assessments and progress
    if (existingAssessment) {
      // Update existing assessment
      existingAssessment.completedAt = new Date();
      existingAssessment.score = percentage;
    } else {
      // Add new completion
      user.completedAssessments.push({
        assessmentType,
        completedAt: new Date(),
        score: percentage
      });
      user.totalAssessmentsCompleted += 1;
    }
    
    // Update progress based on completed assessments
    const totalAssessments = await Assessment.countDocuments();
    user.progress = Math.min(100, (user.totalAssessmentsCompleted / totalAssessments) * 100);
    
    await user.save();

    // Get updated assessment status
    const availableAssessments = await Assessment.find();
    const completedAssessmentTypes = user.completedAssessments.map(a => a.assessmentType);
    const remainingAssessments = availableAssessments.filter(assessment => {
      const completedAssessment = user.completedAssessments.find(
        a => a.assessmentType === assessment.type
      );
      
      if (!completedAssessment) return true;
      
      // Check if a week has passed since completion
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      return completedAssessment.completedAt < oneWeekAgo;
    });

    res.json({
      success: true,
      data: {
        sectionScores,
        totalScore,
        maxTotalScore,
        percentage,
        completedAt: assessmentResult.completedAt,
        assessmentStatus: {
          availableAssessments: remainingAssessments,
          completedAssessments: user.completedAssessments,
          totalAvailable: remainingAssessments.length,
          totalCompleted: user.totalAssessmentsCompleted,
          progress: user.progress
        }
      }
    });
  } catch (error) {
    console.error('Error submitting assessment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit assessment'
    });
  }
});

export default router; 