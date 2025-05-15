import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import QuestionFlow from '../../components/QuestionFlow';

export default function Quiz() {
  const router = useRouter();
  const { sessionId } = router.query;
  
  const [question, setQuestion] = useState(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch the next question when the session ID is available
  useEffect(() => {
    if (sessionId) {
      fetchNextQuestion();
    }
  }, [sessionId]);

  // Function to fetch the next question
  const fetchNextQuestion = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/questions/next?sessionId=${sessionId}`);
      const data = await response.json();
      
      if (response.ok) {
        if (data.terminated) {
          // If quiz is terminated (no more questions or session completed)
          // Complete the session and go to results
          await completeSession();
        } else {
          // Set the next question
          setQuestion(data.question);
          setQuestionCount(data.questionCount);
        }
      } else {
        setError(data.error || 'Failed to fetch the next question');
      }
    } catch (error) {
      console.error('Error fetching question:', error);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to submit an answer
  const submitAnswer = async (questionId, answer) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          questionId,
          answer,
          sequenceNum: questionCount
        }),
      });
      
      if (response.ok) {
        // Fetch the next question
        await fetchNextQuestion();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to submit answer');
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to complete the session and go to results
  const completeSession = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });
      
      if (response.ok) {
        // Navigate to results page
        router.push(`/results/${sessionId}`);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to complete the session');
      }
    } catch (error) {
      console.error('Error completing session:', error);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!sessionId) {
    return <div>Loading...</div>;
  }

  return (
    <Layout title="Identify Your Ideal Customer Profile - guessright">
      <div className="max-w-3xl mx-auto">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {!error && (
          <QuestionFlow
            question={question}
            questionCount={questionCount}
            onAnswer={submitAnswer}
            isLoading={isLoading}
          />
        )}
      </div>
    </Layout>
  );
}