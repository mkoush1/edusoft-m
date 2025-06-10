import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import axios from "axios";
import { decodeJWT } from "../utils/jwt";
import api from "../services/api"; // Import the configured API client
import AssessmentService from '../services/assessment.service';

const ProgressPage = () => {
  const navigate = useNavigate();
  const [completedAssessments, setCompletedAssessments] = useState([]);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assessmentsByCategory, setAssessmentsByCategory] = useState({});
  const [showDebug, setShowDebug] = useState(false);
  
  // CEFR levels
  const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1'];

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        // Decode token to get user ID
        const decodedToken = decodeJWT(token);
        if (!decodedToken || !decodedToken.userId) {
          console.error("Invalid token or missing userId");
          navigate("/login");
          return;
        }

        const userId = decodedToken.userId;

        // Use the new progress endpoint
        const response = await api.get(`/progress/${userId}`);

        if (!response.data || !response.data.data) {
          throw new Error("Failed to fetch progress data");
        }

        const progressData = response.data.data;
        let completedData = progressData.completedAssessments || [];

        // Fetch the latest puzzle-game result
        let puzzleResult = null;
        try {
          const puzzleRes = await api.get(`/assessments/puzzle-game/user/me/results`);
          if (puzzleRes.data && puzzleRes.data.results && puzzleRes.data.results.length > 0) {
            const latest = puzzleRes.data.results[0];
            console.log('DEBUG: Puzzle Game API result:', latest);
            puzzleResult = {
              assessmentType: 'puzzle-game',
              percentage: latest.percentage,
              score: latest.score,
              completedAt: latest.completedAt || latest.createdAt
            };
            console.log('DEBUG: Puzzle Game score:', latest.score, 'percentage:', latest.percentage);
          }
        } catch (e) { /* ignore if fails */ }
        // Replace or add puzzle-game result in completedData
        if (puzzleResult) {
          completedData = completedData.filter(a => a.assessmentType !== 'puzzle-game');
          completedData.push(puzzleResult);
        }

        // Fetch speaking assessments from backend
        const speakingRes = await AssessmentService.getUserSpeakingAssessments(userId);
        let speakingList = [];
        if (speakingRes && speakingRes.success && Array.isArray(speakingRes.assessments)) {
          speakingList = speakingRes.assessments;
        }

        // Helper to extract supervisor rawScore from supervisorFeedback JSON
        const getSupervisorRawScore = (rawSpeaking) => {
          if (rawSpeaking && rawSpeaking.supervisorFeedback) {
            try {
              const parsed = typeof rawSpeaking.supervisorFeedback === 'string'
                ? JSON.parse(rawSpeaking.supervisorFeedback)
                : rawSpeaking.supervisorFeedback;
              if (parsed && typeof parsed.rawScore === 'number') {
                return parsed.rawScore;
              }
            } catch (e) {}
          }
          return undefined;
        };

        // Merge speaking scores into completedAssessments
        const merged = completedData.map(a => {
          if (/^Speaking [ABC][12]$/i.test(a.assessmentType)) {
            // Find matching speaking assessment by level
            const level = a.assessmentType.split(' ')[1].toLowerCase();
            const match = speakingList.find(s => s.level && s.level.toLowerCase() === level);
            if (match) {
              const supervisorRawScore = getSupervisorRawScore(match);
              return {
                ...a,
                score: typeof match.overallScore === 'number'
                  ? match.overallScore
                  : (typeof supervisorRawScore === 'number'
                      ? supervisorRawScore
                      : match.score),
                overallScore: match.overallScore,
                rawSpeaking: match // for debug
              };
            }
          }
          return a;
        });
        // Normalize: always have a 'percentage' field for all assessment types
        const normalized = merged.map(a => {
          let percent = 0;
          if (a.percentage !== undefined && a.percentage !== null) {
            percent = a.percentage;
          } else if (a.score !== undefined && a.score !== null) {
            percent = a.score;
          }
          return {
            ...a,
            percentage: percent
          };
        });
        setCompletedAssessments(normalized);
        // Debug log for assessment types
        console.log('DEBUG: completedAssessments', normalized.map(a => a.assessmentType));
        setTotalCompleted(progressData.totalCompleted || 0);
        setTotalAvailable(progressData.totalAvailable || 0);
        setProgress(progressData.progress || 0);
        
        // Group assessments by category
        const groupedAssessments = {};
        
        // Define main categories
        const mainCategories = [
          'Leadership',
          'Problem Solving',
          'Presentation',
          'Adaptability and Flexibility',
          'Communication'
        ];
        
        // Group assessments by main category
        mainCategories.forEach(category => {
          const categoryAssessments = completedData.filter(assessment => {
            const assessmentType = assessment.assessmentType.toLowerCase();
            return (
              assessmentType === category.toLowerCase() || 
              assessmentType.includes(category.toLowerCase())
            );
          });
          
          if (categoryAssessments.length > 0) {
            groupedAssessments[category] = categoryAssessments;
          }
        });
        
        // Special grouping for Communication subcategories (CEFR levels)
        const communicationTypes = ['Listening', 'Reading', 'Writing', 'Speaking'];
        
        communicationTypes.forEach(type => {
          const typeAssessments = completedData.filter(assessment => 
            assessment.assessmentType.startsWith(type)
          );
          
          if (typeAssessments.length > 0) {
            if (!groupedAssessments['Communication']) {
              groupedAssessments['Communication'] = [];
            }
            
            // Add type heading if it doesn't exist
            if (!groupedAssessments[type]) {
              groupedAssessments[type] = [];
            }
            
            groupedAssessments[type].push(...typeAssessments);
          }
        });
        
        // Special grouping for Problem Solving subcategories
        const problemSolvingTypes = ['Fast Questions Assessment', 'Puzzle Game Assessment', 'LeetCode Assessment'];
        problemSolvingTypes.forEach(type => {
          const typeAssessments = completedData.filter(assessment => 
            assessment.assessmentType === type
          );
          if (typeAssessments.length > 0) {
            if (!groupedAssessments['Problem Solving']) {
              groupedAssessments['Problem Solving'] = [];
            }
            groupedAssessments['Problem Solving'].push(...typeAssessments);
          }
        });
        
        setAssessmentsByCategory(groupedAssessments);
        
      } catch (error) {
        console.error("Error fetching progress:", error);
        setError("Failed to fetch progress data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [navigate]);

  // Helper to get the best available score for an assessment
  const getDisplayScore = (assessment) => {
    if (assessment.percentage !== undefined && assessment.percentage !== null) return Number(assessment.percentage);
    if (Number(assessment.overallScore) > 0) return Number(assessment.overallScore);
    if (assessment.parsedSupervisorFeedback?.rawScore > 0) return Number(assessment.parsedSupervisorFeedback.rawScore);
    if (assessment.score > 0) return Number(assessment.score);
    if (assessment.supervisorScore > 0) return Number(assessment.supervisorScore);
    return 0;
  };

  const calculateAverageScore = (assessments = completedAssessments) => {
    if (!assessments || assessments.length === 0) return 0;
    const totalScore = assessments.reduce(
      (sum, assessment) => sum + getDisplayScore(assessment),
      0
    );
    return Math.round(totalScore / assessments.length);
  };

  // Remove any duplicate declaration of speakingAssessments
  const speakingAssessments = completedAssessments.filter(
    a => a.assessmentType && a.assessmentType.startsWith('Speaking')
  );
  const speakingAverage = calculateAverageScore(speakingAssessments);

  const getCategoryProgress = (category) => {
    const assessments = assessmentsByCategory[category] || [];
    if (assessments.length === 0) return 0;
    
    // For communication skills, calculate based on completion of all CEFR levels
    if (category === 'Communication') {
      const communicationTypes = ['Listening', 'Reading', 'Writing', 'Speaking'];
      const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1'];
      
      let completedLevels = 0;
      let totalLevels = communicationTypes.length * cefrLevels.length;
      
      communicationTypes.forEach(type => {
        cefrLevels.forEach(level => {
          if (completedAssessments.some(a => a.assessmentType === `${type} ${level}`)) {
            completedLevels++;
          }
        });
      });
      
      return Math.round((completedLevels / totalLevels) * 100);
    }
    
    // For problem solving, calculate based on the three subcategories
    if (category === 'Problem Solving') {
      const subcategories = ['Fast Questions Assessment', 'Puzzle Game Assessment', 'LeetCode Assessment'];
      let completedCount = 0;
      
      subcategories.forEach(subcat => {
        if (completedAssessments.some(a => a.assessmentType.includes(subcat))) {
          completedCount++;
        }
      });
      
      return Math.round((completedCount / subcategories.length) * 100);
    }
    
    // For other categories, use completion status
    return 100; // If assessment exists in the category, it's completed
  };

  // Helper to calculate progress for a skill
  const getSkillProgress = (skill) => {
    const completedLevels = cefrLevels.filter(level =>
      completedAssessments.some(a => a.assessmentType === `${skill} ${level}`)
    );
    return Math.round((completedLevels.length / cefrLevels.length) * 100);
  };

  // Specific helpers for each skill
  const getSpeakingProgress = () => getSkillProgress('Speaking');
  const getListeningProgress = () => getSkillProgress('Listening');
  const getReadingProgress = () => getSkillProgress('Reading');
  const getWritingProgress = () => getSkillProgress('Writing');

  if (loading) {
    return (
      <DashboardLayout title="Progress Overview">
        <div className="flex items-center justify-center h-64">
          <div className="text-[#592538] text-xl">Loading progress...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Progress Overview">
        <div className="flex items-center justify-center h-64 flex-col space-y-4">
          <div className="text-red-500 text-xl">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#592538] text-white rounded-lg hover:bg-[#6d2c44] transition duration-300"
          >
            Try Again
          </button>
        </div>
      </DashboardLayout>
    );
  }
  
  // Prepare assessment categories to display
  const displayCategories = [
    { name: 'Leadership Skills', key: 'Leadership' },
    { name: 'Problem Solving Skills', key: 'Problem Solving' },
    { name: 'Presentation Skills', key: 'Presentation' },
    { name: 'Adaptability and Flexibility', key: 'Adaptability and Flexibility' },
    { name: 'Communication Skills', key: 'Communication' },
    { name: 'Listening Skills', key: 'Listening' },
    { name: 'Reading Skills', key: 'Reading' },
    { name: 'Writing Skills', key: 'Writing' },
    { name: 'Speaking Skills', key: 'Speaking' },
  ];

  return (
    <DashboardLayout title="Progress Overview">
      <div className="space-y-6 sm:space-y-8">
        {/* Progress Stats */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-[#592538]">{totalCompleted}</span>
              <span className="text-gray-600">Completed Tests</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-[#592538]">{totalAvailable}</span>
              <span className="text-gray-600">Available Tests</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-[#592538]">{Math.round(progress)}%</span>
              <span className="text-gray-600">Overall Progress</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-[#592538]">{calculateAverageScore()}%</span>
              <span className="text-gray-600">Average Score</span>
            </div>
          </div>
        </div>

        {/* Category Progress */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 lg:p-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#592538] mb-4 sm:mb-6">
            Assessment Categories
          </h2>
          <div className="space-y-4 sm:space-y-6">
            {displayCategories.map((category) => {
              const assessments = assessmentsByCategory[category.key] || [];
              const hasAssessments = assessments.length > 0;
              // Use custom progress for CEFR skills
              let categoryProgress = getCategoryProgress(category.key);
              if (category.key === 'Speaking') categoryProgress = getSpeakingProgress();
              if (category.key === 'Listening') categoryProgress = getListeningProgress();
              if (category.key === 'Reading') categoryProgress = getReadingProgress();
              if (category.key === 'Writing') categoryProgress = getWritingProgress();
              
              return (
                <div
                  key={category.key}
                  className={`border rounded-lg p-4 sm:p-6 hover:shadow-md transition duration-300 ${
                    !hasAssessments ? 'opacity-70' : ''
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                    <div>
                      <h3 className="text-lg sm:text-xl font-medium text-[#592538]">
                        {category.name}
                      </h3>
                      <p className="text-gray-600 text-sm sm:text-base">
                        {hasAssessments
                          ? `${assessments.length} assessment${assessments.length !== 1 ? 's' : ''} completed`
                          : 'No assessments completed'}
                      </p>
                    </div>
                    {hasAssessments && (
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 rounded-full text-sm sm:text-base bg-green-100 text-green-800">
                          Completed
                        </span>
                        <span className="text-lg sm:text-xl font-semibold text-[#592538]">
                          {category.key === 'Speaking'
                            ? `${speakingAverage}%`
                            : `${calculateAverageScore(assessments)}%`}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Progress</span>
                      <span className="text-sm font-medium text-[#592538]">{categoryProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-[#592538] h-2.5 rounded-full"
                        style={{ width: `${categoryProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Individual Assessment Progress */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 lg:p-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#592538] mb-4 sm:mb-6">
            Recent Assessments
          </h2>
          <div className="space-y-4 sm:space-y-6">
            {completedAssessments.length > 0 ? (
              (() => {
                // Normalize assessment type for deduplication
                const normalizeType = (type) => {
                  if (!type) return '';
                  const t = type.toLowerCase().replace(/\s+/g, '-');
                  if (t.includes('puzzle-game') || t.includes('puzzle')) return 'puzzle-game';
                  if (t.includes('fast-questions') || t.includes('fast')) return 'fast-questions';
                  if (t.includes('leetcode')) return 'leetcode';
                  return t;
                };
                const dedupedAssessments = [];
                const seenTypes = new Set();
                completedAssessments
                  .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
                  .forEach(assessment => {
                    const normType = normalizeType(assessment.assessmentType);
                    if (
                      normType === 'fast-questions'
                    ) {
                      dedupedAssessments.push(assessment);
                    } else if (!seenTypes.has(normType)) {
                      dedupedAssessments.push(assessment);
                      seenTypes.add(normType);
                    }
                  });
                return dedupedAssessments.slice(0, 5).map((assessment) => (
                  <div
                    key={assessment._id || assessment.assessmentType + assessment.completedAt}
                    className="border rounded-lg p-4 sm:p-6 hover:shadow-md transition duration-300"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                      <div>
                        <h3 className="text-lg sm:text-xl font-medium text-[#592538]">
                          {assessment.assessmentType}
                        </h3>
                        <p className="text-gray-600 text-sm sm:text-base">
                          {new Date(assessment.completedAt).toLocaleDateString()}
                          {assessment.language && ` - ${assessment.language.charAt(0).toUpperCase() + assessment.language.slice(1)}`}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 rounded-full text-sm sm:text-base bg-green-100 text-green-800">
                          Completed
                        </span>
                        <span className="text-lg sm:text-xl font-semibold text-[#592538]">
                          {getDisplayScore(assessment) !== null && getDisplayScore(assessment) !== undefined
                            ? `${Math.round(getDisplayScore(assessment))}%`
                            : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                ));
              })()
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No assessments completed yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProgressPage;