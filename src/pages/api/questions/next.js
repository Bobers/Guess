import { getAllProfiles, getAllQuestions, getSession } from '../../../lib/db';
import { selectNextQuestion } from '../../../engine/quiz';

export default async function handler(req, res) {
  try {
    const { sessionId } = req.query;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }
    
    // Get session data
    const session = await getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    if (session.status === 'completed') {
      return res.status(200).json({ 
        terminated: true,
        reason: 'session_already_completed'
      });
    }
    
    // Get all profiles and questions
    const [profiles, allQuestions] = await Promise.all([
      getAllProfiles(),
      getAllQuestions()
    ]);
    
    // Get questions that haven't been asked yet
    const askedQuestionIds = session.answers.map(a => a.question_id);
    const availableQuestions = allQuestions.filter(q => !askedQuestionIds.includes(q._id));
    
    if (availableQuestions.length === 0) {
      return res.status(200).json({ 
        terminated: true,
        reason: 'no_more_questions'
      });
    }
    
    // Convert session answers to the expected format
    const currentAnswers = {};
    for (const answer of session.answers) {
      currentAnswers[answer.question_id] = answer.answer;
    }
    
    // Select the next question
    const nextQuestion = selectNextQuestion(availableQuestions, currentAnswers, profiles);
    
    return res.status(200).json({
      terminated: false,
      question: nextQuestion,
      questionCount: session.answers.length + 1
    });
  } catch (error) {
    console.error('Error selecting next question:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}