import "./App.css";
import React from "react";
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
import AssessmentQuiz_leadership from "./pages/AssessmentQuiz_leadership";
import LeadershipRecommendations from "./pages/LeadershipRecommendations";
import AboutUs from "./pages/AboutUs";
import Features from "./pages/Features";
import AssessmentsPage from "./pages/AssessmentsPage";
import ProgressPage from "./pages/ProgressPage";
import SettingsPage from "./pages/SettingsPage";
import ProblemSolvingAssessment from "./pages/ProblemSolvingAssessment";
import PuzzleGameAssessment from "./pages/PuzzleGameAssessment";
import PresentationAssessment from "./pages/PresentationAssessment";
import PresentationFetch from "./pages/PresentationFetch";
import PresentationRecommendations from "./pages/PresentationRecommendations";
import PresentationQuestions from "./pages/PresentationQuestions";
import PresentationQuestion from "./pages/PresentationQuestion";
import PresentationManagement from "./pages/PresentationManagement";
import Recommendations from "./pages/Recommendations";
import AdminDashboard from "./pages/AdminDashboard";
import AssessmentManagement from "./pages/AssessmentManagement";
import TestQuizPage from "./pages/TestQuizPage";
import LeadershipQuiz from "./pages/LeadershipQuiz";

const App = () => {
  return (
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
        <Route path="/dashboard" element={<UserDashboard />} />
        {/* Admin routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/assessments" element={<AssessmentManagement />} />
        <Route path="/admin/presentation-management" element={<PresentationManagement />} />
        
        {/* Assessment specific routes */}
        <Route path="/assessment/problem-solving" element={<ProblemSolvingAssessment />} />
        <Route path="/assessment/puzzle-game" element={<PuzzleGameAssessment />} />
        <Route path="/presentation-assessment" element={<PresentationAssessment />} />
        
        {/* Test route for debugging */}
        <Route path="/test-quiz/:category" element={<TestQuizPage />} />
        
        {/* Simple leadership quiz route */}
        <Route path="/leadership-quiz" element={<LeadershipQuiz />} />
        
        {/* Quiz routes - specific first */}
        <Route path="/assessment/quiz/leadership" element={<AssessmentQuiz_leadership />} />
        <Route path="/assessment/quiz/presentation" element={<AssessmentQuiz_leadership />} />
        <Route path="/assessment/quiz/problem-solving" element={<AssessmentQuiz_leadership />} />
        <Route path="/assessment/quiz/teamwork" element={<AssessmentQuiz_leadership />} />
        <Route path="/assessment/quiz/adaptability" element={<AssessmentQuiz_leadership />} />
        <Route path="/assessment/quiz/communication" element={<AssessmentQuiz_leadership />} />
        
        {/* Legacy routes */}
        <Route path="/assessment/leadership" element={<AssessmentQuiz_leadership />} />
        
        {/* Dynamic assessment routes */}
        <Route path="/assessment/category/:category" element={<AssessmentDetails />} />
        <Route path="/assessment/quiz/:category" element={<AssessmentQuiz_leadership />} />
        <Route
          path="/assessment/leadership/recommendations"
          element={<LeadershipRecommendations />}
        />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/features" element={<Features />} />
        <Route path="/assessments" element={<AssessmentsPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route
          path="/recommendations"
          element={<Recommendations />}
        />
        <Route path="/presentation-fetch" element={<PresentationFetch />} />
        <Route
          path="/presentation-recommendations"
          element={<PresentationRecommendations />}
        />
        <Route
          path="/presentation-questions"
          element={<PresentationQuestions />}
        />
        <Route
          path="/presentation-question/:questionNumber"
          element={<PresentationQuestion />}
        />
        {/* Catch-all route should be the very last route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
