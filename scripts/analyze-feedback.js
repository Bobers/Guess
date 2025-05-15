const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function analyzeFeedback() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/guessright';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('Analyzing feedback data...');
    
    // Get completed sessions with feedback
    const sessions = await db.collection('sessions').find({
      status: 'completed',
      feedback: { $exists: true }
    }).toArray();
    
    console.log(`Found ${sessions.length} sessions with feedback.`);
    
    // 1. Analyze question effectiveness
    await analyzeQuestionEffectiveness(db, sessions);
    
    // 2. Find patterns in incorrect matches
    await analyzeIncorrectMatches(db, sessions);
    
    // 3. Generate potential new profiles
    await generateProfileSuggestions(db, sessions);
    
    console.log('\nAnalysis complete!');
    
  } catch (error) {
    console.error('Error analyzing feedback:', error);
  } finally {
    await client.close();
  }
}

async function analyzeQuestionEffectiveness(db, sessions) {
  console.log('\n=== Question Effectiveness Analysis ===');
  
  const questions = await db.collection('questions').find({}).toArray();
  const questionStats = {};
  
  // Initialize stats for each question
  for (const question of questions) {
    questionStats[question._id] = {
      asked: 0,
      correct_matches: 0,
      incorrect_matches: 0,
      effectiveness: 0
    };
  }
  
  // Analyze each session
  for (const session of sessions) {
    const isCorrect = session.feedback?.is_correct === true;
    
    // Count each question asked in this session
    for (const answer of session.answers) {
      const questionId = answer.question_id;
      
      if (questionStats[questionId]) {
        questionStats[questionId].asked++;
        
        if (isCorrect) {
          questionStats[questionId].correct_matches++;
        } else {
          questionStats[questionId].incorrect_matches++;
        }
      }
    }
  }
  
  // Calculate effectiveness for each question
  for (const [questionId, stats] of Object.entries(questionStats)) {
    if (stats.asked > 0) {
      stats.effectiveness = stats.correct_matches / stats.asked;
    }
  }
  
  // Sort questions by effectiveness
  const sortedQuestions = Object.entries(questionStats)
    .sort((a, b) => b[1].effectiveness - a[1].effectiveness)
    .filter(([_, stats]) => stats.asked >= 5); // Only consider questions asked at least 5 times
  
  console.log('\nTop 5 Most Effective Questions:');
  for (let i = 0; i < Math.min(5, sortedQuestions.length); i++) {
    const [questionId, stats] = sortedQuestions[i];
    const question = questions.find(q => q._id === questionId);
    console.log(`${i+1}. "${question?.text}" - ${Math.round(stats.effectiveness * 100)}% effective (asked ${stats.asked} times)`);
  }
  
  console.log('\nLeast Effective Questions:');
  for (let i = Math.max(0, sortedQuestions.length - 5); i < sortedQuestions.length; i++) {
    const [questionId, stats] = sortedQuestions[i];
    const question = questions.find(q => q._id === questionId);
    console.log(`${sortedQuestions.length - i}. "${question?.text}" - ${Math.round(stats.effectiveness * 100)}% effective (asked ${stats.asked} times)`);
  }
  
  // Save analysis to a report file
  const report = {
    generated_at: new Date(),
    questions: Object.entries(questionStats).map(([id, stats]) => ({
      id,
      text: questions.find(q => q._id === id)?.text,
      ...stats
    }))
  };
  
  const reportDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir);
  }
  
  fs.writeFileSync(
    path.join(reportDir, 'question_effectiveness.json'),
    JSON.stringify(report, null, 2)
  );
}

async function analyzeIncorrectMatches(db, sessions) {
  console.log('\n=== Incorrect Match Analysis ===');
  
  // Get incorrect sessions
  const incorrectSessions = sessions.filter(s => s.feedback?.is_correct === false);
  
  console.log(`Found ${incorrectSessions.length} incorrect matches.`);
  
  if (incorrectSessions.length === 0) {
    return;
  }
  
  // Group by matched profile
  const profileMismatches = {};
  
  for (const session of incorrectSessions) {
    const profileId = session.result;
    
    if (!profileId) continue;
    
    if (!profileMismatches[profileId]) {
      profileMismatches[profileId] = [];
    }
    
    profileMismatches[profileId].push(session);
  }
  
  // Sort by frequency
  const sortedMismatches = Object.entries(profileMismatches)
    .sort((a, b) => b[1].length - a[1].length);
  
  console.log('\nProfiles with Most Incorrect Matches:');
  for (const [profileId, sessions] of sortedMismatches) {
    const profile = await db.collection('profiles').findOne({ _id: profileId });
    console.log(`- ${profile?.name || profileId}: ${sessions.length} incorrect matches`);
    
    // Analyze common patterns in these incorrect matches
    const answerPatterns = {};
    
    for (const session of sessions) {
      for (const answer of session.answers) {
        const key = `${answer.question_id}-${answer.answer}`;
        answerPatterns[key] = (answerPatterns[key] || 0) + 1;
      }
    }
    
    // Find the most common patterns
    const commonPatterns = Object.entries(answerPatterns)
      .sort((a, b) => b[1] - a[1])
      .filter(([_, count]) => count >= 3) // At least 3 occurrences
      .slice(0, 3); // Top 3 patterns
    
    if (commonPatterns.length > 0) {
      console.log('  Common answer patterns:');
      for (const [pattern, count] of commonPatterns) {
        const [questionId, answer] = pattern.split('-');
        const question = await db.collection('questions').findOne({ _id: questionId });
        console.log(`  - "${question?.text}": ${answer} (${count} times)`);
      }
    }
  }
}

async function generateProfileSuggestions(db, sessions) {
  console.log('\n=== Profile Suggestions Analysis ===');
  
  // Get incorrect sessions with suggested profiles
  const suggestedProfiles = sessions
    .filter(s => s.feedback?.is_correct === false && s.feedback?.suggested_profile)
    .map(s => s.feedback.suggested_profile.trim().toLowerCase());
  
  if (suggestedProfiles.length === 0) {
    console.log('No profile suggestions found.');
    return;
  }
  
  // Count suggestion frequencies
  const suggestionCounts = {};
  
  for (const suggestion of suggestedProfiles) {
    suggestionCounts[suggestion] = (suggestionCounts[suggestion] || 0) + 1;
  }
  
  // Sort by frequency
  const sortedSuggestions = Object.entries(suggestionCounts)
    .sort((a, b) => b[1] - a[1]);
  
  console.log('\nTop Profile Suggestions:');
  for (const [suggestion, count] of sortedSuggestions) {
    console.log(`- "${suggestion}": ${count} suggestions`);
    
    // If we have 5 or more suggestions for the same profile, recommend creating it
    if (count >= 5) {
      console.log(`  RECOMMENDATION: Consider creating a new "${suggestion}" profile.`);
    }
  }
}

// Run the analysis
analyzeFeedback().catch(console.error);