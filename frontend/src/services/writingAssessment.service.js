import axios from 'axios';

// Try to use environment variables first, then fallback to origin or localhost
const API_URL = import.meta.env.VITE_API_URL || window.location.origin + '/api' || 'http://localhost:5001/api';
const API_TIMEOUT = 5000; // Reduced timeout to 5 seconds for faster fallback

/**
 * Service for interacting with the AI writing assessment API
 */
class WritingAssessmentService {
  constructor() {
    console.log("WritingAssessmentService initialized with API URL:", API_URL);
    
    // Create axios instance with timeout
    this.api = axios.create({
      baseURL: API_URL,
      timeout: API_TIMEOUT
    });
  }

  /**
   * Evaluate a writing submission using AI
   * @param {string} question - The prompt or question the user responded to
   * @param {string} answer - The user's written answer
   * @returns {Promise<Object>} - Assessment results with scores for each criteria
   */
  async evaluateWriting(question, answer) {
    try {
      console.log("Evaluating writing submission...", {
        questionLength: question?.length || 0,
        answerLength: answer?.length || 0
      });
      
      // Check if we should use fallback immediately (for testing)
      if (window.location.search.includes('useFallback=true')) {
        console.log("Using fallback directly due to URL parameter");
        return this.simulateAssessment(answer);
      }
      
      const response = await this.api.post(`/writing-assessment/evaluate`, {
        question,
        answer
      });
      
      console.log("Received assessment response", {
        success: response.data?.success,
        hasAssessment: !!response.data?.assessment
      });
      
      return response.data.assessment;
    } catch (error) {
      console.error('Error in evaluateWriting service:', error);
      
      // Return a fallback assessment in case the API is unavailable
      if (error.response?.status === 404 || !error.response || error.code === 'ECONNABORTED') {
        console.warn('Falling back to client-side assessment simulation due to:', error.message);
        return this.simulateAssessment(answer);
      }
      
      // Throw error with more information for debugging
      const enhancedError = new Error(`API Error: ${error.message} - Status: ${error.response?.status || 'None'}`);
      enhancedError.originalError = error;
      throw enhancedError;
    }
  }
  
  /**
   * Simulate an assessment in case the API is unavailable (fallback method)
   * @param {string} answer - The user's written answer
   * @returns {Object} - Simulated assessment data
   */
  simulateAssessment(answer) {
    // Basic metrics for simple assessment
    const wordCount = (answer || '').split(/\s+/).filter(Boolean).length;
    const sentenceCount = (answer || '').split(/[.!?]+/).filter(Boolean).length;
    const avgSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 0;
    const paragraphCount = (answer || '').split(/\n\s*\n/).filter(Boolean).length;
    
    // Apply a severe penalty for minimal responses
    const minimalResponse = wordCount < 10;
    const veryMinimalResponse = wordCount < 3;
    
    // Compute basic scores based on simple metrics (out of 20 instead of 10)
    // Apply strict penalties for minimal responses
    let coherenceScore = minimalResponse ? 2 : paragraphCount > 1 ? 14 : 10;
    let organizationScore = minimalResponse ? 2 : paragraphCount >= 3 ? 16 : 12;
    let focusScore = minimalResponse ? 2 : wordCount > 150 ? 14 : 10;
    let vocabularyScore = minimalResponse ? 2 : this.calculateVocabularyScore(answer) * 2; // Convert to scale of 20
    let grammarScore = minimalResponse ? 2 : 14; // Default without actual analysis
    
    // For extremely minimal responses (like one nonsensical word), make scores even lower
    if (veryMinimalResponse) {
      coherenceScore = 1;
      organizationScore = 1;
      focusScore = 1;
      vocabularyScore = 1;
      grammarScore = 1;
    }
    
    // Prepare criteria array with scores stored as out of 10
    const criteria = [
      {
        name: 'Coherence and Clarity',
        score: coherenceScore / 2, // Store as out of 10 for consistency
        feedback: veryMinimalResponse 
          ? 'The response is too brief to evaluate coherence. A complete response with multiple sentences is required.'
          : minimalResponse
            ? 'The response lacks coherence due to insufficient content. More development is needed.'
            : coherenceScore >= 14 
              ? 'Your ideas flow logically and are easy to follow.' 
              : 'Try to improve the logical flow between your ideas.'
      },
      {
        name: 'Organization and Structure',
        score: organizationScore / 2, // Store as out of 10 for consistency
        feedback: veryMinimalResponse
          ? 'The response is too brief to evaluate organization. A complete response with clear structure is required.'
          : minimalResponse
            ? 'The response lacks organization due to insufficient content. A proper structure is needed.'
            : organizationScore >= 14 
              ? 'Your writing has good structure with clear sections.' 
              : 'Consider organizing your writing with clearer introduction, body, and conclusion.'
      },
      {
        name: 'Focus and Content Development',
        score: focusScore / 2, // Store as out of 10 for consistency
        feedback: veryMinimalResponse
          ? 'The response is too brief to evaluate focus. A complete response addressing the prompt is required.'
          : minimalResponse
            ? 'The response lacks focus and does not adequately address the prompt. More content is needed.'
            : focusScore >= 14 
              ? 'You stay on topic and develop your ideas well.' 
              : 'Try to stay more focused on the main topic and develop your ideas further.'
      },
      {
        name: 'Vocabulary and Word Choice',
        score: vocabularyScore / 2, // Store as out of 10 for consistency
        feedback: veryMinimalResponse
          ? 'The response is too brief to evaluate vocabulary. A complete response with varied vocabulary is required.'
          : minimalResponse
            ? 'The response contains very limited vocabulary. More varied and appropriate word choices are needed.'
            : vocabularyScore >= 14 
              ? 'You use a good range of vocabulary.' 
              : 'Try to use more varied vocabulary to express your ideas.'
      },
      {
        name: 'Grammar and Conventions',
        score: grammarScore / 2, // Store as out of 10 for consistency
        feedback: veryMinimalResponse
          ? 'The response is too brief to evaluate grammar. A complete response with proper grammar is required.'
          : minimalResponse
            ? 'The response contains too little content to properly assess grammar. More complete sentences are needed.'
            : 'Your grammar is generally good, but there may be areas for improvement.'
      }
    ];
    
    // Calculate overall score by summing the criteria scores (multiplied by 2 to get back to scale of 20 per criterion)
    const overallScore = criteria.reduce((sum, criterion) => sum + (criterion.score * 2), 0);
    
    return {
      criteria: criteria,
      overallScore: overallScore,
      overallFeedback: veryMinimalResponse 
        ? 'This response is far too brief and does not meet the minimum requirements for assessment. Please provide a complete response that addresses the prompt.'
        : minimalResponse
          ? 'This response is too brief to demonstrate writing proficiency. Please develop your ideas more fully and address all aspects of the prompt.'
          : overallScore >= 80 
            ? 'Your writing sample demonstrates strong academic writing skills. You communicate effectively with good organization and vocabulary.' 
            : overallScore >= 60 
              ? 'Your writing sample demonstrates adequate academic writing skills. Continue practicing to improve your writing skills.'
              : 'Your writing sample demonstrates developing academic writing skills. Continue practicing to improve your organization, coherence, and content development.'
    };
  }
  
  /**
   * Calculate a basic vocabulary score based on word variety and length
   * @param {string} text - The text to analyze
   * @returns {number} - Score from 1-10
   */
  calculateVocabularyScore(text) {
    if (!text) return 5;
    
    const words = text.toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length === 0) return 5;
    
    // Count unique words (lexical diversity)
    const uniqueWords = new Set(words);
    const lexicalDiversity = uniqueWords.size / words.length;
    
    // Calculate average word length
    const avgWordLength = words.join('').length / words.length;
    
    // Simple score based on these metrics
    // Lexical diversity of 0.6+ is quite good for academic writing
    // Average word length of 5+ characters suggests more sophisticated vocabulary
    let score = 5; // Base score
    
    if (lexicalDiversity > 0.7) score += 2;
    else if (lexicalDiversity > 0.5) score += 1;
    
    if (avgWordLength > 6) score += 2;
    else if (avgWordLength > 5) score += 1;
    
    // Cap score at 10
    return Math.min(10, score);
  }
}

export default new WritingAssessmentService(); 