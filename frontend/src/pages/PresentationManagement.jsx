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
  const [criteriaScores, setCriteriaScores] = useState({
    contentClarity: 0,
    engagement: 0,
    impact: 0
  });
  const navigate = useNavigate();

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
        'http://localhost:5000/api/assessments/presentation/videos',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setVideos(response.data);
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
    
    setCriteriaScores(prev => ({
      ...prev,
      [criterion]: newValue
    }));
    
    // Update the total score based on criteria
    setScore(calculateTotalScore());
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

      await axios.post(
        `http://localhost:5000/api/assessments/presentation/evaluate/${selectedVideo._id}`,
        {
          score: finalScore,
          feedback,
          criteriaScores: {
            contentClarity: criteriaScores.contentClarity,
            engagement: criteriaScores.engagement,
            impact: criteriaScores.impact
          }
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      // Refresh the videos list
      await fetchVideos();
      setSelectedVideo(null);
      setFeedback('');
      setScore(0);
      setCriteriaScores({
        contentClarity: 0,
        engagement: 0,
        impact: 0
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video List */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-6 h-fit">
          <h2 className="text-xl font-bold text-[#592538] mb-4">Submissions</h2>
          
          {videos.length === 0 ? (
            <p className="text-gray-600">No videos found.</p>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {videos.map((video) => (
                <div 
                  key={video._id} 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedVideo && selectedVideo._id === video._id ? 'border-[#592538] bg-[#FDF8F8]' : 'hover:border-gray-400'}`}
                  onClick={() => handleSelectVideo(video)}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-[#592538]">
                      Question {video.questionId}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${video.score ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {video.score ? 'Evaluated' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mt-1">
                    Submitted by: {video.username || 'Unknown User'}
                  </p>
                  <p className="text-gray-600 text-sm">
                    Submitted: {new Date(video.submittedAt).toLocaleString()}
                  </p>
                  {video.score && (
                    <p className="text-gray-600 text-sm font-medium mt-2">
                      Score: {video.score}/100
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Video Player and Evaluation Form */}
        <div className="lg:col-span-2">
          {selectedVideo ? (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#592538] mb-4">
                Evaluate Presentation - Question {selectedVideo.questionId}
              </h2>
              
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-6">
                <video
                  controls
                  className="w-full h-full"
                  src={selectedVideo.videoPath}
                  autoPlay
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              
              <div className="space-y-6">
                {/* Evaluation Criteria based on question number */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-[#592538] mb-3">Evaluation Criteria</h3>
                  
                  {selectedVideo && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-2">Question {selectedVideo.questionId}:</p>
                      <p className="font-medium">
                        {selectedVideo.questionId === 1 && "Explain a Simple Idea from Your Field"}
                        {selectedVideo.questionId === 2 && "Share an Important Update with Your Team"}
                        {selectedVideo.questionId === 3 && "Describe a Challenging Situation You Faced and How You Overcame It"}
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    {/* Content Clarity and Structure */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label htmlFor="contentClarity" className="block text-sm font-medium text-gray-700">
                          Content Clarity and Structure (0-10)
                        </label>
                        <span className="text-sm font-semibold text-[#592538]">{criteriaScores.contentClarity}</span>
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
                            <li>Explains idea clearly with simple, precise language</li>
                            <li>Follows logical structure with clear transitions</li>
                            <li>Content is accurate and relevant to the field</li>
                          </ul>
                        )}
                        {selectedVideo && selectedVideo.questionId === 2 && (
                          <ul className="list-disc list-inside space-y-1">
                            <li>Communicates update clearly with key details</li>
                            <li>Organized logically with clear beginning, middle, and end</li>
                            <li>Content is relevant, concise, and tailored to team needs</li>
                          </ul>
                        )}
                        {selectedVideo && selectedVideo.questionId === 3 && (
                          <ul className="list-disc list-inside space-y-1">
                            <li>Describes situation and resolution clearly with sufficient context</li>
                            <li>Follows logical narrative with smooth transitions</li>
                            <li>Content focuses on specific challenge and clear explanation of steps</li>
                          </ul>
                        )}
                      </div>
                    </div>
                    
                    {/* Engagement and Connection */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label htmlFor="engagement" className="block text-sm font-medium text-gray-700">
                          Engagement and Connection (0-10)
                        </label>
                        <span className="text-sm font-semibold text-[#592538]">{criteriaScores.engagement}</span>
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
                            <li>Uses vocal variety, appropriate pacing, and expressive delivery</li>
                            <li>Incorporates engaging techniques (examples, analogies)</li>
                            <li>Delivery feels natural and confident</li>
                          </ul>
                        )}
                        {selectedVideo && selectedVideo.questionId === 2 && (
                          <ul className="list-disc list-inside space-y-1">
                            <li>Uses confident and engaging tone with appropriate body language</li>
                            <li>Employs techniques like addressing team concerns and inclusive language</li>
                            <li>Delivery is natural and professional</li>
                          </ul>
                        )}
                        {selectedVideo && selectedVideo.questionId === 3 && (
                          <ul className="list-disc list-inside space-y-1">
                            <li>Uses storytelling techniques and emotional emphasis</li>
                            <li>Delivery is confident and authentic</li>
                            <li>Maintains audience interest by highlighting stakes and significance</li>
                          </ul>
                        )}
                      </div>
                    </div>
                    
                    {/* Impact and Persuasiveness */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label htmlFor="impact" className="block text-sm font-medium text-gray-700">
                          Impact and Persuasiveness (0-10)
                        </label>
                        <span className="text-sm font-semibold text-[#592538]">{criteriaScores.impact}</span>
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
                            <li>Conveys significance of the idea convincingly</li>
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
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Overall Score:</span>
                      <span className="text-lg font-bold text-[#592538]">{calculateTotalScore()} / 10</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Average of the three criteria scores</p>
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
            <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-center h-full">
              <p className="text-gray-500 text-lg">Select a video from the list to evaluate</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PresentationManagement;
