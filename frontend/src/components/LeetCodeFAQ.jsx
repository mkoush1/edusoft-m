import React, { useState } from 'react';

const LeetCodeFAQ = () => {
  const [openQuestion, setOpenQuestion] = useState(null);

  const faqs = [
    {
      question: "What is the LeetCode assessment?",
      answer: "The LeetCode assessment is a coding challenge that tests your programming and problem-solving skills. You'll need to solve specific problems on LeetCode to demonstrate your abilities."
    },
    {
      question: "How does the verification process work?",
      answer: "We verify your LeetCode account by asking you to add a unique verification code to your LeetCode profile bio. This ensures that you own the account you're linking."
    },
    {
      question: "What types of problems will I need to solve?",
      answer: "You'll be assigned 3 easy-level problems from LeetCode. These problems test fundamental programming concepts and algorithmic thinking."
    },
    {
      question: "How is my score calculated?",
      answer: "Your score is based on the number of assigned problems you successfully solve. Each problem is worth approximately 33.33% of the total score."
    },
    {
      question: "Can I retry if I fail a problem?",
      answer: "Yes, you can retry problems as many times as needed. The assessment tracks whether you've successfully solved each problem, not how many attempts it took."
    },
    {
      question: "How long do I have to complete the assessment?",
      answer: "There's no strict time limit, but we recommend completing the assessment within a reasonable timeframe. You can check your progress at any time."
    }
  ];

  const toggleQuestion = (index) => {
    if (openQuestion === index) {
      setOpenQuestion(null);
    } else {
      setOpenQuestion(index);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <h2 className="text-xl font-bold text-[#592538] mb-4">Frequently Asked Questions</h2>
      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b border-gray-200 pb-3">
            <button
              className="flex justify-between items-center w-full text-left font-medium text-gray-700 hover:text-[#592538] transition-colors focus:outline-none"
              onClick={() => toggleQuestion(index)}
            >
              <span>{faq.question}</span>
              <svg
                className={`w-5 h-5 transform ${openQuestion === index ? 'rotate-180' : ''} transition-transform`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            {openQuestion === index && (
              <div className="mt-2 text-gray-600 text-sm">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeetCodeFAQ;
