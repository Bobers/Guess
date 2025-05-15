import React, { useState } from 'react';
import Link from 'next/link';

export default function Feedback({ sessionId, profileName, onSubmit, isLoading }) {
  const [isCorrect, setIsCorrect] = useState(null);
  const [suggestedProfile, setSuggestedProfile] = useState('');
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    onSubmit({
      sessionId,
      isCorrect: isCorrect === 'yes',
      suggestedProfile: isCorrect === 'no' ? suggestedProfile : null,
      comments
    });
    
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Thank you for your feedback!
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Your feedback helps us improve our customer profile recommendations.
          </p>
          <div className="mt-5">
            <Link href="/">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Start Over
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Feedback
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Help us improve our recommendations
        </p>
      </div>
      
      <div className="border-t border-gray-200">
        <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Was our match accurate?</h3>
              <p className="mt-1 text-sm text-gray-500">
                We identified <span className="font-medium">{profileName}</span> as your ideal customer profile.
              </p>
              
              <div className="mt-4 space-y-4">
                <div className="flex items-center">
                  <input
                    id="correct-yes"
                    name="correct"
                    type="radio"
                    checked={isCorrect === 'yes'}
                    onChange={() => setIsCorrect('yes')}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <label htmlFor="correct-yes" className="ml-3 block text-sm font-medium text-gray-700">
                    Yes, this is accurate
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="correct-partially"
                    name="correct"
                    type="radio"
                    checked={isCorrect === 'partially'}
                    onChange={() => setIsCorrect('partially')}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <label htmlFor="correct-partially" className="ml-3 block text-sm font-medium text-gray-700">
                    Partially accurate
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="correct-no"
                    name="correct"
                    type="radio"
                    checked={isCorrect === 'no'}
                    onChange={() => setIsCorrect('no')}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <label htmlFor="correct-no" className="ml-3 block text-sm font-medium text-gray-700">
                    No, this is not accurate
                  </label>
                </div>
              </div>
            </div>
            
            {isCorrect === 'no' && (
              <div>
                <label htmlFor="suggested-profile" className="block text-sm font-medium text-gray-700">
                  What would be a better profile for your customer?
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="suggested-profile"
                    id="suggested-profile"
                    value={suggestedProfile}
                    onChange={(e) => setSuggestedProfile(e.target.value)}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="e.g. Enterprise Marketing Director"
                  />
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="comments" className="block text-sm font-medium text-gray-700">
                Additional comments
              </label>
              <div className="mt-1">
                <textarea
                  id="comments"
                  name="comments"
                  rows={3}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Any additional feedback about our recommendation"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Link href="/">
                <button
                  type="button"
                  className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                disabled={isLoading || isCorrect === null}
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  (isLoading || isCorrect === null) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}