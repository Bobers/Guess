import { getDb } from '../../lib/db';

export default async function handler(req, res) {
  try {
    // Check database connection
    const db = await getDb();
    await db.command({ ping: 1 });
    
    res.status(200).json({ status: 'healthy' });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
}