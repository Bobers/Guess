/**
 * Update profile learning data based on session feedback
 * @param {string} profileId - ID of the matched profile
 * @param {Object} sessionAnswers - User's answers from the session
 * @param {boolean} isCorrect - Whether the match was correct (from feedback)
 */
async function updateProfileLearning(profileId, sessionAnswers, isCorrect) {
  if (!isCorrect) return; // Only learn from correct matches
  
  const { getDb } = require('../lib/db');
  const db = await getDb();
  const profile = await db.collection('profiles').findOne({ _id: profileId });
  
  if (!profile) return;
  
  // Initialize learning object if it doesn't exist
  const learning = profile.learning || {};
  
  // Update learning for each question answered in this session
  for (const [questionId, userAnswer] of Object.entries(sessionAnswers)) {
    // Initialize question learning data if it doesn't exist
    if (!learning[questionId]) {
      learning[questionId] = { yes: 0, no: 0, unsure: 0, total: 0 };
    }
    
    // Increment appropriate counter
    learning[questionId][userAnswer]++;
    learning[questionId].total++;
    
    // If we have enough data, potentially update the profile's answer
    if (learning[questionId].total >= 5) {
      // Find the most common answer
      const counts = learning[questionId];
      let bestAnswer = 'unsure';
      let bestCount = counts.unsure;
      
      if (counts.yes > bestCount) {
        bestAnswer = 'yes';
        bestCount = counts.yes;
      }
      
      if (counts.no > bestCount) {
        bestAnswer = 'no';
        bestCount = counts.no;
      }
      
      // Calculate confidence in this answer
      const confidence = bestCount / counts.total;
      
      // Only update the profile answer if we're confident
      if (confidence >= 0.6) {
        await db.collection('profiles').updateOne(
          { _id: profileId },
          { $set: { [`answers.${questionId}`]: bestAnswer } }
        );
      }
    }
  }
  
  // Save the updated learning data
  await db.collection('profiles').updateOne(
    { _id: profileId },
    { $set: { learning: learning, updated_at: new Date() } }
  );
}

module.exports = {
  updateProfileLearning
};