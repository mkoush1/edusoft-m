import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PresentationRecommendations from "./PresentationRecommendations";
import { FaVideo, FaVideoSlash, FaMicrophone, FaCheck, FaClock } from "react-icons/fa";
import { motion } from "framer-motion";

const PresentationAssessment = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState("instructions"); // instructions, preparation, recording, completed
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null); // Add ref to store the stream

  // Move fetchQuestions to component scope so it can be called from anywhere
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

      // Convert questions to array format
      const questionArray = Object.entries(response.data).map(([id, question]) => ({
        id: parseInt(id),
        text: question.question,
        description: question.description,
        preparationTime: question.preparationTime,
        recordingTime: question.recordingTime
      }));

      setQuestions(questionArray);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate('/login', { state: { message: 'Session expired. Please log in again.' } });
      } else {
        setError("Failed to load questions. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Check completion status on component mount
  useEffect(() => {
    const checkCompletion = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await axios.get(
          "http://localhost:5000/api/assessments/presentation/check-completion",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.completed) {
          setIsCompleted(true);
          setStage("completed");
        }
      } catch (err) {
        if (err.response && err.response.status === 401) {
          navigate('/login', { state: { message: 'Session expired. Please log in again.' } });
        } else {
          setError("Failed to check assessment status. Please try again.");
        }
      }
    };

    checkCompletion();
  }, []);

  useEffect(() => {
    if (timeLeft === null) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (stage === "preparation") {
            startRecording();
          } else if (stage === "recording") {
            stopRecording();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, stage]);

  const handleStart = async () => {
    try {
      setStage("preparation");
      // Wait until the videoRef is set in the DOM
      let attempts = 0;
      while (!videoRef.current && attempts < 20) {
        // Try for up to 2 seconds (20 x 100ms)
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }
      if (!videoRef.current) {
        throw new Error("Video element not initialized. Please try again.");
      }
      await startCamera();
      setTimeLeft(questions[currentQuestion].preparationTime);
    } catch (err) {
      console.error("Error starting assessment:", err);
      setError(`Failed to start assessment: ${err.message || err}`);
      setStage("instructions");
    }
  };

  const startCamera = async () => {
    try {
      // First check if the browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          "Your browser does not support camera access. Please use a modern browser like Chrome, Firefox, or Edge."
        );
      }

      // Request camera and microphone permissions with specific constraints
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      };

      console.log("Requesting media permissions...");
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream; // Store the stream in the ref

      // Double check that video element exists
      if (!videoRef.current) {
        throw new Error("Video element not initialized. Please try again.");
      }

      console.log("Setting video stream...");
      videoRef.current.srcObject = stream;

      // Wait for the video to be ready
      await new Promise((resolve, reject) => {
        videoRef.current.onloadedmetadata = () => {
          videoRef.current
            .play()
            .then(resolve)
            .catch((e) => {
              console.error("Error playing video:", e);
              reject(new Error("Failed to play video stream"));
            });
        };
        // Add a timeout in case the video never loads
        setTimeout(
          () => reject(new Error("Video initialization timed out")),
          10000
        );
      });

      console.log("Camera initialized successfully");
    } catch (err) {
      console.error("Camera initialization error:", err);
      cleanupCamera(); // Clean up on error
      throw err;
    }
  };

  const cleanupCamera = () => {
    console.log("Cleaning up camera...");
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        console.log("Stopping track:", track.kind);
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      if (videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => {
          console.log("Stopping video track:", track.kind);
          track.stop();
        });
        videoRef.current.srcObject = null;
      }
      videoRef.current.pause();
    }
  };

  useEffect(() => {
    return () => {
      console.log("Component unmounting, cleaning up camera...");
      cleanupCamera();
    };
  }, []);

  const startRecording = async () => {
    setStage("recording");
    setTimeLeft(questions[currentQuestion].recordingTime);
    setIsRecording(true);

    try {
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

          if (blob.size === 0) {
            throw new Error("Recorded video is empty");
          }

          console.log("Video blob size:", blob.size, "bytes");

          // Create a FormData object to send the video
          const formData = new FormData();
          formData.append(
            "video",
            blob,
            `question_${questions[currentQuestion].id}_${Date.now()}.webm`
          );
          formData.append("questionId", questions[currentQuestion].id);
          formData.append("userId", localStorage.getItem("userId"));

          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("No authentication token found");
          }

          console.log("Starting video upload...");
          const response = await axios.post(
            "http://localhost:5000/api/assessments/presentation/submit",
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                console.log(`Upload progress: ${percentCompleted}%`);
              },
            }
          );

          console.log("Upload response:", response.data);

          if (response.data.success) {
            if (currentQuestion < questions.length - 1) {
              setCurrentQuestion(currentQuestion + 1);
              setStage("preparation");
              setTimeLeft(questions[currentQuestion + 1].preparationTime);
              cleanupCamera();
              await startCamera();
            } else {
              cleanupCamera();
              navigate("/presentation-recommendations");
            }
          } else {
            throw new Error(response.data.message || "Failed to upload video");
          }
        } catch (error) {
          console.error("Upload error details:", error);
          let errorMessage = "Failed to upload video. Please try again.";

          if (error.response) {
            console.error("Server response:", error.response.data);
            errorMessage =
              error.response.data.message ||
              error.response.data.details ||
              errorMessage;
          } else if (error.request) {
            console.error("No response received:", error.request);
            errorMessage =
              "No response from server. Please check your connection.";
          } else {
            console.error("Error setting up request:", error.message);
            errorMessage = error.message || errorMessage;
          }

          setError(errorMessage);
          cleanupCamera();
        }
      };

      mediaRecorderRef.current.start(1000); // Collect data every second
    } catch (err) {
      console.error("Recording error:", err);
      setError("Failed to start recording. Please try again.");
      cleanupCamera();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Add a small delay to ensure the recording is fully stopped
      setTimeout(() => {
        cleanupCamera();
      }, 500);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (stage === "completed") {
    return (
      <div className="min-h-screen bg-[#FDF8F8] py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-2xl font-bold text-[#592538] mb-6">
              Presentation Assessment Completed
            </h1>
            <div className="space-y-6">
              <p className="text-gray-600">
                You have already completed all three questions of the
                presentation assessment. You can view your results and
                recommendations below.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => navigate("/presentation-recommendations")}
                  className="px-6 py-3 bg-[#592538] text-white rounded-lg hover:bg-[#6d2c44] transition duration-300"
                >
                  View Recommendations
                </button>
                <button
                  onClick={() => navigate("/presentation-fetch")}
                  className="px-6 py-3 bg-gray-200 text-[#592538] rounded-lg hover:bg-gray-300 transition duration-300"
                >
                  View My Submissions
                </button>
              </div>
            </div>
          </div>
        </div>
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
            onClick={() => {
              setError(null);
              setStage("instructions");
              setLoading(true);
              fetchQuestions();
            }}
            className="bg-[#592538] text-white px-6 py-2 rounded-lg hover:bg-[#491f2e] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F8] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-[#592538] mb-4">Loading...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#592538] mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F8] py-8">
      <div className="max-w-4xl mx-auto px-4">
        {stage === "instructions" && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-[#592538]"
          >
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="bg-[#592538] p-3 rounded-full text-white">
                  <FaVideo size={24} />
                </div>
                <h1 className="text-2xl font-bold text-[#592538]">
                  Presentation Skills Assessment
                </h1>
              </div>
              
              <div className="bg-[#f9f5f6] p-4 rounded-lg border-l-4 border-[#592538]">
                <p className="text-gray-700">
                  This assessment evaluates your ability to communicate effectively
                  through video presentations. You will be asked to respond to a
                  series of questions by recording short video answers.
                </p>
              </div>

              <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold text-[#592538] mb-4 flex items-center">
                  <span className="bg-[#592538] text-white rounded-full w-7 h-7 inline-flex items-center justify-center mr-2 text-sm">1</span>
                  Instructions
                </h2>
                <ul className="space-y-3 text-gray-700 pl-4">
                  <li className="flex items-start">
                    <span className="text-[#592538] mr-2 mt-1">•</span>
                    <span>You will be presented with <span className="font-semibold text-[#592538]">{questions.length} questions</span>, one at a time</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#592538] mr-2 mt-1">•</span>
                    <span>For each question, you will have <span className="font-semibold text-[#592538]">2 minutes</span> to prepare your answer</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#592538] mr-2 mt-1">•</span>
                    <span>After preparation time, you will have <span className="font-semibold text-[#592538]">1 minute</span> to record your answer</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#592538] mr-2 mt-1">•</span>
                    <span>Make sure your camera and microphone are working properly</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#592538] mr-2 mt-1">•</span>
                    <span>Speak clearly and maintain good eye contact with the camera</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#592538] mr-2 mt-1">•</span>
                    <span>Your recordings will be reviewed by our assessment team</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold text-[#592538] mb-4 flex items-center">
                  <span className="bg-[#592538] text-white rounded-full w-7 h-7 inline-flex items-center justify-center mr-2 text-sm">2</span>
                  Technical Requirements
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="bg-[#592538]/10 p-2 rounded-full mr-3">
                      <FaVideo className="text-[#592538]" />
                    </div>
                    <span className="text-gray-700">A working webcam</span>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="bg-[#592538]/10 p-2 rounded-full mr-3">
                      <FaMicrophone className="text-[#592538]" />
                    </div>
                    <span className="text-gray-700">A working microphone</span>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="bg-[#592538]/10 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#592538]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Stable internet connection</span>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="bg-[#592538]/10 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#592538]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 010-7.072m12.728 0l3.536-3.536M6.343 6.343l-.707-.707m12.728 0l-3.536 3.536" />
                      </svg>
                    </div>
                    <span className="text-gray-700">A quiet environment</span>
                  </div>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStart}
                className="w-full px-6 py-4 bg-[#592538] text-white rounded-lg hover:bg-[#6d2c44] transition duration-300 flex items-center justify-center space-x-2 font-medium shadow-md"
              >
                <FaVideo />
                <span>Start Assessment</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {(stage === "preparation" || stage === "recording") && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-[#592538]"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div className="flex items-center">
                <div className="bg-[#592538] text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 font-bold">
                  {currentQuestion + 1}
                </div>
                <h2 className="text-xl font-semibold text-[#592538]">
                  Question {currentQuestion + 1} of {questions.length}
                </h2>
              </div>
              
              <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-full">
                <FaClock className="text-[#592538]" />
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-gray-500">
                    {stage === "preparation" ? "PREPARATION TIME" : "RECORDING TIME"}
                  </span>
                  <span className="font-mono text-xl font-bold text-[#592538]">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-6 bg-[#f9f5f6] p-5 rounded-lg border-l-4 border-[#592538]">
              <h3 className="text-lg font-semibold text-[#592538] mb-3">
                {questions[currentQuestion].text}
              </h3>
              <p className="text-gray-700 text-sm">
                {questions[currentQuestion].description}
              </p>
              {stage === "preparation" && (
                <div className="mt-4 bg-white p-3 rounded-lg border border-gray-200 text-sm">
                  <div className="flex items-start">
                    <div className="bg-[#592538]/10 p-1 rounded-full mr-2 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#592538]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-600">
                      Take this time to prepare your answer. Recording will start
                      automatically when the preparation time is over.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-6 shadow-md border border-gray-200">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted={stage === "preparation"}
                  className="w-full h-full object-cover"
                  style={{ transform: "scaleX(-1)" }}
                  onError={(e) => {
                    console.error("Video error:", e);
                    setError(
                      "Error displaying camera feed. Please refresh and try again."
                    );
                  }}
                />
                
                {/* Status indicator */}
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 text-white px-3 py-1.5 rounded-full text-sm">
                  {stage === "preparation" ? (
                    <>
                      <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                      <span>Preparing</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                      <span>Recording</span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="h-2 w-full bg-gray-200 rounded-full mb-6">
                <div 
                  className={`h-full rounded-full ${stage === "preparation" ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${(questions[currentQuestion][stage === "preparation" ? 'preparationTime' : 'recordingTime'] - timeLeft) / questions[currentQuestion][stage === "preparation" ? 'preparationTime' : 'recordingTime'] * 100}%` }}
                ></div>
              </div>
            </div>

            {stage === "preparation" && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startRecording}
                className="w-full px-6 py-4 bg-[#592538] text-white rounded-lg hover:bg-[#6d2c44] transition duration-300 mb-4 flex items-center justify-center space-x-2 font-medium shadow-md"
              >
                <FaVideo />
                <span>Start Recording Now</span>
              </motion.button>
            )}

            {stage === "recording" && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={stopRecording}
                className="w-full px-6 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300 flex items-center justify-center space-x-2 font-medium shadow-md"
              >
                <FaVideoSlash />
                <span>Stop Recording</span>
              </motion.button>
            )}
            
            {/* Tips section */}
            {stage === "preparation" && (
              <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="text-blue-700 font-medium mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Presentation Tips
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li className="flex items-start">
                    <span className="mr-1">•</span>
                    <span>Structure your answer with an introduction, main points, and conclusion</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-1">•</span>
                    <span>Speak clearly and at a moderate pace</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-1">•</span>
                    <span>Use hand gestures naturally to emphasize key points</span>
                  </li>
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PresentationAssessment;
