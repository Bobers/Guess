import { addFeedbackToSession, getSession } from '../../lib/db';
import { updateProfileLearning } from '../../engine/learner';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { sessionId, isCorrect, suggestedProfile, comments } = req.body;
    
    if (!sessionId || isCorrect === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Get session to access answers
    const session = await getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Add feedback to session
    await addFeedbackToSession(
      sessionId,
      isCorrect,
      suggestedProfile || null,
      comments || ''
    );
    
    // Convert session answers to the expected format for learning
    const sessionAnswers = {};
    for (const answer of session.answers) {
      sessionAnswers[answer.question_id] = answer.answer;
    }
    
    // Update learning data if match was correct
    if (isCorrect && session.result) {
      await updateProfileLearning(session.result, sessionAnswers, true);
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error recording feedback:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}