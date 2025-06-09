import mongoose from 'mongoose';

// Get user's comprehensive progress data
export const getUserProgress = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get User model dynamically
    const User = mongoose.model('User');
    
    // Verify the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize results object
    const results = {
      totalCompleted: 0,
      totalAvailable: 29, // 1 Presentation + 1 Leadership + 1 Adaptability + 3 Problem Solving + 20 Communication (4 skills x 5 levels)
      completedAssessments: [],
      progress: 0
    };

    // 1. Fetch Presentation Skills data from presentationsubmissions collection
    try {
      const PresentationSubmission = mongoose.model('PresentationSubmission');
      const presentationSubmissions = await PresentationSubmission.find({ 
        userId: new mongoose.Types.ObjectId(userId) 
      }).sort({ updatedAt: -1 });
      
      if (presentationSubmissions.length > 0) {
        results.completedAssessments.push({
          assessmentType: 'Presentation',
          score: (presentationSubmissions[0].score || 0) * 10,
          completedAt: presentationSubmissions[0].reviewedAt || presentationSubmissions[0].updatedAt,
          status: presentationSubmissions[0].status
        });
        
        if (presentationSubmissions[0].status === 'submitted' && presentationSubmissions[0].reviewedAt) {
          results.totalCompleted++;
        }
      }
    } catch (error) {
      console.error('Error fetching presentation submissions:', error);
      // Continue with other assessments
    }

    // 2. Fetch Leadership Skills data from assessmentresults collection
    try {
      const AssessmentResult = mongoose.model('AssessmentResult');
      const leadershipResults = await AssessmentResult.find({ 
        userId: new mongoose.Types.ObjectId(userId),
        assessmentType: 'leadership'
      }).sort({ completedAt: -1 });
      
      if (leadershipResults.length > 0) {
        results.completedAssessments.push({
          assessmentType: 'Leadership',
          score: leadershipResults[0].percentage || 0,
          completedAt: leadershipResults[0].completedAt,
          totalScore: leadershipResults[0].totalScore,
          maxTotalScore: leadershipResults[0].maxTotalScore
        });
        results.totalCompleted++;
      }
    } catch (error) {
      console.error('Error fetching leadership results:', error);
      // Continue with other assessments
    }

    // 3. Fetch Problem Solving Skills data
    try {
      // 3.1 Fast Questions and Puzzle Game from problemsolvingassessments
      const ProblemSolvingAssessment = mongoose.model('ProblemSolvingAssessment');
      const problemSolvingAssessments = await ProblemSolvingAssessment.find({
        userId: new mongoose.Types.ObjectId(userId),
        status: 'completed'
      }).sort({ completedAt: -1 });
      
      // Track if we've found any problem solving assessments
      let fastQuestionsFound = false;
      let puzzleGameFound = false;
      let puzzleGameScore = 0;
      let puzzleGameCompletedAt = null;
      
      for (const assessment of problemSolvingAssessments) {
        if (assessment.assessmentType === 'puzzle-game' && !puzzleGameFound) {
          puzzleGameScore = assessment.percentage || assessment.score || 0;
          puzzleGameCompletedAt = assessment.completedAt;
          results.completedAssessments.push({
            assessmentType: 'Puzzle Game Assessment',
            score: puzzleGameScore,
            completedAt: puzzleGameCompletedAt,
            overallScore: assessment.overallScore,
            maxOverallScore: assessment.maxOverallScore
          });
          results.totalCompleted++;
          puzzleGameFound = true;
        } else if (assessment.assessmentType === 'fast-questions' && !fastQuestionsFound) {
          results.completedAssessments.push({
            assessmentType: 'Fast Questions Assessment',
            score: assessment.percentage || 0,
            completedAt: assessment.completedAt,
            overallScore: assessment.overallScore,
            maxOverallScore: assessment.maxOverallScore
          });
          results.totalCompleted++;
          fastQuestionsFound = true;
        }
        
        // If we found both types, break the loop
        if (fastQuestionsFound && puzzleGameFound) break;
      }

      // If the found score is 0, check AssessmentResult for a non-zero score
      if (puzzleGameFound && puzzleGameScore === 0) {
        const AssessmentResult = mongoose.model('AssessmentResult');
        const puzzleResults = await AssessmentResult.find({
          userId: new mongoose.Types.ObjectId(userId),
          assessmentType: 'puzzle-game'
        }).sort({ completedAt: -1 });
        if (puzzleResults.length > 0) {
          const arScore = puzzleResults[0].percentage || puzzleResults[0].score || 0;
          if (arScore > 0) {
            // Replace the previous entry with the correct score
            results.completedAssessments = results.completedAssessments.filter(a => a.assessmentType !== 'Puzzle Game Assessment');
            results.completedAssessments.push({
              assessmentType: 'Puzzle Game Assessment',
              score: arScore,
              completedAt: puzzleResults[0].completedAt
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching problem solving assessments:', error);
      // Continue with other assessments
    }
    
    try {
      // 3.2 LeetCode from leetcodeassessments
      const LeetCodeAssessment = mongoose.models.LeetCodeAssessment;
      if (LeetCodeAssessment) {
        const leetCodeAssessments = await LeetCodeAssessment.find({
          userId: new mongoose.Types.ObjectId(userId),
          status: 'completed'
        }).sort({ completedAt: -1 });
        
        if (leetCodeAssessments.length > 0) {
          results.completedAssessments.push({
            assessmentType: 'LeetCode Assessment',
            score: leetCodeAssessments[0].score || 0,
            completedAt: leetCodeAssessments[0].completedAt,
            leetCodeUsername: leetCodeAssessments[0].leetCodeUsername
          });
          results.totalCompleted++;
        }
      }
    } catch (error) {
      console.error('Error fetching LeetCode assessments:', error);
      // Continue with other assessments
    }

    try {
      // 4. Fetch Adaptability & Flexibility Assessment data
      // Use mongoose.models to get the existing model instance
      const AssessmentResult = mongoose.models.AssessmentResult || mongoose.model('AssessmentResult');
      const adaptabilityAssessments = await AssessmentResult.find({
        userId: new mongoose.Types.ObjectId(userId),
        assessmentType: 'adaptability'
      }).sort({ completedAt: -1 });
      
      if (adaptabilityAssessments.length > 0) {
        results.completedAssessments.push({
          assessmentType: 'Adaptability and Flexibility',
          score: adaptabilityAssessments[0].percentage || 0,
          completedAt: adaptabilityAssessments[0].completedAt,
          totalScore: adaptabilityAssessments[0].totalScore,
          maxTotalScore: adaptabilityAssessments[0].maxTotalScore
        });
        results.totalCompleted++;
      }
    } catch (error) {
      console.error('Error fetching adaptability assessments:', error);
      // Continue with other assessments
    }

    // 5. Fetch Communication Skills data
    // 5.1 Listening Assessments
    const cefrLevels = ['a1', 'a2', 'b1', 'b2', 'c1'];
    
    for (const level of cefrLevels) {
      try {
        const ListeningAssessment = mongoose.models.ListeningAssessment;
        if (ListeningAssessment) {
          const listeningAssessments = await ListeningAssessment.find({
            userId: new mongoose.Types.ObjectId(userId),
            level
          }).sort({ completedAt: -1 });
          
          if (listeningAssessments.length > 0) {
            results.completedAssessments.push({
              assessmentType: `Listening ${level.toUpperCase()}`,
              score: listeningAssessments[0].score || 0,
              completedAt: listeningAssessments[0].completedAt,
              level: level.toUpperCase(),
              language: listeningAssessments[0].language
            });
            results.totalCompleted++;
          }
        }
      } catch (error) {
        console.error(`Error fetching listening assessments for level ${level}:`, error);
        // Continue with other assessments
      }
      
      try {
        // 5.2 Reading Assessments
        const ReadingAssessment = mongoose.models.ReadingAssessment;
        if (ReadingAssessment) {
          const readingAssessments = await ReadingAssessment.find({
            user: new mongoose.Types.ObjectId(userId),
            level
          }).sort({ completedAt: -1 });
          
          if (readingAssessments.length > 0) {
            results.completedAssessments.push({
              assessmentType: `Reading ${level.toUpperCase()}`,
              score: readingAssessments[0].score || 0,
              completedAt: readingAssessments[0].completedAt,
              level: level.toUpperCase(),
              language: readingAssessments[0].language
            });
            results.totalCompleted++;
          }
        }
      } catch (error) {
        console.error(`Error fetching reading assessments for level ${level}:`, error);
        // Continue with other assessments
      }
      
      try {
        // 5.3 Speaking Assessments
        const SpeakingAssessment = mongoose.models.SpeakingAssessment;
        if (SpeakingAssessment) {
          // Only fetch evaluated assessments for this user and level
          const speakingAssessments = await SpeakingAssessment.find({
            userId: new mongoose.Types.ObjectId(userId),
            level,
            status: 'evaluated'
          }).sort({ evaluatedAt: -1, completedAt: -1, createdAt: -1 });
          
          if (speakingAssessments.length > 0) {
            results.completedAssessments.push({
              assessmentType: `Speaking ${level.toUpperCase()}`,
              score: speakingAssessments[0].overallScore || 0,
              completedAt: speakingAssessments[0].evaluatedAt || speakingAssessments[0].completedAt || speakingAssessments[0].createdAt,
              level: level.toUpperCase(),
              language: speakingAssessments[0].language,
              id: speakingAssessments[0]._id
            });
            results.totalCompleted++;
          }
        }
      } catch (error) {
        console.error(`Error fetching speaking assessments for level ${level}:`, error);
        // Continue with other assessments
      }
      
      try {
        // 5.4 Writing Assessments
        const WritingAssessment = mongoose.models.WritingAssessment;
        if (WritingAssessment) {
          const writingAssessments = await WritingAssessment.find({
            userId: new mongoose.Types.ObjectId(userId),
            level
          }).sort({ completedAt: -1 });
          
          if (writingAssessments.length > 0) {
            results.completedAssessments.push({
              assessmentType: `Writing ${level.toUpperCase()}`,
              score: writingAssessments[0].score || 0,
              completedAt: writingAssessments[0].completedAt,
              level: level.toUpperCase(),
              language: writingAssessments[0].language
            });
            results.totalCompleted++;
          }
        }
      } catch (error) {
        console.error(`Error fetching writing assessments for level ${level}:`, error);
        // Continue with other assessments
      }
    }

    // Calculate overall progress
    results.progress = (results.totalCompleted / results.totalAvailable) * 100;

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching user progress', 
      error: error.message 
    });
  }
};