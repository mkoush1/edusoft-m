// ===== FIXED CONTROLLER (leetcodeAssessment.controller.js) =====
import LeetCodeAssessment from '../models/LeetCodeAssessment.js';
import leetcodeService from '../services/leetcodeService.js';
import mongoose from 'mongoose';
import { validationResult } from 'express-validator';

/**
 * Start a new LeetCode assessment for a user
 */
export const startLeetCodeAssessment = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const { userId, leetCodeUsername } = req.body;

    console.log('userId:', userId);
    console.log('leetCodeUsername:', leetCodeUsername);

    // Input validation
    if (!userId || !leetCodeUsername) {
      console.log('Missing required fields - userId or leetCodeUsername');
      return res.status(400).json({ 
        success: false,
        message: 'User ID and LeetCode username are required' 
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Validate LeetCode username format (basic validation)
    const usernameRegex = /^[a-zA-Z0-9_-]{1,15}$/;
    if (!usernameRegex.test(leetCodeUsername)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid LeetCode username format'
      });
    }

    // Check if user already has an active assessment
    const existingAssessment = await LeetCodeAssessment.findOne({
      userId,
      status: { $in: ['not_started', 'in_progress'] }
    });

    if (existingAssessment) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active LeetCode assessment',
        assessment: existingAssessment
      });
    }

    // Generate verification code
    const verificationCode = leetcodeService.generateVerificationCode();

    // Select random problems for the assessment
    const problems = await leetcodeService.selectRandomProblems(3);
    
    if (!problems || problems.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Failed to select problems for assessment'
      });
    }
    
    // Format problems for storage
    const assignedProblems = problems.map(problem => ({
      problemId: problem.questionId || problem.id,
      title: problem.title,
      difficulty: problem.difficulty,
      titleSlug: problem.titleSlug,
      completed: false,
      completedAt: null
    }));

    // Create new assessment
    const newAssessment = new LeetCodeAssessment({
      userId,
      leetCodeUsername,
      verificationMethod: 'bio',
      verificationCode,
      assignedProblems,
      status: 'not_started',
      verificationStatus: 'pending'
    });

    await newAssessment.save();

    res.status(201).json({
      success: true,
      message: 'LeetCode assessment created successfully',
      assessment: newAssessment,
      verificationInstructions: `To verify your LeetCode account, please add the following code to your LeetCode profile bio: ${verificationCode}`
    });
  } catch (error) {
    console.error('Error starting LeetCode assessment:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to start LeetCode assessment', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Check if a specific problem is solved and update progress
 */
export const checkProblemStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation error',
        errors: errors.array() 
      });
    }

    const { assessmentId, problemId } = req.params;
    console.log(`Checking problem status for assessment ${assessmentId} and problem ${problemId}`);
    
    // Skip userId check for now to simplify debugging
    // const userId = req.user?.id; // Assuming user ID is available from auth middleware

    // Find the assessment
    const assessment = await LeetCodeAssessment.findOne({
      _id: assessmentId
      // userId - temporarily removed for debugging
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found',
        assessmentId
      });
    }

    console.log(`Found assessment for user ${assessment.userId} with username ${assessment.leetCodeUsername}`);
    console.log(`Assessment has ${assessment.assignedProblems.length} problems`);
    
    // Find the problem in the assessment using numeric problemId
    let problem = null;
    
    // First try direct match on problemId field
    problem = assessment.assignedProblems.find(p => p.problemId === problemId);
    
    // If not found, try matching by MongoDB _id
    if (!problem && mongoose.Types.ObjectId.isValid(problemId)) {
      problem = assessment.assignedProblems.find(p => p._id.toString() === problemId);
    }
    
    // If still not found, try matching by title or titleSlug
    if (!problem) {
      problem = assessment.assignedProblems.find(p => 
        p.title.toLowerCase().includes(problemId.toLowerCase()) || 
        (p.titleSlug && p.titleSlug.toLowerCase().includes(problemId.toLowerCase()))
      );
    }
    
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found in this assessment',
        problemId: problemId,
        availableProblems: assessment.assignedProblems.map(p => ({ 
          _id: p._id, 
          problemId: p.problemId,
          title: p.title,
          titleSlug: p.titleSlug
        }))
      });
    }
    
    console.log(`Found problem: ${problem.title} (${problem.problemId})`);

    // Skip if already completed
    if (problem.completed) {
      return res.status(200).json({
        success: true,
        message: 'Problem already marked as completed',
        completed: true,
        assessment,
        problem
      });
    }

    // Check if problem is solved on LeetCode
    try {
      console.log(`Checking if ${assessment.leetCodeUsername} has solved problem ${problem.title} (${problem.problemId})`);
      
      // Always use titleSlug for the check, regardless of what is passed in the URL
      const isSolved = await leetcodeService.hasSolvedProblem(
        assessment.leetCodeUsername,
        problem.titleSlug
      );
      
      console.log(`Problem solved check result: ${isSolved ? 'SOLVED' : 'NOT SOLVED'}`);

      if (!isSolved) {
        return res.status(200).json({
          success: true,
          message: 'Problem not yet solved on LeetCode. Please solve it on LeetCode and try again.',
          completed: false,
          assessment
        });
      }
      
      console.log('Problem verified as solved! Updating assessment...');
    } catch (error) {
      console.error('Error checking if problem is solved:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking problem solution status',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }

    // Update the problem status
    problem.completed = true;
    problem.completedAt = new Date();

    // Calculate new score (1 point for Easy, 2 for Medium, 3 for Hard)
    const difficultyScores = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
    const newScore = assessment.score + (difficultyScores[problem.difficulty] || 1);
    
    // Check if all problems are completed
    const allCompleted = assessment.assignedProblems.every(p => 
      p._id.toString() === problem._id.toString() ? true : p.completed
    );

    console.log(`Updating assessment. New score: ${newScore}, All completed: ${allCompleted}`);

    try {
      // Find the problem index in the array
      const problemIndex = assessment.assignedProblems.findIndex(p => 
        p._id.toString() === problem._id.toString() || 
        p.problemId === problem.problemId
      );
      
      if (problemIndex === -1) {
        throw new Error('Problem not found in assessment');
      }
      
      // Update the problem directly in the array
      assessment.assignedProblems[problemIndex].completed = true;
      assessment.assignedProblems[problemIndex].completedAt = new Date();
      
      // Update other assessment fields
      assessment.score = newScore;
      assessment.status = allCompleted ? 'completed' : 'in_progress';
      if (allCompleted) {
        assessment.completedAt = new Date();
      }
      
      // Save the updated assessment
      await assessment.save();
      
      console.log('Assessment updated successfully');
      
      return res.status(200).json({
        success: true,
        message: 'Problem marked as completed!',
        completed: true,
        assessment,
        problem: assessment.assignedProblems[problemIndex]
      });
    } catch (error) {
      console.error('Error updating assessment:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating assessment',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }

  } catch (error) {
    console.error('Error checking problem status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check problem status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Verify a user's LeetCode account
 */
export const verifyLeetCodeAccount = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assessment ID format'
      });
    }

    const assessment = await LeetCodeAssessment.findById(assessmentId);
    
    if (!assessment) {
      return res.status(404).json({ 
        success: false,
        message: 'Assessment not found' 
      });
    }

    if (assessment.verificationStatus === 'verified') {
      return res.status(200).json({ 
        success: true,
        message: 'Account already verified', 
        assessment 
      });
    }

    // Verify account based on verification method
    let isVerified = false;
    
    try {
      if (assessment.verificationMethod === 'bio') {
        isVerified = await leetcodeService.verifyAccountByBio(
          assessment.leetCodeUsername,
          assessment.verificationCode
        );
      }
    } catch (verificationError) {
      console.error('Verification service error:', verificationError);
      return res.status(500).json({
        success: false,
        message: 'Verification service temporarily unavailable'
      });
    }

    if (isVerified) {
      // Update assessment status
      assessment.verificationStatus = 'verified';
      assessment.verifiedAt = new Date();
      assessment.status = 'in_progress';
      await assessment.save();

      res.status(200).json({
        success: true,
        message: 'LeetCode account verified successfully',
        assessment,
        problems: assessment.assignedProblems
      });
    } else {
      // Update verification status to failed after multiple attempts
      assessment.verificationStatus = 'failed';
      await assessment.save();

      res.status(400).json({
        success: false,
        message: 'Verification failed. Please make sure you have added the verification code to your LeetCode profile bio.',
        verificationCode: assessment.verificationCode
      });
    }
  } catch (error) {
    console.error('Error verifying LeetCode account:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to verify LeetCode account', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Check progress on assigned LeetCode problems
 */
export const checkLeetCodeProgress = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    console.log('Checking progress for assessment:', assessmentId);

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assessment ID format'
      });
    }

    const assessment = await LeetCodeAssessment.findById(assessmentId);
    
    if (!assessment) {
      console.log('Assessment not found:', assessmentId);
      return res.status(404).json({ 
        success: false,
        message: 'Assessment not found' 
      });
    }

    console.log('Found assessment:', assessment._id, 'for user:', assessment.userId);
    console.log('Verification status:', assessment.verificationStatus);

    if (assessment.verificationStatus !== 'verified') {
      return res.status(400).json({ 
        success: false,
        message: 'Account not verified yet' 
      });
    }

    if (assessment.status === 'completed') {
      return res.status(200).json({
        success: true,
        message: 'Assessment already completed',
        assessment,
        completedCount: assessment.assignedProblems.filter(p => p.completed).length,
        totalCount: assessment.assignedProblems.length,
        score: assessment.score
      });
    }

    // Check progress for each assigned problem
    const username = assessment.leetCodeUsername;
    console.log('Checking progress for LeetCode username:', username);
    
    let totalCompleted = 0;
    let updatedProblems = [...assessment.assignedProblems]; // Create a copy

    console.log('Assigned problems:', assessment.assignedProblems);

    for (let i = 0; i < updatedProblems.length; i++) {
      const problem = updatedProblems[i];
      console.log('Checking problem:', problem.title, '(', problem.titleSlug, ')');
      
      // Skip already completed problems
      if (problem.completed) {
        console.log('Problem already marked as completed');
        totalCompleted++;
        continue;
      }

      try {
        // Check if problem has been solved
        console.log('Checking if problem has been solved...');
        const isSolved = await leetcodeService.hasSolvedProblem(username, problem.titleSlug);
        console.log('Problem solved?', isSolved);
        
        if (isSolved) {
          console.log('Marking problem as completed');
          updatedProblems[i] = {
            ...problem,
            completed: true,
            completedAt: new Date()
          };
          totalCompleted++;
        } else {
          console.log('Problem not completed yet');
        }
      } catch (checkError) {
        console.error('Error checking problem:', problem.titleSlug, checkError);
        // Continue with other problems if one fails
      }
    }

    // Calculate score (percentage based)
    const score = Math.round((totalCompleted / assessment.assignedProblems.length) * 100);
    console.log('Calculated score:', score, '% (', totalCompleted, '/', assessment.assignedProblems.length, ')');
    
    // Update assessment
    assessment.assignedProblems = updatedProblems;
    assessment.score = score;
    
    // If all problems are completed, mark assessment as completed
    if (totalCompleted === assessment.assignedProblems.length) {
      console.log('All problems completed, marking assessment as completed');
      assessment.status = 'completed';
      assessment.completedAt = new Date();
    }

    console.log('Saving updated assessment');
    await assessment.save();
    console.log('Assessment saved successfully');

    res.status(200).json({
      success: true,
      message: 'Progress updated successfully',
      assessment,
      completedCount: totalCompleted,
      totalCount: assessment.assignedProblems.length,
      score,
      isCompleted: assessment.status === 'completed'
    });
  } catch (error) {
    console.error('Error checking LeetCode progress:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to check LeetCode progress', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Get assessment details
 */
export const getLeetCodeAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assessment ID format'
      });
    }

    const assessment = await LeetCodeAssessment.findById(assessmentId)
      .populate('userId', 'name email'); // Populate user info if needed
    
    if (!assessment) {
      return res.status(404).json({ 
        success: false,
        message: 'Assessment not found' 
      });
    }

    res.status(200).json({ 
      success: true,
      assessment 
    });
  } catch (error) {
    console.error('Error getting LeetCode assessment:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get LeetCode assessment', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Get all LeetCode assessments for a user
 */
export const getUserLeetCodeAssessments = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Build query
    const query = { userId };
    if (status && ['not_started', 'in_progress', 'completed'].includes(status)) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const assessments = await LeetCodeAssessment.find(query)
      .sort({ startedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await LeetCodeAssessment.countDocuments(query);
    
    res.status(200).json({ 
      success: true,
      assessments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error getting user LeetCode assessments:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get user LeetCode assessments', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};