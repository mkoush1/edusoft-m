import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import communicationService from '../services/communication.service';

const CommunicationAssessment = () => {
  const [loading, setLoading] = useState(true);
  const [assessmentData, setAssessmentData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await communicationService.getAggregatedAssessments();
        if (response && response.success) {
          setAssessmentData(response.data);
        }
      } catch (error) {
        console.error('Error fetching communication assessment data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAssessmentSelection = (type) => {
    switch (type) {
      case 'reading':
        navigate('/assessment/reading');
        break;
      case 'writing':
        navigate('/assessment/writing');
        break;
      case 'listening':
        navigate('/assessment/listening');
        break;
      case 'speaking':
        navigate('/assessment/speaking');
        break;
      default:
        break;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-[#592538] mb-6">Communication Skills Assessment</h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#592538]"></div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <p className="text-gray-700 mb-4">
                  Effective communication is essential in both personal and professional settings. This assessment evaluates your reading, writing, listening, and speaking skills to help you identify areas for improvement.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-lg mb-2">Assessment Progress</h3>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div 
                      className="bg-[#592538] h-2.5 rounded-full" 
                      style={{ width: `${assessmentData?.completionPercentage || 0}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {assessmentData?.completionPercentage ? `${Math.round(assessmentData.completionPercentage)}% complete` : 'Start your assessment journey'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AssessmentCard 
                  title="Reading Assessment"
                  description="Evaluate your ability to comprehend written text and extract key information."
                  completed={assessmentData?.completionStatus?.reading || false}
                  score={assessmentData?.aggregatedScores?.reading}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  }
                  onClick={() => handleAssessmentSelection('reading')}
                />
                
                <AssessmentCard 
                  title="Writing Assessment"
                  description="Assess your written communication skills, clarity, and organization."
                  completed={assessmentData?.completionStatus?.writing || false}
                  score={assessmentData?.aggregatedScores?.writing}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  }
                  onClick={() => handleAssessmentSelection('writing')}
                />
                
                <AssessmentCard 
                  title="Listening Assessment"
                  description="Evaluate your ability to listen effectively and process auditory information."
                  completed={assessmentData?.completionStatus?.listening || false}
                  score={assessmentData?.aggregatedScores?.listening}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  }
                  onClick={() => handleAssessmentSelection('listening')}
                />
                
                <AssessmentCard 
                  title="Speaking Assessment"
                  description="Assess your verbal communication, clarity, and presentation skills."
                  completed={assessmentData?.completionStatus?.speaking || false}
                  score={assessmentData?.aggregatedScores?.speaking}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  }
                  onClick={() => handleAssessmentSelection('speaking')}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

// Helper component for assessment cards
const AssessmentCard = ({ title, description, completed, score, icon, onClick }) => {
  return (
    <div 
      className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center mb-3">
        <div className="mr-3 text-[#592538]">
          {icon}
        </div>
        <h3 className="font-semibold text-lg">{title}</h3>
      </div>
      <p className="text-gray-600 mb-4">{description}</p>
      
      <div className="flex items-center justify-between">
        {completed ? (
          <div className="flex items-center">
            <span className="text-xl font-bold mr-2">{score}%</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              Completed
            </span>
          </div>
        ) : (
          <span className="text-sm text-gray-500">Not started</span>
        )}
        
        <button className="text-[#592538] hover:text-[#6d2c44] font-medium">
          {completed ? 'Review' : 'Start'}
        </button>
      </div>
    </div>
  );
};

export default CommunicationAssessment; 