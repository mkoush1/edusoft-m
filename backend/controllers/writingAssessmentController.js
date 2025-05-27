// writingAssessmentController.js
import writingAssessmentService from '../services/writingAssessmentService.js';
import WritingAssessment from '../models/WritingAssessment.js';
import mongoose from 'mongoose';

/**
 * Controller for writing assessment endpoints
 */
class WritingAssessmentController {
  constructor() {
    // Bind instance methods to this context
    this.evaluateWriting = this.evaluateWriting.bind(this);
    this.submitWritingAssessment = this.submitWritingAssessment.bind(this);
    this.checkAssessmentAvailability = this.checkAssessmentAvailability.bind(this);
    this.getUserWritingAssessments = this.getUserWritingAssessments.bind(this);
    this.checkWritingAssessmentAvailability = this.checkWritingAssessmentAvailability.bind(this);
    this.getWritingAssessmentById = this.getWritingAssessmentById.bind(this);
  }

  /**
   * Evaluate a writing submission
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  async evaluateWriting(req, res) {
    console.log('WritingAssessmentController.evaluateWriting called');
    try {
      const { question, answer } = req.body;
      
      console.log('Request body received:', {
        hasQuestion: !!question,
        questionLength: question?.length || 0,
        hasAnswer: !!answer,
        answerLength: answer?.length || 0
      });
      
      // Validate request
      if (!question || !answer) {
        console.log('Validation failed: Missing question or answer');
        return res.status(400).json({
          success: false,
          message: 'Question and answer are required'
        });
      }
      
      console.log('Validation passed, calling writingAssessmentService.evaluateWriting');
      
      // Call the service to evaluate
      const assessment = await writingAssessmentService.evaluateWriting(question, answer);
      
      console.log('Assessment received from service:', {
        hasAssessment: !!assessment,
        criteriaCount: assessment?.criteria?.length || 0,
        overallScore: assessment?.overallScore
      });
      
      // Return the assessment results
      console.log('Sending successful response to client');
      return res.status(200).json({
        success: true,
        assessment
      });
    } catch (error) {
      console.error('Error in evaluateWriting controller:', {
        message: error.message,
        stack: error.stack
      });
      return res.status(500).json({
        success: false,
        message: 'Failed to evaluate writing',
        error: error.message
      });
    }
  }

  /**
   * Submit a writing assessment to the database
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  async submitWritingAssessment(req, res) {
    try {
      const { type, level, language, score, tasks, feedback } = req.body;
      
      // Get user ID from the authenticated user
      const userId = req.user?._id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }
      
      // Check if user is allowed to take this assessment (not in cooldown period)
      const canTakeAssessment = await this.checkAssessmentAvailability(userId, level, language);
      
      if (!canTakeAssessment.available) {
        return res.status(403).json({
          success: false,
          message: 'You must wait 7 days between assessment attempts',
          nextAvailableDate: canTakeAssessment.nextAvailableDate
        });
      }
      
      // Get the task and response
      const task = tasks[0];
      
      if (!task || !task.response) {
        return res.status(400).json({
          success: false,
          message: 'Task and response are required'
        });
      }
      
      // Prepare criteria array from task metrics or AI evaluation
      let criteria = [];
      
      if (task.aiEvaluation && task.aiEvaluation.criteria) {
        criteria = task.aiEvaluation.criteria.map(criterion => ({
          name: criterion.name,
          score: criterion.score,
          feedback: criterion.feedback
        }));
      } else if (task.metrics) {
        criteria = task.metrics.map(metric => ({
          name: metric.name,
          score: metric.score,
          feedback: metric.comment || metric.feedback
        }));
      }
      
      // Create a new assessment record
      const writingAssessment = new WritingAssessment({
        userId: userId,
        level: level,
        language: language,
        prompt: task.prompt,
        response: task.response,
        score: score,
        feedback: feedback,
        criteria: criteria,
        completedAt: new Date(),
        nextAvailableDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      });
      
      // Save to database
      await writingAssessment.save();
      
      return res.status(201).json({
        success: true,
        message: 'Writing assessment submitted successfully',
        result: writingAssessment
      });
    } catch (error) {
      console.error('Error in submitWritingAssessment controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to submit writing assessment',
        error: error.message
      });
    }
  }

  /**
   * Check if user can take an assessment (not in cooldown period)
   * @param {string} userId - User ID
   * @param {string} level - Assessment level
   * @param {string} language - Assessment language
   * @returns {Object} - Availability status and next available date
   */
  async checkAssessmentAvailability(userId, level, language) {
    try {
      // Find most recent assessment for this user, level, and language
      const latestAssessment = await WritingAssessment.findOne({
        userId: userId,
        level: level,
        language: language
      }).sort({ completedAt: -1 });
      
      // If no previous assessment exists, user can take the assessment
      if (!latestAssessment) {
        return { available: true };
      }
      
      // Check if cooldown period has passed
      const now = new Date();
      const nextAvailableDate = latestAssessment.nextAvailableDate;
      
      if (now < nextAvailableDate) {
        // User must wait
        return {
          available: false,
          nextAvailableDate: nextAvailableDate
        };
      }
      
      // Cooldown period has passed, user can take the assessment
      return { available: true };
    } catch (error) {
      console.error('Error checking assessment availability:', error);
      // Default to allowing assessment if error occurs
      return { available: true };
    }
  }

  /**
   * Get a user's writing assessment history
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  async getUserWritingAssessments(req, res) {
    try {
      const userId = req.params.userId || req.user?._id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      // Validate MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID format'
        });
      }
      
      // Get user's assessment history
      const assessments = await WritingAssessment.find({ userId })
        .sort({ completedAt: -1 })
        .lean();
      
      return res.status(200).json({
        success: true,
        assessments
      });
    } catch (error) {
      console.error('Error getting user writing assessments:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get writing assessments',
        error: error.message
      });
    }
  }

  /**
   * Check if a user can take a writing assessment (not in cooldown period)
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  async checkWritingAssessmentAvailability(req, res) {
    try {
      const { level, language } = req.query;
      const userId = req.user?._id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }
      
      if (!level || !language) {
        return res.status(400).json({
          success: false,
          message: 'Level and language are required'
        });
      }
      
      const availability = await this.checkAssessmentAvailability(userId, level, language);
      
      return res.status(200).json({
        success: true,
        ...availability
      });
    } catch (error) {
      console.error('Error checking writing assessment availability:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to check assessment availability',
        error: error.message
      });
    }
  }

  /**
   * Get a specific writing assessment by ID
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  async getWritingAssessmentById(req, res) {
    try {
      const { assessmentId } = req.params;
      
      if (!assessmentId || !mongoose.Types.ObjectId.isValid(assessmentId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid assessment ID is required'
        });
      }
      
      const assessment = await WritingAssessment.findById(assessmentId);
      
      if (!assessment) {
        return res.status(404).json({
          success: false,
          message: 'Assessment not found'
        });
      }
      
      // Check if user has permission to view this assessment
      if (req.user.role !== 'admin' && req.user.role !== 'supervisor' && 
          assessment.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view this assessment'
        });
      }
      
      return res.status(200).json({
        success: true,
        assessment
      });
    } catch (error) {
      console.error('Error getting writing assessment by ID:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get writing assessment',
        error: error.message
      });
    }
  }
}

export default new WritingAssessmentController(); 