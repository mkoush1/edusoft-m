import SpeakingAssessmentQuestion from '../models/SpeakingAssessmentQuestion.js';

/**
 * Service for managing speaking assessment questions
 */
class SpeakingQuestionService {
  /**
   * Get all questions for a specific language and level
   * @param {string} language - The language (english, french, etc.)
   * @param {string} level - CEFR level (a1, a2, b1, b2, c1, c2)
   * @returns {Promise<Array>} Array of questions
   */
  async getQuestions(language, level) {
    try {
      return await SpeakingAssessmentQuestion.find({
        language,
        level,
        isActive: true
      }).sort({ taskId: 1 });
    } catch (error) {
      console.error('Error fetching speaking questions:', error);
      throw error;
    }
  }

  /**
   * Get a specific question by language, level, and taskId
   * @param {string} language - The language (english, french, etc.)
   * @param {string} level - CEFR level (a1, a2, b1, b2, c1, c2)
   * @param {number} taskId - Task identifier
   * @returns {Promise<Object>} Question object
   */
  async getQuestion(language, level, taskId) {
    try {
      return await SpeakingAssessmentQuestion.findOne({
        language,
        level,
        taskId,
        isActive: true
      });
    } catch (error) {
      console.error('Error fetching speaking question:', error);
      throw error;
    }
  }

  /**
   * Create a new speaking assessment question
   * @param {Object} questionData - Question data
   * @returns {Promise<Object>} Created question
   */
  async createQuestion(questionData) {
    try {
      const question = new SpeakingAssessmentQuestion(questionData);
      return await question.save();
    } catch (error) {
      console.error('Error creating speaking question:', error);
      throw error;
    }
  }

  /**
   * Update an existing speaking assessment question
   * @param {string} id - Question ID
   * @param {Object} questionData - Updated question data
   * @returns {Promise<Object>} Updated question
   */
  async updateQuestion(id, questionData) {
    try {
      return await SpeakingAssessmentQuestion.findByIdAndUpdate(
        id,
        questionData,
        { new: true, runValidators: true }
      );
    } catch (error) {
      console.error('Error updating speaking question:', error);
      throw error;
    }
  }

  /**
   * Delete a speaking assessment question (set isActive to false)
   * @param {string} id - Question ID
   * @returns {Promise<Object>} Deleted question
   */
  async deleteQuestion(id) {
    try {
      return await SpeakingAssessmentQuestion.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );
    } catch (error) {
      console.error('Error deleting speaking question:', error);
      throw error;
    }
  }

  /**
   * Seed initial questions if none exist
   * @returns {Promise<void>}
   */
  async seedInitialQuestions() {
    try {
      const count = await SpeakingAssessmentQuestion.countDocuments();
      if (count === 0) {
        const initialQuestions = [
          // A1 English
          {
            language: 'english',
            level: 'a1',
            taskId: 1,
            title: 'Self Introduction',
            prompt: 'Introduce yourself. Talk about your name, age, where you live, your job or studies, and your hobbies.',
            preparationTime: 30,
            speakingTime: 60,
            criteria: ['Basic Vocabulary', 'Pronunciation', 'Fluency']
          },
          // A2 English
          {
            language: 'english',
            level: 'a2',
            taskId: 1,
            title: 'Daily Activities',
            prompt: 'Describe your typical day and weekly routine. What do you do on weekdays and weekends?',
            preparationTime: 30,
            speakingTime: 90,
            criteria: ['Time Expressions', 'Present Tense Usage', 'Vocabulary Range', 'Coherence']
          },
          // B1 English
          {
            language: 'english',
            level: 'b1',
            taskId: 1,
            title: 'Past Experience',
            prompt: 'Talk about a memorable trip or vacation you have taken. Where did you go? Who were you with? What did you do? Why was it memorable?',
            preparationTime: 60,
            speakingTime: 120,
            criteria: ['Past Tense Narration', 'Descriptive Language', 'Fluency', 'Pronunciation']
          },
          // B2 English
          {
            language: 'english',
            level: 'b2',
            taskId: 1,
            title: 'Problem and Solution',
            prompt: 'Describe an environmental problem in your area or country and suggest some possible solutions. Explain why you think these solutions would be effective.',
            preparationTime: 60,
            speakingTime: 150,
            criteria: ['Vocabulary Precision', 'Argumentation', 'Complex Structures', 'Coherence and Cohesion']
          },
          // C1 English
          {
            language: 'english',
            level: 'c1',
            taskId: 1,
            title: 'Complex Topic Discussion',
            prompt: 'Discuss the challenges of balancing technological progress with environmental sustainability. What are the key issues? What solutions might be effective?',
            preparationTime: 90,
            speakingTime: 180,
            criteria: ['Advanced Vocabulary', 'Complex Structures', 'Critical Analysis', 'Fluency', 'Pronunciation']
          },
          // C2 English
          {
            language: 'english',
            level: 'c2',
            taskId: 1,
            title: 'Abstract Concept Analysis',
            prompt: 'Discuss the concept of "freedom" in modern society. How is it defined? What are its limitations? How has the interpretation of freedom evolved over time?',
            preparationTime: 90,
            speakingTime: 240,
            criteria: ['Sophisticated Vocabulary', 'Conceptual Thinking', 'Nuanced Expression', 'Rhetorical Skill', 'Intellectual Depth']
          },
          // A1 French
          {
            language: 'french',
            level: 'a1',
            taskId: 1,
            title: 'Présentation Personnelle',
            prompt: 'Présentez-vous. Parlez de votre nom, votre âge, où vous habitez, votre travail ou vos études, et vos loisirs.',
            preparationTime: 30,
            speakingTime: 60,
            criteria: ['Vocabulaire de Base', 'Prononciation', 'Aisance']
          }
          // Add more questions as needed
        ];

        await SpeakingAssessmentQuestion.insertMany(initialQuestions);
        console.log('Initial speaking questions seeded successfully');
      }
    } catch (error) {
      console.error('Error seeding initial speaking questions:', error);
      throw error;
    }
  }
}

export default new SpeakingQuestionService(); 