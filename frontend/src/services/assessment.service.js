import api from './api';

class AssessmentService {
  // Get all available assessment types
  async getAssessmentTypes() {
    try {
      const response = await api.get(`/assessments`);
      return response.data;
    } catch (error) {
      console.error('Error fetching assessment types:', error);
      throw error;
    }
  }

  // Get user's assessment status
  async getUserAssessmentStatus(userId) {
    try {
      const response = await api.get(`/assessments/status/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching assessment status:', error);
      throw error;
    }
  }

  // Submit an assessment result
  async submitAssessment(assessmentData) {
    try {
      // Handle speaking assessments differently
      if (assessmentData.type === 'speaking') {
        const response = await api.post(`/speaking-assessment/evaluate`, assessmentData.data);
        return response.data;
      } 
      // Handle writing assessments
      else if (assessmentData.type === 'writing') {
        console.log('Submitting writing assessment to backend:', assessmentData);
        const response = await api.post(`/writing-assessment/submit-communication`, assessmentData);
        return response.data;
      } 
      // For other assessment types
      else {
        const response = await api.post(`/assessments/submit`, assessmentData);
        return response.data;
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
      throw error;
    }
  }
  
  // Get speaking assessment by ID
  async getSpeakingAssessment(assessmentId) {
    try {
      const response = await api.get(`/speaking-assessment/evaluated/${assessmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting speaking assessment:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Get all speaking assessments for a user
  async getUserSpeakingAssessments(userId) {
    try {
      const response = await api.get(`/speaking-assessment/user/${userId || ''}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user speaking assessments:', error);
      throw error;
    }
  }
  
  // Check if a speaking assessment is completed
  async checkSpeakingAssessment(userId, language, level, taskId) {
    try {
      const response = await api.get(`/speaking-assessment/check`, {
        params: { userId, language, level, taskId }
      });
      return response.data;
    } catch (error) {
      console.error('Error checking speaking assessment:', error);
      throw error;
    }
  }

  // Get all writing assessments for a user
  async getUserWritingAssessments(userId) {
    try {
      const response = await api.get(`/writing-assessment/user/${userId || ''}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user writing assessments:', error);
      throw error;
    }
  }

  // Get writing assessment by ID
  async getWritingAssessment(assessmentId) {
    try {
      const response = await api.get(`/writing-assessment/${assessmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching writing assessment:', error);
      throw error;
    }
  }

  // Check if a user can take a writing assessment (not in cooldown period)
  async checkWritingAssessmentAvailability(level, language) {
    try {
      const response = await api.get(`/writing-assessment/check`, {
        params: { level, language }
      });
      return response.data;
    } catch (error) {
      console.error('Error checking writing assessment availability:', error);
      // Default to false if there's an error
      return { success: false, available: false, error: error.message };
    }
  }

  // Check if a user can take a speaking assessment (not in cooldown period)
  async checkSpeakingAssessmentAvailability(language, level, taskId) {
    try {
      const response = await api.get(`/speaking-assessment/availability`, {
        params: { language, level, taskId }
      });
      return response.data;
    } catch (error) {
      console.error('Error checking speaking assessment availability:', error);
      // Default to false if there's an error
      return { success: false, available: false, error: error.message };
    }
  }
}

export default new AssessmentService(); 