import { createSession, getSession, getProfileById } from '../../lib/db';

export default async function handler(req, res) {
  try {
    // Create new session
    if (req.method === 'POST') {
      const sessionId = await createSession();
      return res.status(200).json({ sessionId });
    }
    
    // Get session with profile data
    if (req.method === 'GET') {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ error: 'Session ID is required' });
      }
      
      const session = await getSession(id);
      
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      
      // If session is completed, get the profile data
      let profile = null;
      if (session.status === 'completed' && session.result) {
        profile = await getProfileById(session.result);
      }
      
      return res.status(200).json({
        ...session,
        profile
      });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling session:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}