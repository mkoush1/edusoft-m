import React, { useState, useEffect } from 'react';
import CEFRService from '../../services/cefr.service';
import WritingAssessmentService from '../../services/writingAssessment.service';
import AssessmentService from '../../services/assessment.service';

const WritingAssessment = ({ onComplete, level, language, onBack }) => {
  console.log("WritingAssessment component rendered with:", { level, language });
  
  const [currentTask, setCurrentTask] = useState(0);
  const [responses, setResponses] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [timerActive, setTimerActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [aiEvaluationResults, setAiEvaluationResults] = useState([]);
  const [error, setError] = useState(null);
  const [canTakeAssessment, setCanTakeAssessment] = useState(true);
  const [nextAvailableDate, setNextAvailableDate] = useState(null);
  const [previousAssessments, setPreviousAssessments] = useState([]);
  const [showPreviousResults, setShowPreviousResults] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);

  useEffect(() => {
    // Check if user can take this assessment
    const checkAssessmentAvailability = async () => {
      try {
        const response = await AssessmentService.checkWritingAssessmentAvailability(level, language);
        if (response.success) {
          setCanTakeAssessment(response.available);
          if (!response.available && response.nextAvailableDate) {
            setNextAvailableDate(new Date(response.nextAvailableDate));
          }
        }
      } catch (error) {
        console.error("Error checking assessment availability:", error);
        // Default to allowing assessment if there's an error checking
        setCanTakeAssessment(true);
      }
    };

    // Get user's previous assessments for this level and language
    const getUserAssessments = async () => {
      try {
        const response = await AssessmentService.getUserWritingAssessments();
        if (response.success && response.assessments) {
          // Filter assessments for current level and language
          const filteredAssessments = response.assessments.filter(
            assessment => assessment.level === level && assessment.language === language
          );
          setPreviousAssessments(filteredAssessments);
        }
      } catch (error) {
        console.error("Error fetching user assessments:", error);
      }
    };

    // Run both checks
    const initializeAssessment = async () => {
      setLoading(true);
      await Promise.all([
        checkAssessmentAvailability(),
        getUserAssessments()
      ]);
      setLoading(false);
    };

    initializeAssessment();
  }, [level, language]);

  useEffect(() => {
    // Load tasks based on language and level
    const loadTasks = async () => {
      try {
        console.log("Starting to load writing tasks for:", { level, language });
        setLoading(true);
        setError(null);
        
        // Add a timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timed out')), 10000)
        );
        
        // Try to fetch assessment data with a timeout
        let assessmentData;
        try {
          console.log("Attempting to get assessment data...");
          assessmentData = await Promise.race([
            CEFRService.getAssessmentData(level, language, 'writing'),
            timeoutPromise
          ]);
          console.log("Assessment data received:", { 
            success: !!assessmentData, 
            hasTasks: assessmentData?.tasks?.length > 0,
            taskCount: assessmentData?.tasks?.length || 0
          });
        } catch (fetchError) {
          console.error("Error or timeout fetching assessment data:", fetchError);
          throw new Error("Could not connect to assessment server. Using fallback tasks.");
        }
        
        if (assessmentData && assessmentData.tasks && assessmentData.tasks.length > 0) {
          console.log("Got valid assessment data from service:", { taskCount: assessmentData.tasks.length });
          setTasks(assessmentData.tasks);
          // Initialize responses array
          setResponses(new Array(assessmentData.tasks.length).fill(''));
          // Initialize AI evaluation results array
          setAiEvaluationResults(new Array(assessmentData.tasks.length).fill(null));
        } else {
          console.log("No valid assessment data or empty tasks, using fallback");
          // Fallback to local data if service returns nothing
          const fallbackTasks = getTasksByLevelAndLanguage(level, language);
          console.log("Fallback tasks:", { taskCount: fallbackTasks.length });
          setTasks(fallbackTasks);
          setResponses(new Array(fallbackTasks.length).fill(''));
          setAiEvaluationResults(new Array(fallbackTasks.length).fill(null));
        }
        setLoading(false);
      } catch (error) {
        console.error("Error loading tasks:", error);
        // Fallback to local data on error
        const fallbackTasks = getTasksByLevelAndLanguage(level, language);
        console.log("Error occurred, using fallback tasks:", { 
          errorMessage: error.message,
          taskCount: fallbackTasks.length
        });
        setTasks(fallbackTasks);
        setResponses(new Array(fallbackTasks.length).fill(''));
        setAiEvaluationResults(new Array(fallbackTasks.length).fill(null));
        setError(error.message || "Failed to load assessment tasks. Using fallback tasks.");
        setLoading(false);
      }
    };

    loadTasks();
    // Reset timer
    setTimeLeft(null);
  }, [level, language]);

  useEffect(() => {
    if (timeLeft === 0) {
      handleNextTask();
    }
    if (timeLeft > 0 && timerActive) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, timerActive]);

  const getTasksByLevelAndLanguage = (level, language) => {
    // In a real app, these would come from a database
    console.log(`Getting fallback writing tasks for level: ${level}, language: ${language}`);
    
    const tasksByLevel = {
      'a1': [
        {
          id: 1,
          title: language === 'english' ? 'Simple Introduction' : 'Présentation Simple',
          prompt: language === 'english' ? 
            'Write a short paragraph about yourself (name, age, nationality, job/studies, hobbies).' : 
            'Écrivez un court paragraphe sur vous-même (nom, âge, nationalité, travail/études, loisirs).',
          timeLimit: 10 * 60, // 10 minutes
          wordLimit: 50,
          criteria: [
            language === 'english' ? 'Basic Vocabulary' : 'Vocabulaire de Base', 
            language === 'english' ? 'Simple Sentences' : 'Phrases Simples', 
            language === 'english' ? 'Personal Information' : 'Informations Personnelles'
          ]
        }
      ],
      'b1': [
        {
          id: 1,
          title: language === 'english' ? 'Personal Experience' : 'Expérience Personnelle',
          prompt: language === 'english' ? 
            'Write about a memorable trip or vacation you have taken. Describe where you went, who you were with, what you did, and why it was memorable.' : 
            'Écrivez à propos d\'un voyage ou de vacances mémorables que vous avez fait. Décrivez où vous êtes allé, avec qui vous étiez, ce que vous avez fait et pourquoi c\'était mémorable.',
          timeLimit: 20 * 60, // 20 minutes
          wordLimit: 150,
          criteria: [
            language === 'english' ? 'Past Tense Narration' : 'Narration au Passé', 
            language === 'english' ? 'Descriptive Language' : 'Langage Descriptif', 
            language === 'english' ? 'Logical Sequence' : 'Séquence Logique',
            language === 'english' ? 'Personal Reflection' : 'Réflexion Personnelle'
          ]
        }
      ],
      'c1': [
        {
          id: 1,
          title: language === 'english' ? 'Argumentative Essay' : 'Essai Argumentatif',
          prompt: language === 'english' ? 
            'Write an essay discussing whether social media has had a positive or negative impact on society. Present arguments for both sides and state your own opinion with supporting reasons.' : 
            'Rédigez un essai discutant si les médias sociaux ont eu un impact positif ou négatif sur la société. Présentez des arguments pour les deux côtés et donnez votre propre opinion avec des raisons à l\'appui.',
          timeLimit: 40 * 60, // 40 minutes
          wordLimit: 300,
          criteria: [
            language === 'english' ? 'Advanced Vocabulary' : 'Vocabulaire Avancé', 
            language === 'english' ? 'Complex Sentence Structures' : 'Structures de Phrases Complexes', 
            language === 'english' ? 'Cohesive Arguments' : 'Arguments Cohésifs',
            language === 'english' ? 'Critical Thinking' : 'Pensée Critique',
            language === 'english' ? 'Academic Register' : 'Registre Académique'
          ]
        }
      ]
    };
    
    // Default to 'b1' if level is not specified
    const normalizedLevel = (level || 'b1').toLowerCase();
    
    // If level not found, default to B1 (or the first available level)
    const levelTasks = tasksByLevel[normalizedLevel] || tasksByLevel['b1'] || Object.values(tasksByLevel)[0];
    
    // Create a deep copy to avoid state mutation issues
    const result = JSON.parse(JSON.stringify(levelTasks));
    console.log(`Returning ${result.length} fallback tasks for level: ${normalizedLevel}`);
    return result;
  };

  const handleResponseChange = (value) => {
    const newResponses = [...responses];
    newResponses[currentTask] = value;
    setResponses(newResponses);
  };

  const handleNextTask = () => {
    // With a single task, next is always submit
      handleSubmit();
  };

  const handlePreviousTask = () => {
    if (currentTask > 0) {
      setCurrentTask(currentTask - 1);
      setTimeLeft(null);
      setTimerActive(false);
    }
  };

  const startTimer = () => {
    if (!timerActive) {
      setTimeLeft(tasks[currentTask].timeLimit);
      setTimerActive(true);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      // Get the single task and response
      const task = tasks[0];
      const response = responses[0];
      
      if (!response || response.trim() === '') {
        throw new Error('No response provided');
        }
        
        // Evaluate the writing using our AI service
      let evaluationResult;
      try {
        console.log('Evaluating writing response...');
        evaluationResult = await WritingAssessmentService.evaluateWriting(
          task.prompt,
          response
        );
        setAiEvaluationResults([evaluationResult]);
      } catch (evalError) {
        console.error('Error evaluating writing:', evalError);
        // Will use fallback evaluation
      }
      
      // Prepare task with response and evaluation metrics
      const taskWithResponse = {
        ...task,
        response: response,
        wordCount: response.split(/\s+/).filter(Boolean).length,
        aiEvaluation: evaluationResult,
        metrics: evaluationResult ? evaluationResult.criteria : evaluateResponse(response, task)
      };
      
      // Calculate score
      const overallScore = evaluationResult ? evaluationResult.overallScore : calculateScore();
      
      // Generate feedback
      const overallFeedback = evaluationResult ? 
        evaluationResult.overallFeedback : 
        CEFRService.generateFeedback(overallScore, level, 'writing');
      
      // Prepare the final results
      const results = {
        type: 'writing',
        level: level,
        language: language,
        score: overallScore,
        tasks: [taskWithResponse],
        cefr: CEFRService.calculateCEFRResult(overallScore, level),
        feedback: overallFeedback
      };
      
      // Save results to database
      try {
        console.log('Saving writing assessment results to database...');
        // Import the assessment service dynamically to avoid circular dependencies
        const assessmentServiceModule = await import('../../services/assessment.service');
        const AssessmentService = assessmentServiceModule.default;
        
        // Submit the assessment to the server
        const submissionResponse = await AssessmentService.submitAssessment({
          type: 'writing',
          level,
          language,
          score: overallScore,
          tasks: [taskWithResponse],
          feedback: overallFeedback
        });
        
        console.log('Writing assessment saved successfully:', submissionResponse);
        
        // Add server response data to results if available
        if (submissionResponse && submissionResponse.result) {
          results.submissionId = submissionResponse.result._id;
          results.submissionStatus = submissionResponse.result.status || 'completed';
          results.serverScore = submissionResponse.result.score;
        }
      } catch (dbError) {
        console.error('Error saving writing assessment to database:', dbError);
        // Continue even if database save fails - the user still gets their results
      }
      
      // Pass results to the parent component
      onComplete(results);
    } catch (error) {
      console.error('Error in writing assessment:', error);
      
      // Fallback processing if an error occurs
      const task = tasks[0];
      const response = responses[0] || '';
      const score = calculateScore();
      
      const results = {
        type: 'writing',
        level: level,
        language: language,
        score: score,
        tasks: [{
          ...task,
          response: response,
          wordCount: response.split(/\s+/).filter(Boolean).length,
          metrics: evaluateResponse(response, task)
        }],
        cefr: CEFRService.calculateCEFRResult(score, level),
        feedback: CEFRService.generateFeedback(score, level, 'writing')
      };
      
      // Try to save the fallback results to database
      try {
        console.log('Saving fallback writing assessment results to database...');
        const assessmentServiceModule = await import('../../services/assessment.service');
        const AssessmentService = assessmentServiceModule.default;
        
        const submissionResponse = await AssessmentService.submitAssessment({
          type: 'writing',
          level,
          language,
          score: score,
          tasks: results.tasks,
          feedback: results.feedback
        });
        
        console.log('Fallback writing assessment saved successfully:', submissionResponse);
        
        if (submissionResponse && submissionResponse.result) {
          results.submissionId = submissionResponse.result._id;
          results.submissionStatus = submissionResponse.result.status || 'completed';
        }
      } catch (dbError) {
        console.error('Error saving fallback writing assessment to database:', dbError);
        // Continue even if database save fails
      }
      
      onComplete(results);
    } finally {
      setSubmitting(false);
    }
  };

  const evaluateResponse = (response, task) => {
    // This is a simple simulation - in a real app, this would be done by AI or human evaluators
    if (!response) return [];
    
    const wordCount = response.split(/\s+/).filter(Boolean).length;
    const sentenceCount = response.split(/[.!?]+/).filter(Boolean).length;
    const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;
    const percentOfWordLimit = (wordCount / task.wordLimit) * 100;
    
    // Check for minimal responses
    const isVeryMinimal = wordCount < 3 || percentOfWordLimit < 5;
    const isMinimal = wordCount < 10 || percentOfWordLimit < 20;
    
    // Generate appropriate feedback based on the response length
    let feedback = '';
    
    if (isVeryMinimal) {
      feedback = language === 'english' 
        ? 'The response is far too brief and does not meet the minimum requirements for assessment.' 
        : 'La réponse est beaucoup trop brève et ne répond pas aux exigences minimales d\'évaluation.';
    } else if (isMinimal) {
      feedback = language === 'english'
        ? 'The response is too brief to demonstrate writing proficiency.' 
        : 'La réponse est trop brève pour démontrer une compétence en écriture.';
    }
    
    // Basic metrics - now out of 10 each (will be displayed as out of 20)
    const metrics = [
      {
        name: language === 'english' ? 'Coherence and Clarity' : 'Cohérence et Clarté',
        score: isVeryMinimal ? 0.5 : isMinimal ? 1 : Math.min(10, 2 + (sentenceCount > 2 ? 3 : 0)),
        comment: isVeryMinimal 
          ? (language === 'english' ? 'Response too brief to evaluate coherence' : 'Réponse trop brève pour évaluer la cohérence')
          : isMinimal
            ? (language === 'english' ? 'Insufficient content to demonstrate coherence' : 'Contenu insuffisant pour démontrer la cohérence')
            : sentenceCount > 2 
              ? (language === 'english' ? 'Basic coherence shown' : 'Cohérence de base montrée') 
              : (language === 'english' ? 'Improve coherence' : 'Améliorez la cohérence')
      },
      {
        name: language === 'english' ? 'Organization and Structure' : 'Organisation et Structure',
        score: isVeryMinimal ? 0.5 : isMinimal ? 1 : Math.min(10, 2 + (percentOfWordLimit > 30 ? 3 : 0)),
        comment: isVeryMinimal 
          ? (language === 'english' ? 'Response too brief to evaluate organization' : 'Réponse trop brève pour évaluer l\'organisation')
          : isMinimal
            ? (language === 'english' ? 'Insufficient content to demonstrate organization' : 'Contenu insuffisant pour démontrer l\'organisation')
            : percentOfWordLimit > 30
              ? (language === 'english' ? 'Basic structure present' : 'Structure de base présente') 
              : (language === 'english' ? 'Improve structure' : 'Améliorez la structure')
      },
      {
        name: language === 'english' ? 'Focus and Content Development' : 'Concentration et Développement du Contenu',
        score: isVeryMinimal ? 0.5 : isMinimal ? 1 : Math.min(10, 2 + (percentOfWordLimit > 50 ? 3 : 0)),
        comment: isVeryMinimal 
          ? (language === 'english' ? 'Response too brief to evaluate content' : 'Réponse trop brève pour évaluer le contenu')
          : isMinimal
            ? (language === 'english' ? 'Insufficient content development' : 'Développement de contenu insuffisant')
            : percentOfWordLimit > 50
              ? (language === 'english' ? 'Some content development shown' : 'Un certain développement du contenu montré') 
              : (language === 'english' ? 'Add more content' : 'Ajoutez plus de contenu')
      },
      {
        name: language === 'english' ? 'Vocabulary and Word Choice' : 'Vocabulaire et Choix de Mots',
        score: isVeryMinimal ? 0.5 : isMinimal ? 1 : Math.min(10, 2 + (avgWordsPerSentence > 5 ? 3 : 0)),
        comment: isVeryMinimal 
          ? (language === 'english' ? 'Response too brief to evaluate vocabulary' : 'Réponse trop brève pour évaluer le vocabulaire')
          : isMinimal
            ? (language === 'english' ? 'Insufficient vocabulary demonstrated' : 'Vocabulaire insuffisant démontré')
            : avgWordsPerSentence > 5
              ? (language === 'english' ? 'Basic vocabulary used' : 'Vocabulaire de base utilisé') 
              : (language === 'english' ? 'Expand vocabulary' : 'Élargissez votre vocabulaire')
      },
      {
        name: language === 'english' ? 'Grammar and Conventions' : 'Grammaire et Conventions',
        score: isVeryMinimal ? 0.5 : isMinimal ? 1 : Math.min(10, 2 + (sentenceCount > 1 ? 3 : 0)),
        comment: isVeryMinimal 
          ? (language === 'english' ? 'Response too brief to evaluate grammar' : 'Réponse trop brève pour évaluer la grammaire')
          : isMinimal
            ? (language === 'english' ? 'Insufficient text to evaluate grammar properly' : 'Texte insuffisant pour évaluer correctement la grammaire')
            : (language === 'english' ? 'Basic grammar usage' : 'Utilisation grammaticale de base')
      }
    ];
    
    return metrics;
  };

  const calculateScore = () => {
    // Get the response for the single task
    const response = responses[0];
    if (!response || response.trim() === '') {
      return 0;
    }
    
    const task = tasks[0];
    const wordCount = response.split(/\s+/).filter(Boolean).length;
    const sentenceCount = response.split(/[.!?]+/).filter(Boolean).length;
    const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;
    
    // Apply severe penalties for minimal responses
    const percentOfWordLimit = (wordCount / task.wordLimit) * 100;
    const isVeryMinimal = wordCount < 3 || percentOfWordLimit < 5;
    const isMinimal = wordCount < 10 || percentOfWordLimit < 20;
    
    // For extremely minimal responses like "asdsadsad", return a very low score
    if (isVeryMinimal) {
      return 5; // 5% score for nearly empty responses
    }
    
    // For minimal but not extremely minimal responses
    if (isMinimal) {
      return Math.min(20, percentOfWordLimit); // Maximum 20% for minimal responses
    }
    
    // Calculate scores for each of the 5 criteria (out of 20 each)
    
    // 1. Coherence and Clarity (20 points)
    let coherenceScore = 5; // Lower base score
    coherenceScore += Math.min(5, sentenceCount); // +1 per sentence up to 5
    if (sentenceCount > 5) coherenceScore += 5;
    if (percentOfWordLimit >= 70) coherenceScore += 5;
    
    // 2. Organization and Structure (20 points)
    let organizationScore = 5; // Lower base score
    if (percentOfWordLimit >= 30) organizationScore += 5;
    if (percentOfWordLimit >= 60) organizationScore += 5;
    if (percentOfWordLimit >= 90) organizationScore += 5;
    
    // 3. Focus and Content Development (20 points)
    let focusScore = 5; // Lower base score
    if (percentOfWordLimit >= 50) focusScore += 5;
    if (percentOfWordLimit >= 80) focusScore += 5;
    if (wordCount > task.wordLimit) focusScore += 5;
    
    // 4. Vocabulary and Word Choice (20 points)
    let vocabularyScore = 5; // Lower base score
    if (avgWordsPerSentence > 4) vocabularyScore += 5;
    if (avgWordsPerSentence > 7) vocabularyScore += 5;
    
    // Calculate vocabulary variety score
    const words = response.toLowerCase().split(/\s+/).filter(Boolean);
    const uniqueWords = new Set(words);
    const lexicalDiversity = words.length > 0 ? uniqueWords.size / words.length : 0;
    if (lexicalDiversity > 0.5 && wordCount > 20) vocabularyScore += 5;
    
    // 5. Grammar and Conventions (20 points) - basic approximation
    let grammarScore = 5; // Lower base score
    if (sentenceCount > 3) grammarScore += 5;
    if (level === 'b1') grammarScore += 5;
    if (level === 'c1') grammarScore += 5;
    
    // Calculate total score (out of 100)
    const totalScore = coherenceScore + organizationScore + focusScore + vocabularyScore + grammarScore;
    
    // Return exact score, don't cap
    return totalScore;
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Function to view a previous assessment
  const viewPreviousAssessment = (assessment) => {
    setSelectedAssessment(assessment);
    setShowPreviousResults(true);
  };

  // Function to format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return date.toLocaleDateString(undefined, options);
    } catch (error) {
      return dateString;
    }
  };

  // Add these functions to handle the view toggle
  const showNewAssessment = () => {
    setShowPreviousResults(false);
    setSelectedAssessment(null);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#592538] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment...</p>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
      </div>
    );
  }

  if (!canTakeAssessment && nextAvailableDate) {
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
            you can take this assessment again after <span className="font-semibold">{formatDate(nextAvailableDate)}</span>.
          </p>
          
          {previousAssessments.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Your Previous Assessments</h3>
              <div className="space-y-4">
                {previousAssessments.map((assessment, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 text-left">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-medium">{formatDate(assessment.completedAt)}</p>
                        <p className="text-sm text-gray-500">Level: {assessment.level.toUpperCase()}</p>
                      </div>
                      <div className="text-xl font-bold text-[#592538]">{assessment.score}%</div>
                    </div>
                    <button 
                      onClick={() => viewPreviousAssessment(assessment)}
                      className="mt-2 text-sm text-[#592538] hover:underline"
                    >
                      View Results
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <button 
            onClick={onBack}
            className="mt-6 px-4 py-2 bg-[#592538] text-white rounded-lg hover:bg-[#6d2c44]"
          >
            Return to Assessments
          </button>
        </div>
      </div>
    );
  }

  if (showPreviousResults && selectedAssessment) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#592538]">Previous Assessment Results</h2>
          <div className="flex space-x-2">
            <button
              onClick={showNewAssessment}
              className="px-4 py-2 text-[#592538] border border-[#592538] rounded-lg hover:bg-[#592538]/10"
            >
              Back to Results
            </button>
            <button
              onClick={onBack}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Exit
            </button>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-medium">Assessment on {formatDate(selectedAssessment.completedAt)}</h3>
              <p className="text-sm text-gray-500">Level: {selectedAssessment.level.toUpperCase()}</p>
            </div>
            <div className="text-2xl font-bold text-[#592538]">{selectedAssessment.score}%</div>
          </div>
          
          <div className="mb-4">
            <h4 className="font-medium mb-1">Prompt:</h4>
            <p className="text-gray-700 bg-white p-3 rounded border border-gray-200">{selectedAssessment.prompt}</p>
          </div>
          
          <div className="mb-4">
            <h4 className="font-medium mb-1">Your Response:</h4>
            <p className="text-gray-700 bg-white p-3 rounded border border-gray-200 whitespace-pre-line">{selectedAssessment.response}</p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Criteria:</h4>
            <div className="space-y-2">
              {selectedAssessment.criteria.map((criterion, idx) => (
                <div key={idx} className="bg-white p-3 rounded border border-gray-200">
                  <div className="flex justify-between">
                    <span className="font-medium">{criterion.name}</span>
                    <span className="font-medium text-[#592538]">{criterion.score * 2}/20</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{criterion.feedback}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4 bg-blue-50 p-3 rounded border border-blue-100">
            <h4 className="font-medium text-blue-800 mb-1">Overall Feedback:</h4>
            <p className="text-gray-700">{selectedAssessment.feedback}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center py-8">
          <p className="text-red-500 font-medium text-lg mb-4">Unable to load assessment tasks</p>
          <p className="text-gray-600 mb-6">
            {error || "We couldn't load the writing assessment tasks. Please try again later."}
          </p>
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

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#592538]">
            {language === 'english' ? 'Writing Assessment' : 'Évaluation d\'Écriture'} - {level.toUpperCase()}
          </h2>
          <div className="text-right">
            <div className="text-gray-600">
              {language === 'english' ? 'Task' : 'Tâche'} 1/1
            </div>
            {timeLeft !== null && (
              <div className="text-gray-600">
                {language === 'english' ? 'Time Remaining:' : 'Temps Restant:'} {formatTime(timeLeft)}
              </div>
            )}
          </div>
        </div>

        {previousAssessments.length > 0 && (
          <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="text-lg font-medium text-blue-800 mb-2">
              {language === 'english' ? 'Your Previous Assessments' : 'Vos Évaluations Précédentes'}
            </h3>
            <div className="flex flex-col space-y-2">
              {previousAssessments.slice(0, 3).map((assessment, index) => (
                <div key={index} className="flex justify-between items-center bg-white p-2 rounded border border-blue-100">
                  <div>
                    <span className="text-sm font-medium">{formatDate(assessment.completedAt)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-[#592538] font-bold mr-3">{assessment.score}%</span>
                    <button 
                      onClick={() => viewPreviousAssessment(assessment)}
                      className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                    >
                      {language === 'english' ? 'View' : 'Voir'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {previousAssessments.length > 3 && (
              <div className="mt-2 text-right">
                <button 
                  onClick={() => setShowPreviousResults(true)}
                  className="text-xs text-blue-700 hover:underline"
                >
                  {language === 'english' ? `View All (${previousAssessments.length})` : `Voir Tout (${previousAssessments.length})`}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-xl font-medium text-[#592538] mb-2">
            {tasks[currentTask].title}
          </h3>
          <p className="text-gray-800 mb-4">{tasks[currentTask].prompt}</p>
          <div className="flex justify-between text-sm text-gray-600">
            <span>
              {language === 'english' ? 'Word target:' : 'Objectif de mots:'} ~{tasks[currentTask].wordLimit}
            </span>
            <span>
              {language === 'english' ? 'Time limit:' : 'Limite de temps:'} {formatTime(tasks[currentTask].timeLimit)}
            </span>
          </div>
        </div>

        <div className="mb-6">
          <textarea
            className="w-full h-64 p-4 border rounded-lg focus:ring-2 focus:ring-[#592538] focus:border-transparent"
            placeholder={language === 'english' ? 'Write your response here...' : 'Écrivez votre réponse ici...'}
            value={responses[currentTask] || ''}
            onChange={(e) => handleResponseChange(e.target.value)}
            onFocus={startTimer}
          />
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-gray-600">
              {language === 'english' ? 'Word count:' : 'Nombre de mots:'} {responses[currentTask]?.split(/\s+/).filter(Boolean).length || 0}
            </span>
            {timeLeft !== null && !timerActive && (
              <button
                onClick={() => setTimerActive(true)}
                className="text-[#592538] hover:underline"
              >
                {language === 'english' ? 'Resume timer' : 'Reprendre le minuteur'}
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-between">
          <div></div> {/* Empty div to push buttons to the right */}
          
          <div>
            <button
              onClick={onBack}
              className="px-4 py-2 mx-2 text-[#592538] border border-[#592538] rounded-lg hover:bg-[#592538]/10"
            >
              {language === 'english' ? 'Exit' : 'Quitter'}
            </button>
            
            <button
              onClick={handleSubmit}
              className={`px-6 py-2 ${
                submitting ? 'bg-gray-400' : 'bg-[#592538] hover:bg-[#6d2c44]'
              } text-white rounded-lg flex items-center`}
              disabled={submitting || !responses[currentTask] || responses[currentTask].trim() === ''}
            >
              {submitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              {language === 'english' ? (submitting ? 'Analyzing...' : 'Submit') : (submitting ? 'Analyse...' : 'Soumettre')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WritingAssessment; 