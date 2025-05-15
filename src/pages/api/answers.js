import { addAnswerToSession, updateQuestionAskedCount } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { sessionId, questionId, answer, sequenceNum } = req.body;
    
    if (!sessionId || !questionId || !answer) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Validate answer value
    const validAnswers = ['yes', 'no', 'unsure'];
    if (!validAnswers.includes(answer)) {
      return res.status(400).json({ error: 'Invalid answer value' });
    }
    
    // Add answer to session
    await addAnswerToSession(
      sessionId,
      questionId,
      answer,
      sequenceNum || 0
    );
    
    // Update question metrics
    await updateQuestionAskedCount(questionId);
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error recording answer:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}