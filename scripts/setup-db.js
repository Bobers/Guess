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