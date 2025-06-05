import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import LeetCodeFAQ from '../components/LeetCodeFAQ';
import api from '../utils/axiosConfig';

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id) => typeof id === 'string' && /^[a-f\d]{24}$/i.test(id);

const LeetCodeAssessment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('username'); // username, verification, problems, completed
  const [username, setUsername] = useState('');
  const [assessment, setAssessment] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [problems, setProblems] = useState([]);
  const [progress, setProgress] = useState(0);
  const [userId, setUserId] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Add this to force re-renders

  useEffect(() => {
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        if (user && user._id && isValidObjectId(user._id)) {
          setUserId(user._id);
        } else {
          setError('Invalid or missing user ID. Please log in again.');
        }
      } else {
        // Try to get token from localStorage as fallback
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const decodedToken = JSON.parse(jsonPayload);
            if (decodedToken.userId && isValidObjectId(decodedToken.userId)) {
              setUserId(decodedToken.userId);
            } else if (decodedToken.id && isValidObjectId(decodedToken.id)) {
              setUserId(decodedToken.id);
            } else {
              setError('Invalid or missing user ID in token. Please log in again.');
            }
          } catch (tokenError) {
            setError('Error decoding token. Please log in again.');
          }
        } else {
          setError('No user found. Please log in.');
        }
      }
    } catch (error) {
      setError('Error reading user info. Please log in again.');
    }
  }, []);

  const handleStartAssessment = async () => {
    if (!username) {
      setError('Please enter your LeetCode username');
      return;
    }
    // Validate userId
    if (!userId || !isValidObjectId(userId)) {
      setError('User ID is missing or invalid. Please log in again or enter a valid User ID.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = {
        userId,
        leetCodeUsername: username
      };
      const response = await api.post('/api/assessments/leetcode/start', payload);
      setAssessment(response.data.assessment);
      setVerificationCode(response.data.assessment.verificationCode);
      setStep('verification');
    } catch (err) {
      if (err.response?.data) {
        setError(err.response.data.message || 'Failed to start assessment');
        if (err.response.data.assessment) {
          setAssessment(err.response.data.assessment);
          if (err.response.data.assessment.verificationStatus === 'verified') {
            setProblems(err.response.data.assessment.assignedProblems);
            setStep('problems');
          } else {
            setVerificationCode(err.response.data.assessment.verificationCode);
            setStep('verification');
          }
        }
      } else if (err.message) {
        setError(`Connection error: ${err.message}. Please try again later.`);
      } else {
        setError('An unknown error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAccount = async () => {
    if (!assessment) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.post(`/api/assessments/leetcode/verify/${assessment._id}`);
      setAssessment(response.data.assessment);
      setProblems(response.data.problems);
      setStep('problems');
    } catch (err) {
      console.error('Error verifying LeetCode account:', err);
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckProgress = async () => {
    if (!assessment) return;

    setLoading(true);
    setError(null);

    try {
      console.log('Checking progress for assessment:', assessment._id);
      
      // Show feedback toast
      const progressToast = document.createElement('div');
      progressToast.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg z-50';
      progressToast.textContent = 'Checking your LeetCode solutions...';
      document.body.appendChild(progressToast);
      
      const response = await api.get(`/api/assessments/leetcode/progress/${assessment._id}`);
      console.log('Progress response:', response.data);
      
      // Ensure we have valid response data
      if (!response.data || !response.data.assessment) {
        throw new Error('Invalid response from server');
      }
      
      // Calculate the actual progress based on completed problems
      const completedProblems = response.data.assessment.assignedProblems.filter(p => p.completed).length;
      const totalProblems = response.data.assessment.assignedProblems.length;
      const calculatedProgress = totalProblems > 0 ? Math.round((completedProblems / totalProblems) * 100) : 0;
      
      console.log(`Progress: ${completedProblems}/${totalProblems} = ${calculatedProgress}%`);
      
      // Force a deep refresh of the problems array to ensure React detects changes
      const updatedProblems = response.data.assessment.assignedProblems.map(problem => ({
        ...problem,
        // Convert string dates to Date objects if needed
        completedAt: problem.completedAt ? new Date(problem.completedAt) : null
      }));
      
      // Update state with new data
      setAssessment({
        ...response.data.assessment,
        score: calculatedProgress // Ensure we're using the calculated progress
      });
      setProblems(updatedProblems);
      setProgress(calculatedProgress);
      
      // Remove the progress toast
      document.body.removeChild(progressToast);
      
      // Show success toast with actual progress
      const successToast = document.createElement('div');
      successToast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
      successToast.textContent = `Progress updated! ${completedProblems} of ${totalProblems} problems solved (${calculatedProgress}%)`;
      document.body.appendChild(successToast);
      
      // Remove success toast after 3 seconds
      setTimeout(() => {
        if (document.body.contains(successToast)) {
          document.body.removeChild(successToast);
        }
      }, 3000);
      
      // If all problems are completed, move to the completed step
      if (response.data.assessment.status === 'completed' || completedProblems === totalProblems) {
        setStep('completed');
      }
      
      // Force a re-render to ensure UI updates
      setRefreshKey(prevKey => prevKey + 1);
    } catch (err) {
      console.error('Error checking LeetCode progress:', err);
      setError(err.response?.data?.message || 'Failed to check progress');
      
      // Show error toast
      const errorToast = document.createElement('div');
      errorToast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50';
      errorToast.textContent = 'Error checking progress. Please try again.';
      document.body.appendChild(errorToast);
      
      // Remove error toast after 3 seconds
      setTimeout(() => {
        document.body.removeChild(errorToast);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const checkProblemStatus = async (problemId) => {
    if (!assessment?._id || !problemId) return;
    
    setIsChecking(true);
    setError(null);
    
    try {
      // Log the problem ID we're checking
      console.log('Checking problem status for:', { assessmentId: assessment._id, problemId });
      
      // The correct endpoint based on the backend routes
      // Note: The route in the backend is defined as '/:assessmentId/problems/:problemId/check'
      const response = await api.get(`/api/assessments/leetcode/${assessment._id}/problems/${problemId}/check`);
      console.log('Problem check response:', response.data);
      
      if (response.data.completed) {
        // Update the problem status in the local state
        setProblems(prevProblems => 
          prevProblems.map(p => 
            p.problemId === problemId 
              ? { ...p, completed: true, completedAt: new Date() } 
              : p
          )
        );
        
        // Update the assessment in the local state
        if (response.data.assessment) {
          setAssessment(response.data.assessment);
          
          // Update progress
          const completedCount = response.data.assessment.assignedProblems?.filter(p => p.completed).length || 0;
          const totalCount = response.data.assessment.assignedProblems?.length || 1;
          const newProgress = Math.round((completedCount / totalCount) * 100);
          setProgress(newProgress);
          
          // If all problems are completed, move to completed step
          if (response.data.assessment.status === 'completed') {
            setStep('completed');
          }
        }
        
        // Show success toast
        const successToast = document.createElement('div');
        successToast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
        successToast.textContent = 'Problem solution verified! ✓';
        document.body.appendChild(successToast);
        
        // Remove success toast after 3 seconds
        setTimeout(() => {
          document.body.removeChild(successToast);
        }, 3000);
        
        return true;
      } else {
        // Show info toast
        const infoToast = document.createElement('div');
        infoToast.className = 'fixed top-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded shadow-lg z-50';
        infoToast.textContent = 'Problem not completed yet. Keep working!';
        document.body.appendChild(infoToast);
        
        // Remove info toast after 3 seconds
        setTimeout(() => {
          document.body.removeChild(infoToast);
        }, 3000);
      }
      
      return false;
      
    } catch (err) {
      console.error('Error checking problem status:', err);
      setError(err.response?.data?.message || 'Failed to check problem status');
      
      // Show error toast
      const errorToast = document.createElement('div');
      errorToast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50';
      errorToast.textContent = 'Error checking problem status. Please try again.';
      document.body.appendChild(errorToast);
      
      // Remove error toast after 3 seconds
      setTimeout(() => {
        document.body.removeChild(errorToast);
      }, 3000);
      
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  const checkProgress = async () => {
    if (!assessment?._id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/api/assessments/leetcode/progress/${assessment._id}`);
      console.log('Progress check response:', response.data);
      
      if (response.data.assessment) {
        setAssessment(response.data.assessment);
        
        // Update problems list
        if (response.data.assessment.assignedProblems) {
          setProblems(response.data.assessment.assignedProblems);
        }
        
        // Calculate progress
        const completedCount = response.data.completedCount || 0;
        const totalCount = response.data.totalProblems || 1; // Avoid division by zero
        const newProgress = Math.round((completedCount / totalCount) * 100);
        
        setProgress(newProgress);
        
        // If all problems are completed, move to completed step
        if (response.data.assessment.status === 'completed' || response.data.isCompleted) {
          setStep('completed');
        }
      }
      
    } catch (err) {
      console.error('Error checking progress:', err);
      setError(err.response?.data?.message || 'Failed to check progress');
    } finally {
      setLoading(false);
    }
  };

  const renderUsernameStep = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-[#592538] mb-6">Link Your LeetCode Account</h2>
        <p className="mb-4 text-gray-700">
          Enter your LeetCode username to start the assessment. You'll need to solve specific problems on LeetCode to complete this assessment.
        </p>
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            LeetCode Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#592538]"
            placeholder="Enter your LeetCode username"
          />
        </div>
        {(!userId || !isValidObjectId(userId)) && (
          <div className="mb-4">
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
              User ID (Not automatically detected or invalid)
            </label>
            <input
              type="text"
              id="userId"
              value={userId || ''}
              onChange={(e) => {
                setUserId(e.target.value);
                if (e.target.value && !isValidObjectId(e.target.value)) {
                  setError('User ID must be a valid 24-character hex string (MongoDB ObjectId).');
                } else {
                  setError(null);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#592538]"
              placeholder="Enter your User ID"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your User ID couldn't be automatically detected or is invalid. Please enter it manually. It should be a 24-character hex string (e.g. 661f2e2b7c2e4b2f8c8e4b2f).
            </p>
          </div>
        )}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          onClick={handleStartAssessment}
          className="w-full bg-[#592538] text-white py-2 px-4 rounded hover:bg-[#7a3c59] transition-colors duration-200"
          disabled={loading || !username || !userId || !isValidObjectId(userId)}
        >
          {loading ? <LoadingSpinner size={24} /> : 'Start Assessment'}
        </button>
      </div>
      <LeetCodeFAQ />
    </div>
  );

  const renderVerificationStep = () => (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-[#592538] mb-6">Verify Your LeetCode Account</h2>
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-lg mb-2">Instructions:</h3>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Log in to your LeetCode account</li>
          <li>Go to your profile page</li>
          <li>Click on "Edit Profile"</li>
          <li>Add the following verification code to your "Summary" field:</li>
          <div className="mt-2 p-3 bg-gray-100 rounded font-mono text-sm break-all">
            {verificationCode}
          </div>
          <li>Save your profile changes</li>
          <li>Return here and click "Verify Account"</li>
        </ol>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
          <p className="font-semibold">Note:</p>
          <p>The verification code can be added to any of these profile fields:</p>
          <ul className="list-disc pl-5 mt-1">
            <li>Summary</li>
            <li>Website</li>
            <li>GitHub</li>
            <li>LinkedIn</li>
            <li>X (formerly Twitter)</li>
          </ul>
          <p className="mt-1">Just make sure the code is exactly as shown above.</p>
        </div>
      </div>
      <div className="flex justify-between space-x-4">
        <button
          onClick={() => window.open('https://leetcode.com/profile/', '_blank')}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-300"
        >
          Open LeetCode
        </button>
        <button
          onClick={handleVerifyAccount}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-[#592538] text-white rounded-lg hover:bg-[#6d2c44] transition duration-300 disabled:bg-gray-400 flex justify-center items-center"
        >
          {loading ? <><LoadingSpinner size="small" color="white" /><span className="ml-2">Verifying...</span></> : 'Verify Account'}
        </button>
      </div>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );

  const renderProblemsStep = () => (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-[#592538] mb-6">Solve LeetCode Problems</h2>
      <p className="mb-6 text-gray-700">
        Complete the following problems on LeetCode to finish your assessment. Click "Check Progress" to update your score.
      </p>
      
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className="bg-[#592538] h-4 rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-right mt-1 text-sm text-gray-600">{progress}% complete</p>
      </div>

      <div className="space-y-4 mb-6">
        {problems.map((problem, index) => (
          <div key={`${index}-${refreshKey}-${problem.completed ? 'completed' : 'pending'}`} className="border rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{problem.title}</h3>
                <p className="text-sm text-gray-600 mb-2">Difficulty: {problem.difficulty}</p>
              </div>
              {problem.completed ? (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-sm font-medium">
                  Completed ✓
                </span>
              ) : (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm">
                  Pending
                </span>
              )}
            </div>
            <div className="flex space-x-2 mt-2">
              <button
                onClick={() => {
                  // Use problem title to search on LeetCode if titleSlug isn't working
                  const searchQuery = problem.titleSlug || problem.title.toLowerCase().replace(/\s+/g, '-');
                  const leetCodeUrl = `https://leetcode.com/problems/${searchQuery}/`;
                  console.log('Opening LeetCode problem URL:', leetCodeUrl);
                  window.open(leetCodeUrl, '_blank');
                }}
                className="px-3 py-1 bg-blue-50 text-blue-600 rounded border border-blue-200 text-sm hover:bg-blue-100 transition duration-300"
              >
                Solve on LeetCode
              </button>
              
              <button
                onClick={() => {
                  console.log('Problem data:', problem);
                  // Use problemId as it's more reliable than _id for LeetCode problems
                  checkProblemStatus(problem.problemId);
                }}
                disabled={isChecking || problem.completed}
                className={`px-3 py-1 rounded border text-sm transition duration-300 ${problem.completed 
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                  : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'}`}
              >
                {isChecking ? 'Checking...' : problem.completed ? 'Verified ✓' : 'Check Solution'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => navigate('/assessment/problem-solving')}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-300"
        >
          Back
        </button>
        <button
          onClick={handleCheckProgress}
          disabled={loading}
          className="px-4 py-2 bg-[#592538] text-white rounded-lg hover:bg-[#6d2c44] transition duration-300 disabled:bg-gray-400 flex justify-center items-center"
        >
          {loading ? <><LoadingSpinner size="small" color="white" /><span className="ml-2">Checking...</span></> : 'Check Progress'}
        </button>
      </div>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );

  const renderCompletedStep = () => (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto text-center">
      <div className="mb-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-[#592538] mb-4">Assessment Completed!</h2>
      <p className="mb-6 text-gray-700">
        Congratulations! You've successfully completed the LeetCode assessment.
      </p>
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Your Score</h3>
        <p className="text-4xl font-bold text-[#592538]">{progress}%</p>
      </div>
      <button
        onClick={() => navigate('/dashboard')}
        className="px-6 py-2 bg-[#592538] text-white rounded-lg hover:bg-[#6d2c44] transition duration-300"
      >
        Return to Dashboard
      </button>
    </div>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 'username':
        return renderUsernameStep();
      case 'verification':
        return renderVerificationStep();
      case 'problems':
        return renderProblemsStep();
      case 'completed':
        return renderCompletedStep();
      default:
        return renderUsernameStep();
    }
  };

  return (
    <DashboardLayout title="LeetCode Assessment">
      <div className="py-6">
        {renderCurrentStep()}
      </div>
    </DashboardLayout>
  );
};

export default LeetCodeAssessment;
