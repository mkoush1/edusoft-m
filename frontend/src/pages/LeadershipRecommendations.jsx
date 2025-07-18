import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { decodeJWT } from '../utils/jwt';
import api, { getAssessmentResults } from '../services/api';

const LeadershipResult = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canRetake, setCanRetake] = useState(false);
  const [retakeMessage, setRetakeMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await getAssessmentResults("leadership");
        const latestResult = Array.isArray(response.data) && response.data.length > 0 ? response.data[0] : null;
        setResult(latestResult);
        setLoading(false);
      } catch (err) {
        setError("Failed to load assessment result");
        setLoading(false);
      }
    };

    const fetchRetakeStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const decoded = decodeJWT(token);
        const userId = decoded?.userId;
        if (!userId) return;
        const res = await api.get(`/assessments/status/${userId}`);
        const completed = res.data?.data?.assessments?.find(a => a.category === 'leadership');
        if (completed && completed.completedAt) {
          const completedAt = new Date(completed.completedAt);
          const now = new Date();
          const diff = (now - completedAt) / (1000 * 60 * 60 * 24);
          if (diff >= 7) {
            setCanRetake(true);
            setRetakeMessage("");
          } else {
            setCanRetake(false);
            const nextRetake = new Date(completedAt);
            nextRetake.setDate(completedAt.getDate() + 7);
            const daysLeft = Math.ceil((nextRetake - now) / (1000 * 60 * 60 * 24));
            setRetakeMessage(`You can retake this assessment in ${daysLeft} day${daysLeft !== 1 ? 's' : ''} (on ${nextRetake.toLocaleDateString()})`);
          }
        } else {
          setCanRetake(true);
          setRetakeMessage("");
        }
      } catch (err) {
        setCanRetake(false);
        setRetakeMessage("");
      }
    };

    fetchResult();
    fetchRetakeStatus();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF8F8]">
        <div className="text-[#592538] text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF8F8]">
        <div className="text-red-500 text-xl">{error}</div>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-6 px-4 py-2 bg-[#592538] text-white rounded-lg hover:bg-[#6d2c44] transition duration-300"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Calculate score summary
  const percentage = result?.percentage ? Math.round(result.percentage) : 0;
  let summary = "";
  if (percentage >= 80) summary = "Excellent leadership skills!";
  else if (percentage >= 60) summary = "Good job! Keep improving.";
  else if (percentage >= 40) summary = "Fair. Consider more practice.";
  else summary = "Needs improvement. Keep learning!";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF8F8] py-8">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full">
        <h1 className="text-2xl font-bold text-[#592538] mb-6 text-center">
          Leadership Assessment Result
        </h1>
        <div className="flex flex-col items-center mb-6">
          <div className="text-5xl font-extrabold text-[#592538] mb-2">{percentage}%</div>
          <div className="text-lg text-gray-700 mb-2">{summary}</div>
        </div>
        {canRetake ? (
          <button
            onClick={() => navigate('/assessment/leadership')}
            className="w-full mb-4 px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition duration-300 font-semibold"
          >
            Retake Assessment
          </button>
        ) : retakeMessage ? (
          <div className="mb-4 text-yellow-700 bg-yellow-100 rounded-lg px-4 py-2 text-center">
            {retakeMessage}
          </div>
        ) : null}
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full px-4 py-2 bg-[#592538] text-white rounded-lg hover:bg-[#6d2c44] transition duration-300"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default LeadershipResult;
