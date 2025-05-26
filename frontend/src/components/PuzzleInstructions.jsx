import React from 'react';
import { useNavigate } from 'react-router-dom';

const PuzzleInstructions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FDF8F8] flex items-center justify-center py-8">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#592538] px-8 py-8 flex flex-col items-center relative">
          <div className="absolute left-8 top-8">
            {/* Optionally, you can add a puzzle icon SVG here */}
            <span className="text-white text-4xl">🧩</span>
          </div>
          <h1 className="text-3xl font-bold text-white z-10">Puzzle Game Assessment</h1>
        </div>
        {/* Info Cards */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 px-8 py-6 bg-[#F9F6F6]">
          <div className="flex-1 bg-white rounded-lg shadow p-4 text-center">
            <div className="text-xs text-gray-500 mb-1">Category</div>
            <div className="font-semibold text-[#592538]">Problem Solving</div>
          </div>
          <div className="flex-1 bg-white rounded-lg shadow p-4 text-center">
            <div className="text-xs text-gray-500 mb-1">Duration</div>
            <div className="font-semibold text-[#592538]">4 minutes</div>
          </div>
          <div className="flex-1 bg-white rounded-lg shadow p-4 text-center">
            <div className="text-xs text-gray-500 mb-1">Puzzle Size</div>
            <div className="font-semibold text-[#592538]">3 x 3</div>
          </div>
        </div>
        {/* Main Content */}
        <div className="px-8 py-6">
          <h2 className="text-lg font-bold text-[#592538] mb-2">About this Assessment</h2>
          <p className="mb-6 text-gray-700">
            Test your analytical and critical thinking abilities through real-world problem scenarios. This assessment evaluates your approach to complex problems, decision-making process, and ability to implement effective solutions. Discover your problem-solving strengths.
          </p>
          <h2 className="text-lg font-bold text-[#592538] mb-2">Instructions</h2>
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Solve the puzzle by arranging the tiles in order as shown in the example below.</li>
              <li>You have <b>4 minutes</b> to complete the puzzle.</li>
              <li>You can pause the game, but the timer will stop while paused.</li>
              <li>Try to solve the puzzle in as few moves as possible for a higher score.</li>
              <li>Review the grading criteria below to understand how your performance will be evaluated.</li>
            </ul>
            <div className="mt-4 flex flex-col items-center">
              <span className="font-semibold text-[#592538] mb-2">Example of a Solved Puzzle:</span>
              <img src="/puzzle_solution.jpg" alt="Example Solution" className="rounded border border-gray-300" style={{maxWidth: '220px'}} />
            </div>
            <div className="mt-4">
              <span className="font-semibold text-[#592538]">Grading Criteria:</span>
              <ul className="list-disc list-inside ml-4 mt-2 text-gray-700">
                <li><b>Excellent (100 points):</b> Solve the puzzle in ≤ 1 minute with few moves.</li>
                <li><b>Very Good (85 points):</b> Solve the puzzle in 1–2 minutes with few moves.</li>
                <li><b>Good (70 points):</b> Solve the puzzle in 2–3 minutes with few moves.</li>
                <li><b>Fair (50 points):</b> Solve the puzzle in 3–4 minutes with few moves.</li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 px-4 py-2 bg-gray-100 text-[#592538] rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => navigate('/assessment/puzzle-game/start')}
              className="flex-1 px-4 py-2 bg-[#592538] text-white rounded-lg font-semibold hover:bg-[#43202d] transition"
            >
              Start Assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PuzzleInstructions; 