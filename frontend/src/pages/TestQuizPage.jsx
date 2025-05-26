import React from 'react';
import { useParams, Link } from 'react-router-dom';

const TestQuizPage = () => {
  const { category } = useParams();
  
  console.log('TestQuizPage rendered with category:', category);
  
  return (
    <div className="min-h-screen bg-[#FDF8F8] py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden p-8">
          <h1 className="text-3xl font-bold text-[#592538] mb-6">Test Quiz Page</h1>
          <p className="text-lg mb-4">Category: <span className="font-semibold">{category}</span></p>
          <p className="mb-8">This is a test page to verify routing is working correctly.</p>
          
          <div className="flex gap-4">
            <Link 
              to="/dashboard" 
              className="px-6 py-3 bg-gray-100 text-[#592538] rounded-lg hover:bg-gray-200 transition duration-300"
            >
              Back to Dashboard
            </Link>
            <Link 
              to="/assessments" 
              className="px-6 py-3 bg-[#592538] text-white rounded-lg hover:bg-[#6d2c44] transition duration-300"
            >
              View All Assessments
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestQuizPage;
