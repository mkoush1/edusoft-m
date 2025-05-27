import AdaptabilityAssessmentQuestion from '../models/AdaptabilityAssessmentQuestion.js';

// Get all questions for the Adaptability assessment
export const getAdaptabilityQuestions = async (req, res) => {
  try {
    const questions = await AdaptabilityAssessmentQuestion.find()
      .sort({ questionNumber: 1 });
    
    res.status(200).json({
      success: true,
      data: questions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error fetching adaptability questions'
    });
  }
};

// Get questions by section (SJT or Likert)
export const getQuestionsBySection = async (req, res) => {
  try {
    const { section } = req.params;
    
    if (!['SJT', 'Likert'].includes(section)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid section. Must be either SJT or Likert'
      });
    }

    const questions = await AdaptabilityAssessmentQuestion.find({ section })
      .sort({ questionNumber: 1 });
    
    res.status(200).json({
      success: true,
      data: questions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error fetching questions by section'
    });
  }
};

// Calculate assessment score
export const calculateScore = async (req, res) => {
  try {
    const { answers } = req.body;
    
    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: 'Answers must be an array'
      });
    }

    let totalScore = 0;
    let maxPossibleScore = 0;

    for (const answer of answers) {
      const question = await AdaptabilityAssessmentQuestion.findOne({ 
        questionNumber: answer.questionNumber 
      });

      if (!question) {
        continue;
      }

      maxPossibleScore += question.maxScore;

      if (question.questionType === 'SJT') {
        // For SJT questions, check if both MOST and LEAST effective options are correctly identified
        const selectedOptions = answer.selectedOptions || [];
        const mostEffective = question.options.find(opt => opt.effectiveness === 'MOST');
        const leastEffective = question.options.find(opt => opt.effectiveness === 'LEAST');

        const hasMost = selectedOptions.includes(mostEffective?.text);
        const hasLeast = selectedOptions.includes(leastEffective?.text);

        if (hasMost && hasLeast) {
          totalScore += 2;
        } else if (hasMost || hasLeast) {
          totalScore += 1;
        }
      } else {
        // For Likert questions, use the selected value
        const selectedOption = question.options.find(opt => opt.text === answer.selectedOption);
        if (selectedOption) {
          totalScore += selectedOption.value;
        }
      }
    }

    const percentage = (totalScore / maxPossibleScore) * 100;
    let interpretation = '';

    if (percentage >= 80) {
      interpretation = 'Excellent adaptability';
    } else if (percentage >= 70) {
      interpretation = 'Very good adaptability';
    } else if (percentage >= 60) {
      interpretation = 'Good adaptability';
    } else if (percentage >= 50) {
      interpretation = 'Moderate adaptability';
    } else {
      interpretation = 'Low adaptability';
    }

    res.status(200).json({
      success: true,
      data: {
        totalScore,
        maxPossibleScore,
        percentage,
        interpretation
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error calculating score'
    });
  }
}; 