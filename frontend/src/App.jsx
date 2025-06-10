import "./App.css";
import React, { useState, useEffect } from "react";
import { UserContext } from "./components/DashboardLayout";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import UserDashboard from "./pages/UserDashboard";
import PrivateRoute from "./pages/PrivateRoute";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AssessmentDetails from "./pages/AssessmentDetails";
import AssessmentQuiz from "./pages/AssessmentQuiz_leadership";
import LeadershipRecommendations from "./pages/LeadershipRecommendations";
import AboutUs from "./pages/AboutUs";
import Features from "./pages/Features";
import AssessmentsPage from "./pages/AssessmentsPage";
import ProgressPage from "./pages/ProgressPage";
import SettingsPage from "./pages/SettingsPage";
import ProblemSolvingAssessment from "./pages/ProblemSolvingAssessment";
import PuzzleGameAssessment from "./pages/PuzzleGameAssessment";
import AdminDashboard from "./pages/AdminDashboard";
import AssessmentManagement from "./pages/AssessmentManagement";
import PresentationManagement from "./pages/PresentationManagement";
import ConfirmEmail from "./pages/ConfirmEmail";
import PresentationAssessment from "./pages/PresentationAssessment";
import PresentationRecommendations from "./pages/PresentationRecommendations";
import PresentationFetch from "./pages/PresentationFetch";
import PresentationQuestions from "./pages/PresentationQuestions";
import PresentationAssessmentNew from "./pages/PresentationAssessmentNew";
import AssessmentInstructionsLeadership from "./pages/AssessmentInstructions_leadership";
import AssessmentInstructionsFast from "./pages/AssessmentInstructions_fast";
import AssessmentQuizFast from "./pages/AssessmentQuiz_fast";
import PuzzleInstructions from "./components/PuzzleInstructions";
import AssessmentInstructionsAdaptability from "./pages/AssessmentInstructions_adaptability";
import AssessmentQuizAdaptability from "./pages/AssessmentQuiz_adaptability";
import Recommendations from "./pages/Recommendations";

import LeetCodeAssessment from "./pages/LeetCodeAssessment";

import CommunicationAssessment from "./pages/CommunicationAssessment";
import LanguageAssessment from "./pages/LanguageAssessment";
import SpeakingAssessmentReview from "./components/supervisor/SpeakingAssessmentReview";


import AdminUsers from "./pages/AdminUsers";
import AdminSupervisors from './pages/AdminSupervisors';
import AssessmentResultsFast from './pages/AssessmentResults_fast';
import AssessmentResultsAdaptability from './pages/AssessmentResults_adaptability';


const App = () => {
  const [user, setUser] = useState(() => {
    const savedData = localStorage.getItem("userData");
    return savedData ? JSON.parse(savedData) : {};
  });

  // Update local storage when user data changes
  useEffect(() => {
    if (user && Object.keys(user).length > 0) {
      localStorage.setItem("userData", JSON.stringify(user));
    }
  }, [user]);

  const updateUser = (newUserData) => {
    setUser(prev => ({
      ...prev,
      ...newUserData
    }));
  };

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/supervisor-dashboard" element={<SupervisorDashboard />} />
        <Route path="/supervisor/speaking-review" element={<SpeakingAssessmentReview />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        {/* Admin routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/assessments" element={<AssessmentManagement />} />
        <Route path="/admin/presentation-management" element={<PresentationManagement />} />
        <Route path="/presentation-management" element={<PresentationManagement />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/supervisors" element={<AdminSupervisors />} />
        
        {/* Assessment specific routes */}
        <Route path="/assessment/problem-solving" element={<ProblemSolvingAssessment />} />
        <Route path="/assessment/puzzle-game" element={<PuzzleGameAssessment />} />
        <Route path="/assessment/puzzle-game/instructions" element={<PuzzleInstructions />} />
        <Route path="/assessment/puzzle-game/start" element={<PuzzleGameAssessment />} />
        <Route
          path="/assessment/quiz/leadership"
          element={<AssessmentQuiz />}
        />
        <Route path="/assessment/leadership" element={<AssessmentQuiz />} />
        <Route
          path="/assessment/leadership/recommendations"
          element={<LeadershipRecommendations />}
        />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/features" element={<Features />} />
        <Route path="/assessments" element={<AssessmentsPage />} />
        <Route path="/communication-assessment" element={<CommunicationAssessment />} />
        <Route path="/language-assessment" element={<LanguageAssessment />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/confirm-email/:token" element={<ConfirmEmail />} />
        <Route path="/presentation-assessment" element={<PresentationAssessmentNew />} />
        <Route path="/presentation-recommendations" element={<PresentationRecommendations />} />
        <Route path="/presentation-fetch" element={<PresentationFetch />} />
        <Route path="/presentation-questions" element={<PresentationQuestions />} />
        <Route path="/assessment/instructions/leadership" element={<AssessmentInstructionsLeadership />} />
        <Route path="/assessment/instructions/fast-questions" element={<AssessmentInstructionsFast />} />
        <Route path="/assessment/quiz/fast-questions" element={<AssessmentQuizFast />} />
        <Route path="/assessment/instructions/adaptability" element={<AssessmentInstructionsAdaptability />} />
        <Route path="/assessment/quiz/adaptability" element={<AssessmentQuizAdaptability />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/assessment/leetcode" element={<LeetCodeAssessment />} />
        <Route path="/assessment/results/fast-questions" element={<AssessmentResultsFast />} />
        <Route path="/assessment/results/adaptability" element={<AssessmentResultsAdaptability />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Router>
    </UserContext.Provider>
  );
};

export default App;
