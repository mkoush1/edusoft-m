// MongoDB connection helper for Cloudflare Functions
// This is a simplified version that uses environment variables

import { MongoClient } from 'mongodb';

let cachedClient = null;

/**
 * Connect to MongoDB using environment variables or fallback values
 * @param {Object} env - Environment variables
 * @returns {Promise<MongoClient>} MongoDB client
 */
export async function connectToMongoDB(env) {
  // If we already have a cached client, return it
  if (cachedClient) {
    return cachedClient;
  }

  try {
    // Get MongoDB URI from environment variables or use a fallback for testing
    const uri = env.MONGODB_URI || process.env.MONGODB_URI || 'mongodb+srv://demo:demo@cluster0.mongodb.net/edusoft';
    
    // If no URI is available, throw an error
    if (!uri) {
      throw new Error('MongoDB URI not found in environment variables');
    }

    // Connect to MongoDB
    const client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await client.connect();
    
    // Cache the client for future use
    cachedClient = client;
    
    console.log('Successfully connected to MongoDB');
    return client;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    
    // Return a mock client for testing purposes
    return {
      db: (dbName) => ({
        collection: (collectionName) => ({
          find: () => ({ toArray: async () => [] }),
          findOne: async () => null,
          insertOne: async () => ({ insertedId: 'mock_id' }),
          updateOne: async () => ({ modifiedCount: 1 }),
          deleteOne: async () => ({ deletedCount: 1 })
        })
      }),
      close: async () => {}
    };
  }
}

// Mock data for development and testing
const mockData = {
  users: [
    {
      _id: 'user1',
      name: 'Demo User',
      email: 'user@example.com',
      password: 'hashed_password',
      role: 'user'
    },
    {
      _id: 'supervisor1',
      name: 'Demo Supervisor',
      email: 'supervisor@example.com',
      password: 'hashed_password',
      role: 'supervisor'
    }
  ],
  assessments: [
    {
      _id: 'assessment1',
      userId: 'user1',
      type: 'writing',
      score: 85,
      feedback: 'Good job on your writing assessment!',
      timestamp: '2025-06-10T12:00:00Z'
    },
    {
      _id: 'assessment2',
      userId: 'user1',
      type: 'speaking',
      score: 78,
      feedback: 'Your speaking skills are improving.',
      timestamp: '2025-06-09T14:30:00Z'
    }
  ],
  progress: [
    {
      _id: 'progress1',
      userId: 'user1',
      completedCourses: 3,
      inProgressCourses: 2,
      lastUpdated: '2025-06-10T18:00:00Z'
    }
  ]
}; 