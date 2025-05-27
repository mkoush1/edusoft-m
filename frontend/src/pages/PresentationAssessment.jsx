import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PresentationRecommendations from "./PresentationRecommendations";

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
        console.error("Error fetching questions:", err);
        setError("Failed to load questions. Please try again.");
      } finally {
        setLoading(false);
      }
    };

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
        console.error("Error checking completion:", err);
        setError("Failed to check assessment status. Please try again.");
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
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-2xl font-bold text-[#592538] mb-6">
              Presentation Skills Assessment
            </h1>
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-[#592538] mb-3">
                  Instructions
                </h2>
                <ul className="space-y-3 text-gray-600">
                  <li>
                    • You will be asked to answer {questions.length} questions
                  </li>
                  <li>
                    • For each question, you will have 30 seconds to prepare
                  </li>
                  <li>
                    • After preparation time, you will have 1 minute to record
                    your answer
                  </li>
                  <li>
                    • Make sure your camera and microphone are working properly
                  </li>
                  <li>
                    • Speak clearly and maintain good eye contact with the
                    camera
                  </li>
                  <li>
                    • Your recordings will be reviewed by our assessment team
                  </li>
                </ul>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#592538] mb-3">
                  Technical Requirements
                </h2>
                <ul className="space-y-3 text-gray-600">
                  <li>• A working webcam</li>
                  <li>• A working microphone</li>
                  <li>• Stable internet connection</li>
                  <li>• A quiet environment</li>
                </ul>
              </div>
              <button
                onClick={handleStart}
                className="w-full px-6 py-3 bg-[#592538] text-white rounded-lg hover:bg-[#6d2c44] transition duration-300"
              >
                Start Assessment
              </button>
            </div>
          </div>
        )}

        {(stage === "preparation" || stage === "recording") && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#592538]">
                Question {currentQuestion + 1} of {questions.length}
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

            <div className="mb-6">
              <h3 className="text-lg font-medium text-[#592538] mb-2">
                {questions[currentQuestion].text}
              </h3>
              {stage === "preparation" && (
                <p className="text-gray-600">
                  Take this time to prepare your answer. Recording will start
                  automatically when the preparation time is over.
                </p>
              )}
            </div>

            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-6">
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
        )}
      </div>
    </div>
  );
};

export default PresentationAssessment;
