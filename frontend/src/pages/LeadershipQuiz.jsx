import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LeadershipQuiz = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const startAssessment = async () => {
      try {
        // Get the category from localStorage
        const category = localStorage.getItem('currentQuizCategory') || 'leadership';
        console.log('Starting quiz for category from localStorage:', category);

        const token = localStorage.getItem("token");
        console.log("Starting assessment with token:", token);

        if (!token) {
          setError("Please log in to take the assessment");
          setLoading(false);
          return;
        }

        const response = await axios.post(
          `http://localhost:5000/api/assessments/start/${category}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("API Response:", response.data);

        if (response.data && response.data.data && response.data.data.questions) {
          console.log("Questions received:", response.data.data.questions);
          setQuestions(response.data.data.questions);
          setTimeLeft(45 * 60); // 45 minutes in seconds
        } else {
          console.error("No questions in response:", response.data);
          setError("No questions available. Please try again later.");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error starting assessment:", error);
        console.error("Error response:", error.response);
        setError(
          error.response?.data?.message ||
            "Error starting assessment. Please try again later."
        );
        setLoading(false);
      }
    };

    startAssessment();
  }, []);

  useEffect(() => {
    if (timeLeft === null) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAnswer = (score) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    setAnswers({
      ...answers,
      [currentQuestion.questionNumber]: score,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const category = localStorage.getItem('currentQuizCategory') || 'leadership';

      if (!token) {
        setError("Please log in to submit the assessment");
        setLoading(false);
        return;
      }

      // Format answers for submission
      const formattedAnswers = Object.entries(answers).map(([questionNumber, score]) => ({
        questionNumber: parseInt(questionNumber),
        score: score
      }));

      console.log("Submitting answers:", formattedAnswers);
      
      const response = await axios.post(
        `http://localhost:5000/api/assessments/submit/${category}`,
        {
          answers: formattedAnswers
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Assessment submitted successfully:", response.data);

      // Navigate to results page
      navigate(`/assessment/${category}/recommendations`);
    } catch (error) {
      console.error("Error submitting assessment:", error);
      setError(
        error.response?.data?.message ||
          "Error submitting assessment. Please try again later."
      );
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
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
      <div className="min-h-screen bg-[#FDF8F8] flex items-center justify-center flex-col space-y-4">
        <div className="text-red-500 text-xl">{error}</div>
        <button
          onClick={() => navigate("/assessments")}
          className="px-4 py-2 bg-[#592538] text-white rounded-lg hover:bg-[#6d2c44] transition duration-300"
        >
          Back to Assessments
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#FDF8F8] flex items-center justify-center flex-col space-y-4">
        <div className="text-[#592538] text-xl">No questions available for this assessment.</div>
        <button
          onClick={() => navigate("/assessments")}
          className="px-4 py-2 bg-[#592538] text-white rounded-lg hover:bg-[#6d2c44] transition duration-300"
        >
          Back to Assessments
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-[#FDF8F8] py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-[#592538]">
              Leadership Assessment
            </h1>
            <div className="text-lg font-medium text-[#592538]">
              Time Left: {formatTime(timeLeft)}
            </div>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span>
                {Math.round(
                  ((currentQuestionIndex + 1) / questions.length) * 100
                )}
                % Complete
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-[#592538] rounded-full transition-all duration-300"
                style={{
                  width: `${
                    ((currentQuestionIndex + 1) / questions.length) * 100
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#592538] mb-6">
              {currentQuestion.questionText}
            </h2>

            {/* Rating Scale */}
            <div className="space-y-6">
              <div className="grid grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    onClick={() => handleAnswer(score)}
                    className={`
                      py-3 rounded-lg text-lg font-medium transition duration-300
                      ${
                        answers[currentQuestion.questionNumber] === score
                          ? "bg-[#592538] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-[#592538]/10"
                      }
                    `}
                  >
                    {score}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-sm text-gray-600 px-1">
                <span>Strongly Disagree</span>
                <span>Strongly Agree</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className={`
                flex-1 px-6 py-3 rounded-lg font-medium transition duration-300
                ${
                  currentQuestionIndex === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-[#592538] hover:bg-gray-200"
                }
              `}
            >
              Previous
            </button>
            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={!answers[currentQuestion.questionNumber]}
                className={`
                  flex-1 px-6 py-3 rounded-lg font-medium transition duration-300
                  ${
                    !answers[currentQuestion.questionNumber]
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-[#592538] text-white hover:bg-[#6d2c44]"
                  }
                `}
              >
                Submit Assessment
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!answers[currentQuestion.questionNumber]}
                className={`
                  flex-1 px-6 py-3 rounded-lg font-medium transition duration-300
                  ${
                    !answers[currentQuestion.questionNumber]
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-[#592538] text-white hover:bg-[#6d2c44]"
                  }
                `}
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadershipQuiz;
