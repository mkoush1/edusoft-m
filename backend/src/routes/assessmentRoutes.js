import express from 'express';
import Assessment from '../models/Assessment.js';
import TestQuestion from '../models/TestQuestion.js';
import LeadershipQuestion from '../models/leadership_testBank.js';
import AssessmentResult from '../models/AssessmentResult.js';

import { authenticateToken, isAdmin } from '../middleware/auth.js';
import User from '../models/User.js';

import ProblemSolvingAssessment from '../models/ProblemSolvingAssessment.js';
import ProblemSolvingQuestion from '../models/problemSolvingQuestionBank.js';
import Puzzle from '../models/Puzzle.js';
import PresentationQuestion from '../models/PresentationQuestion.js';
import PresentationSubmission from '../models/PresentationSubmission.js';
import AdaptabilityAssessmentQuestion from '../models/AdaptabilityAssessmentQuestion.js';

const router = express.Router();

// Initialize default presentation questions if none exist
router.post('/presentation/init', async (req, res) => {
  try {
    const count = await PresentationQuestion.countDocuments();
    if (count === 0) {
      const defaultQuestions = [
        {
          questionNumber: 1,
          question: "Please introduce yourself and tell us about your background.",
          description: "Share your educational and professional background, highlighting key experiences and achievements.",
          preparationTime: 120,
          recordingTime: 120
        },
        {
          questionNumber: 2,
          question: "What leadership experience do you have and how has it shaped you?",
          description: "Discuss specific leadership roles you've held and how they've influenced your leadership style.",
          preparationTime: 120,
          recordingTime: 120
        },
        {
          questionNumber: 3,
          question: "Describe a challenging situation you faced and how you overcame it.",
          description: "Explain the situation, your role, the actions you took, and the outcome.",
          preparationTime: 120,
          recordingTime: 120
        }
      ];

      await PresentationQuestion.insertMany(defaultQuestions);
      res.json({ message: 'Default presentation questions initialized successfully' });
    } else {
      res.json({ message: 'Presentation questions already exist' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error initializing presentation questions', error: error.message });
  }
});

// Get all presentation questions
router.get('/presentation/questions', async (req, res) => {
  try {
    const questions = await PresentationQuestion.find({}).sort({ questionNumber: 1 });
    const questionMap = questions.reduce((acc, question) => {
      acc[question.questionNumber] = {
        question: question.question,
        description: question.description,
        preparationTime: question.preparationTime,
        recordingTime: question.recordingTime
      };
      return acc;
    }, {});
    res.json(questionMap);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching presentation questions', error: error.message });
  }
});

// Get presentation questions
router.get('/presentation/questions', authenticateToken, async (req, res) => {
  try {
    const questions = await PresentationQuestion.find({})
      .sort({ questionNumber: 1 })
      .lean();

    // Convert questions to object with questionNumber as key
    const questionsObj = {};
    questions.forEach(q => {
      questionsObj[q.questionNumber] = {
        question: q.question,
        description: q.description,
        preparationTime: q.preparationTime,
        recordingTime: q.recordingTime
      };
    });

    res.json(questionsObj);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching presentation questions', error: error.message });
  }
});

// Get single presentation question
router.get('/presentation/question/:questionNumber', authenticateToken, async (req, res) => {
  try {
    const { questionNumber } = req.params;
    const question = await PresentationQuestion.findOne({ questionNumber: parseInt(questionNumber) });
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json({
      question: question.question,
      description: question.description,
      preparationTime: question.preparationTime,
      recordingTime: question.recordingTime
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching question', error: error.message });
  }
});

// Helper function to generate a solvable puzzle
const generatePuzzle = (size = 3) => {
  try {
    console.log('Generating puzzle with size:', size);
    const numbers = Array.from({ length: size * size - 1 }, (_, i) => i + 1);
    const shuffled = numbers.sort(() => Math.random() - 0.5);
    const grid = [];

    for (let i = 0; i < size; i++) {
      grid[i] = [];
      for (let j = 0; j < size; j++) {
        const index = i * size + j;
        grid[i][j] = index < shuffled.length ? shuffled[index] : 0;
      }
    }

    console.log('Generated puzzle grid:', grid);
    return grid;
  } catch (error) {
    console.error('Error generating puzzle:', error);
    throw error;
  }
};

// Get all assessments
router.get('/', async (req, res) => {
  try {
    const assessments = await Assessment.find({});
    res.json(assessments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single assessment by ID
router.get('/:id', async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    res.json(assessment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Initialize default assessments if none exist
router.post('/init', async (req, res) => {
  try {
    const count = await Assessment.countDocuments();
    if (count === 0) {
      const defaultAssessments = [
        {
          title: 'Leadership Skills Assessment',
          description: 'Evaluate your leadership capabilities through comprehensive scenarios. This assessment measures your ability to inspire, guide teams, make strategic decisions, and handle leadership challenges effectively. Learn about your leadership style and areas for growth.',
          category: 'Leadership',
          duration: 45,
          image: '/leadership.jpeg'
        },
        {
          title: 'Adaptability and Flexibility Assessment',
          description: 'Test your ability to adapt to changing situations and maintain effectiveness. This assessment evaluates how well you handle unexpected changes, learn new methods, and adjust your approach in various scenarios. Discover your adaptability quotient.',
          category: 'Adaptability',
          duration: 30
        },
        {
          title: 'Communication Skills Assessment',
          description: 'Measure your verbal, written, and interpersonal communication abilities. This comprehensive assessment evaluates your listening skills, clarity of expression, and effectiveness in various communication contexts. Identify your communication strengths and areas for improvement.',
          category: 'Communication',
          duration: 40
        },
        {
          title: 'Presentation Skills Assessment',
          description: 'Evaluate your ability to create and deliver impactful presentations. This assessment measures your presentation structure, delivery style, audience engagement, and visual aid usage. Get insights into your presentation effectiveness.',
          category: 'Presentation',
          duration: 35
        },
        {
          title: 'Problem-Solving Skills Assessment',
          description: 'Test your analytical and critical thinking abilities through real-world problem scenarios. This assessment evaluates your approach to complex problems, decision-making process, and ability to implement effective solutions. Discover your problem-solving strengths.',
          category: 'Problem Solving',
          duration: 50
        },
        {
          title: 'Team Work and Collaboration Assessment',
          description: 'Assess your ability to work effectively in team environments. This evaluation measures your collaboration skills, team contribution, conflict resolution abilities, and group project management capabilities. Learn about your team player profile.',
          category: 'Team Work',
          duration: 45
        }
      ];

      await Assessment.insertMany(defaultAssessments);
      res.json({ message: 'Default assessments initialized successfully' });
    } else {
      res.json({ message: 'Assessments already exist' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all questions for a specific assessment type
router.get('/questions/:assessmentType', authenticateToken, async (req, res) => {
  try {
    const { assessmentType } = req.params;
    const questions = await TestQuestion.find({ assessmentType })
      .sort({ questionNumber: 1 });

    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching questions', error: error.message });
  }
});

// Submit assessment results
router.post('/submit', authenticateToken, async (req, res) => {
  try {
    const { assessmentType, answers } = req.body;
    const userId = req.userId;

    // Get all questions for this assessment type
    const questions = await TestQuestion.find({ assessmentType });

    // Calculate section scores
    const sectionScores = {};
    const sectionMaxScores = {};

    questions.forEach(question => {
      const answer = answers.find(a => a.questionNumber === question.questionNumber);
      if (!answer) {
        throw new Error(`Missing answer for question ${question.questionNumber}`);
      }

      if (!sectionScores[question.section]) {
        sectionScores[question.section] = 0;
        sectionMaxScores[question.section] = 0;
      }

      sectionScores[question.section] += answer.score;
      sectionMaxScores[question.section] += question.maxScore;
    });

    // Calculate total scores
    const totalScore = Object.values(sectionScores).reduce((a, b) => a + b, 0);
    const maxTotalScore = Object.values(sectionMaxScores).reduce((a, b) => a + b, 0);
    const percentage = (totalScore / maxTotalScore) * 100;

    // Format section scores for storage
    const formattedSectionScores = Object.keys(sectionScores).map(section => ({
      section,
      score: sectionScores[section],
      maxScore: sectionMaxScores[section]
    }));

    // Save assessment result
    const assessmentResult = new AssessmentResult({
      userId,
      assessmentType,
      answers,
      sectionScores: formattedSectionScores,
      totalScore,
      maxTotalScore,
      percentage
    });

    await assessmentResult.save();

    res.json({
      message: 'Assessment submitted successfully',
      result: {
        totalScore,
        maxTotalScore,
        percentage,
        sectionScores: formattedSectionScores
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting assessment', error: error.message });
  }
});

// Get user's assessment results
router.get('/results/:assessmentType', authenticateToken, async (req, res) => {
  try {
    const { assessmentType } = req.params;
    const userId = req.userId;

    const results = await AssessmentResult.find({
      userId,
      assessmentType
    }).sort({ completedAt: -1 });

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching results', error: error.message });
  }
});

// Start leadership assessment
router.post('/start/leadership', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;

    // Check if user has already completed the assessment
    const existingResult = await AssessmentResult.findOne({
      userId,
      assessmentType: 'leadership'
    });

    if (existingResult) {
      return res.status(403).json({
        message: 'You have already completed this assessment. You cannot retake it.'
      });
    }

    // Get leadership questions
    const questions = await LeadershipQuestion.find({}).sort('questionNumber');

    if (!questions || questions.length === 0) {
      return res.status(404).json({ message: 'No questions available' });
    }

    res.json({ questions });
  } catch (error) {
    console.error('Error starting assessment:', error);
    res.status(500).json({ message: 'Error starting assessment', error: error.message });
  }
});

// Submit leadership assessment
router.post('/submit/leadership', authenticateToken, async (req, res) => {
  try {
    const { answers } = req.body;
    const userId = req.userId;

    console.log('Submitting leadership assessment for user:', userId);
    console.log('Received answers:', answers);

    // Validate answers
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'Invalid answers format' });
    }

    // Get all questions to calculate scores
    const questions = await LeadershipQuestion.find({}).sort('questionNumber');
    console.log('Found questions:', questions.length);

    if (!questions || questions.length === 0) {
      return res.status(404).json({ message: 'No questions found for scoring' });
    }

    // Calculate competency scores
    const competencyScores = {};
    const competencyMaxScores = {};

    questions.forEach(question => {
      const answer = answers.find(a => a.questionNumber === question.questionNumber);
      if (!answer) {
        throw new Error(`Missing answer for question ${question.questionNumber}`);
      }

      if (!competencyScores[question.competency]) {
        competencyScores[question.competency] = 0;
        competencyMaxScores[question.competency] = 0;
      }

      // Debug logging for each question
      console.log(`Question ${question.questionNumber}:`, {
        userAnswer: answer.answer,
        correctAnswer: question.correctAnswer,
        competency: question.competency
      });

      // Score is 1 if answer is correct, 0 if incorrect
      const score = answer.answer === question.correctAnswer ? 1 : 0;
      console.log(`Score for question ${question.questionNumber}:`, score);

      competencyScores[question.competency] += score;
      competencyMaxScores[question.competency] += 1;
    });

    // Calculate total scores
    const totalScore = Object.values(competencyScores).reduce((a, b) => a + b, 0);
    const maxTotalScore = Object.values(competencyMaxScores).reduce((a, b) => a + b, 0);
    const percentage = (totalScore / maxTotalScore) * 100;

    console.log('Final scores:', {
      competencyScores,
      competencyMaxScores,
      totalScore,
      maxTotalScore,
      percentage
    });

    // Format competency scores for storage
    const formattedCompetencyScores = Object.keys(competencyScores).map(competency => ({
      competency,
      score: competencyScores[competency],
      maxScore: competencyMaxScores[competency],
      percentage: (competencyScores[competency] / competencyMaxScores[competency]) * 100
    }));

    console.log('Calculated scores:', {
      totalScore,
      maxTotalScore,
      percentage,
      competencyScores: formattedCompetencyScores
    });

    // Save assessment result
    const assessmentResult = new AssessmentResult({
      userId,
      assessmentType: 'leadership',
      answers,
      competencyScores: formattedCompetencyScores,
      totalScore,
      maxTotalScore,
      percentage,
      completedAt: new Date(),
      score: percentage
    });

    await assessmentResult.save();
    console.log('Assessment result saved successfully');

    // Update user's completed assessments and progress
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Always add a new completion and increment the count
    user.completedAssessments.push({
      assessmentType: 'leadership',
      completedAt: new Date(),
      score: percentage
    });
    user.totalAssessmentsCompleted += 1;

    // Update progress
    const totalAssessments = await Assessment.countDocuments();
    user.progress = Math.min(100, (user.totalAssessmentsCompleted / totalAssessments) * 100);

    await user.save();
    console.log('User progress updated successfully');

    // Get updated assessment status for response
    const availableAssessments = await Assessment.find();
    const completedAssessmentTypes = user.completedAssessments.map(a => a.assessmentType);
    const assessmentStatus = availableAssessments.map(assessment => ({
      type: assessment.category,
      title: assessment.title,
      description: assessment.description,
      completed: completedAssessmentTypes.includes(assessment.category),
      score: user.completedAssessments.find(a => a.assessmentType === assessment.category)?.score || null
    }));

    res.json({
      message: 'Assessment submitted successfully',
      result: {
        totalScore,
        maxTotalScore,
        percentage,
        competencyScores: formattedCompetencyScores,
        assessmentStatus
      }
    });
  } catch (error) {
    console.error('Error submitting assessment:', error);
    res.status(500).json({ message: 'Error submitting assessment', error: error.message });
  }
});

// Get user's completed assessments
router.get('/results/completed', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    console.log('Fetching completed assessments for user:', userId); // Debug log

    // Fetch all completed assessments for the user
    const completedResults = await AssessmentResult.find({ userId })
      .sort({ createdAt: -1 }); // Sort by completion date, newest first

    console.log('Found completed results:', completedResults.length); // Debug log

    // Format the response with assessment details
    const formattedAssessments = completedResults.map(result => ({
      _id: result._id,
      assessmentType: result.assessmentType,
      percentage: result.percentage,
      totalScore: result.totalScore,
      maxTotalScore: result.maxTotalScore,
      sectionScores: result.sectionScores.map(score => ({
        section: score.section,
        score: score.score,
        maxScore: score.maxScore
      })),
      completedAt: result.createdAt,
      recommendations: result.recommendations || []
    }));

    console.log('Formatted assessments:', formattedAssessments); // Debug log
    res.json(formattedAssessments);
  } catch (error) {
    console.error('Error fetching completed assessments:', error);
    res.status(500).json({
      message: 'Error fetching completed assessments',
      error: error.message
    });
  }
});

// Get user's assessment status
router.get('/status/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get all available assessments
    const availableAssessments = await Assessment.find({});
    const totalAvailable = availableAssessments.length;
    
    // Get completed assessments for the user
    const completedResults = await AssessmentResult.find({ userId });
    const completedAssessmentTypes = completedResults.map(result => result.assessmentType);
    
    // Mark assessments as completed or not
    const assessments = availableAssessments.map(assessment => ({
      ...assessment.toObject(),
      isCompleted: completedAssessmentTypes.includes(assessment.category),
      score: completedResults.find(r => r.assessmentType === assessment.category)?.percentage || 0,
      completedAt: completedResults.find(r => r.assessmentType === assessment.category)?.completedAt
    }));
    
    // Calculate progress
    const totalCompleted = completedAssessmentTypes.length;
    const progress = totalAvailable > 0 ? (totalCompleted / totalAvailable) * 100 : 0;
    
    res.json({
      success: true,
      data: {
        assessments,
        totalAvailable,
        totalCompleted,
        completed: completedAssessmentTypes,
        progress,
        availableAssessments: assessments.filter(a => !a.isCompleted),
        completedAssessments: user.completedAssessments || []
      }
    });
  } catch (error) {
    console.error('Error fetching assessment status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching assessment status', 
      error: error.message 
    });
  }
});

// Start puzzle game assessment
router.post('/start/puzzle-game', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    console.log('Starting puzzle game assessment for user:', userId);

    // Check if user has already completed the assessment
    const existingResult = await AssessmentResult.findOne({
      userId,
      assessmentType: 'puzzle-game'
    });

    if (existingResult) {
      // User has already completed the assessment
      // Calculate retake eligibility (7 days)
      const now = new Date();
      const completedAt = new Date(existingResult.completedAt || existingResult.createdAt);
      const diffDays = (now - completedAt) / (1000 * 60 * 60 * 24);
      let canRetake = false;
      let retakeMessage = '';
      if (diffDays >= 7) {
        canRetake = true;
      } else {
        const nextRetake = new Date(completedAt);
        nextRetake.setDate(completedAt.getDate() + 7);
        retakeMessage = `You can retake this assessment in ${Math.ceil(7 - diffDays)} day(s) (on ${nextRetake.toLocaleDateString()})`;
      }
      return res.status(200).json({
        alreadyCompleted: true,
        result: {
          score: existingResult.score,
          percentage: existingResult.percentage,
          completedAt: existingResult.completedAt || existingResult.createdAt
        },
        canRetake,
        retakeMessage
      });
    }

    // Check if there's an in-progress assessment
    const existingAssessment = await ProblemSolvingAssessment.findOne({
      userId,
      assessmentType: 'puzzle-game',
      status: 'in-progress'
    });

    if (existingAssessment) {
      console.log('Found existing in-progress assessment');
      // Get the associated puzzle
      const puzzle = await Puzzle.findOne({
        userId,
        _id: existingAssessment.puzzleGame.puzzles[0]?.puzzleId
      });

      if (puzzle) {
        return res.json({
          success: true,
          data: {
            assessment: existingAssessment,
            puzzle
          }
        });
      }
    }

    // Create a new puzzle game assessment
    const assessment = new ProblemSolvingAssessment({
      userId,
      assessmentType: 'puzzle-game',
      status: 'in-progress',
      startedAt: new Date(),
      maxOverallScore: 100,
      fastQuestions: {
        maxScore: 0,
        totalScore: 0,
        timeTaken: 0,
        questions: []
      },
      puzzleGame: {
        maxScore: 100,
        puzzles: []
      },
      codeforces: {
        handle: 'not-linked',
        rating: 0,
        solvedProblems: 0,
        contests: [],
        lastUpdated: new Date()
      }
    });

    console.log('Saving assessment:', assessment);
    await assessment.save();
    console.log('Assessment saved successfully');

    // Generate initial puzzle state
    let initialState = generatePuzzle(3);

    // Helper to check if puzzle is solved
    const isSolved = (grid) => {
      const size = grid.length;
      let expected = 1;
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          if (i === size - 1 && j === size - 1) {
            if (grid[i][j] !== 0) return false;
          } else {
            if (grid[i][j] !== expected++) return false;
          }
        }
      }
      return true;
    };

    // Ensure the puzzle is not already solved
    while (isSolved(initialState)) {
      initialState = generatePuzzle(3);
    }

    // Start a new puzzle game
    const puzzle = new Puzzle({
      userId,
      size: 3,
      initialState,
      currentState: JSON.parse(JSON.stringify(initialState)),
      moves: 0,
      timeSpent: 0
    });

    console.log('Saving puzzle:', puzzle);
    await puzzle.save();
    console.log('Puzzle saved successfully');

    // Update assessment with puzzle ID
    assessment.puzzleGame.puzzles.push({
      puzzleId: puzzle._id,
      difficulty: 'medium',
      moves: 0,
      timeTaken: 0,
      completed: false
    });
    await assessment.save();

    res.json({
      success: true,
      data: {
        assessment,
        puzzle
      }
    });
  } catch (error) {
    console.error('Error starting puzzle game assessment:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    res.status(500).json({
      message: 'Error starting assessment',
      error: error.message,
      details: error.stack
    });
  }
});

// Get Puzzle Game Assessment Results
router.get('/puzzle-game/user/me/results', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    const results = await AssessmentResult.find({
      userId,
      assessmentType: 'puzzle-game'
    }).sort({ completedAt: -1 });

    const latestResult = results[0];
    const hasCompletedAssessments = results.length > 0;
    
    // Calculate retake eligibility
    let canRetake = false;
    let retakeMessage = '';
    let nextAvailableDate = null;

    if (latestResult) {
      const now = new Date();
      const completedAt = new Date(latestResult.completedAt);
      const diffDays = (now - completedAt) / (1000 * 60 * 60 * 24);
      
      if (diffDays >= 7) {
        canRetake = true;
      } else {
        nextAvailableDate = new Date(completedAt);
        nextAvailableDate.setDate(completedAt.getDate() + 7);
        retakeMessage = `You can retake this assessment in ${Math.ceil(7 - diffDays)} day(s) (on ${nextAvailableDate.toLocaleDateString()})`;
      }
    }

    res.json({
      success: true,
      overallScore: latestResult ? latestResult.score : null,
      hasCompletedAssessments,
      canRetake,
      nextAvailableDate,
      retakeMessage,
      results
    });
  } catch (error) {
    console.error('Error fetching puzzle game results:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching puzzle game results', 
      error: error.message 
    });
  }
});

// Get Fast Question Assessment Results
router.get('/fast-question/user/:userId/results', authenticateToken, async (req, res) => {
  try {
    let userId = req.params.userId;
    if (userId === 'me') {
      userId = req.userId;
    }
    if (req.userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const results = await AssessmentResult.find({
      userId,
      assessmentType: 'fast-questions'
    }).sort({ completedAt: -1 });

    const latestResult = results[0];
    const hasCompletedAssessments = results.length > 0;
    const overallScore = latestResult ? latestResult.score : null;

    res.json({
      overallScore,
      hasCompletedAssessments,
      canRetake: false,
      nextAvailableDate: null,
      results
    });
  } catch (error) {
    console.error('Error fetching fast question results:', error);
    res.status(500).json({ message: 'Error fetching fast question results', error: error.message });
  }
});

// Import the presentation assessment controller
import { submitPresentation } from '../controllers/presentationAssessment.controller.js';

// Submit presentation assessment video
router.post("/presentation/submit", authenticateToken, submitPresentation);

// Check if user has completed presentation assessment
router.get('/presentation/check-completion', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    console.log('Checking completion for user:', userId);

    // Count the number of submissions for this user
    const submissionCount = await PresentationSubmission.countDocuments({ userId });
    console.log('Found submissions:', submissionCount);

    res.json({
      completed: submissionCount >= 3,
      submissionCount
    });
  } catch (error) {
    console.error('Error checking completion:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error checking completion status', 
      error: error.message 
    });
  }
});

// Get user's presentation submissions
router.get('/presentation/submissions', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    console.log('Fetching submissions for user:', userId);

    const submissions = await PresentationSubmission.find({ userId })
      .sort({ submittedAt: -1 });

    res.json({
      submissions
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ message: 'Error fetching submissions', error: error.message });
  }
});

// Start Fast Questions Assessment
router.post('/start/fast-questions', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Check if user has already completed this assessment
    const existingResult = await AssessmentResult.findOne({
      userId,
      assessmentType: 'fast-questions'
    }).sort({ completedAt: -1 });

    if (existingResult) {
      const now = new Date();
      const completedAt = existingResult.completedAt || existingResult.createdAt;
      const diffDays = (now - completedAt) / (1000 * 60 * 60 * 24);
      if (diffDays < 7) {
        const nextRetake = new Date(completedAt);
        nextRetake.setDate(completedAt.getDate() + 7);
        return res.status(403).json({
          message: `You can retake this assessment in ${Math.ceil(7 - diffDays)} day(s) (on ${nextRetake.toLocaleDateString()})`,
          nextAvailableDate: nextRetake
        });
      }
      // else, allow retake
    }

    // Get questions from the database
    const questions = await ProblemSolvingQuestion.find({}).sort({ questionNumber: 1 });
    
    if (!questions || questions.length === 0) {
      return res.status(404).json({ message: 'No questions available' });
    }

    // Create or update ProblemSolvingAssessment document
    let assessment = await ProblemSolvingAssessment.findOne({ userId, assessmentType: 'fast-questions' });
    if (!assessment) {
      const maxScore = questions.length;
      assessment = new ProblemSolvingAssessment({
        userId,
        assessmentType: 'fast-questions',
        status: 'in-progress',
        startedAt: new Date(),
        fastQuestions: {
          questions: questions.map(q => ({
            questionNumber: q.questionNumber,
            questionText: q.questionText,
            options: q.options.map(opt => ({ text: opt.text, isCorrect: false })), // isCorrect not used here
            timeLimit: q.timeLimit
          })),
          totalScore: 0,
          maxScore,
          timeTaken: 0
        },
        puzzleGame: {
          puzzles: [],
          totalScore: 0,
          maxScore: 1 // dummy value
        },
        codeforces: {
          handle: 'none',
          rating: 0,
          solvedProblems: 0,
          contests: [],
          lastUpdated: new Date()
        },
        overallScore: 0,
        maxOverallScore: maxScore,
        percentage: 0
      });
    }

    await assessment.save();

    res.json({
      questions,
      assessmentId: assessment._id
    });
  } catch (error) {
    console.error('Error starting fast questions assessment:', error);
    res.status(500).json({ message: 'Error starting assessment', error: error.message });
  }
});

// Submit Fast Questions Assessment
router.post('/submit/fast-questions', authenticateToken, async (req, res) => {
  try {
    const { answers } = req.body;
    const userId = req.userId;

    // Get all questions for this assessment type
    const questions = await ProblemSolvingQuestion.find({}).sort({ questionNumber: 1 });

    // Calculate score
    let score = 0;
    answers.forEach(ans => {
      const q = questions.find(q => q.questionNumber === ans.questionNumber);
      if (q && q.correctAnswer === ans.answer) {
        score += 1;
      }
    });

    // Calculate percentage
    const percentage = (score / questions.length) * 100;

    // Save result
    const assessmentResult = new AssessmentResult({
      userId,
      assessmentType: 'fast-questions',
      score,
      percentage,
      completedAt: new Date(),
      details: { totalQuestions: questions.length, answers }
    });

    await assessmentResult.save();

    // Ensure AssessmentResult exists for progress tracking
    // (If already exists for this user and assessmentType in last 7 days, update it)
    const existingResult = await AssessmentResult.findOne({
      userId,
      assessmentType: 'fast-questions',
      completedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    if (!existingResult) {
      await assessmentResult.save();
    } else {
      existingResult.score = score;
      existingResult.percentage = percentage;
      existingResult.completedAt = new Date();
      existingResult.details = { totalQuestions: questions.length, answers };
      await existingResult.save();
    }

    // Update user's completed assessments and progress
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has completed this assessment in the last 7 days
    const now = new Date();
    const lastCompletion = user.completedAssessments
      .filter(a => a.assessmentType === 'fast-questions')
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))[0];
    let shouldIncrement = true;
    if (lastCompletion) {
      const completedAt = new Date(lastCompletion.completedAt);
      const diffDays = (now - completedAt) / (1000 * 60 * 60 * 24);
      if (diffDays < 7) {
        shouldIncrement = false;
      }
    }

    if (shouldIncrement) {
      user.completedAssessments.push({
        assessmentType: 'fast-questions',
        completedAt: new Date(),
        score
      });
      user.totalAssessmentsCompleted += 1;
    }

    // Calculate total assessments and progress
    const totalAssessments = await Assessment.countDocuments();
    user.progress = Math.min(100, (user.totalAssessmentsCompleted / totalAssessments) * 100);

    await user.save();

    // Get assessment status
    const assessment = await Assessment.findOne({ category: 'Fast Question' });
    const assessmentStatus = {
      title: assessment?.title || 'Fast Question Assessment',
      description: assessment?.description || 'Test your problem-solving skills with quick questions',
      completed: true,
      score
    };

    // Also update or create ProblemSolvingAssessment for this user and assessment type
    let problemSolvingAssessment = await ProblemSolvingAssessment.findOne({ userId, assessmentType: 'fast-questions' });
    if (problemSolvingAssessment) {
      problemSolvingAssessment.status = 'completed';
      problemSolvingAssessment.completedAt = new Date();
      problemSolvingAssessment.overallScore = score;
      problemSolvingAssessment.maxOverallScore = questions.length;
      problemSolvingAssessment.percentage = percentage;
      await problemSolvingAssessment.save();
    } else {
      // Create the assessment if it doesn't exist
      problemSolvingAssessment = new ProblemSolvingAssessment({
        userId,
        assessmentType: 'fast-questions',
        status: 'completed',
        completedAt: new Date(),
        overallScore: score,
        maxOverallScore: questions.length,
        percentage: percentage,
        fastQuestions: {
          questions: questions.map(q => ({
            questionNumber: q.questionNumber,
            questionText: q.questionText,
            options: q.options.map(opt => ({ text: opt.text, isCorrect: false })),
            timeLimit: q.timeLimit
          })),
          totalScore: score,
          maxScore: questions.length,
          timeTaken: 0
        }
      });
      await problemSolvingAssessment.save();
    }

    res.json({
      message: 'Assessment submitted successfully',
      score,
      totalQuestions: questions.length,
      assessmentStatus
    });
  } catch (error) {
    console.error('Error submitting fast questions assessment:', error);
    res.status(500).json({ message: 'Error submitting assessment', error: error.message });
  }
});

// Update an assessment (admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title, description, duration, isActive, image, category } = req.body;
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
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    res.json({
      success: true,
      message: 'Assessment updated successfully',
      data: updatedAssessment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating assessment', error: error.message });
  }
});

// Create a new assessment (admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title, description, category, duration, image } = req.body;
    const newAssessment = new Assessment({
      title,
      description,
      category,
      duration,
      image,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isActive: true
    });
    await newAssessment.save();
    res.status(201).json(newAssessment);
  } catch (err) {
    console.error('Error creating assessment:', err);
    res.status(500).json({ message: 'Failed to create assessment' });
  }
});

// Start adaptability assessment
router.post('/start/adaptability', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;

    // Check if user has already completed the assessment
    const existingResult = await AssessmentResult.findOne({
      userId,
      assessmentType: 'adaptability'
    });

    if (existingResult) {
      return res.status(403).json({
        message: 'You have already completed this assessment. You cannot retake it.'
      });
    }

    // Get adaptability questions
    const questions = await AdaptabilityAssessmentQuestion.find({}).sort('questionNumber');

    if (!questions || questions.length === 0) {
      return res.status(404).json({ message: 'No questions available' });
    }

    res.json({ questions });
  } catch (error) {
    console.error('Error starting adaptability assessment:', error);
    res.status(500).json({ message: 'Error starting assessment', error: error.message });
  }
});

// Submit Adaptability Assessment
router.post('/submit/adaptability', authenticateToken, async (req, res) => {
  try {
    const { answers } = req.body;
    const userId = req.userId;

    // Check if user has completed this assessment in the last 7 days
    const lastResult = await AssessmentResult.findOne({
      userId,
      assessmentType: 'adaptability'
    }).sort({ completedAt: -1 });
    const now = new Date();
    if (lastResult && lastResult.completedAt) {
      const completedAt = new Date(lastResult.completedAt);
      const diffDays = (now - completedAt) / (1000 * 60 * 60 * 24);
      if (diffDays < 7) {
        const nextRetake = new Date(completedAt);
        nextRetake.setDate(completedAt.getDate() + 7);
        return res.status(403).json({
          message: `You can retake this assessment in ${Math.ceil(7 - diffDays)} day(s) (on ${nextRetake.toLocaleDateString()})`,
          canRetake: false,
          nextRetake: nextRetake
        });
      }
    }

    // Calculate score
    let totalScore = 0;
    let maxPossibleScore = 0;
    const questions = await AdaptabilityAssessmentQuestion.find({});
    answers.forEach(ans => {
      const q = questions.find(q => q.questionNumber === ans.questionNumber);
      if (!q) return;
      maxPossibleScore += q.maxScore;
      if (q.questionType === 'SJT') {
        // Assume answer is the value of the selected option
        totalScore += ans.answer;
      } else {
        totalScore += ans.answer;
      }
    });
    const percentage = (totalScore / maxPossibleScore) * 100;

    // Save result
    const assessmentResult = new AssessmentResult({
      userId,
      assessmentType: 'adaptability',
      score: totalScore,
      completedAt: now,
      details: { totalQuestions: questions.length, answers },
      percentage
    });
    await assessmentResult.save();

    res.json({
      message: 'Assessment submitted successfully',
      result: {
        score: totalScore,
        totalQuestions: questions.length,
        percentage,
        canRetake: false,
        nextRetake: null
      }
    });
  } catch (error) {
    console.error('Error submitting adaptability assessment:', error);
    res.status(500).json({ message: 'Error submitting assessment', error: error.message });
  }
});

// Get Adaptability Assessment Results
router.get('/adaptability/user/:userId/results', authenticateToken, async (req, res) => {
  try {
    let userId = req.params.userId;
    if (userId === 'me') {
      userId = req.userId;
    }
    if (req.userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const results = await AssessmentResult.find({
      userId,
      assessmentType: 'adaptability'
    }).sort({ completedAt: -1 });

    const latestResult = results[0];
    const hasCompletedAssessments = results.length > 0;
    const overallScore = latestResult ? latestResult.score : null;

    res.json({
      overallScore,
      hasCompletedAssessments,
      canRetake: false,
      nextAvailableDate: null,
      results
    });
  } catch (error) {
    console.error('Error fetching adaptability results:', error);
    res.status(500).json({ message: 'Error fetching adaptability results', error: error.message });
  }
});

// Admin endpoint to clean up duplicates and fix puzzle-game progress
router.post('/admin/cleanup-puzzle-game-progress', authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find({});
    let updatedCount = 0;
    for (const user of users) {
      // Filter all puzzle-game entries
      const puzzleEntries = user.completedAssessments.filter(a => a.assessmentType === 'puzzle-game');
      if (puzzleEntries.length > 1) {
        // Keep only the latest
        const latest = puzzleEntries.reduce((a, b) => new Date(a.completedAt) > new Date(b.completedAt) ? a : b);
        // Find latest AssessmentResult for puzzle-game
        const latestResult = await AssessmentResult.findOne({
          userId: user._id,
          assessmentType: 'puzzle-game'
        }).sort({ completedAt: -1 });
        if (latestResult) {
          latest.score = latestResult.score;
          latest.percentage = latestResult.percentage;
          latest.completedAt = latestResult.completedAt || latestResult.createdAt;
        }
        // Remove all puzzle-game entries
        user.completedAssessments = user.completedAssessments.filter(a => a.assessmentType !== 'puzzle-game');
        // Add back only the latest, fixed one
        user.completedAssessments.push(latest);
        await user.save();
        updatedCount++;
      } else if (puzzleEntries.length === 1) {
        // Ensure the single entry matches the latest AssessmentResult
        const latestResult = await AssessmentResult.findOne({
          userId: user._id,
          assessmentType: 'puzzle-game'
        }).sort({ completedAt: -1 });
        if (latestResult) {
          puzzleEntries[0].score = latestResult.score;
          puzzleEntries[0].percentage = latestResult.percentage;
          puzzleEntries[0].completedAt = latestResult.completedAt || latestResult.createdAt;
          await user.save();
          updatedCount++;
        }
      }
    }
    res.json({ message: `Cleaned up and fixed puzzle-game progress for ${updatedCount} users.` });
  } catch (error) {
    console.error('Error cleaning up puzzle-game progress:', error);
    res.status(500).json({ message: 'Error cleaning up puzzle-game progress', error: error.message });
  }
});

// Submit puzzle game assessment
router.post('/submit/puzzle-game', authenticateToken, async (req, res) => {
  try {
    const { puzzleData } = req.body;
    const userId = req.userId;

    // Validate request body
    if (!Array.isArray(puzzleData) || puzzleData.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid puzzle data format' 
      });
    }

    // Validate each puzzle in the data
    for (const puzzle of puzzleData) {
      if (!puzzle.puzzleId || typeof puzzle.moves !== 'number' || 
          typeof puzzle.timeTaken !== 'number' || typeof puzzle.completed !== 'boolean') {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid puzzle data structure' 
        });
      }
    }

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Calculate total score based on completed puzzles
    let totalScore = 0;
    let maxScore = 100;
    let totalMoves = 0;
    let totalTime = 0;
    let completedPuzzles = 0;
    let rating = '';

    puzzleData.forEach(puzzle => {
      if (puzzle.completed) {
        completedPuzzles++;
        totalMoves += puzzle.moves;
        totalTime += puzzle.timeTaken;
        if (typeof puzzle.score === 'number') {
          totalScore = puzzle.score;
        }
      }
    });

    // If no score sent from frontend, calculate based on completion time
    if (typeof totalScore !== 'number' || totalScore === 0) {
      const completionTime = totalTime / 60; // Convert to minutes
      if (completionTime <= 1) {
        totalScore = 100;
        rating = 'Excellent';
      } else if (completionTime <= 2) {
        totalScore = 85;
        rating = 'Very Good';
      } else if (completionTime <= 3) {
        totalScore = 70;
        rating = 'Good';
      } else if (completionTime <= 4) {
        totalScore = 50;
        rating = 'Fair';
      } else {
        totalScore = 30;
        rating = 'Poor';
      }
    }

    // Calculate percentage
    const percentage = (totalScore / maxScore) * 100;

    // Update user's assessment status
    if (!user.completedAssessments) {
      user.completedAssessments = [];
    }

    // Check if user has already completed this assessment
    const existingAssessmentIndex = user.completedAssessments.findIndex(
      a => a.assessmentType === 'puzzle-game'
    );

    if (existingAssessmentIndex !== -1) {
      // Update existing assessment score
      user.completedAssessments[existingAssessmentIndex] = {
        assessmentType: 'puzzle-game',
        completedAt: new Date(),
        score: totalScore,
        percentage,
        rating: rating
      };
    } else {
      // Add new completion
      user.completedAssessments.push({
        assessmentType: 'puzzle-game',
        completedAt: new Date(),
        score: totalScore,
        percentage,
        rating: rating
      });
      user.totalAssessmentsCompleted += 1;
    }

    // Update progress
    const totalAssessments = await Assessment.countDocuments();
    user.progress = Math.min(100, (user.totalAssessmentsCompleted / totalAssessments) * 100);

    await user.save();

    // Create new assessment result
    const assessmentResult = new AssessmentResult({
      userId,
      assessmentType: 'puzzle-game',
      score: totalScore,
      percentage,
      maxScore,
      completedAt: new Date(),
      rating: rating,
      details: {
        completedPuzzles,
        totalPuzzles: puzzleData.length,
        totalMoves,
        totalTime,
        completionTime: (totalTime / 60).toFixed(2),
        rating: rating
      }
    });

    await assessmentResult.save();

    // Update the assessment status to completed
    await ProblemSolvingAssessment.findOneAndUpdate(
      { userId, assessmentType: 'puzzle-game', status: 'in-progress' },
      { status: 'completed', completedAt: new Date() }
    );

    // Get updated assessment status for response
    const availableAssessments = await Assessment.find();
    const completedAssessmentTypes = user.completedAssessments.map(a => a.assessmentType);
    const remainingAssessments = availableAssessments.filter(
      assessment => !completedAssessmentTypes.includes(assessment.category)
    );

    res.json({
      success: true,
      message: 'Puzzle game assessment submitted successfully',
      result: {
        score: totalScore,
        maxScore,
        completedPuzzles,
        totalPuzzles: puzzleData.length,
        totalMoves,
        totalTime,
        completionTime: (totalTime / 60).toFixed(2),
        rating: rating,
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
    console.error('Error submitting puzzle game assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting assessment',
      error: error.message
    });
  }
});

export default router;