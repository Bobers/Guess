import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const startQuiz = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok && data.sessionId) {
        router.push(`/quiz/${data.sessionId}`);
      } else {
        console.error('Failed to create session');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error creating session:', error);
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Discover Your Ideal Customer Profile
              </h1>
              <p className="mt-4 text-lg text-gray-500">
                Answer a few simple questions to identify the most promising market segment for your business.
              </p>
            </div>
            
            <div className="prose prose-blue max-w-none">
              <h2>How it works</h2>
              <ol>
                <li>Answer a series of yes/no questions about your target customer</li>
                <li>Our system analyzes your responses to match with potential profiles</li>
                <li>Get detailed marketing recommendations tailored to your ideal customer</li>
                <li>Provide feedback to help our system improve over time</li>
              </ol>
              
              <h2>Benefits</h2>
              <ul>
                <li>Focus your marketing efforts on the right audience</li>
                <li>Learn actionable insights about your ideal customers</li>
                <li>Save time and resources by targeting the most promising segments</li>
                <li>Improve your messaging with segment-specific recommendations</li>
              </ul>
            </div>
            
            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={startQuiz}
                disabled={isLoading}
                className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Starting...' : 'Start Identifying Your Ideal Customer'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}