import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ListeningAssessment from '../components/language/ListeningAssessment';
import WritingAssessment from '../components/language/WritingAssessment';
import SpeakingAssessment from '../components/language/SpeakingAssessment';
import ReadingAssessment from '../components/language/ReadingAssessment';
import LanguageResults from '../components/language/LanguageResults';
import SimpleSpeakingResults from '../components/language/SimpleSpeakingResults';
import WritingResults from '../components/language/WritingResults';

const CommunicationAssessment = () => {
  const [currentModule, setCurrentModule] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState('b1'); // Default to intermediate
  const [selectedLanguage, setSelectedLanguage] = useState('english'); // Only English
  const [results, setResults] = useState(null);
  const navigate = useNavigate();
  
  // Check if we're viewing a previously saved assessment
  useEffect(() => {
    const savedAssessment = sessionStorage.getItem('viewingAssessment');
    if (savedAssessment) {
      try {
        const parsedAssessment = JSON.parse(savedAssessment);
        console.log('Loaded saved assessment:', parsedAssessment);
        
        // Set the selected level from the assessment
        if (parsedAssessment.level) {
          setSelectedLevel(parsedAssessment.level);
        }
        
        // Set the selected language from the assessment
        if (parsedAssessment.language) {
          setSelectedLanguage(parsedAssessment.language);
        }
        
        // Set the current module
        setCurrentModule('speaking'); // Since we only support speaking assessments currently
        
        // Load the full assessment details using the assessment ID
        if (parsedAssessment.id) {
          import('../services/assessment.service').then(module => {
            const AssessmentService = module.default;
            AssessmentService.getSpeakingAssessment(parsedAssessment.id)
              .then(response => {
                if (response.success && response.assessment) {
                  // Prepare the assessment data for display
                  const assessmentData = {
                    ...response.assessment,
                    type: 'speaking', // Always set type to 'speaking' for previously saved assessments
                    feedback: response.assessment.feedback || parsedAssessment.feedback || '',
                    score: response.assessment.score || parsedAssessment.score || 0,
                    status: response.assessment.status || parsedAssessment.status || 'pending',
                    supervisorFeedback: response.assessment.supervisorFeedback || parsedAssessment.supervisorFeedback,
                    supervisorScore: response.assessment.supervisorScore || parsedAssessment.supervisorScore,
                    assessmentId: parsedAssessment.id
                  };
                  
                  // Set the results to display the assessment
                  setResults(assessmentData);
                  
                  // Clear the saved assessment to prevent loading it again
                  sessionStorage.removeItem('viewingAssessment');
                }
              })
              .catch(error => {
                console.error('Error loading assessment details:', error);
              });
          });
        }
      } catch (error) {
        console.error('Error parsing saved assessment:', error);
        sessionStorage.removeItem('viewingAssessment');
      }
    }
  }, []);

  const modules = [
    {
      id: 'listening',
      title: 'Listening Skills',
      description: 'Evaluate your ability to comprehend and interpret spoken information',
      component: ListeningAssessment,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      )
    },
    {
      id: 'reading',
      title: 'Reading Skills',
      description: 'Assess your ability to understand written text',
      component: ReadingAssessment,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      id: 'writing',
      title: 'Writing Skills',
      description: 'Assess your written communication effectiveness',
      component: WritingAssessment,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      )
    },
    {
      id: 'speaking',
      title: 'Speaking Skills',
      description: 'Test your verbal communication and presentation skills',
      component: SpeakingAssessment,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      )
    }
  ];

  const levels = [
    { 
      id: 'a1', 
      name: 'A1 - Beginner', 
      description: 'Can understand and use familiar everyday expressions and very basic phrases',
      color: 'from-green-50 to-green-100 border-green-200 hover:border-green-300'
    },
    { 
      id: 'a2', 
      name: 'A2 - Elementary', 
      description: 'Can communicate in simple and routine tasks on familiar topics',
      color: 'from-green-100 to-green-200 border-green-300 hover:border-green-400'
    },
    { 
      id: 'b1', 
      name: 'B1 - Intermediate', 
      description: 'Can deal with most situations likely to arise while traveling',
      color: 'from-blue-50 to-blue-100 border-blue-200 hover:border-blue-300'
    },
    { 
      id: 'b2', 
      name: 'B2 - Upper Intermediate', 
      description: 'Can interact with a degree of fluency and spontaneity with native speakers',
      color: 'from-blue-100 to-blue-200 border-blue-300 hover:border-blue-400'
    },
    { 
      id: 'c1', 
      name: 'C1 - Advanced', 
      description: 'Can express ideas fluently and spontaneously without much obvious searching for expressions',
      color: 'from-purple-50 to-purple-100 border-purple-200 hover:border-purple-300'
    }
  ];

  const handleModuleSelect = (moduleId) => {
    setCurrentModule(moduleId);
  };

  const handleAssessmentComplete = (assessmentResults) => {
    // Ensure we have the type property set for proper display
    if (assessmentResults && !assessmentResults.type && currentModule) {
      assessmentResults.type = currentModule;
    }
    
    // For speaking assessments, make sure we properly handle pending status
    if (assessmentResults && assessmentResults.type === 'speaking') {
      // If the status is 'pending' or pendingReview is true, ensure they're consistently set
      if (assessmentResults.status === 'pending' || assessmentResults.pendingReview) {
        assessmentResults.status = 'pending';
        assessmentResults.pendingReview = true;
      }
      
      // For evaluated assessments, ensure supervisor score is available
      if (assessmentResults.status === 'evaluated' && !assessmentResults.supervisorScore) {
        console.log('Adding default supervisor score for evaluated speaking assessment');
        assessmentResults.supervisorScore = 7; // Default if not provided
      }
    }
    
    // Log the results to help with debugging
    console.log('Assessment completed with results:', {
      hasType: !!assessmentResults?.type,
      type: assessmentResults?.type,
      currentModule,
      assessmentId: assessmentResults?.assessmentId,
      status: assessmentResults?.status,
      pendingReview: assessmentResults?.pendingReview,
      supervisorScore: assessmentResults?.supervisorScore
    });
    
    setResults(assessmentResults);
  };

  const handleBack = () => {
    if (results) {
      setResults(null);
      setCurrentModule(null);
    } else if (currentModule) {
      setCurrentModule(null);
    } else {
      navigate('/assessments');
    }
  };

  // Custom function to handle completion and navigate to home
  const handleResultsComplete = () => {
    // Navigate to dashboard instead of home page
    navigate('/dashboard');
  };

  const renderContent = () => {
    if (results) {
      // For speaking assessments, use the SimpleSpeakingResults component
      if (results.type === 'speaking') {
        return (
          <div className="max-w-3xl mx-auto">
            <SimpleSpeakingResults 
              results={results}
              onBack={handleBack}
            />
          </div>
        );
      }
      
      // For writing assessments, use the WritingResults component
      if (results.type === 'writing') {
        return (
          <div className="max-w-3xl mx-auto">
            <WritingResults 
              results={results}
              onBack={handleBack}
            />
          </div>
        );
      }
      
      // For other types of assessments, show the standard results view
      return (
        <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#592538]">
                {results.type.charAt(0).toUpperCase() + results.type.slice(1)} Assessment Results
              </h2>
              <button 
                onClick={handleBack}
                className="px-4 py-2 text-sm font-medium text-[#592538] rounded-lg border border-[#592538] hover:bg-[#592538] hover:text-white transition-colors"
              >
                Back to Assessments
              </button>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl mb-6 shadow-sm">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center mb-4 md:mb-0">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      English - {levels.find(l => l.id === selectedLevel)?.name}
                    </h3>
                    <p className="text-gray-600">
                      {results.type.charAt(0).toUpperCase() + results.type.slice(1)} Assessment
                    </p>
                  </div>
                </div>
                
                <div className="text-center bg-white rounded-full p-4 shadow-sm">
                  <div className="text-4xl font-bold text-[#592538]">{Math.round(results.score)}%</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Assessment Results</h3>
              
              {/* Supervisor feedback section for speaking assessments */}
              {results.status === 'evaluated' && results.supervisorFeedback ? (
                <div className="mb-6 bg-green-50 p-5 rounded-xl border border-green-200">
                  <div className="flex items-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <h4 className="text-lg font-semibold text-green-800">Supervisor Evaluation</h4>
                  </div>
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mr-4 shadow-sm">
                      <div className="text-2xl font-bold text-green-700">
                        {results.supervisorScore}/9
                      </div>
                    </div>
                    <div>
                      <p className="text-green-800">{results.supervisorFeedback}</p>
                      <div className="text-sm text-gray-500 mt-1">
                        {results.evaluatedAt ? new Date(results.evaluatedAt).toLocaleDateString() : 'Recently evaluated'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : results.status === 'pending' ? (
                <div className="mb-6 bg-yellow-50 p-5 rounded-xl border border-yellow-200">
                  <div className="flex items-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h4 className="text-lg font-semibold text-yellow-800">Awaiting Expert Evaluation</h4>
                  </div>
                  <p className="text-yellow-800 mb-2">
                    Your speaking assessment has been submitted successfully and is awaiting review by a language expert.
                  </p>
                  <p className="text-xs text-yellow-600">
                    You can return to this page later to check if your assessment has been evaluated.
                    {results.assessmentId && <span className="block mt-1">Assessment ID: {results.assessmentId}</span>}
                  </p>
                </div>
              ) : null}
              
              {/* Only show feedback for non-speaking assessments */}
              {results.type !== 'speaking' && results.feedback && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">
                    {results.status === 'evaluated' ? 'Assessment Feedback' : 'Preliminary Feedback'}
                  </h4>
                  <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{results.feedback}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center mt-8">
              {/* Refresh button for checking updates - only show for pending assessments */}
              {results.status === 'pending' && results.assessmentId && (
                <button
                  onClick={() => {
                    // Show loading indicator
                    const tempResults = {...results, isRefreshing: true};
                    setResults(tempResults);
                    
                    // Import service dynamically
                    import('../services/assessment.service').then(module => {
                      const AssessmentService = module.default;
                      AssessmentService.getSpeakingAssessment(results.assessmentId)
                        .then(response => {
                          if (response.success && response.assessment) {
                            console.log('Refreshed assessment data:', response.assessment);
                            // Create a new object that combines the current results with the new assessment data
                            const updatedResults = {
                              ...results,
                              ...response.assessment,
                              supervisorFeedback: response.assessment.supervisorFeedback,
                              supervisorScore: response.assessment.supervisorScore,
                              status: response.assessment.status,
                              isRefreshing: false
                            };
                            setResults(updatedResults);
                          } else {
                            // Reset refreshing state if failed
                            const resetResults = {...results, isRefreshing: false};
                            setResults(resetResults);
                          }
                        })
                        .catch(error => {
                          console.error('Failed to refresh assessment:', error);
                          // Reset refreshing state if failed
                          const resetResults = {...results, isRefreshing: false};
                          setResults(resetResults);
                        });
                    });
                  }}
                  className="px-6 py-2.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors mb-4 flex items-center"
                  disabled={results.isRefreshing}
                >
                  {results.isRefreshing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
                      Checking for updates...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Check for Supervisor Evaluation
                    </>
                  )}
                </button>
              )}
              
              <button
                onClick={handleResultsComplete}
                className="px-8 py-3 bg-gradient-to-r from-[#592538] to-[#6d2c44] text-white rounded-lg hover:shadow-lg transition-all duration-300 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (currentModule) {
      const ModuleComponent = modules.find(m => m.id === currentModule).component;
      return (
        <ModuleComponent 
          onComplete={handleAssessmentComplete} 
          level={selectedLevel}
          language={selectedLanguage}
          onBack={handleBack}
        />
      );
    }

    return (
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-[#592538]">
            Choose Your Communication Skills Level
          </h2>
          <button 
            onClick={handleBack}
            className="px-5 py-2.5 text-sm font-medium text-white bg-[#592538] rounded-lg hover:bg-[#6d2c44] transition-colors shadow-md"
          >
            Back
          </button>
        </div>
        
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <div className="h-10 w-1.5 bg-[#592538] rounded mr-3"></div>
            <h3 className="text-xl font-medium text-gray-700">CEFR Levels</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {levels.map(level => (
              <div
                key={level.id}
                onClick={() => setSelectedLevel(level.id)}
                className={`p-5 rounded-xl border cursor-pointer shadow-sm transition-all duration-300 ${
                  selectedLevel === level.id
                    ? 'border-[#592538] ring-2 ring-[#592538] ring-opacity-25 transform scale-[1.02] shadow-md'
                    : `border-gray-200 hover:shadow-md bg-gradient-to-br ${level.color}`
                }`}
              >
                <div className="flex items-center mb-3">
                  {selectedLevel === level.id && (
                    <span className="flex items-center justify-center w-6 h-6 bg-[#592538] text-white rounded-full mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-gray-800">{level.name}</h3>
                </div>
                <p className={`${selectedLevel === level.id ? 'text-gray-700' : 'text-gray-600'}`}>{level.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <div className="flex items-center mb-6">
            <div className="h-10 w-1.5 bg-[#592538] rounded mr-3"></div>
            <h3 className="text-xl font-medium text-gray-700">Communication Skills Areas</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((module) => (
              <div
                key={module.id}
                className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#592538] group"
                onClick={() => handleModuleSelect(module.id)}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="text-[#592538] group-hover:text-[#6d2c44] transition-colors mb-4">
                    {module.icon}
                  </div>
                  <h2 className="text-xl font-bold mb-3 text-[#592538] group-hover:text-[#6d2c44] transition-colors">{module.title}</h2>
                  <p className="text-gray-600">{module.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block p-1.5 rounded-lg bg-[#592538] mb-4">
            <span className="text-white font-medium px-3 py-1">CEFR Standards</span>
          </div>
          <h1 className="text-4xl font-bold text-center text-[#592538] mb-4">
            Communication Skills Test
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Assess your English language skills based on the Common European Framework of Reference for Languages (CEFR).
            Select a level from A1 to C1 and skill area to begin your assessment.
          </p>
          <div className="h-1 w-24 bg-gradient-to-r from-[#592538] to-[#6d2c44] mx-auto rounded-full"></div>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default CommunicationAssessment; 