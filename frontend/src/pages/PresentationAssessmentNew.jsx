import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaVideo, FaUpload, FaFileUpload, FaCheck, FaClock, FaPlay, FaPause, FaRedo, FaSave, FaTrash, FaQuestionCircle } from 'react-icons/fa';

const PresentationAssessmentNew = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState('instructions'); // instructions, assessment, completed
  const [timeLeft, setTimeLeft] = useState(null);
  const [submissionId, setSubmissionId] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [presentationFile, setPresentationFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deadline, setDeadline] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  
  // New state variables for enhanced features
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const videoRef = useRef(null);
  const [questions, setQuestions] = useState({});
  const [completedQuestions, setCompletedQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  
  // Check if there's an active assessment and fetch questions
  useEffect(() => {
    const checkActiveAssessment = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Check if user has already submitted an assessment
        // Use user-submissions endpoint instead of videos endpoint (which requires admin access)
        const submissionsResponse = await axios.get(
          'http://localhost:5000/api/assessments/presentation/user-submissions',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        if (submissionsResponse.data && submissionsResponse.data.submissions && submissionsResponse.data.submissions.length > 0) {
          // User has already submitted, redirect to recommendations page
          setError('You have already submitted a presentation assessment and cannot retake it.');
          setTimeout(() => {
            navigate('/presentation-recommendations');
          }, 3000);
          return;
        }

        // Fetch questions first
        const questionsResponse = await axios.get(
          'http://localhost:5000/api/assessments/presentation/questions',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        if (questionsResponse.data) {
          setQuestions(questionsResponse.data);
        }

        // Check for active assessment
        const response = await axios.get(
          'http://localhost:5000/api/assessments/presentation/active',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data && response.data.activeAssessment) {
          const { _id, startTime, deadline } = response.data.activeAssessment;
          setSubmissionId(_id);
          setDeadline(new Date(deadline));
          setStage('assessment');
          
          // Calculate time left
          const now = new Date();
          const deadlineDate = new Date(deadline);
          const timeLeftMs = deadlineDate - now;
          
          if (timeLeftMs <= 0) {
            // Deadline passed
            setTimeLeft(0);
          } else {
            // Convert to seconds
            setTimeLeft(Math.floor(timeLeftMs / 1000));
          }
        }
        
        // Fetch completed questions
        const completedResponse = await axios.get(
          'http://localhost:5000/api/assessments/presentation/submissions',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        if (completedResponse.data && completedResponse.data.submissions) {
          const completedQuestionIds = completedResponse.data.submissions.map(
            submission => submission.questionId
          );
          setCompletedQuestions(completedQuestionIds);
        }
      } catch (err) {
        console.error('Error checking active assessment:', err);
        // Don't set error here, just continue to instructions
      }
    };

    checkActiveAssessment();
  }, []);

  // Timer effect
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format time for display (24 hours format)
  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return '--:--:--';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start assessment - initialize 24 hour timer
  const handleStartAssessment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(
        'http://localhost:5000/api/assessments/presentation/start',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.submissionId) {
        setSubmissionId(response.data.submissionId);
        
        // Set deadline 24 hours from now
        const deadline = new Date();
        deadline.setHours(deadline.getHours() + 24);
        setDeadline(deadline);
        
        // Set time left in seconds (24 hours = 86400 seconds)
        setTimeLeft(86400);
        
        setStage('assessment');
      } else {
        throw new Error('Failed to start assessment');
      }
    } catch (err) {
      console.error('Error starting assessment:', err);
      setError(err.response?.data?.error || err.message || 'Failed to start assessment');
    } finally {
      setLoading(false);
    }
  };

  // Handle video file selection
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.match('video.*')) {
        setError('Please select a video file');
        return;
      }
      
      // Check file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        setError('Video file size should be less than 100MB');
        return;
      }
      
      setVideoFile(file);
      setError(null);
      
      // Create a preview URL for the video
      const videoURL = URL.createObjectURL(file);
      setVideoPreviewUrl(videoURL);
    }
  };

  // Toggle video preview playback
  const toggleVideoPreview = () => {
    if (videoRef.current) {
      if (isPreviewPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPreviewPlaying(!isPreviewPlaying);
    }
  };

  // Clear video preview
  const clearVideoPreview = () => {
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setVideoPreviewUrl(null);
    setVideoFile(null);
    setIsPreviewPlaying(false);
  };

  // Change current question
  const changeQuestion = (questionNumber) => {
    setCurrentQuestion(questionNumber);
    clearVideoPreview();
  };

  // Handle presentation file selection
  const handlePresentationChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      const fileType = file.type;
      if (!fileType.includes('pdf') && !fileType.includes('powerpoint') && !fileType.includes('presentation')) {
        setError('Please upload a PDF or PowerPoint file');
        return;
      }
      
      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setError('Presentation file size exceeds 50MB limit');
        return;
      }
      
      setPresentationFile(file);
    }
  };

  // Submit assessment
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!videoFile || !presentationFile) {
      setError('Please upload both video and presentation files');
      return;
    }

    setSubmitting(true);
    setError(null);
    setUploadStatus('Preparing files for upload...');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Check if user has already submitted an assessment
      try {
        const checkResponse = await axios.get(
          'http://localhost:5000/api/assessments/presentation/user-submissions',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        if (checkResponse.data && checkResponse.data.submissions && checkResponse.data.submissions.length > 0) {
          // User has already submitted, redirect to recommendations page
          setError('You have already submitted a presentation assessment and cannot retake it.');
          setTimeout(() => {
            navigate('/presentation-recommendations');
          }, 3000);
          setSubmitting(false);
          return;
        }
      } catch (checkErr) {
        console.error('Error checking submission status:', checkErr);
        // Continue with submission attempt even if check fails
      }

      // Create a single FormData object for both files
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('presentation', presentationFile);
      formData.append('questionId', currentQuestion.toString());

      setUploadStatus('Uploading files...');
      setUploadProgress(0);

      // Upload both files in a single request
      const response = await axios.post(
        'http://localhost:5000/api/assessments/presentation/submit',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to upload files');
      }

      // Update completed questions
      setCompletedQuestions(prev => [...prev, currentQuestion]);
      
      // Clear preview
      clearVideoPreview();
      
      // Check if all questions are completed
      const allQuestions = Object.keys(questions).map(Number);
      const updatedCompleted = [...completedQuestions, currentQuestion];
      const isAllCompleted = allQuestions.every(q => updatedCompleted.includes(q));
      
      if (isAllCompleted) {
        // Redirect to recommendations page
        navigate('/presentation-recommendations', { replace: true });
      } else {
        setUploadStatus('Question submitted successfully!');
        
        // Find the next unanswered question
        const nextQuestion = allQuestions.find(q => !updatedCompleted.includes(q));
        if (nextQuestion) {
          setCurrentQuestion(nextQuestion);
        }
      }
    } catch (err) {
      console.error('Error submitting assessment:', err);
      setError(
        err.response?.data?.message || err.message || 'Failed to submit assessment'
      );
      
      // Check if the error response includes a redirect URL
      if (err.response?.data?.redirectTo) {
        setTimeout(() => {
          navigate(err.response.data.redirectTo);
        }, 3000);
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  // Submit practice recording for the current question
  const submitPracticeRecording = async () => {
    if (!videoFile) {
      setError('Please record a video first');
      return;
    }
    
    setIsPracticeMode(false);
    // The video is already set, so the user can now submit it normally
  };

  // Update timer every second
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [timeLeft]);

  return (
    <div className="min-h-screen bg-[#FDF8F8] py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    onClick={() => setError(null)}
                    className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center justify-center space-x-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#592538]"></div>
                <p className="text-lg font-medium text-gray-700">
                  {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : 'Loading...'}
                </p>
              </div>
              {uploadProgress > 0 && (
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-[#592538] h-2.5 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Instructions Stage */}
        {stage === 'instructions' && (
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
                  Presentation Assessment
                </h1>
              </div>
              
              <div className="bg-[#f9f5f6] p-4 rounded-lg border-l-4 border-[#592538]">
                <p className="text-gray-700">
                  This assessment evaluates your presentation skills. You will need to create a presentation about yourself and a challenging experience from high school, then record yourself presenting it.
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
                    <span>Create a <strong>PowerPoint presentation</strong> about yourself and a challenging experience from high school</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#592538] mr-2 mt-1">•</span>
                    <span>Record yourself presenting the slides (both screen and webcam)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#592538] mr-2 mt-1">•</span>
                    <span>You will have <strong>24 hours</strong> to complete and submit your presentation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#592538] mr-2 mt-1">•</span>
                    <span>You must submit both your video recording and PowerPoint file</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#592538] mr-2 mt-1">•</span>
                    <span>Your submission will be evaluated by an administrator</span>
                  </li>
                </ul>
              </div>
              


              <div className="flex justify-center pt-4">
                <button
                  onClick={handleStartAssessment}
                  className="px-8 py-3 bg-[#592538] text-white rounded-lg hover:bg-[#6d2c44] transition duration-300 flex items-center"
                >
                  <FaClock className="mr-2" />
                  Start 24-Hour Assessment
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Assessment Stage */}
        {stage === 'assessment' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-[#592538]"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-[#592538] p-3 rounded-full text-white">
                    <FaUpload size={24} />
                  </div>
                  <h1 className="text-2xl font-bold text-[#592538]">
                    Submit Your Presentation
                  </h1>
                </div>
                <div className="bg-red-100 px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FaClock className="text-red-600" />
                    <span className="font-mono font-bold text-red-600">{formatTime(timeLeft)}</span>
                  </div>
                  <div className="text-xs text-red-600 text-center mt-1">
                    Time Remaining
                  </div>
                </div>
              </div>

              <div className="bg-[#f9f5f6] p-4 rounded-lg border-l-4 border-[#592538]">
                <p className="text-gray-700">
                  {timeLeft > 0 ? (
                    <>You have until <strong>{deadline?.toLocaleString()}</strong> to submit your presentation.</>
                  ) : (
                    <strong className="text-red-600">Your time is up! Please submit your files immediately.</strong>
                  )}
                </p>
              </div>

              <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold text-[#592538] mb-4 flex items-center">
                  <span className="bg-[#592538] text-white rounded-full w-7 h-7 inline-flex items-center justify-center mr-2 text-sm">1</span>
                  Presentation Requirements
                </h2>
                <ul className="space-y-3 text-gray-700 pl-4">
                  <li className="flex items-start">
                    <span className="text-[#592538] mr-2 mt-1">•</span>
                    <span>Introduction about yourself (1-2 minutes)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#592538] mr-2 mt-1">•</span>
                    <span>A story about a challenging experience from high school (2-3 minutes)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#592538] mr-2 mt-1">•</span>
                    <span>What you learned from that experience (1-2 minutes)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#592538] mr-2 mt-1">•</span>
                    <span>Total presentation length: 5-7 minutes</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold text-[#592538] mb-4">Upload Your Files</h2>
                
                <div className="space-y-6">
                  {/* Video Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="flex flex-col items-center justify-center">
                      <FaVideo className="h-12 w-12 text-gray-400 mb-3" />
                      <h3 className="text-lg font-medium text-gray-900">Video Recording</h3>
                      <p className="text-sm text-gray-500 mb-4 text-center">
                        Upload your screen + webcam recording of your presentation (MP4, MOV, or WebM format)
                      </p>
                      
                      <input
                        type="file"
                        id="video-upload"
                        accept="video/*"
                        onChange={handleVideoChange}
                        className="hidden"
                      />
                      
                      <button
                        onClick={() => document.getElementById('video-upload').click()}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-300"
                      >
                        Select Video File
                      </button>
                      
                      {videoFile && (
                        <div className="mt-4 flex items-center space-x-2 text-green-600">
                          <FaCheck />
                          <span>{videoFile.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Presentation Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="flex flex-col items-center justify-center">
                      <FaFileUpload className="h-12 w-12 text-gray-400 mb-3" />
                      <h3 className="text-lg font-medium text-gray-900">Presentation File</h3>
                      <p className="text-sm text-gray-500 mb-4 text-center">
                        Upload your PowerPoint or PDF presentation file
                      </p>
                      
                      <input
                        type="file"
                        id="presentation-upload"
                        accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                        onChange={handlePresentationChange}
                        className="hidden"
                      />
                      
                      <button
                        onClick={() => document.getElementById('presentation-upload').click()}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-300"
                      >
                        Select Presentation File
                      </button>
                      
                      {presentationFile && (
                        <div className="mt-4 flex items-center space-x-2 text-green-600">
                          <FaCheck />
                          <span>{presentationFile.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Question Navigation */}
              <div className="flex justify-center mb-4">
                <div className="flex space-x-2">
                  {Object.keys(questions).map(questionId => (
                    <button
                      key={questionId}
                      onClick={() => changeQuestion(Number(questionId))}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        currentQuestion === Number(questionId)
                          ? 'bg-[#592538] text-white'
                          : completedQuestions.includes(Number(questionId))
                            ? 'bg-green-100 text-green-700 border border-green-500'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {completedQuestions.includes(Number(questionId)) ? <FaCheck size={12} /> : questionId}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Video Preview */}
              {videoPreviewUrl && (
                <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Video Preview</h3>
                  <div className="relative">
                    <video
                      ref={videoRef}
                      src={videoPreviewUrl}
                      className="w-full rounded-lg"
                      controls={false}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={toggleVideoPreview}
                        className="p-3 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition duration-300"
                      >
                        {isPreviewPlaying ? <FaPause size={24} /> : <FaPlay size={24} />}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={clearVideoPreview}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-300 flex items-center mt-2"
                  >
                    <FaTrash className="mr-1" size={12} />
                    Clear Video
                  </button>
                </div>
              )}
              
              {/* Submit Button */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={!videoFile || !presentationFile}
                  className={`px-8 py-3 rounded-lg transition duration-300 flex items-center ${
                    !videoFile || !presentationFile 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-[#592538] text-white hover:bg-[#6d2c44]'
                  }`}
                >
                  <FaUpload className="mr-2" />
                  Submit Assessment
                </button>
              </div>
              
              <div className="text-center text-sm text-gray-500">
                <p>Both files are required to submit your assessment.</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Completed Stage */}
        {stage === 'completed' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-green-500"
          >
            <div className="space-y-6 text-center">
              <div className="flex flex-col items-center space-y-3">
                <div className="bg-green-100 p-3 rounded-full text-green-600">
                  <FaCheck size={32} />
                </div>
                <h1 className="text-2xl font-bold text-[#592538]">
                  Assessment Submitted Successfully
                </h1>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                <p className="text-gray-700">
                  Your presentation assessment has been submitted and will be reviewed by an administrator. You will receive feedback once the evaluation is complete.
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-8 py-3 bg-[#592538] text-white rounded-lg hover:bg-[#6d2c44] transition duration-300"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PresentationAssessmentNew;
