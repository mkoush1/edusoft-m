import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import DashboardLayout from "../components/DashboardLayout"; // Adjust the path as needed

const recommendedCourses = [
  {
    title: "Effective Communication Skills",
    institution: "Coursera",
    description:
      "Master the art of communication to deliver clear and impactful presentations.",
    duration: "20 hours",
    link: "https://www.coursera.org/learn/communication-skills",
    image: "/Coursera.png",
  },
  {
    title: "Presentation Skills Courses",
    institution: "Udemy",
    description:
      "Presentation Skills courses teach methods for effective communication of ideas to an audience. Sharpen your communication with fundamentals like speech structure, visual aids, and delivery techniques.",
    duration: "15 hours",
    link: "https://www.udemy.com/topic/presentation-skills/",
    image: "/Udemy.png",
  },
  {
    title: "Storytelling for Presentations",
    institution: "Future Learn",
    description:
      "Become a Better Presenter: Improve Your Public Speaking Skills Learn how to improve your presentation skills and add personality into your presentation style on this three-week course.",
    duration: "9 hours",
    link: "https://www.futurelearn.com/courses/become-a-better-presenter",
    image: "/Future Learn.png",
  },
];

const CourseCard = ({
  title,
  institution,
  description,
  duration,
  link,
  image,
}) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
    <div className="h-40 overflow-hidden">
      <img src={image} alt={title} className="w-full h-full object-cover" />
    </div>
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-[#592538]/80">
          {institution}
        </span>
        <span className="text-sm text-gray-500">{duration}</span>
      </div>
      <h3 className="text-lg font-bold text-[#592538] mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block px-4 py-2 bg-[#592538] text-white rounded-lg hover:bg-[#6d2c44] transition duration-300 text-sm"
      >
        Learn More
      </a>
    </div>
  </div>
);

const PresentationRecommendations = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [hasEvaluation, setHasEvaluation] = useState(false);
  const [averageScore, setAverageScore] = useState(null);
  
  useEffect(() => {
    const fetchUserSubmissions = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get(
          'http://localhost:5000/api/assessments/presentation/user-submissions',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const { submissions, hasEvaluation, averageScore } = response.data.data;
        setSubmissions(submissions);
        setHasEvaluation(hasEvaluation);
        setAverageScore(averageScore);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user submissions:', err);
        setError(err.message || 'Failed to fetch evaluation data');
        setLoading(false);
      }
    };

    fetchUserSubmissions();
  }, []);
  
  // Function to get question text based on question ID
  const getQuestionText = (questionId) => {
    switch (questionId) {
      case 1:
        return "Explain a Simple Idea from Your Field";
      case 2:
        return "Share an Important Update with Your Team";
      case 3:
        return "Describe a Challenging Situation You Faced and How You Overcame It";
      default:
        return `Question ${questionId}`;
    }
  };
  
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#FDF8F8] flex flex-col items-center py-8">
        <div className="w-full max-w-5xl flex justify-end mb-4 px-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 text-[#592538] bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-300"
          >
            Back to Dashboard
          </button>
        </div>
        
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mb-8 flex justify-center">
            <p className="text-[#592538]">Loading your assessment results...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mb-8">
            <h2 className="text-2xl font-bold text-[#592538] mb-4">Error</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mb-8">
            <h2 className="text-2xl font-bold text-[#592538] mb-4">
              No Submissions Found
            </h2>
            <p className="text-gray-600 mb-4">
              You haven't submitted any presentation videos yet.
            </p>
            <button
              onClick={() => navigate("/presentation-questions")}
              className="px-4 py-2 bg-[#592538] text-white rounded-lg hover:bg-[#6d2c44] transition duration-300"
            >
              Start Presentation Assessment
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mb-8">
            <h2 className="text-2xl font-bold text-[#592538] mb-4">
              Presentation Assessment Results
            </h2>
            
            {!hasEvaluation ? (
              <div className="mb-6">
                <p className="text-gray-600 italic">
                  Your submissions are pending evaluation. Check back later to see your results.
                </p>
              </div>
            ) : (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#592538] mb-2">
                  Scores
                </h3>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  {submissions.map((submission) => (
                    submission.score !== null && submission.score !== undefined && (
                      <li key={submission.questionId} className="mb-3">
                        <div>
                          <span className="font-medium">{getQuestionText(submission.questionId)}</span>
                          <div className="ml-2">
                            <div className="flex items-center">
                              <span className="text-sm text-gray-600">Score: </span>
                              <span className="ml-1 font-bold text-[#592538]">{submission.score}/10</span>
                            </div>
                            
                            {submission.criteriaScores && (
                              <div className="mt-1 ml-2 text-sm text-gray-600">
                                <div>Content Clarity: {submission.criteriaScores.contentClarity}/10</div>
                                <div>Engagement: {submission.criteriaScores.engagement}/10</div>
                                <div>Impact: {submission.criteriaScores.impact}/10</div>
                              </div>
                            )}
                            
                            {submission.feedback && (
                              <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                                <span className="font-medium">Feedback: </span>
                                <p className="mt-1 text-gray-600">{submission.feedback}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    )
                  ))}
                </ul>
                
                {averageScore !== null && (
                  <div className="mt-4 p-3 bg-[#FDF8F8] rounded-lg border border-[#592538]/20">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Overall Score:</span>
                      <span className="text-lg font-bold text-[#592538]">{averageScore}/10</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        <div className="max-w-5xl w-full">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-semibold text-[#592538] mb-6">
              Recommended Courses
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedCourses.map((course, idx) => (
                <CourseCard key={idx} {...course} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PresentationRecommendations;
