import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AssessmentQuizFast = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [error, setError] = useState("");
  const [questionTimeLeft, setQuestionTimeLeft] = useState(null);
  const [questionTimedOut, setQuestionTimedOut] = useState(false);
  const timerRef = useRef();

  useEffect(() => {
    const startAssessment = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        const response = await axios.post(
          "http://localhost:5000/api/assessments/start/fast-questions",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.data && response.data.questions) {
          setQuestions(response.data.questions);
          setTimeLeft(50 * 60); // 50 minutes in seconds
        } else {
          setError("No questions available. Please try again later.");
        }
        setLoading(false);
      } catch (error) {
        if (error.response?.status === 403) {
          // User has already completed the assessment
          navigate('/assessment/results', {
            state: {
              assessmentStatus: error.response.data.assessmentStatus,
              score: error.response.data.score
            }
          });
        } else {
          setError(
            error.response?.data?.message ||
              "Error starting assessment. Please try again later."
          );
        }
        setLoading(false);
      }
    };
    startAssessment();
  }, [navigate]);

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

  // Reset per-question timer on question change
  useEffect(() => {
    if (!questions.length) return;
    setQuestionTimeLeft(questions[currentQuestionIndex].timeLimit);
    setQuestionTimedOut(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setQuestionTimeLeft((prev) => {
        if (prev === 1) {
          clearInterval(timerRef.current);
          setQuestionTimedOut(true);
          // Auto-advance after a short delay
          setTimeout(() => {
            if (currentQuestionIndex === questions.length - 1) {
              handleSubmit();
            } else {
              setCurrentQuestionIndex((idx) => idx + 1);
            }
          }, 800);
        }
        return prev > 0 ? prev - 1 : 0;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line
  }, [currentQuestionIndex, questions]);

  const handleAnswer = (option) => {
    if (questionTimedOut) return;
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;
    setAnswers({
      ...answers,
      [currentQuestion.questionNumber]: option,
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
      if (!token) {
        setError("Please log in to submit the assessment");
        setLoading(false);
        return;
      }
      const formattedAnswers = Object.entries(answers).map(([questionNumber, answer]) => ({
        questionNumber: parseInt(questionNumber),
        answer: answer
      }));
      await axios.post(
        "http://localhost:5000/api/assessments/submit/fast-questions",
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
      // Navigate to AssessmentResults with type parameter
      navigate('/assessment-results?assessmentType=fast-questions');
    } catch (error) {
      setError("Failed to submit assessment. Please try again.");
    } finally {
      setLoading(false);
    }
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
        <div className="text-[#592538] text-xl">{error}</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#FDF8F8] flex items-center justify-center">
        <div className="text-[#592538] text-xl">No questions available</div>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-[#FDF8F8] py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-[#592538]">
              Fast Questions Assessment
            </h1>
            <div className="flex items-center gap-2 text-[#592538]">
              <span className="text-lg">⏱️</span>
              <span className="font-semibold">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>{currentQuestion.section}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#592538] h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>
          {/* Question */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#592538] mb-2">
              {currentQuestion.questionText}
            </h2>
            <div className="mb-4 text-sm text-gray-500">
              Time left: {questionTimeLeft} seconds
            </div>
            {/* Options */}
            <div className="space-y-4">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.letter}
                  onClick={() => handleAnswer(option.letter)}
                  disabled={questionTimedOut}
                  className={`
                    w-full p-4 text-left rounded-lg transition duration-300
                    ${
                      answers[currentQuestion.questionNumber] === option.letter
                        ? "bg-[#592538] text-white"
                        : questionTimedOut
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-100 text-gray-600 hover:bg-[#592538]/10"
                    }
                  `}
                >
                  <span className="font-medium mr-2">{option.letter}.</span>
                  {option.text}
                </button>
              ))}
            </div>
          </div>
          {/* Navigation */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0 || questionTimedOut}
              className={`
                flex-1 px-6 py-3 rounded-lg font-medium transition duration-300
                ${
                  currentQuestionIndex === 0 || questionTimedOut
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
                disabled={!answers[currentQuestion.questionNumber] || questionTimedOut}
                className={`
                  flex-1 px-6 py-3 rounded-lg font-medium transition duration-300
                  ${
                    !answers[currentQuestion.questionNumber] || questionTimedOut
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-[#592538] text-white hover:bg-[#6d2c44]"
                  }
                `}
              >
                Finish Assessment
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!answers[currentQuestion.questionNumber] || questionTimedOut}
                className={`
                  flex-1 px-6 py-3 rounded-lg font-medium transition duration-300
                  ${
                    !answers[currentQuestion.questionNumber] || questionTimedOut
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

export default AssessmentQuizFast; 