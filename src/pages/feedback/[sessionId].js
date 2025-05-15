import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import FeedbackComponent from '../../components/Feedback';

export default function FeedbackPage() {
  const router = useRouter();
  const { sessionId } = router.query;
  
  const [profileName, setProfileName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch session data when the session ID is available
  useEffect(() => {
    if (sessionId) {
      fetchSessionData();
    }
  }, [sessionId]);

  // Function to fetch session data
  const fetchSessionData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/sessions?id=${sessionId}`);
      const sessionData = await response.json();
      
      if (response.ok) {
        if (sessionData.status !== 'completed' || !sessionData.result) {
          setError('This session has not been completed yet');
        } else if (!sessionData.profile) {
          setError('Profile data not found');
        } else {
          // Set the profile name for the feedback form
          setProfileName(sessionData.profile.name);
        }
      } else {
        setError(sessionData.error || 'Failed to fetch session data');
      }
    } catch (error) {
      console.error('Error fetching session data:', error);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to submit feedback
  const submitFeedback = async (feedbackData) => {
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit feedback');
      }
      
      // Feedback submitted successfully
      return true;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError(error.message || 'An unexpected error occurred. Please try again later.');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  if (!sessionId) {
    return <div>Loading...</div>;
  }

  return (
    <Layout title="Provide Feedback - guessright">
      <div className="max-w-3xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <FeedbackComponent
            sessionId={sessionId}
            profileName={profileName}
            onSubmit={submitFeedback}
            isLoading={submitting}
          />
        )}
      </div>
    </Layout>
  );
}