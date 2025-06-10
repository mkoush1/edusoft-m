import React from "react";
import { useNavigate } from "react-router-dom";

const AssessmentCard = ({ assessment, onViewResults }) => {
  const navigate = useNavigate();
  const isCompleted = assessment.completed;

  const handleAssessmentStart = () => {
    if (isCompleted && onViewResults) {
      onViewResults(assessment);
      return;
    }
    const normalizedCategory = assessment.category
      ? assessment.category.trim().toLowerCase().replace(/[-_]/g, " ")
      : "";
    
    // Special handling for Communication Skills Assessment
    if (
      normalizedCategory === "communication" || 
      assessment.title === 'Communication Skills Assessment' || 
      assessment.title?.toLowerCase().includes('communication')
    ) {
      navigate("/communication-assessment");
      return;
    }
    
    // Main dashboard Problem Solving card (go to 3-card selection page)
    if (
      normalizedCategory === "problem solving" &&
      (assessment._id === "problem-solving" || assessment.title?.toLowerCase().includes("skills assessment"))
    ) {
      navigate("/assessment/problem-solving");
    }
    // Puzzle Game card (go to puzzle instructions page)
    else if (assessment._id === "puzzle-game") {
      navigate("/assessment/puzzle-game/instructions");
    }
    // Fast Questions card (go to instructions page first)
    else if (assessment._id === "fast-questions") {
      navigate("/assessment/instructions/fast-questions");
    }
    // Codeforces Link card (add your route if exists)
    else if (assessment._id === "codeforces-link") {
      navigate("/assessment/codeforces-link");
    }
    // LeetCode assessment
    else if (
      assessment._id === "leetcode" || 
      assessment.category?.toLowerCase() === "leetcode" ||
      assessment.title?.toLowerCase().includes("leetcode")
    ) {
      navigate("/assessment/leetcode");
    }
    // Presentation skills
    else if (normalizedCategory === "presentation") {
      navigate("/presentation-assessment");
    }
    // Leadership
    else if (normalizedCategory === "leadership") {
      localStorage.setItem('currentQuizCategory', 'leadership');
      navigate("/assessment/instructions/leadership");
    }
    // Adaptability & Flexibility card (go to instructions page first)
    else if (
      normalizedCategory === "adaptability and flexibility" ||
      assessment._id === "adaptability" ||
      assessment.title?.toLowerCase().includes("adaptability")
    ) {
      navigate("/assessment/instructions/adaptability");
    }
    // Default navigation
    else {
      navigate(`/assessment/${assessment._id}`);
    }
  };

  console.log('Assessment category:', assessment.category);
  const getDefaultImage = (category) => {
    console.log('Getting image for category:', category);
    
    if (!category) {
      console.log('No category provided, using default logo');
      return "/eduSoft_logo.png";
    }
    
    // Normalize the category name for comparison
    const normalizedCategory = category.toString().toLowerCase().trim();
    
    if (normalizedCategory.includes('adaptability') || normalizedCategory.includes('flexibility')) {
      return "/Adaptability-and-Flexibility.jpg";
    } else if (normalizedCategory.includes('communication')) {
      return "/Communication.jpeg";
    } else if (normalizedCategory.includes('leadership')) {
      return "/leadership.jpeg";
    } else if (normalizedCategory.includes('presentation')) {
      return "/presentation-skills.jpg";
    } else if (normalizedCategory.includes('problem') || normalizedCategory.includes('solving')) {
      return "/Problem-Solving.jpg";
    } else if (normalizedCategory.includes('leetcode')) {
      return "/leetcode.jpg";
    }
    
    console.log('No matching image found for category:', category);
    return "/eduSoft_logo.png";
  };

  // Use the assessment's image if it exists and is not the default logo, otherwise use the default for the category
  const imagePath = assessment.image && !assessment.image.includes('eduSoft_logo.png') 
    ? assessment.image 
    : getDefaultImage(assessment.category);
    
  console.log('Image path:', imagePath, 'for category:', assessment.category);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition duration-300 flex flex-col h-full">
      <div className="h-48 bg-gray-100">
        <img
          src={imagePath} onError={(e) => console.error(`Image failed to load for ${assessment.category}:`, e.target.src)}
          alt={assessment.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 flex flex-col h-full">
        <div className="flex-grow">
          <h3 className="text-xl font-semibold text-[#592538] mb-2">
            {assessment.title}
          </h3>
          <p className="text-gray-600 mb-4">{assessment.description}</p>
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <span className="flex items-center">
              <span className="mr-2">⏱️</span>
              {assessment.duration} minutes
            </span>
            <span className="mx-2">•</span>
            <span className="flex items-center">
              <span className="mr-2">📋</span>
              {assessment.category}
            </span>
          </div>
          {isCompleted && (
            <div className="mb-2 text-sm text-gray-700">
              <div>Score: <span className="font-bold text-[#592538]">{Math.round(assessment.score)}%</span></div>
              <div>Completed on: {assessment.completedAt ? new Date(assessment.completedAt).toLocaleDateString() : ''}</div>
            </div>
          )}
        </div>
        {isCompleted ? (
          <button
            onClick={() => onViewResults && onViewResults(assessment)}
            className="w-full px-4 py-2 bg-[#592538] text-white rounded-lg hover:bg-[#6d2c44] transition duration-300"
          >
            View Results
          </button>
        ) : (
          <button
            onClick={handleAssessmentStart}
            className="w-full px-4 py-2 bg-[#592538] text-white rounded-lg hover:bg-[#6d2c44] transition duration-300"
          >
            Start Assessment
          </button>
        )}
      </div>
    </div>
  );
};

export default AssessmentCard;
