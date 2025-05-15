const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  console.log('Connecting to:', uri);
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB successfully');
    
    const db = client.db();
    const result = await db.command({ ping: 1 });
    console.log('Ping result:', result);
    
    const collections = await db.listCollections().toArray();
    console.log('Collections:');
    collections.forEach(col => console.log(` - ${col.name}`));
    
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

testConnection().catch(console.error);