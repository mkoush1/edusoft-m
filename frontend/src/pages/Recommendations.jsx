import React from 'react';
import { Link } from 'react-router-dom';

const skillCategories = [
  {
    category: "Adaptability and Flexibility",
    description: "Courses to enhance your ability to adapt to changing situations and environments",
    courses: [
      {
        title: "Adaptive Leadership",
        description: "Learn how to lead through change and uncertainty",
        link: "https://www.coursera.org/adaptive-leadership"
      },
      {
        title: "Agile Thinking",
        description: "Develop skills for rapid problem-solving and decision-making",
        link: "https://www.udemy.com/agile-thinking"
      }
    ]
  },
  {
    category: "Communication",
    description: "Courses to improve your verbal and written communication skills",
    courses: [
      {
        title: "Effective Communication",
        description: "Master the art of clear and impactful communication",
        link: "https://www.coursera.org/effective-communication"
      },
      {
        title: "Business Writing",
        description: "Professional writing skills for the workplace",
        link: "https://www.udemy.com/business-writing"
      }
    ]
  },
  {
    category: "Leadership",
    description: "Courses to develop your leadership capabilities",
    courses: [
      {
        title: "Leadership Fundamentals",
        description: "Core concepts of effective leadership",
        link: "https://www.oxfordhomestudy.com/courses/leadership-courses-online/leadership-v-management-free"
      },
      {
        title: "Team Leadership",
        description: "Leading and managing teams effectively",
        link: "https://www.coursera.org/team-leadership"
      }
    ]
  },
  {
    category: "Presentation",
    description: "Courses to enhance your presentation skills",
    courses: [
      {
        title: "Presentation Skills",
        description: "Master the art of presenting effectively",
        link: "https://www.futurelearn.com/courses/become-a-better-presenter"
      },
      {
        title: "Visual Storytelling",
        description: "Create compelling visual presentations",
        link: "https://www.udemy.com/visual-storytelling"
      }
    ]
  },
  {
    category: "Problem Solving",
    description: "Courses to develop your analytical and problem-solving skills",
    courses: [
      {
        title: "Critical Thinking",
        description: "Enhance your analytical reasoning skills",
        link: "https://www.coursera.org/critical-thinking"
      },
      {
        title: "Decision Making",
        description: "Effective decision-making strategies",
        link: "https://www.udemy.com/decision-making"
      }
    ]
  }
];

const Recommendations = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Recommended Courses</h1>
        <Link
          to="/dashboard"
          className="inline-block px-5 py-2 bg-[#592538] text-white rounded-lg shadow hover:bg-[#6d2c44] transition duration-300 font-semibold"
        >
          ← Back to Dashboard
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skillCategories.map((category, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300">
            <h2 className="text-xl font-semibold text-[#592538] mb-4">{category.category}</h2>
            <p className="text-gray-600 mb-6">{category.description}</p>
            
            <div className="space-y-4">
              {category.courses.map((course, courseIdx) => (
                <div key={courseIdx} className="flex items-start space-x-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900">{course.title}</h3>
                    <p className="text-sm text-gray-500">{course.description}</p>
                  </div>
                  <Link
                    to={course.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-white bg-[#592538] hover:bg-[#4a1d2d]"
                  >
                    Enroll Now
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
