import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import AssessmentCard from "../components/AssessmentCard";
import axios from "axios";
import { decodeJWT } from "../utils/jwt";
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
    { icon: "⏱️", value: "0", label: "Time Spent" },
  ]);
  const [completedAssessments, setCompletedAssessments] = useState([]);

  const fetchDashboardData = async () => {
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
      console.log("Fetching dashboard data...");
      console.log("User ID from token:", userId);
      console.log("Token:", token);

      // Fetch available assessments
      const assessmentsResponse = await axios.get(
        "http://localhost:5000/api/assessments",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Assessments response:", assessmentsResponse.data);

      // Fetch user's assessment status
      const statusResponse = await axios.get(
        `http://localhost:5000/api/assessments/status/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Status response:", statusResponse.data);

      const status = statusResponse.data.data;

      // Update stats
      const newStats = [...stats];
      newStats[0].value = status.totalCompleted.toString(); // Completed Tests
      newStats[1].value = status.totalAvailable.toString(); // Available Tests
      newStats[2].value = `${Math.round(status.progress)}%`; // Progress
      setStats(newStats);

      // Save completed assessments
      setCompletedAssessments(status.completedAssessments || []);

      // Merge available and completed assessments for display
      // Instead of showing completed first, keep the original order from the backend
      const completedMap = Object.fromEntries(
        (status.completedAssessments || []).map(a => [a.assessmentType, a])
      );
      const mergedAssessments = assessmentsResponse.data.map((assessment) => {
        const completed = completedMap[assessment.category];
        return completed
          ? { ...assessment, ...completed, completed: true }
          : { ...assessment, completed: false };
      });
      setAssessments(mergedAssessments);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      console.error("Error response:", error.response);
      setError("Failed to load dashboard data");
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

  // Handler for viewing results
  const handleViewResults = (assessment) => {
    navigate(`/assessment/${assessment.category || assessment.assessmentType}/recommendations`);
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
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500 text-xl">{error}</div>
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
          {assessments.map((assessment) => (
            <AssessmentCard
              key={assessment._id || assessment.assessmentType}
              assessment={assessment}
              onViewResults={handleViewResults}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
