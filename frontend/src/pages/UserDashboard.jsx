import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import AssessmentCard from "../components/AssessmentCard";
import api from "../services/api";
import { decodeJWT } from "../utils/jwt";
import AssessmentService from '../services/assessment.service';
// import '../styles/Dashboard.css';

const SidebarItem = ({ icon, text, active = false }) => (
  <div className={`sidebar-item ${active ? "active" : ""}`}>
    <span className="sidebar-icon">{icon}</span>
    <span className="sidebar-text">{text}</span>
  </div>
);

const StatCard = ({ icon, value, label }) => (
  <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition duration-300">
    <div className="flex items-center space-x-4">
      <span className="text-3xl">{icon}</span>
      <div>
        <p className="text-2xl font-bold text-[#592538]">{value}</p>
        <p className="text-gray-600">{label}</p>
      </div>
    </div>
  </div>
);

const UserDashboard = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState([
    { icon: "📊", value: "0", label: "Completed Tests" },
    { icon: "📝", value: "0", label: "Available Tests" },
    { icon: "🎯", value: "0%", label: "Overall Progress" },
    { icon: "📈", value: "0%", label: "Average Score" },
  ]);
  const [completedAssessments, setCompletedAssessments] = useState([]);
  const [speakingAssessments, setSpeakingAssessments] = useState([]);

  // Calculate average score
  const calculateAverageScore = (assessments = completedAssessments) => {
    if (!assessments || assessments.length === 0) return 0;
    const totalScore = assessments.reduce(
      (sum, assessment) => sum + (assessment.score || 0),
      0
    );
    return Math.round(totalScore / assessments.length);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
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
      console.log("Fetching dashboard data...");
      console.log("User ID from token:", userId);

      // Fetch available assessments
      const assessmentsResponse = await api.get("/assessments");
      console.log("Assessments response:", assessmentsResponse.data);

      // Fetch user's progress data using the new endpoint
      const progressResponse = await api.get(`/progress/${userId}`);
      console.log("Progress response:", progressResponse.data);

      const progressData = progressResponse.data?.data || {};
      const completedData = progressData.completedAssessments || [];
      // Fetch speaking assessments from backend
      const speakingRes = await AssessmentService.getUserSpeakingAssessments(userId);
      let speakingList = [];
      if (speakingRes && speakingRes.success && Array.isArray(speakingRes.assessments)) {
        speakingList = speakingRes.assessments;
      }
      setSpeakingAssessments(speakingList);
      // Merge speaking scores into completedAssessments
      const merged = completedData.map(a => {
        if (/^Speaking [ABC][12]$/i.test(a.assessmentType)) {
          // Find matching speaking assessment by level
          const level = a.assessmentType.split(' ')[1].toLowerCase();
          const match = speakingList.find(s => s.level && s.level.toLowerCase() === level);
          if (match && typeof match.score === 'number') {
            return { ...a, score: match.score };
          }
        }
        return a;
      });
      
      // Group completed assessments by category
      const assessmentsByCategory = {};
      
      // Group core assessments
      const coreCategories = ['Leadership', 'Problem Solving', 'Presentation', 'Adaptability and Flexibility', 'Communication'];
      
      coreCategories.forEach(category => {
        const categoryAssessments = merged.filter(assessment => {
          const assessmentType = assessment.assessmentType.toLowerCase();
          return (
            assessmentType === category.toLowerCase() || 
            assessmentType.includes(category.toLowerCase())
          );
        }) || [];
        
        if (categoryAssessments.length > 0) {
          assessmentsByCategory[category] = categoryAssessments;
        }
      });
      
      // Process Problem Solving subcategories
      const problemSolvingSubcategories = ['Fast Questions Assessment', 'Puzzle Game Assessment', 'LeetCode Assessment'];
      
      problemSolvingSubcategories.forEach(subcat => {
        const subcatAssessments = merged.filter(
          a => a.assessmentType.includes(subcat)
        ) || [];
        
        if (subcatAssessments.length > 0) {
          if (!assessmentsByCategory['Problem Solving']) {
            assessmentsByCategory['Problem Solving'] = [];
          }
          assessmentsByCategory['Problem Solving'].push(...subcatAssessments);
        }
      });
      
      // Process Communication subcategories (CEFR)
      const communicationTypes = ['Listening', 'Reading', 'Writing', 'Speaking'];
      const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1'];
      
      communicationTypes.forEach(type => {
        const typeAssessments = [];
        
        cefrLevels.forEach(level => {
          const assessmentsOfTypeAndLevel = merged.filter(
            a => a.assessmentType === `${type} ${level}`
          ) || [];
          
          typeAssessments.push(...assessmentsOfTypeAndLevel);
        });
        
        if (typeAssessments.length > 0) {
          if (!assessmentsByCategory['Communication']) {
            assessmentsByCategory['Communication'] = [];
          }
          assessmentsByCategory['Communication'].push(...typeAssessments);
        }
      });
      
      console.log('Assessments by category:', assessmentsByCategory);
      
      // Update stats with the actual data from the progress endpoint
      const newStats = [...stats];
      newStats[0].value = progressData.totalCompleted.toString(); // Completed Tests
      newStats[1].value = progressData.totalAvailable.toString(); // Available Tests
      newStats[2].value = `${Math.round(progressData.progress)}%`; // Progress
      newStats[3].value = `${calculateAverageScore(merged)}%`; // Average Score
      newStats[3].label = 'Average Score';
      newStats[3].icon = '📈';
      setStats(newStats);
      
      // Set assessments and completed assessments
      setAssessments(assessmentsResponse.data || []);
      setCompletedAssessments(merged);
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Add event listener for storage changes
    const handleStorageChange = (e) => {
      if (e.key === "assessmentStatus") {
        fetchDashboardData(); // Refresh dashboard data when assessment status changes
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Cleanup
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [navigate]);

  useEffect(() => {
    // Update stats when completedAssessments changes
    setStats(prevStats => {
      const newStats = [...prevStats];
      newStats[3].value = `${calculateAverageScore(completedAssessments)}%`;
      return newStats;
    });
  }, [completedAssessments]);

  // Handler for viewing results
  const handleViewResults = (assessment) => {
    navigate(`/assessment/${assessment.category || assessment.assessmentType}/recommendations`);
  };

  const handleRetry = () => {
    fetchDashboardData();
  };

  if (loading) {
    return (
      <DashboardLayout title="Dashboard Overview">
        <div className="flex justify-center items-center h-64">
          <div className="text-[#592538] text-xl">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Dashboard Overview">
        <div className="flex flex-col items-center justify-center h-64 bg-white p-8 rounded-xl shadow-md">
          <div className="text-[#592538] text-xl mb-4">{error}</div>
          <button
            onClick={handleRetry}
            className="px-6 py-3 bg-[#592538] text-white rounded-lg hover:bg-[#6d2c44] transition duration-300"
          >
            Try Again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard Overview">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Assessments Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-[#592538] mb-6">
          Your Assessments
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.length > 0 ? (
            assessments.map((assessment) => (
              <AssessmentCard
                key={assessment._id || assessment.assessmentType}
                assessment={assessment}
                onViewResults={handleViewResults}
              />
            ))
          ) : (
            <div className="col-span-3 text-center py-8 text-gray-500">
              No assessments available at the moment.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
