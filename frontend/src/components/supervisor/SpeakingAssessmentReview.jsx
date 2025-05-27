import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SpeakingAssessmentReview = () => {
  const [pendingAssessments, setPendingAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [evaluationForm, setEvaluationForm] = useState({
    score: 7,
    feedback: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const navigate = useNavigate();
  
  // Get supervisor ID from multiple possible sources
  const getSupervisorId = () => {
    const directId = localStorage.getItem('supervisorId') || sessionStorage.getItem('userId');
    
    // Try to get from userData object
    let fromUserData = null;
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsed = JSON.parse(userData);
        fromUserData = parsed.supervisorId || parsed.UserID || parsed.userId || parsed._id;
      }
    } catch (e) {
      console.error('Error parsing userData:', e);
    }
    
    // Try to get from supervisor data object
    let fromSupervisorData = null;
    try {
      const supervisorData = localStorage.getItem('supervisorData');
      if (supervisorData) {
        const parsed = JSON.parse(supervisorData);
        fromSupervisorData = parsed.supervisorId || parsed.UserID || parsed._id;
      }
    } catch (e) {
      console.error('Error parsing supervisorData:', e);
    }
    
    // In development mode, if no ID found, use a fallback ID
    const id = directId || fromUserData || fromSupervisorData || 
               (process.env.NODE_ENV === 'development' ? 'test_supervisor_123' : 'unknown_supervisor');
    
    console.log('Supervisor identification:', {
      final: id,
      directId,
      fromUserData,
      fromSupervisorData,
      localStorage: {
        supervisorId: localStorage.getItem('supervisorId'),
        userId: localStorage.getItem('userId'),
        userData: localStorage.getItem('userData'),
        supervisorData: localStorage.getItem('supervisorData')
      },
      sessionStorage: {
        userId: sessionStorage.getItem('userId')
      }
    });
    
    // Store for future use
    if (id && id !== 'unknown_supervisor') {
      localStorage.setItem('supervisorId', id);
    }
    
    return id;
  };
  
  // Assign supervisor ID using the new function
  const supervisorId = getSupervisorId();
  
  useEffect(() => {
    fetchPendingAssessments();
  }, []);
  
  const fetchPendingAssessments = async () => {
    try {
      setLoading(true);
      console.log('Fetching pending assessments...');
      const response = await axios.get('/api/speaking-assessment/pending');
      
      console.log('Pending assessments response:', response.data);
      
      if (response.data.success) {
        setPendingAssessments(response.data.assessments);
      } else {
        setError('Failed to fetch pending assessments: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error fetching assessments:', error);
      setError('Error fetching assessments: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectAssessment = (assessment) => {
    console.log('Selected assessment:', assessment);
    setSelectedAssessment(assessment);
    setEvaluationForm({
      score: 7,
      feedback: ''
    });
    setSuccessMessage('');
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEvaluationForm({
      ...evaluationForm,
      [name]: value
    });
  };
  
  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    
    const supervisorId = getSupervisorId();
    
    if (!supervisorId || supervisorId === 'unknown_supervisor') {
      setError('Supervisor ID not found. Please log in again.');
      return;
    }
    
    if (!evaluationForm.feedback) {
      setError('Please provide feedback for the student.');
      return;
    }
    
    if (!selectedAssessment || !selectedAssessment.id) {
      setError('No assessment selected or assessment ID is missing.');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      console.log('Submitting evaluation:', {
        assessmentId: selectedAssessment.id,
        supervisorId,
        score: evaluationForm.score,
        feedback: evaluationForm.feedback
      });
      
      // Ensure assessment ID is valid
      if (!selectedAssessment.id.match(/^[0-9a-fA-F]{24}$/)) {
        console.warn('Assessment ID may not be a valid MongoDB ObjectId:', selectedAssessment.id);
      }
      
      const response = await axios.post(`/api/speaking-assessment/evaluate/${selectedAssessment.id}`, {
        supervisorId,
        score: evaluationForm.score,
        feedback: evaluationForm.feedback
      });
      
      console.log('Evaluation submission response:', response.data);
      
      if (response.data.success) {
        setSuccessMessage('Evaluation submitted successfully!');
        
        // Remove the evaluated assessment from the list
        setPendingAssessments(pendingAssessments.filter(a => a.id !== selectedAssessment.id));
        setSelectedAssessment(null);
        
        // Refresh the list after a short delay to ensure consistency
        setTimeout(() => {
          fetchPendingAssessments();
        }, 1000);
      } else {
        setError('Failed to submit evaluation: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      setError('Error submitting evaluation: ' + (error.response?.data?.message || error.message));
      
      // If there's a specific MongoDB ID error, show a more helpful message
      if (error.response?.status === 400 && error.response?.data?.message?.includes('Invalid assessment ID')) {
        setError('The assessment ID appears to be invalid. Please refresh the page and try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pending assessments...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Speaking Assessment Review
        </h1>
        
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 mb-6">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200 mb-6">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{successMessage}</span>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left side - Pending assessments list */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-indigo-600 px-6 py-4">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pending Assessments
              </h2>
            </div>
            
            {pendingAssessments.length === 0 ? (
              <div className="p-6 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500">No pending assessments found.</p>
                <button 
                  onClick={fetchPendingAssessments} 
                  className="mt-4 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200"
                >
                  Refresh List
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {pendingAssessments.map((assessment) => (
                  <div 
                    key={assessment.id} 
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${selectedAssessment?.id === assessment.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''}`}
                    onClick={() => handleSelectAssessment(assessment)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-gray-800">
                        {assessment.language} - {assessment.level.toUpperCase()}
                      </h3>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        Task {assessment.taskId}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      <p>User ID: {assessment.userId}</p>
                      <p>Submitted: {new Date(assessment.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Right side - Assessment details and evaluation form */}
        <div className="lg:col-span-2">
          {selectedAssessment ? (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-indigo-600 px-6 py-4">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Assessment Review
                </h2>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Student Recording</h3>
                  <video 
                    className="w-full rounded-lg border border-gray-200 mb-4"
                    controls
                    src={selectedAssessment.videoUrl}
                  />
                  
                  {selectedAssessment.transcribedText && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Transcribed Speech:</h4>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <p className="text-gray-700 whitespace-pre-wrap">{selectedAssessment.transcribedText}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">AI Assessment</h3>
                  {selectedAssessment.feedback && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                      <h4 className="font-medium mb-2 flex items-center text-blue-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        AI Generated Feedback
                      </h4>
                      
                      {/* AI Score */}
                      <div className="flex items-center mb-3">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-3 shadow-sm">
                          <span className="text-xl font-bold text-blue-600">{selectedAssessment.score}%</span>
                        </div>
                        <div>
                          <p className="text-sm text-blue-700">Preliminary AI Score</p>
                        </div>
                      </div>
                      
                      {/* Criteria */}
                      {selectedAssessment.feedback.criteria && (
                        <div className="mb-3">
                          <h5 className="font-medium text-sm mb-2 text-blue-800">Criteria Scores:</h5>
                          <ul className="space-y-1 text-sm text-blue-700">
                            {selectedAssessment.feedback.criteria.map((criterion, index) => (
                              <li key={index} className="flex justify-between">
                                <span>{criterion.name}:</span>
                                <span className="font-semibold">{criterion.score}/9</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Overall feedback */}
                      {selectedAssessment.feedback.overallFeedback && (
                        <div>
                          <h5 className="font-medium text-sm mb-1 text-blue-800">Overall Feedback:</h5>
                          <p className="text-sm text-blue-700">{selectedAssessment.feedback.overallFeedback}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <form onSubmit={handleSubmitEvaluation} className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold mb-4">Supervisor Evaluation</h3>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="score">
                      Score (1-9)
                    </label>
                    <div className="flex items-center">
                      <input
                        type="range"
                        id="score"
                        name="score"
                        min="1"
                        max="9"
                        value={evaluationForm.score}
                        onChange={handleInputChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="ml-4 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-lg font-medium">
                        {evaluationForm.score}/9
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="feedback">
                      Feedback
                    </label>
                    <textarea
                      id="feedback"
                      name="feedback"
                      value={evaluationForm.feedback}
                      onChange={handleInputChange}
                      rows="6"
                      placeholder="Provide detailed feedback to the student..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className={`px-6 py-3 ${
                        submitting ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
                      } text-white rounded-lg flex items-center shadow-md transition-colors`}
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Submit Evaluation
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="p-12 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Assessment Selected</h3>
                <p className="text-gray-500 mb-6">Select an assessment from the list to review and evaluate it.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpeakingAssessmentReview; 