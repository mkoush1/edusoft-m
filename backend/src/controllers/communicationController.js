// communicationController.js
import User from '../src/models/User.js';
import Assessment from '../src/models/Assessment.js';
import AssessmentResult from '../src/models/assessmentResult.js';

/**
 * Controller for communication assessment endpoints
 */
class CommunicationController {
  /**
   * Submit communication assessment results
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  async submitCommunicationAssessment(req, res) {
    console.log('CommunicationController.submitCommunicationAssessment called');
    try {
      const { type, level, language, score, tasks, feedback, recommendations } = req.body;
      const userId = req.userId;
      
      console.log('Request body received:', {
        type,
        level,
        language,
        score,
        tasksCount: tasks?.length || 0,
        hasRecommendations: !!recommendations
      });
      
      // Validate request
      if (!type || !score) {
        console.log('Validation failed: Missing type or score');
        return res.status(400).json({
          success: false,
          message: 'Type and score are required'
        });
      }
      
      // Save assessment result
      const assessmentResult = new AssessmentResult({
        userId,
        assessmentType: 'communication',
        score,
        completedAt: new Date(),
        details: {
          type, // e.g., 'writing', 'reading', 'listening', 'speaking'
          level,
          language,
          feedback,
          recommendations,
          tasks: tasks?.map(task => ({
            title: task.title,
            response: task.response,
            wordCount: task.wordCount,
            metrics: task.metrics
          }))
        }
      });
      
      await assessmentResult.save();
      console.log('Communication assessment result saved successfully');
      
      // Update user's completed assessments and progress
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Check if user has already completed this assessment type
      const existingAssessmentIndex = user.completedAssessments.findIndex(
        a => a.assessmentType === 'communication'
      );
      
      if (existingAssessmentIndex !== -1) {
        // Update existing assessment score
        user.completedAssessments[existingAssessmentIndex] = {
          assessmentType: 'communication',
          completedAt: new Date(),
          score
        };
      } else {
        // Add new completion
        user.completedAssessments.push({
          assessmentType: 'communication',
          completedAt: new Date(),
          score
        });
        user.totalAssessmentsCompleted += 1;
      }
      
      // Update progress
      const totalAssessments = await Assessment.countDocuments();
      user.progress = Math.min(100, (user.totalAssessmentsCompleted / totalAssessments) * 100);
      
      await user.save();
      console.log('User progress updated successfully');
      
      // Get updated assessment status for response
      const availableAssessments = await Assessment.find();
      const completedAssessmentTypes = user.completedAssessments.map(a => a.assessmentType);
      const remainingAssessments = availableAssessments.filter(
        assessment => !completedAssessmentTypes.includes(assessment.category)
      );
      
      // Return success response
      return res.status(200).json({
        success: true,
        message: 'Communication assessment submitted successfully',
        result: {
          score,
          assessmentStatus: {
            completedAssessments: user.completedAssessments,
            totalCompleted: user.totalAssessmentsCompleted,
            progress: user.progress,
            remainingCount: remainingAssessments.length
          }
        }
      });
    } catch (error) {
      console.error('Error in submitCommunicationAssessment controller:', {
        message: error.message,
        stack: error.stack
      });
      return res.status(500).json({
        success: false,
        message: 'Failed to submit communication assessment',
        error: error.message
      });
    }
  }
}

export default new CommunicationController(); 