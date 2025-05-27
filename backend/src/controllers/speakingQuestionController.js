import speakingQuestionService from '../services/speakingQuestionService.js';

/**
 * Controller for speaking assessment question endpoints
 */
class SpeakingQuestionController {
  /**
   * Get all speaking assessment questions for a specific language and level
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  async getQuestions(req, res) {
    try {
      const { language, level } = req.params;
      
      if (!language || !level) {
        return res.status(400).json({
          success: false,
          message: 'Language and level are required'
        });
      }
      
      const questions = await speakingQuestionService.getQuestions(language, level);
      
      return res.status(200).json({
        success: true,
        count: questions.length,
        data: questions
      });
    } catch (error) {
      console.error('Error in getQuestions controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve questions',
        error: error.message
      });
    }
  }
  
  /**
   * Get a specific speaking assessment question
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  async getQuestion(req, res) {
    try {
      const { language, level, taskId } = req.params;
      
      if (!language || !level || !taskId) {
        return res.status(400).json({
          success: false,
          message: 'Language, level, and taskId are required'
        });
      }
      
      const question = await speakingQuestionService.getQuestion(language, level, parseInt(taskId));
      
      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Question not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: question
      });
    } catch (error) {
      console.error('Error in getQuestion controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve question',
        error: error.message
      });
    }
  }
  
  /**
   * Create a new speaking assessment question
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  async createQuestion(req, res) {
    try {
      // Extract required fields from request body
      const { language, level, taskId, title, prompt, preparationTime, speakingTime, criteria } = req.body;
      
      // Validate required fields
      if (!language || !level || !taskId || !title || !prompt) {
        return res.status(400).json({
          success: false,
          message: 'Required fields: language, level, taskId, title, prompt'
        });
      }
      
      // Create question
      const question = await speakingQuestionService.createQuestion(req.body);
      
      return res.status(201).json({
        success: true,
        data: question
      });
    } catch (error) {
      console.error('Error in createQuestion controller:', error);
      
      // Handle duplicate key error
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'A question with this language, level, and taskId already exists',
          error: error.message
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Failed to create question',
        error: error.message
      });
    }
  }
  
  /**
   * Update an existing speaking assessment question
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  async updateQuestion(req, res) {
    try {
      const { id } = req.params;
      
      const question = await speakingQuestionService.updateQuestion(id, req.body);
      
      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Question not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: question
      });
    } catch (error) {
      console.error('Error in updateQuestion controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update question',
        error: error.message
      });
    }
  }
  
  /**
   * Delete a speaking assessment question (set as inactive)
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  async deleteQuestion(req, res) {
    try {
      const { id } = req.params;
      
      const question = await speakingQuestionService.deleteQuestion(id);
      
      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Question not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Question deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteQuestion controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete question',
        error: error.message
      });
    }
  }
  
  /**
   * Seed initial questions if database is empty
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  async seedQuestions(req, res) {
    try {
      await speakingQuestionService.seedInitialQuestions();
      
      return res.status(200).json({
        success: true,
        message: 'Initial questions seeded successfully'
      });
    } catch (error) {
      console.error('Error in seedQuestions controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to seed initial questions',
        error: error.message
      });
    }
  }
}

export default new SpeakingQuestionController(); 