import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const PresentationQuestion = () => {
  const navigate = useNavigate();
  const { questionNumber } = useParams();
  const [stage, setStage] = useState("preparation"); // preparation, recording
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes preparation
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

    const [questions, setQuestions] = useState({});
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionsError, setQuestionsError] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await axios.get(
          "http://localhost:5000/api/assessments/presentation/questions",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log('API Response:', response.data);
        setQuestions(response.data);
      } catch (err) {
        console.error("Error fetching questions:", err);
        setQuestionsError("Failed to load questions. Please try again.");
      } finally {
        setQuestionsLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  useEffect(() => {
    if (timeLeft === null) return;

    let timer;
    
    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0) {
            clearInterval(timer);
            if (stage === "preparation") {
              startRecording();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(timer);
    };
  }, [stage, timeLeft]);



  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Error accessing camera:", err);
      setQuestionsError(
        "Failed to access camera. Please ensure you have granted camera permissions."
      );
    }
  };

  const startRecording = async () => {
    try {
      setStage("recording");
      setTimeLeft(120); // 2 minutes recording
      setIsRecording(true);

      const stream = videoRef.current.srcObject;
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9,opus",
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        try {
          const blob = new Blob(chunksRef.current, { type: "video/webm" });
          chunksRef.current = [];

          const formData = new FormData();
          formData.append(
            "video",
            blob,
            `question_${questionNumber}_${Date.now()}.webm`
          );
          formData.append("questionId", questionNumber);

          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("No authentication token found");
          }

          await axios.post(
            "http://localhost:5000/api/assessments/presentation/submit",
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );

          navigate("/presentation-questions");
        } catch (error) {
          console.error("Upload error:", error);
          setQuestionsError("Failed to upload video. Please try again.");
        }
      };

      mediaRecorderRef.current.start(1000);
    } catch (err) {
      console.error("Recording error:", err);
      setQuestionsError("Failed to start recording. Please try again.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      cleanupCamera();
    }
  };

  const cleanupCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    startCamera();
    return () => cleanupCamera();
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (questionsError) {
    return (
      <div className="min-h-screen bg-[#FDF8F8] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-[#592538] mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{questionsError}</p>
          <button
            onClick={() => navigate("/presentation-questions")}
            className="w-full px-6 py-3 bg-[#592538] text-white rounded-lg hover:bg-[#6d2c44] transition duration-300"
          >
            Return to Questions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F8] py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#592538]">
              Question {questionNumber}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">
                {stage === "preparation" ? "Preparation" : "Recording"}:
              </span>
              <span className="font-mono text-xl text-[#592538]">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          {questionsLoading ? (
            <div className="mb-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ) : questionsError ? (
            <div className="mb-6 text-red-500">
              {questionsError}
            </div>
          ) : (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-[#592538] mb-2">
                {questions[questionNumber]?.question}
              </h3>
              <p className="text-gray-600 mb-4">
                {questions[questionNumber]?.description}
              </p>
              <p className="text-gray-600 mb-4">
                Preparation Time: {Math.floor(questions[questionNumber]?.preparationTime / 60)} minutes
              </p>
              <p className="text-gray-600 mb-4">
                Recording Time: {Math.floor(questions[questionNumber]?.recordingTime / 60)} minutes
              </p>
              {stage === "preparation" && (
                <p className="text-gray-600">
                  Take this time to prepare your answer. Recording will start
                  automatically when the preparation time is over.
                </p>
              )}
            </div>
          )}

          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-6">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={stage === "preparation"}
              className="w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
          </div>

          {stage === "preparation" && (
            <button
              onClick={startRecording}
              className="w-full px-6 py-3 bg-[#592538] text-white rounded-lg hover:bg-[#6d2c44] transition duration-300 mb-4"
            >
              Start Recording Now
            </button>
          )}

          {stage === "recording" && (
            <button
              onClick={stopRecording}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
            >
              Stop Recording
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PresentationQuestion;
