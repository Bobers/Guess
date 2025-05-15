/**
 * Calculate profile scores based on user answers
 * @param {Object} answers - User's answers {questionId: answer}
 * @param {Array} profiles - All available profiles
 * @returns {Object} - Scores for each profile
 */
function calculateProfileScores(answers, profiles) {
  const scores = {};
  
  // Initialize scores for all profiles
  for (const profile of profiles) {
    scores[profile._id] = 0;
  }
  
  // Calculate score for each profile based on answers
  for (const [questionId, userAnswer] of Object.entries(answers)) {
    for (const profile of profiles) {
      // Skip if profile doesn't have an expected answer for this question
      if (!profile.answers || !profile.answers[questionId]) continue;
      
      const profileAnswer = profile.answers[questionId];
      
      // Calculate score based on answer match
      if (userAnswer === profileAnswer) {
        // Perfect match
        scores[profile._id] += 1;
      } else if (userAnswer === 'unsure' || profileAnswer === 'unsure') {
        // Partial match when either side is unsure
        scores[profile._id] += 0.5;
      }
      // No points for yes/no mismatch
    }
  }
  
  return scores;
}

/**
 * Get the best matching profile based on scores
 * @param {Object} scores - Profile scores
 * @param {Array} profiles - All available profiles
 * @param {number} answerCount - Number of answers provided
 * @returns {Object} - Best matching profile and confidence
 */
function getBestMatch(scores, profiles, answerCount) {
  // Sort profiles by score (highest first)
  const sortedScores = Object.entries(scores)
    .sort((a, b) => b[1] - a[1]);
  
  if (sortedScores.length === 0) {
    return { profile: null, confidence: 0 };
  }
  
  const topProfileId = sortedScores[0][0];
  const topProfile = profiles.find(p => p._id === topProfileId);
  
  // Calculate confidence
  let confidence;
  
  // If we have at least two profiles to compare
  if (sortedScores.length >= 2) {
    const topScore = sortedScores[0][1];
    const runnerUpScore = sortedScores[1][1];
    
    // Calculate separation between top two profiles
    const separation = (topScore - runnerUpScore) / Math.max(topScore, 0.001);
    
    // Calculate raw score as percentage of maximum possible
    const rawScore = topScore / Math.max(answerCount, 1);
    
    // Blend the two metrics (70% raw score, 30% separation)
    confidence = (rawScore * 0.7) + (separation * 0.3);
  } else {
    // If only one profile, just use raw score
    confidence = sortedScores[0][1] / Math.max(answerCount, 1);
  }
  
  return {
    profile: topProfile,
    confidence,
    alternativeProfiles: sortedScores.slice(1, 4).map(([profileId, score]) => ({
      profile: profiles.find(p => p._id === profileId),
      score
    }))
  };
}

module.exports = {
  calculateProfileScores,
  getBestMatch
};