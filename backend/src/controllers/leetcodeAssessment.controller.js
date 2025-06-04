import mongoose from 'mongoose';
import { validationResult } from 'express-validator';
import LeetCodeAssessment from '../../models/LeetCodeAssessment.js';
import leetcodeService from '../services/leetcodeService.js';

/**
 * Start a new LeetCode assessment for a user
 */
export const startLeetCodeAssessment = async (req, res) => {
  try {
    console.log('Starting LeetCode assessment with payload:', req.body);
    const { userId, leetCodeUsername } = req.body;

    if (!userId || !leetCodeUsername) {
      console.log('Missing required fields:', { userId, leetCodeUsername });
      return res.status(400).json({ message: 'User ID and LeetCode username are required' });
    }

    // Check if user already has an active assessment
    console.log(`Checking for existing assessments for user ${userId}`);
    const existingAssessment = await LeetCodeAssessment.findOne({
      userId,
      status: { $in: ['not_started', 'in_progress'] }
    });

    if (existingAssessment) {
      console.log('User already has an active assessment:', existingAssessment._id);
      return res.status(400).json({
        message: 'You already have an active LeetCode assessment',
        assessment: existingAssessment
      });
    }

    // Verify that the LeetCode username exists
    console.log(`Verifying LeetCode username: ${leetCodeUsername}`);
    const usernameExists = await leetcodeService.checkUsernameExists(leetCodeUsername);
    
    if (!usernameExists) {
      console.log(`LeetCode username '${leetCodeUsername}' does not exist`);
      return res.status(400).json({
        message: `The LeetCode username '${leetCodeUsername}' does not exist. Please enter a valid LeetCode username.`
      });
    }
    
    console.log(`LeetCode username '${leetCodeUsername}' verified successfully`);

    // Generate verification code
    console.log('Generating verification code');
    const verificationCode = leetcodeService.generateVerificationCode();
    console.log('Generated verification code:', verificationCode);

    // Select random problems for the assessment
    console.log('Selecting random problems');
    let problems;
    try {
      problems = await leetcodeService.selectRandomProblems(3);
      console.log('Selected problems:', problems);
    } catch (problemError) {
      console.error('Error selecting problems:', problemError);
      // Use fallback problems if there's an error
      problems = [
        {
          questionId: '1',
          questionFrontendId: '1',
          title: 'Two Sum',
          titleSlug: 'two-sum',
          difficulty: 'EASY'
        },
        {
          questionId: '9',
          questionFrontendId: '9',
          title: 'Palindrome Number',
          titleSlug: 'palindrome-number',
          difficulty: 'EASY'
        },
        {
          questionId: '13',
          questionFrontendId: '13',
          title: 'Roman to Integer',
          titleSlug: 'roman-to-integer',
          difficulty: 'EASY'
        }
      ];
      console.log('Using fallback problems');
    }
    
    // Format problems for storage
    console.log('Formatting problems for storage');
    const assignedProblems = problems.map(problem => ({
      problemId: problem.questionId || problem.id || '1',
      title: problem.title || 'Two Sum',
      difficulty: problem.difficulty || 'EASY',
      titleSlug: problem.titleSlug || problem.titleSlug || '',
      completed: false,
      completedAt: null
    }));
    console.log('Formatted problems:', assignedProblems);
    console.log('DEBUG: assignedProblems to be saved:', assignedProblems);

    // Create new assessment
    console.log('Creating new assessment document');
    const newAssessment = new LeetCodeAssessment({
      userId,
      leetCodeUsername,
      verificationMethod: 'bio',
      verificationCode,
      assignedProblems,
      status: 'not_started'
    });

    console.log('Saving new assessment to database');
    await newAssessment.save();
    console.log('Assessment saved with ID:', newAssessment._id);

    console.log('Sending successful response');
    res.status(201).json({
      message: 'LeetCode assessment created successfully',
      assessment: newAssessment,
      verificationInstructions: `To verify your LeetCode account, please add the following code to your LeetCode profile bio: ${verificationCode}`
    });
  } catch (error) {
    console.error('Error starting LeetCode assessment:', error);
    // Send more detailed error information for debugging
    res.status(500).json({ 
      message: 'Failed to start LeetCode assessment', 
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
};

/**
 * Verify a user's LeetCode account ownership
 */
export const verifyLeetCodeAccount = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    const assessment = await LeetCodeAssessment.findById(assessmentId);
    
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    if (assessment.verificationStatus === 'verified') {
      return res.status(200).json({ message: 'Account already verified', assessment });
    }

    // Verify account based on verification method
    let isVerified = false;
    
    if (assessment.verificationMethod === 'bio') {
      isVerified = await leetcodeService.verifyAccountByBio(
        assessment.leetCodeUsername,
        assessment.verificationCode
      );
    }

    if (isVerified) {
      // Update assessment status
      assessment.verificationStatus = 'verified';
      assessment.verifiedAt = new Date();
      assessment.status = 'in_progress';
      await assessment.save();

      res.status(200).json({
        message: 'LeetCode account verified successfully',
        assessment,
        problems: assessment.assignedProblems
      });
    } else {
      res.status(400).json({
        message: 'Verification failed. Please make sure you have added the verification code to your LeetCode profile bio.',
        verificationCode: assessment.verificationCode
      });
    }
  } catch (error) {
    console.error('Error verifying LeetCode account:', error);
    res.status(500).json({ message: 'Failed to verify LeetCode account', error: error.message });
  }
};

/**
 * Check progress on assigned LeetCode problems
 */
export const checkLeetCodeProgress = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    console.log('Checking progress for assessment:', assessmentId);

    const assessment = await LeetCodeAssessment.findById(assessmentId);
    
    if (!assessment) {
      console.log('Assessment not found:', assessmentId);
      return res.status(404).json({ message: 'Assessment not found' });
    }

    console.log('Found assessment:', assessment._id, 'for user:', assessment.userId);
    console.log('Verification status:', assessment.verificationStatus);

    if (assessment.verificationStatus !== 'verified') {
      return res.status(400).json({ message: 'Account not verified yet' });
    }

    // Check progress for each assigned problem
    const username = assessment.leetCodeUsername;
    console.log('Checking progress for LeetCode username:', username);
    
    let totalCompleted = 0;
    let updatedProblems = [];

    console.log('Assigned problems:', assessment.assignedProblems);

    for (const problem of assessment.assignedProblems) {
      console.log('Checking problem:', problem.title, '(', problem.titleSlug, ')');
      
      // Skip already completed problems
      if (problem.completed) {
        console.log('Problem already marked as completed');
        totalCompleted++;
        updatedProblems.push(problem);
        continue;
      }

      // Check if problem has been solved
      console.log('Checking if problem has been solved...');
      const isSolved = await leetcodeService.hasSolvedProblem(username, problem.titleSlug);
      console.log('Problem solved?', isSolved);
      
      if (isSolved) {
        console.log('Marking problem as completed');
        problem.completed = true;
        problem.completedAt = new Date();
        totalCompleted++;
      } else {
        console.log('Problem not completed yet');
        // Keep the problem as not completed
      }
      
      updatedProblems.push(problem);
    }

    // Calculate score (each problem is worth 33.33 points)
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
      message: 'Progress updated successfully',
      assessment,
      completedCount: totalCompleted,
      totalCount: assessment.assignedProblems.length,
      score
    });
  } catch (error) {
    console.error('Error checking LeetCode progress:', error);
    res.status(500).json({ message: 'Failed to check LeetCode progress', error: error.message });
  }
};

/**
 * Get assessment details
 */
export const getLeetCodeAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    const assessment = await LeetCodeAssessment.findById(assessmentId);
    
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    res.status(200).json({ assessment });
  } catch (error) {
    console.error('Error getting LeetCode assessment:', error);
    res.status(500).json({ message: 'Failed to get LeetCode assessment', error: error.message });
  }
};

/**
 * Get all LeetCode assessments for a user
 */
export const getUserLeetCodeAssessments = async (req, res) => {
  try {
    const { userId } = req.params;

    const assessments = await LeetCodeAssessment.find({ userId }).sort({ startedAt: -1 });
    
    res.status(200).json({ assessments });
  } catch (error) {
    console.error('Error getting user LeetCode assessments:', error);
    res.status(500).json({ message: 'Failed to get user LeetCode assessments', error: error.message });
  }
};

/**
 * Check if a specific problem is solved and update progress
 */
export const checkProblemStatus = async (req, res) => {
  try {
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
      console.log(`Checking if ${assessment.leetCodeUsername} has solved problem ${problem.title} (${problem.problemId}) [slug: ${problem.titleSlug}]`);
      // Always use titleSlug for the check, regardless of what is passed in the URL
      const isSolved = await leetcodeService.hasSolvedProblem(
        assessment.leetCodeUsername,
        problem.titleSlug
      );
      console.log(`[DEBUG] hasSolvedProblem result for user=${assessment.leetCodeUsername}, slug=${problem.titleSlug}:`, isSolved);
      // If your leetcodeService.hasSolvedProblem can log the raw API response, do so there as well.

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
