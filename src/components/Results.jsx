import React from 'react';
import Link from 'next/link';

export default function Results({ result, sessionId }) {
  const { profile, confidence, alternativeProfiles } = result;
  
  if (!profile) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            We couldn't find a matching profile
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Based on your answers, we couldn't identify a clear customer profile match.
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

  // Format confidence as percentage
  const confidencePercent = Math.round(confidence * 100);
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Your Ideal Customer Profile
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          We've identified your ideal customer profile with {confidencePercent}% confidence.
        </p>
      </div>
      
      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3">{profile.name}</h3>
        <p className="text-gray-700 mb-6">{profile.description}</p>
        
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
            Customer Attributes
          </h4>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            {Object.entries(profile.attributes).map(([key, value]) => (
              <div key={key} className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 capitalize">{key.replace(/_/g, ' ')}</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        
        <div className="mb-8">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
            Marketing Recommendations
          </h4>
          <ul className="list-disc pl-5 space-y-2">
            {profile.marketing_recommendations.map((rec, index) => (
              <li key={index} className="text-gray-700">{rec}</li>
            ))}
          </ul>
        </div>
        
        {alternativeProfiles && alternativeProfiles.length > 0 && (
          <div className="mt-8">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              Alternative Profiles
            </h4>
            <ul className="divide-y divide-gray-200">
              {alternativeProfiles.map(({ profile, score }) => (
                <li key={profile._id} className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{profile.name}</p>
                      <p className="text-sm text-gray-500">{profile.description}</p>
                    </div>
                    <div className="text-sm font-medium text-blue-600">
                      {Math.round((score / result.profile.score) * 100)}% match
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="mt-8 flex justify-between">
          <Link href={`/feedback/${sessionId}`}>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Provide Feedback
            </button>
          </Link>
          
          <Link href="/">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Start Over
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}