import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AssessmentResultsFast = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [canRetake, setCanRetake] = useState(false);
  const [retakeMessage, setRetakeMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Not logged in");
        const res = await axios.get("http://localhost:5000/api/assessments/fast-question/user/me/results", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const latest = res.data.results && res.data.results.length > 0 ? res.data.results[0] : null;
        setResult(latest);
        // Retake logic: allow retake after 7 days
        if (latest && latest.completedAt) {
          const completedAt = new Date(latest.completedAt);
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
        setLoading(false);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setError("Failed to load assessment result");
        }
        setLoading(false);
      }
    };
    fetchResult();
  }, [navigate]);

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

  const score = result?.score ?? 0;
  const totalQuestions = result?.details?.totalQuestions ?? 0;
  const percent = totalQuestions ? Math.round((score / totalQuestions) * 100) : 0;
  let summary = "";
  if (percent >= 80) summary = "Excellent problem-solving speed!";
  else if (percent >= 60) summary = "Good job! Keep practicing for even faster solutions.";
  else if (percent >= 40) summary = "Fair. Try to improve your speed and accuracy.";
  else summary = "Needs improvement. Practice more to boost your problem-solving skills.";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF8F8] py-8">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full">
        <h1 className="text-2xl font-bold text-[#592538] mb-6 text-center">
          Fast Questions Assessment Result
        </h1>
        <div className="flex flex-col items-center mb-6">
          <div className="text-5xl font-extrabold text-[#592538] mb-2">{percent}%</div>
          <div className="text-lg text-gray-700 mb-2">{summary}</div>
        </div>
        {canRetake ? (
          <button
            onClick={() => navigate('/assessment/quiz/fast-questions')}
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
          onClick={() => {
            localStorage.setItem('assessmentStatus', Date.now().toString());
            navigate("/dashboard");
          }}
          className="w-full px-4 py-2 bg-[#592538] text-white rounded-lg hover:bg-[#6d2c44] transition duration-300"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default AssessmentResultsFast; 