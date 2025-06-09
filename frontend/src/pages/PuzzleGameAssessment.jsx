import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PuzzleGame from '../components/PuzzleGame';

const PuzzleGameAssessment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [puzzle, setPuzzle] = useState(null);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [result, setResult] = useState(null);
  const [canRetake, setCanRetake] = useState(false);
  const [retakeMessage, setRetakeMessage] = useState("");

  useEffect(() => {
    const startAssessment = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please log in to take the assessment");
          setLoading(false);
          return;
        }

        // Start the assessment
        const response = await axios.post(
          "http://localhost:5000/api/assessments/start/puzzle-game",
          {},
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          setAssessment(response.data.data.assessment);
          setPuzzle(response.data.data.puzzle);
        } else if (response.data.alreadyCompleted) {
          setAlreadyCompleted(true);
          setResult(response.data.result);
          setCanRetake(response.data.canRetake);
          setRetakeMessage(response.data.retakeMessage);
        } else {
          setError("Failed to start assessment");
        }
      } catch (error) {
        console.error("Error starting assessment:", error);
        if (error.response?.status === 403) {
          setError("Your session has expired. Please log in again.");
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setError(error.response?.data?.message || "Failed to start assessment");
        }
      } finally {
        setLoading(false);
      }
    };

    startAssessment();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F8] flex items-center justify-center">
        <div className="text-[#592538] text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FDF8F8] flex items-center justify-center">
        <div className="text-[#592538] text-xl">{error}</div>
      </div>
    );
  }

  if (alreadyCompleted && result) {
    return (
      <div className="min-h-screen bg-[#FDF8F8] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full text-center">
          <h1 className="text-2xl font-bold text-[#592538] mb-6">Puzzle Game Assessment Result</h1>
          <div className="text-5xl font-extrabold text-[#592538] mb-2">{result.percentage}%</div>
          <div className="text-lg text-gray-700 mb-2">Score: {result.score}</div>
          <div className="text-md text-gray-500 mb-4">Completed: {new Date(result.completedAt).toLocaleString()}</div>
          {canRetake ? (
            <button
              onClick={() => window.location.reload()}
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
  }

  return (
    <div className="min-h-screen bg-[#FDF8F8]">
      {puzzle && <PuzzleGame initialPuzzle={puzzle} assessmentId={assessment._id} />}
    </div>
  );
};

export default PuzzleGameAssessment; 