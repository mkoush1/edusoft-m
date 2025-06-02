import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { FaPlayCircle, FaExternalLinkAlt } from 'react-icons/fa';
import DashboardLayout from '../components/DashboardLayout';
import '../components/PresentationRecommendations.css';

const CourseCard = ({
  title,
  institution,
  description,
  duration,
  link,
  image,
}) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
  >
    <div className="h-40 overflow-hidden relative group">
      <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
        <div className="p-3 text-white">
          <FaPlayCircle className="text-white text-2xl" />
        </div>
      </div>
    </div>
    <div className="p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium bg-[#592538]/10 text-[#592538] px-3 py-1 rounded-full">
          {institution}
        </span>
        <span className="text-sm text-gray-500 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {duration}
        </span>
      </div>
      <h3 className="text-lg font-bold text-[#592538] mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center px-4 py-2 bg-[#592538] text-white rounded-lg hover:bg-[#6d2c44] transition duration-300 text-sm font-medium shadow-sm"
      >
        <span>Learn More</span>
        <FaExternalLinkAlt className="ml-2 text-xs" />
      </a>
    </div>
  </motion.div>
);

const PresentationRecommendations = () => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [hasSubmitted, setHasSubmitted] = React.useState(false);
  const [isEvaluated, setIsEvaluated] = React.useState(false);
  const [evaluationData, setEvaluationData] = React.useState({
    score: 0,
    feedback: '',
    criteriaScores: {
      contentClarity: 0,
      engagementDelivery: 0,
      impactEffectiveness: 0
    },
    reviewedAt: null,
    strengths: [],
    improvements: []
  });
  
  const [recommendations, setRecommendations] = React.useState({
    score: 7.5,
    strengths: [
      'Clear and confident delivery',
      'Good eye contact',
      'Well-structured content'
    ],
    improvements: [
      'Use more visual aids',
      'Work on pacing',
      'Engage more with the audience'
    ],
    recommendations: [
      {
        title: 'Public Speaking Mastery',
        description: 'Learn advanced techniques for engaging presentations, including body language, voice modulation, and audience interaction.',
        link: 'https://www.coursera.org/learn/public-speaking',
        image: '/Coursera.png'
      },
      {
        title: 'Verbal Communications and Presentation Skills',
        description: 'Develop essential verbal communication and presentation skills to deliver clear, confident, and compelling presentations.',
        link: 'https://www.coursera.org/learn/verbal-communications-and-presentation-skills',
        image: '/Coursera.png'
      },
      {
        title: 'Presentation Skills Training',
        description: 'Master the art of delivering impactful presentations with confidence and clarity in any professional setting.',
        link: 'https://www.udemy.com/topic/presentation-skills/',
        image: '/Udemy.png'
      }
    ]
  });
  
  // Extract criteria scores with defaults
  const criteriaScores = evaluationData?.criteriaScores || {
    contentClarity: 0,
    engagementDelivery: 0,
    impactEffectiveness: 0
  };

  React.useEffect(() => {
    const checkSubmissionStatus = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        // Fetch user's submission data using user-submissions endpoint
        const response = await fetch('http://localhost:5000/api/assessments/presentation/user-submissions', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        console.log('User submissions response:', data);
        
        if (data.success) {
          // Check if user has any submissions
          const hasSubmissions = data.submissions && data.submissions.length > 0;
          setHasSubmitted(hasSubmissions);
          console.log('Has submissions:', hasSubmissions);
          
          if (hasSubmissions) {
            // Find the user's evaluated submission
            const evaluatedSubmission = data.submissions.find(submission => submission.score !== null);
            console.log('Evaluated submission found:', !!evaluatedSubmission);
            
            if (evaluatedSubmission) {
              setIsEvaluated(true);
              
              // Debug logs
              console.log('Evaluated submission:', evaluatedSubmission);
              console.log('Criteria scores from backend:', evaluatedSubmission.criteriaScores);
              
              // Log raw criteria scores from backend
              console.log('Raw criteria scores from backend:', evaluatedSubmission.criteriaScores);
              
              // Create criteria scores object with fallbacks
              const criteriaScores = {
                contentClarity: evaluatedSubmission.criteriaScores?.contentClarity || 0,
                engagement: evaluatedSubmission.criteriaScores?.engagement || 0,
                impact: evaluatedSubmission.criteriaScores?.impact || 0
              };
              
              console.log('Processed criteria scores:', criteriaScores);
              
              // Additional check to ensure we're getting the right data
              if (criteriaScores.engagement === 0 && criteriaScores.impact === 0 && 
                  evaluatedSubmission.criteriaScores && Object.keys(evaluatedSubmission.criteriaScores).length > 0) {
                console.warn('WARNING: Engagement and Impact scores are 0 despite having criteria scores data');
                console.log('Available keys in criteriaScores:', Object.keys(evaluatedSubmission.criteriaScores));
                
                // Try to find alternative field names that might contain the data
                const alternativeFields = {
                  engagementDelivery: evaluatedSubmission.criteriaScores?.engagementDelivery,
                  impactEffectiveness: evaluatedSubmission.criteriaScores?.impactEffectiveness
                };
                console.log('Checking alternative field names:', alternativeFields);
                
                // If alternative fields exist, use them
                if (alternativeFields.engagementDelivery !== undefined) {
                  criteriaScores.engagement = alternativeFields.engagementDelivery;
                }
                if (alternativeFields.impactEffectiveness !== undefined) {
                  criteriaScores.impact = alternativeFields.impactEffectiveness;
                }
                
                console.log('Updated criteria scores after checking alternatives:', criteriaScores);
              }
              
              // Update evaluation data with actual values from the server
              setEvaluationData({
                score: evaluatedSubmission.score || 0,
                feedback: evaluatedSubmission.feedback || '',
                criteriaScores: criteriaScores,
                reviewedAt: evaluatedSubmission.reviewedAt,
                strengths: evaluatedSubmission.strengths || [],
                improvements: evaluatedSubmission.improvements || []
              });
              
              // Debug log after state update
              setTimeout(() => console.log('Evaluation data state:', evaluationData), 100);
            }
          } else {
            console.log('No submissions found for this user');
          }
        } else {
          console.error('API returned error:', data.message || 'Unknown error');
          setError(data.message || 'Failed to load your submission data');
        }
      } catch (err) {
        console.error('Error checking submission status:', err);
        setError('Failed to load your evaluation data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    checkSubmissionStatus();
  }, []);

  return (
    <DashboardLayout title="Presentation Recommendations">
      <motion.div 
        className="recommendations-container p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center text-[#592538] hover:text-[#6d2c44] transition-colors"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-2" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" 
                clipRule="evenodd" 
              />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading your assessment data...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <FaExclamationTriangle className="error-icon" />
            <p>{error}</p>
          </div>
        ) : !hasSubmitted ? (
          <div className="no-submission-container">
            <FaInfoCircle className="info-icon" />
            <h2>No Assessment Submitted</h2>
            <p>You haven't submitted a presentation assessment yet. Complete an assessment to receive personalized recommendations.</p>
          </div>
        ) : (
          <>
            <motion.div 
              className="header"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="text-2xl font-bold text-[#592538] mb-2">Presentation Skills Assessment Results</h1>
              <p className="text-gray-600">Based on your most recent presentation assessment</p>
            </motion.div>

            {!isEvaluated ? (
              <motion.div 
                className="pending-evaluation-container mt-8 p-6 bg-yellow-50 rounded-lg border-l-4 border-yellow-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="flex items-center mb-4">
                  <svg className="w-5 h-5 text-yellow-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <h2 className="text-xl font-semibold text-yellow-800">Evaluation Pending</h2>
                </div>
                <div className="text-yellow-700 space-y-2">
                  <p>Your presentation assessment has been submitted and is waiting for admin evaluation.</p>
                  <p>You will receive detailed feedback and personalized recommendations once your assessment has been evaluated.</p>
                  <p>In the meantime, you can explore the general resources below to improve your presentation skills.</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                className="score-section mt-8 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="p-6 md:p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Presentation Score</h2>
                  <p className="text-gray-600 mb-6">Here's how you performed in your presentation assessment</p>
                  
                  <div className="flex flex-col md:flex-row items-start gap-8">
                    {/* Main Score */}
                    <div className="flex-shrink-0 bg-gray-50 p-6 rounded-lg border border-gray-100">
                      <div className="text-6xl font-bold text-[#592538] text-center">
                        {evaluationData.score.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-500 text-center mt-1">out of 10</div>
                    </div>
                    
                    {/* Criteria Scores */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Evaluation Criteria</h3>
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                          <div className="flex justify-between items-center">
                            <div className="text-md font-medium text-gray-700">Content Clarity</div>
                            <div className="text-xl font-bold text-[#592538]">{evaluationData.criteriaScores?.contentClarity || 0}/10</div>
                          </div>
                          <div className="mt-2 text-sm text-gray-600">Clarity explains complex concept in simple terms with logical flow</div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                          <div className="flex justify-between items-center">
                            <div className="text-md font-medium text-gray-700">Engagement and Delivery</div>
                            <div className="text-xl font-bold text-[#592538]">{evaluationData.criteriaScores?.engagement || 0}/10</div>
                          </div>
                          <div className="mt-2 text-sm text-gray-600">Maintains audience interest through vocal variety and appropriate gestures</div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                          <div className="flex justify-between items-center">
                            <div className="text-md font-medium text-gray-700">Impact and Effectiveness</div>
                            <div className="text-xl font-bold text-[#592538]">{evaluationData.criteriaScores?.impact || 0}/10</div>
                          </div>
                          <div className="mt-2 text-sm text-gray-600">Leaves clear and memorable impression with confidence and professionalism</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                  <div className="flex items-start text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2 text-yellow-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                    <div>
                      <p className="font-medium">Evaluation Details</p>
                      {evaluationData.feedback ? (
                        <p className="mt-1">{evaluationData.feedback}</p>
                      ) : (
                        <p className="mt-1">No additional feedback provided.</p>
                      )}
                      {evaluationData.reviewedAt && (
                        <p className="text-xs text-gray-500 mt-2">
                          Evaluated on: {new Date(evaluationData.reviewedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div 
              className="mt-12 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.0 }}
            >
              <h2 className="text-2xl font-bold text-[#592538] mb-2">Recommended Courses</h2>
              <p className="text-gray-600">Personalized recommendations to help you improve your presentation skills</p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              {recommendations.recommendations.map((course, index) => (
                <CourseCard
                  key={index}
                  title={course.title}
                  institution="Online Course"
                  description={course.description}
                  duration="Self-paced"
                  link={course.link}
                  image={course.image || '/default-course.png'}
                />
              ))}
            </motion.div>
          </>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default PresentationRecommendations;
