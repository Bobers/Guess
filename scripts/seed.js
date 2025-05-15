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