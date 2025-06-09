import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { decodeJWT } from '../utils/jwt';
import api from '../services/api';

const AssessmentInstructionsAdaptability = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [canTake, setCanTake] = useState(false);
  const [cooldownMsg, setCooldownMsg] = useState("");

  useEffect(() => {
    const checkEligibility = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const decoded = decodeJWT(token);
        const userId = decoded?.userId;
        if (!userId) return;
        const res = await api.get(`/assessments/status/${userId}`);
        const completed = res.data?.data?.assessments?.find(a => a.category?.toLowerCase() === 'adaptability');
        if (completed && completed.completedAt) {
          const completedAt = new Date(completed.completedAt);
          const now = new Date();
          const diff = (now - completedAt) / (1000 * 60 * 60 * 24);
          if (diff >= 7) {
            setCanTake(true);
            setCooldownMsg("");
          } else {
            setCanTake(false);
            const nextRetake = new Date(completedAt);
            nextRetake.setDate(completedAt.getDate() + 7);
            const daysLeft = Math.ceil((nextRetake - now) / (1000 * 60 * 60 * 24));
            setCooldownMsg(`You can retake this assessment in ${daysLeft} day${daysLeft !== 1 ? 's' : ''} (on ${nextRetake.toLocaleDateString()})`);
          }
        } else {
          setCanTake(true);
          setCooldownMsg("");
        }
      } catch (err) {
        setCanTake(false);
        setCooldownMsg("");
      }
    };
    checkEligibility();
  }, []);

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
      if (err.response?.status === 403) {
        // Already completed, go to results page
        navigate("/assessment/results/adaptability");
      } else {
        setError(
          err.response?.data?.message || "Failed to start assessment. Please try again."
        );
      }
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
        {/* Action Buttons & Cooldown/Result Logic */}
        {error && (
          <div className="mb-4 text-red-600 text-center">{error}</div>
        )}
        {cooldownMsg && !canTake && (
          <div className="mb-4 text-yellow-700 bg-yellow-100 rounded-lg px-4 py-2 text-center">
            {cooldownMsg}
          </div>
        )}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex-1 px-6 py-3 bg-gray-100 text-[#592538] rounded-lg hover:bg-gray-200 transition duration-300"
            disabled={loading}
          >
            Back to Dashboard
          </button>
          {canTake ? (
            <button
              onClick={handleStartAssessment}
              className="flex-1 px-6 py-3 bg-[#592538] text-white rounded-lg hover:bg-[#6d2c44] transition duration-300"
              disabled={loading}
            >
              {loading ? "Starting..." : "Start Assessment"}
            </button>
          ) : (
            <button
              onClick={() => navigate("/assessment/results/adaptability")}
              className="flex-1 px-6 py-3 bg-[#592538] text-white rounded-lg hover:bg-[#6d2c44] transition duration-300"
            >
              View Result
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentInstructionsAdaptability; 