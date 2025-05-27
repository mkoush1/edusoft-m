// writingAssessmentController.js
import writingAssessmentService from '../services/writingAssessmentService.js';

/**
 * Controller for writing assessment endpoints
 */
class WritingAssessmentController {
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
      
      // Ensure recommendations are always included
      if (!assessment.recommendations || assessment.recommendations.length === 0) {
        assessment.recommendations = this.getDefaultRecommendations(assessment.overallScore || 0);
        console.log('Added default recommendations to assessment');
      }
      
      console.log('Assessment ready to send:', {
        hasAssessment: !!assessment,
        criteriaCount: assessment?.criteria?.length || 0,
        overallScore: assessment?.overallScore,
        recommendationsCount: assessment?.recommendations?.length || 0
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
   * Get default recommendations based on score
   * @param {number} score - The assessment score
   * @returns {string[]} - Array of recommendation strings
   */
  getDefaultRecommendations(score) {
    if (score < 40) {
      return [
        'Focus on basic sentence structures and grammar fundamentals.',
        'Build your vocabulary by learning common words and phrases.',
        'Practice writing short, clear paragraphs with a main idea.',
        'Read simple texts in your target language regularly.',
        'Consider working with a language tutor for personalized guidance.'
      ];
    } else if (score < 70) {
      return [
        'Work on connecting your ideas with appropriate transition words.',
        'Expand your vocabulary with more precise and varied word choices.',
        'Practice organizing your writing with clear introduction, body, and conclusion.',
        'Review grammar rules that you find challenging.',
        'Read articles and essays to learn from good writing examples.'
      ];
    } else {
      return [
        'Focus on developing more nuanced arguments in your writing.',
        'Work on incorporating more sophisticated vocabulary and expressions.',
        'Practice writing in different styles and for different purposes.',
        'Study advanced grammar structures to add complexity to your writing.',
        'Read academic texts in your field to understand specialized language use.'
      ];
    }
  }
}

export default new WritingAssessmentController(); 