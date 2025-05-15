import React, { useState } from 'react';

export default function QuestionFlow({ question, questionCount, onAnswer, isLoading }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
    onAnswer(question._id, answer);
  };

  if (!question) return null;

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Question {questionCount}
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Help us understand your ideal customer
        </p>
      </div>
      <div className="border-t border-gray-200">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-xl font-medium text-gray-900 mb-8">
            {question.text}
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <button
              onClick={() => handleAnswer('yes')}
              disabled={isLoading}
              className={`py-4 px-6 border rounded-lg shadow-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                ${selectedAnswer === 'yes' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
            >
              Yes
            </button>

            <button
              onClick={() => handleAnswer('no')}
              disabled={isLoading}
              className={`py-4 px-6 border rounded-lg shadow-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                ${selectedAnswer === 'no' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
            >
              No
            </button>

            <button
              onClick={() => handleAnswer('unsure')}
              disabled={isLoading}
              className={`py-4 px-6 border rounded-lg shadow-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                ${selectedAnswer === 'unsure' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
            >
              Not Sure
            </button>
          </div>

          {isLoading && (
            <div className="mt-6 flex justify-center">
              <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}