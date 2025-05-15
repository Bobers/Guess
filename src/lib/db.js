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