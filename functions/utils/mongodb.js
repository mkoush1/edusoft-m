// MongoDB connection utility for Cloudflare Pages
// Note: Cloudflare Pages Functions doesn't support direct MongoDB driver
// This is a mock implementation that can be replaced with Cloudflare D1 or other compatible database

// Mock data store for testing
const mockData = {
  users: [],
  assessments: [],
  results: []
};

/**
 * Connect to MongoDB or return mock implementation
 * @param {Object} env - Environment variables
 * @returns {Object} - MongoDB-like connection object
 */
export async function connectToMongoDB(env) {
  console.log('Using mock MongoDB implementation for Cloudflare Pages');
  
  // Check if MongoDB URI is configured
  const hasMongoDB = !!(env && env.MONGODB_URI);
  
  if (hasMongoDB) {
    console.log('MongoDB URI is configured, but direct MongoDB connection is not supported in Cloudflare Pages');
    console.log('Using mock implementation instead');
  }
  
  // Return a mock MongoDB client implementation
  return {
    db: (dbName) => ({
      collection: (collectionName) => ({
        // Mock find operation
        find: (query = {}) => ({
          toArray: async () => {
            console.log(`Mock find in ${dbName}.${collectionName}`, query);
            return mockData[collectionName] || [];
          }
        }),
        
        // Mock findOne operation
        findOne: async (query = {}) => {
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
        },
        
        // Mock deleteOne operation
        deleteOne: async (filter) => {
          console.log(`Mock deleteOne in ${dbName}.${collectionName}`, filter);
          if (!mockData[collectionName]) {
            return { deletedCount: 0 };
          }
          
          const initialLength = mockData[collectionName].length;
          mockData[collectionName] = mockData[collectionName].filter(item => {
            // Simple filter matching
            for (const key in filter) {
              if (item[key] !== filter[key]) {
                return true;
              }
            }
            return false;
          });
          
          return { deletedCount: initialLength - mockData[collectionName].length };
        }
      })
    }),
    close: async () => console.log('Mock MongoDB connection closed')
  };
} 