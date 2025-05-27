import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getAssessmentResults } from "../services/api";

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

const LeadershipRecommendations = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const recommendedCourses = [
    {
      title: "Leadership Skills",
      institution: "IIM Ahmedabad",
      description:
        "Gain comprehensive leadership skills with insights into mindfulness, inner stability, and positive strengths. Learn from top industry experts and develop essential management capabilities.",
      duration: "46 hours",
      link: "https://www.coursera.org/learn/leadershipskills",
      image: "/Coursera.png",
    },
    {
      title: "Leadership and Management",
      institution: "Harvard Business School",
      description:
        "Develop your ability to lead with purpose and create value through a comprehensive exploration of leadership principles and organizational dynamics.",
      duration: "6-8 weeks",
      link: "https://online.hbs.edu/subjects/leadership-management/",
      image: "/Harvard.png",
    },
    {
      title: "Leadership vs Management",
      institution: "Oxford Home Study",
      description:
        "Understand the key differences between leadership and management while developing practical skills for organizational success.",
      duration: "20 hours",
      link: "https://www.oxfordhomestudy.com/courses/leadership-courses-online/leadership-v-management-free",
      image: "/oxford.png",
    },
  ];

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await getAssessmentResults("leadership");
        setResults(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load assessment results");
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F8] flex items-center justify-center">
        <div className="text-[#592538] text-xl">Loading results...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FDF8F8] flex items-center justify-center">
        <div className="text-[#592538] text-xl">{error}</div>
      </div>
    );
  }

  const sections = [
    { name: "Vision", score: results?.scores?.vision || 0 },
    { name: "Ethics", score: results?.scores?.ethics || 0 },
    { name: "Communication", score: results?.scores?.communication || 0 },
    { name: "Team Management", score: results?.scores?.teamManagement || 0 },
    { name: "Decision Making", score: results?.scores?.decisionMaking || 0 },
    {
      name: "Emotional Intelligence",
      score: results?.scores?.emotionalIntelligence || 0,
    },
    { name: "Adaptability", score: results?.scores?.adaptability || 0 },
    { name: "Innovation", score: results?.scores?.innovation || 0 },
    { name: "Development", score: results?.scores?.development || 0 },
  ];

  return (
    <div className="min-h-screen bg-[#FDF8F8] py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#592538]">
              Leadership Assessment Results
            </h1>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 text-[#592538] bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-300"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-[#592538] mb-4">
                Your Leadership Profile
              </h2>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sections}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#6b7280" }}
                      tickLine={{ stroke: "#6b7280" }}
                    />
                    <YAxis
                      domain={[0, 5]}
                      tick={{ fill: "#6b7280" }}
                      tickLine={{ stroke: "#6b7280" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "0.5rem",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="score" fill="#592538" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recommendations Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-[#592538] mb-4">
                Key Recommendations
              </h2>
              <div className="space-y-4">
                {results?.recommendations?.map((rec, index) => (
                  <div key={index} className="p-4 bg-[#592538]/5 rounded-lg">
                    <h3 className="font-semibold text-[#592538] mb-2">
                      {rec.area}
                    </h3>
                    <p className="text-gray-600 text-sm">{rec.suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Next Steps Section */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-[#592538] mb-4">
                Next Steps
              </h2>
              <p className="text-gray-600 mb-4">
                Based on your assessment results, we recommend focusing on the
                following areas:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results?.nextSteps?.map((step, index) => (
                  <div key={index} className="p-4 bg-[#592538]/5 rounded-lg">
                    <div className="flex items-start">
                      <span className="text-[#592538] mr-3 text-lg">•</span>
                      <p className="text-gray-600">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* New Recommended Courses Section */}
        <div className="mt-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-[#592538] mb-2">
                Recommended Leadership Courses
              </h2>
              <p className="text-gray-600">
                Based on your assessment results, we recommend these courses to
                strengthen your leadership skills:
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedCourses.map((course, index) => (
                <CourseCard key={index} {...course} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadershipRecommendations;
