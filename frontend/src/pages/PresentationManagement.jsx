import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

const PresentationManagement = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  // Initialize criteria scores with default values
  const [criteriaScores, setCriteriaScores] = useState({
    contentClarity: 0,
    engagement: 0,
    impact: 0
  });
  const navigate = useNavigate();

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date error';
    }
  };

  // Helper function to get display name
  const getDisplayName = (video) => {
    try {
      // If we have a valid username, use it
      if (video.username && video.username !== 'Unknown User') {
        return video.username;
      }
      
      // If we have a userId, show a generic user with ID
      if (video.userId) {
        const userIdStr = typeof video.userId === 'object' ? 
          (video.userId._id || JSON.stringify(video.userId)) : 
          video.userId.toString();
          
        // Clean up the ID string and take first 6 characters
        const cleanId = userIdStr.replace(/[^\w]/g, '').substring(0, 6);
        return `User ${cleanId}`;
      }
      
      return 'Unknown User';
      
    } catch (error) {
      console.error('Error getting display name:', error, 'Video data:', video);
      return 'Unknown User';
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(
        'http://localhost:5000/api/assessments/presentation/admin-videos',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setVideos(response.data.videos);
      } else {
        throw new Error(response.data.message || 'Failed to fetch videos');
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError(err.message || 'Failed to fetch videos');
      setLoading(false);
    }
  };

  const handleSelectVideo = (video) => {
    setSelectedVideo(video);
    setFeedback(video.feedback || '');
    setScore(video.score || 0);
    
    // Initialize criteria scores if they exist in the video data
    if (video.criteriaScores) {
      setCriteriaScores({
        contentClarity: video.criteriaScores.contentClarity || 0,
        engagement: video.criteriaScores.engagement || 0,
        impact: video.criteriaScores.impact || 0
      });
    } else {
      // Reset criteria scores if not available
      setCriteriaScores({
        contentClarity: 0,
        engagement: 0,
        impact: 0
      });
    }
  };

  const calculateTotalScore = () => {
    // Calculate the average of the three criteria scores, rounded to nearest integer
    const total = (criteriaScores.contentClarity + criteriaScores.engagement + criteriaScores.impact) / 3;
    return Math.round(total * 10) / 10; // Round to 1 decimal place
  };

  const handleCriteriaScoreChange = (criterion, value) => {
    // Ensure value is between 0 and 10
    const newValue = Math.min(10, Math.max(0, parseFloat(value) || 0));
    
    // Log before update
    console.log(`Updating ${criterion} from ${criteriaScores[criterion]} to ${newValue}`);
    
    // Update the criteria scores state
    setCriteriaScores(prev => {
      const updated = {
        ...prev,
        [criterion]: newValue
      };
      
      // Log the updated state
      console.log('Updated criteria scores:', updated);
      return updated;
    });
    
    // Update the total score based on criteria (will use previous state due to React's batching)
    setTimeout(() => {
      const newTotal = calculateTotalScore();
      console.log('New calculated total score:', newTotal);
      setScore(newTotal);
    }, 0);
  };

  const handleSubmitEvaluation = async () => {
    if (!selectedVideo) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Calculate final score based on criteria
      const finalScore = calculateTotalScore();
      
      // Debug logs
      console.log('Current criteria scores state:', criteriaScores);
      console.log('Calculated final score:', finalScore);

      // Prepare request payload
      const payload = {
        score: finalScore,
        feedback,
        criteriaScores: {
          contentClarity: criteriaScores.contentClarity,
          engagement: criteriaScores.engagement,
          impact: criteriaScores.impact
        }
      };
      
      // Log the exact payload being sent
      console.log('Sending evaluation payload to backend:', JSON.stringify(payload));
      
      const response = await axios.post(
        `http://localhost:5000/api/assessments/presentation/admin-evaluate/${selectedVideo._id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );
      
      // Log the response
      console.log('Evaluation response from backend:', response.data);

      // Refresh the videos list
      await fetchVideos();
      setSelectedVideo(null);
      setFeedback('');
      setScore(0);
      setCriteriaScores({
        contentClarity: 0,
        engagementDelivery: 0,
        impactEffectiveness: 0
      });
    } catch (err) {
      console.error('Error submitting evaluation:', err);
      setError(err.message || 'Failed to submit evaluation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Presentation Assessment Management">
        <div className="flex items-center justify-center h-64">
          <div className="text-[#592538] text-xl">Loading videos...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Presentation Assessment Management">
        <div className="flex items-center justify-center h-64">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-[#592538] mb-4">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Presentation Assessment Management">
      {/* Videos List */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[#592538] mb-4">Student Submissions</h2>
        
        {videos.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-gray-600">No submissions found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {videos.map((video) => (
              <div 
                key={video._id} 
                className={`bg-white rounded-lg border p-4 cursor-pointer transition-colors ${selectedVideo && selectedVideo._id === video._id ? 'border-[#592538] bg-[#FDF8F8]' : 'hover:border-gray-400'}`}
                onClick={() => handleSelectVideo(video)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-[#592538] mb-1">
                      {getDisplayName(video)}
                    </h3>
                    <h4 className="text-md text-gray-700">
                      Question {video.questionId || 'General'}
                    </h4>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${video.score !== null ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {video.score !== null ? `Score: ${video.score}/10` : 'Waiting for admin evaluation'}
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    Submitted: {formatDate(video.submittedAt || video.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Details and Evaluation */}
      <div className="mt-8">
        {selectedVideo ? (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-[#592538] mb-4">
              Evaluate Presentation - Question {selectedVideo.questionId || 'General'}
            </h2>
            
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-6">
              <video
                controls
                className="w-full h-full"
                src={selectedVideo.videoUrl}
                poster={selectedVideo.thumbnailUrl}
                autoPlay
              >
                Your browser does not support the video tag.
              </video>
            </div>
            
            {selectedVideo.presentationFile && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-md font-semibold text-[#592538] mb-2">Presentation File</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{selectedVideo.presentationFile.name}</span>
                  <div className="space-x-2">
                    <a 
                      href={selectedVideo.presentationFile.webViewLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      View
                    </a>
                    <a 
                      href={selectedVideo.presentationFile.downloadLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      Download
                    </a>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-6 mt-6">
              {/* Evaluation Criteria based on question number */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-[#592538] mb-3">Evaluation Criteria</h3>
                
                {selectedVideo && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Question {selectedVideo.questionId || 'General'}:</p>
                    <p className="font-medium">
                      {selectedVideo.questionId === 1 && "Explain a Simple Idea from Your Field"}
                      {selectedVideo.questionId === 2 && "Share an Important Update with Your Team"}
                      {selectedVideo.questionId === 3 && "Describe a Challenge You Solved"}
                      {(!selectedVideo.questionId || ![1, 2, 3].includes(selectedVideo.questionId)) && "General Presentation Assessment"}
                    </p>
                  </div>
                )}
                
                <div className="space-y-4">
                  {/* Content Clarity and Structure */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="contentClarity" className="block text-sm font-medium text-gray-700">
                        Content Clarity and Structure: {criteriaScores.contentClarity}/10
                      </label>
                    </div>
                    <input
                      type="range"
                      id="contentClarity"
                      min="0"
                      max="10"
                      step="0.5"
                      value={criteriaScores.contentClarity}
                      onChange={(e) => handleCriteriaScoreChange('contentClarity', e.target.value)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#592538]"
                    />
                    <div className="mt-2 text-xs text-gray-600 bg-white p-2 rounded border">
                      {selectedVideo && selectedVideo.questionId === 1 && (
                        <ul className="list-disc list-inside space-y-1">
                          <li>Clearly explains complex concept in simple terms</li>
                          <li>Well-structured with logical flow</li>
                          <li>Uses appropriate examples or analogies</li>
                        </ul>
                      )}
                      {selectedVideo && selectedVideo.questionId === 2 && (
                        <ul className="list-disc list-inside space-y-1">
                          <li>Update is clearly articulated and structured</li>
                          <li>Key points are emphasized and easy to understand</li>
                          <li>Logical flow from context to details to next steps</li>
                        </ul>
                      )}
                      {selectedVideo && selectedVideo.questionId === 3 && (
                        <ul className="list-disc list-inside space-y-1">
                          <li>Challenge and solution clearly explained</li>
                          <li>Structured narrative with context, problem, approach, and outcome</li>
                          <li>Technical details balanced with accessible explanation</li>
                        </ul>
                      )}
                      {selectedVideo && (!selectedVideo.questionId || ![1, 2, 3].includes(selectedVideo.questionId)) && (
                        <ul className="list-disc list-inside space-y-1">
                          <li>Content is well-structured and flows logically</li>
                          <li>Main points are clearly articulated</li>
                          <li>Appropriate level of detail for the audience</li>
                        </ul>
                      )}
                    </div>
                  </div>
                  
                  {/* Engagement and Delivery */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="engagement" className="block text-sm font-medium text-gray-700">
                        Engagement and Delivery: {criteriaScores.engagement}/10
                      </label>
                    </div>
                    <input
                      type="range"
                      id="engagement"
                      min="0"
                      max="10"
                      step="0.5"
                      value={criteriaScores.engagement}
                      onChange={(e) => handleCriteriaScoreChange('engagement', e.target.value)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#592538]"
                    />
                    <div className="mt-2 text-xs text-gray-600 bg-white p-2 rounded border">
                      {selectedVideo && selectedVideo.questionId === 1 && (
                        <ul className="list-disc list-inside space-y-1">
                          <li>Maintains audience interest through vocal variety</li>
                          <li>Uses appropriate gestures and body language</li>
                          <li>Demonstrates enthusiasm for the subject</li>
                        </ul>
                      )}
                      {selectedVideo && selectedVideo.questionId === 2 && (
                        <ul className="list-disc list-inside space-y-1">
                          <li>Engages team through appropriate tone and energy</li>
                          <li>Uses effective pauses and emphasis</li>
                          <li>Maintains eye contact and connection</li>
                        </ul>
                      )}
                      {selectedVideo && selectedVideo.questionId === 3 && (
                        <ul className="list-disc list-inside space-y-1">
                          <li>Tells story with appropriate emotion and energy</li>
                          <li>Varies pace to emphasize key moments</li>
                          <li>Maintains engagement throughout the narrative</li>
                        </ul>
                      )}
                      {selectedVideo && (!selectedVideo.questionId || ![1, 2, 3].includes(selectedVideo.questionId)) && (
                        <ul className="list-disc list-inside space-y-1">
                          <li>Maintains audience engagement</li>
                          <li>Uses appropriate vocal variety and body language</li>
                          <li>Demonstrates confidence and enthusiasm</li>
                        </ul>
                      )}
                    </div>
                  </div>
                  
                  {/* Impact and Effectiveness */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="impact" className="block text-sm font-medium text-gray-700">
                        Impact and Effectiveness: {criteriaScores.impact}/10
                      </label>
                    </div>
                    <input
                      type="range"
                      id="impact"
                      min="0"
                      max="10"
                      step="0.5"
                      value={criteriaScores.impact}
                      onChange={(e) => handleCriteriaScoreChange('impact', e.target.value)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#592538]"
                    />
                    <div className="mt-2 text-xs text-gray-600 bg-white p-2 rounded border">
                      {selectedVideo && selectedVideo.questionId === 1 && (
                        <ul className="list-disc list-inside space-y-1">
                          <li>Audience likely to understand and remember the concept</li>
                          <li>Explanation leaves clear and memorable impression</li>
                          <li>Demonstrates confidence and professionalism</li>
                        </ul>
                      )}
                      {selectedVideo && selectedVideo.questionId === 2 && (
                        <ul className="list-disc list-inside space-y-1">
                          <li>Clearly articulates update's importance to the team</li>
                          <li>Motivates team to act or align with the update</li>
                          <li>Confident demeanor reinforces update's credibility</li>
                        </ul>
                      )}
                      {selectedVideo && selectedVideo.questionId === 3 && (
                        <ul className="list-disc list-inside space-y-1">
                          <li>Conveys significance of challenge and effectiveness of solution</li>
                          <li>Demonstrates problem-solving skills and resilience</li>
                          <li>Confident delivery reinforces credibility of approach</li>
                        </ul>
                      )}
                      {selectedVideo && (!selectedVideo.questionId || ![1, 2, 3].includes(selectedVideo.questionId)) && (
                        <ul className="list-disc list-inside space-y-1">
                          <li>Achieves intended purpose of the presentation</li>
                          <li>Leaves audience with clear understanding</li>
                          <li>Professional and credible delivery</li>
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Overall Score:</span>
                    {selectedVideo.score !== null ? (
                      <span className="text-lg font-bold text-[#592538]">{calculateTotalScore()} / 10</span>
                    ) : (
                      <span className="text-sm font-medium px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">Waiting for admin evaluation</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{selectedVideo.score !== null ? 'Average of the three criteria scores' : 'This submission has not been evaluated yet'}</p>
                </div>
              </div>
              
              <div>
                <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
                  Detailed Feedback
                </label>
                <textarea
                  id="feedback"
                  rows="4"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#592538] focus:border-[#592538]"
                  placeholder="Provide constructive feedback on the presentation..."
                />
              </div>
              
              <button
                onClick={handleSubmitEvaluation}
                disabled={submitting}
                className="w-full bg-[#592538] text-white py-2 px-4 rounded-md hover:bg-[#6d2c44] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#592538] disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Evaluation'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-center h-64">
            <p className="text-gray-500 text-lg">Select a video from the list to evaluate</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PresentationManagement;
