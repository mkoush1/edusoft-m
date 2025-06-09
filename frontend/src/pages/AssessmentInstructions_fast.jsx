import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AssessmentInstructionsFast = () => {
  const navigate = useNavigate();
  const [canStart, setCanStart] = useState(false);
  const [retakeMessage, setRetakeMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkEligibility = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Not logged in");
        // Try to start the assessment, but catch 403 for cooldown
        await axios.post("http://localhost:5000/api/assessments/start/fast-questions", {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCanStart(true);
        setRetakeMessage("");
      } catch (err) {
        if (err.response && err.response.status === 403) {
          setCanStart(false);
          setRetakeMessage(err.response.data.message || "You cannot retake this assessment yet.");
        } else {
          setCanStart(false);
          setRetakeMessage("Unable to check assessment eligibility.");
        }
      } finally {
        setLoading(false);
      }
    };
    checkEligibility();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF8F8]">
        <div className="text-[#592538] text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F8] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg max-w-3xl w-full p-8">
        {/* Header */}
        <div className="bg-[#592538] rounded-t-2xl px-8 py-8 flex flex-col items-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Fast Questions Assessment</h1>
        </div>
        <div className="flex flex-wrap justify-between gap-4 mb-8">
          <div className="flex-1 min-w-[120px] bg-gray-50 rounded-xl p-4 flex flex-col items-center">
            <span className="text-sm text-gray-500 mb-1">Category</span>
            <span className="font-semibold text-[#592538]">Problem Solving</span>
          </div>
          <div className="flex-1 min-w-[120px] bg-gray-50 rounded-xl p-4 flex flex-col items-center">
            <span className="text-sm text-gray-500 mb-1">Duration</span>
            <span className="font-semibold text-[#592538]">50 minutes</span>
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
            Test your ability to solve problems quickly and accurately under time pressure. This assessment evaluates your analytical thinking, logical reasoning, and decision-making speed. Challenge yourself to answer as many questions as you can within the time limit!
          </p>
        </div>
        {/* Instructions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[#592538] mb-2">Instructions</h2>
          <div className="bg-[#592538]/5 rounded-lg p-6">
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-[#592538] mr-3">•</span>
                <span className="text-gray-600">Read each question carefully before answering</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#592538] mr-3">•</span>
                <span className="text-gray-600">You have 50 minutes to complete the assessment</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#592538] mr-3">•</span>
                <span className="text-gray-600">You cannot pause the assessment once started</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#592538] mr-3">•</span>
                <span className="text-gray-600">Ensure you have a stable internet connection</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#592538] mr-3">•</span>
                <span className="text-gray-600">Answer all questions to get your detailed results</span>
              </li>
            </ul>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex-1 px-6 py-3 bg-gray-100 text-[#592538] rounded-lg hover:bg-gray-200 transition duration-300"
          >
            Back to Dashboard
          </button>
          {canStart ? (
            <button
              onClick={() => navigate("/assessment/quiz/fast-questions")}
              className="flex-1 px-6 py-3 bg-[#592538] text-white rounded-lg hover:bg-[#6d2c44] transition duration-300"
            >
              Start Assessment
            </button>
          ) : (
            <>
              <div className="flex-1 px-6 py-3 bg-yellow-100 text-yellow-800 rounded-lg flex items-center justify-center">
                {retakeMessage}
              </div>
              <button
                onClick={() => navigate("/assessment/results/fast-questions")}
                className="flex-1 px-6 py-3 bg-[#592538] text-white rounded-lg hover:bg-[#6d2c44] transition duration-300"
              >
                View Result
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentInstructionsFast; 