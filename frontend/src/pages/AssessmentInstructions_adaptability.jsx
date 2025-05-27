import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AssessmentInstructionsAdaptability = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStartAssessment = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to start the assessment");
        setLoading(false);
        return;
      }
      const response = await axios.post(
        "http://localhost:5000/api/assessments/start/adaptability",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data && response.data.questions) {
        navigate("/assessment/quiz/adaptability", { state: { questions: response.data.questions } });
      } else {
        setError("Failed to start assessment. Please try again later.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to start assessment. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F8] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg max-w-3xl w-full p-8">
        {/* Header */}
        <div className="bg-[#592538] rounded-t-2xl px-8 py-8 flex flex-col items-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Adaptability and Flexibility Assessment</h1>
        </div>
        <div className="flex flex-wrap justify-between gap-4 mb-8">
          <div className="flex-1 min-w-[120px] bg-gray-50 rounded-xl p-4 flex flex-col items-center">
            <span className="text-sm text-gray-500 mb-1">Category</span>
            <span className="font-semibold text-[#592538]">Adaptability</span>
          </div>
          <div className="flex-1 min-w-[120px] bg-gray-50 rounded-xl p-4 flex flex-col items-center">
            <span className="text-sm text-gray-500 mb-1">Duration</span>
            <span className="font-semibold text-[#592538]">45 minutes</span>
          </div>
          <div className="flex-1 min-w-[120px] bg-gray-50 rounded-xl p-4 flex flex-col items-center">
            <span className="text-sm text-gray-500 mb-1">Questions</span>
            <span className="font-semibold text-[#592538]">40</span>
          </div>
        </div>
        {/* About */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[#592538] mb-2">About this Assessment</h2>
          <p className="text-gray-700">
            Test your ability to adapt to changing situations and maintain effectiveness. This assessment evaluates how well you handle unexpected changes, learn new methods, and adjust your approach in various scenarios. Discover your adaptability quotient.
          </p>
        </div>
        {/* Instructions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[#592538] mb-2">Instructions</h2>
          <div className="bg-gray-50 rounded-xl p-6">
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Read each question carefully before answering</li>
              <li>You have 45 minutes to complete the assessment</li>
              <li>You cannot pause the assessment once started</li>
              <li>Ensure you have a stable internet connection</li>
              <li>Answer all questions to get your detailed results</li>
            </ul>
          </div>
        </div>
        {/* Buttons */}
        {error && (
          <div className="mb-4 text-red-600 text-center">{error}</div>
        )}
        <div className="flex justify-between gap-4 mt-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex-1 px-4 py-2 bg-gray-100 text-[#592538] rounded-lg hover:bg-gray-200 transition duration-300"
            disabled={loading}
          >
            Back to Dashboard
          </button>
          <button
            onClick={handleStartAssessment}
            className="flex-1 px-4 py-2 bg-[#592538] text-white rounded-lg hover:bg-[#6d2c44] transition duration-300"
            disabled={loading}
          >
            {loading ? "Starting..." : "Start Assessment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentInstructionsAdaptability; 