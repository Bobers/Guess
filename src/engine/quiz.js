/**
 * Select the next question to ask
 * @param {Array} availableQuestions - Questions that haven't been asked
 * @param {Object} currentAnswers - User's answers so far
 * @param {Array} profiles - All available profiles
 * @returns {Object} - The next question to ask
 */
function selectNextQuestion(availableQuestions, currentAnswers, profiles) {
  // If no answers yet, start with most general question or the lowest order
  if (Object.keys(currentAnswers).length === 0) {
    availableQuestions.sort((a, b) => a.order - b.order);
    return availableQuestions[0];
  }
  
  // Filter profiles that match the current answers
  const potentialMatches = profiles.filter(profile => {
    for (const [questionId, userAnswer] of Object.entries(currentAnswers)) {
      // Skip if profile doesn't have this answer defined
      if (!profile.answers || !profile.answers[questionId]) continue;
      
      const profileAnswer = profile.answers[questionId];
      
      // Filter out profiles that have definite mismatches
      if (userAnswer !== 'unsure' && profileAnswer !== 'unsure' && userAnswer !== profileAnswer) {
        return false;
      }
    }
    return true;
  });
  
  // If only one potential match remains, we're done
  if (potentialMatches.length <= 1) {
    // Just return a random question
    return availableQuestions[0];
  }
  
  // Calculate "information gain" for each question using a simplified approach
  // Find question that divides remaining profiles most evenly
  let bestQuestion = null;
  let bestSplitScore = -Infinity;
  
  for (const question of availableQuestions) {
    const answers = { yes: 0, no: 0, unsure: 0 };
    
    // Count expected answers for this question across potential matches
    for (const profile of potentialMatches) {
      if (!profile.answers || !profile.answers[question._id]) {
        answers.unsure++;
        continue;
      }
      
      const answer = profile.answers[question._id];
      answers[answer]++;
    }
    
    // Calculate how well this question splits the remaining profiles
    // A perfect split would have equal yes/no answers and few unsure
    const yesRatio = answers.yes / potentialMatches.length;
    const noRatio = answers.no / potentialMatches.length;
    const splitScore = -(Math.pow(yesRatio - 0.5, 2) + Math.pow(noRatio - 0.5, 2));
    
    if (splitScore > bestSplitScore) {
      bestSplitScore = splitScore;
      bestQuestion = question;
    }
  }
  
  return bestQuestion || availableQuestions[0];
}

module.exports = {
  selectNextQuestion
};