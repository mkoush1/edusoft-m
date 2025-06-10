import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import axios from "axios";
import { decodeJWT } from "../utils/jwt";
import api from "../services/api";
import AssessmentService from '../services/assessment.service';
import { motion } from 'framer-motion';
import { FiAward, FiCheckCircle, FiBarChart2, FiTrendingUp, FiCalendar, FiChevronRight, FiStar, FiCheck, FiClock } from 'react-icons/fi';

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
        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-[#592538] to-[#8a3a5f] rounded-2xl shadow-xl p-6 sm:p-8 text-white overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Your Learning Journey</h1>
            <p className="text-white/80 mb-6 max-w-2xl">Track your progress and achievements across all assessments</p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <FiCheckCircle className="text-white text-xl" />
                  </div>
                  <span className="text-sm text-white/80">Completed</span>
                </div>
                <div className="text-2xl font-bold">{totalCompleted}</div>
                <div className="text-xs text-white/60">Assessments</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <FiBarChart2 className="text-white text-xl" />
                  </div>
                  <span className="text-sm text-white/80">Available</span>
                </div>
                <div className="text-2xl font-bold">{totalAvailable}</div>
                <div className="text-xs text-white/60">Assessments</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <FiTrendingUp className="text-white text-xl" />
                  </div>
                  <span className="text-sm text-white/80">Progress</span>
                </div>
                <div className="text-2xl font-bold">{Math.round(progress)}%</div>
                <div className="w-full bg-white/20 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-white h-1.5 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.round(progress)}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <FiAward className="text-white text-xl" />
                  </div>
                  <span className="text-sm text-white/80">Avg. Score</span>
                </div>
                <div className="text-2xl font-bold">{calculateAverageScore()}%</div>
                <div className="text-xs text-white/60">Across all assessments</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Category Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-6 sm:p-8"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#2d3748]">Skill Progress</h2>
              <p className="text-gray-500">Track your progress across different skill categories</p>
            </div>
            <button className="text-sm font-medium text-[#592538] hover:text-[#8a3a5f] transition-colors flex items-center">
              View all <FiChevronRight className="ml-1" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                <motion.div
                  key={category.key}
                  whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                  className={`bg-white rounded-xl border border-gray-100 p-5 hover:border-transparent transition-all duration-300 ${
                    !hasAssessments ? 'opacity-70' : 'shadow-sm hover:shadow-lg'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(89, 37, 56, 0.1)' }}>
                          {category.key === 'Leadership' && <FiAward className="text-[#592538] text-xl" />}
                          {category.key === 'Problem Solving' && <FiBarChart2 className="text-[#592538] text-xl" />}
                          {category.key === 'Presentation' && <FiTrendingUp className="text-[#592538] text-xl" />}
                          {category.key === 'Communication' && <FiAward className="text-[#592538] text-xl" />}
                          {category.key === 'Listening' && <FiCheck className="text-[#592538] text-xl" />}
                          {category.key === 'Reading' && <FiCheck className="text-[#592538] text-xl" />}
                          {category.key === 'Writing' && <FiCheck className="text-[#592538] text-xl" />}
                          {category.key === 'Speaking' && <FiCheck className="text-[#592538] text-xl" />}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {category.name}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 ml-11">
                        {hasAssessments
                          ? `${assessments.length} assessment${assessments.length !== 1 ? 's' : ''} completed`
                          : 'No assessments completed'}
                      </p>
                    </div>

                    {hasAssessments && (
                      <div className="flex flex-col items-end">
                        <div className="flex items-center space-x-2">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                            {category.key === 'Speaking' ? speakingAverage : calculateAverageScore(assessments)}%
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Avg. Score</div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-500">Progress</span>
                      <span className="text-xs font-semibold text-[#592538]">{categoryProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <motion.div
                        className="h-2 rounded-full bg-gradient-to-r from-[#8a3a5f] to-[#592538]"
                        initial={{ width: 0 }}
                        animate={{ width: `${categoryProgress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Assessments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-6 sm:p-8"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#2d3748]">Recent Assessments</h2>
              <p className="text-gray-500">Your most recent assessment attempts</p>
            </div>
            <button className="text-sm font-medium text-[#592538] hover:text-[#8a3a5f] transition-colors flex items-center">
              View all <FiChevronRight className="ml-1" />
            </button>
          </div>
          <div className="space-y-4">
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
                  <motion.div
                    key={assessment._id || assessment.assessmentType + assessment.completedAt}
                    whileHover={{ x: 5 }}
                    className="group bg-white border border-gray-100 rounded-xl p-5 hover:border-transparent hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex space-x-4">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-10 h-10 rounded-lg bg-[#f3e8f0] flex items-center justify-center">
                            <FiCheckCircle className="text-[#8a3a5f] text-xl" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-gray-900 group-hover:text-[#8a3a5f] transition-colors">
                            {assessment.assessmentType}
                          </h3>
                          <div className="flex items-center mt-1 space-x-3 text-sm text-gray-500">
                            <div className="flex items-center">
                              <FiCalendar className="mr-1.5" />
                              <span>{new Date(assessment.completedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}</span>
                            </div>
                            {assessment.language && (
                              <div className="flex items-center">
                                <span className="w-1 h-1 rounded-full bg-gray-400 mr-1.5"></span>
                                <span>{assessment.language.charAt(0).toUpperCase() + assessment.language.slice(1)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                            Completed
                          </span>
                        </div>
                        <div className="mt-1">
                          <span className="text-lg font-bold text-[#592538]">
                            {getDisplayScore(assessment) !== null && getDisplayScore(assessment) !== undefined
                              ? `${Math.round(getDisplayScore(assessment))}%`
                              : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ));
              })()
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FiClock className="text-gray-400 text-2xl" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No assessments yet</h3>
                <p className="text-gray-500 max-w-md mx-auto">You haven't completed any assessments yet. Start your learning journey now!</p>
                <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#592538] hover:bg-[#8a3a5f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8a3a5f] transition-colors">
                  Take an assessment
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ProgressPage;