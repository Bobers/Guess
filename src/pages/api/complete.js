import { 
  completeSession, 
  getSession, 
  getAllProfiles,
  incrementProfileFrequency
} from '../../lib/db';
import { 
  calculateProfileScores, 
  getBestMatch
} from '../../engine/matcher';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }
    
    // Get session data
    const session = await getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    if (session.status === 'completed') {
      return res.status(400).json({ error: 'Session already completed' });
    }
    
    // Get all profiles
    const profiles = await getAllProfiles();
    
    // Convert session answers to the expected format
    const currentAnswers = {};
    for (const answer of session.answers) {
      currentAnswers[answer.question_id] = answer.answer;
    }
    
    // Calculate scores and find best match
    const scores = calculateProfileScores(currentAnswers, profiles);
    const result = getBestMatch(scores, profiles, session.answers.length);
    
    // Complete the session
    await completeSession(sessionId, result.profile?._id, result.confidence);
    
    // Increment profile frequency
    if (result.profile) {
      await incrementProfileFrequency(result.profile._id);
    }
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error completing session:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}