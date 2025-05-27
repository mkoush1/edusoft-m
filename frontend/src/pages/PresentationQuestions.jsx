import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const PresentationQuestions = () => {
  const navigate = useNavigate();
  const [completedQuestions, setCompletedQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompletedQuestions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await axios.get(
          "http://localhost:5000/api/assessments/presentation/submissions",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Get the question IDs that have been completed
        const completedIds = response.data.map(
          (submission) => submission.questionId
        );
        setCompletedQuestions(completedIds);
      } catch (err) {
        console.error("Error fetching completed questions:", err);
        setError("Failed to load questions status. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedQuestions();
  }, []);

  const handleQuestionClick = (questionNumber) => {
    // Check if previous questions are completed
    if (
      questionNumber > 1 &&
      !completedQuestions.includes(questionNumber - 1)
    ) {
      setError("Please complete the previous question first.");
      return;
    }
    navigate(`/presentation-question/${questionNumber}`);
  };

  const handleViewRecommendations = () => {
    navigate("/presentation-recommendations");
  };

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
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-[#592538] mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => setError(null)}
            className="w-full px-6 py-3 bg-[#592538] text-white rounded-lg hover:bg-[#6d2c44] transition duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F8] py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-[#592538] mb-6">
            Presentation Skills Assessment
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((questionNumber) => {
              const isCompleted = completedQuestions.includes(questionNumber);
              const isLocked =
                questionNumber > 1 &&
                !completedQuestions.includes(questionNumber - 1);

              return (
                <div
                  key={questionNumber}
                  className={`relative rounded-xl p-6 cursor-pointer transition-all duration-300 ${
                    isLocked
                      ? "bg-gray-100 cursor-not-allowed"
                      : isCompleted
                      ? "bg-green-50 border-2 border-green-500"
                      : "bg-white border-2 border-[#592538] hover:bg-[#FDF8F8]"
                  }`}
                  onClick={() =>
                    !isLocked && handleQuestionClick(questionNumber)
                  }
                >
                  <h3 className="text-xl font-semibold text-[#592538] mb-2">
                    Question {questionNumber}
                  </h3>
                  {isCompleted && (
                    <div className="absolute top-2 right-2 text-green-500">
                      ✓ Completed
                    </div>
                  )}
                  {isLocked && (
                    <div className="absolute top-2 right-2 text-gray-500">
                      🔒 Locked
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={handleViewRecommendations}
            className="w-full px-6 py-3 bg-[#592538] text-white rounded-lg hover:bg-[#6d2c44] transition duration-300"
          >
            View Recommendations
          </button>
        </div>
      </div>
    </div>
  );
};

export default PresentationQuestions;
