// MongoDB connection helper for Cloudflare Functions
// This is a simplified version that uses environment variables

/**
 * Connect to MongoDB Atlas from Cloudflare Functions
 * 
 * This function would normally use the MongoDB Atlas Data API
 * Since we can't directly use the MongoDB driver in Cloudflare Functions
 * 
 * @param {Object} env - Environment variables from Cloudflare
 * @returns {Object} - MongoDB connection object
 */
export async function connectToMongoDB(env) {
  // In a real implementation, you would use the MongoDB Atlas Data API
  // or a compatible serverless database solution
  
  // For now, we'll return a mock implementation
  return {
    db: (dbName) => ({
      collection: (collectionName) => ({
        // Mock find operation
        find: (query) => ({
          toArray: async () => {
            console.log(`Mock find in ${dbName}.${collectionName}`, query);
            return mockData[collectionName] || [];
          }
        }),
        
        // Mock findOne operation
        findOne: async (query) => {
          console.log(`Mock findOne in ${dbName}.${collectionName}`, query);
          const items = mockData[collectionName] || [];
          return items.find(item => {
            // Simple query matching
            for (const key in query) {
              if (item[key] !== query[key]) {
                return false;
              }
            }
            return true;
          });
        },
        
        // Mock insertOne operation
        insertOne: async (doc) => {
          console.log(`Mock insertOne in ${dbName}.${collectionName}`, doc);
          if (!mockData[collectionName]) {
            mockData[collectionName] = [];
          }
          const _id = `mock_id_${Date.now()}`;
          const newDoc = { ...doc, _id };
          mockData[collectionName].push(newDoc);
          return { insertedId: _id };
        },
        
        // Mock updateOne operation
        updateOne: async (filter, update) => {
          console.log(`Mock updateOne in ${dbName}.${collectionName}`, filter, update);
          if (!mockData[collectionName]) {
            return { matchedCount: 0, modifiedCount: 0 };
          }
          
          let matchedCount = 0;
          let modifiedCount = 0;
          
          mockData[collectionName] = mockData[collectionName].map(item => {
            // Simple filter matching
            let isMatch = true;
            for (const key in filter) {
              if (item[key] !== filter[key]) {
                isMatch = false;
                break;
              }
            }
            
            if (isMatch) {
              matchedCount++;
              // Apply updates
              if (update.$set) {
                modifiedCount++;
                return { ...item, ...update.$set };
              }
            }
            return item;
          });
          
          return { matchedCount, modifiedCount };
        }
      })
    })
  };
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