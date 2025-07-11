import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CEFRService from '../../services/cefr.service';
import api from '../../services/api';
import cloudinaryService from '../../services/cloudinary.service';
import AssessmentService from '../../services/assessment.service';

// Reusable function for creating consistent status messages
const createStatusMessage = (type, message, icon = null) => {
  // Define status types styles
  const statusStyles = {
    error: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-100',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600'
    },
    success: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-100',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    info: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-100',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    warning: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-100',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    },
    loading: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-100',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    }
  };
  
  // Get styles for the specified type or default to info
  const style = statusStyles[type] || statusStyles.info;
  
  // Default icons for each type
  const defaultIcons = {
    error: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    success: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    info: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    loading: (
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
    )
  };
  
  // Use provided icon or default for the type
  const iconToUse = icon || defaultIcons[type];
  
  return (
    <div className={`flex items-center p-4 ${style.bg} ${style.text} border ${style.border} rounded-xl shadow-sm mb-4`}>
      <div className={`flex-shrink-0 ${style.iconBg} ${style.iconColor} p-2 rounded-full mr-3`}>
        {iconToUse}
      </div>
      <div>
        {typeof message === 'string' ? (
          <p>{message}</p>
        ) : (
          message
        )}
      </div>
    </div>
  );
};

const SpeakingAssessment = ({ onComplete, level, language, onBack }) => {
  const [currentTask, setCurrentTask] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [preparationTimeLeft, setPreparationTimeLeft] = useState(null);
  const [recordingTimeLeft, setRecordingTimeLeft] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [stream, setStream] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isPreparationMode, setIsPreparationMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [audioInitializing, setAudioInitializing] = useState(false);
  const [transcribedText, setTranscribedText] = useState('Recording complete. Your speaking will be assessed without automatic transcription.');
  // Add countdown state
  const [countdown, setCountdown] = useState(null);
  
  // Add assessment status tracking
  const [existingAssessment, setExistingAssessment] = useState(null);
  const [assessmentStatus, setAssessmentStatus] = useState(null); // 'pending', 'evaluated', or null
  const [canRetake, setCanRetake] = useState(true);
  const [retakeAvailableDate, setRetakeAvailableDate] = useState(null);
  
  const audioRef = useRef(null);
  const videoRef = useRef(null);  // Add a reference for the video element
  const recognitionRef = useRef(null);

  const navigate = useNavigate();

  // Remove the original Speech Recognition code and simplify
  useEffect(() => {
    console.log("Speech recognition disabled for improved reliability");
    
    return () => {
      // No cleanup needed since we're not using speech recognition
    };
  }, []);

  // Add effect to check if the user has already taken this assessment
  useEffect(() => {
    const checkExistingAssessment = async () => {
      try {
        // Get userId from localStorage
        const userId = localStorage.getItem('userId') || 
                     sessionStorage.getItem('userId') || 
                     JSON.parse(localStorage.getItem('userData') || '{}')?.userId ||
                     JSON.parse(localStorage.getItem('userData') || '{}')?.UserID ||
                     localStorage.getItem('UserID');
        
        if (!userId) {
          console.warn("No user ID found, cannot check for existing assessments");
          return;
        }
        
        setLoading(true);
        setError(createStatusMessage('info', 'Checking assessment status...'));
        
        // Check if the user has already completed this assessment
        const response = await AssessmentService.checkSpeakingAssessment(
          userId, language, level, 1
        );
        
        console.log("Assessment check response:", response);
        
        if (response.success && response.exists) {
          console.log("Found existing assessment:", response);
          
          // Process the assessment data
          let assessmentData = response.assessment;
          console.log("Raw assessment data:", assessmentData);
          
          // Parse supervisor feedback if it's a JSON string
          if (assessmentData.supervisorFeedback && typeof assessmentData.supervisorFeedback === 'string') {
            try {
              const parsedFeedback = JSON.parse(assessmentData.supervisorFeedback);
              console.log('Parsed supervisor feedback:', parsedFeedback);
              
              // Update the assessment data with parsed feedback
              assessmentData = {
                ...assessmentData,
                parsedSupervisorFeedback: parsedFeedback,
                supervisorFeedbackText: parsedFeedback.overallFeedback || assessmentData.supervisorFeedback
              };
              
              // Extract criteria if available
              if (parsedFeedback.criteria && Array.isArray(parsedFeedback.criteria)) {
                assessmentData.supervisorCriteria = parsedFeedback.criteria;
                console.log('Found supervisor criteria:', parsedFeedback.criteria.length);
              }
              
              // Extract raw score and normalized score if available
              if (parsedFeedback.rawScore !== undefined) {
                assessmentData.rawScore = parsedFeedback.rawScore;
              }
              
              if (parsedFeedback.normalizedScore !== undefined) {
                assessmentData.normalizedScore = parsedFeedback.normalizedScore;
              }
            } catch (error) {
              console.error('Error parsing supervisor feedback:', error);
            }
          }
          
          // Log the supervisor score for debugging
          console.log("Supervisor score:", assessmentData.supervisorScore);
          
          // Store the processed assessment
          setExistingAssessment(assessmentData);
          setAssessmentStatus(response.status || assessmentData.status);
          
          // Check if user can retake the assessment (7-day cooldown)
          if (response.canRetake === false) {
            setCanRetake(false);
            
            if (response.nextAvailableDate) {
              setRetakeAvailableDate(new Date(response.nextAvailableDate));
              
              // Calculate days remaining in a user-friendly way
              const daysRemaining = response.daysRemaining || 
                Math.ceil((new Date(response.nextAvailableDate) - new Date()) / (24 * 60 * 60 * 1000));
              
              setError(createStatusMessage('warning', 
                <span>
                  <span className="font-medium">Assessment cooldown period</span>
                  <p className="text-sm mt-1">
                    You have already taken this assessment. You can retake it in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}.
                  </p>
                  <p className="text-sm mt-1">
                    Available from: {new Date(response.nextAvailableDate).toLocaleDateString()}
                  </p>
                </span>
              ));
              
              setLoading(false);
              return;
            }
          }
          
          // If the assessment is already completed and evaluated, show the results
          if (response.status === 'evaluated' || response.assessment?.status === 'evaluated') {
            if (response.canRetake) {
              setError(createStatusMessage('info', 
                <span>
                  <span className="font-medium">Previous assessment available</span>
                  <p className="text-sm mt-1">
                    You can view your previous results or take the assessment again.
                  </p>
                  <div className="mt-2">
                    <button 
                      onClick={() => onComplete({
                        ...response.assessment,
                        type: 'speaking',
                        videoUrl: response.videoUrl,
                        transcribedText: response.transcribedText,
                        isExisting: true
                      })}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm mr-2"
                    >
                      View Results
                    </button>
                    <button 
                      onClick={() => setError(null)}
                      className="px-3 py-1 bg-green-600 text-white rounded-md text-sm"
                    >
                      Take Again
                    </button>
                  </div>
                </span>
              ));
            } else {
              // Process the assessment data for display
              const assessmentForDisplay = {
                ...response.assessment,
                type: 'speaking',
                videoUrl: response.videoUrl || response.assessment.videoUrl,
                transcribedText: response.transcribedText || response.assessment.transcribedText,
                isExisting: true
              };
              
              // Pass the assessment to the complete handler to show results
              onComplete(assessmentForDisplay);
            }
          } else if (response.status === 'pending' || response.assessment?.status === 'pending') {
            // Show pending message
            setError(createStatusMessage('info', 
              <span>
                <span className="font-medium">Assessment pending review</span>
                <p className="text-sm mt-1">
                  Your assessment has been submitted and is waiting for supervisor review.
                </p>
              </span>
            ));
          }
        } else {
          // No existing assessment found, clear any error messages
          setError(null);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error checking existing assessment:", error);
        setError(createStatusMessage('error', "Failed to check assessment status. Please try again."));
        setLoading(false);
      }
    };
    
    checkExistingAssessment();
  }, [language, level, onComplete]);

  // Simplify the startTranscription function to be just a placeholder
  const startTranscription = () => {
    console.log("Transcription disabled for compatibility");
  };

  // Simplify the stopTranscription function
  const stopTranscription = () => {
    console.log("Transcription already disabled");
  };

  useEffect(() => {
    // Load tasks based on language and level
    const loadTasks = async () => {
      try {
        setLoading(true);
        const assessmentData = await CEFRService.getAssessmentData(level, language, 'speaking');
        if (assessmentData && assessmentData.tasks) {
          setTasks(assessmentData.tasks);
          // Initialize recordings array
          setRecordings(new Array(assessmentData.tasks.length).fill(null));
        } else {
          // Fallback to local data if service returns nothing
          const fallbackTasks = getTasksByLevelAndLanguage(level, language);
          setTasks(fallbackTasks);
          setRecordings(new Array(fallbackTasks.length).fill(null));
        }
        setLoading(false);
      } catch (error) {
        console.error("Error loading tasks:", error);
        // Fallback to local data on error
        const fallbackTasks = getTasksByLevelAndLanguage(level, language);
        setTasks(fallbackTasks);
        setRecordings(new Array(fallbackTasks.length).fill(null));
        setLoading(false);
      }
    };

    loadTasks();
  }, [level, language]);

  useEffect(() => {
    if (preparationTimeLeft === 0) {
      setIsPreparationMode(false);
    }
    
    if (preparationTimeLeft > 0) {
      const timer = setTimeout(() => setPreparationTimeLeft(preparationTimeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [preparationTimeLeft]);

  useEffect(() => {
    if (recordingTimeLeft === 0) {
      stopRecording();
    }
    
    if (recordingTimeLeft > 0) {
      const timer = setTimeout(() => setRecordingTimeLeft(recordingTimeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [recordingTimeLeft]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Add a new useEffect to handle video stream connection
  useEffect(() => {
    if (stream && audioRef.current) {
      audioRef.current.srcObject = stream;
      audioRef.current.onloadedmetadata = () => {
        audioRef.current.play().catch(e => {
          console.error("Error playing audio:", e);
          setError("Could not play audio stream. Please check your browser settings.");
        });
      };
    }
  }, [stream, audioRef]);

  // Add a new useEffect to handle video stream connection
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.muted = true; // Ensure video is muted to prevent echo
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play().catch(e => {
          console.error("Error playing video:", e);
          setError("Could not play video stream. Please check your browser settings.");
        });
      };
    }
  }, [stream, videoRef]);

  // Add a useEffect to ensure video display is working
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      console.log("Setting video stream to videoRef");
      
      // Add specific play handling for better browser compatibility
      videoRef.current.onloadedmetadata = () => {
        console.log("Video metadata loaded, attempting to play");
        // Using a promise to catch play errors
        const playPromise = videoRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Video playback started successfully");
              
              // Check if video is actually playing by examining its properties
              setTimeout(() => {
                if (videoRef.current) {
                  const isPlaying = !videoRef.current.paused && !videoRef.current.ended && videoRef.current.readyState > 2;
                  console.log("Video element status:", {
                    paused: videoRef.current.paused,
                    ended: videoRef.current.ended,
                    readyState: videoRef.current.readyState,
                    height: videoRef.current.videoHeight,
                    width: videoRef.current.videoWidth,
                    isPlaying
                  });
                  
                  // If there's no video height/width, there might be an issue with the stream
                  if (videoRef.current.videoHeight === 0 || videoRef.current.videoWidth === 0) {
                    console.warn("Video dimensions are zero, stream might not be properly connected");
                    // Try to restart the stream
                    startAudio().then(newStream => {
                      console.log("Auto-retried stream initialization:", !!newStream);
                    }).catch(err => {
                      console.error("Error during auto-retry:", err);
                    });
                  }
                }
              }, 1000);
            })
            .catch(error => {
              console.error("Error playing video:", error);
              setError(createStatusMessage('error', 
                <span>
                  <span className="font-medium">
                    {language === 'english' ? 'Video playback error' : 'Erreur de lecture vidéo'}
                  </span>
                  <p className="text-sm mt-1">
                    {language === 'english' ? 
                      'Your browser blocked automatic video playback. Please check your browser permissions.' : 
                      'Votre navigateur a bloqué la lecture automatique de la vidéo. Veuillez vérifier les autorisations de votre navigateur.'}
                  </p>
                </span>
              ));
            });
        }
      };
    }
  }, [stream, videoRef]);

  const getTasksByLevelAndLanguage = (level, language) => {
    // In a real app, these would come from a database
    
    const tasksByLevel = {
      'a1': [
        {
          id: 1,
          title: language === 'english' ? 'Self Introduction' : 'Présentation Personnelle',
          prompt: language === 'english' ? 
            'Introduce yourself. Talk about your name, age, where you live, your job or studies, and your hobbies.' : 
            'Présentez-vous. Parlez de votre nom, votre âge, où vous habitez, votre travail ou vos études, et vos loisirs.',
          preparationTime: 30, // seconds
          speakingTime: 60,
          criteria: [
            language === 'english' ? 'Basic Vocabulary' : 'Vocabulaire de Base', 
            language === 'english' ? 'Pronunciation' : 'Prononciation', 
            language === 'english' ? 'Fluency' : 'Aisance'
          ]
        }
      ],
      'a2': [
        {
          id: 1,
          title: language === 'english' ? 'Daily Activities' : 'Activités Quotidiennes',
          prompt: language === 'english' ? 
            'Describe your typical day and weekly routine. What do you do on weekdays and weekends?' : 
            'Décrivez votre journée typique et votre routine hebdomadaire. Que faites-vous en semaine et les week-ends?',
          preparationTime: 30,
          speakingTime: 90,
          criteria: [
            language === 'english' ? 'Time Expressions' : 'Expressions de Temps', 
            language === 'english' ? 'Present Tense Usage' : 'Utilisation du Présent', 
            language === 'english' ? 'Vocabulary Range' : 'Étendue du Vocabulaire',
            language === 'english' ? 'Coherence' : 'Cohérence'
          ]
        }
      ],
      'b1': [
        {
          id: 1,
          title: language === 'english' ? 'Past Experience' : 'Expérience Passée',
          prompt: language === 'english' ? 
            'Talk about a memorable trip or vacation you have taken. Where did you go? Who were you with? What did you do? Why was it memorable?' : 
            'Parlez d\'un voyage ou de vacances mémorables que vous avez pris. Où êtes-vous allé? Avec qui étiez-vous? Qu\'avez-vous fait? Pourquoi était-ce mémorable?',
          preparationTime: 60,
          speakingTime: 120,
          criteria: [
            language === 'english' ? 'Past Tense Narration' : 'Narration au Passé', 
            language === 'english' ? 'Descriptive Language' : 'Langage Descriptif', 
            language === 'english' ? 'Fluency' : 'Aisance',
            language === 'english' ? 'Pronunciation' : 'Prononciation'
          ]
        }
      ],
      'b2': [
        {
          id: 1,
          title: language === 'english' ? 'Problem and Solution' : 'Problème et Solution',
          prompt: language === 'english' ? 
            'Describe an environmental problem in your area or country and suggest some possible solutions. Explain why you think these solutions would be effective.' : 
            'Décrivez un problème environnemental dans votre région ou pays et suggérez quelques solutions possibles. Expliquez pourquoi vous pensez que ces solutions seraient efficaces.',
          preparationTime: 60,
          speakingTime: 150,
          criteria: [
            language === 'english' ? 'Vocabulary Precision' : 'Précision du Vocabulaire',
            language === 'english' ? 'Argumentation' : 'Argumentation', 
            language === 'english' ? 'Complex Structures' : 'Structures Complexes',
            language === 'english' ? 'Coherence and Cohesion' : 'Cohérence et Cohésion'
          ]
        }
      ],
      'c1': [
        {
          id: 1,
          title: language === 'english' ? 'Complex Topic Discussion' : 'Discussion de Sujet Complexe',
          prompt: language === 'english' ? 
            'Discuss the challenges of balancing technological progress with environmental sustainability. What are the key issues? What solutions might be effective?' : 
            'Discutez des défis de l\'équilibre entre le progrès technologique et la durabilité environnementale. Quels sont les problèmes clés? Quelles solutions pourraient être efficaces?',
          preparationTime: 90,
          speakingTime: 180,
          criteria: [
            language === 'english' ? 'Advanced Vocabulary' : 'Vocabulaire Avancé', 
            language === 'english' ? 'Complex Structures' : 'Structures Complexes', 
            language === 'english' ? 'Critical Analysis' : 'Analyse Critique',
            language === 'english' ? 'Fluency' : 'Aisance',
            language === 'english' ? 'Pronunciation' : 'Prononciation'
          ]
        }
      ],
      'c2': [
        {
          id: 1,
          title: language === 'english' ? 'Abstract Concept Analysis' : 'Analyse de Concept Abstrait',
          prompt: language === 'english' ? 
            'Discuss the concept of "freedom" in modern society. How is it defined? What are its limitations? How has the interpretation of freedom evolved over time?' : 
            'Discutez du concept de "liberté" dans la société moderne. Comment est-il défini? Quelles sont ses limites? Comment l\'interprétation de la liberté a-t-elle évolué au fil du temps?',
          preparationTime: 90,
          speakingTime: 240,
          criteria: [
            language === 'english' ? 'Sophisticated Vocabulary' : 'Vocabulaire Sophistiqué',
            language === 'english' ? 'Conceptual Thinking' : 'Pensée Conceptuelle',
            language === 'english' ? 'Nuanced Expression' : 'Expression Nuancée',
            language === 'english' ? 'Rhetorical Skill' : 'Compétence Rhétorique',
            language === 'english' ? 'Intellectual Depth' : 'Profondeur Intellectuelle'
          ]
        }
      ]
    };
    
    // If level not found, default to A1 or closest available
    const levelTasks = tasksByLevel[level.toLowerCase()] || tasksByLevel['a1'];
    
    // Create a deep copy to avoid state mutation issues
    return JSON.parse(JSON.stringify(levelTasks));
  };

  const startAudio = async () => {
    try {
      setAudioInitializing(true);
      setError(
        createStatusMessage('info', 
          <span>
            <span className="font-medium">
              {language === 'english' ? 'Requesting camera and microphone access' : 'Demande d\'accès à la caméra et au microphone'}
            </span>
            <p className="text-sm mt-1">
              {language === 'english' ? 
                'Please allow access to your camera and microphone when prompted by your browser. Look for permission dialog at the top of your browser window.' : 
                'Veuillez autoriser l\'accès à votre caméra et microphone lorsque votre navigateur vous le demande. Recherchez la boîte de dialogue d\'autorisation en haut de la fenêtre de votre navigateur.'}
            </p>
          </span>
        )
      );
      
      // First check if we already have a stream and clean it up
      if (stream) {
        console.log("Cleaning up existing stream before requesting new one");
        stream.getTracks().forEach(track => {
          console.log(`Stopping track: ${track.kind}, ID: ${track.id}, readyState: ${track.readyState}`);
          track.stop();
        });
        setStream(null);
        
        // Clear any existing MediaRecorder
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
          console.log("Stopping existing MediaRecorder before creating new one");
          mediaRecorder.stop();
        }
        setMediaRecorder(null);
        
        // Clear recorded chunks
        setRecordedChunks([]);
        
        // Add a delay to allow cleanup to complete
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      console.log("Requesting camera and microphone permissions...");
      
      // Check if navigator.mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Your browser doesn't support camera and microphone access. Please try a different browser like Chrome or Edge.");
      }
      
      // Try a simpler request first with video only (many webcam issues come from audio constraints)
      try {
        console.log("First trying with basic video constraints...");
        const videoOnlyStream = await navigator.mediaDevices.getUserMedia({ 
          video: true 
        });
        
        console.log("Successfully got video stream, now adding audio...");
        console.log("Video tracks in test stream:", videoOnlyStream.getVideoTracks().length);
        
        // Log track details for debugging
        videoOnlyStream.getVideoTracks().forEach(track => {
          console.log(`Test track kind: ${track.kind}, ID: ${track.id}, ready state: ${track.readyState}`);
        });
        
        // Stop this temporary stream
        videoOnlyStream.getTracks().forEach(track => track.stop());
        
        // Now try with both video and audio with specific constraints
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            // Add these to prevent echo
            echoCancellationType: 'system',
            suppressLocalAudioPlayback: true
          },
          video: {
            width: { ideal: 640 }, // Reduced from 1280 for better compatibility
            height: { ideal: 480 }, // Reduced from 720 for better compatibility
            facingMode: "user"
          }
        });
        
        console.log("Media permissions granted successfully");
        console.log("Audio tracks:", mediaStream.getAudioTracks().length);
        console.log("Video tracks:", mediaStream.getVideoTracks().length);
        
        // Verify we have both audio and video tracks
        if (mediaStream.getVideoTracks().length === 0) {
          console.warn("No video tracks found in the media stream");
          setError(
            createStatusMessage('warning', 
              <span>
                <span className="font-medium">
                  {language === 'english' ? 'Camera access is limited' : 'L\'accès à la caméra est limité'}
                </span>
                <p className="text-sm mt-1">
                  {language === 'english' ? 
                    'Your camera could not be accessed properly. You can still record audio, but video might not be available.' : 
                    'Votre caméra n\'a pas pu être accessible correctement. Vous pouvez toujours enregistrer l\'audio, mais la vidéo pourrait ne pas être disponible.'}
                </p>
              </span>
            )
          );
        }
        
        // Log track details for debugging
        mediaStream.getTracks().forEach(track => {
          console.log(`Track kind: ${track.kind}, ID: ${track.id}, enabled: ${track.enabled}, ready state: ${track.readyState}, settings:`, track.getSettings());
          
          // Add event listeners to track for better debugging
          track.onended = () => console.log(`Track ${track.kind} ended`);
          track.onmute = () => console.log(`Track ${track.kind} muted`);
          track.onunmute = () => console.log(`Track ${track.kind} unmuted`);
        });
        
        setStream(mediaStream);
        setAudioInitialized(true);
        setAudioInitializing(false);
        
        // Display success message
        setError(
          createStatusMessage('success', 
            <span>
              {language === 'english' ? 
                'Camera and microphone connected successfully! You can now start recording.' : 
                'Caméra et microphone connectés avec succès! Vous pouvez maintenant commencer l\'enregistrement.'}
            </span>
          )
        );
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setError(null);
        }, 3000);
        
        return mediaStream;
      } catch (err) {
        console.error("Error with optimized media request, trying fallback approach:", err);
        
        // Fallback to a simpler approach
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }, 
            video: true 
          });
          
          console.log("Fallback media approach succeeded");
          setStream(fallbackStream);
          setAudioInitialized(true);
          setAudioInitializing(false);
          
          // Display success message
          setError(
            createStatusMessage('success', 
              <span>
                {language === 'english' ? 
                  'Camera and microphone connected with basic settings! You can now start recording.' : 
                  'Caméra et microphone connectés avec des paramètres de base! Vous pouvez maintenant commencer l\'enregistrement.'}
              </span>
            )
          );
          
          setTimeout(() => {
            setError(null);
          }, 3000);
          
          return fallbackStream;
        } catch (fallbackErr) {
          console.error("Fallback approach also failed:", fallbackErr);
          throw fallbackErr; // Rethrow to be caught by the outer catch
        }
      }
    } catch (err) {
      console.error("Error accessing microphone or camera:", err);
      
      // Show more specific error messages based on the error type
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError(
          createStatusMessage('error', 
            <span>
              <span className="font-medium">
                {language === 'english' ? 'Permission denied' : 'Permission refusée'}
              </span>
              <p className="text-sm mt-1">
                {language === 'english' ? 
                  'You need to allow camera and microphone access to record. Please check your browser settings and try again.' : 
                  'Vous devez autoriser l\'accès à la caméra et au microphone pour enregistrer. Veuillez vérifier les paramètres de votre navigateur et réessayer.'}
              </p>
              <p className="text-xs mt-2 text-gray-500">
                Try clicking the camera icon in your browser's address bar and set permissions to "Allow".
              </p>
            </span>
          )
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError(
          createStatusMessage('error', 
            <span>
              <span className="font-medium">
                {language === 'english' ? 'No camera or microphone found' : 'Aucune caméra ou microphone trouvé'}
              </span>
              <p className="text-sm mt-1">
                {language === 'english' ? 
                  'Please check that your device has a working camera and microphone connected.' : 
                  'Veuillez vérifier que votre appareil dispose d\'une caméra et d\'un microphone fonctionnels connectés.'}
              </p>
            </span>
          )
        );
      } else {
        setError(
          createStatusMessage('error', 
            <span>
              <span className="font-medium">
                {language === 'english' ? 'Could not access camera or microphone' : 'Impossible d\'accéder à la caméra ou au microphone'}
              </span>
              <p className="text-sm mt-1">
                {language === 'english' ? 
                  'There was a problem accessing your devices. Error: ' + err.message : 
                  'Un problème est survenu lors de l\'accès à vos appareils. Erreur: ' + err.message}
              </p>
            </span>
          )
        );
      }
      
      setAudioInitializing(false);
      return null;
    }
  };

  // Check audio status
  const checkAudioStatus = () => {
    return !!stream;
  };

  // Completely rebuilt recording system
  const startRecording = async () => {
    try {
      // Show loading state
      setIsRecording(false);
      setError(createStatusMessage('info', "Initializing camera and microphone..."));
      
      // Clear any previous recording data
      setRecordedChunks([]);
      
      // Make sure we're not in preparation mode
      if (isPreparationMode) {
        setIsPreparationMode(false);
        setPreparationTimeLeft(null);
      }
      
      // Ensure we have a clean stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      
      // Get fresh camera and microphone access
      console.log("Requesting fresh camera and microphone access");
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        }
      });
      
      // Set the stream to the video element
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.muted = true; // Ensure video is muted to prevent echo
        await videoRef.current.play().catch(e => console.warn("Could not auto-play video:", e));
      }
      
      // Store the stream
      setStream(mediaStream);
      setAudioInitialized(true);
      
      // Wait to ensure camera is ready
      console.log("Waiting for camera to initialize fully...");
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Determine supported format
      let mimeType = 'video/webm';
      if (MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = 'video/mp4';
      }
      
      console.log(`Using mime type: ${mimeType}`);
      
      // Create a new MediaRecorder with the stream
      const recorder = new MediaRecorder(mediaStream, {
        mimeType: mimeType,
        videoBitsPerSecond: 1200000,
        audioBitsPerSecond: 128000
      });
      
      // Set up data handling
      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          console.log(`Got data chunk: ${e.data.size} bytes`);
          chunks.push(e.data);
        }
      };
      
      // Set up completion handling
      recorder.onstop = () => {
        console.log(`Recording stopped with ${chunks.length} chunks`);
        
        if (chunks.length === 0) {
          setError(createStatusMessage('error', "No video data was captured. Please try again."));
          return;
        }
        
        try {
          // Create a blob from the chunks
          const blob = new Blob(chunks, { type: mimeType });
          console.log(`Created blob of size ${blob.size}`);
          
          if (blob.size < 1000) {
            setError(createStatusMessage('error', "Recording too small. Please try again."));
            return;
          }
          
          // Create a URL for the blob
          const url = URL.createObjectURL(blob);
          
          // Store the recording
          const newRecordings = [...recordings];
          newRecordings[currentTask] = url;
          setRecordings(newRecordings);
          
          // Show success message
          setError(createStatusMessage('success', "Recording completed successfully!"));
          
          // Clear success message after 3 seconds
          setTimeout(() => setError(null), 3000);
        } catch (error) {
          console.error("Error processing recording:", error);
          setError(createStatusMessage('error', "Failed to process recording. Please try again."));
        }
      };
      
      // Start recording with frequent data requests
      recorder.start(200);
      setMediaRecorder(recorder);
      
      // Show recording status
      setIsRecording(true);
      setRecordingTimeLeft(tasks[currentTask].speakingTime);
      
      setError(
        createStatusMessage('info', 
          <span>
            <span className="font-semibold">Recording in progress</span>
            <p className="text-sm mt-1">Speak clearly while looking at the camera</p>
          </span>,
          <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
        )
      );
      
    } catch (error) {
      console.error("Error starting recording:", error);
      setError(createStatusMessage('error', `Could not start recording: ${error.message}`));
    }
  };

  // Simplified stop recording function
  const stopRecording = () => {
    if (!mediaRecorder || mediaRecorder.state !== "recording") {
      console.warn("No active recording to stop");
      return;
    }
    
    try {
      // Show processing message
      setError(createStatusMessage('info', "Processing recording..."));
      
      // Update recording state
      setIsRecording(false);
      setRecordingTimeLeft(null);
      
      // Stop the recorder
      mediaRecorder.stop();
      
      // Request final data if possible
      if (typeof mediaRecorder.requestData === 'function') {
        try {
          mediaRecorder.requestData();
        } catch (e) {
          console.warn("Error requesting final data:", e);
        }
      }
      
      // Stop all tracks to release microphone and camera
      if (stream) {
        console.log("Stopping all media tracks after recording");
        stream.getTracks().forEach(track => {
          console.log(`Stopping track: ${track.kind}, ID: ${track.id}`);
          track.stop();
        });
        
        // Clear the stream reference
        setStream(null);
        setMediaRecorder(null);
      }
      
      console.log("Recording stopped successfully");
    } catch (error) {
      console.error("Error stopping recording:", error);
      setError(createStatusMessage('error', "Error stopping recording. Please try again."));
    }
  };
  
  // Simplified preparation mode
  const startPreparation = async () => {
    try {
      // Reset any existing recordings
      const newRecordings = [...recordings];
      newRecordings[currentTask] = null;
      setRecordings(newRecordings);
      
      // Initialize camera for preview
      if (!stream) {
        setError(createStatusMessage('info', "Initializing camera for preview..."));
        
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user"
          }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play().catch(e => console.warn("Could not auto-play video:", e));
        }
        
        setStream(mediaStream);
        setAudioInitialized(true);
      }
      
      // Start preparation mode
      setIsPreparationMode(true);
      setPreparationTimeLeft(tasks[currentTask].preparationTime);
      
    } catch (error) {
      console.error("Error starting preparation:", error);
      setError(createStatusMessage('error', `Could not start preparation: ${error.message}`));
    }
  };
  
  // Simplified preparation skip
  const skipPreparation = () => {
    setIsPreparationMode(false);
    setPreparationTimeLeft(null);
  };

  const handleNextTask = () => {
    if (currentTask < tasks.length - 1) {
      // Stop any ongoing recording
      if (isRecording) {
        stopRecording();
      }
      
      // Stop audio if moving to next task
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      
      // Reset states for next task
      setIsPreparationMode(false);
      setPreparationTimeLeft(null);
      setRecordingTimeLeft(null);
      setCurrentTask(currentTask + 1);
    }
  };

  const handlePreviousTask = () => {
    if (currentTask > 0) {
      // Stop any ongoing recording
      if (isRecording) {
        stopRecording();
      }
      
      // Stop audio if moving to previous task
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      
      // Reset states for previous task
      setIsPreparationMode(false);
      setPreparationTimeLeft(null);
      setRecordingTimeLeft(null);
      setCurrentTask(currentTask - 1);
    }
  };

  const redoRecording = () => {
    // Clear the current recording
    const newRecordings = [...recordings];
    newRecordings[currentTask] = null;
    setRecordings(newRecordings);
    
    // Stop audio if it's running
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    // Reset states
    setIsPreparationMode(false);
    setPreparationTimeLeft(null);
    setRecordingTimeLeft(null);
    setIsRecording(false);
    setMediaRecorder(null);
    setAudioInitialized(false);
    
    // Clear any blob URLs to prevent memory leaks
    if (recordings[currentTask]) {
      URL.revokeObjectURL(recordings[currentTask]);
    }
  };

  // Modified handleSubmit function to properly save to database
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(createStatusMessage('info', 'Preparing submission...'));
      
      // Check if any recordings are missing
      const missingRecordings = recordings.includes(null);
      if (missingRecordings) {
        setError(createStatusMessage('error', "Please complete all recording tasks before submitting."));
        setSubmitting(false);
        return;
      }
      
      // Make sure to release any remaining media resources
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      
      // Check if user has a valid token
      const token = localStorage.getItem('token');
      if (!token) {
        setError(createStatusMessage('error', 
          <span>
            <span className="font-medium">Authentication Required</span>
            <p className="text-sm mt-1">
              You need to be logged in to submit assessments. Please log in and try again.
            </p>
          </span>
        ));
        setSubmitting(false);
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          navigate('/login', { state: { from: '/assessment/communication' } });
        }, 3000);
        
      return;
    }

      // Get user ID from localStorage
      const userId = localStorage.getItem('userId') || 
                     sessionStorage.getItem('userId') || 
                     JSON.parse(localStorage.getItem('userData') || '{}')?.userId ||
                     JSON.parse(localStorage.getItem('userData') || '{}')?.UserID ||
                     localStorage.getItem('UserID');
      
      if (!userId) {
        setError(createStatusMessage('error', "User ID not found. Please log in again."));
        setSubmitting(false);
      return;
    }

      // Step 1: Convert blob URL to File
      setError(createStatusMessage('info', 'Processing recording...'));
      const recordingUrl = recordings[0]; // Use the first recording
      
      try {
        // Convert blob URL to File
        const videoFile = await cloudinaryService.blobUrlToFile(
          recordingUrl,
          `speaking_assessment_${Date.now()}.webm`
        );
        
        if (!videoFile) {
          throw new Error("Failed to process video file");
        }
        
        console.log("Video file created:", videoFile.name, videoFile.size, videoFile.type);
        
        // Step 2: Upload to Cloudinary
        setError(createStatusMessage('info', 'Uploading to cloud storage...'));
        const cloudinaryResponse = await cloudinaryService.uploadVideo(videoFile, {
          language,
          level,
          taskId: '1',
          userId
        });
        
        if (!cloudinaryResponse || !cloudinaryResponse.success) {
          throw new Error(cloudinaryResponse?.message || "Failed to upload video");
        }
        
        console.log("Cloudinary upload successful:", cloudinaryResponse.videoUrl);
        
        // Step 3: Submit assessment with Cloudinary URL
        setError(createStatusMessage('info', 'Submitting assessment...'));
        
        // Prepare task data
        const currentTaskData = tasks[currentTask];
        const taskData = {
          question: currentTaskData?.question || 'Speaking assessment task',
          transcribedText: 'The transcript will be processed by the supervisor.',
          userId,
          language,
          level,
          taskId: 1,
          videoUrl: cloudinaryResponse.videoUrl,
          publicId: cloudinaryResponse.publicId
        };
        
        // Submit assessment
        const response = await AssessmentService.submitAssessment({
          type: 'speaking',
          data: taskData
        });
        
        if (!response || !response.success) {
          throw new Error(response?.message || "Failed to submit assessment");
        }
        
        console.log("Assessment submitted successfully:", response);
        
        // Prepare results for display
        const results = {
          type: 'speaking',
          taskResults: [{
            taskId: 1,
            recording: cloudinaryResponse.videoUrl,
            transcribedText: taskData.transcribedText
          }],
          assessmentId: response.assessmentId || response._id,
          status: 'pending',
          pendingReview: true,
          feedback: response.assessment?.feedback || "Your assessment has been submitted for review.",
          score: response.assessment?.score || 0,
          supervisorFeedback: response.assessment?.supervisorFeedback,
          supervisorScore: response.assessment?.supervisorScore,
          cefr: {
            language: language === 'english' ? 'English' : 'Français',
            level,
            description: level === 'a1' ? 'Beginner' : 
                      level === 'a2' ? 'Elementary' : 
                      level === 'b1' ? 'Intermediate' : 
                      level === 'b2' ? 'Upper Intermediate' : 
                      level === 'c1' ? 'Advanced' : 'Proficient'
          }
        };
        
        // Show success message
        setError(createStatusMessage('success', 
                <span>
            <span className="font-semibold">Assessment submitted successfully!</span>
            <p className="text-sm mt-1">
              Your speaking assessment has been submitted and will be reviewed by a supervisor.
            </p>
                </span>
        ));
        
        // Complete the assessment
        onComplete(results);
        
      } catch (error) {
        console.error("Error in assessment submission:", error);
        
        // Show error message
        setError(createStatusMessage('error', 
          <span>
            <span className="font-medium">Submission failed</span>
            <p className="text-sm mt-1">{error.message || "An error occurred during submission."}</p>
          </span>
        ));
        
        // Wait a moment to show the error
            await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Fall back to mock results
        const mockResults = {
          type: 'speaking',
          isMockData: true,
          aiModel: 'Mock Data (API Unavailable)',
          score: 75,
          feedback: "This is a mock assessment since the API service is currently unavailable. Your actual performance hasn't been evaluated.",
          recommendations: [
            "Practice speaking regularly with native speakers",
            "Record yourself and listen for areas to improve",
            "Work on pronunciation of difficult sounds"
          ],
          status: 'pending',
          pendingReview: true,
            cefr: {
              language: language === 'english' ? 'English' : 'Français',
            level,
            description: level === 'a1' ? 'Beginner' : 
                      level === 'a2' ? 'Elementary' : 
                      level === 'b1' ? 'Intermediate' : 
                      level === 'b2' ? 'Upper Intermediate' : 
                      level === 'c1' ? 'Advanced' : 'Proficient'
          }
        };
        
        // Show fallback message
        setError(createStatusMessage('info', 
              <span>
            <span className="font-medium">Using local assessment</span>
            <p className="text-sm mt-1">
              Due to connection issues, we're using a local assessment. Your recording was not saved.
            </p>
              </span>
        ));
        
        // Complete with mock results
        onComplete(mockResults);
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setError(createStatusMessage('error', 
        <span>
          <span className="font-medium">An error occurred</span>
          <p className="text-sm mt-1">{error.message || "Unknown error during submission."}</p>
        </span>
      ));
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#592538] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading speaking assessment...</p>
        </div>
      </div>
    );
  }

  // Show cooldown message when the user can't retake the assessment yet
  if (!canRetake && retakeAvailableDate) {
    // Parse supervisor feedback if it's a JSON string
    let parsedSupervisorFeedback = null;
    let supervisorFeedbackText = existingAssessment?.supervisorFeedback;
    let supervisorScore = existingAssessment?.supervisorScore;
    let supervisorCriteria = [];
    
    // Try to parse supervisor feedback if it exists and is a string
    if (existingAssessment?.supervisorFeedback && typeof existingAssessment.supervisorFeedback === 'string') {
      try {
        parsedSupervisorFeedback = JSON.parse(existingAssessment.supervisorFeedback);
        supervisorFeedbackText = parsedSupervisorFeedback.overallFeedback || existingAssessment.supervisorFeedback;
        
        // Extract criteria if available
        if (parsedSupervisorFeedback.criteria && Array.isArray(parsedSupervisorFeedback.criteria)) {
          supervisorCriteria = parsedSupervisorFeedback.criteria;
        }
        
        console.log('Parsed supervisor feedback:', parsedSupervisorFeedback);
      } catch (error) {
        console.error('Error parsing supervisor feedback:', error);
      }
    }
    
    // Log the existing assessment data for debugging
    console.log('Existing assessment data:', existingAssessment);
    
    // Calculate the score to display - use supervisorScore if available, otherwise use the regular score
    const scoreToDisplay = supervisorScore !== undefined && supervisorScore !== null ? 
      (supervisorScore > 10 ? supervisorScore : Math.round(supervisorScore * 11.1)) : 
      (existingAssessment?.score || 0);
    
    console.log('Score to display:', scoreToDisplay, 'Supervisor score:', supervisorScore);
    
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center py-8">
          <div className="text-amber-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#592538] mb-4">Assessment Cooldown Period</h2>
          <p className="text-gray-600 mb-6">
            You've recently taken this assessment. To ensure accurate progress tracking, 
            you can take this assessment again after <span className="font-semibold">{retakeAvailableDate.toLocaleDateString()}</span>.
          </p>
          
          {existingAssessment && (
            <div className="border border-gray-200 rounded-lg p-4 mb-6 mx-auto text-left">
              {/* Overall Supervisor Feedback */}
              {supervisorFeedbackText && (
                <div className="mt-0 mb-4">
                  <div className="font-medium text-[#592538]">Supervisor Feedback:</div>
                  <p className="italic text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 mt-1">
                    {supervisorFeedbackText}
                  </p>
                </div>
              )}
              
              {/* Detailed Criteria Feedback */}
              {supervisorCriteria && supervisorCriteria.length > 0 && (
                <div className="mt-4">
                  <div className="font-medium text-[#592538] mb-2">Detailed Criteria Feedback:</div>
                  <div className="space-y-3">
                    {supervisorCriteria.map((criterion, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-gray-700">{criterion.name}</span>
                          <span className="px-2 py-1 bg-[#592538]/10 text-[#592538] rounded-full text-xs font-bold">
                            {criterion.score}/{criterion.maxScore || 20}
                          </span>
                        </div>
                        
                        {/* Score Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                          <div 
                            className="h-1.5 rounded-full bg-[#592538]" 
                            style={{ 
                              width: `${(criterion.score / (criterion.maxScore || 20)) * 100}%`, 
                              transition: 'width 1s ease-out' 
                            }}
                          ></div>
                        </div>
                        
                        {criterion.feedback && (
                          <p className="text-sm text-gray-600 mt-1">{criterion.feedback}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Raw score display if available */}
              {parsedSupervisorFeedback?.rawScore && (
                <div className="mt-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Total Score</span>
                    <span className="px-2 py-1 bg-[#592538]/10 text-[#592538] rounded-full text-xs font-bold">
                      {parsedSupervisorFeedback.rawScore}/100
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Normalized to {parsedSupervisorFeedback.normalizedScore || supervisorScore}/9 for CEFR standards
                  </div>
                </div>
              )}
            </div>
          )}
          
          <button 
            onClick={onBack}
            className="px-4 py-2 bg-[#592538] text-white rounded-lg hover:bg-[#6d2c44]"
          >
            Return to Assessments
          </button>
        </div>
      </div>
    );
  }

  // Show pending review message when the assessment is waiting for supervisor evaluation
  if (assessmentStatus === 'pending') {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center py-8">
          <div className="text-blue-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#592538] mb-4">Assessment Pending Review</h2>
          <p className="text-gray-600 mb-6">
            Your speaking assessment has been submitted and is waiting for supervisor review.
            You'll be notified once it's evaluated.
          </p>
          
          {existingAssessment && existingAssessment.videoUrl && (
            <div className="mb-6 max-w-md mx-auto">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Your Submission</h3>
              <video 
                className="w-full rounded-lg border border-gray-200" 
                src={existingAssessment.videoUrl} 
                controls
              />
            </div>
          )}
          
          <button 
            onClick={onBack}
            className="px-4 py-2 bg-[#592538] text-white rounded-lg hover:bg-[#6d2c44]"
          >
            Return to Assessments
          </button>
        </div>
      </div>
    );
  }

  // Return statement for the SpeakingAssessment component
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-2xl font-bold text-[#592538] flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-[#592538]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            {language === 'english' ? 'Speaking Assessment' : 'Évaluation Orale'} - {level.toUpperCase()}
          </h2>
          <div className="flex items-center space-x-3">
            {(preparationTimeLeft !== null || recordingTimeLeft !== null) && (
              <div className="px-4 py-1.5 bg-gray-100 rounded-full text-gray-700 flex items-center shadow-sm">
                {isPreparationMode ? 
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg> :
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                }
                <span className="text-sm font-medium">
                  {isPreparationMode ? 
                    `${language === 'english' ? 'Preparation' : 'Préparation'}: ${formatTime(preparationTimeLeft)}` : 
                    `${language === 'english' ? 'Recording' : 'Enregistrement'}: ${formatTime(recordingTimeLeft)}`
                  }
                </span>
              </div>
            )}
            <div className="flex items-center bg-[#592538]/10 px-4 py-1.5 rounded-full">
              <span className="text-sm font-semibold text-[#592538]">{language === 'english' ? 'Task' : 'Tâche'} {currentTask + 1}/{tasks.length}</span>
          </div>
        </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div className="bg-[#592538] h-2.5 rounded-full transition-all duration-300" style={{ width: `${((currentTask) / tasks.length) * 100}%` }}></div>
        </div>
      </div>

      {/* Task container */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          {/* Task header */}
          <div className="bg-gradient-to-r from-[#592538] to-[#7b2f4a] px-6 py-4">
            <h3 className="text-xl font-bold text-white">{tasks[currentTask].title}</h3>
        </div>
        
          {/* Task content */}
          <div className="p-6">
            <div className="bg-gray-50 p-5 rounded-lg mb-6 border border-gray-100">
              <p className="text-gray-700 text-lg leading-relaxed">{tasks[currentTask].prompt}</p>
            </div>
            
            {/* Task readiness UI */}
        {!audioInitialized && !isPreparationMode && !isRecording && !recordings[currentTask] && (
              <div className="bg-gray-900 text-white rounded-xl p-8 mb-6 flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-gradient-to-r from-[#592538] to-[#7b2f4a] rounded-full flex items-center justify-center mb-5 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
                <h4 className="text-2xl font-semibold mb-3">{language === 'english' ? 'Ready to begin' : 'Prêt à commencer'}</h4>
                <p className="text-center text-gray-400 mb-8 max-w-lg">
              {language === 'english' ? 
                    'You can start with preparation time to organize your thoughts, or skip directly to recording your response.' : 
                    'Vous pouvez commencer par le temps de préparation pour organiser vos idées, ou passer directement à l\'enregistrement de votre réponse.'
              }
            </p>
            
                <div className="flex gap-5">
              <button
                onClick={startPreparation}
                    className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg flex items-center shadow-md transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {language === 'english' ? 'Prepare First' : 'Préparer'}
              </button>
              
              {!audioInitialized && !isRecording && !isPreparationMode && (
                <button
                  onClick={startAudio}
                  disabled={audioInitializing}
                      className={`px-6 py-3 ${
                        audioInitializing ? 'bg-gray-500' : 'bg-[#592538] hover:bg-[#7b2f4a]'
                      } text-white rounded-lg flex items-center shadow-md transition-all`}
                >
                  {audioInitializing ? (
                    <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {language === 'english' ? 'Initializing...' : 'Initialisation...'}
                    </>
                  ) : (
                    <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                          {language === 'english' ? 'Enable Camera & Mic' : 'Activer Caméra & Micro'}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

            {/* Video preview */}
            {(stream || recordings[currentTask]) && (
              <div className="mb-6">
                <div className="rounded-xl overflow-hidden border border-gray-200 shadow-lg bg-gray-900">
                  <div className="relative aspect-video">
                    {/* Live video preview when streaming */}
                    {stream && !recordings[currentTask] && (
                      <video 
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        muted={true} // Always mute to prevent echo
                        autoPlay
                        playsInline
                      />
                    )}
                    
                    {/* Recording playback */}
                    {recordings[currentTask] && (
                      <video 
                        className="w-full h-full object-cover"
                        src={recordings[currentTask]} 
                        controls 
                      />
                    )}
                    
                    {/* Countdown overlay */}
                    {countdown && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
                        <div className="text-center">
                          <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mx-auto">
                            <span className="text-5xl font-bold text-white">{countdown}</span>
          </div>
                          <p className="text-white mt-4 text-lg">
                            {language === 'english' ? 'Get ready...' : 'Préparez-vous...'}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Recording indicator - Make it more visible */}
                    {isRecording && (
                      <div className="absolute top-4 right-4 flex items-center bg-red-600 text-white px-3 py-2 rounded-full shadow-lg animate-pulse">
                        <span className="w-3 h-3 bg-white rounded-full mr-2"></span>
                        <span className="font-medium">{language === 'english' ? 'RECORDING' : 'ENREGISTREMENT'}</span>
                      </div>
                    )}
                    
                    {/* Top status bar */}
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4 flex justify-between items-center">
                      <div className="flex items-center">
                        <h4 className="text-white font-medium text-lg">
                          {isRecording ? 
                            (language === 'english' ? 'Recording in progress...' : 'Enregistrement en cours...') : 
                            (recordings[currentTask] ? 
                              (language === 'english' ? 'Your Recording' : 'Votre Enregistrement') : 
                              (language === 'english' ? 'Camera Preview' : 'Aperçu de la caméra'))
                          }
                        </h4>
                      </div>
                      
                      {/* Timer display */}
            {isRecording && (
                        <div className="bg-white/20 text-white px-3 py-1 rounded-md flex items-center text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium">{formatTime(recordingTimeLeft)}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Audio element for recording handling - hidden */}
                    <audio ref={audioRef} className="hidden" muted={true} />
                    
                    {/* Bottom gradient with info when recording or recorded */}
                    {(isRecording || recordings[currentTask]) && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 flex justify-between items-center">
                        {isRecording ? (
                          <div className="flex items-center">
                            <span className="text-white text-sm">
                              {language === 'english' ? 'Speak clearly' : 'Parlez clairement'}
                            </span>
                          </div>
                        ) : (
                          <div className="text-white text-sm opacity-80">
                            {language === 'english' ? 'Recording completed' : 'Enregistrement terminé'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Recording controls under the video - Simplify and make more prominent */}
                <div className="flex justify-center mt-4">
                  {isRecording ? (
              <button
                onClick={stopRecording}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-lg font-semibold rounded-xl flex items-center shadow-lg transition-all"
              >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                      {language === 'english' ? 'STOP RECORDING' : 'ARRÊTER L\'ENREGISTREMENT'}
              </button>
                  ) : (
                    !recordings[currentTask] && (
                      <button
                        onClick={audioInitialized ? startRecording : startAudio}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-lg font-semibold rounded-xl flex items-center shadow-lg transition-all"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        {audioInitialized ? 
                          (language === 'english' ? 'START RECORDING' : 'COMMENCER L\'ENREGISTREMENT') :
                          (language === 'english' ? 'ENABLE CAMERA & MIC' : 'ACTIVER CAMÉRA & MICRO')
                        }
                      </button>
                    )
                  )}
                  
                  {recordings[currentTask] && !isRecording && (
                    <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                        className={`px-6 py-3 ${
                  submitting ? 'bg-gray-400' : 'bg-[#592538] hover:bg-[#6d2c44]'
                        } text-white text-lg font-semibold rounded-xl flex items-center shadow-lg transition-all`}
              >
                {submitting ? (
                  <>
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                            {language === 'english' ? 'Submitting...' : 'Soumission...'}
                  </>
                ) : (
                  <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {language === 'english' ? 'Submit Assessment' : 'Soumettre l\'Évaluation'}
                  </>
                )}
              </button>
            
              <button
                onClick={redoRecording}
                        className="px-6 py-3 bg-gray-700 hover:bg-gray-800 text-white text-lg font-semibold rounded-xl flex items-center shadow-lg transition-all"
              >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                        {language === 'english' ? 'Record Again' : 'Refaire'}
              </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Display recording info when complete */}
            {!isRecording && transcribedText && recordings[currentTask] && (
              <div className="mb-5 bg-white p-5 rounded-xl border border-gray-200 shadow-md">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-800">
                      {language === 'english' ? 'Recording Complete' : 'Enregistrement Terminé'}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {language === 'english' ? 'Your recording is ready to submit' : 'Votre enregistrement est prêt à être soumis'}
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-gray-700">
                    {language === 'english' 
                      ? 'Your recording has been captured successfully. You can review it by playing the video above. When ready, click "Submit Assessment" to have your speaking skills evaluated.' 
                      : 'Votre enregistrement a été capturé avec succès. Vous pouvez le revoir en lisant la vidéo ci-dessus. Lorsque vous êtes prêt, cliquez sur "Soumettre l\'Évaluation" pour faire évaluer vos compétences orales.'}
                  </p>
                </div>
              </div>
            )}
            
            {/* Error/Status display */}
            {error && (
              <div className="mb-5">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preparation mode UI */}
      {isPreparationMode && (
        <div className="mb-6 bg-white p-6 rounded-xl border border-yellow-200 shadow-md mt-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-800">
                {language === 'english' ? 'Preparation Time' : 'Temps de Préparation'}
              </h4>
              <p className="text-gray-600">
                {language === 'english' ? 'Use this time to organize your thoughts' : 'Utilisez ce temps pour organiser vos idées'}
              </p>
            </div>
            <div className="ml-auto">
              <div className="text-2xl font-bold text-yellow-600 bg-yellow-100 px-4 py-2 rounded-lg">
                {formatTime(preparationTimeLeft)}
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-5 rounded-lg mb-4 border border-yellow-100">
            <h5 className="font-medium text-yellow-800 mb-2">
              {language === 'english' ? 'Preparation Tips:' : 'Conseils de Préparation:'}
            </h5>
            <ul className="list-disc pl-5 space-y-2 text-yellow-700">
              <li>{language === 'english' ? 'Think about the main points you want to cover' : 'Réfléchissez aux points principaux que vous voulez aborder'}</li>
              <li>{language === 'english' ? 'Consider structure: introduction, main content, conclusion' : 'Considérez la structure : introduction, contenu principal, conclusion'}</li>
              <li>{language === 'english' ? 'Recall specific examples or experiences to share' : 'Rappelez-vous des exemples ou expériences spécifiques à partager'}</li>
            </ul>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={skipPreparation}
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg flex items-center shadow-md transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {language === 'english' ? 'Ready to Record' : 'Prêt à Enregistrer'}
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-3 justify-between mt-8">
        {/* Left buttons */}
        <div className="flex gap-2">
          <button 
            onClick={onBack} 
            className="px-5 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center shadow-sm transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {language === 'english' ? 'Exit Assessment' : 'Quitter l\'Évaluation'}
          </button>
          
          {currentTask > 0 && (
            <button 
              onClick={handlePreviousTask} 
              className="px-5 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center shadow-sm transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {language === 'english' ? 'Previous Task' : 'Tâche Précédente'}
            </button>
            )}
          </div>
          
          {/* Right buttons */}
          <div>
            {currentTask < tasks.length - 1 && (
              <button 
                onClick={handleNextTask} 
              className="px-5 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center shadow-sm transition-all"
              >
                {language === 'english' ? 'Next Task' : 'Tâche Suivante'}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              </button>
            )}
        </div>
      </div>

      {/* Assessment criteria */}
      <div className="mt-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-gray-700 to-gray-900 px-6 py-4">
            <h4 className="text-lg font-bold text-white flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {language === 'english' ? 'Assessment Criteria' : 'Critères d\'Évaluation'}
            </h4>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks[currentTask].criteria.map((criterion, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-[#592538] font-semibold">{index + 1}</span>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-100 flex-grow">
                    <p className="text-gray-700">{criterion}</p>
                  </div>
                </div>
              ))}
        </div>
            <p className="text-sm text-gray-500 mt-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {language === 'english' 
                ? 'Your speaking will be evaluated based on these criteria.' 
                : 'Votre expression orale sera évaluée selon ces critères.'}
            </p>
      </div>
        </div>
      </div>

      {/* Debug controls in development mode */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 bg-gray-800 text-white rounded-lg">
          <h4 className="text-sm font-bold mb-2 flex items-center">
            <span className="bg-yellow-500 text-black text-xs px-2 py-0.5 rounded mr-2">DEV</span>
            Debug Controls
          </h4>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => {
                console.log("Stream status:", !!stream);
                console.log("Video element:", videoRef.current);
                console.log("Audio initialized:", audioInitialized);
                console.log("Is recording:", isRecording);
                console.log("Has recording:", !!recordings[currentTask]);
                if (stream) {
                  console.log("Audio tracks:", stream.getAudioTracks().length);
                  console.log("Video tracks:", stream.getVideoTracks().length);
                  console.log("Active tracks:", stream.getTracks().filter(t => t.readyState === 'live').length);
                }
                setError(createStatusMessage('info', 
                  <span>
                    <span className="font-medium">Debug info logged to console</span>
                    <p className="text-sm mt-1">Check browser console (F12) for details</p>
                  </span>
                ));
              }}
              className="px-2 py-1 bg-blue-700 hover:bg-blue-600 rounded text-xs"
            >
              Check Status
            </button>
            
            <button 
              onClick={() => {
                if (stream) {
                  stream.getTracks().forEach(track => {
                    console.log(`Stopping track: ${track.kind}`, track);
                    track.stop();
                  });
                  setStream(null);
                  setAudioInitialized(false);
                  setError(createStatusMessage('info', "Media streams manually stopped"));
                } else {
                  setError(createStatusMessage('warning', "No active media stream to stop"));
                }
              }}
              className="px-2 py-1 bg-red-700 hover:bg-red-600 rounded text-xs"
            >
              Reset Media
            </button>
            
            <button 
              onClick={async () => {
                try {
                  const devices = await navigator.mediaDevices.enumerateDevices();
                  const videoDevices = devices.filter(device => device.kind === 'videoinput');
                  const audioDevices = devices.filter(device => device.kind === 'audioinput');
                  
                  console.log("Available video devices:", videoDevices);
                  console.log("Available audio devices:", audioDevices);
                  
                  setError(createStatusMessage('info', 
                    <span>
                      <span className="font-medium">Found {videoDevices.length} camera(s) and {audioDevices.length} microphone(s)</span>
                      <p className="text-sm mt-1">Details logged to console</p>
                    </span>
                  ));
                } catch (err) {
                  console.error("Error listing devices:", err);
                  setError(createStatusMessage('error', "Failed to list media devices: " + err.message));
                }
              }}
              className="px-2 py-1 bg-green-700 hover:bg-green-600 rounded text-xs"
            >
              List Devices
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeakingAssessment; 