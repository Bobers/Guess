# guessright - Discover Your Ideal Customer Profile

![guessright logo](https://via.placeholder.com/150x50?text=guessright)
*Note: Replace with actual logo before deployment*

## 📋 Project Overview

**guessright** is an interactive tool that helps businesses identify their Ideal Customer Profile (ICP) through a series of simple yes/no questions. Inspired by the Akinator concept, it progressively narrows down potential customer profiles to identify the most promising market segments for businesses to target.

**Core Value Proposition:** Help businesses focus their marketing efforts on the right audience by identifying their ideal customer profile through an engaging, interactive experience.

## 🎯 MVP Implementation Guide

This document outlines our implementation strategy - starting with a lean MVP that delivers core value quickly while laying the foundation for a more sophisticated system over time.

## 🏗️ Architecture

### System Components

1. **Question Engine**
   * Binary (yes/no/unsure) question selection
   * Progressive narrowing of potential profiles
   * Simple scoring for profile matching

2. **Learning System**
   * Feedback collection after each session
   * Answer tracking to improve profile/question relationships
   * Foundational data for future enhancements

3. **MongoDB Database**
   * Profile and question collections
   * Session tracking and history
   * Learning data storage

4. **Interactive UI**
   * Simple yes/no interface
   * Business-oriented presentation
   * Results dashboard with actionable insights

### Folder Structure

```
/guessright
├── data/                     # Initial seed data
│   ├── profiles.json         # ICP profiles
│   └── questions.json        # Questions
│
├── src/
│   ├── engine/
│   │   ├── quiz.js           # Question selection logic
│   │   ├── matcher.js        # Profile matching algorithm
│   │   └── learner.js        # Knowledge base updating
│   │
│   ├── lib/
│   │   └── mongodb.js        # Database client
│   │
│   ├── components/           # UI components
│   │   ├── Layout.jsx
│   │   ├── QuestionFlow.jsx
│   │   ├── Results.jsx
│   │   └── Feedback.jsx
│   │
│   ├── pages/
│   │   ├── index.js          # Landing page
│   │   ├── quiz/[sessionId].js # Quiz flow page
│   │   ├── results/[sessionId].js # Results page
│   │   └── api/              # API routes
│   │       ├── sessions.js
│   │       ├── questions.js
│   │       ├── answers.js
│   │       └── feedback.js
│   │
│   └── utils/                # Helper functions
│
├── scripts/
│   ├── setup-db.js           # Database schema and index setup
│   ├── seed.js               # Database seeding script
│   ├── generate-data.js      # Data generation helper
│   └── analyze-feedback.js   # Knowledge base optimization
│
├── public/                   # Static assets
│
├── package.json              # Project dependencies
├── next.config.js            # Next.js configuration
├── .env.example              # Environment variables template
└── README.md                 # Project documentation
```

### Key Scripts

* **setup-db.js:** Creates database collections with validation rules and indexes for optimal performance.
* **seed.js:** Populates the database with initial profile and question data.
* **generate-data.js:** Interactive CLI tool to help create initial profiles and questions through guided prompts.
* **analyze-feedback.js:** Scheduled background script that analyzes accumulated user feedback to:
  - Identify patterns in incorrect matches
  - Generate recommendations for new profiles based on feedback clusters
  - Calculate updated effectiveness scores for questions
  - Produce reports on system performance and learning progress

## 💾 Data Model

### MongoDB Collections

#### Profiles Collection

```javascript
{
  _id: "saas_startup_cto",  // Profile ID
  name: "SaaS Startup CTO",
  description: "Technical decision-maker at early-stage software companies",
  attributes: {
    company_size: "small",
    industry: "technology",
    technical_background: true,
    budget_constrained: true,
    growth_stage: "early"
  },
  marketing_recommendations: [
    "Focus on technical specifications and API documentation",
    "Emphasize cost-efficiency and scalability",
    "Use developer-centric language and avoid marketing jargon",
    "Highlight quick implementation and time-to-value"
  ],
  // MVP: Direct answers expected from this profile
  answers: {
    "q_budget_constrained": "yes",
    "q_technical_background": "yes",
    "q_large_company": "no",
    "q_decision_maker": "yes",
    "q_technology_industry": "yes",
    "q_growth_stage": "yes"
    // Can include "unsure" for questions where the profile doesn't have a clear preference
  },
  // Learning data - builds over time from user feedback
  learning: {
    "q_budget_constrained": {
      "yes": 15,
      "no": 2,
      "unsure": 1,
      "total": 18
    }
  },
  frequency: 120,  // Number of times this profile has been matched
  created_at: ISODate("2025-05-05T12:00:00Z"),
  updated_at: ISODate("2025-05-05T12:00:00Z")
}
```

#### Questions Collection

```javascript
{
  _id: "q_budget_constrained",  // Question ID
  text: "Is your customer budget-conscious or price-sensitive?",
  order: 3,  // Lower numbers asked earlier in MVP
  asked_count: 253,  // Tracking statistics
  created_at: ISODate("2025-05-05T12:00:00Z"),
  updated_at: ISODate("2025-05-05T12:00:00Z")
}
```

#### Sessions Collection

```javascript
{
  _id: ObjectId("60d2f9d25b0a0f1c3a4e1b2c"),
  status: "active",  // active, completed
  result: "saas_startup_cto",  // Profile ID of the result (if completed)
  confidence: 0.85,  // Confidence score (if completed)
  answers: [
    {
      question_id: "q_budget_constrained",
      answer: "yes",
      sequence_num: 1,
      timestamp: ISODate("2025-05-05T12:10:00Z")
    },
    {
      question_id: "q_tech_decision_maker",
      answer: "yes",
      sequence_num: 2,
      timestamp: ISODate("2025-05-05T12:11:00Z")
    }
  ],
  feedback: {
    is_correct: true,
    suggested_profile: null,  // Only filled if is_correct is false
    comments: "Spot on!",
    timestamp: ISODate("2025-05-05T12:15:00Z")
  },
  created_at: ISODate("2025-05-05T12:09:00Z"),
  completed_at: ISODate("2025-05-05T12:15:00Z")
}
```

## 🧠 Core Algorithms (MVP)

### Profile Matching Algorithm

```javascript
// src/engine/matcher.js

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
```

### Question Selection Algorithm

```javascript
// src/engine/quiz.js

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
```

### Learning System

```javascript
// src/engine/learner.js

/**
 * Update profile learning data based on session feedback
 * @param {string} profileId - ID of the matched profile
 * @param {Object} sessionAnswers - User's answers from the session
 * @param {boolean} isCorrect - Whether the match was correct (from feedback)
 */
async function updateProfileLearning(profileId, sessionAnswers, isCorrect) {
  if (!isCorrect) return; // Only learn from correct matches
  
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
```

## 📡 API Routes

The application includes the following API endpoints, implemented in the corresponding files under `src/pages/api/`:

* **/api/sessions** - Create and manage quiz sessions
* **/api/questions/next** - Get the next question based on current answers
* **/api/answers** - Submit answers to questions
* **/api/complete** - Complete a session and get results
* **/api/feedback** - Submit feedback on results

```javascript
// src/pages/api/sessions.js
import { createSession, getSession } from '../../lib/db';
import { getProfileById } from '../../lib/db';

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

// src/pages/api/questions/next.js
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

// src/pages/api/answers.js
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

// src/pages/api/complete.js
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
    await completeSession(sessionId, result.profile._id, result.confidence);
    
    // Increment profile frequency
    await incrementProfileFrequency(result.profile._id);
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error completing session:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// src/pages/api/feedback.js
import { addFeedbackToSession } from '../../lib/db';
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
```

## 🔄 MongoDB Database Connection and Setup

### Database Connection and Helper Functions

```javascript
// src/lib/mongodb.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/guessright';
const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to preserve connections
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, create a new client for each connection
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

// src/lib/db.js
import clientPromise from './mongodb';
import { ObjectId } from 'mongodb';

// Get database instance
export async function getDb() {
  const client = await clientPromise;
  return client.db();
}

// PROFILES

// Get all profiles
export async function getAllProfiles() {
  const db = await getDb();
  return db.collection('profiles').find({}).toArray();
}

// Get profile by ID
export async function getProfileById(profileId) {
  const db = await getDb();
  return db.collection('profiles').findOne({ _id: profileId });
}

// Increment profile match frequency
export async function incrementProfileFrequency(profileId) {
  const db = await getDb();
  return db.collection('profiles').updateOne(
    { _id: profileId },
    { $inc: { frequency: 1 }, $set: { updated_at: new Date() } }
  );
}

// QUESTIONS

// Get all questions
export async function getAllQuestions() {
  const db = await getDb();
  return db.collection('questions').find({}).sort({ order: 1 }).toArray();
}

// Get question by ID
export async function getQuestionById(questionId) {
  const db = await getDb();
  return db.collection('questions').findOne({ _id: questionId });
}

// Update question asked count
export async function updateQuestionAskedCount(questionId) {
  const db = await getDb();
  return db.collection('questions').updateOne(
    { _id: questionId },
    { $inc: { asked_count: 1 }, $set: { updated_at: new Date() } }
  );
}

// SESSIONS

// Create new session
export async function createSession() {
  const db = await getDb();
  const result = await db.collection('sessions').insertOne({
    status: 'active',
    answers: [],
    created_at: new Date()
  });
  
  return result.insertedId;
}

// Add answer to session
export async function addAnswerToSession(sessionId, questionId, answer, sequenceNum) {
  const db = await getDb();
  return db.collection('sessions').updateOne(
    { _id: new ObjectId(sessionId) },
    { 
      $push: { 
        answers: {
          question_id: questionId,
          answer,
          sequence_num: sequenceNum,
          timestamp: new Date()
        }
      }
    }
  );
}

// Complete session
export async function completeSession(sessionId, resultProfile, confidence) {
  const db = await getDb();
  return db.collection('sessions').updateOne(
    { _id: new ObjectId(sessionId) },
    {
      $set: {
        status: 'completed',
        result: resultProfile,
        confidence,
        completed_at: new Date()
      }
    }
  );
}

// Add feedback to session
export async function addFeedbackToSession(sessionId, isCorrect, suggestedProfile, comments) {
  const db = await getDb();
  return db.collection('sessions').updateOne(
    { _id: new ObjectId(sessionId) },
    {
      $set: {
        feedback: {
          is_correct: isCorrect,
          suggested_profile: suggestedProfile,
          comments,
          timestamp: new Date()
        }
      }
    }
  );
}

// Get session with answers
export async function getSession(sessionId) {
  const db = await getDb();
  return db.collection('sessions').findOne({ _id: new ObjectId(sessionId) });
}
```

### Database Setup and Schema

```javascript
// scripts/setup-db.js
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function setupDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/guessright';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Create profiles collection with validation
    await db.createCollection('profiles', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['_id', 'name', 'description', 'attributes', 'marketing_recommendations', 'answers'],
          properties: {
            _id: { bsonType: 'string' },
            name: { bsonType: 'string' },
            description: { bsonType: 'string' },
            attributes: { bsonType: 'object' },
            marketing_recommendations: { bsonType: 'array' },
            answers: { bsonType: 'object' },
            learning: { bsonType: 'object' },
            frequency: { bsonType: 'int', minimum: 0 },
            created_at: { bsonType: 'date' },
            updated_at: { bsonType: 'date' }
          }
        }
      }
    });
    console.log('Created profiles collection');
    
    // Create questions collection with validation
    await db.createCollection('questions', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['_id', 'text'],
          properties: {
            _id: { bsonType: 'string' },
            text: { bsonType: 'string' },
            order: { bsonType: 'int', minimum: 0 },
            asked_count: { bsonType: 'int', minimum: 0 },
            created_at: { bsonType: 'date' },
            updated_at: { bsonType: 'date' }
          }
        }
      }
    });
    console.log('Created questions collection');
    
    // Create sessions collection with validation
    await db.createCollection('sessions', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['status', 'answers', 'created_at'],
          properties: {
            status: { 
              bsonType: 'string',
              enum: ['active', 'completed']
            },
            result: { bsonType: 'string' },
            confidence: { 
              bsonType: 'double',
              minimum: 0,
              maximum: 1
            },
            answers: { 
              bsonType: 'array',
              items: {
                bsonType: 'object',
                required: ['question_id', 'answer', 'sequence_num'],
                properties: {
                  question_id: { bsonType: 'string' },
                  answer: { 
                    bsonType: 'string',
                    enum: ['yes', 'no', 'unsure']
                  },
                  sequence_num: { bsonType: 'int', minimum: 0 },
                  timestamp: { bsonType: 'date' }
                }
              }
            },
            feedback: {
              bsonType: 'object',
              properties: {
                is_correct: { bsonType: 'bool' },
                suggested_profile: { bsonType: 'string' },
                comments: { bsonType: 'string' },
                timestamp: { bsonType: 'date' }
              }
            },
            created_at: { bsonType: 'date' },
            completed_at: { bsonType: 'date' }
          }
        }
      }
    });
    console.log('Created sessions collection');
    
    // Create indexes
    await createIndexes(db);
    
    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

async function createIndexes(db) {
  // Profiles collection indexes
  await db.collection('profiles').createIndex({ "frequency": 1 });
  console.log('Created index on profiles.frequency');
  
  // Questions collection indexes
  await db.collection('questions').createIndex({ "order": 1 });
  await db.collection('questions').createIndex({ "asked_count": 1 });
  console.log('Created indexes on questions collection');
  
  // Sessions collection indexes
  await db.collection('sessions').createIndex({ "created_at": 1 });
  await db.collection('sessions').createIndex({ "status": 1 });
  await db.collection('sessions').createIndex({ "result": 1 });
  console.log('Created indexes on sessions collection');
}

// Run the setup function
setupDatabase().catch(console.error);
```

### Database Seeding

```javascript
// scripts/seed.js
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function seedDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/guessright';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Read data files
    let profiles = [], questions = [];
    
    const profilesPath = path.join(process.cwd(), 'data', 'profiles.json');
    const questionsPath = path.join(process.cwd(), 'data', 'questions.json');
    
    if (fs.existsSync(profilesPath)) {
      profiles = JSON.parse(fs.readFileSync(profilesPath, 'utf8'));
      console.log(`Found ${profiles.length} profiles in profiles.json`);
    } else {
      console.warn('profiles.json not found. No profiles will be seeded.');
    }
    
    if (fs.existsSync(questionsPath)) {
      questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
      console.log(`Found ${questions.length} questions in questions.json`);
    } else {
      console.warn('questions.json not found. No questions will be seeded.');
    }
    
    // Clear existing data (optional - comment out to preserve existing data)
    if (questions.length > 0) {
      await db.collection('questions').deleteMany({});
      console.log('Cleared existing questions');
    }
    
    if (profiles.length > 0) {
      await db.collection('profiles').deleteMany({});
      console.log('Cleared existing profiles');
    }
    
    // Insert questions
    if (questions.length > 0) {
      // Add timestamps and initialize counts
      const enhancedQuestions = questions.map(question => ({
        ...question,
        asked_count: 0,
        created_at: new Date(),
        updated_at: new Date()
      }));
      
      const result = await db.collection('questions').insertMany(enhancedQuestions);
      console.log(`Inserted ${result.insertedCount} questions`);
    }
    
    // Insert profiles
    if (profiles.length > 0) {
      // Add timestamps and initialize learning and frequency
      const enhancedProfiles = profiles.map(profile => ({
        ...profile,
        learning: {},
        frequency: 0,
        created_at: new Date(),
        updated_at: new Date()
      }));
      
      const result = await db.collection('profiles').insertMany(enhancedProfiles);
      console.log(`Inserted ${result.insertedCount} profiles`);
    }
    
    console.log('Seeding completed successfully');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
seedDatabase().catch(console.error);
```

## 🚀 Setup & Installation

### Prerequisites

* Node.js v18+
* MongoDB (local or Atlas cluster)
* npm or yarn
* Docker and Docker Compose (for containerized deployment)

### Option 1: Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/guessright.git
   cd guessright
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```
   MONGODB_URI=mongodb://localhost:27017/guessright
   # or your MongoDB Atlas connection string
   ```

4. **Set up the database schema**
   ```bash
   npm run setup-db
   # or
   yarn setup-db
   ```

5. **Generate initial data**
   ```bash
   npm run generate-data
   # or
   yarn generate-data
   ```
   This interactive script will help you create the initial set of profiles and questions.

6. **Seed the database**
   ```bash
   npm run seed
   # or
   yarn seed
   ```

7. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

8. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option 2: Docker Containerization

Using Docker provides a consistent environment across development and production.

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/guessright.git
   cd guessright
   ```

2. **Create or update next.config.js**
   Ensure your `next.config.js` file includes the standalone output option:
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     reactStrictMode: true,
     output: 'standalone', // Essential for Docker optimization
   }

   module.exports = nextConfig
   ```

3. **Create Docker files**

   **Dockerfile:**
   ```dockerfile
   # Base Node image
   FROM node:18-alpine AS base

   # Install dependencies only when needed
   FROM base AS deps
   WORKDIR /app

   # Copy package files
   COPY package.json package-lock.json ./

   # Install dependencies
   RUN npm ci

   # Rebuild the source code only when needed
   FROM base AS builder
   WORKDIR /app

   # Copy dependencies
   COPY --from=deps /app/node_modules ./node_modules

   # Copy all project files
   COPY . .

   # Build the Next.js application
   RUN npm run build

   # Production image
   FROM base AS runner
   WORKDIR /app

   # Set environment variables
   ENV NODE_ENV production

   # Copy necessary files from builder
   COPY --from=builder /app/public ./public
   COPY --from=builder /app/package.json ./package.json
   COPY --from=builder /app/.next/standalone ./
   COPY --from=builder /app/.next/static ./.next/static
   # Note: scripts and data directories are not needed in the production image
   # They are used only during database setup via docker-compose exec commands

   # Expose the listening port
   EXPOSE 3000

   # Create a non-root user and switch to it
   RUN addgroup --system --gid 1001 nodejs \
       && adduser --system --uid 1001 nextjs \
       && chown -R nextjs:nodejs /app

   USER nextjs

   # Run the application
   CMD ["node", "server.js"]
   ```

   **docker-compose.yml:**
   ```yaml
   version: '3.8'

   services:
     mongodb:
       image: mongo:5.0
       container_name: guessright-mongodb
       restart: always
       environment:
         - MONGO_INITDB_DATABASE=guessright
       ports:
         - 27017:27017
       volumes:
         - mongodb-data:/data/db
       networks:
         - guessright-network

     app:
       build:
         context: .
         dockerfile: Dockerfile
       container_name: guessright-app
       restart: always
       depends_on:
         - mongodb
       environment:
         - NODE_ENV=production
         - MONGODB_URI=mongodb://mongodb:27017/guessright
       ports:
         - 3000:3000
       healthcheck:
         test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/health"]
         interval: 30s
         timeout: 10s
         retries: 3
         start_period: 20s
       networks:
         - guessright-network

   networks:
     guessright-network:
       driver: bridge

   volumes:
     mongodb-data:
   ```

   **Create a .dockerignore file:**
   ```
   node_modules
   .next
   .git
   .env*
   .vscode
   *.md
   .gitignore
   reports
   ```

4. **Create Health Check API Route**
   Create file at `src/pages/api/health.js`:
   ```javascript
   // src/pages/api/health.js
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
   ```

5. **Build and start with Docker Compose**
   ```bash
   docker-compose up -d --build
   ```

6. **Set up database and seed data**
   ```bash
   # Wait for MongoDB to initialize, then set up the database
   docker-compose exec app node scripts/setup-db.js
   
   # Generate initial data (interactive)
   docker-compose exec -it app node scripts/generate-data.js
   
   # Seed the database
   docker-compose exec app node scripts/seed.js
   ```

7. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker Management Commands

```bash
# View logs
docker-compose logs -f

# Stop the application
docker-compose down

# Restart with updated code
docker-compose up -d --build

# Backup MongoDB data
docker-compose exec mongodb mongodump --out /data/db/backup

# Restore MongoDB data
docker-compose exec mongodb mongorestore /data/db/backup
```

### Development with Docker

For local development with Docker, create a `docker-compose.dev.yml` file:

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    environment:
      - NODE_ENV=development
    command: npm run dev

  mongodb:
    # Same as in main docker-compose.yml
```

Create a simplified `Dockerfile.dev` for development:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

Run the development environment:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

This setup mounts your local code into the container and enables hot reloading during development.

## 📦 Initial Knowledge Base Requirements

For the MVP, you'll need a minimal but effective initial dataset:

1. **5-7 Distinct Profiles**
   * Make them meaningfully different from each other
   * Cover a range of industries and company sizes
   * Include different decision-maker roles

2. **10-12 Binary Questions**
   * Questions should effectively separate your initial profiles
   * Start with broad questions (company size, industry)
   * Include role-specific and need-specific questions

3. **Answer Mappings**
   * For each profile, define expected yes/no/unsure answers to each question
   * It's okay to use "unsure" when a profile could go either way

The interactive data generator script will walk you through creating this initial dataset.

## 📚 Example Initial Profiles

Here are 5 example profiles to use as a starting point:

```javascript
// Example profile 1
{
  "_id": "technical_startup_founder",
  "name": "Technical Startup Founder",
  "description": "Technical co-founder or CTO at an early-stage startup with limited resources",
  "attributes": {
    "company_size": "small",
    "industry": "technology",
    "technical_background": true
  },
  "marketing_recommendations": [
    "Focus on ROI and cost-efficiency",
    "Highlight technical specifications and integration capabilities",
    "Emphasize quick implementation with minimal resources",
    "Showcase how your solution scales with their growth"
  ],
  "answers": {
    "q_budget_constrained": "yes",
    "q_technical_background": "yes",
    "q_large_company": "no",
    "q_decision_maker": "yes",
    "q_technology_industry": "yes",
    "q_growth_stage": "yes",
    "q_marketing_role": "no",
    "q_need_compliance": "no",
    "q_small_team": "yes",
    "q_data_driven": "yes"
  }
}

// Example profile 2
{
  "_id": "enterprise_it_director",
  "name": "Enterprise IT Director",
  "description": "IT decision-maker at a large established corporation with formal purchasing processes",
  "attributes": {
    "company_size": "large",
    "industry": "varied",
    "technical_background": true
  },
  "marketing_recommendations": [
    "Emphasize enterprise-grade security and compliance",
    "Focus on integration with existing systems",
    "Provide case studies from similar large organizations",
    "Address procurement process and multi-stakeholder decision making"
  ],
  "answers": {
    "q_budget_constrained": "no",
    "q_technical_background": "yes",
    "q_large_company": "yes",
    "q_decision_maker": "yes",
    "q_technology_industry": "no",
    "q_growth_stage": "no",
    "q_marketing_role": "no",
    "q_need_compliance": "yes",
    "q_small_team": "no",
    "q_data_driven": "yes"
  }
}

// Example profile 3
{
  "_id": "smb_owner",
  "name": "Small Business Owner",
  "description": "Owner-operator of a traditional small business focused on steady operations",
  "attributes": {
    "company_size": "small",
    "industry": "varied",
    "technical_background": false
  },
  "marketing_recommendations": [
    "Focus on simplicity and ease of use",
    "Emphasize low maintenance and support availability",
    "Show clear ROI with minimal technical jargon",
    "Highlight success stories from similar small businesses"
  ],
  "answers": {
    "q_budget_constrained": "yes",
    "q_technical_background": "no",
    "q_large_company": "no",
    "q_decision_maker": "yes",
    "q_technology_industry": "no",
    "q_growth_stage": "no",
    "q_marketing_role": "no",
    "q_need_compliance": "no",
    "q_small_team": "yes",
    "q_data_driven": "no"
  }
}

// Example profile 4
{
  "_id": "marketing_director",
  "name": "Marketing Director",
  "description": "Senior marketing leader focused on growth and customer acquisition",
  "attributes": {
    "company_size": "medium",
    "industry": "varied",
    "technical_background": false
  },
  "marketing_recommendations": [
    "Focus on ROI and customer acquisition metrics",
    "Emphasize ease of integration with marketing tech stack",
    "Provide marketing-specific case studies and benchmarks",
    "Highlight reporting features and data visualization"
  ],
  "answers": {
    "q_budget_constrained": "yes",
    "q_technical_background": "no",
    "q_large_company": "no",
    "q_decision_maker": "yes",
    "q_technology_industry": "no",
    "q_growth_stage": "yes",
    "q_marketing_role": "yes",
    "q_need_compliance": "no",
    "q_small_team": "no",
    "q_data_driven": "yes"
  }
}

// Example profile 5
{
  "_id": "healthcare_administrator",
  "name": "Healthcare Administrator",
  "description": "Administrative decision-maker in a healthcare organization with strict compliance requirements",
  "attributes": {
    "company_size": "medium",
    "industry": "healthcare",
    "technical_background": false
  },
  "marketing_recommendations": [
    "Emphasize HIPAA compliance and data security",
    "Focus on patient outcomes and care improvement",
    "Highlight ease of use for non-technical staff",
    "Provide healthcare-specific implementation roadmaps"
  ],
  "answers": {
    "q_budget_constrained": "yes",
    "q_technical_background": "no",
    "q_large_company": "yes",
    "q_decision_maker": "yes",
    "q_technology_industry": "no",
    "q_growth_stage": "no",
    "q_marketing_role": "no",
    "q_need_compliance": "yes",
    "q_small_team": "no",
    "q_data_driven": "yes"
  }
}
```

## 🔧 Data Generation Script

The data generation script (`scripts/generate-data.js`) helps you create the initial dataset through interactive prompts:

```javascript
// scripts/generate-data.js
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Define default questions
const defaultQuestions = [
  { _id: "q_budget_constrained", text: "Is your customer budget-conscious or price-sensitive?", order: 3 },
  { _id: "q_technical_background", text: "Does your customer have a strong technical background?", order: 4 },
  { _id: "q_large_company", text: "Does your customer work at a large company (500+ employees)?", order: 1 },
  { _id: "q_decision_maker", text: "Is your customer the primary decision-maker for purchases?", order: 2 },
  { _id: "q_technology_industry", text: "Does your customer work in the technology industry?", order: 5 },
  { _id: "q_growth_stage", text: "Is your customer at a company focused on rapid growth?", order: 6 },
  { _id: "q_marketing_role", text: "Is your customer primarily focused on marketing functions?", order: 7 },
  { _id: "q_need_compliance", text: "Does your customer work in a heavily regulated industry?", order: 8 },
  { _id: "q_small_team", text: "Does your customer work with a small team (fewer than 10 people)?", order: 9 },
  { _id: "q_data_driven", text: "Is your customer particularly focused on data-driven decision making?", order: 10 }
];

const profiles = [];
let questions = [...defaultQuestions];

async function createProfile() {
  const profile = {
    answers: {}
  };
  
  console.log('\n=== Creating New Profile ===\n');
  
  // Get basic profile information
  profile._id = await ask('Enter profile ID (e.g., saas_startup_cto): ');
  profile.name = await ask('Enter profile name: ');
  profile.description = await ask('Enter profile description: ');
  
  // Get attributes
  profile.attributes = {};
  profile.attributes.company_size = await ask('Company size (small/medium/large): ');
  profile.attributes.industry = await ask('Industry: ');
  profile.attributes.technical_background = (await ask('Technical background (yes/no): ')) === 'yes';
  
  const additionalAttr = await ask('Add another attribute? (yes/no): ');
  if (additionalAttr === 'yes') {
    const attrName = await ask('Attribute name: ');
    const attrValue = await ask('Attribute value: ');
    profile.attributes[attrName] = attrValue;
  }
  
  // Get recommendations
  profile.marketing_recommendations = [];
  let moreTips = true;
  console.log('\nEnter marketing recommendations (one per line):');
  while (moreTips) {
    const tip = await ask('Enter a marketing tip (or "done" to finish): ');
    if (tip.toLowerCase() === 'done') {
      moreTips = false;
    } else {
      profile.marketing_recommendations.push(tip);
    }
  }
  
  // Get answers to questions
  console.log('\nFor each question, enter the expected answer for this profile:');
  for (const question of questions) {
    console.log(`\nQuestion: ${question.text}`);
    const answer = await ask('Answer (yes/no/unsure): ');
    if (['yes', 'no', 'unsure'].includes(answer.toLowerCase())) {
      profile.answers[question._id] = answer.toLowerCase();
    } else {
      console.log('Invalid answer. Defaulting to "unsure".');
      profile.answers[question._id] = 'unsure';
    }
  }
  
  profiles.push(profile);
  
  const another = await ask('\nCreate another profile? (yes/no): ');
  if (another.toLowerCase() === 'yes') {
    await createProfile();
  }
}

async function createQuestion() {
  console.log('\n=== Creating New Question ===\n');
  
  const question = {};
  
  question._id = await ask('Enter question ID (e.g., q_new_question): ');
  question.text = await ask('Enter question text: ');
  
  const orderStr = await ask('Enter question order (lower numbers asked earlier): ');
  question.order = parseInt(orderStr) || questions.length + 1;
  
  questions.push(question);
  
  // For each profile, get the expected answer to this question
  console.log('\nFor each profile, what is the expected answer to this question?');
  for (const profile of profiles) {
    console.log(`\nProfile: ${profile.name}`);
    const answer = await ask('Answer (yes/no/unsure): ');
    if (['yes', 'no', 'unsure'].includes(answer.toLowerCase())) {
      profile.answers[question._id] = answer.toLowerCase();
    } else {
      console.log('Invalid answer. Defaulting to "unsure".');
      profile.answers[question._id] = 'unsure';
    }
  }
  
  const another = await ask('\nCreate another question? (yes/no): ');
  if (another.toLowerCase() === 'yes') {
    await createQuestion();
  }
}

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function checkOutputDir() {
  const dataDir = path.join(process.cwd(), 'data');
  
  if (!fs.existsSync(dataDir)) {
    console.log('Creating data directory...');
    fs.mkdirSync(dataDir);
  }
}

async function run() {
  console.log('Welcome to the guessright MVP Data Generator\n');
  console.log('This script will help you create the initial profiles and questions for your guessright MVP.');
  
  // Check if data directory exists
  await checkOutputDir();
  
  console.log('\nDefault questions have been loaded.');
  const customQuestions = await ask('Do you want to add custom questions? (yes/no): ');
  
  if (customQuestions.toLowerCase() === 'yes') {
    await createQuestion();
  }
  
  await createProfile();
  
  // Save questions
  fs.writeFileSync(
    path.join(process.cwd(), 'data', 'questions.json'), 
    JSON.stringify(questions, null, 2)
  );
  console.log('\nQuestions saved to data/questions.json');
  
  // Save profiles
  fs.writeFileSync(
    path.join(process.cwd(), 'data', 'profiles.json'),
    JSON.stringify(profiles, null, 2)
  );
  console.log('Profiles saved to data/profiles.json');
  
  console.log('\nData generation complete! You can now run "npm run seed" to load this data into MongoDB.');
  
  rl.close();
}

run().catch(console.error);
```

## 📊 Feedback Analysis Script

The `analyze-feedback.js` script helps analyze user feedback and improve the system over time:

```javascript
// scripts/analyze-feedback.js
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
```

## 📈 Development Roadmap

Our approach follows a staged evolution:

### Phase 1: MVP (Current Focus)
* Simple profile matching based on direct yes/no/unsure expectations
* Basic question selection focused on profile differentiation
* Learning system that tracks answer frequencies

### Phase 2: Enhanced Learning
* Convert tracked answer frequencies to probability distributions
* Improve question selection to maximize information gain
* Add ability to suggest new profiles based on feedback patterns

### Phase 3: Full Akinator-Style System
* Implement full Bayesian probability updates
* Dynamic question selection based on information theory
* Sophisticated learning that adjusts relationships based on all feedback

## 📊 Usage Analytics

To improve the system over time, we track:

1. **Question Effectiveness**
   * How often each question is asked
   * How well questions separate profiles

2. **Profile Frequency**
   * How often each profile is matched
   * Confidence levels for matches

3. **Feedback Data**
   * Whether matches were correct
   * User comments for incorrect matches

This data helps refine both questions and profiles over time.

## 📦 Package.json Configuration

```json
{
  "name": "guessright",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "setup-db": "node scripts/setup-db.js",
    "generate-data": "node scripts/generate-data.js",
    "seed": "node scripts/seed.js",
    "analyze-feedback": "node scripts/analyze-feedback.js"
  },
  "dependencies": {
    "dotenv": "^16.0.3",
    "mongodb": "^5.0.0",
    "next": "^13.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "eslint": "^8.0.0",
    "eslint-config-next": "^13.0.0"
  }
}
```

## 🤝 Contributing

We welcome contributions to guessright! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📧 Contact

For questions or support, email: dev@guessright.ai
