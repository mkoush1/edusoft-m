import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import LeetCodeFAQ from '../components/LeetCodeFAQ';
import api from '../utils/axiosConfig';

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

  useEffect(() => {
    // Get user ID from local storage
    try {
      const userString = localStorage.getItem('user');
      console.log('User string from localStorage:', userString);
      
      if (userString) {
        const user = JSON.parse(userString);
        console.log('Parsed user object:', user);
        
        if (user && user._id) {
          console.log('Setting userId to:', user._id);
          setUserId(user._id);
        } else {
          console.error('User object does not have _id property:', user);
          // Try alternative property names that might contain the ID
          const possibleIdFields = ['id', 'userId', 'user_id'];
          for (const field of possibleIdFields) {
            if (user && user[field]) {
              console.log(`Found alternative ID field: ${field} with value:`, user[field]);
              setUserId(user[field]);
              break;
            }
          }
        }
      } else {
        console.error('No user found in localStorage');
      }
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
    }
  }, []);

  const handleStartAssessment = async () => {
    if (!username) {
      setError('Please enter your LeetCode username');
      return;
    }

    // Check if userId is available
    if (!userId) {
      console.error('User ID is missing');
      setError('User ID is missing. Please make sure you are logged in.');
      return;
    }

    console.log('Starting assessment with:', { userId, leetCodeUsername: username });
    setLoading(true);
    setError(null);

    try {
      const payload = {
        userId,
        leetCodeUsername: username
      };
      console.log('Sending payload:', payload);
      
      const response = await api.post('/api/assessments/leetcode/start', payload);

      setAssessment(response.data.assessment);
      setVerificationCode(response.data.assessment.verificationCode);
      setStep('verification');
    } catch (err) {
      console.error('Error starting LeetCode assessment:', err);
      setError(err.response?.data?.message || 'Failed to start assessment');
      
      // If user already has an active assessment
      if (err.response?.data?.assessment) {
        setAssessment(err.response.data.assessment);
        
        // Determine which step to show based on assessment status
        if (err.response.data.assessment.verificationStatus === 'verified') {
          setProblems(err.response.data.assessment.assignedProblems);
          setStep('problems');
        } else {
          setVerificationCode(err.response.data.assessment.verificationCode);
          setStep('verification');
        }
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
      
      // Update state with new data
      setAssessment(response.data.assessment);
      setProblems(response.data.assessment.assignedProblems);
      setProgress(response.data.score);
      
      // Remove the progress toast
      document.body.removeChild(progressToast);
      
      // Show success toast
      const successToast = document.createElement('div');
      successToast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
      successToast.textContent = `Progress updated! Score: ${response.data.score}%`;
      document.body.appendChild(successToast);
      
      // Remove success toast after 3 seconds
      setTimeout(() => {
        document.body.removeChild(successToast);
      }, 3000);
      
      // If all problems are completed, move to the completed step
      if (response.data.assessment.status === 'completed') {
        setStep('completed');
      }
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
        
        {!userId && (
          <div className="mb-4">
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
              User ID (Not automatically detected)
            </label>
            <input
              type="text"
              id="userId"
              value={userId || ''}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#592538]"
              placeholder="Enter your User ID"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your User ID couldn't be automatically detected. Please enter it manually.
            </p>
          </div>
        )}
        
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          onClick={handleStartAssessment}
          disabled={loading}
          className="w-full px-4 py-2 bg-[#592538] text-white rounded-lg hover:bg-[#6d2c44] transition duration-300 disabled:bg-gray-400 flex justify-center items-center"
        >
          {loading ? <><LoadingSpinner size="small" color="white" /><span className="ml-2">Processing...</span></> : 'Start Assessment'}
        </button>
      </div>
      
      <div className="max-w-md mx-auto">
        <LeetCodeFAQ />
      </div>
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
          <div key={index} className="border rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{problem.title}</h3>
                <p className="text-sm text-gray-600 mb-2">Difficulty: {problem.difficulty}</p>
              </div>
              {problem.completed ? (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-sm">
                  Completed
                </span>
              ) : (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm">
                  Pending
                </span>
              )}
            </div>
            <button
              onClick={() => {
                // Use problem title to search on LeetCode if titleSlug isn't working
                const searchQuery = problem.titleSlug || problem.title.toLowerCase().replace(/\s+/g, '-');
                const leetCodeUrl = `https://leetcode.com/problems/${searchQuery}/`;
                console.log('Opening LeetCode problem URL:', leetCodeUrl);
                window.open(leetCodeUrl, '_blank');
              }}
              className="mt-2 px-3 py-1 bg-blue-50 text-blue-600 rounded border border-blue-200 text-sm hover:bg-blue-100 transition duration-300"
            >
              Solve on LeetCode
            </button>
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
